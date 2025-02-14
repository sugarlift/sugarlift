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
      formattedStartDate,
      formattedEndDate,
      city,
    },
  } = exhibition;

  return (
    <LinkComponent href={`/exhibitions/${exhibition.slug}`}>
      <div className="group">
        <div className="relative aspect-[3/2] w-full overflow-hidden">
          <Image
            src={coverImage}
            alt={`Cover image for ${title}`}
            quality={50}
            fill
            sizes="(min-width: 1280px) 1440px, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
          />
        </div>
        <div className="p-3 pl-0 md:p-4 md:pl-0">
          <h3 className="text-zinc-700">{title}</h3>
          <p className="text-sm tracking-tight text-zinc-500 md:mt-0.5">
            {formattedStartDate} - {formattedEndDate}, {city}
          </p>
        </div>
      </div>
    </LinkComponent>
  );
};
