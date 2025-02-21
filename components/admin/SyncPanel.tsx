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

// Add this type for sync modes
type SyncMode = "bulk" | "incremental";

// Remove the unused ColumnConfig interface
// interface ColumnConfig {
//   key: string;
//   label: string;
//   description?: string;
// }

export function SyncPanel({ title, description, endpoint }: SyncPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [syncMode, setSyncMode] = useState<SyncMode>("incremental");
  const [batchSize, setBatchSize] = useState(25);
  const [concurrency, setConcurrency] = useState(2);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    currentBatch: number;
    totalBatches: number;
  } | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [processImages, setProcessImages] = useState(false);

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
          mode: syncMode,
          processImages,
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
          {/* Sync Mode Section */}
          <div>
            <label className="text-sm font-medium text-gray-900">
              Sync Mode
            </label>
            <div className="mt-2 flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  className="h-4 w-4 text-blue-600"
                  checked={syncMode === "incremental"}
                  onChange={() => setSyncMode("incremental")}
                />
                <span className="text-sm text-gray-900">Incremental</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  className="h-4 w-4 text-blue-600"
                  checked={syncMode === "bulk"}
                  onChange={() => setSyncMode("bulk")}
                />
                <span className="text-sm text-gray-900">Bulk</span>
              </label>
            </div>
            <p className="mt-1.5 text-sm text-gray-500">
              Incremental mode only processes records that have changed since
              the last sync. Bulk mode processes all records in batches.
            </p>
          </div>

          {/* Batch Settings (only show in bulk mode) */}
          {syncMode === "bulk" && (
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

          {/* Image Processing Checkbox */}
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`process-images-${endpoint}`}
                checked={processImages}
                onChange={(e) => setProcessImages(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <label
                htmlFor={`process-images-${endpoint}`}
                className="ml-2 text-sm font-medium text-gray-900"
              >
                Process images
              </label>
            </div>
            <p className="pl-6 text-xs text-gray-500">
              When enabled, images will be downloaded from Airtable and uploaded
              to Supabase. When disabled, no image data will be processed and
              current image order will be preserved.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSync}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
            >
              {isLoading ? "Syncing..." : "Start Sync"}
            </button>
          </div>

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
