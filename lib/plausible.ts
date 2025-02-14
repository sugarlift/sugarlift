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

  console.log("Starting Plausible stats fetch...");
  console.log("API Key exists:", !!process.env.PLAUSIBLE_API_KEY);
  console.log("API Key length:", process.env.PLAUSIBLE_API_KEY?.length || 0);

  try {
    // First verify we can connect with a simple query
    const response = await fetch(
      `${PLAUSIBLE_API_BASE}/stats/aggregate?site_id=${siteId}&period=12mo&metrics=pageviews`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PLAUSIBLE_API_KEY}`,
        },
        cache: "no-store", // Ensure fresh data
      },
    );

    if (!response.ok) {
      console.error("Aggregate query error status:", response.status);
      console.error("Aggregate query error:", await response.text());
      return {};
    }

    // Now get the breakdown by page
    const breakdownResponse = await fetch(
      `${PLAUSIBLE_API_BASE}/stats/breakdown?site_id=${siteId}&period=12mo&property=event:page&filters=event:page==/artists/**`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PLAUSIBLE_API_KEY}`,
        },
        cache: "no-store", // Ensure fresh data
      },
    );

    if (!breakdownResponse.ok) {
      console.error("Breakdown query error status:", breakdownResponse.status);
      console.error("Breakdown query error:", await breakdownResponse.text());
      return {};
    }

    const breakdownData =
      (await breakdownResponse.json()) as PlausibleBreakdownResponse;
    console.log("Got breakdown data with results:", !!breakdownData.results);
    console.log("Number of results:", breakdownData.results?.length || 0);

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
  } catch (error) {
    console.error("Error in getPlausibleStats:", error);
    return {};
  }
}
