import Image from "next/image";
import { QuickLink } from "@/components/Link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import AvrokoLogo from "@/components/LogoCarousel/AVRO.png";
import RafflesLogo from "@/components/LogoCarousel/Raffles.png";
import RottetLogo from "@/components/LogoCarousel/RottetStudio.png";
import FourSeasonsLogo from "@/components/LogoCarousel/FourSeasons.png";
import HotelAkaLogo from "@/components/LogoCarousel/HotelAka.png";
import MdLogo from "@/components/LogoCarousel/MD.png";
import PldLogo from "@/components/LogoCarousel/PLDNYC.png";
import CbreLogo from "@/components/LogoCarousel/CBRE.png";
import FogartyLogo from "@/components/LogoCarousel/FogartyFinger.png";

const PARTNER_LOGOS = [
  { name: "Avroko", src: AvrokoLogo },
  { name: "Raffles", src: RafflesLogo },
  { name: "Rottet Studio", src: RottetLogo },
  { name: "Four Seasons", src: FourSeasonsLogo },
  { name: "Hotel AKA", src: HotelAkaLogo },
  { name: "MD", src: MdLogo },
  { name: "PLD NYC", src: PldLogo },
  { name: "CBRE", src: CbreLogo },
  { name: "Fogarty Finger", src: FogartyLogo },
];

export function ConsultationCTA() {
  return (
    <section className="border-t pb-16 pt-12 md:py-24">
      <div className="container">
        <div className="mb-8 text-center md:mb-16">
          <h2 className="mx-auto max-w-2xl text-2xl md:text-3xl">
            We are proud to partner with some of the leading design firms and
            brands in the industry.
          </h2>
        </div>

        <div className="mb-12 grid grid-cols-3 items-center gap-6 md:mb-16 lg:grid-cols-9">
          {PARTNER_LOGOS.map((logo) => (
            <div
              key={logo.name}
              className="flex items-center justify-center p-4"
            >
              <Image
                src={logo.src}
                alt={`${logo.name} logo`}
                className="h-auto max-h-10 w-auto opacity-80 transition-opacity hover:opacity-100 md:max-h-14"
                style={{ objectFit: "contain", maxWidth: "100%" }}
              />
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button asChild className="group">
            <QuickLink
              href="/about"
              className="inline-flex items-center rounded-md bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800"
            >
              Learn more about Sugarlift
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
    </section>
  );
}
