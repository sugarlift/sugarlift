// app/artists/page.tsx

import { ArtistsClient } from "./client";
import { supabase } from "@/lib/supabase";
import { Artist } from "@/lib/types";
import { COMPANY_METADATA } from "@/app/lib/constants";
import { Metadata } from "next";

// Change from force-dynamic to force-static
export const dynamic = "force-static";

// Add revalidation period (e.g., every hour)
export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${COMPANY_METADATA.name} | Artists`,
  description:
    "Sugarlift is a contemporary art gallery based in New York, an industry-leading art consulting service, and a global artist community representing today's best and brightest contemporary artists.",
  alternates: {
    canonical: `${COMPANY_METADATA.url}/artists`,
  },
  openGraph: {
    title: `${COMPANY_METADATA.name} | Artists`,
    description:
      "Sugarlift is a contemporary art gallery based in New York, an industry-leading art consulting service, and a global artist community representing today's best and brightest contemporary artists.",
    url: `${COMPANY_METADATA.url}/artists`,
    siteName: COMPANY_METADATA.name,
    images: [
      {
        url: `${COMPANY_METADATA.url}/og-image.jpg`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

async function getArtists(): Promise<Artist[]> {
  // First get all artists
  const { data: artists, error: artistError } = await supabase
    .from("artists")
    .select("*")
    .eq("live_in_production", true)
    .order("artist_name", { ascending: true });

  if (artistError) {
    console.error("Error fetching artists:", artistError);
    return [];
  }

  // Then get artwork for all artists
  const { data: artworks, error: artworkError } = await supabase
    .from("artwork")
    .select("*")
    .eq("live_in_production", true)
    .in("artist_name", artists?.map((artist) => artist.artist_name) || []);

  if (artworkError) {
    console.error("Error fetching artworks:", artworkError);
    return artists || [];
  }

  // Combine artists with their artwork
  return (artists || []).map((artist) => ({
    ...artist,
    artwork:
      artworks?.filter(
        (artwork) => artwork.artist_name === artist.artist_name,
      ) || [],
  }));
}

export default async function ArtistsPage() {
  const artists = await getArtists();
  return <ArtistsClient initialArtists={artists} />;
}
