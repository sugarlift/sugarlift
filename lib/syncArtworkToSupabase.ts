import { getArtworkTable } from "./airtable";
import { supabaseAdmin } from "./supabase";
import { createClient } from "@supabase/supabase-js";
import {
  Artwork,
  AirtableAttachment,
  StoredAttachment,
  SyncError,
} from "./types";

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

  // Upload the new file
  const response = await fetch(attachment.url);
  const blob = await response.blob();

  const { error: uploadError } = await supabaseAdmin.storage
    .from("attachments_artwork")
    .upload(storagePath, blob, {
      contentType: attachment.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("Error uploading artwork image:", uploadError);
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage
    .from("attachments_artwork")
    .getPublicUrl(storagePath);

  return {
    url: publicUrl,
    width: attachment.width,
    height: attachment.height,
    filename: attachment.filename,
    type: attachment.type,
  };
}

export async function syncArtworkToSupabase(
  batchSize: number = 5,
  offset?: number,
) {
  // Get or create sync status
  const { data: statusData } = await supabaseAdmin
    .from("sync_status")
    .select("*")
    .eq("type", "artwork")
    .single();

  // Get already synced records by id
  const { data: syncedRecords } = await supabaseAdmin
    .from("artwork")
    .select("id");

  const syncedIds = new Set(syncedRecords?.map((record) => record.id) || []);

  try {
    console.log("Starting sync process...");
    const table = getArtworkTable();

    // Update sync status to in_progress
    await supabaseAdmin.from("sync_status").upsert({
      type: "artwork",
      in_progress: true,
      last_synced_at: new Date().toISOString(),
    });

    // Get records that haven't been synced yet
    const records = await table
      .select({
        maxRecords: batchSize,
        filterByFormula: `NOT({Title} = "")`,
      })
      .firstPage();

    // Filter out already synced records using record.id
    const newRecords = records.filter((record) => !syncedIds.has(record.id));

    console.log(`Found ${newRecords.length} new records to sync`);

    let processedCount = 0;
    const errors: SyncError[] = [];

    // Process records in parallel with controlled concurrency
    await Promise.all(
      newRecords.map(async (record) => {
        try {
          const rawAttachments = record.get("Artwork images");
          const artwork_images: StoredAttachment[] = [];

          if (rawAttachments && Array.isArray(rawAttachments)) {
            for (const att of rawAttachments) {
              const attachment = await uploadArtworkImageToSupabase(att, {
                title: record.get("Title") as string,
              });
              artwork_images.push(attachment);
            }
          }

          const artwork: Artwork = {
            id: record.id,
            title: (record.get("Title") as string) || null,
            artwork_images,
            medium: (record.get("Medium") as string) || null,
            year: record.get("Year") ? Number(record.get("Year")) : null,
            width: (record.get("Width (e.)") as string) || null,
            height: (record.get("Height (e.)") as string) || null,
            live_in_production:
              (record.get("ADD TO PRODUCTION") as boolean) || false,
            artist_name: (record.get("Artist") as string) || null,
            type: (record.get("Type") as string) || null,
            created_at:
              (record.get("created_at") as string) || new Date().toISOString(),
            updated_at:
              (record.get("updated_at") as string) || new Date().toISOString(),
          };

          // Upsert using id as the primary key
          const { error: upsertError } = await supabaseAdmin
            .from("artwork")
            .upsert(artwork);

          if (upsertError) throw upsertError;
          processedCount++;
        } catch (recordError) {
          let errorMessage = "Unknown error";

          // Type check the error
          if (recordError instanceof Error) {
            errorMessage = recordError.message;
          } else if (typeof recordError === "string") {
            errorMessage = recordError;
          } else if (
            recordError &&
            typeof recordError === "object" &&
            "message" in recordError
          ) {
            errorMessage = recordError.message as string;
          }

          errors.push({
            record_id: record.id,
            error: errorMessage,
            timestamp: new Date().toISOString(),
          });
          console.error(`Error processing artwork ${record.id}:`, recordError);
        }
      }),
    );

    // Store errors if any
    if (errors.length > 0) {
      await supabaseAdmin.from("sync_errors").insert(errors);
    }

    // Update sync status
    await supabaseAdmin.from("sync_status").upsert({
      type: "artwork",
      in_progress: false,
      last_synced_at: new Date().toISOString(),
      error: errors.length > 0 ? JSON.stringify(errors) : null,
    });

    // Check if there are more records to process
    const remainingRecords = await table
      .select({
        maxRecords: 1,
        filterByFormula: `NOT({Title} = "")`,
      })
      .firstPage();

    const hasMore =
      remainingRecords.length > 0 && !syncedIds.has(remainingRecords[0].id);

    return {
      success: true,
      processedCount,
      hasMore,
      errors: errors.length > 0 ? errors : null,
    };
  } catch (error) {
    // Get error message with type checking
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error && typeof error === "object" && "message" in error) {
      errorMessage = error.message as string;
    }

    // Update sync status with error
    await supabaseAdmin.from("sync_status").upsert({
      type: "artwork",
      in_progress: false,
      last_synced_at: new Date().toISOString(),
      error: errorMessage,
    });

    console.error("Sync error:", error);
    throw error;
  }
}
