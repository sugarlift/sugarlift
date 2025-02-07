import { QuickLink } from "@/components/Link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function ThankYou() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="mb-4">Thank You!</h1>
      <p className="mb-8">
        We've received your message and will get back to you shortly.
      </p>
      <Button asChild className="group">
        <QuickLink
          href="/contact"
          className="inline-flex items-center bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800"
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
  );
}
