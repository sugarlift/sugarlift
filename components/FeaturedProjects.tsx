import { getAllProjects } from "@/app/lib/markdownProjects";
import { ProjectCard } from "@/components/ProjectCard";

interface FeaturedProjectsProps {
  projects: string[];
}

export async function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const allProjects = await getAllProjects();

  const featuredProjects = allProjects
    .filter((project) => projects.includes(project.slug))
    .map((project) => ({
      ...project,
      frontmatter: {
        ...project.frontmatter,
      },
    }));

  return (
    <>
      {featuredProjects.map((project) => (
        <ProjectCard key={project.slug} project={project} priority={true} />
      ))}
    </>
  );
}
