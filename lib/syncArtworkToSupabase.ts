import { getArtworkTable } from "./airtable";
import { supabaseAdmin } from "./supabase";
import {
  Artwork,
  AirtableAttachment,
  StoredAttachment,
  SyncError,
} from "./types";
import Logger from "./logger";
import { Record, Attachment, FieldSet } from "airtable";

// Define the fields interface for Airtable records
type AirtableFields = {
  Title: string;
  Medium: string;
  Year: string | number;
  "Width (e.)": string;
  "Height (e.)": string;
  Artist: string;
  Type: string;
  "Last Modified": string;
  "Artwork images": Attachment[];
};

// Helper function to safely convert Airtable record to our type
function convertAirtableRecord(
  record: Record<FieldSet>,
): Record<AirtableFields> {
  // Verify the record has the required fields
  const fields = record.fields as unknown as AirtableFields;
  return record as unknown as Record<AirtableFields>;
}

// Add this helper function to convert Airtable Attachment to AirtableAttachment
function convertAttachment(att: Attachment): AirtableAttachment {
  return {
    id: att.id,
    url: att.url,
    filename: att.filename,
    type: att.type,
    width: 0, // Default value since Airtable Attachment doesn't include width
    height: 0, // Default value since Airtable Attachment doesn't include height
  };
}

async function uploadArtworkImageToSupabase(
  attachment: AirtableAttachment,
  artwork: { title: string },
): Promise<StoredAttachment> {
  try {
    Logger.debug("Starting image upload", {
      filename: attachment.filename,
      url: attachment.url,
      type: attachment.type,
    });

    // Validate attachment URL
    if (!attachment.url || !attachment.url.startsWith("http")) {
      throw new Error(`Invalid attachment URL for ${attachment.filename}`);
    }

    const folderName = artwork.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9.-]/g, "-");
    const cleanFilename = attachment.filename
      .replace(/[^a-zA-Z0-9.-]/g, "-")
      .toLowerCase();
    const storagePath = `${folderName}/${cleanFilename}`;

    // Replace the fetch with timeout implementation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(attachment.url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // Validate content type
    const contentType = response.headers.get("content-type");
    if (!contentType?.startsWith("image/")) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    const blob = await response.blob();

    // Validate blob size
    if (blob.size === 0) {
      throw new Error("Empty image file");
    }

    Logger.debug("Uploading to Supabase storage", {
      storagePath,
      size: blob.size,
      type: blob.type,
    });

    const { error: uploadError } = await supabaseAdmin.storage
      .from("attachments_artwork")
      .upload(storagePath, blob, {
        contentType: attachment.type,
        upsert: true,
      });

    if (uploadError) {
      Logger.error("Storage upload failed", uploadError, { storagePath });
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage
      .from("attachments_artwork")
      .getPublicUrl(storagePath);

    Logger.info("Successfully uploaded image", {
      url: publicUrl,
      path: storagePath,
    });

    return {
      url: publicUrl,
      width: attachment.width,
      height: attachment.height,
      filename: attachment.filename,
      type: attachment.type,
    };
  } catch (error) {
    Logger.error("Image upload failed", error, {
      filename: attachment.filename,
      artworkTitle: artwork.title,
    });
    throw error;
  }
}

interface SyncOptions {
  mode: "bulk" | "update";
  batchSize?: number;
  skipExistingCheck?: boolean;
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

export async function syncArtworkToSupabase(
  options: SyncOptions = { mode: "update" },
) {
  Logger.info(`Starting artwork sync`, { options });

  try {
    console.log(`[SYNC] Starting artwork sync in ${options.mode} mode...`);
    const table = getArtworkTable();
    let processedCount = 0;
    const errors: SyncError[] = [];

    // Get all records that are marked for production from Airtable
    const records = await table
      .select({
        filterByFormula: "{ADD TO PRODUCTION} = 1",
        pageSize: options.batchSize || 100,
      })
      .all();

    Logger.info(`Retrieved records from Airtable`, {
      recordCount: records.length,
      mode: options.mode,
    });

    console.log(`[SYNC] Found ${records.length} artwork records to process`);

    if (options.mode === "bulk") {
      console.log("Running in bulk mode - skipping timestamp checks");

      const batchSize = options.batchSize || 100;
      const concurrency = options.concurrency || 3;
      const total = records.length;
      const totalBatches = Math.ceil(total / batchSize);

      for (let i = 0; i < records.length; i += batchSize) {
        const currentBatch = Math.floor(i / batchSize) + 1;
        console.log(`Starting batch ${currentBatch} of ${totalBatches}`);

        emitProgress({
          current: processedCount,
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
              const artwork = await processArtworkRecord(
                convertAirtableRecord(record),
              );
              processedCount++;
              emitProgress({
                current: processedCount,
                total,
                currentBatch,
                totalBatches,
              });
              return { success: true, id: record.id, artwork };
            } catch (error) {
              errors.push({
                record_id: record.id,
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: new Date().toISOString(),
              });
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
        mode: options.mode,
        processedCount,
        total: records.length,
        errors: errors.length > 0 ? errors : null,
      };
    } else {
      // Update mode
      console.log("[SYNC] Running in update mode - checking for changes");

      const { data: existingArtworks, error: fetchError } = await supabaseAdmin
        .from("artwork")
        .select("id, updated_at")
        .eq("live_in_production", true);

      if (fetchError) {
        console.error("[SYNC] Error fetching existing artworks:", fetchError);
        throw fetchError;
      }

      console.log(
        `[SYNC] Found ${existingArtworks?.length || 0} existing artworks in Supabase`,
      );

      // Create a map of existing artworks with their last update time
      const existingArtworksMap = new Map(
        existingArtworks?.map((artwork) => [
          artwork.id,
          new Date(artwork.updated_at),
        ]) || [],
      );

      // Process each record
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
          await processArtworkRecord(convertedRecord);
          processedCount++;
        } catch (error) {
          console.error(`[SYNC] Error processing artwork ${record.id}:`, error);
          errors.push({
            record_id: record.id,
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    const result = {
      success: true,
      mode: options.mode,
      processedCount,
      total: records.length,
      errors: errors.length > 0 ? errors : null,
    };

    console.log("[SYNC] Sync completed:", result);
    return result;
  } catch (error) {
    console.error("[SYNC] Artwork sync error:", error);
    throw error;
  }
}

// Helper function to process a single artwork record
async function processArtworkRecord(
  record: Record<AirtableFields>,
): Promise<Artwork> {
  const recordId = record.id;
  const title = record.get("Title") as string;
  Logger.info(`Processing artwork record`, { recordId, title });

  const rawAttachments = record.get("Artwork images");
  const artwork_images: StoredAttachment[] = [];

  if (Array.isArray(rawAttachments)) {
    Logger.info(`Processing artwork images`, {
      recordId,
      title,
      imageCount: rawAttachments.length,
    });

    for (const [index, att] of rawAttachments.entries()) {
      Logger.debug(`Processing image`, {
        recordId,
        title,
        imageIndex: index + 1,
        totalImages: rawAttachments.length,
        filename: att.filename,
        size: att.size,
      });

      try {
        const attachment = await uploadArtworkImageToSupabase(
          convertAttachment(att),
          { title },
        );
        artwork_images.push(attachment);
        Logger.debug(`Successfully uploaded image`, {
          recordId,
          title,
          imageIndex: index + 1,
          url: attachment.url,
        });
      } catch (error) {
        Logger.error(`Failed to upload image`, error, {
          recordId,
          title,
          imageIndex: index + 1,
          filename: att.filename,
        });
        throw error;
      }
    }
  }

  Logger.info(`Creating artwork record`, { recordId, title });
  const artwork: Artwork = {
    id: record.id,
    title: title || null,
    artwork_images,
    medium: (record.get("Medium") as string) || null,
    year: record.get("Year") ? Number(record.get("Year")) : null,
    width: (record.get("Width (e.)") as string) || null,
    height: (record.get("Height (e.)") as string) || null,
    live_in_production: true,
    artist_name: (record.get("Artist") as string) || null,
    type: (record.get("Type") as string) || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    Logger.debug(`Upserting to Supabase`, { recordId, title });
    const { error: upsertError } = await supabaseAdmin
      .from("artwork")
      .upsert(artwork);

    if (upsertError) {
      Logger.error(`Supabase upsert failed`, upsertError, { recordId, title });
      throw upsertError;
    }

    Logger.info(`Successfully processed artwork`, {
      recordId,
      title,
      imagesCount: artwork_images.length,
    });
    return artwork;
  } catch (error) {
    Logger.error(`Failed to process artwork`, error, { recordId, title });
    throw error;
  }
}
