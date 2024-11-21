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
    const table = getArtistsTable();
    console.log("Successfully connected to Airtable table");

    const query = table.select();
    console.log("Created Airtable query");

    const records = await query.all();
    console.log(`Found ${records.length} records in Airtable`);

    // Batch size configuration
    const BATCH_SIZE = 5;
    const batches = [];
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      batches.push(records.slice(i, i + BATCH_SIZE));
    }
    console.log(
      `Split records into ${batches.length} batches of ${BATCH_SIZE}`,
    );

    const skippedRecords = [];
    let processedCount = 0;

    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Processing batch ${batchIndex + 1}/${batches.length}`);

      // Process records in the current batch
      for (const record of batch) {
        try {
          const artistName = record.get("Artist Name") as string;
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
            artist_bio: record.get("Artist Bio") as string,
            born: record.get("Born") as string,
            city: record.get("City") as string,
            state: record.get("State (USA)") as string,
            country: record.get("Country") as string,
            ig_handle: record.get("IG Handle") as string,
            website: record.get("Website") as string,
            live_in_production:
              (record.get("Add to Website") as boolean) || false,
            artist_photo: [],
          };

          const rawAttachments = record.get("Artist Photo");
          if (rawAttachments && Array.isArray(rawAttachments)) {
            artist.artist_photo = await Promise.all(
              rawAttachments.map((att: AirtableAttachment) =>
                uploadAttachmentToSupabase(att, { artist_name: artistName }),
              ),
            );
          }

          const { error: upsertError } = await supabase
            .from("artists")
            .upsert(artist, { onConflict: "id" });

          if (upsertError) {
            throw upsertError;
          }

          processedCount++;
          console.log(
            `Successfully processed ${artistName} (${processedCount}/${records.length})`,
          );
        } catch (recordError) {
          console.error(`Error processing record ${record.id}:`, recordError);
          skippedRecords.push({
            id: record.id,
            reason: "Processing error",
            fields: record.fields,
            error: recordError,
          });
        }
      }

      // Add a small delay between batches to prevent rate limiting
      if (batchIndex < batches.length - 1) {
        console.log("Waiting before processing next batch...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log("Sync completed successfully");
    return {
      success: true,
      processedCount,
      skippedCount: skippedRecords.length,
      skippedRecords,
    };
  } catch (error) {
    console.error("Sync error:", error);
    throw error;
  }
}
