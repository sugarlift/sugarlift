// app/exhibitions/[slug]/page.tsx

import {
  getExhibitionData,
  getAllExhibitions,
} from "@/app/lib/markdownExhibitions";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TerminalCTA } from "@/components/TerminalCTA";
import { QuickLink } from "@/components/Link";

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
      <section className="container">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl">{exhibition.frontmatter.title}</h1>
          <p className="mb-4 text-xl text-gray-600">
            {exhibition.frontmatter.artistData
              ? `${exhibition.frontmatter.artistData.first_name} ${exhibition.frontmatter.artistData.last_name}`
              : exhibition.frontmatter.artist}
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

        {exhibition.frontmatter.artistData && (
          <div className="mt-16 border-t pt-8">
            <h2 className="mb-6 text-2xl font-semibold">About the Artist</h2>
            <div className="flex flex-col md:flex-row md:gap-8">
              {exhibition.frontmatter.artistData.attachments && (
                <div className="mb-6 md:mb-0 md:w-1/3">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={exhibition.frontmatter.artistData.attachments[0].url}
                      alt={`${exhibition.frontmatter.artistData.first_name} ${exhibition.frontmatter.artistData.last_name}`}
                      fill
                      className="rounded-lg object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                </div>
              )}
              <div className="md:w-2/3">
                <QuickLink
                  href={`/artists/${exhibition.frontmatter.artist}`}
                  className="mb-4 block text-xl font-semibold hover:text-gray-600"
                >
                  {exhibition.frontmatter.artistData.first_name}{" "}
                  {exhibition.frontmatter.artistData.last_name}
                </QuickLink>
                <div className="prose max-w-none">
                  <p>{exhibition.frontmatter.artistData.biography}</p>
                </div>
                <QuickLink
                  href={`/artists/${exhibition.frontmatter.artist}`}
                  className="mt-4 inline-block text-blue-600 hover:text-blue-800"
                >
                  View Artist Profile →
                </QuickLink>
              </div>
            </div>
          </div>
        )}
      </section>
      <TerminalCTA />
    </>
  );
}
