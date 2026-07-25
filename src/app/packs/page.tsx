import type { Metadata } from "next";
import PacksPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Ready-For-It Packs — Festival, Placement & Dating | AuraCheck",
  description:
    "Is your photo ready for the moment? Check it against a Festival Glow, Placement-Ready, or Dating-Ready checklist — instant, free, private.",
  openGraph: {
    title: "Ready-For-It Packs — AuraCheck",
    description: "Check your photo against a Festival, Placement, or Dating checklist. Free.",
    images: [{ url: "/api/og?category=Ready-For-It+Packs&leak=Festival%2C+Placement+%26+Dating", width: 1200, height: 630, alt: "Ready-For-It Packs — AuraCheck" }],
    type: "website",
  },
};

export default function Page() {
  return <PacksPage />;
}
