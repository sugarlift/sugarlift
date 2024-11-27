import { NextResponse } from "next/server";
import { syncAirtableToSupabase } from "@/lib/syncAirtableToSupabase";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    console.log("Starting sync...");

    // Get the batch number from the request, default to 1
    const data = await request.json().catch(() => ({}));
    const batchNumber = data.batchNumber || 1;
    console.log(`Processing batch ${batchNumber}`);

    const result = await syncAirtableToSupabase(batchNumber);

    if (result.hasMore) {
      // Get URL from the request
      const url = new URL(request.url);

      // Trigger next batch via fetch
      console.log(`Triggering batch ${batchNumber + 1}`);
      await fetch(url.toString(), {
        method: "POST",
        body: JSON.stringify({ batchNumber: batchNumber + 1 }),
        headers: { "Content-Type": "application/json" },
      });
    }

    return NextResponse.json({
      success: true,
      result,
      batch: batchNumber,
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
