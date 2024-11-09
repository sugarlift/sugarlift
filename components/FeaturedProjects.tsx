import { getProjectData } from "@/app/lib/markdownProjects";
import { ProjectCard } from "./ProjectCard";

interface FeaturedProjectsProps {
  projects: string[];
}

export async function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const featuredProjects = await Promise.all(
    projects
      .map((slug) => getProjectData(slug))
      .filter(
        (project): project is NonNullable<typeof project> => project !== null,
      ),
  );

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {featuredProjects.map(
        (project) =>
          project && (
            <ProjectCard key={project.slug} project={project} priority={true} />
          ),
      )}
    </div>
  );
}
