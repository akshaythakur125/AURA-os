"use client";

import { Card } from "@/components/ui/Card";
import { searchLink } from "@/lib/shop/searchLink";
import { AffiliateItemList, type AffiliateItem } from "@/components/shop/AffiliateItemList";

/**
 * Grooming/skincare picks driven by the MEASURED skin read (shine, under-eye,
 * even tone, texture) plus hair. Framed for how skin *photographs*, never as
 * medical/dermatological advice — matching the report's own disclaimer.
 */
interface Skin {
  clarity: number;
  evenness: number;
  shine: number; // higher = worse
  underEye: number; // higher = worse
  texture: number;
}

function beautyLinks(query: string, category: string): AffiliateItem["links"] {
  return [
    { label: "Nykaa", url: searchLink(query, "nykaa"), retailer: "nykaa", category },
    { label: "Amazon", url: searchLink(query, "amazon"), retailer: "amazon", category },
  ];
}

export function GroomingPicksCard({ skin, hairNeatness }: { skin: Skin; hairNeatness?: number | null }) {
  const items: AffiliateItem[] = [];

  if (skin.shine >= 55) {
    items.push({
      label: "Mattifying primer / oil-control",
      why: `Your T-zone shine measured ${skin.shine}/100 — a mattifying primer or blotting sheet keeps you matte instead of glossy on camera.`,
      priceHint: "₹250–600",
      links: beautyLinks("mattifying primer oil control face", "grooming"),
    });
  }
  if (skin.underEye >= 55) {
    items.push({
      label: "Under-eye corrector",
      why: `Under-eye shadow read ${skin.underEye}/100. A peach colour-corrector or a light concealer cancels it so your eyes look rested in photos.`,
      priceHint: "₹300–700",
      links: beautyLinks("under eye color corrector concealer", "grooming"),
    });
  }
  if (skin.evenness < 55) {
    items.push({
      label: "Tone-evening serum (vitamin C)",
      why: `Even tone measured ${skin.evenness}/100 — a vitamin C serum helps your skin read more uniform under a camera over a few weeks.`,
      priceHint: "₹350–800",
      links: beautyLinks("vitamin c face serum", "grooming"),
    });
  }
  if (skin.texture < 55) {
    items.push({
      label: "Smoothing serum (niacinamide)",
      why: `Smoothness measured ${skin.texture}/100. A niacinamide serum + a good moisturiser soften how fine texture catches the light.`,
      priceHint: "₹300–700",
      links: beautyLinks("niacinamide serum face", "grooming"),
    });
  }
  if (typeof hairNeatness === "number" && hairNeatness < 60) {
    items.push({
      label: "Anti-frizz hair serum",
      why: `Your hair read a little unruly (${Math.round(hairNeatness)}/100). A pea-sized smoothing serum tames flyaways so hair stops pulling focus from your face.`,
      priceHint: "₹200–500",
      links: beautyLinks("anti frizz hair smoothing serum", "grooming"),
    });
  }

  // Nothing flagged → one universal on-camera staple.
  if (items.length === 0) {
    items.push({
      label: "Lightweight moisturiser + SPF",
      why: "Your skin already photographs well — a light moisturiser with SPF keeps it healthy and even for every future shot.",
      priceHint: "₹250–600",
      links: beautyLinks("oil free moisturizer spf face", "grooming"),
    });
  }

  return (
    <Card className="mb-6">
      <h3 className="mb-1 text-sm font-semibold text-[#1C1917]">🧴 Grooming picks for your skin read</h3>
      <p className="mb-4 text-xs text-[#857b6e]">
        Tied to what your skin actually measured — for how it <em>photographs</em>, not a medical assessment.
      </p>
      <AffiliateItemList items={items.slice(0, 4)} />
    </Card>
  );
}
