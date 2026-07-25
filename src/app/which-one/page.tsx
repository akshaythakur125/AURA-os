import type { Metadata } from "next";
import WhichOnePage from "./ClientPage";

export const metadata: Metadata = {
  title: "Which One? — Pick the Better Photo | AuraCheck",
  description:
    "Stuck between two photos? Upload both and get an instant verdict on which one to post — with the reason. Free, private, analyzed on your device.",
  openGraph: {
    title: "Which One? — Pick the Better Photo",
    description: "Upload two pics, get an instant winner with the reason. Free and private.",
    images: [{ url: "/api/og?category=Which+One%3F&leak=Pick+the+better+photo+instantly", width: 1200, height: 630, alt: "Which One? — AuraCheck" }],
    type: "website",
  },
};

export default function Page() {
  return <WhichOnePage />;
}
