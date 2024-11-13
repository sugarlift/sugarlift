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
  title: string,
): Promise<StoredAttachment> {
  const cleanTitle = title.toLowerCase().replace(/[^a-zA-Z0-9.-]/g, "-");
  const cleanFilename = attachment.filename
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .toLowerCase();
  const storagePath = `${cleanTitle}/${cleanFilename}`;

  console.log("Uploading artwork image:", {
    title,
    filename: attachment.filename,
    storagePath,
  });

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

export async function syncArtworkToSupabase() {
  try {
    console.log("Starting artwork sync process...");

    const table = getArtworkTable();
    console.log("Got artwork table reference");

    const query = table.select();
    console.log("Created query");

    console.log("Fetching records from Airtable...");
    const records = await query.all();
    console.log(`Found ${records.length} artwork records in Airtable`);

    // Create a summary object to track what happened
    const summary = {
      totalRecords: records.length,
      processedRecords: 0,
      errors: [] as string[],
      updatedArtworks: [] as string[],
    };

    // Log the first record structure to debug
    if (records.length > 0) {
      console.log("Sample record structure:", {
        id: records[0].id,
        fields: records[0].fields,
        raw: records[0]._rawJson,
      });
    }

    const { data: existingArtwork, error: fetchError } = await supabase
      .from("artwork")
      .select("id");

    if (fetchError) {
      console.error("Error fetching from Supabase:", fetchError);
      throw fetchError;
    }

    const existingIds = new Set(existingArtwork?.map((a) => a.id) || []);
    const airtableIds = new Set();

    for (const record of records) {
      try {
        // Log the current record being processed
        const recordInfo = {
          id: record.id,
          title: record.get("title"),
          firstName: record.get("first_name"),
          lastName: record.get("last_name"),
        };
        console.log("Processing artwork record:", recordInfo);

        // Find the artist_id based on first_name and last_name
        const firstName = record.get("first_name") as string;
        const lastName = record.get("last_name") as string;

        const { data: artistData, error: artistError } = await supabase
          .from("artists")
          .select("id")
          .eq("first_name", firstName)
          .eq("last_name", lastName)
          .single();

        if (artistError || !artistData) {
          console.error(
            `Artist not found for ${firstName} ${lastName}:`,
            artistError,
          );
          continue;
        }

        console.log("Found artist:", artistData);

        const rawAttachments = record.get("artwork_images");
        let artwork_images: StoredAttachment[] = [];

        if (rawAttachments && Array.isArray(rawAttachments)) {
          console.log("Processing artwork images:", rawAttachments.length);

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

          artwork_images = await Promise.all(
            airtableAttachments.map((attachment) =>
              uploadArtworkImageToSupabase(
                attachment,
                record.get("title") as string,
              ),
            ),
          );
        }

        const artwork: Artwork = {
          id: record.id,
          artist_id: artistData.id,
          title: record.get("title") as string,
          medium: record.get("medium") as string,
          year: record.get("year") as number,
          live_in_production:
            (record.get("live_in_production") as boolean) || false,
          artwork_images,
          created_at: record.get("created_at") as string,
          updated_at: record.get("updated_at") as string,
        };

        console.log("Upserting artwork:", artwork);

        const { error: upsertError } = await supabase
          .from("artwork")
          .upsert(artwork, { onConflict: "id" });

        if (upsertError) {
          console.error("Error upserting artwork:", artwork.title, upsertError);
          throw upsertError;
        }

        console.log("Successfully upserted artwork:", artwork.title);
        summary.processedRecords++;
        summary.updatedArtworks.push(artwork.title);
        airtableIds.add(record.id);
      } catch (recordError) {
        const syncError = recordError as SyncError;
        const errorMessage = `Error processing record ${record.id}: ${syncError.message}`;
        console.error(errorMessage);
        summary.errors.push(errorMessage);
      }
    }

    // Handle obsolete records
    const idsToUnpublish = [...existingIds].filter(
      (id) => !airtableIds.has(id),
    );
    if (idsToUnpublish.length > 0) {
      console.log(`Unpublishing ${idsToUnpublish.length} obsolete artworks...`);
      const { error: unpublishError } = await supabase
        .from("artwork")
        .update({ live_in_production: false })
        .in("id", idsToUnpublish);

      if (unpublishError) {
        console.error("Error unpublishing artwork records:", unpublishError);
        throw unpublishError;
      }
    }

    console.log("Artwork sync completed successfully");
    return {
      success: true,
      summary,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const syncError = error as SyncError;
    console.error("Artwork sync error:", {
      message: syncError.message || "Unknown error",
      stack: syncError.stack,
      error: syncError,
    });

    return {
      success: false,
      error: syncError.message || "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}
