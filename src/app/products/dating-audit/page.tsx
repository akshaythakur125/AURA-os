import type { Metadata } from "next";
import DatingAuditPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Dating & Profile Audit — Fix Friction in Your Presentation",
  description:
    "AuraCheck reviews your dating profile photo, bio, prompts, and visual signal. Get a profile text score, red-flag detection, 3 suggested bios, and clear next steps.",
  openGraph: {
    title: "Dating & Profile Audit — One-Time Unlock",
    description:
      "Fix the friction in your dating profile. Bio analysis, prompt grading, red-flag detection, and 3 suggested bios.",
    images: [
      {
        url: "/api/og?category=Dating+Profile+Audit&leak=Fix+your+dating+profile",
        width: 1200,
        height: 630,
        alt: "Dating & Profile Audit — Fix Your Profile",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <DatingAuditPage />;
}
