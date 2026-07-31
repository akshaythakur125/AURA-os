// Turns the measured edit recipe into a real, importable Lightroom preset
// (.xmp). Every value is derived from THIS photo's numbers — it's not a generic
// filter, it's the exact set of corrections the analysis called for, packaged
// as a one-tap preset for the free Lightroom mobile app. A tangible, ownable
// deliverable that makes the ₹21 land harder and gets shared.

import type { EditRecipe } from "@/lib/aura-engine/editRecipe";

/** Average midpoint of an amount string like "+10 to +15" or "−15 to −25". */
function midAmount(amount: string): number {
  const nums = amount.replace(/−/g, "-").match(/-?\d+(?:\.\d+)?/g);
  if (!nums || nums.length === 0) return 0;
  const vals = nums.map(Number);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(v)));

function stepFor(recipe: EditRecipe, toolMatch: RegExp): number {
  const s = recipe.steps.find((x) => toolMatch.test(x.tool));
  return s ? midAmount(s.amount) : 0;
}

export interface PresetValues {
  name: string;
  exposure: number;      // EV, ±
  contrast: number;      // -100..100
  highlights: number;    // -100..100
  shadows: number;       // -100..100
  saturation: number;    // -100..100
  vibrance: number;      // -100..100
  clarity: number;       // -100..100
  temperature: number;   // incremental, -100..100 (warmer = +)
  sharpness: number;     // 0..150
}

/** Map the recipe's Instagram-scale slider moves to Lightroom adjustments,
 * kept deliberately moderate (the recipe's own rule: never full strength). */
export function presetValues(recipe: EditRecipe): PresetValues {
  const bright = stepFor(recipe, /Brightness/i);
  const contrast = stepFor(recipe, /Contrast/i);
  const shadows = stepFor(recipe, /Shadows/i);
  const sat = stepFor(recipe, /Saturation/i);
  const warmth = stepFor(recipe, /Warmth/i);
  const highlights = stepFor(recipe, /Highlights/i);
  const structure = stepFor(recipe, /Structure|Sharpen/i);

  return {
    name: "AuraCheck — Your Glow",
    exposure: Math.round(clamp(bright * 2, -100, 100)) / 100 * 1.0, // ±1 EV range
    contrast: clamp(contrast, -50, 50),
    highlights: clamp(highlights * 3, -80, 80),
    shadows: clamp(shadows * 3, -80, 80),
    saturation: clamp(sat, -40, 40),
    vibrance: clamp(sat * 0.8, -35, 35),
    clarity: clamp(structure, -20, 35),
    temperature: clamp(warmth, -40, 40),
    sharpness: clamp(25 + Math.max(0, structure), 0, 100),
  };
}

const uuid = () => "AURA" + Math.random().toString(36).slice(2, 12).toUpperCase() + Date.now().toString(36).toUpperCase();

/** A valid Lightroom/Camera-Raw preset XMP built from the values. Uses
 * incremental temperature (works on JPEGs, unlike Kelvin WB) and 2012-process
 * tone tags so it imports cleanly into Lightroom mobile + desktop. */
export function buildLightroomXmp(recipe: EditRecipe): string {
  const v = presetValues(recipe);
  const sign = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
  const ev = (v.exposure >= 0 ? "+" : "") + v.exposure.toFixed(2);
  return `<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="AuraCheck">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"
    crs:PresetType="Normal"
    crs:UUID="${uuid()}"
    crs:SupportsAmount="False"
    crs:SupportsColor="True"
    crs:SupportsMonochrome="True"
    crs:SupportsHighDynamicRange="True"
    crs:SupportsNormalDynamicRange="True"
    crs:SupportsSceneReferred="True"
    crs:SupportsOutputReferred="True"
    crs:Version="15.0"
    crs:ProcessVersion="11.0"
    crs:WhiteBalance="As Shot"
    crs:IncrementalTemperature="${sign(v.temperature)}"
    crs:IncrementalTint="0"
    crs:Exposure2012="${ev}"
    crs:Contrast2012="${sign(v.contrast)}"
    crs:Highlights2012="${sign(v.highlights)}"
    crs:Shadows2012="${sign(v.shadows)}"
    crs:Whites2012="0"
    crs:Blacks2012="0"
    crs:Clarity2012="${sign(v.clarity)}"
    crs:Vibrance="${sign(v.vibrance)}"
    crs:Saturation="${sign(v.saturation)}"
    crs:Sharpness="${v.sharpness}"
    crs:HasSettings="True">
   <crs:Name>
    <rdf:Alt>
     <rdf:li xml:lang="x-default">${v.name}</rdf:li>
    </rdf:Alt>
   </crs:Name>
   <crs:Group>
    <rdf:Alt>
     <rdf:li xml:lang="x-default">AuraCheck</rdf:li>
    </rdf:Alt>
   </crs:Group>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>`;
}
