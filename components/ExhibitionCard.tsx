// components/ExhibitionCard.tsx

import Image from "next/image";
import { type Exhibition } from "@/app/lib/markdownExhibitions";
import Link, { LinkProps } from "next/link";
import { ComponentType } from "react";

interface ExhibitionCardProps {
  exhibition: Exhibition;
  LinkComponent?: ComponentType<LinkProps & { children: React.ReactNode }>;
  priority?: boolean;
}

export const ExhibitionCard = ({
  exhibition,
  LinkComponent = Link,
  priority = false,
}: ExhibitionCardProps) => {
  const {
    frontmatter: { coverImage, title, artists, artistsData },
  } = exhibition;

  const artistNames = artistsData
    ? artistsData
        .map((artist) => `${artist.first_name} ${artist.last_name}`)
        .join(", ")
    : artists.join(", ");

  return (
    <LinkComponent href={`/exhibitions/${exhibition.slug}`}>
      <div className="relative aspect-video w-full">
        <Image
          src={coverImage}
          alt={`Cover image for ${title}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
          loading={priority ? "eager" : "lazy"}
          priority={priority}
        />
      </div>
      <div className="p-4 pl-0">
        <h3 className="text-xl tracking-tight">{title}</h3>
        <p className="mt-2 text-gray-800">{artistNames}</p>
      </div>
    </LinkComponent>
  );
};
