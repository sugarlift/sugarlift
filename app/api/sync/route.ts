import { NextResponse } from "next/server";
import { syncArtworkToSupabase } from "@/lib/syncArtworkToSupabase";

export async function POST(request: Request) {
  try {
    const { forceSync } = await request.json().catch(() => ({}));
    const result = await syncArtworkToSupabase(5, undefined, forceSync);

    if (result.hasMore) {
      // Schedule next batch
      await fetch("/api/sync", {
        method: "POST",
        body: JSON.stringify({ forceSync }),
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
