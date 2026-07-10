// ─── Product Links & Improvement Scoring Engine ───
// Generates buy links (Amazon/Myntra/Ajio/Nykaa), YouTube tutorials,
// improvement score calculations, and premium product bundles.

import type { ImageSignalMetrics, FullAuraReportContent, Observation } from "@/types/audit";

// ═══════════════════════════════════════════════════
// 1. BUY LINKS — Indian shopping sites
// ═══════════════════════════════════════════════════

export interface BuyLink {
  store: string;
  label: string;
  url: string;
  icon: string;
}

const STORES = {
  amazon: { name: "Amazon", icon: "🛒", base: "https://www.amazon.in/s?k=" },
  myntra: { name: "Myntra", icon: "👗", base: "https://www.myntra.com/gateway/v2/search/query?q=" },
  ajio: { name: "Ajio", icon: "👔", base: "https://www.ajio.com/search/?text=" },
  nykaa: { name: "Nykaa", icon: "💄", base: "https://www.nykaa.com/search/result/?q=" },
  flipkart: { name: "Flipkart", icon: "🛍️", base: "https://www.flipkart.com/search?q=" },
} as const;

function makeLink(store: keyof typeof STORES, query: string): BuyLink {
  const s = STORES[store];
  return { store: s.name, label: `Buy on ${s.name}`, url: `${s.base}${encodeURIComponent(query)}`, icon: s.icon };
}

/** Hair product links based on observation */
export function getHairLinks(obs: Observation): BuyLink[] {
  const q = obs.suggestion.toLowerCase();
  if (q.includes("smoothing") || q.includes("straighten"))
    return [makeLink("amazon", "hair smoothing serum men"), makeLink("myntra", "hair styling products")];
  if (q.includes("leave-in") || q.includes("conditioner"))
    return [makeLink("amazon", "leave-in conditioner men"), makeLink("nykaa", "hair conditioner")];
  if (q.includes("trim") || q.includes("haircut"))
    return [makeLink("amazon", "hair trimmer for men")];
  return [makeLink("amazon", "hair styling product men"), makeLink("myntra", "hair care products")];
}

/** Clothing / outfit links */
export function getClothingLinks(obs: Observation): BuyLink[] {
  const q = obs.suggestion.toLowerCase();
  if (q.includes("blazer") || q.includes("jacket") || q.includes("overshirt"))
    return [makeLink("myntra", "men blazer"), makeLink("ajio", "men casual jacket"), makeLink("amazon", "men overshirt")];
  if (q.includes("shirt") || q.includes("solid") || q.includes("top"))
    return [makeLink("myntra", "men solid color shirt"), makeLink("ajio", "men plain tshirt")];
  if (q.includes("watch") || q.includes("accessory") || q.includes("bracelet"))
    return [makeLink("myntra", "men watch"), makeLink("amazon", "men bracelet accessory")];
  return [makeLink("myntra", "men outfit"), makeLink("ajio", "men clothing")];
}

/** Skincare product links */
export function getSkinLinks(obs: Observation): BuyLink[] {
  const q = obs.suggestion.toLowerCase();
  if (q.includes("concealer") || q.includes("dark circle"))
    return [makeLink("nykaa", "concealer for dark circles"), makeLink("amazon", "eye cream men")];
  if (q.includes("moisturizer") || q.includes("moistur"))
    return [makeLink("nykaa", "moisturizer for men"), makeLink("amazon", "face moisturizer men")];
  if (q.includes("spf") || q.includes("sunscreen"))
    return [makeLink("nykaa", "sunscreen for men"), makeLink("amazon", "spf sunscreen face")];
  if (q.includes("cleanser") || q.includes("face wash"))
    return [makeLink("nykaa", "face wash for men"), makeLink("amazon", "facial cleanser men")];
  return [makeLink("nykaa", "skincare products men"), makeLink("amazon", "skin care kit men")];
}

/** Grooming product links */
export function getGroomingLinks(obs: Observation): BuyLink[] {
  const q = obs.suggestion.toLowerCase();
  if (q.includes("eyebrow") || q.includes("brow"))
    return [makeLink("amazon", "eyebrow trimmer men"), makeLink("nykaa", "eyebrow grooming kit")];
  if (q.includes("nail"))
    return [makeLink("amazon", "nail cutter kit men"), makeLink("nykaa", "nail care")];
  if (q.includes("lip") || q.includes("balm"))
    return [makeLink("nykaa", "lip balm men"), makeLink("amazon", "lip care")];
  if (q.includes("perfume") || q.includes("fragrance"))
    return [makeLink("amazon", "perfume for men"), makeLink("myntra", "men deodorant")];
  return [makeLink("amazon", "grooming kit men"), makeLink("nykaa", "grooming essentials")];
}

/** Accessories links */
export function getAccessoryLinks(obs: Observation): BuyLink[] {
  const q = obs.suggestion.toLowerCase();
  if (q.includes("watch"))
    return [makeLink("myntra", "men watch"), makeLink("amazon", "men wristwatch")];
  if (q.includes("earring") || q.includes("jewelry"))
    return [makeLink("myntra", "men earrings"), makeLink("amazon", "men jewelry")];
  if (q.includes("glasses") || q.includes("frame"))
    return [makeLink("amazon", "men eyeglasses frames")];
  return [makeLink("myntra", "men accessories"), makeLink("amazon", "men accessories")];
}

/** Get buy links for any observation category */
export function getBuyLinksForObservation(obs: Observation): BuyLink[] {
  switch (obs.category) {
    case "hair": return getHairLinks(obs);
    case "clothing": return getClothingLinks(obs);
    case "skin": return getSkinLinks(obs);
    case "grooming": return getGroomingLinks(obs);
    case "accessories": return getAccessoryLinks(obs);
    case "background": return [makeLink("amazon", "room decor minimalist"), makeLink("myntra", "room accessories")];
    default: return [];
  }
}

// ═══════════════════════════════════════════════════
// 2. YOUTUBE TUTORIAL LINKS
// ═══════════════════════════════════════════════════

export interface TutorialLink {
  title: string;
  url: string;
  platform: string;
}

const YT_BASE = "https://www.youtube.com/results?search_query=";

export function getTutorialLinks(obs: Observation): TutorialLink[] {
  const q = obs.suggestion.toLowerCase();
  const links: TutorialLink[] = [];

  if (obs.category === "hair") {
    links.push({ title: "Hair styling tutorial", url: `${YT_BASE}${encodeURIComponent("hair styling tutorial men " + (q.includes("curly") ? "curly" : q.includes("wavy") ? "wavy" : "straight"))}`, platform: "YouTube" });
    links.push({ title: "Hair grooming tips", url: `${YT_BASE}${encodeURIComponent("men hair grooming tips before photo")}`, platform: "YouTube" });
  } else if (obs.category === "clothing") {
    links.push({ title: "Outfit coordination guide", url: `${YT_BASE}${encodeURIComponent("men outfit coordination tips profile photo")}`, platform: "YouTube" });
    links.push({ title: "Color matching guide", url: `${YT_BASE}${encodeURIComponent("color matching clothes for skin tone men")}`, platform: "YouTube" });
  } else if (obs.category === "skin") {
    links.push({ title: "Skincare routine", url: `${YT_BASE}${encodeURIComponent("simple skincare routine men beginner")}`, platform: "YouTube" });
    links.push({ title: "Dark circles removal", url: `${YT_BASE}${encodeURIComponent("how to remove dark circles men naturally")}`, platform: "YouTube" });
  } else if (obs.category === "grooming") {
    links.push({ title: "Grooming essentials", url: `${YT_BASE}${encodeURIComponent("men grooming essentials guide")}`, platform: "YouTube" });
    links.push({ title: "Eyebrow grooming", url: `${YT_BASE}${encodeURIComponent("men eyebrow grooming at home")}`, platform: "YouTube" });
  } else if (obs.category === "posing") {
    links.push({ title: "Photo posing tips", url: `${YT_BASE}${encodeURIComponent("best photo poses for men profile picture")}`, platform: "YouTube" });
    links.push({ title: "Camera angle guide", url: `${YT_BASE}${encodeURIComponent("best camera angle for selfies men")}`, platform: "YouTube" });
  } else if (obs.category === "background") {
    links.push({ title: "Photo background setup", url: `${YT_BASE}${encodeURIComponent("best photo background setup at home")}`, platform: "YouTube" });
  }

  return links;
}

// ═══════════════════════════════════════════════════
// 3. IMPROVEMENT SCORE — current → potential
// ═══════════════════════════════════════════════════

export interface ImprovementScore {
  currentScore: number;
  potentialScore: number;
  delta: number;
  tier: "excellent" | "strong" | "moderate" | "needs-work";
  message: string;
  topImpactItems: { label: string; impact: number; fixable: boolean }[];
}

export function calculateImprovementScore(
  metrics: ImageSignalMetrics,
  currentScore: number,
  leaks: FullAuraReportContent["biggestStatusLeaks"]
): ImprovementScore {
  // Calculate potential score by simulating fixes for each leak
  const improvements: { label: string; impact: number; fixable: boolean }[] = [];

  // Each leak has an impactScore — if fixed, the overall score improves
  for (const leak of leaks) {
    const impactPct = leak.impactScore * 0.6; // Scale impact to overall score
    const fixable = leak.estimatedCost === "free" || leak.estimatedCost === "low";
    improvements.push({ label: leak.title, impact: Math.round(impactPct), fixable });
  }

  // Sort by impact
  improvements.sort((a, b) => b.impact - a.impact);

  // Total potential improvement (cap at 25 points max boost)
  const totalBoost = Math.min(25, improvements.reduce((sum, i) => sum + i.impact, 0));
  const potentialScore = Math.min(95, Math.round(currentScore + totalBoost));
  const delta = potentialScore - currentScore;

  let tier: ImprovementScore["tier"];
  if (currentScore >= 80) tier = "excellent";
  else if (currentScore >= 65) tier = "strong";
  else if (currentScore >= 45) tier = "moderate";
  else tier = "needs-work";

  const freeFixCount = improvements.filter((i) => i.fixable).length;
  const message = delta <= 5
    ? `Your score is already strong. The remaining improvements are subtle refinements.`
    : `With ${freeFixCount} free fixes, you could boost your aura from ${currentScore} to ${potentialScore} — a +${delta} point jump.`;

  return {
    currentScore,
    potentialScore,
    delta,
    tier,
    message,
    topImpactItems: improvements.slice(0, 5),
  };
}

// ═══════════════════════════════════════════════════
// 4. PREMIUM PRODUCT BUNDLES
// ═══════════════════════════════════════════════════

export interface ProductBundle {
  name: string;
  emoji: string;
  description: string;
  items: { name: string; price: string; url: string }[];
  totalEstimate: string;
  category: string;
}

export function getPremiumBundles(
  observations: Observation[],
  metrics: ImageSignalMetrics
): ProductBundle[] {
  const bundles: ProductBundle[] = [];

  // Grooming kit bundle
  const groomingObs = observations.filter((o) => o.category === "grooming" || o.category === "skin");
  if (groomingObs.length > 0) {
    bundles.push({
      name: "Essential Grooming Kit",
      emoji: "🧴",
      description: "Everything you need for a polished look — from skincare basics to grooming essentials.",
      items: [
        { name: "Face Wash + Moisturizer", price: "₹499", url: "https://www.nykaa.com/search/result/?q=grooming+kit+men" },
        { name: "Hair Styling Product", price: "₹349", url: "https://www.amazon.in/s?k=hair+styling+cream+men" },
        { name: "Sunscreen SPF50", price: "₹399", url: "https://www.nykaa.com/search/result/?q=sunscreen+men" },
        { name: "Lip Balm", price: "₹149", url: "https://www.amazon.in/s?k=lip+balm+men" },
      ],
      totalEstimate: "₹1,396",
      category: "grooming",
    });
  }

  // Outfit upgrade bundle
  const clothingObs = observations.filter((o) => o.category === "clothing");
  if (clothingObs.length > 0 || metrics.clothingRegion.contrastWithSkin < 20) {
    bundles.push({
      name: "Profile Photo Outfit",
      emoji: "👔",
      description: "Photographer-approved outfit picks that work for profile photos and everyday wear.",
      items: [
        { name: "Solid Color Shirt", price: "₹799", url: "https://www.myntra.com/gateway/v2/search/query?q=solid+shirt+men" },
        { name: "Minimal Watch", price: "₹1,299", url: "https://www.myntra.com/gateway/v2/search/query?q=minimal+watch+men" },
        { name: "Casual Blazer", price: "₹1,999", url: "https://www.ajio.com/search/?text=men+casual+blazer" },
      ],
      totalEstimate: "₹4,097",
      category: "clothing",
    });
  }

  // Photo setup bundle
  const bgObs = observations.filter((o) => o.category === "background" || o.category === "posing");
  if (metrics.backgroundComplexityEstimate > 50 || metrics.lightingScore < 60) {
    bundles.push({
      name: "Home Photo Studio Kit",
      emoji: "📸",
      description: "Upgrade your photo setup at home — better lighting, cleaner backgrounds, steadier shots.",
      items: [
        { name: "Ring Light + Stand", price: "₹899", url: "https://www.amazon.in/s?k=ring+light+with+stand" },
        { name: "Phone Tripod", price: "₹499", url: "https://www.amazon.in/s?k=phone+tripod+stand" },
        { name: "Plain Backdrop", price: "₹399", url: "https://www.amazon.in/s?k=photo+backdrop+plain" },
      ],
      totalEstimate: "₹1,797",
      category: "photo",
    });
  }

  // Hair care bundle
  const hairObs = observations.filter((o) => o.category === "hair");
  if (hairObs.length > 0 || metrics.hairRegion.neatnessScore < 50) {
    bundles.push({
      name: "Hair Care Essentials",
      emoji: "💈",
      description: "Products to tame frizz, add definition, and keep your hair looking sharp.",
      items: [
        { name: "Hair Serum / Oil", price: "₹349", url: "https://www.nykaa.com/search/result/?q=hair+serum+men" },
        { name: "Styling Wax / Gel", price: "₹299", url: "https://www.amazon.in/s?k=hair+wax+men" },
        { name: "Leave-in Conditioner", price: "₹449", url: "https://www.amazon.in/s?k=leave+in+conditioner+men" },
      ],
      totalEstimate: "₹1,097",
      category: "hair",
    });
  }

  return bundles;
}

// ═══════════════════════════════════════════════════
// 5. BEFORE/AFTER DESCRIPTION
// ═══════════════════════════════════════════════════

export interface BeforeAfter {
  currentLabel: string;
  potentialLabel: string;
  currentTraits: string[];
  potentialTraits: string[];
}

export function getBeforeAfter(
  metrics: ImageSignalMetrics,
  currentScore: number,
  potentialScore: number
): BeforeAfter {
  const currentTraits: string[] = [];
  const potentialTraits: string[] = [];

  // Current state
  if (metrics.lightingScore < 55) currentTraits.push("Poor lighting");
  else currentTraits.push("Decent lighting");
  if (metrics.sharpness < 55) currentTraits.push("Blurry image");
  else currentTraits.push("Clear image");
  if (metrics.backgroundComplexityEstimate > 55) currentTraits.push("Busy background");
  else currentTraits.push("Clean background");
  if (metrics.clothingRegion.contrastWithSkin < 15) currentTraits.push("Low outfit contrast");
  else currentTraits.push("Good outfit contrast");
  if (metrics.hairRegion.neatnessScore < 45) currentTraits.push("Untidy hair");
  else currentTraits.push("Neat hair");
  if (metrics.skinRegion.evenness < 45) currentTraits.push("Uneven skin tone");
  else currentTraits.push("Even skin tone");

  // Potential state (after fixes)
  potentialTraits.push("Optimal window lighting");
  potentialTraits.push("Sharp, high-res image");
  potentialTraits.push("Clean, focused background");
  potentialTraits.push("Contrasting outfit choices");
  potentialTraits.push("Styled, defined hair");
  potentialTraits.push("Even, glowing skin tone");

  return {
    currentLabel: `Current: ${currentScore}/100`,
    potentialLabel: `Potential: ${potentialScore}/100`,
    currentTraits,
    potentialTraits,
  };
}
