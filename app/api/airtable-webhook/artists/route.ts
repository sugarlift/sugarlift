import { NextResponse } from "next/server";
import { syncAirtableToSupabase } from "@/lib/syncAirtableToSupabase";

export const maxDuration = 30; // 30 seconds max runtime

export async function POST() {
  try {
    console.log("Starting sync...");
    const result = await syncAirtableToSupabase();

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Sync failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
