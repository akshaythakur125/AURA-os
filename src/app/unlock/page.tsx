import type { Metadata } from "next";
import UnlockPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Unlock Full Report — Enter Your Access Code",
  description:
    "Enter your unlock code to access your full Aura Report. Get detailed visual analysis, photo-quality issue fixes, budget upgrade plan, and goal-specific strategy.",
  openGraph: {
    title: "Unlock Your Full Aura Report",
    description:
      "Enter your access code to see the complete analysis — visual breakdown, ranked leaks, and personalized upgrade path.",
    images: [
      {
        url: "/api/og?category=Unlock+Full+Report&leak=Enter+your+access+code",
        width: 1200,
        height: 630,
        alt: "Unlock Your Full Aura Report",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <UnlockPage />;
}
