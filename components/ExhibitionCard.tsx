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
    // Use a Set to prevent duplicate preloads
    const preloadedUrls = new Set<string>();

    exhibition.frontmatter.galleryImages.slice(1).forEach((src) => {
      // Skip if already preloaded in this session
      if (preloadedUrls.has(src)) return;

      // Mark as preloaded
      preloadedUrls.add(src);

      // Create a hidden next/image to trigger optimization
      const imgEl = document.createElement("link");
      imgEl.rel = "preload";
      imgEl.as = "image";
      // Use the same size configuration as your visible images
      imgEl.href = `/_next/image?url=${encodeURIComponent(src)}&w=1200&q=75`;
      document.head.appendChild(imgEl);
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
