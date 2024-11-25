import { FeaturedProjects } from "@/components/FeaturedProjects";
import { FeaturedArtists } from "@/components/FeaturedArtists";
import { Slider } from "@/components/Slider";
import { ConsultationCTA } from "@/components/ConsultationCTA";
import { QuickLink } from "@/components/Link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { FAQ } from "@/components/FAQ";
import { ServicesSection } from "@/components/ServicesSection";

// Mark the page as static
export const dynamic = "force-static";

// If you need to revalidate the page periodically (optional)
export const revalidate = 3600; // revalidate every hour

async function getFeaturedData() {
  const { data: artists } = await supabase
    .from("artists")
    .select("*")
    .eq("live_in_production", true)
    .order("view_count", { ascending: false })
    .order("artist_name", { ascending: true })
    .limit(9);

  const projects = ["450-washington", "450-washington-2", "450-washington-3"];

  return {
    projects,
    artists: artists || [],
  };
}

export default async function Home() {
  const { projects, artists } = await getFeaturedData();

  return (
    <>
      <section className="container">
        <div className="mb-[1.33vw]">
          <h1 className="big-title mb-6 max-w-[790px] text-balance">
            Sugarlift helps real estate developers and design firms create
            high-quality art programs for their most important properties.
          </h1>
          <p className="mb-8 max-w-3xl">
            We do this by providing access to a vast community of artists and
            simplifying art procurement. As a result, we enable our clients to
            develop exceptional properties while supporting the artists who
            bring them to life.
          </p>
          <Button asChild className="group">
            <QuickLink
              href="/contact"
              className="inline-flex items-center rounded-md bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800"
            >
              Schedule a Consultation
              <ArrowRight
                className="-me-1 ms-2 mt-0.5 transition-transform group-hover:translate-x-0.5"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
            </QuickLink>
          </Button>
        </div>
      </section>

      <section className="container">
        <div className="mb-[1.33vw]">
          <QuickLink
            href="/art-consulting/projects"
            className="group flex items-center text-zinc-700 transition hover:text-zinc-950"
          >
            <h2>Featured projects</h2>
            <ArrowRight
              className="-me-1 ms-1 mt-0.5 h-4 transition-transform group-hover:translate-x-1 lg:ms-2 lg:mt-1 lg:h-10"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </QuickLink>
        </div>
        <div className="relative w-full">
          <Slider slidesPerView={1}>
            {projects.map((project) => (
              <FeaturedProjects key={project} projects={[project]} />
            ))}
          </Slider>
        </div>
      </section>

      <section className="container">
        <div className="mb-[1.33vw]">
          <h1 className="mb-6 max-w-[760px]">
            Full suite of services to help you build an exceptional art program
            that will delight your clients and help you stand out from the
            competition.
          </h1>
        </div>
        <ServicesSection />
      </section>

      <section className="container">
        <div className="mb-[1.33vw]">
          <QuickLink
            href="/artists"
            className="group flex items-center text-zinc-700 transition hover:text-zinc-950"
          >
            <h2>Featured Artists</h2>
            <ArrowRight
              className="-me-1 ms-1 mt-0.5 h-4 transition-transform group-hover:translate-x-1 lg:ms-2 lg:mt-1 lg:h-10"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </QuickLink>
        </div>
        <div className="relative w-full">
          <Slider slidesPerView={{ mobile: 2, tablet: 3, desktop: 4 }}>
            {artists.map((artist) => (
              <FeaturedArtists key={artist.id} artist={artist} />
            ))}
          </Slider>
        </div>
      </section>

      <FAQ />

      <ConsultationCTA />
    </>
  );
}
