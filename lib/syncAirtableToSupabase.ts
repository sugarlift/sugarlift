import { airtable } from "./airtable";
import { supabase } from "./supabase";
import { Artist } from "./types";

export async function syncAirtableToSupabase() {
  try {
    // Get all records from Airtable
    const records = await airtable("Artists").select().all();

    // Get all existing artists from Supabase for comparison
    const { data: existingArtists } = await supabase
      .from("artists")
      .select("id");

    const existingIds = new Set(existingArtists?.map((a) => a.id) || []);
    const airtableIds = new Set();

    // Sync all records from Airtable
    for (const record of records) {
      const artist: Artist = {
        id: record.id,
        name: record.get("Name") as string,
        biography: record.get("Biography") as string,
        instagram: record.get("Instagram Handle") as string,
      };

      airtableIds.add(record.id);

      const { error } = await supabase
        .from("artists")
        .upsert(artist, { onConflict: "id" });

      if (error) throw error;
    }

    // Delete records that exist in Supabase but not in Airtable
    const idsToDelete = [...existingIds].filter((id) => !airtableIds.has(id));
    if (idsToDelete.length > 0) {
      const { error } = await supabase
        .from("artists")
        .delete()
        .in("id", idsToDelete);

      if (error) throw error;
    }

    console.log("Sync completed successfully");
  } catch (error) {
    console.error("Error syncing data:", error);
    throw error;
  }
}
