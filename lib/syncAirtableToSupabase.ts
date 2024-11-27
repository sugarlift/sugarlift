import { getArtistsTable } from "./airtable";
import { supabaseAdmin } from "./supabase";

export async function syncAirtableToSupabase() {
  try {
    console.log("Starting sync process...");
    const table = getArtistsTable();

    // Get the most recently modified record
    console.log("Fetching records from Airtable");
    const records = await table
      .select({
        maxRecords: 1,
        sort: [{ field: "Last Modified", direction: "desc" }],
      })
      .firstPage();

    if (records.length === 0) {
      console.log("No records found to sync");
      return { success: true, processedCount: 0 };
    }

    const record = records[0];
    console.log("Found Airtable record:", {
      id: record.id,
      name: record.get("Artist Name"),
    });

    // Create a basic artist record without photos first
    const artist = {
      id: record.id,
      artist_name: (record.get("Artist Name") as string) || "Unknown Artist",
      artist_bio: (record.get("Artist Bio") as string) || null,
      born: (record.get("Born") as string) || null,
      city: (record.get("City") as string) || null,
      state: (record.get("State (USA)") as string) || null,
      country: (record.get("Country") as string) || null,
      ig_handle: (record.get("IG Handle") as string) || null,
      website: (record.get("Website") as string) || null,
      live_in_production: Boolean(record.get("Add to Website")),
      artist_photo: [], // Start with empty array
    };

    console.log("Attempting to upsert artist:", {
      id: artist.id,
      name: artist.artist_name,
    });

    const { data, error } = await supabaseAdmin.from("artists").upsert(artist, {
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

    return {
      success: true,
      processedCount: 1,
      artist: data?.[0],
    };
  } catch (error) {
    console.error("Sync failed:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}
