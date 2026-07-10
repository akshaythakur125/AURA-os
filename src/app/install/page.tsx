import type { Metadata } from "next";
import InstallPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Install AuraCheck — Add to Home Screen",
  description:
    "Install AuraCheck as a progressive web app on your device. Get instant access to your Aura Score, challenges, and progress tracker.",
  openGraph: {
    title: "Install AuraCheck — Progressive Web App",
    description:
      "Add AuraCheck to your home screen for instant access. Works offline, no app store needed.",
    images: [
      {
        url: "/api/og?category=Install+AuraCheck&leak=Add+to+your+home+screen",
        width: 1200,
        height: 630,
        alt: "Install AuraCheck — Add to Home Screen",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <InstallPage />;
}
