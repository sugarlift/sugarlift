interface PlausibleV2Result {
  dimensions: string[];
  metrics: number[];
}

interface PlausibleV2Response {
  results: PlausibleV2Result[];
}

export async function getPlausibleStats(): Promise<Record<string, number>> {
  const PLAUSIBLE_API_BASE = "https://plausible.io/api/v2";
  const siteId = "sugarlift.com";

  try {
    console.log("🔍 Fetching Plausible stats...");

    // Query breakdown of visitors by artist page using V2 API
    const response = await fetch(`${PLAUSIBLE_API_BASE}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PLAUSIBLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        site_id: siteId,
        metrics: ["visitors"],
        date_range: "6mo",
        filters: [["contains", "event:page", ["/artists/"]]],
        dimensions: ["event:page"],
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Plausible API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return {};
    }

    const data = (await response.json()) as PlausibleV2Response;
    console.log("✅ Received Plausible data:", {
      resultCount: data.results.length,
      sampleResult: data.results[0],
    });

    // Create a map of artist names to view counts
    const viewCounts: Record<string, number> = {};

    data.results.forEach((result) => {
      const path = result.dimensions[0];
      if (path.startsWith("/artists/")) {
        const urlName = path.replace("/artists/", "");
        const displayName = urlName
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
          .replace("N Ez", "Núñez")
          .replace("O Leary", "O'Leary");

        viewCounts[displayName] = result.metrics[0];
        console.log(`📊 ${displayName}: ${result.metrics[0]} visitors`);
      }
    });

    console.log("✨ Final view counts:", {
      totalArtists: Object.keys(viewCounts).length,
      totalViews: Object.values(viewCounts).reduce((a, b) => a + b, 0),
    });

    return viewCounts;
  } catch (error) {
    console.error("❌ Error fetching Plausible stats:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
    });
    return {};
  }
}
