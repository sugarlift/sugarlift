import { getArtistsTable } from "./airtable";
import { supabase } from "./supabase";
import {
  Artist,
  AirtableAttachment,
  StoredAttachment,
  SyncError,
} from "./types";

async function uploadAttachmentToSupabase(
  attachment: AirtableAttachment,
  artist: { artist_name: string },
): Promise<StoredAttachment> {
  const folderName = artist.artist_name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, "-");
  const cleanFilename = attachment.filename
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .toLowerCase();
  const storagePath = `${folderName}/${cleanFilename}`;

  // Upload the new file
  const response = await fetch(attachment.url);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from("attachments_artists")
    .upload(storagePath, blob, {
      contentType: attachment.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("Error uploading attachment:", uploadError);
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("attachments_artists").getPublicUrl(storagePath);

  return {
    url: publicUrl,
    width: attachment.width,
    height: attachment.height,
    filename: attachment.filename,
    type: attachment.type,
  };
}

export async function syncAirtableToSupabase() {
  try {
    console.log("Starting sync process...");

    // Get all records from Airtable
    console.log("Fetching records from Airtable...");
    const table = getArtistsTable();

    console.log("Selecting records...");
    const query = table.select();

    console.log("Fetching all records...");
    const records = await query.all();
    console.log(`Found ${records.length} records in Airtable`);

    // Get all existing artists from Supabase for comparison
    console.log("Fetching existing artists from Supabase...");
    const { data: existingArtists, error: fetchError } = await supabase
      .from("artists")
      .select("id");

    if (fetchError) {
      console.error("Error fetching from Supabase:", fetchError);
      throw fetchError;
    }

    const existingIds = new Set(existingArtists?.map((a) => a.id) || []);
    const airtableIds = new Set();

    // Sync all records from Airtable
    console.log("Starting record sync...");
    for (const record of records) {
      try {
        console.log("Record structure:", record._rawJson);

        const rawAttachments = record.get("artist_photo");
        let attachments: StoredAttachment[] = [];

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

          // Upload all new attachments
          attachments = await Promise.all(
            airtableAttachments.map((attachment) =>
              uploadAttachmentToSupabase(attachment, {
                artist_name: record.get("Artist Name") as string,
              }),
            ),
          );
        }

        const artist: Artist = {
          id: record.id,
          artist_name: record.get("Artist Name") as string,
          artist_bio: record.get("Artist Bio") as string,
          born: record.get("Born") as string,
          city: record.get("City") as string,
          state: record.get("State") as string,
          country: record.get("Country") as string,
          ig_handle: record.get("IG Handle") as string,
          website: record.get("Website") as string,
          live_in_production:
            (record.get("Add to Website") as boolean) || false,
          artist_photo: attachments,
        };

        console.log("Processing artist:", artist);
        airtableIds.add(record.id);

        const { error: upsertError } = await supabase
          .from("artists")
          .upsert(artist, { onConflict: "id" });

        if (upsertError) {
          console.error(
            "Error upserting artist:",
            artist.artist_name,
            upsertError,
          );
          throw upsertError;
        }
      } catch (recordError) {
        const syncError = recordError as SyncError;
        syncError.record = { id: record.id, fields: record.fields };
        console.error("Error processing record:", record.id, syncError);
        throw syncError;
      }
    }

    // Set live_in_production to false for records that no longer exist in Airtable
    const idsToUnpublish = [...existingIds].filter(
      (id) => !airtableIds.has(id),
    );
    if (idsToUnpublish.length > 0) {
      console.log(`Unpublishing ${idsToUnpublish.length} obsolete records...`);
      const { error: unpublishError } = await supabase
        .from("artists")
        .update({ live_in_production: false })
        .in("id", idsToUnpublish);

      if (unpublishError) {
        console.error("Error unpublishing records:", unpublishError);
        throw unpublishError;
      }
    }

    console.log("Sync completed successfully");
  } catch (error) {
    const syncError = error as SyncError;
    console.error("Sync error:", {
      message: syncError.message || "Unknown error",
      stack: syncError.stack,
      error: syncError,
    });
    throw syncError;
  }
}
