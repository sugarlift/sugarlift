// app/clients/page.tsx

import { getAllProjects } from "@/app/lib/markdownProjects";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { Slider } from "@/components/Slider";
import { ConsultationCTA } from "@/components/ConsultationCTA";
import { FEATURED_PROJECTS } from "@/app/lib/constants";
import { SectionHeader } from "@/components/SectionHeader";
import { Metadata } from "next";
import { COMPANY_METADATA } from "@/app/lib/constants";
import { FAQ } from "@/components/FAQ";

// Add static generation config
export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: `${COMPANY_METADATA.name} | Client projects`,
  description:
    "Sugarlift is a contemporary art gallery based in New York, an industry-leading art consulting service, and a global artist community representing today's best and brightest contemporary artists.",
};

async function getFeaturedData() {
  const allProjects = await getAllProjects();

  // Group projects by category
  const projectsByCategory = allProjects.reduce(
    (acc, project) => {
      const category = project.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(project.slug);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  return {
    projectsByCategory,
    featuredProjects: [...FEATURED_PROJECTS],
  };
}

export default async function ProjectsPage() {
  const { projectsByCategory, featuredProjects } = await getFeaturedData();

  return (
    <>
      <div className="overflow-x-hidden">
        <section className="container">
          <SectionHeader title="Featured clients" pageTitle={true} />
          <div className="relative w-full">
            <Slider slidesPerView={1}>
              {featuredProjects.map((project) => (
                <FeaturedProjects key={project} projects={[project]} />
              ))}
            </Slider>
          </div>
        </section>

        {Object.entries(projectsByCategory).map(([category, projects]) => (
          <section key={category} className="container" id={category}>
            <SectionHeader title={category} />
            <div className="relative w-full">
              <Slider slidesPerView={{ mobile: 1, tablet: 2, desktop: 2 }}>
                {projects.map((project) => (
                  <FeaturedProjects key={project} projects={[project]} />
                ))}
              </Slider>
            </div>
          </section>
        ))}

        <div className="border-t border-zinc-200">
          <FAQ />
        </div>
        <ConsultationCTA />
      </div>
    </>
  );
}
