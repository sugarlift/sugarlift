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
    <>
      {featuredProjects.map(
        (project) =>
          project && (
            <ProjectCard key={project.slug} project={project} priority={true} />
          ),
      )}
    </>
  );
}
