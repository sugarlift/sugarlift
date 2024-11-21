import { NextResponse } from "next/server";
import { syncAirtableToSupabase } from "@/lib/syncAirtableToSupabase";
import { WebhookError } from "@/lib/types";

export async function POST(request: Request) {
  try {
    console.log("Starting artists webhook handler...");

    let payload;
    try {
      payload = await request.json();
      console.log(
        "Received artists webhook payload:",
        JSON.stringify(payload, null, 2),
      );
    } catch (parseError) {
      console.error("Failed to parse webhook payload:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 },
      );
    }

    console.log("Starting Airtable to Supabase sync...");
    await syncAirtableToSupabase();
    console.log("Sync completed successfully");

    return NextResponse.json({
      message: "Artists sync completed",
      timestamp: new Date().toISOString(),
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
