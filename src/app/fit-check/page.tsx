import type { Metadata } from "next";
import FitCheckPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Fit Check — Rate My Outfit | AuraCheck",
  description:
    "Upload your outfit and get an honest fit check — your style, colours, what works, the one upgrade, and where it lands best. Free, private, on your device.",
  openGraph: {
    title: "Fit Check — Rate My Outfit",
    description: "Get an honest read on your outfit — style, colours, and the one upgrade. Free.",
    images: [{ url: "/api/og?category=Fit+Check&leak=Rate+your+outfit+instantly", width: 1200, height: 630, alt: "Fit Check — AuraCheck" }],
    type: "website",
  },
};

export default function Page() {
  return <FitCheckPage />;
}
