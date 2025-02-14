interface PlausibleBreakdownResult {
  page: string;
  visitors: number;
}

interface PlausibleBreakdownResponse {
  results: PlausibleBreakdownResult[];
}

export async function getPlausibleStats(): Promise<Record<string, number>> {
  const PLAUSIBLE_API_BASE = "https://plausible.io/api/v1";
  const siteId = "sugarlift.com";

  // First verify we can connect with a simple query
  const response = await fetch(
    `${PLAUSIBLE_API_BASE}/stats/aggregate?site_id=${siteId}&period=12mo&metrics=pageviews`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PLAUSIBLE_API_KEY}`,
      },
    },
  );

  if (!response.ok) {
    console.error("Error fetching Plausible stats:", await response.text());
    return {};
  }

  // Now get the breakdown by page
  const breakdownResponse = await fetch(
    `${PLAUSIBLE_API_BASE}/stats/breakdown?site_id=${siteId}&period=12mo&property=event:page&filters=event:page==/artists/**`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PLAUSIBLE_API_KEY}`,
      },
    },
  );

  const breakdownData =
    (await breakdownResponse.json()) as PlausibleBreakdownResponse;

  // Create a map of artist names to view counts
  const viewCounts: Record<string, number> = {};
  if (breakdownData.results) {
    breakdownData.results.forEach((result: PlausibleBreakdownResult) => {
      const path = result.page;
      if (path.startsWith("/artists/")) {
        // Convert URL-style name back to display name
        const urlName = path.replace("/artists/", "");
        const displayName = urlName
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
          .replace("N Ez", "Núñez"); // Special case for "Anna Núñez"

        viewCounts[displayName] = result.visitors;
      }
    });
  }

  return viewCounts;
}
