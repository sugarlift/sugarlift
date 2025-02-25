import { getArtistsTable } from "./airtable";
import { supabaseAdmin } from "./supabase";
import { AirtableAttachment, StoredAttachment } from "./types";
import pLimit from "p-limit";
import Logger from "@/lib/logger";
import { PostgrestError } from "@supabase/supabase-js";
import { Record as AirtableRecord, FieldSet } from "airtable";

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
    BUCKET_NAME: "attachments_artists",
  },
};

interface SyncError {
  message: string;
  details: string;
  error: Error | PostgrestError;
}

interface Artist {
  id: string;
  created_at: string;
  updated_at: string;
  artist_name: string;
  city: string | null;
  state: string | null;
  country: string | null;
  born: string | null;
  artist_bio: string | null;
  artist_photo?: StoredAttachment[];
  website: string | null;
  ig_handle: string | null;
  live_in_production: boolean;
  brand_value: string | null;
}

// Replace retryDelay function with one that uses constants
const retryDelay = (attempt: number) =>
  Math.min(
    CONFIG.RETRY.BASE_DELAY_MS * Math.pow(2, attempt),
    CONFIG.RETRY.MAX_DELAY_MS,
  );

async function uploadArtistPhotoToSupabase(
  attachment: AirtableAttachment,
  artist: { artist_name: string },
): Promise<StoredAttachment> {
  const folderName = artist.artist_name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9.-]/g, "-");
  const cleanFilename = attachment.filename
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .toLowerCase();
  const storagePath = `${folderName}/${cleanFilename}`;

  // Add retry logic for fetching
  const maxRetries = CONFIG.RETRY.MAX_RETRIES;
  const retryDelay = (attempt: number) =>
    Math.min(
      CONFIG.RETRY.BASE_DELAY_MS * Math.pow(2, attempt),
      CONFIG.RETRY.MAX_DELAY_MS,
    );

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      Logger.debug(
        `Fetching image for ${artist.artist_name}, attempt ${attempt + 1}`,
        {
          filename: cleanFilename,
          url: attachment.url.substring(0, 50) + "...", // Truncate the URL for logging
        },
      );

      const response = await fetch(attachment.url, {
        // Add timeout options
        signal: AbortSignal.timeout(CONFIG.UPLOAD.TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();

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

      Logger.debug(`Successfully uploaded image for ${artist.artist_name}`, {
        path: storagePath,
        publicUrl: publicUrl.substring(0, 50) + "...", // Truncate for logging
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
        artistName: artist.artist_name,
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
    artistName: artist.artist_name,
    error: lastError?.message || "Unknown error",
    stack: lastError?.stack,
    attempts: maxRetries,
  });

  // Return a partial record without the image
  return {
    url: null,
    width: attachment.width,
    height: attachment.height,
    filename: attachment.filename,
    type: attachment.type,
  };
}

export type SyncProgress = {
  current: number;
  total: number;
};

export type SyncOptions = {
  mode?: "bulk" | "incremental";
  batchSize?: number;
  concurrency?: number;
  skipExistingCheck?: boolean;
  skipImages?: boolean;
  columns?: string[];
  onProgress?: (progress: SyncProgress) => void;
};

export interface SyncResult {
  processedCount: number;
  totalRecords: number;
}

interface ExistingArtist {
  id: string;
  updated_at: string;
  live_in_production: boolean;
}

// Extract this function outside the main sync function to make it reusable
async function upsertWithRetry(
  data: Partial<Artist>[],
  attempt = 0,
  maxRetries = CONFIG.RETRY.MAX_RETRIES,
): Promise<void> {
  try {
    // Validate and clean the data before sending
    const cleanedData = data.map((record) => {
      // Log problematic records
      if (!record.id || !record.artist_name) {
        Logger.warn("Invalid record found:", {
          id: record.id,
          artist_name: record.artist_name,
          recordKeys: Object.keys(record),
        });
      }

      // Create cleaned record with only defined non-null values
      const cleaned = Object.entries(record).reduce((acc, [key, value]) => {
        // Skip undefined or null values
        if (value !== undefined && value !== null) {
          // Use Record type for type-safe dynamic key assignment
          (acc as Record<keyof Artist, Artist[keyof Artist]>)[
            key as keyof Artist
          ] = value;
        }
        return acc;
      }, {} as Partial<Artist>);

      // Ensure required fields are present
      if (record.id) {
        cleaned.id = record.id;
      }
      if (record.live_in_production !== undefined) {
        cleaned.live_in_production = record.live_in_production;
      }

      // Log the cleaned record structure
      Logger.debug("Cleaned record structure:", {
        id: cleaned.id,
        hasName: !!cleaned.artist_name,
        photoCount: cleaned.artist_photo?.length ?? 0,
        recordSize: JSON.stringify(cleaned).length,
      });

      return cleaned;
    });

    // Log the total payload size
    const payloadSize = JSON.stringify(cleanedData).length;
    Logger.info("Attempting upsert:", {
      recordCount: cleanedData.length,
      payloadSizeBytes: payloadSize,
      attempt,
    });

    // If payload is too large, split before attempting
    if (payloadSize > CONFIG.PAYLOAD.MAX_SIZE_BYTES) {
      // 1MB limit
      Logger.warn("Payload too large, splitting preemptively");
      const mid = Math.floor(cleanedData.length / 2);
      const batch1 = cleanedData.slice(0, mid);
      const batch2 = cleanedData.slice(mid);

      await upsertWithRetry(batch1, 0, maxRetries);
      await upsertWithRetry(batch2, 0, maxRetries);
      return;
    }

    const { error } = await supabaseAdmin.from("artists").upsert(cleanedData);

    if (error) {
      Logger.error("Upsert attempt failed:", {
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
    Logger.error("Upsert error:", {
      error: errorDetails,
      dataLength: data.length,
      firstRecordId: data[0]?.id,
      statusCode: (error as PostgrestError)?.code,
      hint: (error as PostgrestError)?.hint,
      details: (error as PostgrestError)?.details,
    });
    throw error;
  }
}

export async function syncArtistsToSupabase({
  mode = "bulk",
  batchSize = 25,
  concurrency = 2,
  skipExistingCheck = false,
  skipImages = false,
  columns = [],
  onProgress,
}: SyncOptions): Promise<SyncResult> {
  const artistsTable = getArtistsTable();
  let processedCount = 0;
  let totalRecords = 0;
  const errors: SyncError[] = [];

  Logger.info("Starting artist sync", {
    mode,
    batchSize,
    concurrency,
    skipExistingCheck,
    processImages: !skipImages ? "yes" : "no",
    columns,
  });

  try {
    // Get existing artists from Supabase with last update time
    let existingArtists: ExistingArtist[] = [];
    if (!skipExistingCheck) {
      Logger.info("Fetching existing artists from database");
      const { data: existing, error } = await supabaseAdmin
        .from("artists")
        .select("id, updated_at, live_in_production");

      if (error) {
        throw new Error(`Failed to fetch existing artists: ${error.message}`);
      }

      existingArtists = existing || [];
      Logger.info(
        `Found ${existingArtists.length} existing artists in database`,
      );
    }

    // Fetch records from Airtable
    Logger.info("Fetching artists from Airtable");
    const records = await artistsTable.select().all();
    totalRecords = records.length;
    Logger.info(`Found ${totalRecords} artists in Airtable`);

    // Filter records that need updating in incremental mode
    const recordsToProcess =
      mode === "incremental"
        ? filterRecordsForIncrementalSync(records, existingArtists)
        : records;

    Logger.info(`Found ${recordsToProcess.length} artists to update`, {
      mode,
      totalRecords,
      processImages: !skipImages ? "yes" : "no",
      columns,
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
            Logger.info(`Processing batch ${batchIndex + 1}/${batches.length}`);

            // Process artist records in the batch
            const artistData = await processArtistBatch(batch, { skipImages });

            if (artistData.length === 0) {
              Logger.info(
                `Batch ${batchIndex + 1} had no valid records to process`,
              );
              return;
            }

            // Upsert to database in smaller chunks to avoid payload size issues
            await upsertArtistData(artistData, mode);

            processedCount += artistData.length;
            onProgress?.({ current: processedCount, total: totalRecords });

            Logger.info(`Completed batch ${batchIndex + 1}/${batches.length}`, {
              processedInBatch: artistData.length,
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
              message: errorMessage,
              details: `Failed to process batch ${batchIndex + 1}/${batches.length}`,
              error: error as Error | PostgrestError,
            });
          }
        }),
      ),
    );

    // Handle any errors that occurred during processing
    if (errors.length > 0) {
      Logger.warn(`Sync completed with ${errors.length} errors`, {
        errorCount: errors.length,
        totalProcessed: processedCount,
        totalRecords,
      });

      throw new Error(
        `Sync completed with ${errors.length} errors: ${errors
          .map((e: SyncError) => e.message)
          .join(", ")}`,
      );
    }

    Logger.info("Artist sync completed successfully", {
      processedCount,
      totalRecords,
      mode,
    });

    return { processedCount, totalRecords };
  } catch (error) {
    Logger.error("Error syncing artists:", error);
    throw error;
  }
}

// Helper function to filter records that need updating in incremental mode
function filterRecordsForIncrementalSync(
  records: readonly AirtableRecord<FieldSet>[],
  existingArtists: ExistingArtist[],
): AirtableRecord<FieldSet>[] {
  return records.filter((record) => {
    const lastModified = new Date(record.get("Last Modified") as string);
    const existingArtist = existingArtists.find((a) => a.id === record.id);

    // Include if:
    // 1. Record doesn't exist in database yet
    // 2. Record was modified after the last database update
    // 3. Live status has changed
    return (
      !existingArtist ||
      lastModified > new Date(existingArtist.updated_at) ||
      Boolean(record.get("Add to Website")) !==
        existingArtist.live_in_production
    );
  });
}

// Process a batch of artist records
async function processArtistBatch(
  batch: AirtableRecord<FieldSet>[],
  options: { skipImages?: boolean } = {},
): Promise<(Partial<Artist> & { id: string })[]> {
  const results = await Promise.all(
    batch.map(async (record) => {
      try {
        return await processArtistRecord(record, options);
      } catch (error) {
        Logger.error("Failed to process artist record", {
          recordId: record.id,
          artistName: record.get("Artist Name"),
          error: error instanceof Error ? error.message : "Unknown error",
        });
        return null;
      }
    }),
  );

  return results.filter(
    (artist): artist is Partial<Artist> & { id: string } => artist !== null,
  );
}

// Upsert artist data to database in smaller chunks
async function upsertArtistData(
  artistData: (Partial<Artist> & { id: string })[],
  mode: string,
): Promise<void> {
  if (artistData.length === 0 || !(mode === "incremental" || mode === "bulk")) {
    return;
  }

  // Use smaller chunks to avoid payload size issues
  const chunkSize = 3;
  for (let i = 0; i < artistData.length; i += chunkSize) {
    const chunk = artistData.slice(i, i + chunkSize);

    try {
      await upsertWithRetry(chunk);
      Logger.debug(
        `Upserted chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(artistData.length / chunkSize)}`,
        {
          chunkSize: chunk.length,
        },
      );
    } catch (error) {
      Logger.error("Failed to upsert artist chunk", {
        chunkIndex: Math.floor(i / chunkSize) + 1,
        totalChunks: Math.ceil(artistData.length / chunkSize),
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}

async function processArtistRecord(
  record: AirtableRecord<FieldSet>,
  options: {
    skipImages?: boolean;
  } = {},
) {
  // Initialize with non-image fields
  const result: Partial<Artist> & { id: string } = {
    id: record.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    artist_name: record.get("Artist Name") as string,
    city: record.get("City") as string,
    state: record.get("State (USA)") as string,
    country: record.get("Country") as string,
    born: record.get("Born") as string,
    artist_bio: record.get("Artist Bio") as string,
    website: record.get("Website") as string,
    ig_handle: record.get("IG Handle") as string,
    live_in_production: record.get("Add to Website") as boolean,
    brand_value: record.get("Brand Value") as string,
  };

  // Only include artist_photo field if we're processing images
  if (!options.skipImages) {
    const photos = record.get(
      "Artist Photo",
    ) as unknown as AirtableAttachment[];
    if (photos && photos.length > 0) {
      result.artist_photo = await Promise.all(
        photos.map((photo) =>
          uploadArtistPhotoToSupabase(photo, {
            artist_name: result.artist_name as string,
          }),
        ),
      );
    }
  }
  // When skipImages is true, don't include artist_photo field at all
  // This will preserve existing image data in Supabase

  return result;
}
