"use client";

import { TerminalCTA } from "@/components/TerminalCTA";
import { Artist } from "@/lib/types";
import { ArtistCard } from "@/components/ArtistCard";
import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface ArtistsClientProps {
  initialArtists: Artist[];
}

export function ArtistsClient({ initialArtists }: ArtistsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredArtists, setFilteredArtists] =
    useState<Artist[]>(initialArtists);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const filtered = initialArtists.filter((artist) => {
      const fullName = `${artist.first_name} ${artist.last_name}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });
    setFilteredArtists(filtered);
  }, [searchQuery, initialArtists]);

  const handleSearchClick = () => {
    inputRef.current?.focus();
  };

  return (
    <>
      <section className="mb-[-4vw]">
        <div className="container mb-12">
          <div className="flex items-center justify-between">
            <div className="relative flex items-center">
              <Search
                strokeWidth={1.75}
                size={24}
                className="cursor-arrow text-zinc-500"
                onClick={handleSearchClick}
              />
              <input
                ref={inputRef}
                type="text"
                placeholder="Featured artists"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent pl-4 text-[1.3125rem] font-normal tracking-[-0.0375rem] placeholder:text-zinc-700 hover:text-zinc-950 focus:outline-none lg:text-[2rem] lg:tracking-[-0.0625rem]"
              />
            </div>
          </div>
        </div>
        <div className="bg-white py-24">
          <div className="bg-w container space-y-36">
            {filteredArtists.length > 0 ? (
              filteredArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))
            ) : (
              <div className="h-[80dvh] text-center text-lg text-zinc-500">
                {searchQuery ? (
                  <>No artists found for "{searchQuery}"</>
                ) : (
                  <>No artists found</>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      <TerminalCTA />
    </>
  );
}
