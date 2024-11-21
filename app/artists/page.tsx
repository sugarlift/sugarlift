// app/artists/page.tsx

import { ArtistsClient } from "./client";
import { supabase } from "@/lib/supabase";
import { Artist } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getArtists(): Promise<Artist[]> {
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("live_in_production", true)
    .order("view_count", { ascending: false })
    .order("artist_name", { ascending: true });

  if (error) {
    console.error("Error fetching artists:", error);
    return [];
  }

  return data || [];
}

export default async function ArtistsPage() {
  const artists = await getArtists();
  return <ArtistsClient initialArtists={artists} />;
}
