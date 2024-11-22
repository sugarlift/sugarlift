export async function POST(request: Request) {
  const { offset = 0, limit = 2 } = await request.json();

  const result = await syncAirtableToSupabase(limit, offset);

  return NextResponse.json({
    message: `Batch sync completed (offset: ${offset}, limit: ${limit})`,
    result,
  });
}
