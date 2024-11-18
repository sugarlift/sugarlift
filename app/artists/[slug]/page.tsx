import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Artist } from "@/lib/types";
import { QuickLink } from "@/components/Link";
import { Metadata } from "next";
import Image from "next/image";
import { Slider } from "@/components/Slider";
import { Button } from "@/components/ui/button";
import { ArrowRight, Instagram, Globe } from "lucide-react";
import Link from "next/link";
import { TerminalCTA } from "@/components/TerminalCTA";

async function getArtistBySlug(slug: string): Promise<Artist | null> {
  const [firstName, lastName] = slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());

  try {
    // First get the artist
    const { data: artist, error: artistError } = await supabase
      .from("artists")
      .select("*")
      .eq("live_in_production", true)
      .eq("first_name", firstName)
      .eq("last_name", lastName)
      .single();

    if (artistError || !artist) {
      console.error("Error fetching artist:", artistError);
      return null;
    }

    // Then get their artwork using artist_id
    // Using ilike to match the ID within the string
    const { data: artwork, error: artworkError } = await supabase
      .from("artwork")
      .select("*")
      .eq("live_in_production", true)
      .ilike("artist_id", `%${artist.id}%`);

    if (artworkError) {
      console.error("Error fetching artwork:", artworkError);
      return null;
    }

    console.log("Found artwork:", artwork); // Add this to debug

    // Combine the data
    return {
      ...artist,
      artwork: artwork || [],
    };
  } catch (error) {
    console.error("Error in getArtistBySlug:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = (await params).slug;
  const artist = await getArtistBySlug(slug);

  if (!artist) {
    return {
      title: "Artist Not Found",
    };
  }

  return {
    title: `${artist.first_name} ${artist.last_name} | Artist Profile`,
    description:
      artist.biography?.slice(0, 160) ||
      `Profile of artist ${artist.first_name} ${artist.last_name}`,
  };
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const artist = await getArtistBySlug(slug);

  if (!artist) {
    notFound();
  }

  return (
    <>
      <section className="container">
        <div key={artist.id} className="grid grid-cols-4 items-start">
          <div className="flex h-full flex-col justify-between">
            <div>
              <h2>
                {artist.first_name}
                <br />
                {artist.last_name}
              </h2>
              <p className="mt-4 tracking-tight text-zinc-500">
                {artist.location}
              </p>
              <p className="tracking-tight text-zinc-500">
                b. {artist.year_of_birth}
              </p>
            </div>

            <Button asChild className="group">
              <QuickLink
                href="/contact"
                className="mr-8 inline-flex w-[calc(100%-10rem)] min-w-[10rem] items-center justify-between rounded-md bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800"
              >
                Inquire
                <ArrowRight
                  className="-me-1 ms-2 mt-0.5 transition-transform group-hover:translate-x-0.5"
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </QuickLink>
            </Button>
          </div>

          <div className="col-span-3">
            {artist.attachments && artist.attachments.length > 0 ? (
              <Slider slidesPerView={3}>
                {artist.attachments.map((attachment, index) => (
                  <div key={index} className="relative aspect-[2/3] w-full">
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
      </section>

      <section className="container">
        <div className="grid grid-cols-4 items-start">
          <div className="flex flex-row">
            {artist.instagram_url && (
              <p>
                <Link
                  href={artist.instagram_url}
                  className="block p-2 px-4 pl-0 hover:opacity-50"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram size={20} strokeWidth={1.75} />
                </Link>
              </p>
            )}
            {artist.website_url && (
              <p>
                <Link
                  href={artist.website_url}
                  className="block p-2 px-4 hover:opacity-50"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe size={20} strokeWidth={1.5} />
                </Link>
              </p>
            )}
          </div>
          <div className="prose col-start-2 col-end-4 max-w-none">
            <p className="mb-6 inline-block border-b border-zinc-950 pb-6 text-lg text-zinc-950">
              Biography
            </p>
            <p>{artist.biography}</p>
          </div>
        </div>
      </section>

      <section className="container">
        {artist.artwork && artist.artwork.length > 0 && (
          <div className="mt-12">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {artist.artwork.map((artwork) => (
                <div key={artwork.id} className="space-y-2">
                  {artwork.artwork_images && (
                    <div className="grid gap-2">
                      {artwork.artwork_images.map((image, imageIndex) => (
                        <div
                          key={imageIndex}
                          className="relative aspect-square"
                        >
                          <Image
                            src={image.url}
                            alt={
                              artwork.title ||
                              `Artwork ${imageIndex + 1} by ${artist.first_name} ${artist.last_name}`
                            }
                            fill
                            className="rounded-lg object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <h3 className="text-lg font-medium">
                    {artwork.title || "Untitled"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {artwork.medium}
                    {artwork.year && `, ${artwork.year}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      <TerminalCTA />
    </>
  );
}

export async function generateStaticParams() {
  const { data: artists } = await supabase
    .from("artists")
    .select("first_name, last_name")
    .eq("live_in_production", true);

  if (!artists) return [];

  return artists.map((artist) => ({
    slug: `${artist.first_name.toLowerCase()}-${artist.last_name.toLowerCase()}`,
  }));
}

export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour
