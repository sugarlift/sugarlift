import { getArtworkTable } from "./airtable";
import { supabaseAdmin } from "./supabase";
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

export async function syncArtworkToSupabase() {
  try {
    console.log("Starting sync process...");
    const table = getArtworkTable();

    // Get 5 records without sorting
    const records = await table
      .select({
        maxRecords: 5,
      })
      .firstPage();

    console.log(`Found ${records.length} records to sync`);

    let processedCount = 0;

    // Process each record
    for (const record of records) {
      try {
        const rawAttachments = record.get("Artwork images");
        let artwork_images: StoredAttachment[] = [];

        if (rawAttachments && Array.isArray(rawAttachments)) {
          const airtableAttachments = rawAttachments.map(
            (att: AirtableAttachment) => ({
              id: att.id,
              width: att.width,
              height: att.height,
              url: att.url,
              filename: att.filename,
              type: att.type,
            }),
          );

          artwork_images = await Promise.all(
            airtableAttachments.map((attachment) =>
              uploadArtworkImageToSupabase(attachment, {
                title: record.get("Title") as string,
              }),
            ),
          );
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
        console.error(`Error processing artwork ${record.id}:`, recordError);
        // Continue with next record instead of failing entire batch
      }
    }

    return {
      success: true,
      processedCount,
    };
  } catch (error) {
    console.error("Sync error:", error);
    throw error;
  }
}
