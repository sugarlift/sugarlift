import { NextResponse } from "next/server";
import { syncArtworkToSupabase } from "@/lib/syncArtworkToSupabase";

export async function POST(request: Request) {
  try {
    const { offset } = await request.json();
    const result = await syncArtworkToSupabase(5, offset);

    if (result.hasMore && result.nextOffset) {
      await fetch("/api/sync", {
        method: "POST",
        body: JSON.stringify({ offset: result.nextOffset }),
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
