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

    // Parse the webhook payload
    const payload = await request.json();
    console.log("Received webhook payload:", payload);

    // Debug log to compare base IDs
    console.log("Environment base ID:", process.env.AIRTABLE_BASE_ID);
    console.log("Webhook payload base ID:", payload.baseId);

    // Verify the base and table IDs match
    if (payload.baseId !== process.env.AIRTABLE_BASE_ID) {
      console.error("Base ID mismatch:", {
        expected: process.env.AIRTABLE_BASE_ID,
        received: payload.baseId,
      });
      return NextResponse.json({ error: "Invalid base ID" }, { status: 400 });
    }

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
