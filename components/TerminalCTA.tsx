import { QuickLink } from "@/components/Link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function TerminalCTA() {
  return (
    <div className="border-t py-10 md:py-[4vw]">
      <div className="container text-center">
        <h2 className="mb-4">Get in touch</h2>
        <p className="mx-auto mb-8 max-w-3xl text-lg tracking-tight text-zinc-500">
          We'd love to hear from you! Whether you have questions about our
          services, need advice on art selection, or want to discuss a potential
          project, our team is here to help.
        </p>
        <Button asChild className="group">
          <QuickLink
            href="/contact"
            className="inline-flex items-center rounded-md bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800"
          >
            Contact us
            <ArrowRight
              className="-me-1 ms-2 mt-0.5 transition-transform group-hover:translate-x-0.5"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
          </QuickLink>
        </Button>
      </div>
    </div>
  );
}
