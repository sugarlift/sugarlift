"use client";

import Link from "next/link";
import Image from "next/image";
import { Artist } from "@/lib/types";

interface FeaturedArtistsProps {
  artist: Artist;
}

export function FeaturedArtists({ artist }: FeaturedArtistsProps) {
  if (!artist) return null;

  const artistSlug = artist.artist_name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, "-");

  return (
    <Link href={`/artists/${artistSlug}`} className="block">
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        {artist.artist_photo && artist.artist_photo.length > 0 && (
          <Image
            src={artist.artist_photo[0].url}
            alt={artist.artist_name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
      </div>
      <h3 className="p-4 pl-0 text-zinc-700">{artist.artist_name}</h3>
    </Link>
  );
}
