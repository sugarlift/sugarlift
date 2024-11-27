import { NextResponse } from "next/server";
import { syncArtworkToSupabase } from "@/lib/syncArtworkToSupabase";
import { WebhookError } from "@/lib/types";

export async function POST(request: Request) {
  const payload = await request.json();

  // Extract changed record IDs from webhook payload
  const recordIds = payload.records?.map((r: any) => r.id) || [];

  await syncArtworkToSupabase(recordIds);
  return new Response("OK", { status: 200 });
}
