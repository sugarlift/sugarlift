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

  const response = await fetch(attachment.url);
  const blob = await response.blob();

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

    // Get all records that are marked for production and have a Record_ID
    const records = await table
      .select({
        filterByFormula: `
          AND(
            {ADD TO PRODUCTION} = 1,
            NOT({Record_ID} = ''),
            OR(
              {Synced} = '',
              {Synced} = 0,
              IS_BEFORE({Last Modified}, NOW())
            )
          )
        `,
      })
      .all();

    console.log(`Found ${records.length} records to sync`);

    let processedCount = 0;
    const errors: SyncError[] = [];

    // Process each record
    for (const record of records) {
      try {
        console.log(
          `Processing record with Record_ID: ${record.get("Record_ID")}`,
        );

        // Process images
        const rawAttachments = record.get("Artwork images");
        const artwork_images: StoredAttachment[] = [];

        if (Array.isArray(rawAttachments)) {
          for (const att of rawAttachments) {
            const attachment = await uploadArtworkImageToSupabase(att, {
              title: record.get("Title") as string,
            });
            artwork_images.push(attachment);
          }
        }

        // Create artwork object
        const artwork: Artwork = {
          id: record.get("Record_ID") as string,
          title: (record.get("Title") as string) || null,
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

        // Upsert to Supabase using the Record_ID as the key
        const { error: upsertError } = await supabaseAdmin
          .from("artwork")
          .upsert(artwork, {
            onConflict: "id",
          });

        if (upsertError) throw upsertError;

        // Mark record as synced in Airtable
        await table.update([
          {
            id: record.id,
            fields: {
              Synced: true,
            },
          },
        ]);

        processedCount++;
        console.log(`Successfully processed: ${artwork.title}`);
      } catch (error) {
        console.error(
          `Error processing artwork ${record.get("Record_ID")}:`,
          error,
        );
        errors.push({
          record_id: record.get("Record_ID") as string,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        });
      }
    }

    return {
      success: true,
      processedCount,
      total: records.length,
      errors: errors.length > 0 ? errors : null,
    };
  } catch (error) {
    console.error("Sync error:", error);
    throw error;
  }
}
