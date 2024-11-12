import { airtable } from "./airtable";
import { supabase } from "./supabase";
import { Artist } from "./types";

export async function syncAirtableToSupabase() {
  try {
    console.log("Starting sync process...");

    // Get all records from Airtable
    console.log("Fetching records from Airtable...");
    const records = await airtable("Artists").select().all();
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
        const artist: Artist = {
          id: record.id,
          name: record.get("Name") as string,
          biography: record.get("Biography") as string,
          instagram: record.get("Instagram Handle") as string,
        };

        console.log("Processing artist:", artist.name);
        airtableIds.add(record.id);

        const { error: upsertError } = await supabase
          .from("artists")
          .upsert(artist, { onConflict: "id" });

        if (upsertError) {
          console.error("Error upserting artist:", artist.name, upsertError);
          throw upsertError;
        }
      } catch (recordError) {
        console.error("Error processing record:", record.id, recordError);
        throw recordError;
      }
    }

    // Delete records that exist in Supabase but not in Airtable
    const idsToDelete = [...existingIds].filter((id) => !airtableIds.has(id));
    if (idsToDelete.length > 0) {
      console.log(`Deleting ${idsToDelete.length} obsolete records...`);
      const { error: deleteError } = await supabase
        .from("artists")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) {
        console.error("Error deleting records:", deleteError);
        throw deleteError;
      }
    }

    console.log("Sync completed successfully");
  } catch (error) {
    console.error("Sync error:", {
      message: error.message,
      stack: error.stack,
      error,
    });
    throw error;
  }
}
