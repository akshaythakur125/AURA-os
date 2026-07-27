/**
 * Instagram edit recipe — the best-fit filter + an ordered manual-slider plan,
 * chosen from THIS photo's measured colour/light so it corrects a real gap.
 *
 * Filters map to their well-documented behaviour (Clarendon brightens + adds
 * contrast/saturation; Juno warms skin & boosts reds/yellows; Lark brightens +
 * desaturates; Gingham cools/mutes; Ludwig subtle contrast; Aden pastel/muted).
 * We pick the one that offsets the measured deficiency, at a sensible strength
 * (100% is almost always too much), then fine-tune with Instagram's own sliders.
 */

export interface EditStep {
  tool: string;
  amount: string;
  why: string;
}

export interface EditRecipe {
  filter: { name: string; strength: number; why: string };
  altFilter: { name: string; why: string } | null;
  steps: EditStep[];
  summary: string;
  caution: string | null;
}

interface Metrics {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  imageDullness: number;
  colorHarmony: number;
  dominantHue: string;
  faceBrightness: number;
  backgroundBrightness: number;
}

export function generateEditRecipe(m: Metrics): EditRecipe {
  const dull = m.imageDullness > 50 || (m.saturation < 32 && m.contrast < 35);
  const cool = m.dominantHue === "cool";
  const warm = m.dominantHue === "warm";
  const greenish = m.dominantHue === "greenish";
  const oversat = m.saturation > 65;
  const faceDark = m.faceBrightness > 0 && m.faceBrightness < 45;
  const lowContrast = m.contrast < 30;
  const soft = m.sharpness < 58;
  const bgHot = m.backgroundBrightness > m.faceBrightness + 15;
  const balanced = !dull && !cool && !warm && !greenish && !oversat && !faceDark && !lowContrast && m.faceBrightness >= 50;

  // ── Best-fit filter ──
  let filter: EditRecipe["filter"];
  let altFilter: EditRecipe["altFilter"] = null;

  if (greenish) {
    filter = { name: "Juno", strength: 60, why: `Your image has a green cast (fluorescent-light look) — Juno pushes reds/yellows and warmth, which is exactly what cancels green and makes skin read healthy.` };
    altFilter = { name: "Ludwig", why: "A cleaner, subtler option if Juno looks too punchy." };
  } else if (cool) {
    filter = { name: "Juno", strength: 65, why: `Your photo skews cool/blue (reads cold and a bit unwelcoming) — Juno warms skin tones so you look approachable.` };
    altFilter = { name: "Valencia", why: "A warmer, softly vintage alternative for a cosier feel." };
  } else if (oversat) {
    filter = { name: "Lark", strength: 55, why: `Colours are pushed too far (saturation ${m.saturation}/100) — Lark brightens and pulls saturation back, especially reds, for a cleaner, less-filtered look.` };
    altFilter = { name: "Aden", why: "A soft, pastel/muted option if you want it even calmer." };
  } else if (warm) {
    filter = { name: "Gingham", strength: 50, why: `Your image is quite warm/orange — Gingham cools and gently mutes it so skin doesn't look overcooked.` };
    altFilter = { name: "Lark", why: "Use this instead if you also want it brighter." };
  } else if (dull) {
    filter = { name: "Clarendon", strength: 70, why: `Your image reads flat (dullness ${m.imageDullness}/100) — Clarendon brightens, adds contrast and intensifies colour, the single most flattering fix for a lifeless photo. Keep it under ~80% so it doesn't look over-filtered.` };
    altFilter = { name: "Juno", why: "Go here instead if you want more warmth than pop." };
  } else if (faceDark) {
    filter = { name: "Lark", strength: 60, why: `Your face is underexposed (${m.faceBrightness}/100 brightness) — Lark lifts brightness and shadows without blowing out colour.` };
    altFilter = { name: "Clarendon", why: "Adds more contrast/pop along with the lift." };
  } else if (lowContrast) {
    filter = { name: "Ludwig", strength: 55, why: `Your image is low-contrast and a touch soft — Ludwig adds gentle contrast and a light highlight lift for depth.` };
    altFilter = { name: "Clarendon", why: "A stronger contrast option." };
  } else {
    filter = { name: "Normal (skip the filter)", strength: 0, why: `Your colour and light are already natural and balanced — a heavy filter would only hurt. Keep it clean; use the small manual tweaks below instead of a preset.` };
    altFilter = { name: "Lark at ~25%", why: "If you want a whisper of brightness, a very light Lark is safe." };
  }

  // ── Ordered manual slider recipe (only what the numbers call for) ──
  const steps: EditStep[] = [];
  if (faceDark) steps.push({ tool: "Brightness", amount: "+10 to +15", why: `lifts your underexposed face (${m.faceBrightness}/100) so your features read clearly` });
  else if (m.brightness > 74) steps.push({ tool: "Brightness", amount: "−8 to −12", why: `the shot is slightly blown out (${m.brightness}/100) — pulling it back recovers detail` });
  if (lowContrast || m.contrast < 40) steps.push({ tool: "Contrast", amount: "+10 to +15", why: `adds depth to a flat image (contrast ${m.contrast}/100) so it doesn't look washed out` });
  if (faceDark) steps.push({ tool: "Shadows", amount: "+8 to +12", why: "opens up the shadow side of your face without touching the highlights" });
  if (dull && !oversat) steps.push({ tool: "Saturation", amount: "+8 to +12", why: `revives flat colour (dullness ${m.imageDullness}/100) — small amounts only, skin goes orange fast` });
  else if (oversat) steps.push({ tool: "Saturation", amount: "−15 to −25", why: `dials back over-pushed colour (${m.saturation}/100) so skin looks natural, not neon` });
  if (cool || greenish) steps.push({ tool: "Warmth", amount: "+8 to +12", why: "counteracts the cool/green cast and makes skin tones look healthy" });
  else if (warm) steps.push({ tool: "Warmth", amount: "−8 to −10", why: "cools an over-orange image back to a natural skin tone" });
  if (bgHot) steps.push({ tool: "Highlights", amount: "−10 to −15", why: `tames a background that's brighter than your face (bg ${m.backgroundBrightness} vs face ${m.faceBrightness}) so the eye stays on you` });
  if (m.sharpness >= 40 && soft) steps.push({ tool: "Structure / Sharpen", amount: "+8 to +12", why: `adds crispness to a slightly soft image (sharpness ${m.sharpness}/100)` });

  if (steps.length === 0) steps.push({ tool: "Sharpen", amount: "+5", why: "a whisper of crispness is all this already-clean photo needs" });

  // ── Summary + caution ──
  const summary = filter.strength === 0
    ? "Your photo is already well-balanced — skip presets and make only the tiny manual tweaks below."
    : `Start with ${filter.name} at about ${filter.strength}%, then fine-tune with the manual sliders below. One filter as a base + a few small slider moves is exactly how pros edit — never a filter at full strength.`;

  const caution = m.sharpness < 40
    ? "Note: your image is genuinely blurry — no filter or Structure slider can fix real blur. This is a reshoot, not an edit."
    : "Golden rule: if an edit is obviously noticeable, it's too strong. Natural beats filtered for trust — especially on dating and LinkedIn.";

  return { filter, altFilter, steps, summary, caution };
}
