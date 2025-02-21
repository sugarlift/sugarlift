import { getArtworkTable } from "./airtable";
import { supabaseAdmin } from "./supabase";
import {
  Artwork,
  AirtableAttachment,
  StoredAttachment,
  SyncError,
} from "./types";
import Logger from "./logger";
import { Record, FieldSet } from "airtable";

// Define the fields interface for Airtable records
export interface AirtableFields {
  Title: string;
  Artist: string;
  Medium: string;
  Year: string | number;
  "Width (e.)": string;
  "Height (e.)": string;
  Type: string;
  "Artwork images": AirtableAttachment[];
  "Last Modified": string;
  "ADD TO PRODUCTION": boolean;
}

// Create a more specific type for Airtable field values
type AirtableFieldValue =
  | string
  | number
  | boolean
  | readonly string[]
  | AirtableAttachment[]
  | undefined
  | null;

// Update AirtableFields to properly extend FieldSet
export interface AirtableFields {
  Title: string;
  Artist: string;
  Medium: string;
  Year: string | number;
  "Width (e.)": string;
  "Height (e.)": string;
  Type: string;
  "Artwork images": AirtableAttachment[];
  "Last Modified": string;
  "ADD TO PRODUCTION": boolean;
  [key: string]: AirtableFieldValue; // This satisfies FieldSet constraint
}

// Create a type that combines FieldSet and our fields
export type AirtableRecord = FieldSet & AirtableFields;

// Helper function to safely convert Airtable record to our type
function convertAirtableRecord(
  record: Record<FieldSet>,
): Record<AirtableRecord> {
  // Type assertion is safe because we validate the required fields
  const converted = record as unknown as Record<AirtableRecord>;

  // Validate required fields exist
  if (!converted.get("Title") && !converted.get("Artist")) {
    throw new Error(`Invalid record: missing required fields`);
  }

  return converted;
}

// Add this interface near other interfaces
interface RawAirtableAttachment {
  id: string;
  url: string;
  filename: string;
  type: string;
  width?: number;
  height?: number;
}

// Update the function to use the new interface
function convertAttachment(att: RawAirtableAttachment): AirtableAttachment {
  return {
    id: att.id,
    url: att.url,
    filename: att.filename,
    type: att.type,
    width: att.width || 0,
    height: att.height || 0,
  };
}

async function uploadArtworkImageToSupabase(
  attachment: AirtableAttachment,
  artwork: { title: string },
): Promise<StoredAttachment> {
  const folderName = artwork.title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9.-]/g, "-");
  const cleanFilename = attachment.filename
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .toLowerCase();
  const storagePath = `${folderName}/${cleanFilename}`;

  // Add retry logic for fetching
  const maxRetries = 3;
  const retryDelay = (attempt: number) =>
    Math.min(1000 * Math.pow(2, attempt), 30000);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      Logger.debug("Starting image upload attempt", {
        attempt: attempt + 1,
        filename: cleanFilename,
        url: attachment.url,
      });

      const response = await fetch(attachment.url, {
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();

      // Validate blob size
      if (blob.size === 0) {
        throw new Error("Empty image file");
      }

      const { error: uploadError } = await supabaseAdmin.storage
        .from("attachments_artwork")
        .upload(storagePath, blob, {
          contentType: attachment.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabaseAdmin.storage
        .from("attachments_artwork")
        .getPublicUrl(storagePath);

      Logger.info("Successfully uploaded image", {
        url: publicUrl,
        path: storagePath,
        attempt: attempt + 1,
      });

      return {
        url: publicUrl,
        width: attachment.width,
        height: attachment.height,
        filename: attachment.filename,
        type: attachment.type,
      };
    } catch (error) {
      lastError = error as Error;

      // Log the retry attempt
      Logger.warn("Image upload attempt failed, retrying...", {
        attempt: attempt + 1,
        maxRetries,
        filename: cleanFilename,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // If this isn't the last attempt, wait before retrying
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay(attempt)),
        );
        continue;
      }
    }
  }

  // If we get here, all retries failed
  Logger.error("Image upload failed after all retries", {
    filename: cleanFilename,
    artworkTitle: artwork.title,
    error: lastError,
  });

  // Return a partial record without the image
  return {
    url: null, // You'll need to update the StoredAttachment type to allow null
    width: attachment.width,
    height: attachment.height,
    filename: attachment.filename,
    type: attachment.type,
  };
}

interface SyncOptions {
  mode: "bulk" | "incremental";
  batchSize?: number;
  skipExistingCheck?: boolean;
  skipImages?: boolean;
  concurrency?: number;
  onProgress?: (progress: { current: number; total: number }) => void;
}

export function emitProgress(progress: {
  current: number;
  total: number;
  currentBatch: number;
  totalBatches: number;
}) {
  const writer = (global as { progressWriter?: WritableStreamDefaultWriter })
    .progressWriter;
  if (writer) {
    const encoder = new TextEncoder();
    writer.write(encoder.encode(`data: ${JSON.stringify(progress)}\n\n`));
  }
}

// Add this interface near the top with other interfaces
interface ExistingArtwork {
  id: string;
  updated_at: string;
  live_in_production: boolean;
}

export async function syncArtworkToSupabase(
  options: SyncOptions = { mode: "incremental" },
) {
  const {
    mode = "bulk",
    batchSize = 25,
    concurrency = 2,
    skipExistingCheck = false,
    skipImages = false,
  } = options;

  // Keep this as DEBUG
  Logger.debug("Starting artwork sync", {
    mode,
    batchSize,
    concurrency,
    processImages: !skipImages ? "yes" : "no",
  });

  try {
    // Get existing records with last update time
    let existingArtworks: ExistingArtwork[] = [];
    if (!skipExistingCheck) {
      const { data: existing } = await supabaseAdmin
        .from("artwork")
        .select("id, updated_at, live_in_production");
      existingArtworks = existing || [];
    }

    const existingArtworksMap = new Map(
      existingArtworks?.map((artwork) => [
        artwork.id,
        new Date(artwork.updated_at),
      ]) || [],
    );

    Logger.info("Existing artwork status", {
      totalRecords: existingArtworks?.length || 0,
      liveRecords:
        existingArtworks?.filter((a) => a.live_in_production).length || 0,
    });

    // Get all records that are marked for production from Airtable
    const table = getArtworkTable();
    const records = await table
      .select({
        pageSize: batchSize,
      })
      .all();

    // Filter records that need updating in incremental mode
    const recordsToProcess =
      mode === "incremental"
        ? records.filter((record) => {
            const lastModified = new Date(
              record.get("Last Modified") as string,
            );
            const existingLastUpdate = existingArtworksMap.get(record.id);
            return !existingLastUpdate || lastModified > existingLastUpdate;
          })
        : records;

    Logger.info(`Found ${recordsToProcess.length} artworks to update`, {
      mode,
      totalRecords: records.length,
      skipImages: !!skipImages,
    });

    // Add this near the start of the sync function
    Logger.info("Starting artwork sync with live status check", {
      mode,
      totalRecords: records.length,
      recordsWithFalseLiveStatus: records.filter(
        (r) => !r.get("ADD TO PRODUCTION"),
      ).length,
    });

    if (mode === "bulk") {
      console.log("Running in bulk mode - skipping timestamp checks");

      const total = records.length;
      const totalBatches = Math.ceil(total / batchSize);

      for (let i = 0; i < records.length; i += batchSize) {
        const currentBatch = Math.floor(i / batchSize) + 1;
        console.log(`Starting batch ${currentBatch} of ${totalBatches}`);

        emitProgress({
          current: i,
          total,
          currentBatch,
          totalBatches,
        });

        const batch = records.slice(i, i + batchSize);

        // Process in chunks based on concurrency
        for (let j = 0; j < batch.length; j += concurrency) {
          const concurrentBatch = batch.slice(j, j + concurrency);
          const batchPromises = concurrentBatch.map(async (record) => {
            try {
              const convertedRecord = convertAirtableRecord(record);
              const artwork = await processArtworkRecord(convertedRecord, {
                skipImages: !!skipImages,
              });
              emitProgress({
                current: i + j,
                total,
                currentBatch,
                totalBatches,
              });
              return { success: true, id: record.id, artwork };
            } catch (error) {
              return { success: false, id: record.id, error };
            }
          });

          await Promise.all(
            batchPromises.map((promise) =>
              promise.catch((error) => ({ success: false, error })),
            ),
          );
        }

        console.log(
          `Processed batch ${i / batchSize + 1}/${Math.ceil(
            records.length / batchSize,
          )}`,
        );
      }

      return {
        success: true,
        mode,
        processedCount: records.length,
        total: records.length,
        errors: null,
      };
    } else {
      // Update mode
      console.log("[SYNC] Running in update mode - checking for changes");

      // Process each record
      const errors: SyncError[] = [];
      let processedCount = 0;

      for (const record of records) {
        try {
          const convertedRecord = convertAirtableRecord(record);
          const recordId = convertedRecord.id;
          const lastModified = new Date(
            convertedRecord.get("Last Modified") as string,
          );

          // Skip if record exists and hasn't been modified since last sync
          const existingLastUpdate = existingArtworksMap.get(recordId);
          if (existingLastUpdate && lastModified <= existingLastUpdate) {
            console.log(`[SYNC] Skipping unchanged artwork: ${recordId}`);
            continue;
          }

          console.log(`[SYNC] Processing artwork: ${recordId}`);
          const artwork = await processArtworkRecord(convertedRecord, {
            skipImages: !!skipImages,
          });

          // Actually perform the upsert - this was missing!
          const { error: upsertError } = await supabaseAdmin
            .from("artwork")
            .upsert(artwork, {
              onConflict: "id",
              ignoreDuplicates: false,
            });

          if (upsertError) {
            throw upsertError;
          }

          processedCount++;
          options.onProgress?.({
            current: processedCount,
            total: recordsToProcess.length,
          });
        } catch (error) {
          console.error(`[SYNC] Error processing artwork ${record.id}:`, error);
          errors.push({
            record_id: record.id,
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
          });
        }
      }

      const result = {
        success: true,
        mode,
        processedCount: processedCount, // Use actual processed count
        total: records.length,
        errors: errors.length > 0 ? errors : null,
      };

      console.log("[SYNC] Sync completed:", result);

      // After processing records
      Logger.info("Sync results", {
        totalProcessed: records.length,
        recordsToProcess: recordsToProcess.length,
        liveStatusChanges: recordsToProcess
          .filter((record) => {
            const existing = existingArtworks?.find((a) => a.id === record.id);
            const newStatus = record.get("ADD TO PRODUCTION") === true;
            return existing && existing.live_in_production !== newStatus;
          })
          .map((record) => ({
            id: record.id,
            title: record.get("Title"),
            oldStatus: existingArtworks?.find((a) => a.id === record.id)
              ?.live_in_production,
            newStatus: record.get("ADD TO PRODUCTION") === true,
          })),
      });

      return result;
    }
  } catch (error) {
    console.error("[SYNC] Artwork sync error:", error);
    throw error;
  }
}

// Update processArtworkRecord to initialize artwork_images
async function processArtworkRecord(
  record: Record<AirtableRecord>,
  options: {
    skipImages?: boolean;
  } = {},
): Promise<Artwork> {
  // Initialize with non-image fields
  const artwork: Partial<Artwork> & { id: string } = {
    id: record.id,
    title: record.get("Title") || null,
    medium: (record.get("Medium") as string) || null,
    year: record.get("Year") ? Number(record.get("Year")) : null,
    width: (record.get("Width (e.)") as string) || null,
    height: (record.get("Height (e.)") as string) || null,
    type: (record.get("Type") as string) || null,
    artist_name: (record.get("Artist") as string) || null,
    live_in_production: Boolean(record.get("ADD TO PRODUCTION")),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Only handle images if processImages is true
  if (!options.skipImages) {
    const rawAttachments = record.get("Artwork images");
    if (Array.isArray(rawAttachments)) {
      artwork.artwork_images = await processArtworkImages(
        record,
        artwork.title || "",
      );
    }
  }
  // When skipImages is true, don't include artwork_images field at all
  // This will preserve existing image data in Supabase

  return artwork as Artwork;
}

// Separate function for image processing
async function processArtworkImages(
  record: Record<AirtableRecord>,
  title: string,
): Promise<StoredAttachment[]> {
  const images: StoredAttachment[] = [];
  const rawAttachments = record.get("Artwork images");

  if (Array.isArray(rawAttachments)) {
    for (const [index, att] of rawAttachments.entries()) {
      try {
        const attachment = await uploadArtworkImageToSupabase(
          convertAttachment(att as RawAirtableAttachment),
          { title },
        );
        if (attachment.url) {
          images.push(attachment);
        }
      } catch (error) {
        Logger.error(`Failed to upload image`, {
          error: error instanceof Error ? error.message : "Unknown error",
          recordId: record.id,
          title,
          imageIndex: index + 1,
          filename: att.filename,
        });
      }
    }
  }

  return images;
}
