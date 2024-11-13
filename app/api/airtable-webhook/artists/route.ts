import { NextResponse } from "next/server";
import { syncAirtableToSupabase } from "@/lib/syncAirtableToSupabase";
import { WebhookError } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("Received artists webhook payload:", payload);

    await syncAirtableToSupabase();
    return NextResponse.json({ message: "Artists sync completed" });
  } catch (error) {
    const webhookError = error as WebhookError;
    console.error("Artists webhook error:", {
      message: webhookError.message || "Unknown error",
      status: webhookError.status,
      response: webhookError.response,
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
