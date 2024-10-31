// app/exhibitions/page.tsx
import { getAllExhibitions } from "../lib/markdownExhibitions";
import ExhibitionCard from "@/components/ExhibitionCard";

export default async function ExhibitionsPage() {
  const exhibitions = await getAllExhibitions();
  const currentExhibitions = exhibitions.filter(
    (e) => e.frontmatter.status === "current"
  );
  const pastExhibitions = exhibitions.filter(
    (e) => e.frontmatter.status === "past"
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <section>
        <h2 className="text-2xl font-bold mb-6">Current Exhibitions</h2>
        <div className="grid grid-cols-1 gap-8 mb-12">
          {currentExhibitions.map((exhibition) => (
            <ExhibitionCard
              key={exhibition.slug}
              exhibition={exhibition}
              isCurrent={true}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Past Exhibitions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pastExhibitions.map((exhibition) => (
            <ExhibitionCard key={exhibition.slug} exhibition={exhibition} />
          ))}
        </div>
      </section>
    </div>
  );
}
