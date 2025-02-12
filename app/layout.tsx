import type { Metadata } from "next";
import localFont from "next/font/local";
import Navigation from "@/components/Navigation/Navigation";
import Footer from "@/components/Footer";
import "./styles/globals.scss";
import { COMPANY_METADATA } from "@/app/lib/constants";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: `${COMPANY_METADATA.name} | ${COMPANY_METADATA.description}`,
  description:
    "Sugarlift is a contemporary art gallery based in New York, an industry-leading art consulting service, and a global artist community representing today's best and brightest contemporary artists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} flex flex-col antialiased`}>
        <Navigation />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
