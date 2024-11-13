import { NextResponse } from "next/server";
import { syncArtworkToSupabase } from "@/lib/syncArtworkToSupabase";
import { WebhookError } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("Received artwork webhook payload:", payload);

    await syncArtworkToSupabase();
    return NextResponse.json({ message: "Artwork sync completed" });
  } catch (error) {
    const webhookError = error as WebhookError;
    console.error("Artwork webhook error:", {
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
