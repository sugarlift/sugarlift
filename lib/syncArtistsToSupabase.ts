import { getArtistsTable } from "./airtable";
import { supabaseAdmin } from "./supabase";
import { AirtableAttachment, StoredAttachment } from "./types";
import pLimit from "p-limit";
import Logger from "@/lib/logger";
import { PostgrestError } from "@supabase/supabase-js";
import { Record as AirtableRecord, FieldSet } from "airtable";

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
  const maxRetries = 3;
  const retryDelay = (attempt: number) =>
    Math.min(1000 * Math.pow(2, attempt), 30000);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(attachment.url, {
        // Add timeout options
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();

      const { error: uploadError } = await supabaseAdmin.storage
        .from("attachments_artists")
        .upload(storagePath, blob, {
          contentType: attachment.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabaseAdmin.storage
        .from("attachments_artists")
        .getPublicUrl(storagePath);

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
    artworkTitle: artist.artist_name,
    error: lastError,
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

  // Add retry logic for rate limits
  const retryDelay = (attempt: number) =>
    Math.min(1000 * Math.pow(2, attempt), 30000);
  const maxRetries = 3;

  Logger.info("Starting artist sync", {
    mode,
    batchSize,
    concurrency,
    skipExistingCheck,
    processImages: !skipImages ? "yes" : "no",
    columns,
  });

  // Helper function to handle Supabase upsert with retries
  async function upsertWithRetry(data: Partial<Artist>[], attempt = 0) {
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
      if (payloadSize > 1_000_000) {
        // 1MB limit
        Logger.warn("Payload too large, splitting preemptively");
        const mid = Math.floor(cleanedData.length / 2);
        const batch1 = cleanedData.slice(0, mid);
        const batch2 = cleanedData.slice(mid);

        await upsertWithRetry(batch1, 0);
        await upsertWithRetry(batch2, 0);
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
            return upsertWithRetry(data, attempt + 1);
          }
        }

        // Handle payload size issues
        if (error.code === "400" && cleanedData.length > 1) {
          Logger.warn("400 error, splitting batch");
          const mid = Math.floor(cleanedData.length / 2);
          const batch1 = cleanedData.slice(0, mid);
          const batch2 = cleanedData.slice(mid);

          await upsertWithRetry(batch1, 0);
          await upsertWithRetry(batch2, 0);
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

  try {
    // Get existing artists from Supabase with last update time
    let existingArtists: ExistingArtist[] = [];
    if (!skipExistingCheck) {
      const { data: existing } = await supabaseAdmin
        .from("artists")
        .select("id, updated_at, live_in_production");
      existingArtists = existing || [];
    }

    // Fetch records from Airtable
    const records = await artistsTable.select().all();
    totalRecords = records.length;

    // Filter records that need updating in incremental mode
    const recordsToProcess =
      mode === "incremental"
        ? records.filter((record) => {
            const lastModified = new Date(
              record.get("Last Modified") as string,
            );
            const existingLastUpdate = existingArtists.find(
              (a: ExistingArtist) => a.id === record.id,
            );
            return (
              !existingLastUpdate ||
              lastModified > new Date(existingLastUpdate.updated_at)
            );
          })
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

    await Promise.all(
      batches.map((batch) =>
        limit(async () => {
          try {
            const artistData = await Promise.all(
              batch.map(async (record) => {
                try {
                  return await processArtistRecord(record, {
                    skipImages,
                  });
                } catch (error) {
                  Logger.error("Failed to process artist record", {
                    recordId: record.id,
                    error:
                      error instanceof Error ? error.message : "Unknown error",
                  });
                  return null;
                }
              }),
            );

            const validArtistData = artistData.filter(
              (artist: Partial<Artist> | null): artist is Partial<Artist> =>
                artist !== null,
            );

            if (validArtistData.length === 0) {
              return;
            }

            if (mode === "incremental" || mode === "bulk") {
              const chunkSize = 3;
              for (let i = 0; i < validArtistData.length; i += chunkSize) {
                const chunk = validArtistData
                  .slice(i, i + chunkSize)
                  .filter(
                    (data): data is Partial<Artist> & { id: string } =>
                      data !== null,
                  );

                try {
                  await upsertWithRetry(chunk);
                } catch (error) {
                  errors.push({
                    message:
                      error instanceof Error ? error.message : "Unknown error",
                    details: `Failed to upsert chunk of artists (${i} to ${i + chunkSize})`,
                    error: error as Error,
                  });
                }
              }
            }

            processedCount += validArtistData.length;
            onProgress?.({ current: processedCount, total: totalRecords });

            // Add logging after processing
            Logger.info("Sync results", {
              totalProcessed: processedCount,
              recordsToProcess: recordsToProcess.length,
              liveStatusChanges: recordsToProcess
                .filter((record) => {
                  const existing = existingArtists.find(
                    (a: ExistingArtist) => a.id === record.id,
                  );
                  const newStatus = Boolean(record.get("Add to Website"));
                  return existing && existing.live_in_production !== newStatus;
                })
                .map((record) => ({
                  id: record.id,
                  name: record.get("Artist Name"),
                  oldStatus: existingArtists.find(
                    (a: ExistingArtist) => a.id === record.id,
                  )?.live_in_production,
                  newStatus: Boolean(record.get("Add to Website")),
                })),
            });
          } catch (error) {
            Logger.error("Batch processing error:", {
              error: error instanceof Error ? error.message : "Unknown error",
              batchSize: batch.length,
              statusCode: (error as PostgrestError)?.code,
              hint: (error as PostgrestError)?.hint,
              details: (error as PostgrestError)?.details,
            });
            errors.push({
              message: error instanceof Error ? error.message : "Unknown error",
              details: "Failed to process batch",
              error: error as Error,
            });
          }
        }),
      ),
    );

    if (errors.length > 0) {
      throw new Error(
        `Sync completed with ${errors.length} errors: ${errors
          .map((e: SyncError) => e.message)
          .join(", ")}`,
      );
    }

    Logger.info("Artist sync completed", {
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
