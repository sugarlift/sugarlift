"use client";

import { useState, useEffect } from "react";

interface SyncPanelProps {
  title: string;
  description: string;
  endpoint: string;
}

// Add this interface near the top of the file, after SyncPanelProps
interface SyncResult {
  success: boolean;
  message: string;
  recordsProcessed?: number;
  errors?: string[];
  details?: Record<string, unknown>;
}

// Add a helper function for formatting time
function formatDuration(ms: number): string {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  const hours = Math.floor(ms / 1000 / 60 / 60);

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(" ");
}

export function SyncPanel({ title, description, endpoint }: SyncPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [batchSize, setBatchSize] = useState(50);
  const [concurrency, setConcurrency] = useState(3);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    currentBatch: number;
    totalBatches: number;
  } | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Update the progress endpoint URL
  const progressEndpoint = "/api/sync/progress";

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let intervalId: NodeJS.Timeout;

    if (isLoading) {
      console.log("Initializing SSE connection");
      eventSource = new EventSource(progressEndpoint);

      eventSource.onmessage = (event) => {
        console.log("SSE Progress update:", event.data);
        const progress = JSON.parse(event.data);
        setProgress(progress);
      };

      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        eventSource?.close();
      };
    }

    if (isLoading && startTime) {
      intervalId = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }

    return () => {
      if (eventSource) {
        console.log("Closing SSE connection");
        eventSource.close();
      }
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoading, startTime, progressEndpoint]);

  async function handleSync() {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setProgress(null);
    setStartTime(Date.now());
    setElapsedTime(0);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          batchSize,
          concurrency,
          mode: isBulkMode ? "bulk" : "update",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.details || `Sync failed: ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log("Sync completed:", data);
      setResult(data);
    } catch (err) {
      console.error("Sync error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch: Network error",
      );
    } finally {
      setIsLoading(false);
      setStartTime(null);
      setProgress(null);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={isBulkMode}
                onChange={(e) => setIsBulkMode(e.target.checked)}
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
            </label>
            <span className="text-sm font-medium text-gray-900">Bulk Mode</span>
          </div>

          {isBulkMode && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="batch-size"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Batch Size
                </label>
                <input
                  type="number"
                  id="batch-size"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  min={1}
                  max={100}
                />
              </div>
              <div>
                <label
                  htmlFor="concurrency"
                  className="mb-2 block text-sm font-medium text-gray-900"
                >
                  Concurrency
                </label>
                <input
                  type="number"
                  id="concurrency"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  value={concurrency}
                  onChange={(e) => setConcurrency(Number(e.target.value))}
                  min={1}
                  max={5}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleSync}
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
          >
            {isLoading ? "Syncing..." : "Start Sync"}
          </button>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {result && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {isLoading && (
            <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
              <div className="mb-2 flex items-center justify-between">
                <p>Syncing in progress...</p>
                <p className="font-mono">{formatDuration(elapsedTime)}</p>
              </div>
              {progress && (
                <div className="mt-2">
                  <div className="h-2 w-full rounded-full bg-blue-200">
                    <div
                      className="h-2 rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${(progress.current / progress.total) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-xs">
                    <p>
                      Batch {progress.currentBatch} of {progress.totalBatches}
                    </p>
                    <p>
                      {progress.current} of {progress.total} records
                    </p>
                  </div>
                  {progress.current > 0 && (
                    <p className="mt-1 text-xs">
                      Avg: {formatDuration(elapsedTime / progress.current)} per
                      record
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
