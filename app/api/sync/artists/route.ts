import { NextResponse } from "next/server";
import {
  syncArtistsToSupabase,
  SyncProgress,
} from "@/lib/syncArtistsToSupabase";
import { progressEmitter } from "@/lib/utils/progressEmitter";
import Logger from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mode, batchSize, concurrency } = body;

    const result = await syncArtistsToSupabase({
      mode,
      batchSize,
      concurrency,
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

    return NextResponse.json(result);
  } catch (error) {
    Logger.error("Artist sync error:", error);
    progressEmitter.emitProgress({
      type: "artists",
      current: 0,
      total: 0,
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to sync artists" },
      { status: 500 },
    );
  }
}
