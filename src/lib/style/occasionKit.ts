/**
 * Occasion Kits — "getting ready for X?" in one place.
 *
 * People google "what to wear to a first date", then separately google how to
 * groom for it, then ask friends which photo to use. Every one of those answers
 * can be personalised from traits the scan already produced (undertone → power
 * colours + metals, archetype, grooming focus). This turns that into an instant,
 * tailored prep kit per occasion — and because there's always a next event, it's
 * a reason to come back. Pure and deterministic; no API.
 */

export type Occasion = "first-date" | "interview" | "headshot" | "wedding" | "festival" | "night-out" | "college";
export type Gender = "men" | "women" | "unisex";

export interface OccasionTraits {
  powerColors?: string[];
  metals?: string[];
  undertone?: "warm" | "cool" | "neutral";
  archetype?: string;
  groomingFocus?: string;
  gender?: Gender;
}

export interface OccasionKit {
  occasion: Occasion;
  label: string;
  emoji: string;
  vibe: string;
  wear: string;
  colors: string[];
  groom: string[];
  presence: string;
  avoid: string;
}

export const OCCASIONS: { id: Occasion; label: string; emoji: string }[] = [
  { id: "first-date", label: "First date", emoji: "💘" },
  { id: "interview", label: "Job interview", emoji: "💼" },
  { id: "headshot", label: "Work headshot", emoji: "📸" },
  { id: "wedding", label: "Wedding / shaadi", emoji: "🎉" },
  { id: "festival", label: "Festival / Diwali", emoji: "✨" },
  { id: "night-out", label: "Party / night out", emoji: "🌃" },
  { id: "college", label: "College / farewell", emoji: "🎓" },
];

// Undertone-aware neutral bases — the safe, flattering foundation colours.
const NEUTRALS: Record<"warm" | "cool" | "neutral", { light: string; dark: string; base: string }> = {
  warm: { light: "cream", dark: "chocolate brown", base: "olive" },
  cool: { light: "crisp white", dark: "charcoal", base: "navy" },
  neutral: { light: "white", dark: "charcoal", base: "navy" },
};

function pick(colors: string[] | undefined, i: number, fallback: string): string {
  const c = colors && colors[i] ? colors[i] : "";
  return c ? c.toLowerCase() : fallback;
}

/** "a" / "an" for a following word (grammar polish on user-facing copy). */
function art(word: string): string {
  return /^[aeiou]/i.test(word.trim()) ? "an" : "a";
}
/** Sentence-initial article, capitalised. */
function Art(word: string): string {
  return art(word) === "an" ? "An" : "A";
}

export function buildOccasionKit(occasion: Occasion, t: OccasionTraits): OccasionKit {
  const meta = OCCASIONS.find((o) => o.id === occasion) || OCCASIONS[0];
  const gender = t.gender || "unisex";
  const undertone = t.undertone || "neutral";
  const n = NEUTRALS[undertone];
  const p1 = pick(t.powerColors, 0, n.base);
  const p2 = pick(t.powerColors, 1, n.base);
  const defaultMetal = undertone === "cool" ? "silver" : undertone === "warm" ? "gold" : "silver or gold";
  const metal = (t.metals && t.metals[0] ? t.metals[0] : defaultMetal).toLowerCase();
  const power = (t.powerColors || []).slice(0, 4);

  // Grooming: shared base + the person's own detected focus when we have it.
  const baseGroom = (extra: string[]): string[] => {
    const g = [...extra];
    if (t.groomingFocus) g.push(`Your scan's focus: ${t.groomingFocus}`);
    return g;
  };

  const forMenWomen = (men: string, women: string, unisex: string): string =>
    gender === "men" ? men : gender === "women" ? women : unisex;

  switch (occasion) {
    case "first-date":
      return {
        occasion, label: meta.label, emoji: meta.emoji,
        vibe: "Warm, put-together, approachable — not trying too hard.",
        wear: forMenWomen(
          `A well-fitted ${p1} shirt or tee over ${n.dark} denim/chinos and clean white sneakers. One ${metal}-tone watch — that's the whole accessory budget.`,
          `${Art(p1)} ${p1} top with ${n.dark} denim or a simple skirt, and minimal ${metal}-tone jewellery. Comfortable shoes you can actually walk in.`,
          `A well-fitted ${p1} top with a ${n.dark} base and clean shoes. One ${metal}-tone accent, nothing more.`,
        ),
        colors: power.length ? power.slice(0, 3) : [n.base, n.light],
        groom: baseGroom(["Haircut 2–3 days before, never same-day", "Shape facial hair / brows the night before", "Fragrance: 2 sprays, 20 min before you leave", "Nails clean and trimmed"]),
        presence: "Use your warmest smiling solo photo to set expectations. In person, relaxed posture and steady eye contact do more than any outfit.",
        avoid: "A head-to-toe brand-new outfit you've never worn — you'll fidget all night. Wear something you already know fits.",
      };
    case "interview":
      return {
        occasion, label: meta.label, emoji: meta.emoji,
        vibe: "Competent, sharp, low-risk. Let your answers stand out, not your outfit.",
        wear: `Tailored neutrals — a ${n.light} or light top with ${n.dark} trousers and closed shoes. Keep colour minimal; one subtle ${metal}-tone detail reads as polish.`,
        colors: [n.dark, n.light],
        groom: baseGroom(["Neat, conservative hair — nothing dramatic on the day", "Clean-shaven or sharply defined stubble", "Skip strong fragrance in closed rooms", "Iron everything the night before"]),
        presence: "For a video round, put window light in front of you and a plain wall behind — the exact fixes from your scan apply on camera too.",
        avoid: "Bold prints or big logos — they pull attention off your face and what you're saying.",
      };
    case "headshot":
      return {
        occasion, label: meta.label, emoji: meta.emoji,
        vibe: "Credible, warm, professional — the face people remember.",
        wear: `A solid ${n.base} or ${p1} top that contrasts your background. No busy patterns, nothing that competes with your face.`,
        colors: power.length ? [n.base, p1] : [n.base, n.light],
        groom: baseGroom(["Well-rested — shoot in the morning if you can", "Neat hair, defined brows", "Matte any shine before shooting"]),
        presence: "Chest-up, eyes to camera, soft window light, a genuine slight smile — this is exactly your Ready-to-Post crop at 1:1. Shoot fresh; don't crop an old group photo.",
        avoid: "Selfies or a cut-out from a group shot — they read as low-effort on a professional profile.",
      };
    case "wedding":
      return {
        occasion, label: meta.label, emoji: meta.emoji,
        vibe: "Rich, festive, celebratory — dressed up without disappearing into the crowd.",
        wear: forMenWomen(
          `Lean into rich tones — ${art(p1)} ${p1} kurta/bandhgala or deep-toned outfit with ${metal}-tone accents. Fit matters more than flash.`,
          `${Art(p1)} ${p1} outfit in a rich fabric, with ${metal}-tone jewellery that matches your undertone.`,
          `A rich ${p1} outfit with tasteful ${metal}-tone accents — your palette, dialled up.`,
        ),
        colors: power.length ? power : [n.base],
        groom: baseGroom(["Book grooming/haircut 2 days ahead", "Hydrate your skin the night before — it photographs better", "Pick a fragrance that lasts: woody/oriental holds through a long night"]),
        presence: "You'll be in a lot of photos — the posture and 3/4-angle tips from your scan pay off all day, not just once.",
        avoid: "Colours that fight your undertone under warm hall lighting — stay inside your palette and you'll photograph well in every shot.",
      };
    case "festival":
      return {
        occasion, label: meta.label, emoji: meta.emoji,
        vibe: "Bright, warm, expressive — festive energy that still looks like you.",
        wear: `Go brighter than your everyday within your palette — ${p1} with a touch of ${p2}, and ${metal}-tone accents.`,
        colors: power.length ? power : [n.base, n.light],
        groom: baseGroom(["Light, fresh grooming — it's a long day", "Sunscreen if there's any daytime"]),
        presence: "Festival light is warm and dim — the brightness fix in your Ready-to-Post Pack rescues almost every indoor photo.",
        avoid: "Over-accessorising — one statement piece beats five competing ones.",
      };
    case "night-out":
      return {
        occasion, label: meta.label, emoji: meta.emoji,
        vibe: "Sharp, confident, high-contrast — you want to read well in low light.",
        wear: `A ${n.dark} base with one sharp ${p1} accent. Fitted, never baggy — silhouette does the work when the lighting won't.`,
        colors: [n.dark, p1],
        groom: baseGroom(["Reapply fragrance right before leaving", "Matte your T-zone so flash doesn't catch shine"]),
        presence: "Club lighting is unforgiving — shoot photos early in the night while you (and your grooming) still look fresh.",
        avoid: "Too many patterns competing at once — in dim light it just reads as busy.",
      };
    case "college":
    default:
      return {
        occasion, label: meta.label, emoji: meta.emoji,
        vibe: "Put-together but easy — effort that doesn't look like effort.",
        wear: `${Art(p1)} ${p1} tee or shirt, well-fitted ${n.dark} denim, and clean sneakers. Effortless, not sloppy — fit is the whole trick.`,
        colors: power.length ? power.slice(0, 3) : [n.base, n.light],
        groom: baseGroom(["Fresh, low-maintenance hair", "Clean, simple grooming"]),
        presence: "Keep it natural — for farewell photos, your genuine-smile shot beats any posed one.",
        avoid: "Trying to look older or over-formal — clean and well-fitted always wins on campus.",
      };
  }
}
