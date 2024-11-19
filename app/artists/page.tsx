// app/artists/page.tsx

import { TerminalCTA } from "@/components/TerminalCTA";
import { supabase } from "@/lib/supabase";
import { Artist } from "@/lib/types";
import { ArtistCard } from "@/components/ArtistCard";

export const revalidate = 3600;

async function getArtists(): Promise<Artist[]> {
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("live_in_production", true)
    .order("view_count", { ascending: false })
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (error) {
    console.error("Error fetching artists:", error);
    return [];
  }

  return data || [];
}

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <>
      <section className="mb-[-4vw]">
        <h1 className="container mb-12">Featured artists</h1>
        <div className="bg-white py-24">
          <div className="bg-w container space-y-36">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </div>
      </section>
      <TerminalCTA />
    </>
  );
}
