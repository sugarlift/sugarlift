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
  artist: { first_name: string; last_name: string },
  index: number,
): Promise<StoredAttachment> {
  const folderName = `${artist.first_name.toLowerCase()}-${artist.last_name.toLowerCase()}`;
  const timestamp = Date.now();
  const fileExtension = attachment.filename.split(".").pop();
  const uniqueFilename = `${folderName}-profile-${index + 1}-${timestamp}.${fileExtension}`;
  const storagePath = `${folderName}/${uniqueFilename}`;

  // List existing files in the artist's folder
  const { data: existingFiles } = await supabase.storage
    .from("attachments_artists")
    .list(folderName);

  // If there are existing files for this index, we'll remove them
  const oldFile = existingFiles?.find((file) =>
    file.name.includes(`-profile-${index + 1}-`),
  );

  if (oldFile) {
    await supabase.storage
      .from("attachments_artists")
      .remove([`${folderName}/${oldFile.name}`]);
  }

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

// In the main sync function, add a cleanup step
async function cleanupUnusedFiles(
  artist: { first_name: string; last_name: string },
  currentImageCount: number,
) {
  const folderName = `${artist.first_name.toLowerCase()}-${artist.last_name.toLowerCase()}`;

  const { data: existingFiles } = await supabase.storage
    .from("attachments_artists")
    .list(folderName);

  if (!existingFiles) return;

  // Find files with index greater than our current count
  const filesToRemove = existingFiles
    .filter((file) => {
      const match = file.name.match(/-profile-(\d+)-/);
      if (!match) return false;
      const fileIndex = parseInt(match[1]);
      return fileIndex > currentImageCount;
    })
    .map((file) => `${folderName}/${file.name}`);

  if (filesToRemove.length > 0) {
    await supabase.storage.from("attachments_artists").remove(filesToRemove);
  }
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

        const rawAttachments = record.get("attachments");
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

          attachments = await Promise.all(
            airtableAttachments.map((attachment, index) =>
              uploadAttachmentToSupabase(
                attachment,
                {
                  first_name: record.get("first_name") as string,
                  last_name: record.get("last_name") as string,
                },
                index,
              ),
            ),
          );

          // Clean up any old files that are no longer needed
          await cleanupUnusedFiles(
            {
              first_name: record.get("first_name") as string,
              last_name: record.get("last_name") as string,
            },
            airtableAttachments.length,
          );
        }

        const artist: Artist = {
          id: record.id,
          first_name: record.get("first_name") as string,
          last_name: record.get("last_name") as string,
          biography: record.get("biography") as string,
          live_in_production:
            (record.get("live_in_production") as boolean) || false,
          attachments,
        };

        console.log("Processing artist:", artist);
        airtableIds.add(record.id);

        const { error: upsertError } = await supabase
          .from("artists")
          .upsert(artist, { onConflict: "id" });

        if (upsertError) {
          console.error(
            "Error upserting artist:",
            artist.first_name,
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
