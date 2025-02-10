import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { QuickLink } from "@/components/Link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-4xl">404 - Page not found</h1>
      <p className="text-xl text-gray-600">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Button asChild className="group mt-4">
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
    </main>
  );
}
