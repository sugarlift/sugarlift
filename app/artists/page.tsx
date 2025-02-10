// app/artists/page.tsx

import { ArtistsClient } from "./client";
import { supabase } from "@/lib/supabase";
import { Artist } from "@/lib/types";
import { COMPANY_METADATA } from "@/app/lib/constants";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${COMPANY_METADATA.name} | Artists`,
  description:
    "Sugarlift is a contemporary art gallery based in New York, an industry-leading art consulting service, and a global artist community representing today's best and brightest contemporary artists.",
};

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
