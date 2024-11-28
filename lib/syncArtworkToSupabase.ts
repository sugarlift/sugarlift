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
    console.log("Starting artwork sync process...");
    const table = getArtworkTable();

    // Get existing records from Supabase to compare timestamps
    const { data: existingArtworks, error: fetchError } = await supabaseAdmin
      .from("artwork")
      .select("id, updated_at")
      .eq("live_in_production", true);

    if (fetchError) throw fetchError;

    // Create a map of existing artworks with their last update time
    const existingArtworksMap = new Map(
      existingArtworks?.map((artwork) => [
        artwork.id,
        new Date(artwork.updated_at),
      ]) || [],
    );

    // Get all records that are marked for production from Airtable
    const records = await table
      .select({
        filterByFormula: "{ADD TO PRODUCTION} = 1",
      })
      .all();

    console.log(`Found ${records.length} artwork records to process`);

    let processedCount = 0;
    const errors: SyncError[] = [];

    // Process each record
    for (const record of records) {
      try {
        const recordId = record.id;
        const lastModified = new Date(record.get("Last Modified") as string);

        // Skip if record exists and hasn't been modified since last sync
        const existingLastUpdate = existingArtworksMap.get(recordId);
        if (existingLastUpdate && lastModified <= existingLastUpdate) {
          console.log(`Skipping unchanged artwork: ${recordId}`);
          continue;
        }

        console.log(`Processing artwork: ${recordId} - ${record.get("Title")}`);

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
          id: record.id,
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
          updated_at: lastModified.toISOString(), // Use Airtable's last modified time
        };

        // Upsert to Supabase
        const { error: upsertError } = await supabaseAdmin
          .from("artwork")
          .upsert(artwork);

        if (upsertError) throw upsertError;

        processedCount++;
        console.log(`Successfully processed artwork: ${artwork.title}`);
      } catch (error) {
        console.error(`Error processing artwork ${record.id}:`, error);
        errors.push({
          record_id: record.id,
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
    console.error("Artwork sync error:", error);
    throw error;
  }
}
