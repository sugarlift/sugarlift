export const runtime = "edge";

export async function POST(request: Request) {
  try {
    await syncArtworkToSupabase();
    return new Response("Artwork sync completed successfully", { status: 200 });
  } catch (error) {
    console.error("Artwork sync failed:", error);
    return new Response("Artwork sync failed", { status: 500 });
  }
}
