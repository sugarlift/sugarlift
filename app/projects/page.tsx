// app/projects/page.tsx

import { getAllProjects } from "../lib/markdownProjects";
import { ProjectCard } from "@/components/ProjectCard";
import { TerminalCTA } from "@/components/TerminalCTA";
export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <>
      <div className="container py-12">
        <section>
          <h2 className="mb-6 text-2xl font-bold">Projects</h2>
          <div className="grid gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      </div>
      <TerminalCTA />
    </>
  );
}
