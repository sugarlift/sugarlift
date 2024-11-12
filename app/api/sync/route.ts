import { NextResponse } from "next/server";
import { syncAirtableToSupabase } from "@/lib/syncAirtableToSupabase";

export async function GET() {
  try {
    await syncAirtableToSupabase();
    return NextResponse.json({
      success: true,
      message: "Sync completed successfully",
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { success: false, error: "Sync failed" },
      { status: 500 },
    );
  }
}
