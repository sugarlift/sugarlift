import { NextResponse } from "next/server";
import { progressEmitter } from "@/lib/utils/progressEmitter";
import { headers } from "next/headers";

export const runtime = "edge";

// Define the progress event type
type ProgressEvent = {
  type: "artwork" | "artists";
  current: number;
  total: number;
  status: "processing" | "complete" | "error";
  message?: string;
};

export async function GET() {
  const headersList = await headers();
  const origin = headersList.get("origin") || "";

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendProgress = (progress: ProgressEvent) => {
        const data = `data: ${JSON.stringify(progress)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      progressEmitter.on("progress", sendProgress);

      return () => {
        progressEmitter.off("progress", sendProgress);
      };
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": origin,
    },
  });
}
