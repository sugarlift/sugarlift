import { FeaturedExhibitions } from "@/components/FeaturedExhibitions";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { FeaturedArtists } from "@/components/FeaturedArtists";
import { Slider } from "@/components/Slider";
import { supabase } from "@/lib/supabase";
import { FEATURED_EXHIBITIONS, FEATURED_PROJECTS } from "@/app/lib/constants";
import { SectionHeader } from "@/components/SectionHeader";
import { Metadata } from "next";
import { COMPANY_METADATA } from "@/app/lib/constants";

export const metadata: Metadata = {
  title: `${COMPANY_METADATA.name} | Welcome`,
  description:
    "Sugarlift is a contemporary art gallery based in New York, an industry-leading art consulting service, and a global artist community representing today's best and brightest contemporary artists.",
};

// Mark the page as static
export const dynamic = "force-static";

// If you need to revalidate the page periodically (optional)
export const revalidate = 3600; // revalidate every hour

async function getFeaturedData() {
  const { data: artists } = await supabase
    .from("artists")
    .select("*")
    .eq("live_in_production", true)
    .order("view_count", { ascending: false })
    .order("artist_name", { ascending: true })
    .limit(9);

  return {
    exhibitions: [...FEATURED_EXHIBITIONS],
    projects: [...FEATURED_PROJECTS],
    artists: artists || [],
  };
}

export default async function Home() {
  const { exhibitions, projects, artists } = await getFeaturedData();

  return (
    <>
      <div className="overflow-x-hidden">
        <section className="container">
          <SectionHeader
            title="Exhibitions"
            href="/exhibitions"
            link={true}
            pageTitle={true}
          />
          <div className="relative w-full">
            <Slider slidesPerView={1}>
              {exhibitions.map((exhibition) => (
                <FeaturedExhibitions
                  key={exhibition}
                  exhibitions={[exhibition]}
                />
              ))}
            </Slider>
          </div>
        </section>

        <section className="container">
          <SectionHeader title="Artists" href="/artists" link={true} />
          <div className="relative w-full">
            <Slider slidesPerView={{ mobile: 2, tablet: 3, desktop: 4 }}>
              {artists.map((artist) => (
                <FeaturedArtists key={artist.id} artist={artist} />
              ))}
            </Slider>
          </div>
        </section>

        <section className="container">
          <SectionHeader title="Clients" href="/clients" link={true} />
          <div className="relative w-full">
            <Slider slidesPerView={{ mobile: 1, tablet: 2, desktop: 2 }}>
              {projects.map((project) => (
                <FeaturedProjects key={project} projects={[project]} />
              ))}
            </Slider>
          </div>
        </section>
      </div>
    </>
  );
}
