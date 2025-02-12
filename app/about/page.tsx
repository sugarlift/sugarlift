import { Metadata } from "next";
import { COMPANY_METADATA } from "@/app/lib/constants";
// Mark the page as static
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: `${COMPANY_METADATA.name} | About`,
  description:
    "Sugarlift is a contemporary art gallery based in New York, an industry-leading art consulting service, and a global artist community representing today's best and brightest contemporary artists.",
  alternates: {
    canonical: `${COMPANY_METADATA.url}/about`,
  },
  openGraph: {
    title: `${COMPANY_METADATA.name} | About`,
    description:
      "Sugarlift is a contemporary art gallery based in New York, an industry-leading art consulting service, and a global artist community representing today's best and brightest contemporary artists.",
    url: `${COMPANY_METADATA.url}/about`,
    siteName: COMPANY_METADATA.name,
    images: [
      {
        url: `${COMPANY_METADATA.url}/og-image.jpg`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

// If you need to revalidate the page periodically (optional)
export const revalidate = 3600; // revalidate every hour

export default async function Home() {
  return (
    <>
      <section className="container">
        <div>
          <h1 className="big-title mb-6 max-w-[750px]">
            Sugarlift started with a simple question: how can we contribute to
            creating better art, putting it into the world, and supporting the
            artists who make it?
          </h1>
          <p className="mb-8 max-w-3xl">
            From this single concept, Sugarlift has grown from a small gallery
            in Brooklyn to a platform connecting the most talented artists with
            collectors and client opportunities across the world.
          </p>
          <p className="mb-8 max-w-3xl">
            Sugarlift was founded in 2014 by Wright Harvey. Ever since he was a
            kid, Wright dreamed of being an artist. In college, while studying
            painting and printmaking, he told his future wife, Calvine, that one
            day he would build his version of Andy Warhol's Factory, where
            artists could push the limits of their creativity and create new
            ideas that make the world more interesting and richer as a result.
          </p>
        </div>
      </section>

      <section className="container">
        <h2 className="mb-8 max-w-3xl text-xl md:text-3xl">
          There are several beliefs that are fundamental to Sugarlift, some of
          which we have believed from the beginning and some of which we have
          learned from experience.
        </h2>

        <h3 className="mb-2 max-w-3xl text-lg font-semibold">
          We put artists first
        </h3>
        <p className="mb-8 max-w-3xl pl-0 md:pl-8">
          The purpose of our gallery is to nurture the development of the artist
          community. We are always in service of this idea. We believe in
          building one relationship at a time to understand the goals and needs
          of each artist, to see how we can form a truly symbiotic relationship.
          Our goal is to help you realize your potential creatively and in your
          career growth.
        </p>

        <h3 className="mb-2 max-w-3xl text-lg font-semibold">
          We believe in the independent artist
        </h3>
        <p className="mb-8 max-w-3xl pl-0 md:pl-8">
          The world has changed. Gone are the days when artists needed an
          exclusive gallery relationship in order to sell their work or grow in
          their career. Today, artists have more responsibility for developing
          their own brand and have the ability to communicate directly to
          certain audiences.
        </p>

        <h3 className="mb-2 max-w-3xl text-lg font-semibold">
          We believe that galleries and in-person exhibitions are still very
          important
        </h3>
        <p className="mb-8 max-w-3xl pl-0 md:pl-8">
          Actually essential. We believe that in this new world, the independent
          artist should have several relationships with galleries, curators, and
          advisors, and also sell directly from their studios. Maximizing each
          artist's opportunities should be a shared goal for all of us.
        </p>
      </section>
      <section className="container">
        <div>
          <p className="mb-8 max-w-3xl">
            We sincerely appreciate the opportunity to build a presence in this
            art world. We hope that our perspective can offer a fresh, new,
            uplifting take, especially for those who feel jaded or cynical about
            some of the art world's shortcomings.
          </p>
          <p className="mb-8 max-w-3xl">
            We hope that you will join our efforts, dream big, and find your own
            way to contribute to building a more successful, vibrant art world.
          </p>
          <p className="mb-8 max-w-3xl">
            Sincerely,
            <br />
            <i>Wright Harvey</i>
          </p>
        </div>
      </section>
    </>
  );
}
