// app/artists/page.tsx

import { TerminalCTA } from "@/components/TerminalCTA";
import { supabase } from "@/lib/supabase";
import { Artist } from "@/lib/types";
import { Slider } from "@/components/Slider";
import Image from "next/image";
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

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <>
      <section className="mb-[-6rem]">
        <h1 className="container mb-12">Featured artists</h1>
        <div className="bg-white py-24">
          <div className="bg-w container space-y-36">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="grid grid-cols-4 items-start gap-6"
              >
                {/* Name column */}
                <div>
                  <QuickLink
                    href={`/artists/${artist.first_name.toLowerCase()}-${artist.last_name.toLowerCase()}`}
                    className="text-xl transition-colors hover:text-gray-600"
                  >
                    <h2>
                      {artist.first_name}
                      <br />
                      {artist.last_name}
                    </h2>
                  </QuickLink>
                </div>

                {/* Images columns */}
                <div className="col-span-3">
                  {artist.attachments && artist.attachments.length > 0 ? (
                    <Slider slidesPerView={3}>
                      {artist.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="relative aspect-[2/3] w-full"
                        >
                          <Image
                            src={attachment.url}
                            alt={`${artist.first_name} ${artist.last_name} - Work ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                          />
                        </div>
                      ))}
                    </Slider>
                  ) : (
                    <div className="flex h-48 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                      No images available
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <TerminalCTA />
    </>
  );
}
