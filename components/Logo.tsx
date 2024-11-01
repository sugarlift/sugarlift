import Image from "next/image";
import { COMPANY_METADATA } from "../app/lib/constants";

export default function Logo() {
  return (
    <Image
      src="/sugarliftLogoBlack.svg"
      alt={`${COMPANY_METADATA.name} logo`}
      width={120.278}
      height={12.5}
      aria-label={`${COMPANY_METADATA.name} logo`}
    />
  );
}
