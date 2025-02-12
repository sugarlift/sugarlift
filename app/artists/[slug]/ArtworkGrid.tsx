"use client";

import { Artist, Artwork } from "@/lib/types";
import Image from "next/image";
import { useState } from "react";
import { ArtworkModal } from "./ArtworkModal";

export function ArtworkGrid({ artwork }: { artwork: Artist["artwork"] }) {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  if (!artwork || artwork.length === 0) return null;

  return (
    <>
      <div className="mt-12">
        <div className="columns-1 gap-12 md:columns-2 lg:columns-3">
          {artwork.map((artwork) => (
            <div
              key={artwork.id}
              className="group relative mb-12 cursor-pointer break-inside-avoid"
              onClick={() => setSelectedArtwork(artwork)}
            >
              {artwork.artwork_images && artwork.artwork_images[0] && (
                <>
                  <div className="relative w-full">
                    <Image
                      src={artwork.artwork_images[0].url}
                      alt={artwork.title || `Artwork by ${artwork.artist_name}`}
                      width={600}
                      height={400}
                      quality={5}
                      className="h-auto w-full"
                      sizes="(max-width: 768px) 100vw, (max-width: 600px) 50vw, 33vw"
                      priority
                    />
                  </div>
                  {/* Hover overlay for tablet and desktop */}
                  <div className="absolute inset-0 hidden bg-black/60 p-4 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:block">
                    <div className="flex h-full flex-col justify-end">
                      <h3 className="text-lg font-medium">
                        {artwork.title || "Untitled"}, {artwork.year}
                      </h3>
                      <p className="mt-1 text-sm text-white/80">
                        {artwork.medium}, {artwork.height}"H x {artwork.width}"W
                      </p>
                    </div>
                  </div>
                  {/* Mobile details */}
                  <div className="mt-4 md:hidden">
                    <h3 className="text-lg font-medium text-zinc-900">
                      {artwork.title || "Untitled"}, {artwork.year}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {artwork.medium}, {artwork.height}"H x {artwork.width}"W
                    </p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedArtwork && (
        <ArtworkModal
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
        />
      )}
    </>
  );
}
