import { FeaturedExhibitions } from "@/components/FeaturedExhibitions";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { Slider } from "@/components/Slider";
import { TerminalCTA } from "@/components/TerminalCTA";

export default function Home() {
  const exhibitions = [
    "celia-lees-love-language",
    "celia-lees-love-language-2",
  ];

  const projects = ["450-washington", "450-washington-2", "450-washington-3"];

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
