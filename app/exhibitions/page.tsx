// app/exhibitions/page.tsx

import { ConsultationCTA } from "@/components/ConsultationCTA";
import { getAllExhibitions } from "../lib/markdownExhibitions";
import { ExhibitionCard } from "@/components/ExhibitionCard";
import { QuickLink } from "@/components/Link";
import { FEATURED_EXHIBITIONS } from "@/app/lib/constants";
import { Slider } from "@/components/Slider";
import { FeaturedExhibitions } from "@/components/FeaturedExhibitions";
import { SectionHeader } from "@/components/SectionHeader";

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
      <section className="container">
        <SectionHeader
          title={
            currentExhibitions.length > 0
              ? "Current exhibitions"
              : "Exhibitions"
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

      <section className="container">
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
      <ConsultationCTA />
    </>
  );
}
