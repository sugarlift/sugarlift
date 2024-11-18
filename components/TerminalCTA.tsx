import { QuickLink } from "@/components/Link";

export function TerminalCTA() {
  return (
    <section className="border-t pt-12 lg:pt-24">
      <div className="container text-center">
        <h2 className="mb-4 text-3xl">Get in touch</h2>
        <p className="mx-auto mb-8 max-w-2xl text-gray-600">
          We'd love to hear from you! Whether you have questions about our
          services, need advice on art selection, or want to discuss a potential
          project, our team is here to help.
        </p>
        <QuickLink
          href="/contact"
          className="inline-flex items-center rounded-md bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800"
        >
          Contact us
          <svg
            className="ml-2 h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </QuickLink>
      </div>
    </section>
  );
}
