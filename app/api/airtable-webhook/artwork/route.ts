import { NextResponse } from "next/server";
import { syncArtworkToSupabase } from "@/lib/syncArtworkToSupabase";
import { WebhookError } from "@/lib/types";

// Increase timeout to 60 seconds
export const maxDuration = 60;

// Add runtime config for Edge functions
export const runtime = "edge";

export async function POST(request: Request) {
  try {
    console.log("Starting artwork webhook handler...");
    let payload;
    try {
      payload = await request.json();
      console.log(
        "Received artwork webhook payload:",
        JSON.stringify(payload, null, 2),
      );
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    // Process first batch with 2 records
    const result = await syncArtworkToSupabase(2, 0);

    // Queue the remaining records for background processing
    if (result.remainingCount > 0 && result.nextOffset) {
      const batchSize = 1; // Process one record at a time for remaining records
      for (
        let offset = result.nextOffset;
        offset < result.totalCount;
        offset += batchSize
      ) {
        await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/sync/batch/artwork`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ offset, limit: batchSize }),
          },
        );
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
    console.error("Artwork webhook error:", {
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
