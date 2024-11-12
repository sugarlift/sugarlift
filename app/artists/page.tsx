// app/artists/page.tsx

import { TerminalCTA } from "@/components/TerminalCTA";
import { supabase } from "@/lib/supabase";
import { Artist } from "@/lib/types";

async function getArtists(): Promise<Artist[]> {
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .order("name");

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
      <section className="container">
        <h2 className="mb-6 text-2xl">Featured Artists</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {artists.map((artist) => (
            <div key={artist.id} className="rounded-lg border p-4">
              <h3 className="text-xl font-bold">{artist.name}</h3>
              {artist.biography && <p className="mt-2">{artist.biography}</p>}
              {artist.instagram && (
                <a
                  href={`https://instagram.com/${artist.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  @{artist.instagram}
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
      <TerminalCTA />
    </>
  );
}
