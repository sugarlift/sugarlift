// app/projects/[slug]/page.tsx
import {
  getProjectData,
  getAllProjects,
  getRelatedProjects,
} from "../../lib/markdownProjects";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import ProjectCard from "@/components/ProjectCard";

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
  const resolvedParams = await params;
  const project = await getProjectData(resolvedParams.slug);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${project.frontmatter.title} - ${project.frontmatter.location}`,
    description:
      project.frontmatter.description ||
      `${project.frontmatter.title} project by ${project.frontmatter.client}`,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const project = await getProjectData(resolvedParams.slug);

  if (!project) {
    notFound();
  }

  const relatedProjects = await getRelatedProjects(
    resolvedParams.slug,
    project.frontmatter.category,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Project Header */}
      <div className="mb-12">
        <h1 className="mb-4 text-3xl font-bold">{project.frontmatter.title}</h1>
        <p className="text-xl text-gray-600">{project.frontmatter.location}</p>
      </div>

      {/* Main Image Grid - First image full width */}
      <div className="mb-16 grid grid-cols-1 gap-8">
        <div className="relative aspect-[16/9]">
          <Image
            src={project.frontmatter.galleryImages[0]}
            alt={project.frontmatter.title}
            fill
            sizes="(max-width: 1400px) 100vw, 1400px"
            className="object-cover"
            priority
          />
        </div>

        {/* Remaining images in a grid */}
        <div className="grid grid-cols-2 gap-8">
          {project.frontmatter.galleryImages.slice(1).map((image, index) => (
            <div key={image} className="relative aspect-[4/3]">
              <Image
                src={image}
                alt={`${project.frontmatter.title} - Image ${index + 2}`}
                fill
                sizes="(max-width: 700px) 100vw, 700px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Project Details Grid */}
      <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-3">
        {/* Content Column */}
        <div className="prose prose-lg max-w-none md:col-span-2">
          <div dangerouslySetInnerHTML={{ __html: project.content }} />
        </div>

        {/* Metadata Column */}
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 font-medium">Category</h3>
            <p>{project.frontmatter.category}</p>
          </div>
          <div>
            <h3 className="mb-2 font-medium">Client</h3>
            <p>{project.frontmatter.client}</p>
          </div>
          <div>
            <h3 className="mb-2 font-medium">Architect</h3>
            <p>{project.frontmatter.architect}</p>
          </div>
          <div>
            <h3 className="mb-2 font-medium">Year</h3>
            <p>{project.frontmatter.year}</p>
          </div>
        </div>
      </div>

      {/* Related Projects */}
      <section>
        <h2 className="mb-8 text-2xl font-bold">More projects by Sugarlift</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {relatedProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}
