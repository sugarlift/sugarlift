// components/ExhibitionCard.tsx

import Image from "next/image";
import Link from "next/link";
import { type Exhibition } from "@/app/lib/markdownExhibitions";

interface ExhibitionCardProps {
  exhibition: Exhibition;
  isCurrent?: boolean;
}

export const ExhibitionCard = ({
  exhibition,
  isCurrent = false,
}: ExhibitionCardProps) => {
  const {
    frontmatter: { coverImage, title, artist },
  } = exhibition;

  return (
    <article className="group overflow-hidden rounded-lg border transition-transform hover:scale-[1.02]">
      <Link
        href={`/exhibitions/${exhibition.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        aria-current={isCurrent ? "page" : undefined}
      >
        <div className="relative h-60 w-full">
          <Image
            src={coverImage}
            alt={`Cover image for ${title}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
            priority={isCurrent}
          />
        </div>
        <div className="p-4">
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{artist}</p>
        </div>
      </Link>
    </article>
  );
};
