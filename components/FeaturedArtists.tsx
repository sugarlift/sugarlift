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
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "-");

  const validPhotoUrl = artist.artist_photo?.[0]?.url;

  return (
    <Link href={`/artists/${artistSlug}`} className="block">
      <div className="group">
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          {validPhotoUrl && (
            <Image
              src={validPhotoUrl}
              alt={artist.artist_name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="350px"
              quality={50}
              loading="lazy"
            />
          )}
        </div>
        <h3 className="p-3 pl-0 md:p-4 md:pl-0">{artist.artist_name}</h3>
      </div>
    </Link>
  );
}
