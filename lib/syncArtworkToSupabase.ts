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

export async function syncArtworkToSupabase(recordIds?: string[]) {
  try {
    console.log("Starting sync process...");
    const table = getArtworkTable();

    let query;
    if (recordIds && recordIds.length > 0) {
      // If specific records are provided (e.g., from webhook)
      query = table.select({
        filterByFormula: `OR(${recordIds.map((id) => `RECORD_ID()='${id}'`).join(",")})`,
      });
    } else {
      // Fallback to recent records for manual sync
      query = table.select({
        maxRecords: 10,
        sort: [{ field: "Last Modified", direction: "desc" }],
      });
    }

    const records = await query.firstPage();
    console.log(`Processing ${records.length} records`);

    // Rest of your sync logic...
  } catch (error) {
    // Error handling...
  }
}
