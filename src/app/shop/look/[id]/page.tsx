import { notFound } from "next/navigation";
import { getHeroLooks } from "@/lib/shop/catalog";
import { hasLookComposition } from "@/lib/shop/lookCompositions";
import { LookDetailClient } from "./ClientPage";

export default async function LookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const look = getHeroLooks().find((item) => item.id === id);

  if (!look || !hasLookComposition(look.id)) {
    notFound();
  }

  return <LookDetailClient look={look} />;
}
