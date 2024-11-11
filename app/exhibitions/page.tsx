// app/exhibitions/page.tsx

import { getAllExhibitions } from "../lib/markdownExhibitions";
import { ExhibitionCard } from "@/components/ExhibitionCard";

export default async function ExhibitionsPage() {
  const exhibitions = await getAllExhibitions();
  const currentExhibitions = exhibitions.filter(
    (e) => e.frontmatter.status === "current",
  );
  const pastExhibitions = exhibitions.filter(
    (e) => e.frontmatter.status === "past",
  );

  return (
    <div className="container py-12">
      <section>
        <h2 className="mb-6 text-2xl font-bold">Current Exhibitions</h2>
        <div className="mb-12 grid gap-8">
          {currentExhibitions.map((exhibition) => (
            <ExhibitionCard key={exhibition.slug} exhibition={exhibition} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold">Past Exhibitions</h2>
        <div className="grid gap-8">
          {pastExhibitions.map((exhibition) => (
            <ExhibitionCard key={exhibition.slug} exhibition={exhibition} />
          ))}
        </div>
      </section>
    </div>
  );
}
