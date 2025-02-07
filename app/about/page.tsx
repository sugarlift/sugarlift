import { ConsultationCTA } from "@/components/ConsultationCTA";
import { QuickLink } from "@/components/Link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FAQ } from "@/components/FAQ";
import ContactForm from "@/components/ContactForm";
import Image from "next/image";
import GalleryImage from "@/app/images/Sugarlift_Gallery_Celia_Lees_Love_Language_2024_1_2321f22bdb.jpg";
import TeamImage from "@/app/images/Sugarlift_Team_Zoey_web_3770655c98.jpg";
// Mark the page as static
export const dynamic = "force-static";

// If you need to revalidate the page periodically (optional)
export const revalidate = 3600; // revalidate every hour

export default async function Home() {
  return (
    <>
      <section className="container">
        <div className="mb-[1.33vw]">
          <h1 className="big-title mb-6 max-w-[940px] text-balance">
            Sugarlift is a mission-driven art gallery founded in 2014 with a
            dedication to fostering a more sustainable and inspiring art world,
            focusing on connecting today's best artists with premiere real
            estate developers, architects, interior designers, and collectors.
          </h1>
          <p className="mb-8 max-w-3xl">
            Our unwavering mission is to help more artists create sustainable
            careers by connecting them with a broader audience. Through
            embracing technology and innovative strategies, we continually seek
            new ways for people to engage with and collect artwork, challenging
            the status quo to benefit artists and dignify their work.
          </p>
          <Button asChild className="group">
            <QuickLink
              href="/contact#inquiry-form"
              className="inline-flex items-center rounded-md bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800"
            >
              Fill an inquiry
              <ArrowRight
                className="-me-1 ms-2 mt-0.5 transition-transform group-hover:translate-x-0.5"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
            </QuickLink>
          </Button>
        </div>
      </section>

      <section className="container flex h-full w-full items-center justify-center">
        <div className="grid h-full w-full grid-cols-1 grid-rows-2 gap-4 lg:grid-cols-2">
          <div className="order-1 col-span-1 row-span-1 flex aspect-video items-center justify-center bg-zinc-100">
            <Image src={TeamImage} alt="Team" className="object-cover" />
          </div>

          <div className="order-3 col-span-1 row-span-2 flex aspect-square items-center justify-center bg-zinc-100 lg:order-2 lg:aspect-auto">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5250.027678005579!2d-74.0050555225209!3d40.7509231713878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259bf517702cb%3A0x450277d825f89251!2sSugarlift!5e1!3m2!1sen!2sfi!4v1732540543459!5m2!1sen!2sfi"
              width="100%"
              height="100%"
              className="border-0e"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          <div className="order-2 col-span-1 row-span-1 flex aspect-video items-center justify-center bg-zinc-100 lg:order-3">
            <Image src={GalleryImage} alt="Gallery" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="container grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-4">Get in touch</h3>
            <p className="text-base text-zinc-700">hello@sugarlift.com</p>
            <p className="text-base text-zinc-700">+1 (617) 981 2370</p>
            <p className="text-base text-zinc-700">Instagram</p>
            <p className="mt-8 text-base text-zinc-700">508 W 28th Street</p>
            <p className="text-base text-zinc-700">New York, NY</p>
          </div>
          <div className="max-w-[200px]">
            <h3 className="mb-4">Gallery hours</h3>
            <div className="flex justify-between">
              <p className="text-base text-zinc-700">Tue - Fri</p>
              <p className="text-base text-zinc-700">10AM – 6PM</p>
            </div>
            <div className="flex justify-between">
              <p className="text-base text-zinc-700">Sat</p>
              <p className="text-base text-zinc-700">12PM – 6PM</p>
            </div>
            <div className="flex justify-between">
              <p className="text-base text-zinc-700">Sun - Mon</p>
              <p className="text-base text-zinc-700">Closed</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="mb-5">Inquiry form</h3>
          <ContactForm />
        </div>
      </section>

      <FAQ />
      <ConsultationCTA />
    </>
  );
}
