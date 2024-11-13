import { getArtworkTable } from "./airtable";
import { supabase } from "./supabase";
import {
  Artwork,
  AirtableAttachment,
  StoredAttachment,
  SyncError,
} from "./types";

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

    // Log the first record for debugging
    if (records.length > 0) {
      const firstRecord = records[0];
      console.log("Sample record:", {
        id: firstRecord.id,
        fields: firstRecord.fields,
      });
    }

    for (const record of records) {
      try {
        // Create a basic artwork record without images or artist relationship
        const artwork: Artwork = {
          id: record.id,
          artist_id: "placeholder", // We'll fix this later
          title: record.get("title") as string,
          medium: (record.get("medium") as string) || null,
          year: record.get("year") ? Number(record.get("year")) : null,
          live_in_production: true,
          artwork_images: [], // Skip image processing for now
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log("Attempting to upsert artwork:", {
          id: artwork.id,
          title: artwork.title,
        });

        const { error: upsertError } = await supabase
          .from("artwork")
          .upsert(artwork, { onConflict: "id" });

        if (upsertError) {
          console.error("Error upserting artwork:", {
            title: artwork.title,
            error: upsertError,
          });
          throw upsertError;
        }

        console.log("Successfully upserted artwork:", artwork.title);
      } catch (recordError) {
        console.error("Error processing record:", {
          id: record.id,
          error: recordError,
        });
      }
    }

    console.log("Artwork sync completed");
    return { success: true };
  } catch (error) {
    console.error("Sync error:", error);
    return { success: false, error };
  }
}
