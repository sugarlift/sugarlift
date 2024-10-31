// app/exhibitions/page.tsx
import { getAllExhibitions } from "../lib/markdownExhibitions";
import Link from "next/link";
import Image from "next/image";

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
            <Link
              key={exhibition.slug}
              href={`/exhibitions/${exhibition.slug}`}
              className="block group"
            >
              <div className="relative w-full aspect-[16/9]">
                <Image
                  src={exhibition.frontmatter.galleryImages[0]}
                  alt={exhibition.frontmatter.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-opacity group-hover:opacity-90"
                  priority={true}
                />
              </div>
              <h3 className="text-xl font-semibold mb-2 mt-4">
                {exhibition.frontmatter.title}
              </h3>
              <p className="text-gray-600">{exhibition.frontmatter.artist}</p>
              <p className="text-gray-600">
                {new Date(
                  exhibition.frontmatter.startDate
                ).toLocaleDateString()}{" "}
                -{" "}
                {new Date(exhibition.frontmatter.endDate).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Past Exhibitions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pastExhibitions.map((exhibition) => (
            <Link
              key={exhibition.slug}
              href={`/exhibitions/${exhibition.slug}`}
              className="block group"
            >
              <div className="relative w-full aspect-[16/9]">
                <Image
                  src={exhibition.frontmatter.galleryImages[0]}
                  alt={exhibition.frontmatter.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-opacity group-hover:opacity-90"
                />
              </div>
              <h3 className="text-lg font-semibold mb-2 mt-4">
                {exhibition.frontmatter.title}
              </h3>
              <p className="text-gray-600">{exhibition.frontmatter.artist}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
