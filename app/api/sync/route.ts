import { NextResponse } from "next/server";
import { syncArtworkToSupabase } from "@/lib/syncArtworkToSupabase";

export async function POST(request: Request) {
  try {
    const result = await syncArtworkToSupabase(5);

    if (result.hasMore) {
      // Schedule next batch
      await fetch("/api/sync", {
        method: "POST",
        body: JSON.stringify({}),
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
