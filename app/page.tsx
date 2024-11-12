import { FeaturedExhibitions } from "@/components/FeaturedExhibitions";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { Slider } from "@/components/ui/Slider";

export default function Home() {
  const exhibitions = [
    "celia-lees-love-language",
    "celia-lees-love-language-2",
  ];

  const projects = ["450-washington", "450-washington-2", "450-washington-3"];

  return (
    <main className="overflow-x-hidden py-12">
      <h1 className="container mb-6 text-2xl font-bold">
        Featured Exhibitions
      </h1>
      <div className="container">
        <Slider slidesPerView={1}>
          {exhibitions.map((exhibition) => (
            <FeaturedExhibitions key={exhibition} exhibitions={[exhibition]} />
          ))}
        </Slider>
      </div>

      <h1 className="container mb-6 mt-12 text-2xl font-bold">
        Featured Projects
      </h1>
      <div className="container">
        <Slider slidesPerView={2}>
          {projects.map((project) => (
            <FeaturedProjects key={project} projects={[project]} />
          ))}
        </Slider>
      </div>
    </main>
  );
}
