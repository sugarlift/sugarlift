import { getArtistsTable } from "./airtable";
import { supabase } from "./supabase";
import { Artist, AirtableAttachment, StoredAttachment } from "./types";

const generateSlug = (name: string) => {
  return name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");
};

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

    const records = await table.select().firstPage();
    console.log(`Found ${records.length} records in Airtable`);

    const skippedRecords = [];
    let processedCount = 0;

    for (const record of records) {
      try {
        const artistName = record.get("Artist Name") as string;
        if (!artistName) {
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

        const { error: upsertError } = await supabase
          .from("artists")
          .upsert(artist);

        if (upsertError) {
          throw upsertError;
        }

        processedCount++;
        console.log(`Successfully processed ${artistName}`);
      } catch (recordError) {
        console.error(`Error processing record ${record.id}:`, recordError);
        skippedRecords.push({
          id: record.id,
          reason: "Processing error",
          error: recordError,
        });
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
