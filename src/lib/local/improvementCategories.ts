/**
 * Improvement → provider mapping for the "Get It Done Near You" concierge.
 * Every thing the report tells someone to fix has a real-world place that does
 * it for them; this turns advice into a booking. Categories are ordered so the
 * user's WEAKEST area (biggest opportunity) surfaces first, and the search
 * `query` feeds the nearby-places lookup. Pure/deterministic.
 */

export interface ProviderCategory {
  id: string;
  label: string;
  emoji: string;
  query: string;   // fed to /api/places/nearby (textSearch)
  need: string;    // one line: why this is on their list
  weakness: number; // 0–100, lower = more urgent (drives ordering)
}

export interface ConciergeInput {
  hair?: number;      // 0–100 (higher = better)
  skin?: number;
  beard?: number;
  gender?: "men" | "women" | "unisex";
  goal?: string;
  hasGlasses?: boolean;
}

export function conciergeCategories(x: ConciergeInput): ProviderCategory[] {
  const g = x.gender === "women" ? "women" : x.gender === "men" ? "men" : "unisex";
  const salonQuery = g === "women" ? "womens salon" : g === "men" ? "mens salon barber" : "unisex hair salon";
  const social = x.goal !== "office" && x.goal !== "linkedin";

  const cats: ProviderCategory[] = [
    { id: "salon", label: "Haircut & grooming", emoji: "💈", query: salonQuery, need: "A fresh, defined cut is the single fastest jump in how put-together you read.", weakness: x.hair ?? 55 },
    { id: "derm", label: "Skin & derma", emoji: "🧴", query: "dermatologist skin clinic", need: "Even, healthy skin reads as care — a derm sorts what products can't.", weakness: x.skin ?? 60 },
    { id: "tailor", label: "Tailor & alterations", emoji: "✂️", query: "tailor clothing alteration", need: "Fit beats brand. A ₹200 alteration makes an existing outfit look bespoke.", weakness: 45 },
    { id: "optician", label: "Eyewear", emoji: "👓", query: "optical store eyewear", need: "The right frames for your face shape sharpen your whole look.", weakness: x.hasGlasses ? 40 : 62 },
    { id: "photographer", label: "Photo studio", emoji: "📸", query: "photo studio portrait photographer", need: "One properly-shot portrait outperforms a hundred selfies for dating & LinkedIn.", weakness: 50 },
    { id: "gym", label: "Gym & fitness", emoji: "🏋️", query: "gym fitness centre", need: "A stronger frame changes how every outfit sits — the slow, compounding win.", weakness: 58 },
    { id: "fragrance", label: "Fragrance", emoji: "🌿", query: "perfume fragrance store", need: "A signature scent is the detail people remember without knowing why.", weakness: 60 },
  ];

  if (g !== "women") {
    // beard grooming matters when facial hair is a factor
    cats.find((c) => c.id === "salon")!.weakness = Math.min(cats.find((c) => c.id === "salon")!.weakness, x.beard ?? 60);
  }
  if (social) {
    cats.push({ id: "cafe", label: "Date-worthy cafés", emoji: "☕", query: "specialty coffee cafe", need: "The go-to low-pressure first-date spots near you.", weakness: 52 });
  }

  // Weakest (lowest score) first — biggest opportunity leads.
  return cats.sort((a, b) => a.weakness - b.weakness);
}
