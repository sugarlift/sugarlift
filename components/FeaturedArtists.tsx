"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface FeaturedArtistsProps {
  slug: string;
}

interface Artist {
  first_name: string;
  last_name: string;
  attachments: { url: string }[];
}

export function FeaturedArtists({ slug }: FeaturedArtistsProps) {
  const [artist, setArtist] = useState<Artist | null>(null);

  useEffect(() => {
    async function fetchArtist() {
      const response = await fetch(`/api/artists/${slug}`);
      const data = await response.json();
      if (!response.ok) {
        console.error("Failed to fetch artist:", data.error);
        return;
      }
      setArtist(data);
    }

    fetchArtist();
  }, [slug]);

  if (!artist) return null;

  return (
    <Link href={`/artists/${slug}`} className="block px-2">
      <div className="relative aspect-square w-full overflow-hidden">
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
      <h2 className="mt-4 text-lg">{`${artist.first_name} ${artist.last_name}`}</h2>
    </Link>
  );
}
