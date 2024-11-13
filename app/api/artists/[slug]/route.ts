import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const [firstName, lastName] = slug
      .split("-")
      .map(
        (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
      );

    const { data: artist, error } = await supabase
      .from("artists")
      .select("*")
      .eq("live_in_production", true)
      .eq("first_name", firstName)
      .eq("last_name", lastName)
      .single();

    if (error || !artist) {
      return Response.json({ error: "Artist not found" }, { status: 404 });
    }

    return Response.json(artist);
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
