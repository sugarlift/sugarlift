import { Artist } from "@/lib/types";
import { QuickLink } from "@/components/Link";
import { Slider } from "@/components/Slider";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
  const ArtistInfo = () => (
    <>
      <h2>{artist.artist_name}</h2>
      <p className="mt-4 tracking-tight text-zinc-500">
        {artist.city}
        {artist.state && `, ${artist.state}`}
        {artist.country && `, ${artist.country}`}
      </p>
      <p className="tracking-tight text-zinc-500">b. {artist.born}</p>
    </>
  );

  const artistSlug = artist.artist_name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, "-");

  return (
    <div className="grid grid-cols-4 items-start">
      <div className="flex h-full flex-col justify-between">
        {disableLink ? (
          <div className="text-xl">
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
              href="/contact"
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
      <div className="col-span-3">
        {artist.artist_photo && artist.artist_photo.length > 0 ? (
          <Slider slidesPerView={3}>
            {artist.artist_photo.map((attachment, index) => (
              <div key={index} className="relative aspect-[2/3] w-full">
                {disableLink ? (
                  <Image
                    src={attachment.url}
                    alt={`${artist.artist_name} - Work ${index + 1}`}
                    fill
                    loading="eager"
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                  />
                ) : (
                  <Link
                    href={`/artists/${artistSlug}`}
                    className="text-xl transition-colors hover:text-gray-600"
                  >
                    <Image
                      src={attachment.url}
                      alt={`${artist.artist_name} - Work ${index + 1}`}
                      fill
                      loading="eager"
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
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
