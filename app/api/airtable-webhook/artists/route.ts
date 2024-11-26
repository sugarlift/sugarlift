import { NextResponse } from "next/server";
import { syncAirtableToSupabase } from "@/lib/syncAirtableToSupabase";

export async function POST() {
  try {
    console.log("Starting artists webhook handler...");
    const result = await syncAirtableToSupabase();

    return NextResponse.json({
      message: "Artists sync completed",
      result,
    });
  } catch (error) {
    console.error("Artists webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
