import { NextResponse } from "next/server";
import { syncArtworkToSupabase } from "@/lib/syncArtworkToSupabase";
import { WebhookError } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log(
      "Received artwork webhook payload:",
      JSON.stringify(payload, null, 2),
    );

    console.log("Starting artwork sync...");
    const result = await syncArtworkToSupabase();
    console.log("Sync result:", result);

    return NextResponse.json({
      message: "Artwork sync completed",
      timestamp: new Date().toISOString(),
      payload,
    });
  } catch (error) {
    const webhookError = error as WebhookError;
    console.error("Artwork webhook error:", {
      message: webhookError.message || "Unknown error",
      status: webhookError.status,
      response: webhookError.response,
      stack: webhookError.stack,
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
