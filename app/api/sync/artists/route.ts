import { NextResponse } from "next/server";
import {
  syncArtistsToSupabase,
  SyncProgress,
} from "@/lib/syncArtistsToSupabase";
import { progressEmitter } from "@/lib/utils/progressEmitter";
import Logger from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const {
      mode = "bulk",
      batchSize = 50,
      concurrency = 3,
      processImages = false,
    } = await request.json();

    Logger.debug("Starting artist sync", {
      mode,
      batchSize,
      concurrency,
      processImages: processImages ? "yes" : "no",
    });

    const result = await syncArtistsToSupabase({
      mode,
      batchSize,
      concurrency,
      skipExistingCheck: mode === "bulk",
      skipImages: !processImages,
      onProgress: (progress: SyncProgress) => {
        progressEmitter.emitProgress({
          type: "artists",
          ...progress,
          status: "processing",
        });
      },
    });

    progressEmitter.emitProgress({
      type: "artists",
      current: result.processedCount,
      total: result.processedCount,
      status: "complete",
    });

    Logger.info("Artist sync completed", { result });
    return NextResponse.json(result);
  } catch (error) {
    Logger.error("Artist sync failed", error);
    progressEmitter.emitProgress({
      type: "artists",
      current: 0,
      total: 0,
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
