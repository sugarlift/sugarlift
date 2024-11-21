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
    frontmatter: {
      coverImage,
      title,
      artists,
      artistsData,
      formattedStartDate,
      formattedEndDate,
      city,
    },
  } = exhibition;

  const artistNames = artistsData
    ? artistsData.map((artist) => `${artist.artist_name}`).join(", ")
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
        <h3 className="text-zinc-700">
          {artistNames}: {title}
        </h3>
        <p className="mt-0.5 text-sm tracking-tight text-zinc-500">
          {formattedStartDate} - {formattedEndDate}, {city}
        </p>
      </div>
    </LinkComponent>
  );
};
