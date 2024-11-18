import { FeaturedExhibitions } from "@/components/FeaturedExhibitions";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { FeaturedArtists } from "@/components/FeaturedArtists";
import { Slider } from "@/components/Slider";
import { TerminalCTA } from "@/components/TerminalCTA";
import { QuickLink } from "@/components/Link";
import { ArrowRight } from "lucide-react";

// Mark the page as static
export const dynamic = "force-static";

// If you need to revalidate the page periodically (optional)
export const revalidate = 3600; // revalidate every hour

async function getFeaturedData() {
  const exhibitions = [
    "celia-lees-love-language",
    "celia-lees-love-language-2",
  ];
  const projects = ["450-washington", "450-washington-2", "450-washington-3"];
  const artists = [
    "maja-dlugolecki",
    "celia-lees",
    "fabienne-meyer",
    "kenny-nguyen",
    "alicia-gimeno",
  ];

  return {
    exhibitions,
    projects,
    artists,
  };
}

export default async function Home() {
  const { exhibitions, projects, artists } = await getFeaturedData();

  return (
    <>
      <section className="container">
        <div className="mb-4 md:mb-11">
          <QuickLink
            href="/exhibitions"
            className="group flex items-center text-zinc-700 transition hover:text-zinc-950"
          >
            <h1>Exhibitions</h1>
            <ArrowRight
              className="-me-1 ms-1 mt-0.5 h-4 transition-transform group-hover:translate-x-1 lg:ms-2 lg:mt-1 lg:h-10"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </QuickLink>
        </div>
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
        <div className="mb-4 md:mb-11">
          <QuickLink
            href="/artists"
            className="group flex items-center text-zinc-700 transition hover:text-zinc-950"
          >
            <h1>Featured Artists</h1>
            <ArrowRight
              className="-me-1 ms-1 mt-0.5 h-4 transition-transform group-hover:translate-x-1 lg:ms-2 lg:mt-1 lg:h-10"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </QuickLink>
        </div>
        <div className="relative w-full">
          <Slider slidesPerView={{ mobile: 2, tablet: 3, desktop: 4 }}>
            {artists.map((artist) => (
              <FeaturedArtists key={artist} slug={artist} />
            ))}
          </Slider>
        </div>
      </section>

      <section className="container">
        <div className="mb-4 md:mb-11">
          <QuickLink
            href="/projects"
            className="group flex items-center text-zinc-700 transition hover:text-zinc-950"
          >
            <h1>Art consulting</h1>
            <ArrowRight
              className="-me-1 ms-1 mt-0.5 h-4 transition-transform group-hover:translate-x-1 lg:ms-2 lg:mt-1 lg:h-10"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </QuickLink>
        </div>
        <div className="relative w-full">
          <Slider slidesPerView={{ mobile: 1, tablet: 2, desktop: 2 }}>
            {projects.map((project) => (
              <FeaturedProjects key={project} projects={[project]} />
            ))}
          </Slider>
        </div>
      </section>

      <TerminalCTA />
    </>
  );
}
