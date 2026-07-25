// Roast / Hype tone lines for the verdict. These are OPINION/tone layered on a
// REAL score — never fabricated data. Kept playful, never cruel or personal.

export type Tone = "straight" | "roast" | "hype";
export type Band = "post" | "almost" | "notyet";

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

const ROAST: Record<Band, string[]> = {
  post: [
    "Okay it's actually fine, calm down. Post it before you overthink it.",
    "This one ate. Stop searching the camera roll — you already won.",
    "No notes, genuinely. Post it and let them cope.",
  ],
  almost: [
    "It's giving 'almost'. One fix and it's a serve — right now it's a draft.",
    "So close it hurts. Sort the one thing below before anyone screenshots this.",
    "Mid-with-potential. Fix the flagged bit and it flips instantly.",
  ],
  notyet: [
    "Bestie… not like this. The thing below is doing you dirty.",
    "Respectfully? Retake. The one issue below is louder than your outfit.",
    "The camera did not eat here. Fix the flagged bit and run it back.",
  ],
};

const HYPE: Record<Band, string[]> = {
  post: [
    "You ATE and left no crumbs. Post it — they're not ready. ✨",
    "Main-character energy, locked in. This one's a POST.",
    "Certified serve. Hit post and watch the notifications roll.",
  ],
  almost: [
    "You're THIS close to a serve — one tweak and it's unstoppable.",
    "Big potential energy. Fix the one thing and you're glowing.",
    "Almost elite. Nail the flagged bit and it's a certified post.",
  ],
  notyet: [
    "Rough draft of a great post — the glow-up is one fix away.",
    "The vision's there. Sort the one thing below and you'll pop off.",
    "Not there yet, but you've got the base — fix it and shine.",
  ],
};

export function toneLine(tone: Tone, band: Band, straight: string, seed: number): string {
  if (tone === "roast") return pick(ROAST[band], seed);
  if (tone === "hype") return pick(HYPE[band], seed);
  return straight;
}

export const TONE_META: Record<Tone, { label: string; emoji: string }> = {
  straight: { label: "Straight", emoji: "🎯" },
  roast: { label: "Roast", emoji: "🔥" },
  hype: { label: "Hype", emoji: "💅" },
};
