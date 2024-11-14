import { Exhibition, getExhibitionData } from "@/app/lib/markdownExhibitions";
import { ExhibitionCard } from "./ExhibitionCard";

interface FeaturedExhibitionsProps {
  exhibitions: string[];
}

export async function FeaturedExhibitions({
  exhibitions,
}: FeaturedExhibitionsProps) {
  const exhibitionPromises = exhibitions.map((slug) => getExhibitionData(slug));
  const exhibitionResults = await Promise.all(exhibitionPromises);

  const featuredExhibitions = exhibitionResults
    .filter((exhibition): exhibition is Exhibition => exhibition !== null)
    .map((exhibition) => ({
      ...exhibition,
      frontmatter: {
        ...exhibition.frontmatter,
        displayName: exhibition.frontmatter.artistData
          ? `${exhibition.frontmatter.artistData.first_name} ${exhibition.frontmatter.artistData.last_name}`
          : exhibition.frontmatter.artist,
      },
    }));

  return (
    <>
      {featuredExhibitions.map((exhibition) => (
        <ExhibitionCard
          key={exhibition.slug}
          exhibition={exhibition}
          priority={true}
        />
      ))}
    </>
  );
}
