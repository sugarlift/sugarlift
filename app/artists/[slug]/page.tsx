import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Artist } from "@/lib/types";
import { QuickLink } from "@/components/Link";
import { Metadata } from "next";
import Image from "next/image";

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
    <div className="container mx-auto px-4 py-8">
      <QuickLink
        href="/artists"
        className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900"
      >
        Back to Artists
      </QuickLink>

      <div className="mb-8 flex flex-col md:flex-row md:items-start md:gap-8">
        {artist.attachments && artist.attachments.length > 0 && (
          <div className="mb-6 md:mb-0 md:w-1/3">
            <div className="grid grid-cols-2 gap-4">
              {artist.attachments.map((attachment, index) => (
                <div
                  key={attachment.url}
                  className={`relative aspect-square w-full ${
                    artist.attachments.length === 1 ? "col-span-2" : ""
                  }`}
                >
                  <Image
                    src={attachment.url}
                    alt={`${artist.first_name} ${artist.last_name} - Photo ${index + 1}`}
                    fill
                    className="rounded-lg object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="md:w-2/3">
          <h1 className="mb-6 text-4xl font-bold">
            {artist.first_name} {artist.last_name}
          </h1>
          <div className="prose max-w-none">
            <p>{artist.biography}</p>
          </div>
        </div>
      </div>

      {artist.artwork && artist.artwork.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-semibold">Artwork</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {artist.artwork.map((artwork) => (
              <div key={artwork.id} className="space-y-2">
                {artwork.artwork_images && (
                  <div className="grid gap-2">
                    {artwork.artwork_images.map((image, imageIndex) => (
                      <div key={imageIndex} className="relative aspect-square">
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
