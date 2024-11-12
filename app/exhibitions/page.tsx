// app/exhibitions/page.tsx

import { TerminalCTA } from "@/components/TerminalCTA";
import { getAllExhibitions } from "../lib/markdownExhibitions";
import { ExhibitionCard } from "@/components/ExhibitionCard";
import { QuickLink } from "@/components/Link";

export default async function ExhibitionsPage() {
  const exhibitions = await getAllExhibitions();
  const currentExhibitions = exhibitions.filter(
    (e) => e.frontmatter.status === "current",
  );
  const pastExhibitions = exhibitions.filter(
    (e) => e.frontmatter.status === "past",
  );

  return (
    <>
      <section className="container">
        <h2 className="mb-6 text-2xl">Current Exhibitions</h2>
        <div className="mb-12 grid gap-8">
          {currentExhibitions.map((exhibition) => (
            <ExhibitionCard
              key={exhibition.slug}
              exhibition={exhibition}
              LinkComponent={QuickLink}
            />
          ))}
        </div>
      </section>

      <section className="container">
        <h2 className="mb-6 text-2xl">Past Exhibitions</h2>
        <div className="grid gap-8">
          {pastExhibitions.map((exhibition) => (
            <ExhibitionCard
              key={exhibition.slug}
              exhibition={exhibition}
              LinkComponent={QuickLink}
            />
          ))}
        </div>
      </section>
      <TerminalCTA />
    </>
  );
}
