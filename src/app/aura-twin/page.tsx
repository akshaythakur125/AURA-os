import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Aura Twin Studio — Preview Photo Improvements",
  description: "See how your photo would look with better lighting, cropping, and background before making changes in real life.",
};

export default function Page() {
  return <ClientPage />;
}
