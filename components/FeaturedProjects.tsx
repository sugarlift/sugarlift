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
        displayName: project.frontmatter.artistsData?.[0]
          ? `${project.frontmatter.artistsData[0].first_name} ${project.frontmatter.artistsData[0].last_name}`
          : project.frontmatter.artists?.[0],
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
