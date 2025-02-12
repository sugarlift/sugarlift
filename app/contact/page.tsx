import ContactForm from "@/components/ContactForm";
import { Metadata } from "next";
import { COMPANY_METADATA } from "@/app/lib/constants";
// Mark the page as static
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: `${COMPANY_METADATA.name} | About`,
  description:
    "Sugarlift is a contemporary art gallery based in New York, an industry-leading art consulting service, and a global artist community representing today's best and brightest contemporary artists.",
};

// If you need to revalidate the page periodically (optional)
export const revalidate = 3600; // revalidate every hour

export default async function Home() {
  return (
    <>
      <section className="container">
        <div>
          <h1 className="big-title mb-6 max-w-[940px] text-balance">
            Contact Sugarlift
          </h1>
          <p className="mb-8 max-w-3xl">
            We are always looking for new opportunities to support artists and
            projects. Please reach out to us with any inquiries or feedback.
          </p>
        </div>
      </section>

      <section
        className="container grid grid-cols-1 gap-8 md:grid-cols-2"
        id="contact"
      >
        <div className="grid grid-cols-1 gap-8">
          <div>
            <h3 className="mb-4">Get in touch</h3>
            <p className="text-base text-zinc-700">hello@sugarlift.com</p>
            <p className="text-base text-zinc-700">+1 (917) 370-5030</p>
            <p className="text-base text-zinc-700">
              <a href="https://www.instagram.com/sugarlift/">Instagram</a>
            </p>
          </div>
          <div className="max-w-[200px]">
            <h3 className="mb-4">Gallery</h3>
            <p className="text-base text-zinc-700">43-01 22nd Street</p>
            <p className="text-base text-zinc-700">Studio 130 + 131</p>
            <p className="text-base text-zinc-700">
              Long Island City, NY 11101
            </p>
            <p className="mt-8 text-base text-zinc-700">
              Sugarlift Gallery is open by appointment only.
            </p>
          </div>
        </div>
        <div>
          <h3 className="mb-5">Inquiry form</h3>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
