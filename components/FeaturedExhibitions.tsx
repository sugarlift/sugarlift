import { getExhibitionData } from "@/app/lib/markdownExhibitions";
import { ExhibitionCard } from "./ExhibitionCard";

interface FeaturedExhibitionsProps {
  exhibitions: string[];
}

export async function FeaturedExhibitions({
  exhibitions,
}: FeaturedExhibitionsProps) {
  const featuredExhibitions = await Promise.all(
    exhibitions
      .map((slug) => getExhibitionData(slug))
      .filter(
        (exhibition): exhibition is NonNullable<typeof exhibition> =>
          exhibition !== null,
      ),
  );

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {featuredExhibitions.map(
        (exhibition) =>
          exhibition && (
            <ExhibitionCard
              key={exhibition.slug}
              exhibition={exhibition}
              priority={true}
            />
          ),
      )}
    </div>
  );
}
