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

    // Instead of processing everything, just sync the first batch
    const INITIAL_BATCH_SIZE = 2;

    const result = await syncAirtableToSupabase(INITIAL_BATCH_SIZE);

    // Queue the remaining records for background processing
    if (result.remainingCount > 0) {
      // Trigger subsequent syncs via separate API calls
      for (
        let offset = INITIAL_BATCH_SIZE;
        offset < result.totalCount;
        offset += INITIAL_BATCH_SIZE
      ) {
        fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/sync?offset=${offset}&limit=${INITIAL_BATCH_SIZE}`,
          {
            method: "POST",
          },
        );
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
