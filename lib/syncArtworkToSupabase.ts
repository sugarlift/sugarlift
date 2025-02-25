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
import pLimit from "p-limit"; // Add import for pLimit

// Configuration constants for better readability and maintenance
const CONFIG = {
  RETRY: {
    MAX_RETRIES: 3,
    MAX_DELAY_MS: 30000, // 30 seconds
    BASE_DELAY_MS: 1000,
  },
  UPLOAD: {
    TIMEOUT_MS: 30000, // 30 seconds
  },
  PAYLOAD: {
    MAX_SIZE_BYTES: 1_000_000, // 1MB Supabase payload limit
  },
  STORAGE: {
    BUCKET_NAME: "attachments_artwork",
  },
  BATCH: {
    DEFAULT_SIZE: 25,
    DEFAULT_CONCURRENCY: 2,
    UPSERT_CHUNK_SIZE: 3,
  },
};

// Add this below the CONFIG object
// Standard retryDelay function that uses CONFIG values
const retryDelay = (attempt: number) =>
  Math.min(
    CONFIG.RETRY.BASE_DELAY_MS * Math.pow(2, attempt),
    CONFIG.RETRY.MAX_DELAY_MS,
  );

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

// Update the uploadArtworkImageToSupabase function to use CONFIG
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
  const maxRetries = CONFIG.RETRY.MAX_RETRIES;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      Logger.debug("Starting image upload attempt", {
        attempt: attempt + 1,
        filename: cleanFilename,
        url: attachment.url.substring(0, 50) + "...", // Truncate for logging
      });

      const response = await fetch(attachment.url, {
        signal: AbortSignal.timeout(CONFIG.UPLOAD.TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();

      // Validate blob size
      if (blob.size === 0) {
        throw new Error("Empty image file");
      }

      Logger.debug(`Uploading image to Supabase: ${storagePath}`, {
        size: blob.size,
        type: blob.type,
      });

      const { error: uploadError } = await supabaseAdmin.storage
        .from(CONFIG.STORAGE.BUCKET_NAME)
        .upload(storagePath, blob, {
          contentType: attachment.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabaseAdmin.storage
        .from(CONFIG.STORAGE.BUCKET_NAME)
        .getPublicUrl(storagePath);

      Logger.info("Successfully uploaded image", {
        path: storagePath,
        publicUrl: publicUrl.substring(0, 50) + "...", // Truncate for logging
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

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorDetails = {
        attempt: attempt + 1,
        maxRetries,
        filename: cleanFilename,
        error: errorMessage,
        artworkTitle: artwork.title,
        errorType:
          error instanceof Error ? error.constructor.name : typeof error,
      };

      // Log the retry attempt
      Logger.warn("Image upload attempt failed, retrying...", errorDetails);

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
    error: lastError?.message || "Unknown error",
    stack: lastError?.stack,
    attempts: maxRetries,
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

// Add after the existing interfaces and before syncArtworkToSupabase function

// Reusable function for upserting artwork data with retry logic
async function upsertWithRetry(
  data: Partial<Artwork>[],
  attempt = 0,
  maxRetries = CONFIG.RETRY.MAX_RETRIES,
): Promise<void> {
  try {
    // Validate and clean the data before sending
    const cleanedData = data.map((record) => {
      // Log problematic records
      if (!record.id || !record.title) {
        Logger.warn("Invalid artwork record found:", {
          id: record.id,
          title: record.title,
          recordKeys: Object.keys(record),
        });
      }

      // Create cleaned record with only defined non-null values
      const cleaned = Object.entries(record).reduce((acc, [key, value]) => {
        // Skip undefined or null values
        if (value !== undefined && value !== null) {
          // Type-safe dynamic key assignment
          (acc as any)[key] = value;
        }
        return acc;
      }, {} as Partial<Artwork>);

      // Ensure required fields are present
      if (record.id) {
        cleaned.id = record.id;
      }
      if (record.live_in_production !== undefined) {
        cleaned.live_in_production = record.live_in_production;
      }

      // Log the cleaned record structure at debug level
      Logger.debug("Cleaned artwork record structure:", {
        id: cleaned.id,
        hasTitle: !!cleaned.title,
        imageCount: cleaned.artwork_images?.length ?? 0,
        recordSize: JSON.stringify(cleaned).length,
      });

      return cleaned;
    });

    // Log the total payload size
    const payloadSize = JSON.stringify(cleanedData).length;
    Logger.info("Attempting artwork upsert:", {
      recordCount: cleanedData.length,
      payloadSizeBytes: payloadSize,
      attempt,
    });

    // If payload is too large, split before attempting
    if (payloadSize > CONFIG.PAYLOAD.MAX_SIZE_BYTES) {
      // 1MB limit
      Logger.warn("Artwork payload too large, splitting preemptively");
      const mid = Math.floor(cleanedData.length / 2);
      const batch1 = cleanedData.slice(0, mid);
      const batch2 = cleanedData.slice(mid);

      await upsertWithRetry(batch1, 0, maxRetries);
      await upsertWithRetry(batch2, 0, maxRetries);
      return;
    }

    const { error } = await supabaseAdmin.from("artwork").upsert(cleanedData, {
      onConflict: "id",
      ignoreDuplicates: false,
    });

    if (error) {
      Logger.error("Artwork upsert attempt failed:", {
        attempt,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
        dataLength: cleanedData.length,
        firstRecordId: cleanedData[0]?.id,
        payloadSize,
      });

      // Handle rate limiting
      if (error.code === "429") {
        if (attempt < maxRetries) {
          const delay = retryDelay(attempt);
          Logger.warn(`Rate limited, retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return upsertWithRetry(data, attempt + 1, maxRetries);
        }
      }

      // Handle payload size issues
      if (error.code === "400" && cleanedData.length > 1) {
        Logger.warn("400 error, splitting batch");
        const mid = Math.floor(cleanedData.length / 2);
        const batch1 = cleanedData.slice(0, mid);
        const batch2 = cleanedData.slice(mid);

        await upsertWithRetry(batch1, 0, maxRetries);
        await upsertWithRetry(batch2, 0, maxRetries);
        return;
      }

      throw error;
    }
  } catch (error) {
    const errorDetails =
      error instanceof Error ? error.message : "Unknown error";
    Logger.error("Artwork upsert error:", {
      error: errorDetails,
      dataLength: data.length,
      firstRecordId: data[0]?.id,
      statusCode: (error as any)?.code,
      hint: (error as any)?.hint,
      details: (error as any)?.details,
    });
    throw error;
  }
}

export async function syncArtworkToSupabase(
  options: SyncOptions = { mode: "incremental" },
): Promise<{
  success: boolean;
  mode: string;
  processedCount: number;
  total: number;
  errors: SyncError[] | null;
}> {
  const {
    mode = "bulk",
    batchSize = CONFIG.BATCH.DEFAULT_SIZE,
    concurrency = CONFIG.BATCH.DEFAULT_CONCURRENCY,
    skipExistingCheck = false,
    skipImages = false,
  } = options;

  const errors: SyncError[] = [];
  let processedCount = 0;
  let totalRecords = 0;

  // Use Logger instead of console.log
  Logger.info("Starting artwork sync", {
    mode,
    batchSize,
    concurrency,
    skipExistingCheck,
    processImages: !skipImages ? "yes" : "no",
  });

  try {
    // Get existing records with last update time
    let existingArtworks: ExistingArtwork[] = [];
    if (!skipExistingCheck) {
      Logger.info("Fetching existing artworks from database");
      const { data: existing, error } = await supabaseAdmin
        .from("artwork")
        .select("id, updated_at, live_in_production");

      if (error) {
        throw new Error(`Failed to fetch existing artworks: ${error.message}`);
      }

      existingArtworks = existing || [];
      Logger.info(
        `Found ${existingArtworks.length} existing artworks in database`,
        {
          liveArtworks: existingArtworks.filter((a) => a.live_in_production)
            .length,
        },
      );
    }

    // Get all records from Airtable
    Logger.info("Fetching artworks from Airtable");
    const table = getArtworkTable();
    const records = await table
      .select({
        pageSize: batchSize,
      })
      .all();

    totalRecords = records.length;
    Logger.info(`Found ${totalRecords} artworks in Airtable`);

    // Filter records that need updating in incremental mode
    const recordsToProcess =
      mode === "incremental"
        ? filterRecordsForIncrementalSync(records, existingArtworks)
        : records;

    Logger.info(`Found ${recordsToProcess.length} artworks to update`, {
      mode,
      totalRecords,
      skipImages: !!skipImages,
    });

    // Process in batches with concurrency limit
    const limit = pLimit(concurrency);
    const batches = [];

    for (let i = 0; i < recordsToProcess.length; i += batchSize) {
      const batch = recordsToProcess.slice(i, i + batchSize);
      batches.push(batch);
    }

    Logger.info(`Created ${batches.length} batches of max size ${batchSize}`);

    await Promise.all(
      batches.map((batch, batchIndex) =>
        limit(async () => {
          try {
            const currentBatch = batchIndex + 1;
            Logger.info(`Processing batch ${currentBatch}/${batches.length}`);

            // Emit progress
            emitProgress({
              current: processedCount,
              total: totalRecords,
              currentBatch,
              totalBatches: batches.length,
            });

            // Process artwork records in the batch
            const artworkData = await processArtworkBatch(batch, {
              skipImages,
            });

            if (artworkData.length === 0) {
              Logger.info(
                `Batch ${currentBatch} had no valid records to process`,
              );
              return;
            }

            // Upsert to database in smaller chunks to avoid payload size issues
            await upsertArtworkData(artworkData, mode);

            processedCount += artworkData.length;

            // Update progress
            emitProgress({
              current: processedCount,
              total: totalRecords,
              currentBatch,
              totalBatches: batches.length,
            });

            // Call onProgress if provided
            options.onProgress?.({
              current: processedCount,
              total: recordsToProcess.length,
            });

            Logger.info(`Completed batch ${currentBatch}/${batches.length}`, {
              processedInBatch: artworkData.length,
              totalProcessed: processedCount,
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            Logger.error(`Error processing batch ${batchIndex + 1}`, {
              error: errorMessage,
              batchSize: batch.length,
            });

            errors.push({
              record_id: batch[0]?.id || "unknown",
              error: errorMessage,
              timestamp: new Date().toISOString(),
            });
          }
        }),
      ),
    );

    // Log live status changes for better visibility
    if (existingArtworks.length > 0) {
      const liveStatusChanges = recordsToProcess
        .filter((record) => {
          const existing = existingArtworks.find((a) => a.id === record.id);
          const newStatus = Boolean(record.get("ADD TO PRODUCTION"));
          return existing && existing.live_in_production !== newStatus;
        })
        .map((record) => ({
          id: record.id,
          title: record.get("Title"),
          oldStatus: existingArtworks.find((a) => a.id === record.id)
            ?.live_in_production,
          newStatus: Boolean(record.get("ADD TO PRODUCTION")),
        }));

      if (liveStatusChanges.length > 0) {
        Logger.info(
          `Found ${liveStatusChanges.length} artworks with live status changes`,
          {
            liveStatusChanges,
          },
        );
      }
    }

    // Handle any errors that occurred during processing
    if (errors.length > 0) {
      Logger.warn(`Sync completed with ${errors.length} errors`, {
        errorCount: errors.length,
        totalProcessed: processedCount,
        totalRecords,
      });
    } else {
      Logger.info("Artwork sync completed successfully", {
        processedCount,
        totalRecords,
        mode,
      });
    }

    return {
      success: true,
      mode,
      processedCount,
      total: totalRecords,
      errors: errors.length > 0 ? errors : null,
    };
  } catch (error) {
    Logger.error("Error syncing artworks:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
}

// Update processArtworkRecord to not include artwork_images when skipImages is true
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

  // Only include artwork_images field if we're processing images
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

// Helper function to filter records that need updating in incremental mode
function filterRecordsForIncrementalSync(
  records: readonly Record<FieldSet>[],
  existingArtworks: ExistingArtwork[],
): Record<FieldSet>[] {
  return records.filter((record) => {
    const lastModified = new Date(record.get("Last Modified") as string);
    const existingArtwork = existingArtworks.find((a) => a.id === record.id);

    // Include if:
    // 1. Record doesn't exist in database yet
    // 2. Record was modified after the last database update
    // 3. Live status has changed
    return (
      !existingArtwork ||
      lastModified > new Date(existingArtwork.updated_at) ||
      Boolean(record.get("ADD TO PRODUCTION")) !==
        existingArtwork.live_in_production
    );
  });
}

// Process a batch of artwork records
async function processArtworkBatch(
  batch: Record<FieldSet>[],
  options: { skipImages?: boolean } = {},
): Promise<Artwork[]> {
  const results = await Promise.all(
    batch.map(async (record) => {
      try {
        // Convert to our expected record type
        const convertedRecord = convertAirtableRecord(record);
        return await processArtworkRecord(convertedRecord, options);
      } catch (error) {
        Logger.error("Failed to process artwork record", {
          recordId: record.id,
          title: record.get("Title"),
          error: error instanceof Error ? error.message : "Unknown error",
        });
        return null;
      }
    }),
  );

  // Filter out null results
  return results.filter((artwork): artwork is Artwork => artwork !== null);
}

// Upsert artwork data to database in smaller chunks
async function upsertArtworkData(
  artworkData: Artwork[],
  mode: string,
): Promise<void> {
  if (
    artworkData.length === 0 ||
    !(mode === "incremental" || mode === "bulk")
  ) {
    return;
  }

  // Use smaller chunks to avoid payload size issues
  const chunkSize = CONFIG.BATCH.UPSERT_CHUNK_SIZE;
  for (let i = 0; i < artworkData.length; i += chunkSize) {
    const chunk = artworkData.slice(i, i + chunkSize);

    try {
      await upsertWithRetry(chunk);
      Logger.debug(
        `Upserted artwork chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(artworkData.length / chunkSize)}`,
        {
          chunkSize: chunk.length,
        },
      );
    } catch (error) {
      Logger.error("Failed to upsert artwork chunk", {
        chunkIndex: Math.floor(i / chunkSize) + 1,
        totalChunks: Math.ceil(artworkData.length / chunkSize),
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}
