import { NextResponse } from "next/server";
import { syncAirtableToSupabase } from "@/lib/syncAirtableToSupabase";

// Webhook secret should match the one in your Airtable script
const WEBHOOK_SECRET = process.env.AIRTABLE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  try {
    // Verify the webhook secret
    const webhookSecret = request.headers.get("x-airtable-webhook-secret");
    if (!WEBHOOK_SECRET || webhookSecret !== WEBHOOK_SECRET) {
      console.error("Invalid webhook secret");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Just sync the most recent record
    const result = await syncAirtableToSupabase();

    return NextResponse.json({
      message: "Sync completed",
      result,
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
