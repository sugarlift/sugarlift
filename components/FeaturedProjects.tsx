import { Project, getProjectData } from "@/app/lib/markdownProjects";
import { ProjectCard } from "./ProjectCard";

interface FeaturedProjectsProps {
  projects: string[];
}

export async function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const projectPromises = projects.map((slug) => getProjectData(slug));
  const projectResults = await Promise.all(projectPromises);

  const featuredProjects = projectResults
    .filter((project): project is Project => project !== null)
    .map((project) => ({
      ...project,
      frontmatter: {
        ...project.frontmatter,
        displayName: project.frontmatter.artistData
          ? `${project.frontmatter.artistData.first_name} ${project.frontmatter.artistData.last_name}`
          : project.frontmatter.artist,
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
