import { NextResponse } from "next/server";
import { syncAirtableToSupabase } from "@/lib/syncAirtableToSupabase";
import { WebhookError } from "@/lib/types";

export async function POST(request: Request) {
  try {
    // Log incoming request details
    console.log("Webhook received:", {
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.clone().json(),
    });

    // Verify webhook secret
    const webhookSecret = request.headers.get("x-airtable-webhook-secret");
    if (webhookSecret !== process.env.AIRTABLE_WEBHOOK_SECRET) {
      console.error("Webhook secret mismatch");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await syncAirtableToSupabase();
    return NextResponse.json({ success: true });
  } catch (error) {
    // Log detailed error information
    const webhookError = error as WebhookError;
    console.error("Webhook error details:", {
      message: webhookError.message || "Unknown error",
      stack: webhookError.stack,
      error: webhookError,
    });

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: webhookError.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
