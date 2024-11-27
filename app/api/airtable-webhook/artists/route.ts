import { NextResponse } from "next/server";
import { syncAirtableToSupabase } from "@/lib/syncAirtableToSupabase";

export async function POST(request: Request) {
  try {
    const result = await syncAirtableToSupabase();
    return Response.json(result);
  } catch (error) {
    console.error("Error in webhook handler:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
