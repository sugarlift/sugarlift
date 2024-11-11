// app/projects/[slug]/page.tsx

import { getProjectData, getAllProjects } from "@/app/lib/markdownProjects";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectData(slug);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${project.frontmatter.title} by ${project.frontmatter.artist}`,
    description: `Project by ${project.frontmatter.artist}`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectData(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{project.frontmatter.title}</h1>
        <p className="mb-4 text-xl text-gray-600">
          {project.frontmatter.artist}
        </p>
        <p className="text-gray-600">
          {new Date(project.frontmatter.startDate).toLocaleDateString()} -{" "}
          {new Date(project.frontmatter.endDate).toLocaleDateString()}
        </p>
        <p className="text-gray-600">{project.frontmatter.location}</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {project.frontmatter.galleryImages.map((image, index) => (
          <div key={index} className="relative aspect-[16/9] w-full">
            <Image
              src={image}
              alt={`${project.frontmatter.title} - Image ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      <div
        className="prose prose-lg mt-8 max-w-none"
        dangerouslySetInnerHTML={{ __html: project.content }}
      />
    </div>
  );
}
