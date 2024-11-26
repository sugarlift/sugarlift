import { getArtistsTable } from "./airtable";
import { supabase } from "./supabase";
import { AirtableAttachment, StoredAttachment, ArtistTable } from "./types";

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

  // Check if file already exists first
  const { data: existingFile } = await supabase.storage
    .from("attachments_artists")
    .getPublicUrl(storagePath);

  if (existingFile.publicUrl) {
    // File exists, return existing data
    return {
      url: existingFile.publicUrl,
      width: attachment.width,
      height: attachment.height,
      filename: attachment.filename,
      type: attachment.type,
    };
  }

  // Only upload if file doesn't exist
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

    // Only get the most recently modified record
    const records = await table
      .select({
        maxRecords: 1,
        sort: [{ field: "Last Modified", direction: "desc" }],
      })
      .firstPage();

    if (records.length === 0) {
      console.log("No records found to sync");
      return { success: true, processedCount: 0, skippedCount: 0 };
    }

    const record = records[0];
    const artistName = record.get("Artist Name") as string;

    if (!artistName) {
      console.warn(`Skipping record ${record.id} - Missing artist name`);
      return {
        success: false,
        processedCount: 0,
        skippedCount: 1,
        skippedRecords: [{ id: record.id, reason: "Missing artist name" }],
      };
    }

    const artist: ArtistTable = {
      id: record.id,
      artist_name: artistName,
      artist_bio: (record.get("Artist Bio") as string) ?? null,
      born: (record.get("Born") as string) ?? null,
      city: (record.get("City") as string) ?? null,
      state: (record.get("State (USA)") as string) ?? null,
      country: (record.get("Country") as string) ?? null,
      ig_handle: (record.get("IG Handle") as string) ?? null,
      website: (record.get("Website") as string) ?? null,
      live_in_production: (record.get("Add to Website") as boolean) || false,
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
    });

    const { error: upsertError } = await supabase
      .from("artists")
      .upsert(artist, {
        onConflict: "id",
        ignoreDuplicates: false,
      });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      throw upsertError;
    }

    console.log(`Successfully processed ${artistName}`);
    return {
      success: true,
      processedCount: 1,
      skippedCount: 0,
    };
  } catch (error) {
    console.error("Sync error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}
