import { Metadata } from "next";
import { COMPANY_METADATA } from "@/app/lib/constants";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: `${COMPANY_METADATA.name} | Privacy Policy`,
  description:
    "Privacy Policy for Sugarlift, an art consultancy and contemporary art gallery in New York City.",
  alternates: {
    canonical: `${COMPANY_METADATA.url}/privacy-policy`,
  },
};

export const revalidate = 3600;

export default async function PrivacyPolicy() {
  return (
    <>
      <section className="container">
        <div>
          <h1 className="big-title mb-6 max-w-[750px]">Privacy Policy</h1>
          <p className="mb-4 max-w-3xl text-sm text-gray-500">
            Last updated: March 28, 2026
          </p>
        </div>
      </section>

      <section className="container">
        <div className="max-w-3xl">
          <h2 className="mb-4 text-xl font-semibold md:text-2xl">
            Introduction
          </h2>
          <p className="mb-8">
            Sugarlift (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is an art consultancy and contemporary
            art gallery based in New York City. This Privacy Policy explains
            how we collect, use, and protect your personal information when you
            visit our website, engage with our services, or interact with our
            business tools.
          </p>

          <h2 className="mb-4 text-xl font-semibold md:text-2xl">
            Information We Collect
          </h2>
          <p className="mb-4">
            We may collect the following types of information:
          </p>
          <ul className="mb-8 list-disc pl-8 space-y-2">
            <li>
              <strong>Contact information</strong> - name, email address, phone
              number, and mailing address when you inquire about artwork, submit
              a contact form, or engage our consulting services.
            </li>
            <li>
              <strong>Business information</strong> - company name, project
              details, and billing information when you work with us on art
              consulting projects.
            </li>
            <li>
              <strong>Website usage data</strong> - standard analytics data such
              as pages visited, time on site, and referring URLs, collected
              through cookies and similar technologies.
            </li>
          </ul>

          <h2 className="mb-4 text-xl font-semibold md:text-2xl">
            How We Use Your Information
          </h2>
          <ul className="mb-8 list-disc pl-8 space-y-2">
            <li>To provide art consulting and gallery services</li>
            <li>To communicate with you about projects, exhibitions, and artwork</li>
            <li>To process transactions and send invoices</li>
            <li>To improve our website and services</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h2 className="mb-4 text-xl font-semibold md:text-2xl">
            Third-Party Services
          </h2>
          <p className="mb-8">
            We use trusted third-party services to help operate our business,
            including accounting software, customer relationship management
            tools, and payment processors. These services may access your
            information only to perform tasks on our behalf and are obligated
            not to disclose or use it for other purposes.
          </p>

          <h2 className="mb-4 text-xl font-semibold md:text-2xl">
            Data Security
          </h2>
          <p className="mb-8">
            We take reasonable measures to protect your personal information
            from unauthorized access, use, or disclosure. Financial data is
            processed through encrypted, industry-standard systems and is never
            shared with unauthorized parties.
          </p>

          <h2 className="mb-4 text-xl font-semibold md:text-2xl">
            Data Retention
          </h2>
          <p className="mb-8">
            We retain your personal information only for as long as necessary to
            fulfill the purposes described in this policy, or as required by
            law.
          </p>

          <h2 className="mb-4 text-xl font-semibold md:text-2xl">
            Your Rights
          </h2>
          <p className="mb-8">
            You may request access to, correction of, or deletion of your
            personal information at any time by contacting us. We will respond
            to your request within a reasonable timeframe.
          </p>

          <h2 className="mb-4 text-xl font-semibold md:text-2xl">
            Changes to This Policy
          </h2>
          <p className="mb-8">
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page with an updated revision date.
          </p>

          <h2 className="mb-4 text-xl font-semibold md:text-2xl">
            Contact Us
          </h2>
          <p className="mb-8">
            If you have any questions about this Privacy Policy, please contact
            us at:
          </p>
          <p className="mb-8">
            Sugarlift
            <br />
            43-01 22nd Street, Studio 130 + 131
            <br />
            Long Island City, NY 11101
            <br />
            info@sugarlift.com
          </p>
        </div>
      </section>
    </>
  );
}
