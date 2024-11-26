import { NextResponse } from "next/server";
import { syncAirtableToSupabase } from "@/lib/syncAirtableToSupabase";

// Set maximum duration for the function
export const maxDuration = 300; // 5 minutes

// Use Node.js runtime instead of Edge
export const runtime = "nodejs";

// Configure the function to use more memory if needed
export const config = {
  maxDuration: 30,
  memory: 512, // 512MB of memory
};

export async function POST() {
  try {
    // Start the sync process
    console.log("Starting artists webhook handler...");
    await syncAirtableToSupabase();

    // Return success response
    return NextResponse.json({
      message: "Sync process completed successfully",
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
