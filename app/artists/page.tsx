// app/artists/page.tsx

import { TerminalCTA } from "@/components/TerminalCTA";
import { supabase } from "@/lib/supabase";
import { Artist } from "@/lib/types";
import { QuickLink } from "@/components/Link";

export const revalidate = 3600;

async function getArtists(): Promise<Artist[]> {
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("live_in_production", true)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (error) {
    console.error("Error fetching artists:", error);
    return [];
  }

  return data || [];
}

export async function generateStaticParams() {
  return [{}];
}

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <>
      <section className="container">
        <h2 className="mb-6 text-2xl">Featured Artists</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {artists.map((artist) => (
            <QuickLink
              href={`/artists/${artist.first_name.toLowerCase()}-${artist.last_name.toLowerCase()}`}
              key={artist.id}
              className="rounded-lg border p-4 transition-colors hover:border-gray-400"
            >
              <h3 className="text-xl font-bold">
                {artist.first_name} {artist.last_name}
              </h3>
              {artist.biography && (
                <p className="mt-2 line-clamp-3">{artist.biography}</p>
              )}
            </QuickLink>
          ))}
        </div>
      </section>
      <TerminalCTA />
    </>
  );
}
