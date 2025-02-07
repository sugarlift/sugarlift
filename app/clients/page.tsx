// app/clients/page.tsx

import { getAllProjects } from "@/app/lib/markdownProjects";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { Slider } from "@/components/Slider";
import { ConsultationCTA } from "@/components/ConsultationCTA";
import { FEATURED_PROJECTS } from "@/app/lib/constants";

async function getFeaturedData() {
  const allProjects = await getAllProjects();

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
    featuredProjects: [...FEATURED_PROJECTS],
  };
}

export default async function ProjectsPage() {
  const { projectsByCategory, featuredProjects } = await getFeaturedData();

  return (
    <>
      <section className="container">
        <div className="mb-[1.33vw]">
          <h1>Clients</h1>
        </div>
        <div className="relative w-full">
          <Slider slidesPerView={1}>
            {featuredProjects.map((project) => (
              <FeaturedProjects key={project} projects={[project]} />
            ))}
          </Slider>
        </div>
      </section>

      {Object.entries(projectsByCategory).map(([category, projects]) => (
        <section key={category} className="container">
          <div className="mb-[1.33vw]">
            <h2>{category}</h2>
          </div>
          <div className="relative w-full">
            <Slider slidesPerView={2}>
              {projects.map((project) => (
                <FeaturedProjects key={project} projects={[project]} />
              ))}
            </Slider>
          </div>
        </section>
      ))}

      <ConsultationCTA />
    </>
  );
}
