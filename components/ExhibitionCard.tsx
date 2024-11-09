// components/ExhibitionCard.tsx

import Image from "next/image";
import { Link } from "@/components/Link";
import { type Exhibition } from "@/app/lib/markdownExhibitions";

interface ExhibitionCardProps {
  exhibition: Exhibition;
  priority?: boolean;
}

export const ExhibitionCard = ({
  exhibition,
  priority = false,
}: ExhibitionCardProps) => {
  const {
    frontmatter: { coverImage, title, artist },
  } = exhibition;

  return (
    <article className="group overflow-hidden rounded-lg border transition-transform hover:scale-[1.02]">
      <Link
        href={`/exhibitions/${exhibition.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <div className="relative h-60 w-full">
          <Image
            src={coverImage}
            alt={`Cover image for ${title}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform group-hover:scale-105"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
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
