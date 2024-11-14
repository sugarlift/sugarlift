import { FeaturedExhibitions } from "@/components/FeaturedExhibitions";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { FeaturedArtists } from "@/components/FeaturedArtists";
import { Slider } from "@/components/Slider";
import { TerminalCTA } from "@/components/TerminalCTA";

// Mark the page as static
export const dynamic = "force-static";

// If you need to revalidate the page periodically (optional)
export const revalidate = 3600; // revalidate every hour

async function getFeaturedData() {
  // Replace with your actual data fetching logic
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
        <h1 className="mb-8 text-2xl">Featured Exhibitions</h1>
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

      <section className="container mt-12">
        <h1 className="mb-8 text-2xl">Featured Artists</h1>
        <div className="relative w-full">
          <Slider slidesPerView={4}>
            {artists.map((artist) => (
              <FeaturedArtists key={artist} slug={artist} />
            ))}
          </Slider>
        </div>
      </section>

      <section className="container mt-12">
        <h1 className="mb-8 text-2xl">Featured Projects</h1>
        <div className="relative w-full">
          <Slider slidesPerView={2}>
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
