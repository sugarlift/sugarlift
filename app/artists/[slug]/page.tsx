import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Artist } from "@/lib/types";
import { Metadata } from "next";
import Image from "next/image";
import { Instagram, Globe } from "lucide-react";
import Link from "next/link";
import { ConsultationCTA } from "@/components/ConsultationCTA";
import { ArtistCard } from "@/components/ArtistCard";
import { incrementViewCount } from "./actions";

async function getArtistBySlug(slug: string): Promise<Artist | null> {
  const { data: artists, error: artistError } = await supabase
    .from("artists")
    .select("*")
    .eq("live_in_production", true);

  if (artistError || !artists) {
    console.error("Error fetching artists:", artistError);
    return null;
  }

  const artist = artists.find((artist) => {
    const normalizedName = artist.artist_name
      .toLowerCase()
      .normalize("NFD") // Decompose characters with diacritics
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-zA-Z0-9]/g, "-"); // Replace non-alphanumeric with hyphens

    return normalizedName === slug;
  });

  if (!artist) {
    return null;
  }

  const { data: artwork, error: artworkError } = await supabase
    .from("artwork")
    .select("*")
    .eq("live_in_production", true)
    .eq("artist_name", artist.artist_name);

  if (artworkError) {
    console.error("Error fetching artwork:", artworkError);
    return null;
  }

  return {
    ...artist,
    artwork: artwork || [],
  };
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
    title: `${artist.artist_name} | Artist Profile`,
    description:
      artist.artist_bio?.slice(0, 160) ||
      `Profile of artist ${artist.artist_name}`,
  };
}

export default async function ArtistPage({ params }: { params: Params }) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);

  if (!artist) {
    notFound();
  }

  await incrementViewCount({ artistName: artist.artist_name });

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
            {artist.ig_handle && (
              <p>
                <Link
                  href={`https://instagram.com/${artist.ig_handle}`}
                  className="block p-2 px-4 pl-0 hover:opacity-50"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram size={20} strokeWidth={1.75} />
                </Link>
              </p>
            )}
            {artist.website && (
              <p>
                <Link
                  href={artist.website}
                  className="block p-2 px-4 hover:opacity-50"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe size={20} strokeWidth={1.5} />
                </Link>
              </p>
            )}
          </div>
          <div className="col-start-2 col-end-4">
            <p className="mb-6 inline-block border-b border-zinc-950 pb-6 text-lg text-zinc-950">
              Biography
            </p>
            <div className="prose !p-0 lg:!p-0">
              {artist.artist_bio && (
                <>
                  <h3>
                    {artist.artist_bio
                      .split(/(?<=[.!?])\s+/)
                      .slice(0, 2)
                      .join(" ")}
                  </h3>
                  <p>
                    {artist.artist_bio
                      .split(/(?<=[.!?])\s+/)
                      .slice(2)
                      .join(" ")}
                  </p>
                </>
              )}
            </div>
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
                              `Artwork ${imageIndex + 1} by ${artist.artist_name}`
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
      <ConsultationCTA />
    </>
  );
}

export async function generateStaticParams() {
  const { data: artists } = await supabase
    .from("artists")
    .select("artist_name")
    .eq("live_in_production", true);

  if (!artists) return [];

  return artists.map((artist) => ({
    slug: artist.artist_name
      .toLowerCase()
      .normalize("NFD") // Decompose characters with diacritics
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-zA-Z0-9]/g, "-"), // Replace non-alphanumeric with hyphens
  }));
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
