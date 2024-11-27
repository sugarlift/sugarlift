import { NextResponse } from "next/server";
import { syncArtworkToSupabase } from "@/lib/syncArtworkToSupabase";

export async function POST(request: Request) {
  try {
    const { offset } = await request.json();
    const numericOffset = offset ? parseInt(offset, 10) : undefined;
    const result = await syncArtworkToSupabase(5, numericOffset);

    if (result.hasMore && result.nextOffset !== null) {
      await fetch("/api/sync", {
        method: "POST",
        body: JSON.stringify({ offset: result.nextOffset.toString() }),
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
