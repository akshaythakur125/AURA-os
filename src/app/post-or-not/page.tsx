import type { Metadata } from "next";
import PostOrNotPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Post or Not? — Instant Honest Verdict on Your Photo | AuraCheck",
  description:
    "Should you post that photo? Upload it and get an instant, honest verdict — POST IT, ALMOST, or NOT YET — with the one measured reason and the fix. Free, private, analyzed on your device.",
  openGraph: {
    title: "Post or Not? — Get an Instant Verdict on Your Photo",
    description:
      "Upload a pic, get an honest POST IT / ALMOST / NOT YET verdict with the one fix. Free and private.",
    images: [
      {
        url: "/api/og?category=Post+or+Not%3F&leak=Get+an+instant+verdict+on+your+photo",
        width: 1200,
        height: 630,
        alt: "Post or Not? — AuraCheck",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <PostOrNotPage />;
}
