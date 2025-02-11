import { getArtistsTable } from "./airtable";
import { supabaseAdmin } from "./supabase";
import { Artist, AirtableAttachment, StoredAttachment } from "./types";
import pLimit from "p-limit";
import Logger from "@/lib/logger";
import { PostgrestError } from "@supabase/supabase-js";

interface SyncError {
  message: string;
  details: string;
  error: Error | PostgrestError;
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

  const response = await fetch(attachment.url);
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
}

export type SyncProgress = {
  current: number;
  total: number;
};

type SyncOptions = {
  mode?: "bulk" | "incremental";
  batchSize?: number;
  concurrency?: number;
  skipExistingCheck?: boolean;
  onProgress?: (progress: SyncProgress) => void;
};

export interface SyncResult {
  processedCount: number;
  totalRecords: number;
}

export async function syncArtistsToSupabase({
  mode = "bulk",
  batchSize = 50,
  concurrency = 3,
  skipExistingCheck = false,
  onProgress,
}: SyncOptions): Promise<SyncResult> {
  const artistsTable = getArtistsTable();
  let processedCount = 0;
  let totalRecords = 0;
  const errors: SyncError[] = [];

  try {
    // Get existing artists from Supabase if needed
    let existingArtists: Set<string> = new Set();
    if (!skipExistingCheck) {
      const { data: existing } = await supabaseAdmin
        .from("artists")
        .select("id");
      existingArtists = new Set(existing?.map((a) => a.id) || []);
    }

    // Fetch records from Airtable
    const records = await artistsTable.select().all();
    totalRecords = records.length;

    // Process in batches with concurrency limit
    const limit = pLimit(concurrency);
    const batches = [];

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      batches.push(batch);
    }

    await Promise.all(
      batches.map((batch) =>
        limit(async () => {
          try {
            const artistData = await Promise.all(
              batch
                .map(async (record) => {
                  const name = record.get("Artist Name");
                  // Skip records without required fields
                  if (!name) {
                    Logger.warn(
                      `Skipping record ${record.id} - missing artist name`,
                    );
                    return null;
                  }

                  // Handle photo uploads
                  let artistPhotos: StoredAttachment[] = [];
                  const photos = record.get(
                    "Artist Photo",
                  ) as unknown as AirtableAttachment[];
                  if (photos && photos.length > 0) {
                    try {
                      artistPhotos = await Promise.all(
                        photos.map((photo) =>
                          uploadArtistPhotoToSupabase(photo, {
                            artist_name: name as string,
                          }),
                        ),
                      );
                    } catch (error) {
                      Logger.error(
                        `Failed to upload photos for artist ${name}:`,
                        error,
                      );
                    }
                  }

                  return {
                    id: record.id,
                    artist_name: name as string,
                    city: record.get("City") as string,
                    state: record.get("State (USA)") as string,
                    country: record.get("Country") as string,
                    born: record.get("Born") as string,
                    artist_bio: record.get("Artist Bio") as string,
                    artist_photo: artistPhotos,
                    website: record.get("Website") as string,
                    ig_handle: record.get("IG Handle") as string,
                    view_count: (record.get("View Count") as number) || 0,
                    live_in_production: record.get("Add to Website") as boolean,
                  };
                })
                .filter(
                  (artist): artist is NonNullable<typeof artist> =>
                    artist !== null,
                ),
            );

            const validArtistData = artistData.filter(
              (artist): artist is NonNullable<typeof artist> => artist !== null,
            );

            if (validArtistData.length === 0) {
              return; // Skip empty batches
            }

            if (mode === "incremental") {
              // Only insert/update records that don't exist or have changed
              for (const artist of validArtistData) {
                if (!existingArtists.has(artist.id)) {
                  const { error } = await supabaseAdmin
                    .from("artists")
                    .upsert([artist]);
                  if (error) {
                    errors.push({
                      message: error.message,
                      details: `Failed to upsert artist: ${artist.artist_name}`,
                      error: error as PostgrestError,
                    });
                  }
                }
              }
            } else {
              // Bulk mode: Upsert all records
              const { error } = await supabaseAdmin
                .from("artists")
                .upsert(validArtistData);
              if (error) {
                errors.push({
                  message: error.message,
                  details: `Failed to upsert batch of ${validArtistData.length} artists`,
                  error: error as PostgrestError,
                });
              }
            }

            processedCount += validArtistData.length;
            onProgress?.({ current: processedCount, total: totalRecords });
          } catch (error) {
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
