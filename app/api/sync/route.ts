import { syncAirtableToSupabase } from "@/lib/syncAirtableToSupabase";
import { syncArtworkToSupabase } from "@/lib/syncArtworkToSupabase";

export async function POST(request: Request) {
  try {
    const [artistsResult, artworkResult] = await Promise.all([
      syncAirtableToSupabase(),
      syncArtworkToSupabase(),
    ]);

    return Response.json({
      artists: artistsResult,
      artwork: artworkResult,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
