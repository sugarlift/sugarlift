import { NextResponse } from "next/server";
import { syncAirtableToSupabase } from "@/lib/syncAirtableToSupabase";

export async function POST(request: Request) {
  try {
    // Verify webhook secret if needed
    const webhookSecret = request.headers.get("x-airtable-webhook-secret");
    if (webhookSecret !== process.env.AIRTABLE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await syncAirtableToSupabase();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
