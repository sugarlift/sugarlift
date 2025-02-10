"use client";

import { Button } from "@/components/ui/button";
import { RotateCw, ArrowRight } from "lucide-react";
import { QuickLink } from "@/components/Link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-4xl">Something went wrong</h1>
      <p className="text-xl text-gray-600">
        Sorry, we encountered an unexpected error.
      </p>
      <div className="flex gap-4">
        <Button
          onClick={reset}
          className="inline-flex items-center rounded-md bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800"
        >
          Try again
          <RotateCw
            className="-me-1 ms-2 mt-0.5 transition-transform group-hover:translate-x-0.5"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
        </Button>
        <Button asChild className="group">
          <QuickLink
            href="/"
            className="inline-flex items-center rounded-md bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800"
          >
            Return Home
            <ArrowRight
              className="-me-1 ms-2 mt-0.5 transition-transform group-hover:translate-x-0.5"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
          </QuickLink>
        </Button>
      </div>
    </main>
  );
}
