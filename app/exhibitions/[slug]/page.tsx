// app/exhibitions/[slug]/page.tsx

import {
  getExhibitionData,
  getAllExhibitions,
} from "@/app/lib/markdownExhibitions";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { COMPANY_METADATA } from "@/app/lib/constants";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const exhibitions = await getAllExhibitions();
  return exhibitions.map((exhibition) => ({
    slug: exhibition.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const exhibition = await getExhibitionData(slug);

  if (!exhibition) {
    return {
      title: "Exhibition Not Found",
    };
  }

  return {
    title: `${exhibition.frontmatter.title} | ${COMPANY_METADATA.name}`,
    description: `Exhibition at Sugarlift Gallery`,
  };
}

export default async function ExhibitionPage({ params }: { params: Params }) {
  const { slug } = await params;
  const exhibition = await getExhibitionData(slug);

  if (!exhibition) {
    notFound();
  }

  return (
    <>
      <section className="container">
        <div className="mb-16">
          <h1 className="mb-4">{exhibition.frontmatter.title}</h1>
          <p className="text-zinc-500">{exhibition.frontmatter.location}</p>
          <p className="text-zinc-500">
            {exhibition.frontmatter.formattedStartDate} -{" "}
            {exhibition.frontmatter.formattedEndDate}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {exhibition.frontmatter.galleryImages.map((image, index) => (
            <div
              key={index}
              className={`relative ${
                index % 3 === 0 ? "aspect-[3/2] md:col-span-2" : "aspect-[4/3]"
              } w-full`}
            >
              <Image
                src={image}
                alt={`${exhibition.frontmatter.title} - Image ${index + 1}`}
                sizes="(min-width: 1024px) 90vw, (min-width: 768px) 90vw, 100vw"
                fill
                quality={50}
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </section>
      <section
        className="prose"
        dangerouslySetInnerHTML={{ __html: exhibition.content }}
      />
    </>
  );
}
