import type { MetadataRoute } from "next";
import { COMPANY_METADATA } from "@/app/lib/constants";
import { getAllProjects } from "@/app/lib/markdownProjects";
import { getAllExhibitions } from "@/app/lib/markdownExhibitions";
import { supabase } from "@/lib/supabase";

type ArtistRow = {
  artist_name: string;
};

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { domain } = COMPANY_METADATA;
  const baseUrl = `https://${domain}`;

  // Define static routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/exhibitions`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/artists`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
  ];

  // Get all projects
  const projects = await getAllProjects();
  const projectRoutes = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Get all artists from Supabase with proper typing
  const { data: artists, error } = (await supabase
    .from("artists")
    .select("artist_name")
    .eq("live_in_production", true)) as {
    data: ArtistRow[] | null;
    error: any;
  };

  console.log("Supabase artists query result:", { artists, error });

  const artistRoutes = (artists || []).map((artist: ArtistRow) => {
    const slug = generateSlug(artist.artist_name);
    console.log("Processing artist:", artist.artist_name, "with slug:", slug);
    return {
      url: `${baseUrl}/artists/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    };
  });

  // Get all exhibitions from markdown files
  const exhibitions = await getAllExhibitions();
  const exhibitionRoutes = exhibitions.map((exhibition) => ({
    url: `${baseUrl}/exhibitions/${exhibition.slug}`,
    lastModified: new Date(exhibition.frontmatter.startDate),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const allRoutes = [
    ...routes,
    ...projectRoutes,
    ...artistRoutes,
    ...exhibitionRoutes,
  ];
  console.log(
    "Total routes:",
    allRoutes.length,
    "Artist routes:",
    artistRoutes.length,
  );

  return allRoutes;
}
