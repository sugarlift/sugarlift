export const runtime = "edge";

export async function POST(request: Request) {
  try {
    await syncAirtableToSupabase();
    return new Response("Artists sync completed successfully", { status: 200 });
  } catch (error) {
    console.error("Artists sync failed:", error);
    return new Response("Artists sync failed", { status: 500 });
  }
}
