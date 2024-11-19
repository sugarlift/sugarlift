import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Artist } from "@/lib/types";
import { Metadata } from "next";
import Image from "next/image";
import { Instagram, Globe } from "lucide-react";
import Link from "next/link";
import { TerminalCTA } from "@/components/TerminalCTA";
import { ArtistCard } from "@/components/ArtistCard";
import { incrementViewCount } from "./actions";

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

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
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

export default async function ArtistPage({ params }: { params: Params }) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);

  if (!artist) {
    notFound();
  }

  await incrementViewCount(
    artist.first_name,
    artist.last_name,
    artist.view_count,
    slug,
  );

  return (
    <>
      <section className="container">
        <ArtistCard
          artist={artist}
          disableLink={true}
          showInquiryButton={true}
        />
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
            <p className="prose">{artist.biography}</p>
          </div>
        </div>
      </section>

      <section className="container">
        {artist.artwork && artist.artwork.length > 0 && (
          <div className="mt-12">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
              {artist.artwork.map((artwork) => (
                <div key={artwork.id}>
                  {artwork.artwork_images && (
                    <div>
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
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="p-4 pl-0">
                    <h3 className="text-zinc-700">
                      {artwork.title || "Untitled"}, {artwork.year}
                    </h3>
                    <p className="mt-0.5 text-sm tracking-tight text-zinc-500">
                      {artwork.medium}, {artwork.height}"H x {artwork.width}"W
                    </p>
                  </div>
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
