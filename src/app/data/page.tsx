import type { Metadata } from "next";
import DataPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Your Data — Export, View & Delete Everything",
  description:
    "View, export, or delete all your AuraCheck data. Everything stays in your browser — audits, orders, analytics, leads, and preferences.",
  openGraph: {
    title: "AuraCheck Data — Export, View & Delete",
    description:
      "Full control over your data. Export, view, or delete everything. Nothing leaves your browser.",
    images: [
      {
        url: "/api/og?category=Your+Data&leak=Full+control+over+your+data",
        width: 1200,
        height: 630,
        alt: "AuraCheck Data — Export, View & Delete",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <DataPage />;
}
