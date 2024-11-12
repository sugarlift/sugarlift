import { getArtistsTable } from "./airtable";
import { supabase } from "./supabase";
import { Artist, SyncError } from "./types";

export async function syncAirtableToSupabase() {
  try {
    console.log("Starting sync process...");

    // Get all records from Airtable (including archived ones)
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

        const artist: Artist = {
          id: record.id,
          first_name: record.get("first_name") as string,
          last_name: record.get("last_name") as string,
          biography: record.get("biography") as string,
          is_archived: (record.get("is_archived") as boolean) || false,
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

    // Instead of deleting records, we'll mark missing ones as archived
    const idsToArchive = [...existingIds].filter((id) => !airtableIds.has(id));
    if (idsToArchive.length > 0) {
      console.log(`Archiving ${idsToArchive.length} obsolete records...`);
      const { error: archiveError } = await supabase
        .from("artists")
        .update({ is_archived: true })
        .in("id", idsToArchive);

      if (archiveError) {
        console.error("Error archiving records:", archiveError);
        throw archiveError;
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
