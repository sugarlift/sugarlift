import { NextResponse } from "next/server";
import { syncAirtableToSupabase } from "@/lib/syncAirtableToSupabase";

// Webhook secret should match the one in your Airtable script
const WEBHOOK_SECRET = process.env.AIRTABLE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  try {
    console.log("Starting webhook handler...");

    // Verify the webhook secret
    const webhookSecret = request.headers.get("x-airtable-webhook-secret");
    if (!WEBHOOK_SECRET || webhookSecret !== WEBHOOK_SECRET) {
      console.error("Webhook secret validation failed:", {
        hasSecret: !!WEBHOOK_SECRET,
        receivedSecret: !!webhookSecret,
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Webhook secret validated, starting sync...");

    try {
      // Just sync the most recent record
      const result = await syncAirtableToSupabase();
      console.log("Sync completed successfully:", result);

      return NextResponse.json({
        message: "Sync completed",
        result,
        timestamp: new Date().toISOString(),
      });
    } catch (syncError) {
      console.error("Sync process failed:", {
        error: syncError,
        message:
          syncError instanceof Error ? syncError.message : "Unknown sync error",
        stack: syncError instanceof Error ? syncError.stack : undefined,
      });
      throw syncError; // Re-throw to be caught by outer catch block
    }
  } catch (error) {
    console.error("Webhook handler error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

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
