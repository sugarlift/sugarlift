import { syncAirtableToSupabase } from "@/lib/syncAirtableToSupabase";
import { syncArtworkToSupabase } from "@/lib/syncArtworkToSupabase";

export const maxDuration = 30; // 30 seconds max runtime

export async function POST() {
  try {
    await syncAirtableToSupabase();
    await syncArtworkToSupabase();
    return new Response("Sync completed successfully", { status: 200 });
  } catch (error) {
    console.error("Sync failed:", error);
    return new Response("Sync failed", { status: 500 });
  }
}
