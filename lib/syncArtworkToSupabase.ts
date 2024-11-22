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

export async function syncArtworkToSupabase(limit?: number, offset?: number) {
  try {
    console.log("Starting artwork sync process...");
    const table = getArtworkTable();
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
        const title = record.get("title") as string;
        if (!title) {
          skippedRecords.push({
            id: record.id,
            reason: "Missing title",
            fields: record.fields,
          });
          console.warn(`Skipping record ${record.id} - Missing title`);
          continue;
        }

        const rawAttachments = record.get("artwork_images");
        let artwork_images: StoredAttachment[] = [];

        if (rawAttachments && Array.isArray(rawAttachments)) {
          artwork_images = await Promise.all(
            rawAttachments.map((att: AirtableAttachment) =>
              uploadArtworkImageToSupabase(att, { title }),
            ),
          );
        }

        const artwork: Artwork = {
          id: record.id,
          artist_id: record.get("artist_id") as string,
          first_name: record.get("first_name") as string,
          last_name: record.get("last_name") as string,
          title,
          medium: (record.get("medium") as string) || null,
          width: (record.get("width") as string) || null,
          height: (record.get("height") as string) || null,
          year: record.get("year") ? Number(record.get("year")) : null,
          live_in_production:
            (record.get("live_in_production") as boolean) || false,
          artwork_images,
          created_at:
            (record.get("created_at") as string) || new Date().toISOString(),
          updated_at:
            (record.get("updated_at") as string) || new Date().toISOString(),
        };

        const { error: upsertError } = await supabase
          .from("artwork")
          .upsert(artwork, { onConflict: "id" });

        if (upsertError) {
          throw upsertError;
        }

        processedCount++;
        console.log(
          `Successfully processed ${title} (${processedCount}/${totalCount})`,
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
