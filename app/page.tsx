import { FeaturedExhibitions } from "@/components/FeaturedExhibitions";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { Slider } from "@/components/Slider";
import { TerminalCTA } from "@/components/TerminalCTA";
import { Suspense } from "react";

function LoadingPlaceholder() {
  return (
    <div className="space-y-4">
      {/* Title placeholder */}
      <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-100" />
      {/* Content placeholder that matches ExhibitionCard/ProjectCard dimensions */}
      <div className="w-full">
        {/* Image placeholder with aspect-video */}
        <div className="aspect-video w-full animate-pulse rounded-lg bg-gray-100" />
        {/* Text content placeholder */}
        <div className="space-y-2 p-4">
          <div className="h-7 w-3/4 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-6 w-1/2 animate-pulse rounded-lg bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const exhibitions = [
    "celia-lees-love-language",
    "celia-lees-love-language-2",
  ];

  const projects = ["450-washington", "450-washington-2", "450-washington-3"];

  return (
    <main className="overflow-x-hidden py-12">
      <div className="container">
        <Suspense fallback={<LoadingPlaceholder />}>
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Featured Exhibitions</h1>
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
          </div>
        </Suspense>
      </div>

      <div className="container mt-12">
        <Suspense fallback={<LoadingPlaceholder />}>
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Featured Projects</h1>
            <div className="relative w-full">
              <Slider slidesPerView={2}>
                {projects.map((project) => (
                  <FeaturedProjects key={project} projects={[project]} />
                ))}
              </Slider>
            </div>
          </div>
        </Suspense>
      </div>

      <TerminalCTA />
    </main>
  );
}
