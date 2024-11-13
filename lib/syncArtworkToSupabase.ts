import { getArtworkTable } from "./airtable";
import { supabase } from "./supabase";
import {
  Artwork,
  AirtableAttachment,
  StoredAttachment,
  SyncError,
} from "./types";

async function uploadArtworkImageToSupabase(
  attachment: AirtableAttachment,
  title: string,
): Promise<StoredAttachment> {
  const cleanTitle = title.toLowerCase().replace(/[^a-zA-Z0-9.-]/g, "-");
  const cleanFilename = attachment.filename
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .toLowerCase();
  const storagePath = `${cleanTitle}/${cleanFilename}`;

  // Upload the new file
  const response = await fetch(attachment.url);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from("artwork_images")
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
  } = supabase.storage.from("artwork_images").getPublicUrl(storagePath);

  return {
    url: publicUrl,
    width: attachment.width,
    height: attachment.height,
    filename: attachment.filename,
    type: attachment.type,
  };
}

export async function syncArtworkToSupabase() {
  try {
    console.log("Starting artwork sync process...");

    const table = getArtworkTable();
    console.log("Got artwork table reference");

    const query = table.select();
    console.log("Created query");

    console.log("Fetching records from Airtable...");
    const records = await query.all();
    console.log(`Found ${records.length} artwork records in Airtable`);

    for (const record of records) {
      try {
        // Get artist_id from Airtable
        const artist_id = record.get("artist_id") as string;
        if (!artist_id) {
          console.error("Missing artist_id for artwork:", record.get("title"));
          continue;
        }

        // Handle artwork images if they exist
        let artwork_images: StoredAttachment[] = [];
        const rawImages = record.get("artwork_images");

        if (rawImages && Array.isArray(rawImages)) {
          console.log("Found images for artwork:", rawImages.length);

          // Upload all new attachments
          artwork_images = await Promise.all(
            rawImages.map((attachment: AirtableAttachment) =>
              uploadArtworkImageToSupabase(
                attachment,
                record.get("title") as string,
              ),
            ),
          );

          console.log("Processed and uploaded images:", artwork_images.length);
        }

        // Create artwork record
        const artwork: Artwork = {
          id: record.id,
          artist_id,
          title: record.get("title") as string,
          medium: (record.get("medium") as string) || null,
          year: record.get("year") ? Number(record.get("year")) : null,
          live_in_production: true,
          artwork_images,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log("Attempting to upsert artwork:", {
          id: artwork.id,
          title: artwork.title,
          artist_id: artwork.artist_id,
          imageCount: artwork_images.length,
        });

        // First try to delete any existing record
        const { error: deleteError } = await supabase
          .from("artwork")
          .delete()
          .eq("id", artwork.id);

        if (deleteError) {
          console.error("Error deleting existing artwork:", {
            id: artwork.id,
            error: deleteError,
          });
        }

        // Then insert the new record
        const { error: insertError } = await supabase
          .from("artwork")
          .insert([artwork]);

        if (insertError) {
          console.error("Error inserting artwork:", {
            title: artwork.title,
            error: insertError,
          });
          throw insertError;
        }

        console.log("Successfully inserted artwork:", {
          title: artwork.title,
          artist_id: artwork.artist_id,
          images: artwork_images.length,
        });
      } catch (recordError) {
        console.error("Error processing record:", {
          id: record.id,
          error: recordError,
        });
      }
    }

    console.log("Artwork sync completed");
    return { success: true };
  } catch (error) {
    console.error("Sync error:", error);
    return { success: false, error };
  }
}
