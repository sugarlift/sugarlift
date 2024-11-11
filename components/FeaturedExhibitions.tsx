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
    <>
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
    </>
  );
}
