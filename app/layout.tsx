import type { Metadata } from "next";
import localFont from "next/font/local";
import Navigation from "@/components/Navigation/Navigation";
import Footer from "@/components/Footer";
import "./styles/globals.scss";
import { COMPANY_METADATA } from "@/app/lib/constants";
import Script from "next/script";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: `${COMPANY_METADATA.name} | Contemporary art gallery in New York`,
  description:
    "Sugarlift is a contemporary art gallery based in New York, an industry-leading art consulting service, and a global artist community representing today's best and brightest contemporary artists.",
  alternates: {
    canonical: COMPANY_METADATA.url,
  },
  authors: [{ name: COMPANY_METADATA.name }],
  generator: "Next.js",
  applicationName: COMPANY_METADATA.name,
  referrer: "origin-when-cross-origin",
  keywords: [
    "art gallery",
    "contemporary art",
    "new york gallery",
    "art consulting",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "your-google-site-verification", // Add your Google verification code
  },
  openGraph: {
    title: `${COMPANY_METADATA.name} | Contemporary art gallery in New York`,
    description:
      "Sugarlift is a contemporary art gallery based in New York, an industry-leading art consulting service, and a global artist community representing today's best and brightest contemporary artists.",
    url: COMPANY_METADATA.url,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link type="text/plain" rel="author" href="/humans.txt" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <Script
        defer
        data-domain="sugarlift.com"
        src="https://plausible.io/js/script.js"
        strategy="afterInteractive"
      />
      <body
        className={`${geistSans.variable} flex min-h-screen flex-col antialiased`}
      >
        <Navigation />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
