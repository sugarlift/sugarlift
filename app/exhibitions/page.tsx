// app/exhibitions/page.tsx

import { getAllExhibitions } from "../lib/markdownExhibitions";
import { ExhibitionCard } from "@/components/ExhibitionCard";
import { QuickLink } from "@/components/Link";
import { FEATURED_EXHIBITIONS } from "@/app/lib/constants";
import { Slider } from "@/components/Slider";
import { FeaturedExhibitions } from "@/components/FeaturedExhibitions";
import { SectionHeader } from "@/components/SectionHeader";
import { Metadata } from "next";
import { COMPANY_METADATA } from "@/app/lib/constants";

// Add static generation config
export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: `${COMPANY_METADATA.name} | Exhibitions`,
  description:
    "Sugarlift is a contemporary art gallery based in New York, an industry-leading art consulting service, and a global artist community representing today's best and brightest contemporary artists.",
  alternates: {
    canonical: `${COMPANY_METADATA.url}/exhibitions`,
  },
  openGraph: {
    title: `${COMPANY_METADATA.name} | Exhibitions`,
    description:
      "Sugarlift is a contemporary art gallery based in New York, an industry-leading art consulting service, and a global artist community representing today's best and brightest contemporary artists.",
    url: `${COMPANY_METADATA.url}/exhibitions`,
    siteName: COMPANY_METADATA.name,
    images: [
      {
        url: `${COMPANY_METADATA.url}/og-image.jpg`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

async function getFeaturedExhibitionsData() {
  const exhibitions = await getAllExhibitions();

  return {
    currentExhibitions: exhibitions.filter(
      (e) => e.frontmatter.status === "current",
    ),
    pastExhibitions: exhibitions.filter((e) => e.frontmatter.status === "past"),
    featuredExhibitions: exhibitions.filter((exhibition) =>
      FEATURED_EXHIBITIONS.some(
        (featuredSlug) => featuredSlug === exhibition.slug,
      ),
    ),
  };
}

export default async function ExhibitionsPage() {
  const { currentExhibitions, pastExhibitions, featuredExhibitions } =
    await getFeaturedExhibitionsData();

  return (
    <>
      <div className="overflow-x-hidden">
        <section className="container">
          <SectionHeader
            title={
              currentExhibitions.length > 0
                ? "Current exhibitions"
                : "Featured exhibitions"
            }
            pageTitle={true}
          />
          {currentExhibitions.length > 0 ? (
            <div className="mb-12 grid gap-8">
              {currentExhibitions.map((exhibition) => (
                <ExhibitionCard
                  key={exhibition.slug}
                  exhibition={exhibition}
                  LinkComponent={QuickLink}
                />
              ))}
            </div>
          ) : (
            <div className="relative w-full">
              <Slider slidesPerView={1}>
                {featuredExhibitions.map((exhibition) => (
                  <FeaturedExhibitions
                    key={exhibition.slug}
                    exhibitions={[exhibition.slug]}
                  />
                ))}
              </Slider>
            </div>
          )}
        </section>

        <section className="container" id="past-exhibitions">
          <SectionHeader title="Past exhibitions" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {pastExhibitions.map((exhibition) => (
              <ExhibitionCard
                key={exhibition.slug}
                exhibition={exhibition}
                LinkComponent={QuickLink}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
