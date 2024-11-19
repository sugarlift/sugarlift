"use client";

import Link from "next/link";
import Image from "next/image";
import { Artist } from "@/lib/types";

interface FeaturedArtistsProps {
  artist: Artist;
}

export function FeaturedArtists({ artist }: FeaturedArtistsProps) {
  if (!artist) return null;

  return (
    <Link
      href={`/artists/${artist.first_name.toLowerCase()}-${artist.last_name.toLowerCase()}`}
      className="block"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        {artist.attachments && artist.attachments.length > 0 && (
          <Image
            src={artist.attachments[0].url}
            alt={`${artist.first_name} ${artist.last_name}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
      </div>
      <h3 className="p-4 pl-0 text-zinc-700">{`${artist.first_name} ${artist.last_name}`}</h3>
    </Link>
  );
}
