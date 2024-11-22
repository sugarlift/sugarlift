import { NextResponse } from "next/server";
import { syncAirtableToSupabase } from "@/lib/syncAirtableToSupabase";
import { WebhookError } from "@/lib/types";

// Increase timeout to 60 seconds (default is 10 seconds)
export const maxDuration = 60;

// Add runtime config for Edge functions
export const runtime = "edge";

export async function POST(request: Request) {
  try {
    console.log("Starting artists webhook handler...");
    let payload;
    try {
      payload = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    // Process first batch with 2 records
    const result = await syncAirtableToSupabase(2, 0);

    // Queue the remaining records for background processing
    if (result.remainingCount > 0 && result.nextOffset) {
      // Trigger subsequent syncs via separate API calls
      const batchSize = 1; // Process one record at a time for remaining records
      for (
        let offset = result.nextOffset;
        offset < result.totalCount;
        offset += batchSize
      ) {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/sync/batch`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ offset, limit: batchSize }),
        });
        // Add small delay between triggering batches
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      message: "Initial sync completed, remaining records queued",
      timestamp: new Date().toISOString(),
      result,
      payload,
    });
  } catch (error) {
    const webhookError = error as WebhookError;
    console.error("Artists webhook error:", {
      message: webhookError.message || "Unknown error",
      status: webhookError.status,
      response: webhookError.response,
      stack: webhookError.stack,
      error: webhookError,
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        details: webhookError.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
