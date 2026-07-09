import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What's Your Aura Score? | AuraCheck",
  description:
    "Drop a selfie. Get your aura score in 8 seconds. See what's holding your vibe back — free, no sign-up.",
  openGraph: {
    title: "What's Your Aura Score?",
    description:
      "Drop a selfie. Get your aura score in 8 seconds. See what's holding your vibe back.",
  },
};

export default function TryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`#site-header,#site-footer{display:none!important}`}</style>
      {children}
    </>
  );
}
