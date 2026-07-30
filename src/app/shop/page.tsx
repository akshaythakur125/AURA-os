import type { Metadata } from "next";
import ShopPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Shop Full Looks - AuraCheck",
  description:
    "Browse full shoppable looks with individual piece links. Filter by category, budget, and goal to find outfits that fit your style and your audit needs.",
  openGraph: {
    title: "AuraCheck Shop - Full Looks You Can Shop Piece by Piece",
    description:
      "Complete looks, not random single products. Open any look to shop each piece separately.",
    images: [
      {
        url: "/api/og?category=Shop+Full+Looks&leak=Complete+looks+with+piece-by-piece+buy+links",
        width: 1200,
        height: 630,
        alt: "AuraCheck Shop - Full Looks",
      },
    ],
    type: "website",
  },
};

export default function Page() {
  return <ShopPage />;
}
