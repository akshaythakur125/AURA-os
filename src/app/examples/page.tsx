import type { Metadata } from "next";
import ExamplesPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Sample Reports & Examples — See AuraCheck in Action",
  description:
    "View real sample reports from simulated audits. See the visual breakdown, status leak analysis, budget upgrade path, and before/after comparisons before you decide to unlock.",
  openGraph: {
    title: "AuraCheck Examples — Sample Reports & Before/After Comparisons",
    description:
      "Three products, three different outputs. See the full report format and insights before you buy.",
    images: [
      {
        url: "/api/og?category=Sample+Reports&leak=See+what+you+get+before+you+unlock",
        width: 1200,
        height: 630,
        alt: "AuraCheck Sample Reports & Examples",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <ExamplesPage />;
}
