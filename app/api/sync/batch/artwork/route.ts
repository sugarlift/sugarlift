import { NextResponse } from "next/server";
import { syncArtworkToSupabase } from "@/lib/syncArtworkToSupabase";

export async function POST(request: Request) {
  const { offset = 0, limit = 2 } = await request.json();

  const result = await syncArtworkToSupabase(limit, offset);

  return NextResponse.json({
    message: `Artwork batch sync completed (offset: ${offset}, limit: ${limit})`,
    result,
  });
}
