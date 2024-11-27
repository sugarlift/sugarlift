import { NextResponse } from "next/server";
import { syncArtworkToSupabase } from "@/lib/syncArtworkToSupabase";
import { WebhookError } from "@/lib/types";

export const maxDuration = 30; // 30 seconds max runtime

export async function POST(request: Request) {
  try {
    // Log the start of the webhook handling
    console.log("Starting artwork webhook handler...");

    // Parse and validate the payload
    let payload;
    try {
      payload = await request.json();
      console.log(
        "Received artwork webhook payload:",
        JSON.stringify(payload, null, 2),
      );
    } catch (parseError) {
      console.error("Failed to parse webhook payload:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    // Perform the sync
    console.log("Starting artwork sync...");
    const result = await syncArtworkToSupabase();
    console.log("Sync completed successfully:", result);

    return NextResponse.json({
      message: "Artwork sync completed",
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
      error: webhookError, // Log the full error object
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
