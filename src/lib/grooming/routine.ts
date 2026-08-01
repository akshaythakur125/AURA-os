/**
 * Grooming Routine — the layer past "here are some products". People leave the
 * app to google "morning skincare routine for oily skin"; this builds them a
 * real AM / PM / weekly regimen from their OWN measured skin read, in order,
 * with what each step is for and a shoppable product type. Framed for how skin
 * *photographs*, never as medical advice. Pure and deterministic — no key.
 */

export interface SkinRead {
  clarity: number;   // 0–100, higher = clearer
  evenness: number;  // 0–100, higher = more even tone
  shine: number;     // 0–100, higher = oilier / shinier
  underEye: number;  // 0–100, higher = worse (darker/puffier)
  texture: number;   // 0–100, higher = rougher
}

export interface RoutineStep {
  name: string;      // e.g. "Cleanser"
  product: string;   // shoppable product type
  why: string;       // one line, grounded in their read
  query: string;     // retailer search query
}

export interface GroomingRoutine {
  skinType: string;
  headline: string;
  am: RoutineStep[];
  pm: RoutineStep[];
  weekly: RoutineStep[];
  note: string;
}

function classify(s: SkinRead): "oily" | "dry" | "combination" | "balanced" {
  const oily = s.shine >= 58;
  const dry = s.shine <= 32 && s.texture >= 52;
  if (oily && s.texture >= 55) return "combination";
  if (oily) return "oily";
  if (dry) return "dry";
  return "balanced";
}

export function buildGroomingRoutine(s: SkinRead): GroomingRoutine {
  const type = classify(s);
  const oily = type === "oily" || type === "combination";
  const dry = type === "dry";
  const dullTone = s.evenness <= 58;
  const roughTexture = s.texture >= 55;
  const tiredEyes = s.underEye >= 55;
  const breakoutProne = s.clarity <= 52;

  const cleanser: RoutineStep = oily
    ? { name: "Cleanser", product: "gel / foaming face wash (oil-control)", why: `Your T-zone read oily (${s.shine}/100) — a gel cleanser clears excess oil without stripping.`, query: "oil control gel face wash men" }
    : dry
      ? { name: "Cleanser", product: "cream / hydrating cleanser", why: "Your skin read on the dry side — a cream cleanser cleans without tightening.", query: "hydrating cream cleanser" }
      : { name: "Cleanser", product: "gentle daily face wash", why: "A gentle, pH-balanced wash is the base every routine sits on.", query: "gentle ph balanced face wash" };

  const moisturizerAM: RoutineStep = oily
    ? { name: "Moisturiser", product: "oil-free gel moisturiser", why: "Even oily skin needs water — a gel hydrates without adding shine.", query: "oil free gel moisturiser" }
    : { name: "Moisturiser", product: "lightweight daily moisturiser", why: "Locks in hydration so skin looks plump, not flat, on camera.", query: "lightweight face moisturiser" };

  const sunscreen: RoutineStep = { name: "Sunscreen", product: "SPF 50 sunscreen (matte for oily)", why: "The single highest-impact step in Indian sun — prevents tanning, dullness and premature ageing. Never skip it.", query: oily ? "matte sunscreen spf 50 oily skin" : "sunscreen spf 50 face" };

  const am: RoutineStep[] = [cleanser];
  if (dullTone) am.push({ name: "Vitamin C serum", product: "vitamin C serum (10–15%)", why: `Your tone read a little uneven (${s.evenness}/100) — vitamin C brightens and evens over a few weeks.`, query: "vitamin c serum face" });
  am.push(moisturizerAM);
  am.push(sunscreen);
  if (tiredEyes) am.push({ name: "Eye care", product: "caffeine under-eye roll-on", why: `Your under-eye area read tired (${s.underEye}/100) — caffeine de-puffs and wakes the eyes up for photos.`, query: "caffeine under eye cream roll on" });

  const pm: RoutineStep[] = [
    oily
      ? { name: "Cleanser", product: "double cleanse (micellar → face wash)", why: "Clears the day's oil, sunscreen and grime so pores stay clear overnight.", query: "micellar water face" }
      : { name: "Cleanser", product: "gentle face wash", why: "Removes the day so your night steps can actually work.", query: "gentle face wash" },
  ];
  if (breakoutProne || oily) pm.push({ name: "Treatment", product: "niacinamide serum", why: `Niacinamide controls oil and evens out marks — right for your ${type} skin (clarity ${s.clarity}/100).`, query: "niacinamide serum face" });
  else if (dullTone) pm.push({ name: "Treatment", product: "niacinamide serum", why: "Evens tone and refines pores while you sleep.", query: "niacinamide serum face" });
  pm.push(dry
    ? { name: "Moisturiser", product: "rich night cream / moisturiser", why: "A richer cream overnight repairs a dry, tight barrier.", query: "night cream dry skin" }
    : { name: "Moisturiser", product: "night moisturiser", why: "Seals in the treatment step so you wake up looking rested.", query: "night moisturiser face" });
  if (tiredEyes) pm.push({ name: "Eye care", product: "hydrating eye cream", why: "Overnight is when under-eye repair actually happens.", query: "hydrating eye cream" });

  const weekly: RoutineStep[] = [];
  weekly.push(oily
    ? { name: "Exfoliate 2×/week", product: "BHA (salicylic acid) exfoliant", why: `Rough or oily skin (texture ${s.texture}/100) clears up with a BHA that gets into pores.`, query: "salicylic acid bha exfoliant" }
    : { name: "Exfoliate 1–2×/week", product: "gentle AHA (lactic acid) exfoliant", why: `Smooths texture (${s.texture}/100) so light reflects evenly and skin looks fresh.`, query: "lactic acid aha exfoliant" });
  if (oily) weekly.push({ name: "Clay mask 1×/week", product: "clay / charcoal mask", why: "Pulls out excess oil and de-congests pores — visibly matter skin for a day or two.", query: "clay charcoal face mask" });
  else weekly.push({ name: "Hydrating mask 1×/week", product: "hydrating sheet / gel mask", why: "A weekly moisture hit keeps skin looking plump and healthy.", query: "hydrating sheet mask" });
  if (roughTexture && !oily) weekly.push({ name: "Face oil (night)", product: "lightweight face oil", why: "A few drops on rough patches at night smooth texture over time.", query: "lightweight face oil" });

  const headline =
    type === "oily" ? "Your skin reads oily — the plan is control shine, keep pores clear."
    : type === "combination" ? "Your skin reads combination — balance an oily T-zone with hydrated cheeks."
    : type === "dry" ? "Your skin reads dry — the plan is hydrate, protect the barrier."
    : "Your skin reads balanced — the plan is protect it and keep it that way.";

  return {
    skinType: type,
    headline,
    am,
    pm,
    weekly,
    note: "For how your skin photographs — not medical advice. Patch-test new actives, and introduce one at a time.",
  };
}
