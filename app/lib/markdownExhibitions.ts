import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

// Interface for the raw markdown frontmatter
interface ExhibitionFrontmatter {
  title: string;
  artist: string;
  startDate: string;
  endDate: string;
  location: string;
  galleryImages: string[];
}

// Interface for the processed exhibition data
export interface Exhibition {
  slug: string;
  frontmatter: ExhibitionFrontmatter & {
    status: "current" | "past";
    coverImage: string; // Guaranteed to be the first gallery image
  };
  content: string;
}

const exhibitionsDirectory = path.join(process.cwd(), "content", "exhibitions");

function determineExhibitionStatus(endDate: string): "current" | "past" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exhibitionEnd = new Date(endDate);
  exhibitionEnd.setHours(23, 59, 59, 999);

  return exhibitionEnd >= today ? "current" : "past";
}

export async function getExhibitionData(
  slug: string
): Promise<Exhibition | null> {
  try {
    const fullPath = path.join(exhibitionsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Parse frontmatter
    const { data, content } = matter(fileContents);
    const frontmatter = data as ExhibitionFrontmatter;

    // Process markdown content
    const processedContent = await remark().use(html).process(content);
    const contentHtml = processedContent.toString();

    // Ensure gallery images exist and get cover image
    if (!frontmatter.galleryImages || frontmatter.galleryImages.length === 0) {
      throw new Error(
        `Exhibition ${slug} must have at least one gallery image`
      );
    }

    // Calculate status based on end date
    const calculatedStatus = determineExhibitionStatus(frontmatter.endDate);

    return {
      slug,
      frontmatter: {
        ...frontmatter,
        status: calculatedStatus,
        coverImage: frontmatter.galleryImages[0],
      },
      content: contentHtml,
    };
  } catch (e) {
    console.error(`Error processing exhibition ${slug}:`, e);
    return null;
  }
}

export async function getAllExhibitions(): Promise<Exhibition[]> {
  // Ensure directory exists
  if (!fs.existsSync(exhibitionsDirectory)) {
    console.warn("Exhibitions directory not found, creating it...");
    fs.mkdirSync(exhibitionsDirectory, { recursive: true });
    return [];
  }

  // Get file names under /content/exhibitions
  const fileNames = fs.readdirSync(exhibitionsDirectory);

  const allExhibitionsData = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith(".md"))
      .map(async (fileName) => {
        const slug = fileName.replace(/\.md$/, "");
        const exhibitionData = await getExhibitionData(slug);
        return exhibitionData;
      })
  );

  // Filter out any null values and sort exhibitions
  const exhibitions = allExhibitionsData.filter(
    (data): data is Exhibition => data !== null
  );

  // Sort by status (current first) and then by start date
  return exhibitions.sort((a, b) => {
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
