// app/projects/[slug]/page.tsx

import { getProjectData, getAllProjects } from "@/app/lib/markdownProjects";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FAQ } from "@/components/FAQ";
import { ConsultationCTA } from "@/components/ConsultationCTA";
import { QuickLink } from "@/components/Link";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { Slider } from "@/components/Slider";

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
        .map((artist) => `${artist.first_name} ${artist.last_name}`)
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
        <div className="mb-8">
          <h1 className="mb-2 text-3xl">{project.frontmatter.title}</h1>
          <p className="text-gray-600">For {project.frontmatter.location}</p>
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

        <div
          className="prose prose-lg mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: project.content }}
        />

        {project.frontmatter.artistsData && (
          <div className="mt-16 border-t pt-8">
            {project.frontmatter.artistsData.map((artist, index) => (
              <div key={index} className="mb-8">
                <div className="flex flex-col md:flex-row md:gap-8">
                  {artist.attachments && (
                    <div className="mb-6 md:mb-0 md:w-1/3">
                      <div className="relative aspect-square w-full">
                        <Image
                          src={artist.attachments[0].url}
                          alt={`${artist.first_name} ${artist.last_name}`}
                          fill
                          className="rounded-lg object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    </div>
                  )}
                  <div className="md:w-2/3">
                    <QuickLink
                      href={`/artists/${project.frontmatter.artists[index]}`}
                      className="mb-4 block text-xl font-semibold hover:text-gray-600"
                    >
                      {artist.first_name} {artist.last_name}
                    </QuickLink>
                    <div className="prose max-w-none">
                      <p>{artist.biography}</p>
                    </div>
                    <QuickLink
                      href={`/artists/${project.frontmatter.artists[index]}`}
                      className="mt-4 inline-block text-blue-600 hover:text-blue-800"
                    >
                      View Artist Profile →
                    </QuickLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="container my-16">
        <h2 className="mb-8 text-2xl font-semibold">
          More Projects by Sugarlift
        </h2>
        <div className="relative w-full">
          <Slider slidesPerView={2}>
            {["450-washington-2", "450-washington-3"].map((projectSlug) => (
              <FeaturedProjects key={projectSlug} projects={[projectSlug]} />
            ))}
          </Slider>
        </div>
      </section>

      <FAQ />
      <ConsultationCTA />
    </>
  );
}
