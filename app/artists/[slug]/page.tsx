import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Artist } from "@/lib/types";
import { QuickLink } from "@/components/Link";
import { Metadata } from "next";

async function getArtistBySlug(slug: string): Promise<Artist | null> {
  const [firstName, lastName] = slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());

  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("live_in_production", true)
    .eq("first_name", firstName)
    .eq("last_name", lastName)
    .single();

  if (error || !data) {
    console.error("Error fetching artist:", error);
    return null;
  }

  return data;
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
    <div className="container py-8">
      <QuickLink
        href="/artists"
        className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900"
      >
        Back to Artists
      </QuickLink>

      <h1 className="mb-6 text-3xl font-bold">
        {artist.first_name} {artist.last_name}
      </h1>

      <div className="space-y-6">
        {artist.biography && (
          <div className="prose max-w-none">
            <h2 className="mb-3 text-xl font-semibold">Biography</h2>
            <p>{artist.biography}</p>
          </div>
        )}
      </div>
    </div>
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
