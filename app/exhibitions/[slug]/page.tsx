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

  const artistNames = exhibition.frontmatter.artistsData
    ? exhibition.frontmatter.artistsData
        .map((artist) => `${artist.first_name} ${artist.last_name}`)
        .join(", ")
    : exhibition.frontmatter.artists.join(", ");

  return {
    title: `${exhibition.frontmatter.title} by ${artistNames}`,
    description: `Exhibition by ${artistNames}`,
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
            {exhibition.frontmatter.artistsData
              ? exhibition.frontmatter.artistsData
                  .map((artist) => `${artist.first_name} ${artist.last_name}`)
                  .join(", ")
              : exhibition.frontmatter.artists.join(", ")}
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

        {exhibition.frontmatter.artistsData && (
          <div className="mt-16 border-t pt-8">
            {exhibition.frontmatter.artistsData.map((artist, index) => (
              <div key={index} className="mb-8">
                <div className="flex flex-col md:flex-row md:gap-8">
                  {artist.attachments && (
                    <div className="mb-6 md:mb-0 md:w-1/3">
                      <div className="relative aspect-square w-full">
                        <Image
                          src={artist.attachments[0].url}
                          alt={`${artist.first_name} ${artist.last_name}`}
                          fill
                          className="rounded-lg object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    </div>
                  )}
                  <div className="md:w-2/3">
                    <QuickLink
                      href={`/artists/${exhibition.frontmatter.artists[index]}`}
                      className="mb-4 block text-xl font-semibold hover:text-gray-600"
                    >
                      {artist.first_name} {artist.last_name}
                    </QuickLink>
                    <div className="prose max-w-none">
                      <p>{artist.biography}</p>
                    </div>
                    <QuickLink
                      href={`/artists/${exhibition.frontmatter.artists[index]}`}
                      className="mt-4 inline-block text-blue-600 hover:text-blue-800"
                    >
                      View Artist Profile →
                    </QuickLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <TerminalCTA />
    </>
  );
}
