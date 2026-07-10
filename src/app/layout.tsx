import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToastProvider } from "@/components/ui/Toast";
import { AuditSyncProvider } from "@/components/providers/AuditSyncProvider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { PageViewTracker } from "@/components/providers/PageViewTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AuraCheck — Find Your Biggest Status Leak",
    template: "%s | AuraCheck",
  },
  description:
    "Upload a photo, get your visual first-impression score, and discover what your presentation is quietly leaking. Free analysis, no signup.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "AuraCheck",
    title: "AuraCheck — Find Your Biggest Status Leak",
    description: "Upload a photo, get your visual first-impression score, and discover what your presentation is quietly leaking.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AuraCheck — Find Your Biggest Status Leak",
    description: "Upload a photo, get your visual first-impression score, and discover what your presentation is quietly leaking.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-depth text-[#ededf0]">
        <div className="grain-overlay" aria-hidden="true" />
        <PostHogProvider>
          <PageViewTracker />
          <ToastProvider>
            <AuditSyncProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </AuditSyncProvider>
          </ToastProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
