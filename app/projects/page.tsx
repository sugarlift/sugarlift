// app/projects/page.tsx

import { FAQ } from "@/components/FAQ";
import { getAllProjects } from "../lib/markdownProjects";
import { ProjectCard } from "@/components/ProjectCard";
import { ConsultationCTA } from "@/components/ConsultationCTA";
export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <>
      <section className="container">
        <h2 className="mb-6 text-2xl">Projects</h2>
        <div className="grid gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
      <FAQ />
      <ConsultationCTA />
    </>
  );
}
