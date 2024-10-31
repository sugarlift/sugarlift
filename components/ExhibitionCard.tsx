// components/ExhibitionCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

type Exhibition = {
  slug: string;
  frontmatter: {
    title: string;
    artist: string;
    startDate: string;
    endDate: string;
    galleryImages: string[];
  };
};

type ExhibitionCardProps = {
  exhibition: Exhibition;
  isCurrent?: boolean;
};

export default function ExhibitionCard({
  exhibition,
  isCurrent = false,
}: ExhibitionCardProps) {
  const handleMouseEnter = () => {
    // Use window.Image instead of Image
    exhibition.frontmatter.galleryImages.slice(1).forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  };

  return (
    <Link
      href={`/exhibitions/${exhibition.slug}`}
      className="block group"
      onMouseEnter={handleMouseEnter}
    >
      <div className="relative w-full aspect-[16/9]">
        <Image
          src={exhibition.frontmatter.galleryImages[0]}
          alt={exhibition.frontmatter.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-opacity group-hover:opacity-90"
          priority={isCurrent}
        />
      </div>
      <h3
        className={`${
          isCurrent ? "text-xl" : "text-lg"
        } font-semibold mb-2 mt-4`}
      >
        {exhibition.frontmatter.title}
      </h3>
      <p className="text-gray-600">{exhibition.frontmatter.artist}</p>
      {isCurrent && (
        <p className="text-gray-600">
          {new Date(exhibition.frontmatter.startDate).toLocaleDateString()} -{" "}
          {new Date(exhibition.frontmatter.endDate).toLocaleDateString()}
        </p>
      )}
    </Link>
  );
}
