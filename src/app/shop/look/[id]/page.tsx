import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLookById } from "@/lib/shop/catalog";
import { LookDetailClient } from "./ClientPage";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const look = getLookById(id);

  if (!look) {
    return {
      title: "Look Not Found — AuraCheck Shop",
      description: "This look could not be found in the catalog.",
    };
  }

  const title = `${look.title} — Shop the Look`;
  const description = `${look.description} Matched retailer links across Amazon, Flipkart, Myntra, Ajio, and Nykaa.`;

  return {
    title,
    description,
    openGraph: {
      title: `${look.title} — AuraCheck Shop`,
      description,
      images: [
        {
          url: `/api/og?category=${encodeURIComponent(look.title)}&leak=${encodeURIComponent(
            look.category
          )}`,
          width: 1200,
          height: 630,
          alt: look.imageAlt || look.title,
        },
      ],
      type: "website",
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const look = getLookById(id);

  if (!look) notFound();

  return <LookDetailClient look={look} />;
}
