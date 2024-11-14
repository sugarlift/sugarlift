// app/lib/markdownProjects.ts

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { StaticImageData } from "next/image";
import { projectImages as importedProjectImages } from "@/content/projects/images";
import { supabase } from "@/lib/supabase";
import { Artist } from "@/lib/types";

const projectImages: Record<string, StaticImageData> = importedProjectImages;

interface ProjectFrontmatter {
  title: string;
  artists: string[];
  startDate: string;
  endDate: string;
  location: string;
  galleryImages: string[];
  category: string;
  client: string;
  architect: string;
  year: string;
  description: string;
}

interface ProcessedProjectFrontmatter
  extends Omit<ProjectFrontmatter, "galleryImages"> {
  coverImage: StaticImageData;
  galleryImages: StaticImageData[];
  artistsData?: Artist[];
}

export interface Project {
  slug: string;
  frontmatter: ProcessedProjectFrontmatter;
  content: string;
}

const projectsDirectory = path.join(process.cwd(), "content", "projects");

async function getArtistBySlug(slug: string): Promise<Artist | undefined> {
  const [firstName, lastName] = slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());

  try {
    const { data: artist, error: artistError } = await supabase
      .from("artists")
      .select("*")
      .eq("live_in_production", true)
      .eq("first_name", firstName)
      .eq("last_name", lastName)
      .single();

    if (artistError || !artist) {
      console.error("Error fetching artist:", artistError);
      return undefined;
    }

    return artist;
  } catch (error) {
    console.error("Error in getArtistBySlug:", error);
    return undefined;
  }
}

export async function getProjectData(slug: string): Promise<Project | null> {
  try {
    const fullPath = path.join(projectsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    const { data, content } = matter(fileContents);
    const frontmatter = data as ProjectFrontmatter;

    const processedContent = await remark().use(html).process(content);
    const contentHtml = processedContent.toString();

    if (!frontmatter.galleryImages || frontmatter.galleryImages.length === 0) {
      throw new Error(`Project ${slug} must have at least one gallery image`);
    }

    // Process gallery images
    const galleryImages = frontmatter.galleryImages.map((relativePath) => {
      const imageKey = relativePath.replace(/^\/*/, ""); // Remove leading slashes
      const image = projectImages[imageKey];

      if (!image) {
        throw new Error(`Image not found: ${relativePath}`);
      }

      return image;
    });

    // Fetch multiple artists' data
    const artistsData = await Promise.all(
      frontmatter.artists.map((artistSlug) => getArtistBySlug(artistSlug)),
    );

    return {
      slug,
      frontmatter: {
        ...frontmatter,
        coverImage: galleryImages[0],
        galleryImages,
        artistsData: artistsData.filter(
          (artist): artist is Artist => artist !== undefined,
        ),
      },
      content: contentHtml,
    };
  } catch (e) {
    console.error(`Error processing project ${slug}:`, e);
    return null;
  }
}

export async function getAllProjects(): Promise<Project[]> {
  if (!fs.existsSync(projectsDirectory)) {
    console.warn("Projects directory not found, creating it...");
    fs.mkdirSync(projectsDirectory, { recursive: true });
    return [];
  }

  const fileNames = fs.readdirSync(projectsDirectory);

  const allProjectsData = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith(".md"))
      .map(async (fileName) => {
        const slug = fileName.replace(/\.md$/, "");
        const projectData = await getProjectData(slug);
        return projectData;
      }),
  );

  return allProjectsData
    .filter((data): data is Project => data !== null)
    .sort((a, b) => {
      return (
        new Date(b.frontmatter.startDate).getTime() -
        new Date(a.frontmatter.startDate).getTime()
      );
    });
}
