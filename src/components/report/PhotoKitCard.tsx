"use client";

import { Card } from "@/components/ui/Card";
import { searchLink } from "@/lib/shop/searchLink";
import { AffiliateItemList, type AffiliateItem } from "@/components/shop/AffiliateItemList";

/**
 * "Your photo kit" — gear recommendations driven by the photo's MEASURED
 * weaknesses (lighting, sharpness, background, flatness). High-intent and
 * reusable: this gear improves every future photo, so it converts well and is
 * honest — each item is tied to a number the report actually measured.
 */
interface Metrics {
  lightingScore?: number;
  sharpness?: number;
  backgroundComplexityEstimate?: number;
  contrast?: number;
  imageDullness?: number;
  faceBrightness?: number;
  faceDetected?: boolean;
}

function gearLinks(query: string, category: string, withFlipkart = true): AffiliateItem["links"] {
  const links = [{ label: "Amazon", url: searchLink(query, "amazon"), retailer: "amazon", category }];
  if (withFlipkart) links.push({ label: "Flipkart", url: searchLink(query, "flipkart"), retailer: "flipkart", category });
  return links;
}

export function PhotoKitCard({ metrics }: { metrics: Metrics }) {
  const lighting = metrics.lightingScore ?? 70;
  const sharp = metrics.sharpness ?? 70;
  const bg = metrics.backgroundComplexityEstimate ?? 40;
  const contrast = metrics.contrast ?? 50;
  const dull = metrics.imageDullness ?? 30;
  const faceDark = metrics.faceDetected === true && (metrics.faceBrightness ?? 60) < 45;

  const items: AffiliateItem[] = [];

  if (lighting < 65 || faceDark) {
    items.push({
      label: "Ring light / LED key light",
      why: `Your lighting scored ${lighting}/100 — a key light at eye level is the single biggest, most reusable upgrade for every photo you take.`,
      priceHint: "₹600–1,500",
      links: gearLinks("ring light for phone with tripod stand", "lighting"),
    });
  }
  if (sharp < 60) {
    items.push({
      label: "Phone tripod + shutter remote",
      why: `Sharpness scored ${sharp}/100 — most of that is hand-shake. A tripod lets you use the sharper rear camera and shoot hands-free.`,
      priceHint: "₹300–800",
      links: gearLinks("mobile phone tripod stand with bluetooth remote", "clarity"),
    });
  }
  if (bg > 55) {
    items.push({
      label: "Plain photo backdrop",
      why: `Background clutter measured ${bg}/100. A collapsible neutral backdrop gives you one clean, repeatable background for every shot.`,
      priceHint: "₹500–1,200",
      links: gearLinks("collapsible photography backdrop plain grey", "background"),
    });
  }
  if (contrast < 35 || dull > 55) {
    items.push({
      label: "5-in-1 reflector",
      why: "Your light reads flat — a cheap reflector bounces light back onto your face for instant depth and pop, no editing needed.",
      priceHint: "₹500–900",
      links: gearLinks("5 in 1 photography reflector", "lighting"),
    });
  }

  // If the photo is already strong, still offer one high-value staple.
  if (items.length === 0) {
    items.push({
      label: "Bluetooth shutter remote",
      why: "Your setup already works — a tiny shutter remote just makes hands-free, well-framed reshoots effortless.",
      priceHint: "₹200–500",
      links: gearLinks("bluetooth camera shutter remote for phone", "clarity"),
    });
  }

  return (
    <Card className="mb-6">
      <h3 className="mb-1 text-sm font-semibold text-[#1C1917]">📸 Your photo kit</h3>
      <p className="mb-4 text-xs text-[#857b6e]">
        Gear picked for <span className="font-medium text-[#4a443d]">your</span> measured gaps — buy once, every future photo improves.
      </p>
      <AffiliateItemList items={items.slice(0, 4)} />
    </Card>
  );
}
