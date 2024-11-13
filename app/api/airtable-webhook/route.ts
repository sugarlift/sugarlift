import { NextResponse } from "next/server";
import { syncAirtableToSupabase } from "@/lib/syncAirtableToSupabase";
import { syncArtworkToSupabase } from "@/lib/syncArtworkToSupabase";
import { WebhookError } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("Received webhook payload:", payload);

    // Check which table was updated
    const tableId = payload.tableId || payload.table?.id;

    if (tableId === "tblkYraa6YhVleHVu") {
      // Artists table
      await syncAirtableToSupabase();
    } else if (tableId === "tblj8MEqwAWKPnxmd") {
      // Artwork table - using correct ID
      await syncArtworkToSupabase();
    } else {
      console.log("Unknown table ID:", tableId);
      return NextResponse.json({ error: "Unknown table ID" }, { status: 400 });
    }

    return NextResponse.json({ message: "Sync completed" });
  } catch (error) {
    const webhookError = error as WebhookError;
    console.error("Webhook error:", {
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
