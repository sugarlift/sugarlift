import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const artistName = slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");

    const { data: artist, error } = await supabase
      .from("artists")
      .select("*")
      .eq("live_in_production", true)
      .ilike("artist_name", artistName)
      .single();

    if (error || !artist) {
      return Response.json({ error: "Artist not found" }, { status: 404 });
    }

    return Response.json(artist);
  } catch {
    return new Response("Artist not found", { status: 404 });
  }
}
