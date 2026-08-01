/**
 * Date & Dining Playbook — the "where do I actually take them, and what do I
 * order" layer. Dating tools stop at the profile; the real anxiety is planning
 * the date. This gives budget-spanning, first-date-smart venue ideas (India
 * GenZ), what to order, when to go, and a one-tap "find near me" map search —
 * plus what to wear pulled from the user's own colours. Pure/deterministic,
 * no key, no live places API (the map link does the finding).
 */

export interface DateSpot {
  emoji: string;
  type: string;
  idea: string;
  order: string;
  timing: string;
  cost: string;
  query: string; // used for the map search
}

export interface DatePlaybook {
  spots: DateSpot[];
  wear: string;
  firstMove: string;
  note: string;
}

export interface DatePlaybookInput {
  budget?: number;      // shopping budget as a rough spend-comfort proxy
  powerColors?: string[];
  city?: string;
}

// First-date-friendly first (low-pressure, easy exit), then higher-effort spots.
const CATALOG: DateSpot[] = [
  { emoji: "☕", type: "Specialty coffee", idea: "A quiet third-wave café — low pressure, easy to talk, easy to leave if it isn't clicking. The gold-standard first date.", order: "A pour-over or flat white, one slice to share.", timing: "Late afternoon, 4–6pm", cost: "₹300–600 for two", query: "specialty coffee cafe" },
  { emoji: "🍦", type: "Dessert-first walk", idea: "Skip the meal, go straight to gelato or ice-cream and a walk. Playful, short, and the walking kills awkward silences.", order: "Two scoops each, eat while you walk.", timing: "Evening, 6–8pm", cost: "₹200–400", query: "gelato ice cream dessert" },
  { emoji: "🍜", type: "Street-food crawl", idea: "A food-street walk — pani puri to momos. Shared, cheap, high-energy; you learn a lot about someone by how they eat street food.", order: "Split 3–4 small things and keep moving.", timing: "Evening", cost: "₹150–400", query: "street food" },
  { emoji: "🎲", type: "Board-game / arcade café", idea: "Built-in activity means zero dead air — perfect if small talk stresses you out.", order: "Coffee plus one game or a round of arcade.", timing: "Afternoon or evening", cost: "₹500–900 for two", query: "board game cafe" },
  { emoji: "🎷", type: "Live-music café", idea: "An acoustic or indie night gives you something to react to together — an easy shared moment.", order: "One drink each, share a starter.", timing: "Evening", cost: "₹800–1500", query: "live music cafe" },
  { emoji: "🌆", type: "Rooftop spot", idea: "Save this for a second or third date — the view does the heavy lifting once you're past the nerves.", order: "Share a starter, one drink each; don't over-order.", timing: "Sunset", cost: "₹1200–2500 for two", query: "rooftop restaurant cafe" },
];

export function buildDatePlaybook(input: DatePlaybookInput): DatePlaybook {
  const budget = input.budget ?? 5000;
  // Everyone gets the low-pressure staples; higher spend-comfort unlocks the
  // rooftop/live options nearer the top.
  let spots = [...CATALOG];
  if (budget >= 10000) spots = [CATALOG[0], CATALOG[5], CATALOG[4], CATALOG[3], CATALOG[1]];
  else if (budget <= 2000) spots = [CATALOG[0], CATALOG[1], CATALOG[2], CATALOG[3], CATALOG[4]];
  else spots = [CATALOG[0], CATALOG[1], CATALOG[3], CATALOG[2], CATALOG[4]];
  spots = spots.slice(0, 5);

  const color = input.powerColors && input.powerColors[0] ? input.powerColors[0].toLowerCase() : "";
  const wear = color
    ? `A well-fitted ${color} top (one of your power colours), dark denim and clean shoes — the exact first-date fit from your Occasion Kit. Something you've worn before, so you're not fidgeting.`
    : "A well-fitted top in one of your palette colours, dark denim, clean shoes — and wear something you already know fits, so you're relaxed, not fidgeting.";

  return {
    spots,
    wear,
    firstMove: "Suggest ONE specific place and time — “coffee at [spot], Saturday 5?” A concrete plan converts far better than “we should hang out sometime.”",
    note: "Keep a first date short and low-stakes — a two-hour coffee beats a four-hour dinner you can't gracefully leave.",
  };
}

/** A universally-working "find near me" map search for a spot. */
export function mapSearchLink(query: string, city?: string): string {
  const q = `${query}${city ? ` near ${city}` : " near me"}`;
  return `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
}
