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

export async function syncAirtableToSupabase(limit?: number, offset?: number) {
  try {
    console.log("Starting sync process...");
    const table = getArtistsTable();
    console.log("Successfully connected to Airtable table");

    const query = table.select();
    console.log("Created Airtable query");

    const records = await query.all();
    const totalCount = records.length;
    console.log(`Found ${totalCount} records in Airtable`);

    // Use provided limit or default to 1
    const BATCH_SIZE = limit || 1;
    // Use provided offset or default to 0
    const startIndex = offset || 0;
    const endIndex = Math.min(startIndex + BATCH_SIZE, records.length);

    // Get only the records for this batch
    const batchRecords = records.slice(startIndex, endIndex);
    console.log(
      `Processing records ${startIndex + 1} to ${endIndex} of ${totalCount}`,
    );

    const skippedRecords = [];
    let processedCount = 0;

    // Process records in this batch
    for (const record of batchRecords) {
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
          `Successfully processed ${artistName} (${processedCount}/${totalCount})`,
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

    // Add delay if there are more records to process
    if (endIndex < totalCount) {
      console.log("Waiting before next batch...");
      await new Promise((resolve) => setTimeout(resolve, 4000));
    }

    console.log("Batch completed successfully");
    return {
      success: true,
      processedCount,
      skippedCount: skippedRecords.length,
      skippedRecords,
      remainingCount: totalCount - endIndex,
      totalCount,
      nextOffset: endIndex < totalCount ? endIndex : null,
    };
  } catch (error) {
    console.error("Sync error:", error);
    throw error;
  }
}
