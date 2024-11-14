// app/projects/page.tsx

import { FAQ } from "@/components/FAQ";
import { getAllProjects } from "../lib/markdownProjects";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { Slider } from "@/components/Slider";
import { ConsultationCTA } from "@/components/ConsultationCTA";

async function getFeaturedData() {
  const allProjects = await getAllProjects();
  const featuredProjects = ["450-washington", "450-washington-2"];

  // Group projects by category
  const projectsByCategory = allProjects.reduce(
    (acc, project) => {
      const category = project.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(project.slug);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  return {
    projectsByCategory,
    featuredProjects,
  };
}

export default async function ProjectsPage() {
  const { projectsByCategory, featuredProjects } = await getFeaturedData();

  return (
    <>
      <section className="container mt-12">
        <h1 className="mb-8 text-2xl">Featured Projects</h1>
        <div className="relative w-full">
          <Slider slidesPerView={1}>
            {featuredProjects.map((project) => (
              <FeaturedProjects key={project} projects={[project]} />
            ))}
          </Slider>
        </div>
      </section>

      {Object.entries(projectsByCategory).map(([category, projects]) => (
        <section key={category} className="container mt-12">
          <h1 className="mb-8 text-2xl">{category}</h1>
          <div className="relative w-full">
            <Slider slidesPerView={2}>
              {projects.map((project) => (
                <FeaturedProjects key={project} projects={[project]} />
              ))}
            </Slider>
          </div>
        </section>
      ))}

      <FAQ />
      <ConsultationCTA />
    </>
  );
}
