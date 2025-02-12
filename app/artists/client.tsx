"use client";

import { Artist } from "@/lib/types";
import { ArtistCard } from "@/components/ArtistCard";
import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import Image from "next/image";
import { QuickLink } from "@/components/Link";

type ViewMode = "list" | "grid" | "directory";

interface ArtistsClientProps {
  initialArtists: Artist[];
}

const generateSlug = (name: string) => {
  return name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");
};

const splitName = (fullName: string) => {
  const parts = fullName.trim().split(" ");
  const lastName = parts[parts.length - 1];
  const firstName = parts.slice(0, parts.length - 1).join(" ");
  return { firstName, lastName };
};

export function ArtistsClient({ initialArtists }: ArtistsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredArtists, setFilteredArtists] =
    useState<Artist[]>(initialArtists);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [displayedArtists, setDisplayedArtists] = useState<Artist[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const ARTISTS_PER_PAGE = 10;

  const getSortedArtists = (artists: Artist[], mode: ViewMode) => {
    const sortedByViews = [...artists].sort(
      (a, b) => (b.view_count || 0) - (a.view_count || 0),
    );

    const alphabeticalArtists = [...artists].sort((a, b) => {
      const nameA = splitName(a.artist_name);
      const nameB = splitName(b.artist_name);
      const lastNameComparison = nameA.lastName.localeCompare(nameB.lastName);
      if (lastNameComparison === 0) {
        return nameA.firstName.localeCompare(nameB.firstName);
      }
      return lastNameComparison;
    });

    return mode === "grid"
      ? sortedByViews
      : mode === "directory"
        ? alphabeticalArtists
        : artists;
  };

  useEffect(() => {
    const filtered = initialArtists.filter((artist) => {
      const artistName = artist.artist_name.toLowerCase();
      return artistName.includes(searchQuery.toLowerCase());
    });
    setFilteredArtists(filtered);
    setCurrentPage(1);
    setDisplayedArtists(
      viewMode === "directory" ? filtered : filtered.slice(0, ARTISTS_PER_PAGE),
    );
  }, [searchQuery, initialArtists, viewMode]);

  useEffect(() => {
    const sortedArtists = getSortedArtists(filteredArtists, viewMode);

    setCurrentPage(1);
    setDisplayedArtists(
      viewMode === "directory"
        ? sortedArtists
        : sortedArtists.slice(0, ARTISTS_PER_PAGE),
    );
  }, [viewMode, filteredArtists]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const nextPage = currentPage + 1;
          const startIndex = currentPage * ARTISTS_PER_PAGE;
          const endIndex = startIndex + ARTISTS_PER_PAGE;

          const sortedArtists = getSortedArtists(filteredArtists, viewMode);
          const artistsToAdd = sortedArtists.slice(startIndex, endIndex);

          if (artistsToAdd.length > 0) {
            setDisplayedArtists((prev) => [...prev, ...artistsToAdd]);
            setCurrentPage(nextPage);
          }
        }
      },
      { threshold: 0.1 },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [currentPage, filteredArtists, viewMode]);

  const handleSearchClick = () => {
    inputRef.current?.focus();
  };

  const renderContent = () => {
    switch (viewMode) {
      case "grid":
        return (
          <div className="grid grid-cols-2 gap-4 md:gap-8 lg:grid-cols-4">
            {displayedArtists.map((artist) => (
              <QuickLink
                href={`/artists/${generateSlug(artist.artist_name)}`}
                key={artist.id}
              >
                <div className="relative mb-2 aspect-[3/5] overflow-hidden md:mb-4">
                  {artist.artist_photo && artist.artist_photo[0] && (
                    <Image
                      src={artist.artist_photo[0].url}
                      alt={artist.artist_name}
                      quality={50}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 25vw"
                      className="object-cover transition-transform duration-300"
                    />
                  )}
                </div>
                <h3 className="mb-8">{artist.artist_name}</h3>
              </QuickLink>
            ))}
          </div>
        );

      case "directory":
        // Group displayed artists by first letter of last name
        const artistsByLetter = displayedArtists.reduce(
          (acc, artist) => {
            const { lastName } = splitName(artist.artist_name);
            const firstLetter = lastName[0].toUpperCase();
            if (!acc[firstLetter]) {
              acc[firstLetter] = [];
            }
            acc[firstLetter].push(artist);
            return acc;
          },
          {} as Record<string, Artist[]>,
        );

        // Get all unique letters
        const letters = Object.keys(artistsByLetter).sort();

        // Split letters into 4 columns
        const columnsCount = 4;
        const itemsPerColumn = Math.ceil(letters.length / columnsCount);
        const columns = Array.from({ length: columnsCount }, (_, i) =>
          letters.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn),
        );

        return (
          <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2 lg:grid-cols-4">
            {columns.map((columnLetters, columnIndex) => (
              <div key={columnIndex} className="space-y-16">
                {columnLetters.map((letter) => (
                  <div key={letter}>
                    <p className="mb-4 text-xl font-medium">{letter}</p>
                    <div className="space-y-3">
                      {artistsByLetter[letter].map((artist) => {
                        const { firstName, lastName } = splitName(
                          artist.artist_name,
                        );
                        return (
                          <QuickLink
                            href={`/artists/${generateSlug(artist.artist_name)}`}
                            key={artist.id}
                            className="block text-xl tracking-tight text-zinc-500 hover:text-zinc-950"
                          >
                            {`${lastName}, ${firstName}`}
                          </QuickLink>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        );

      default:
        return displayedArtists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ));
    }
  };

  return (
    <>
      <section className="mb-[-4vw] overflow-x-hidden">
        <div className="container mb-4 md:mb-12">
          <div className="flex items-center justify-between">
            <div className="relative flex items-center">
              <Search
                strokeWidth={1.75}
                size={20}
                className="cursor-arrow text-zinc-500 lg:h-6 lg:w-6"
                onClick={handleSearchClick}
              />
              <input
                ref={inputRef}
                type="text"
                placeholder="Artists"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent pl-2 text-[1.3125rem] font-normal tracking-[-0.0375rem] placeholder:text-zinc-700 hover:text-zinc-500 focus:outline-none md:pl-4 lg:text-[2rem] lg:tracking-[-0.0625rem]"
              />
            </div>
            <div className="flex space-x-4 text-[1.3125rem] tracking-[-0.0375rem] md:space-x-6 lg:text-[2rem] lg:tracking-[-0.0625rem]">
              <button
                onClick={() => setViewMode("list")}
                className={`${viewMode === "list" ? "text-zinc-950" : "text-zinc-300"} hover:text-zinc-950`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`${viewMode === "grid" ? "text-zinc-950" : "text-zinc-300"} hover:text-zinc-950`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("directory")}
                className={`${viewMode === "directory" ? "text-zinc-950" : "text-zinc-300"} hover:text-zinc-950`}
              >
                Directory
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white pb-16 pt-8 md:py-24">
          <div className="container">
            {filteredArtists.length > 0 ? (
              <>
                <div
                  className={`space-y-4 md:space-y-36 md:space-y-${
                    viewMode === "list" ? "36" : "0"
                  }`}
                >
                  {renderContent()}
                </div>
                {viewMode !== "directory" && (
                  <div ref={observerRef} className="h-10" />
                )}
              </>
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
    </>
  );
}
