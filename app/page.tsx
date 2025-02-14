import { FeaturedExhibitions } from "@/components/FeaturedExhibitions";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { FeaturedArtists } from "@/components/FeaturedArtists";
import { Slider } from "@/components/Slider";
import { supabase } from "@/lib/supabase";
import { FEATURED_EXHIBITIONS, FEATURED_PROJECTS } from "@/app/lib/constants";
import { SectionHeader } from "@/components/SectionHeader";
import { getPlausibleStats } from "@/lib/plausible";

// Change from static to dynamic
export const dynamic = "force-dynamic";

async function getFeaturedData() {
  // Get view counts first
  const viewCounts = await getPlausibleStats();

  // Add debug logging
  console.log("Plausible view counts in getFeaturedData:", viewCounts);

  const { data: artists } = await supabase
    .from("artists")
    .select("*")
    .eq("live_in_production", true);

  // Add view counts and sort
  const artistsWithStats = (artists || [])
    .map((artist) => ({
      ...artist,
      viewCount: viewCounts[artist.artist_name] || 0,
    }))
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 9); // Keep only top 9 artists

  return {
    exhibitions: [...FEATURED_EXHIBITIONS],
    projects: [...FEATURED_PROJECTS],
    artists: artistsWithStats,
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
