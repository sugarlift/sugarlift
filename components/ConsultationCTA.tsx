import Image from "next/image";
import { QuickLink } from "@/components/Link";
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
    <section className="border-t py-24">
      <div className="container">
        <div className="mb-16 text-center">
          <h2 className="mx-auto max-w-3xl text-2xl md:text-3xl">
            We are proud to partner with some of the leading design firms and
            brands in the industry.
          </h2>
        </div>

        <div className="mb-16 grid grid-cols-3 items-center gap-6 lg:grid-cols-9">
          {PARTNER_LOGOS.map((logo) => (
            <div
              key={logo.name}
              className="flex items-center justify-center px-4"
            >
              <Image
                src={logo.src}
                alt={`${logo.name} logo`}
                className="h-auto max-h-14 w-full opacity-80 transition-opacity hover:opacity-100"
                style={{ objectFit: "contain" }}
              />
            </div>
          ))}
        </div>

        <div className="text-center">
          <QuickLink
            href="/contact"
            className="inline-flex items-center rounded bg-black px-8 py-4 text-white transition-colors hover:bg-gray-800"
          >
            Schedule a Consultation
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
      </div>
    </section>
  );
}
