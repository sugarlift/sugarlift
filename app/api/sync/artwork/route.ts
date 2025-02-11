import { NextResponse } from "next/server";
import { syncArtworkToSupabase } from "@/lib/syncArtworkToSupabase";
import { progressEmitter } from "@/lib/utils/progressEmitter";
import { headers } from "next/headers";
import Logger from "@/lib/logger";

// Use the progress type from the sync function
type SyncProgress = {
  current: number;
  total: number;
};

export async function POST(request: Request) {
  try {
    const { batchSize = 50, concurrency = 3 } = await request.json();

    Logger.debug("Starting artwork sync", { batchSize, concurrency });

    const result = await syncArtworkToSupabase({
      mode: "bulk",
      batchSize,
      concurrency,
      skipExistingCheck: true,
      onProgress: (progress: SyncProgress) => {
        progressEmitter.emitProgress({
          type: "artwork",
          ...progress,
          status: "processing",
        });
      },
    });

    progressEmitter.emitProgress({
      type: "artwork",
      current: result.processedCount,
      total: result.processedCount,
      status: "complete",
    });

    Logger.info("Artwork sync completed", { result });
    return NextResponse.json(result);
  } catch (error) {
    Logger.error("Artwork sync failed", error);
    progressEmitter.emitProgress({
      type: "artwork",
      current: 0,
      total: 0,
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

// Fix the headers().get() error and remove unused parameter
export async function OPTIONS(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: Request,
) {
  const headersList = await headers();
  const origin = headersList.get("origin") || "";

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
