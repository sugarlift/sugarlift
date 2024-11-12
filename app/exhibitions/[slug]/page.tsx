// app/exhibitions/[slug]/page.tsx

import {
  getExhibitionData,
  getAllExhibitions,
} from "@/app/lib/markdownExhibitions";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TerminalCTA } from "@/components/TerminalCTA";

export async function generateStaticParams() {
  const exhibitions = await getAllExhibitions();
  return exhibitions.map((exhibition) => ({
    slug: exhibition.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const exhibition = await getExhibitionData(slug);

  if (!exhibition) {
    return {
      title: "Exhibition Not Found",
    };
  }

  return {
    title: `${exhibition.frontmatter.title} by ${exhibition.frontmatter.artist}`,
    description: `Exhibition by ${exhibition.frontmatter.artist}`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exhibition = await getExhibitionData(slug);

  if (!exhibition) {
    notFound();
  }

  return (
    <>
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl">{exhibition.frontmatter.title}</h1>
          <p className="mb-4 text-xl text-gray-600">
            {exhibition.frontmatter.artist}
          </p>
          <p className="text-gray-600">
            {new Date(exhibition.frontmatter.startDate).toLocaleDateString()} -{" "}
            {new Date(exhibition.frontmatter.endDate).toLocaleDateString()}
          </p>
          <p className="text-gray-600">{exhibition.frontmatter.location}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {exhibition.frontmatter.galleryImages.map((image, index) => (
            <div
              key={index}
              className={`relative ${
                index % 3 === 0 ? "aspect-video md:col-span-2" : "aspect-[4/3]"
              } w-full`}
            >
              <Image
                src={image}
                alt={`${exhibition.frontmatter.title} - Image ${index + 1}`}
                sizes="(min-width: 1024px) 90vw, (min-width: 768px) 90vw, 100vw"
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        <div
          className="prose prose-lg mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: exhibition.content }}
        />
      </div>
      <TerminalCTA />
    </>
  );
}
