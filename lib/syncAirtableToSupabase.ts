import { getArtistsTable } from "./airtable";
import { supabase } from "./supabase";
import { Artist, AirtableAttachment, StoredAttachment } from "./types";

const generateSlug = (name: string) => {
  return name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");
};

const BATCH_SIZE = 1;
const BATCH_DELAY = 1000;
const RECORDS_PER_PAGE = 10;

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

  const { data: existingFile } = await supabase.storage
    .from("attachments_artists")
    .getPublicUrl(storagePath);

  if (existingFile.publicUrl) {
    return {
      url: existingFile.publicUrl,
      width: attachment.width,
      height: attachment.height,
      filename: attachment.filename,
      type: attachment.type,
    };
  }

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

    const query = table.select({
      pageSize: RECORDS_PER_PAGE,
      sort: [{ field: "Last Modified", direction: "desc" }],
    });

    const records = await query.firstPage();
    console.log(`Found ${records.length} records in current page`);

    const batches = [];
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      batches.push(records.slice(i, i + BATCH_SIZE));
    }
    console.log(
      `Split records into ${batches.length} batches of ${BATCH_SIZE}`,
    );

    const skippedRecords = [];
    let processedCount = 0;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(
        `Processing batch ${batchIndex + 1}/${batches.length} (${new Date().toISOString()})`,
      );

      for (const record of batch) {
        const startTime = Date.now();
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
            slug: generateSlug(artistName),
          };

          const rawAttachments = record.get("Artist Photo");
          if (rawAttachments && Array.isArray(rawAttachments)) {
            artist.artist_photo = await Promise.all(
              rawAttachments.map((att: AirtableAttachment) =>
                uploadAttachmentToSupabase(att, { artist_name: artistName }),
              ),
            );
          }

          console.log("Attempting to upsert artist:", {
            id: artist.id,
            name: artist.artist_name,
            photoCount: artist.artist_photo.length,
          });

          const { error: upsertError, data: upsertData } = await supabase
            .from("artists")
            .upsert(artist, {
              onConflict: "id",
              returning: "minimal",
            });

          if (upsertError) {
            console.error("Supabase upsert error details:", {
              error: upsertError,
              errorMessage: upsertError.message,
              errorDetails: upsertError.details,
              errorHint: upsertError.hint,
              errorCode: upsertError.code,
              artist: {
                id: artist.id,
                name: artist.artist_name,
              },
            });
            throw upsertError;
          }

          console.log(`Successfully upserted artist ${artist.artist_name}`);

          processedCount++;
          console.log(
            `Processed ${artistName} in ${Date.now() - startTime}ms (${processedCount}/${records.length})`,
          );
        } catch (recordError) {
          console.error(
            `Error processing record ${record.id} after ${Date.now() - startTime}ms:`,
            recordError,
          );
          skippedRecords.push({
            id: record.id,
            reason: "Processing error",
            fields: record.fields,
            error: recordError,
          });
        }
      }

      if (batchIndex < batches.length - 1) {
        console.log(`Waiting ${BATCH_DELAY}ms before next batch...`);
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
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
