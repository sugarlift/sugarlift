// app/projects/page.tsx

import { getAllProjects } from "../lib/markdownProjects";
import { ProjectCard } from "@/components/ProjectCard";

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="container py-12">
      <section>
        <h2 className="mb-6 text-2xl font-bold">Projects</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}
