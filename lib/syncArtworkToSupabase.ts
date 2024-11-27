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

  if (statusData?.in_progress) {
    console.log("Sync already in progress, skipping...");
    return { success: false, message: "Sync already in progress" };
  }

  try {
    console.log("Starting sync process...");
    const table = getArtworkTable();

    // Update sync status to in_progress
    await supabaseAdmin.from("sync_status").upsert({
      type: "artwork",
      in_progress: true,
      last_synced_at: new Date().toISOString(),
      offset: offset?.toString(), // Convert to string for storage
    });

    // Get records with pagination
    const records = await table
      .select({
        pageSize: batchSize,
        offset: offset, // Now correctly typed as number
      })
      .firstPage();

    console.log(`Found ${records.length} records to sync`);

    let processedCount = 0;
    const errors: SyncError[] = [];

    // Process records in parallel with controlled concurrency
    await Promise.all(
      records.map(async (record) => {
        try {
          const rawAttachments = record.get("Artwork images");
          const artwork_images: StoredAttachment[] = [];

          if (rawAttachments && Array.isArray(rawAttachments)) {
            // Process images sequentially to avoid overwhelming the system
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

          const { error: upsertError } = await supabaseAdmin
            .from("artwork")
            .upsert(artwork, { onConflict: "id" });

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

    // Update sync status with numeric offset converted to string
    await supabaseAdmin.from("sync_status").upsert({
      type: "artwork",
      in_progress: false,
      last_synced_at: new Date().toISOString(),
      offset:
        records.length === batchSize
          ? ((offset || 0) + records.length).toString()
          : null, // Store offset as string
      error: errors.length > 0 ? JSON.stringify(errors) : null,
    });

    return {
      success: true,
      processedCount,
      hasMore: records.length === batchSize,
      nextOffset:
        records.length === batchSize ? (offset || 0) + records.length : null, // Return numeric offset
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
