import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Artist } from "@/lib/types";
import { Metadata } from "next";
import { Instagram, Globe } from "lucide-react";
import Link from "next/link";
import { ArtistCard } from "@/components/ArtistCard";
import { COMPANY_METADATA } from "@/app/lib/constants";
import { ArtworkGrid } from "./ArtworkGrid";
import { generateSlug } from "@/lib/utils";

async function getArtistBySlug(slug: string): Promise<Artist | null> {
  const { data: artists, error: artistError } = await supabase
    .from("artists")
    .select("*")
    .eq("live_in_production", true);

  if (artistError || !artists) {
    console.error("Error fetching artists:", artistError);
    return null;
  }

  // Debug: Log all artist slugs for comparison
  if (process.env.NODE_ENV === "development") {
    console.log("Looking for slug:", slug);
    console.log(
      "Available artist slugs:",
      artists.map((a) => ({
        name: a.artist_name,
        slug: generateSlug(a.artist_name),
      })),
    );
  }

  const artist = artists.find((artist) => {
    return generateSlug(artist.artist_name) === slug;
  });

  if (!artist) {
    console.error(`Artist not found for slug: ${slug}`);
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
    title: `${artist.artist_name} | ${COMPANY_METADATA.name} Artist`,
    description:
      artist.artist_bio?.slice(0, 160) ||
      `Profile of artist ${artist.artist_name}`,
    alternates: {
      canonical: `${COMPANY_METADATA.url}/artists/${slug}`,
    },
  };
}

export default async function ArtistPage({ params }: { params: Params }) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);

  if (!artist) {
    notFound();
  }

  return (
    <>
      <section className="container overflow-x-hidden">
        <ArtistCard
          artist={artist}
          disableLink={true}
          showInquiryButton={true}
        />
      </section>

      <section className="container">
        <div className="gri-cols-1 grid items-start lg:grid-cols-4">
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
          <div className="mt-12 lg:col-start-2 lg:col-end-4 lg:mt-0">
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
        <ArtworkGrid artwork={artist.artwork} />
      </section>
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
    slug: generateSlug(artist.artist_name),
  }));
}

export const revalidate = 3600;
