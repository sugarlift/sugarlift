// app/lib/markdownExhibitions.ts

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { StaticImageData } from "next/image";
import { exhibitionImages as importedExhibitionImages } from "@/content/exhibitions/images";
import { supabase } from "@/lib/supabase";
import { Artist } from "@/lib/types";

const exhibitionImages: Record<string, StaticImageData> =
  importedExhibitionImages;

interface ExhibitionFrontmatter {
  title: string;
  artists: string[];
  startDate: string;
  endDate: string;
  location: string;
  city: string;
  galleryImages: string[];
}

// Add a new interface for handling missing artists
interface ExhibitionArtist {
  name: string;
  slug: string;
  dbData?: Artist; // Optional database data
}

interface ProcessedExhibitionFrontmatter
  extends Omit<ExhibitionFrontmatter, "galleryImages" | "artists"> {
  status: "current" | "past";
  coverImage: StaticImageData;
  galleryImages: StaticImageData[];
  artists: ExhibitionArtist[]; // Replace artistsData with this
  formattedStartDate: string;
  formattedEndDate: string;
}

export interface Exhibition {
  slug: string;
  frontmatter: ProcessedExhibitionFrontmatter;
  content: string;
}

const exhibitionsDirectory = path.join(process.cwd(), "content", "exhibitions");

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function determineExhibitionStatus(endDate: string): "current" | "past" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exhibitionEnd = new Date(endDate);
  exhibitionEnd.setHours(23, 59, 59, 999);

  return exhibitionEnd >= today ? "current" : "past";
}

async function getArtistBySlug(slug: string): Promise<ExhibitionArtist> {
  const artistName = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  try {
    const { data: artist, error: artistError } = await supabase
      .from("artists")
      .select("*")
      .eq("live_in_production", true)
      .eq("artist_name", artistName)
      .single();

    if (artistError || !artist) {
      console.info(
        `Artist "${artistName}" (slug: ${slug}) not found in database - using fallback name`,
      );
      return {
        name: artistName,
        slug,
      };
    }

    return {
      name: artist.artist_name,
      slug,
      dbData: artist,
    };
  } catch (error) {
    console.error(
      `Error in getArtistBySlug for "${artistName}" (slug: ${slug}):`,
      error,
    );
    return {
      name: artistName,
      slug,
    };
  }
}

export async function getExhibitionData(
  slug: string,
): Promise<Exhibition | null> {
  try {
    const fullPath = path.join(exhibitionsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    const { data, content } = matter(fileContents);
    const frontmatter = data as ExhibitionFrontmatter;

    const processedContent = await remark().use(html).process(content);
    const contentHtml = processedContent.toString();

    if (!frontmatter.galleryImages || frontmatter.galleryImages.length === 0) {
      throw new Error(
        `Exhibition ${slug} must have at least one gallery image`,
      );
    }

    // Process gallery images
    const galleryImages = frontmatter.galleryImages.map((relativePath) => {
      const imageKey = relativePath.replace(/^\/*/, ""); // Remove leading slashes
      const image = exhibitionImages[imageKey];

      if (!image) {
        throw new Error(`Image not found: ${relativePath}`);
      }

      return image;
    });

    const calculatedStatus = determineExhibitionStatus(frontmatter.endDate);

    // Fetch multiple artists' data
    const artists = await Promise.all(
      frontmatter.artists.map((artistSlug) => getArtistBySlug(artistSlug)),
    );

    return {
      slug,
      frontmatter: {
        ...frontmatter,
        status: calculatedStatus,
        coverImage: galleryImages[0],
        galleryImages,
        artists,
        formattedStartDate: formatDate(frontmatter.startDate),
        formattedEndDate: formatDate(frontmatter.endDate),
      },
      content: contentHtml,
    };
  } catch (e) {
    console.error(`Error processing exhibition ${slug}:`, e);
    return null;
  }
}

export async function getAllExhibitions(): Promise<Exhibition[]> {
  if (!fs.existsSync(exhibitionsDirectory)) {
    console.warn("Exhibitions directory not found, creating it...");
    fs.mkdirSync(exhibitionsDirectory, { recursive: true });
    return [];
  }

  const fileNames = fs.readdirSync(exhibitionsDirectory);

  const allExhibitionsData = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith(".md"))
      .map(async (fileName) => {
        const slug = fileName.replace(/\.md$/, "");
        const exhibitionData = await getExhibitionData(slug);
        return exhibitionData;
      }),
  );

  return allExhibitionsData
    .filter((data): data is Exhibition => data !== null)
    .sort((a, b) => {
      if (
        a.frontmatter.status === "current" &&
        b.frontmatter.status !== "current"
      )
        return -1;
      if (
        a.frontmatter.status !== "current" &&
        b.frontmatter.status === "current"
      )
        return 1;
      return (
        new Date(b.frontmatter.startDate).getTime() -
        new Date(a.frontmatter.startDate).getTime()
      );
    });
}

export function getExhibitionBySlug(slug: string) {
  try {
    const exhibitionsDirectory = path.join(
      process.cwd(),
      "content/exhibitions",
    );
    const fullPath = path.join(exhibitionsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data: frontmatter, content } = matter(fileContents);

    return {
      slug,
      frontmatter,
      content,
    };
  } catch (error) {
    console.error(`Error loading exhibition ${slug}:`, error);
    return null;
  }
}
