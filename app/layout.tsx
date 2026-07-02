import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const manrope = Manrope({
  variable: "--font-manrope-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AuraCheck | First-Impression Intelligence",
  description:
    "Premium first-impression audit for photos, profiles, outfits, and visual presence.",
  manifest: "/manifest.json",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://auracheck.vercel.app"),
  openGraph: {
    title: "AuraCheck | First-Impression Intelligence",
    description:
      "Premium first-impression audit for photos, profiles, outfits, and visual presence.",
    url: "/",
    siteName: "AuraCheck",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AuraCheck | First-Impression Intelligence",
    description:
      "Premium first-impression audit for photos, profiles, outfits, and visual presence.",
    images: ["/opengraph-image"],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#07111f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col overflow-x-hidden">
        <div className="mesh-glow floating-orb left-[-8rem] top-20 h-72 w-72 bg-sky-400/20" />
        <div className="mesh-glow floating-orb right-[-10rem] top-32 h-80 w-80 bg-orange-400/15" />
        <div className="mesh-glow floating-orb bottom-0 left-1/3 h-96 w-96 bg-blue-500/12" />
        <Header />
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
