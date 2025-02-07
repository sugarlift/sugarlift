// app/projects/[slug]/page.tsx

import { getProjectData, getAllProjects } from "@/app/lib/markdownProjects";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ConsultationCTA } from "@/components/ConsultationCTA";
import { ArtistCard } from "@/components/ArtistCard";

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

  const artistNames = project.frontmatter.artistsData
    ? project.frontmatter.artistsData
        .map((artist) => artist.artist_name)
        .join(", ")
    : project.frontmatter.artists.join(", ");

  return {
    title: `${project.frontmatter.title} by ${artistNames}`,
    description: `Project by ${artistNames}`,
  };
}

export default async function ProjectPage({
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
    <>
      <section className="container">
        <div className="mb-16">
          <h1 className="mb-4">{project.frontmatter.title}</h1>
          <p className="text-zinc-500">
            For {project.frontmatter.client} in {project.frontmatter.location}
          </p>
          <p className="text-zinc-500">
            Completed in {project.frontmatter.year}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {project.frontmatter.galleryImages.map((image, index) => (
            <div
              key={index}
              className={`relative ${
                index % 3 === 0 ? "aspect-video md:col-span-2" : "aspect-[4/3]"
              } w-full`}
            >
              <Image
                src={image}
                alt={`${project.frontmatter.title} - Image ${index + 1}`}
                sizes="(min-width: 1024px) 90vw, (min-width: 768px) 90vw, 100vw"
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="prose">
        <div dangerouslySetInnerHTML={{ __html: project.content }} />
        <div className="mt-16 grid max-w-[370px] grid-cols-2 font-medium">
          <div>Completed</div>
          <div>{project.frontmatter.year}</div>
          <div>Client</div>
          <div>{project.frontmatter.client}</div>
          <div>Architect</div>
          <div>{project.frontmatter.architect}</div>
          <div>Scope</div>
          <div>{project.frontmatter.scope}</div>
          <div>Photography</div>
          <div>{project.frontmatter.photography}</div>

          <div className="mt-4">Services</div>
          <div className="mt-4">
            <ul className="m-0 p-0">
              {project.frontmatter.services.map((service) => (
                <li className="m-0 list-none p-0" key={service}>
                  {service}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="prose"></section>

      {project.frontmatter.artistsData && (
        <section className="container">
          <div className="space-y-36">
            {project.frontmatter.artistsData.map((artist, index) => (
              <ArtistCard key={index} artist={artist} />
            ))}
          </div>
        </section>
      )}
      <ConsultationCTA />
    </>
  );
}
