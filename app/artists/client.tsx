"use client";

import { useState, useEffect } from "react";
import { Artist } from "@/lib/types";
import { ArtistCard } from "@/components/ArtistCard";
import { Input } from "@/components/ui/input";

interface ArtistsClientProps {
  initialArtists: Artist[];
}

export function ArtistsClient({ initialArtists }: ArtistsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredArtists, setFilteredArtists] = useState(initialArtists);

  useEffect(() => {
    const filtered = initialArtists.filter((artist) => {
      const artistName = artist.artist_name.toLowerCase();
      return artistName.includes(searchQuery.toLowerCase());
    });
    setFilteredArtists(filtered);
  }, [searchQuery, initialArtists]);

  return (
    <div className="container">
      <div className="mb-12">
        <Input
          type="text"
          placeholder="Search artists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="space-y-12">
        {filteredArtists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
    </div>
  );
}
