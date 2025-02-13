"use client";

import { Artist } from "@/lib/types";
import { QuickLink } from "@/components/Link";
import { Slider } from "@/components/Slider";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { generateSlug } from "@/lib/utils";

interface ArtistCardProps {
  artist: Artist;
  disableLink?: boolean;
  showInquiryButton?: boolean;
}

export function ArtistCard({
  artist,
  disableLink = false,
  showInquiryButton = false,
}: ArtistCardProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simple delay to ensure DOM is updated
    if (artist.artwork) {
      setTimeout(() => setIsReady(true), 100);
    }
  }, [artist.artwork]);

  // Create slides array only when ready
  const slides = isReady
    ? [
        // First slide - Artist photo
        {
          url: artist.artist_photo[0].url,
          alt: artist.artist_name,
          id: "artist-photo",
        },
        // First 4 artwork slides
        ...(artist.artwork ?? [])
          .slice(0, 2)
          .filter((artwork) => artwork.artwork_images?.[0])
          .map((artwork) => ({
            url: artwork.artwork_images[0].url,
            alt: `${artist.artist_name} - ${artwork.title || "Artwork"}`,
            id: artwork.id,
          })),
      ]
    : [];

  const ArtistInfo = () => (
    <>
      <h2
        className={`${
          disableLink
            ? "mt-6 text-2xl md:mt-0 md:text-4xl"
            : "mt-3 text-base md:mt-0 md:text-3xl"
        }`}
      >
        {artist.artist_name}
      </h2>
      <p
        className={`mt-0 tracking-tight text-zinc-500 ${
          disableLink
            ? "mb-4 text-base md:mb-0 md:mt-3 md:text-xl"
            : "mb-6 text-sm md:mb-0 md:mt-2 md:text-lg"
        }`}
      >
        {artist.city}
        {artist.state && `, ${artist.state}`}
        {artist.country && `, ${artist.country}`}
      </p>
      {artist.born && (
        <p
          className={`tracking-tight text-zinc-500 ${
            disableLink ? "text-base md:text-xl" : "text-sm md:text-lg"
          }`}
        >
          b. {artist.born}
        </p>
      )}
    </>
  );

  const artistSlug = generateSlug(artist.artist_name);

  return (
    <div className="grid grid-cols-1 items-start md:grid-cols-4">
      <div className="order-2 flex h-full flex-col justify-between pr-12 md:order-1">
        {disableLink ? (
          <div>
            <ArtistInfo />
          </div>
        ) : (
          <QuickLink
            href={`/artists/${artistSlug}`}
            className="text-xl text-zinc-700 transition-colors hover:text-zinc-950"
          >
            <ArtistInfo />
          </QuickLink>
        )}

        {showInquiryButton && (
          <Button asChild className="group">
            <QuickLink
              // href={`/contact?topic=artist&artistName=${encodeURIComponent(artist.artist_name)}#inquiry-form`}
              href={`/contact#inquiry-form`}
              className="mr-8 inline-flex w-[calc(100%-10rem)] min-w-[10rem] items-center justify-between rounded-md bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800"
            >
              Inquire
              <ArrowRight
                className="-me-1 ms-2 mt-0.5 transition-transform group-hover:translate-x-0.5"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
            </QuickLink>
          </Button>
        )}
      </div>

      <div className="order-1 col-span-3 md:order-2">
        {artist.artist_photo && artist.artist_photo.length > 0 ? (
          <Slider
            slidesPerView={{ mobile: 2, tablet: 2, desktop: 3 }}
            key={isReady ? "ready" : "loading"}
          >
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="group relative aspect-[2/3] w-full"
              >
                {disableLink ? (
                  <Image
                    src={slide.url}
                    alt={slide.alt}
                    fill
                    loading="lazy"
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    quality={slide.id === "artist-photo" ? 70 : 10}
                  />
                ) : (
                  <Link
                    href={`/artists/${artistSlug}`}
                    className="text-xl transition-colors hover:text-gray-600"
                  >
                    <Image
                      src={slide.url}
                      alt={slide.alt}
                      fill
                      loading="lazy"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                      quality={slide.id === "artist-photo" ? 70 : 10}
                    />
                  </Link>
                )}
              </div>
            ))}
          </Slider>
        ) : (
          <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-400">
            No images available
          </div>
        )}
      </div>
    </div>
  );
}
