import { getArtistsTable } from "./airtable";
import { supabaseAdmin } from "./supabase";
import { AirtableAttachment, StoredAttachment } from "./types";

async function uploadArtistPhotoToSupabase(
  attachment: AirtableAttachment,
  artistName: string,
): Promise<StoredAttachment> {
  const folderName = artistName.toLowerCase().replace(/[^a-zA-Z0-9.-]/g, "-");
  const cleanFilename = attachment.filename
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .toLowerCase();
  const storagePath = `${folderName}/${cleanFilename}`;

  // Upload the new file
  const response = await fetch(attachment.url);
  const blob = await response.blob();

  const { error: uploadError } = await supabaseAdmin.storage
    .from("attachments_artists")
    .upload(storagePath, blob, {
      contentType: attachment.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("Error uploading artist photo:", uploadError);
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage
    .from("attachments_artists")
    .getPublicUrl(storagePath);

  return {
    url: publicUrl,
    width: attachment.width,
    height: attachment.height,
    filename: attachment.filename,
    type: attachment.type,
  };
}

export async function syncAirtableToSupabase(batchNumber = 1) {
  try {
    console.log(`Starting sync process for batch ${batchNumber}...`);
    const table = getArtistsTable();

    const BATCH_SIZE = 5;
    const offset = (batchNumber - 1) * BATCH_SIZE;

    // Get records for this batch
    console.log(`Fetching records from Airtable (offset: ${offset})`);
    const records = await table
      .select({
        maxRecords: BATCH_SIZE,
        offset, // Skip previous batches
        sort: [{ field: "Last Modified", direction: "desc" }],
        fields: [
          "Artist Name",
          "Artist Photo",
          "Artist Bio",
          "Born",
          "City",
          "State (USA)",
          "Country",
          "IG Handle",
          "Website",
          "Add to Website",
        ],
      })
      .firstPage();

    // Check if there might be more records
    const hasMore = records.length === BATCH_SIZE;

    if (records.length === 0) {
      console.log("No records found to sync in this batch");
      return { success: true, processedCount: 0, hasMore: false };
    }

    let processedCount = 0;

    // Process each record
    for (const record of records) {
      try {
        // More detailed logging
        console.log("Record details:", {
          id: record.id,
          fields: record.fields,
          rawJson: record._rawJson,
          photoField: record._rawJson.fields["Artist Photo"],
          hasPhoto: "Artist Photo" in record._rawJson.fields,
        });

        // Try both methods of accessing the photo
        const photoMethod1 = record.get("Artist Photo");
        const photoMethod2 = record.fields["Artist Photo"];

        console.log("Photo access attempts:", {
          usingGet: photoMethod1,
          usingFields: photoMethod2,
          typeGet: typeof photoMethod1,
          typeFields: typeof photoMethod2,
        });

        // Log the artist photo data with more detail
        const rawPhotos = record.get("Artist Photo");
        console.log("Raw Artist Photo data:", {
          value: rawPhotos,
          type: typeof rawPhotos,
          fieldExists: record.fields.hasOwnProperty("Artist Photo"),
          allFields: Object.keys(record.fields),
        });

        let artist_photo: StoredAttachment[] = [];

        if (rawPhotos && Array.isArray(rawPhotos)) {
          const airtableAttachments = rawPhotos.map(
            (att: AirtableAttachment) => ({
              id: att.id,
              width: att.width,
              height: att.height,
              url: att.url,
              filename: att.filename,
              type: att.type,
            }),
          );

          artist_photo = await Promise.all(
            airtableAttachments.map((attachment) =>
              uploadArtistPhotoToSupabase(
                attachment,
                record.get("Artist Name") as string,
              ),
            ),
          );
        }

        // Create artist record with photos
        const artist = {
          id: record.id,
          artist_name:
            (record.get("Artist Name") as string) || "Unknown Artist",
          artist_bio: (record.get("Artist Bio") as string) || null,
          born: (record.get("Born") as string) || null,
          city: (record.get("City") as string) || null,
          state: (record.get("State (USA)") as string) || null,
          country: (record.get("Country") as string) || null,
          ig_handle: (record.get("IG Handle") as string) || null,
          website: (record.get("Website") as string) || null,
          live_in_production: Boolean(record.get("Add to Website")),
          artist_photo, // Now includes the uploaded photos
        };

        console.log("Attempting to upsert artist:", {
          id: artist.id,
          name: artist.artist_name,
          photoCount: artist_photo.length,
        });

        const { data, error } = await supabaseAdmin
          .from("artists")
          .upsert(artist, {
            onConflict: "id",
          });

        if (error) {
          console.error("Upsert failed:", {
            error,
            errorMessage: error.message,
            details: error.details,
          });
          throw error;
        }

        console.log("Upsert successful:", data);
        processedCount++;
      } catch (error) {
        console.error(`Error processing artist ${record.id}:`, error);
        // Continue with next record instead of failing entire batch
      }
    }

    return {
      success: true,
      processedCount,
      hasMore,
      batchNumber,
    };
  } catch (error) {
    console.error("Sync failed:", error);
    throw error;
  }
}
