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

    // Test Airtable connection
    const table = getArtistsTable();
    console.log("Successfully connected to Airtable table");

    const query = table.select();
    console.log("Created Airtable query");

    const records = await query.all();
    console.log(
      `Found ${records.length} records in Airtable:`,
      records.map((r) => ({
        id: r.id,
        name: r.get("Artist Name"),
        addToWebsite: r.get("Add to Website"),
      })),
    );

    const { data: existingArtists, error: fetchError } = await supabase
      .from("artists")
      .select("id");

    if (fetchError) {
      console.error("Error fetching from Supabase:", fetchError);
      throw fetchError;
    }

    const existingIds = new Set(existingArtists?.map((a) => a.id) || []);
    const airtableIds = new Set();
    const skippedRecords = [];

    // Sync all records from Airtable
    console.log("Starting record sync...");
    for (const record of records) {
      try {
        const firstName = record.get("first_name") as string;
        const lastName = record.get("last_name") as string;
        const artistName =
          firstName && lastName ? `${firstName} ${lastName}` : null;

        // Skip records with missing artist name
        if (!artistName) {
          skippedRecords.push({
            id: record.id,
            reason: "Missing artist name",
            fields: record.fields,
          });
          console.warn(`Skipping record ${record.id} - Missing artist name`);
          continue;
        }

        const artist: Artist = {
          id: record.id,
          artist_name: artistName,
          artist_bio: record.get("biography") as string,
          born: record.get("year_of_birth") as string,
          city: record.get("location") as string,
          state: "",
          country: "",
          ig_handle: record.get("instagram_url") as string,
          website: record.get("website_url") as string,
          live_in_production:
            (record.get("live_in_production") as boolean) || false,
          artist_photo: [],
        };

        // Handle attachments
        const rawAttachments = record.get("attachments");
        if (rawAttachments && Array.isArray(rawAttachments)) {
          artist.artist_photo = await Promise.all(
            rawAttachments.map((att: AirtableAttachment) =>
              uploadAttachmentToSupabase(att, { artist_name: artistName }),
            ),
          );
        }

        airtableIds.add(record.id);

        console.log("Attempting to upsert artist:", {
          id: artist.id,
          name: artist.artist_name,
          live: artist.live_in_production,
        });

        const { error: upsertError } = await supabase
          .from("artists")
          .upsert(artist, {
            onConflict: "id",
          });

        if (upsertError) {
          console.error("Upsert error:", upsertError);
          throw upsertError;
        } else {
          console.log("Successfully upserted artist:", artist.artist_name);
        }
      } catch (recordError) {
        const syncError = recordError as SyncError;
        syncError.record = { id: record.id, fields: record.fields };
        console.error("Error processing record:", record.id, syncError);
        throw syncError;
      }
    }

    // Log summary of skipped records
    if (skippedRecords.length > 0) {
      console.warn(`Skipped ${skippedRecords.length} records:`, skippedRecords);
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

    return {
      success: true,
      processedCount: records.length - skippedRecords.length,
      skippedCount: skippedRecords.length,
      skippedRecords,
    };
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
