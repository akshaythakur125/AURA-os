/**
 * Style presets for the AI Glow-Up Photoshoot.
 *
 * Each preset builds the text prompt that drives an identity-preserving image
 * model (InstantID / PhotoMaker / IP-Adapter-FaceID style). The buyer's face
 * comes from their uploaded reference photo — the provider conditions on it — so
 * these prompts only describe wardrobe, lighting, setting, mood and framing.
 *
 * When we know the buyer's matched-celebrity aesthetic (from the celebrity
 * match), we weave that vibe in so the shoot feels like *their* aspirational
 * look rather than a generic template.
 */

export interface PhotoshootStyle {
  id: string;
  label: string;
  /** One-line description shown on the style card in the UI. */
  blurb: string;
  /** Where the resulting set is meant to be used — helps the buyer choose. */
  bestFor: string;
  /** Builds the generation prompt, optionally weaving in a celebrity aesthetic. */
  buildPrompt: (aesthetic?: string) => string;
}

// Shared clauses. The identity clause keeps the person recognisably themselves;
// the quality clause pushes toward a clean, professional render.
const IDENTITY =
  "A photorealistic portrait of the exact same person as in the reference photo, " +
  "preserving their real facial features, skin tone, ethnicity and identity. " +
  "Natural, flattering, believable — not a caricature.";

const QUALITY =
  "Sharp focus on the eyes, realistic skin texture, professional colour grading, " +
  "high dynamic range, 85mm portrait lens look, shot on a full-frame camera.";

function aestheticClause(aesthetic?: string): string {
  const a = (aesthetic || "").trim();
  if (!a) return "";
  return ` Overall mood and styling inspired by the aesthetic of ${a}.`;
}

export const PHOTOSHOOT_STYLES: PhotoshootStyle[] = [
  {
    id: "linkedin",
    label: "Executive / LinkedIn",
    blurb: "Clean corporate headshots that read as competent and approachable.",
    bestFor: "LinkedIn, résumés, speaker bios, company pages",
    buildPrompt: (aesthetic) =>
      `${IDENTITY} Confident professional headshot, tailored blazer over a crisp shirt, ` +
      `soft neutral studio backdrop, gentle key light with a subtle rim light, warm approachable ` +
      `half-smile, shoulders squared to camera. ${QUALITY}${aestheticClause(aesthetic)}`,
  },
  {
    id: "dating",
    label: "Dating Profile",
    blurb: "Warm, magnetic, genuine — the lead photo that gets right-swipes.",
    bestFor: "Hinge, Bumble, Tinder lead & second slots",
    buildPrompt: (aesthetic) =>
      `${IDENTITY} Candid, warm lifestyle portrait in soft golden-hour light, relaxed smart-casual ` +
      `outfit, blurred inviting outdoor background (cafe terrace or city park), natural genuine smile ` +
      `with eye contact, easy confident posture. ${QUALITY}${aestheticClause(aesthetic)}`,
  },
  {
    id: "instagram",
    label: "Instagram Editorial",
    blurb: "Scroll-stopping editorial frames with a strong point of view.",
    bestFor: "Instagram grid, close friends, creator profiles",
    buildPrompt: (aesthetic) =>
      `${IDENTITY} Fashion-editorial portrait, stylish contemporary outfit, moody directional lighting ` +
      `with rich colour, textured urban or studio backdrop, self-assured expression, dynamic composition ` +
      `with intentional negative space. ${QUALITY}${aestheticClause(aesthetic)}`,
  },
  {
    id: "cinematic",
    label: "Cinematic Black & White",
    blurb: "Timeless, dramatic monochrome that feels like a movie still.",
    bestFor: "Profile hero shots, personal brand, prints",
    buildPrompt: (aesthetic) =>
      `${IDENTITY} Dramatic black-and-white cinematic portrait, single soft key light with deep shadow, ` +
      `plain dark background, thoughtful composed expression, timeless wardrobe, fine film-grain, ` +
      `high contrast monochrome. ${QUALITY}${aestheticClause(aesthetic)}`,
  },
];

export function getPhotoshootStyle(id: string): PhotoshootStyle | null {
  return PHOTOSHOOT_STYLES.find((s) => s.id === id) ?? null;
}

export const PHOTOSHOOT_STYLE_IDS = PHOTOSHOOT_STYLES.map((s) => s.id);
