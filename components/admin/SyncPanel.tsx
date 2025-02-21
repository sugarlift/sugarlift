"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";

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

// Simplify the StatusDisplay component
function StatusDisplay({
  error,
  result,
  isLoading,
  elapsedTime,
}: {
  error: string | null;
  result: SyncResult | null;
  isLoading: boolean;
  elapsedTime: number;
}) {
  return (
    <div className="mt-4">
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
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />
              <p className="text-sm font-medium">Syncing in progress...</p>
            </div>
            <p className="text-sm font-medium">{formatDuration(elapsedTime)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function SyncPanel({ title, description, endpoint }: SyncPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [syncMode, setSyncMode] = useState<SyncMode>("incremental");
  const [batchSize, setBatchSize] = useState(25);
  const [concurrency, setConcurrency] = useState(2);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [incrementalProcessImages, setIncrementalProcessImages] =
    useState(false);
  const [bulkProcessImages, setBulkProcessImages] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isLoading && startTime) {
      intervalId = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoading, startTime]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsBulkModalOpen(false);
      }
    };

    if (isBulkModalOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isBulkModalOpen]);

  // Add click outside handler for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      // Check if click is outside both the button and dropdown
      if (
        isDropdownOpen &&
        !target.closest('[aria-label="More options"]') &&
        !target.closest('[role="menu"]')
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  async function handleSync(mode: SyncMode = "incremental") {
    setSyncMode(mode);
    setIsLoading(true);
    setError(null);
    setResult(null);
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
          mode,
          processImages:
            mode === "bulk" ? bulkProcessImages : incrementalProcessImages,
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
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="rounded p-2 hover:bg-gray-100"
              aria-label="More options"
            >
              <MoreHorizontal className="h-5 w-5 text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                role="menu"
                className="absolute right-0 z-50 mt-2 w-36 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5"
              >
                <div className="py-1">
                  <button
                    role="menuitem"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsBulkModalOpen(true);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Reset database...
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {/* Image Processing Toggle for Incremental Mode */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span
                  id="incremental-process-images-label"
                  className="text-sm font-medium text-gray-900"
                >
                  Process images
                </span>
                <p className="text-xs text-gray-500">
                  Upload to Supabase and sync the image order. <br />
                  Increases the sync time.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={incrementalProcessImages}
                aria-labelledby="incremental-process-images-label"
                onClick={() =>
                  setIncrementalProcessImages(!incrementalProcessImages)
                }
                className={`${
                  incrementalProcessImages ? "bg-blue-600" : "bg-gray-200"
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
              >
                <span
                  aria-hidden="true"
                  className={`${
                    incrementalProcessImages ? "translate-x-5" : "translate-x-0"
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleSync("incremental")}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
            >
              {isLoading && syncMode === "incremental" ? "Syncing..." : "Sync"}
            </button>
          </div>

          {/* Show status only for incremental sync */}
          {syncMode === "incremental" && (error || result || isLoading) && (
            <StatusDisplay
              error={error}
              result={result}
              isLoading={isLoading}
              elapsedTime={elapsedTime}
            />
          )}
        </div>
      </div>

      {/* Bulk Sync Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => !isLoading && setIsBulkModalOpen(false)}
            />

            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-12 sm:pb-16">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Database reset
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  This will clear all existing data and perform a fresh sync
                  from Airtable to Supabase. Use this when you need to resolve
                  sync issues or reset the database state.
                </p>
                <div className="mt-8 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      Batch Size
                    </label>
                    <input
                      type="number"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900"
                      value={batchSize}
                      onChange={(e) => setBatchSize(Number(e.target.value))}
                      min={1}
                      max={100}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Number of records to process in each batch. Larger batches
                      are faster but use more memory.
                    </p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      Concurrency
                    </label>
                    <input
                      type="number"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900"
                      value={concurrency}
                      onChange={(e) => setConcurrency(Number(e.target.value))}
                      min={1}
                      max={5}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Number of batches to process simultaneously. Higher values
                      are faster but increase server load.
                    </p>
                  </div>

                  {/* Image Processing Toggle in Bulk Modal */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span
                        id="bulk-process-images-label"
                        className="text-sm font-medium text-gray-900"
                      >
                        Process images
                      </span>
                      <p className="text-xs text-gray-500">
                        Upload to Supabase and sync the image order. <br />
                        Increases the sync time.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={bulkProcessImages}
                      aria-labelledby="bulk-process-images-label"
                      onClick={() => setBulkProcessImages(!bulkProcessImages)}
                      className={`${
                        bulkProcessImages ? "bg-blue-600" : "bg-gray-200"
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                    >
                      <span
                        aria-hidden="true"
                        className={`${
                          bulkProcessImages ? "translate-x-5" : "translate-x-0"
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>

                  {/* Show status for bulk sync */}
                  {syncMode === "bulk" && (error || result || isLoading) && (
                    <StatusDisplay
                      error={error}
                      result={result}
                      isLoading={isLoading}
                      elapsedTime={elapsedTime}
                    />
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-6 sm:flex sm:flex-row-reverse sm:px-12">
                <button
                  type="button"
                  onClick={() => {
                    handleSync("bulk");
                  }}
                  disabled={isLoading}
                  className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 sm:ml-3 sm:w-auto"
                >
                  {isLoading && syncMode === "bulk"
                    ? "Resetting..."
                    : "Reset Database"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  disabled={isLoading}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 sm:mt-0 sm:w-auto"
                >
                  {isLoading ? "Cancel" : result ? "Done" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
