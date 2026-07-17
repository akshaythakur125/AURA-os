import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WorldBackground } from "@/components/world/WorldBackground";
import { ToastProvider } from "@/components/ui/Toast";
import { AuditSyncProvider } from "@/components/providers/AuditSyncProvider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { PageViewTracker } from "@/components/providers/PageViewTracker";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0a12",
};

export const metadata: Metadata = {
  title: {
    default: "AuraCheck — See Your Real First Impression",
    template: "%s | AuraCheck",
  },
  description:
    "Upload a photo, get your free Aura Score. See what your first impression is really saying. No signup.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://fixmyaura.shop"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "AuraCheck",
    title: "AuraCheck — See Your Real First Impression",
    description: "Upload a photo, get your free Aura Score. See what your first impression is really saying.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AuraCheck — See Your Real First Impression",
    description: "Upload a photo, get your free Aura Score. See what your first impression is really saying.",
  },
  manifest: "/manifest.json",
  other: {
    "theme-color": "#000000",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-depth text-[#1c1917]">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-red-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none">
          Skip to content
        </a>
        <WorldBackground />
        <div className="grain-overlay" aria-hidden="true" />
        <PostHogProvider>
          <PageViewTracker />
          <ToastProvider>
            <AuditSyncProvider>
              <Header />
              <main id="main-content" className="relative flex-1">{children}</main>
              <Footer />
            </AuditSyncProvider>
          </ToastProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
