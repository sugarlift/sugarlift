// app/projects/page.tsx

import { getAllProjects } from "../lib/markdownProjects";
import { ProjectCard } from "@/components/ProjectCard";

export default async function ProjectsPage() {
  const projects = await getAllProjects();
  const currentProjects = projects.filter(
    (e) => e.frontmatter.status === "current",
  );
  const pastProjects = projects.filter((e) => e.frontmatter.status === "past");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <section>
        <h2 className="mb-6 text-2xl font-bold">Current Projects</h2>
        <div className="mb-12 grid grid-cols-1 gap-8">
          {currentProjects.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              isCurrent={true}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold">Past Projects</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {pastProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}
