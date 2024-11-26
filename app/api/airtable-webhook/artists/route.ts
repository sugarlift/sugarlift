import { NextResponse } from "next/server";
import { syncAirtableToSupabase } from "@/lib/syncAirtableToSupabase";

export async function POST() {
  try {
    const result = await syncAirtableToSupabase();
    return NextResponse.json({
      message: "Sync completed",
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Artists webhook error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
