// lib/markdownProjects.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

// Interface for the raw markdown frontmatter
export interface ProjectFrontmatter {
  title: string;
  location: string;
  category: "Multi-Family" | "Workplace" | "Healthcare" | "Affordable";
  client: string;
  architect: string;
  year: string;
  galleryImages: string[];
  description?: string;
}

// Interface for the processed project data
export interface Project {
  slug: string;
  frontmatter: ProjectFrontmatter & {
    coverImage: string; // Guaranteed to be the first gallery image
  };
  content: string;
}

const projectsDirectory = path.join(process.cwd(), "content", "projects");

export async function getProjectData(slug: string): Promise<Project | null> {
  try {
    const fullPath = path.join(projectsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Parse frontmatter
    const { data, content } = matter(fileContents);
    const frontmatter = data as ProjectFrontmatter;

    // Process markdown content
    const processedContent = await remark().use(html).process(content);
    const contentHtml = processedContent.toString();

    // Ensure gallery images exist and get cover image
    if (!frontmatter.galleryImages || frontmatter.galleryImages.length === 0) {
      throw new Error(`Project ${slug} must have at least one gallery image`);
    }

    return {
      slug,
      frontmatter: {
        ...frontmatter,
        coverImage: frontmatter.galleryImages[0],
      },
      content: contentHtml,
    };
  } catch (e) {
    console.error(`Error processing project ${slug}:`, e);
    return null;
  }
}

export async function getAllProjects(): Promise<Project[]> {
  // Ensure directory exists
  if (!fs.existsSync(projectsDirectory)) {
    console.warn("Projects directory not found, creating it...");
    fs.mkdirSync(projectsDirectory, { recursive: true });
    return [];
  }

  // Get file names under /content/projects
  const fileNames = fs.readdirSync(projectsDirectory);

  const allProjectsData = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith(".md"))
      .map(async (fileName) => {
        const slug = fileName.replace(/\.md$/, "");
        const projectData = await getProjectData(slug);
        return projectData;
      })
  );

  // Filter out any null values and sort projects
  const projects = allProjectsData.filter(
    (data): data is Project => data !== null
  );

  // Sort projects by year (newest first)
  return projects.sort((a, b) => {
    return parseInt(b.frontmatter.year) - parseInt(a.frontmatter.year);
  });
}

export async function getProjectsByCategory(
  category: ProjectFrontmatter["category"]
): Promise<Project[]> {
  const allProjects = await getAllProjects();
  return allProjects.filter(
    (project) => project.frontmatter.category === category
  );
}

export async function getRelatedProjects(
  currentSlug: string,
  category: ProjectFrontmatter["category"],
  limit: number = 3
): Promise<Project[]> {
  const allProjects = await getAllProjects();

  return allProjects
    .filter(
      (project) =>
        project.slug !== currentSlug &&
        project.frontmatter.category === category
    )
    .slice(0, limit);
}
