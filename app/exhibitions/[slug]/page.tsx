// app/exhibitions/[slug]/page.tsx
import {
  getExhibitionData,
  getAllExhibitions,
} from "../../lib/markdownExhibitions";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

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
  const resolvedParams = await params;
  const exhibition = await getExhibitionData(resolvedParams.slug);

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
  const resolvedParams = await params;
  const exhibition = await getExhibitionData(resolvedParams.slug);

  if (!exhibition) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {exhibition.frontmatter.title}
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          {exhibition.frontmatter.artist}
        </p>
        <p className="text-gray-600">
          {new Date(exhibition.frontmatter.startDate).toLocaleDateString()} -{" "}
          {new Date(exhibition.frontmatter.endDate).toLocaleDateString()}
        </p>
        <p className="text-gray-600">{exhibition.frontmatter.location}</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {exhibition.frontmatter.galleryImages.map((image, index) => (
          <div key={image} className="relative w-full aspect-[16/9]">
            <Image
              src={image}
              alt={`${exhibition.frontmatter.title} - Image ${index + 1}`}
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      <div
        className="mt-8 prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: exhibition.content }}
      />
    </div>
  );
}
