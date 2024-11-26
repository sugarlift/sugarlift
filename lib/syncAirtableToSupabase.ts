import { getArtistsTable } from "./airtable";
import { supabase } from "./supabase";

const generateSlug = (name: string) => {
  return name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");
};

export async function syncAirtableToSupabase() {
  try {
    console.log("Starting sync process...");
    const table = getArtistsTable();

    // Get the most recently modified record
    console.log("Fetching records from Airtable view: Artists-LIVE");
    const records = await table
      .select({
        maxRecords: 1,
        sort: [{ field: "Last Modified", direction: "desc" }],
        view: "Artists-LIVE",
      })
      .firstPage();

    if (records.length === 0) {
      console.log("No records found to sync");
      return { success: true, processedCount: 0 };
    }

    const record = records[0];
    console.log("Found record:", {
      id: record.id,
      fields: record.fields,
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
      slug: generateSlug(
        (record.get("Artist Name") as string) || "unknown-artist",
      ),
    };

    console.log("Attempting to upsert artist to Supabase table: artists", {
      id: artist.id,
      name: artist.artist_name,
    });

    // Try the upsert with explicit table name
    const { data, error } = await supabase
      .from("artists")
      .upsert(artist, {
        onConflict: "id",
      })
      .select();

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
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}
