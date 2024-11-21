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

    // Log Airtable credentials status
    console.log("Checking Airtable configuration...");
    if (!process.env.AIRTABLE_API_KEY) {
      console.error("Missing AIRTABLE_API_KEY");
      throw new Error("Missing AIRTABLE_API_KEY");
    }
    if (!process.env.AIRTABLE_BASE_ID) {
      console.error("Missing AIRTABLE_BASE_ID");
      throw new Error("Missing AIRTABLE_BASE_ID");
    }

    // Log Supabase configuration
    console.log("Checking Supabase configuration...");
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error("Missing SUPABASE_URL");
      throw new Error("Missing SUPABASE_URL");
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
      throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
    }

    console.log("Starting Airtable to Supabase sync...");
    const result = await syncAirtableToSupabase();
    console.log("Sync completed with result:", result);

    return NextResponse.json({
      message: "Artists sync completed",
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
