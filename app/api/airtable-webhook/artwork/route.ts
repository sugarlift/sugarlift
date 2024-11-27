import { NextResponse } from "next/server";
import { syncArtworkToSupabase } from "@/lib/syncArtworkToSupabase";

export async function POST(request: Request) {
  try {
    const result = await syncArtworkToSupabase();
    return NextResponse.json({
      message: "Artwork sync completed",
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in webhook handler:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
