import type { BudgetRange, BudgetAction } from "@/types";

const ALL_PLANS: Record<BudgetRange, Omit<BudgetAction, "budgetRange">[]> = {
  "0": [
    { priority: 1, actions: ["Retake photo in natural window light", "Clear the background clutter", "Improve framing — center the subject", "Clean your phone lens", "Remove clutter from the frame"], estimatedImpact: "Up to 25% improvement in lighting and clarity" },
  ],
  "2000": [
    { priority: 1, actions: ["Get a basic haircut or groom", "Buy a solid-color shirt or t-shirt (neutral tones)", "Get a simple phone tripod or clip-on light", "Clean or replace phone case", "Basic grooming kit (eyebrow, nails, skin)", "Take a well-lit mirror selfie with the new setup"], estimatedImpact: "Noticeable improvement in grooming and photo setup" },
  ],
  "5000": [
    { priority: 1, actions: ["Upgrade shoes — clean, minimal sneakers or loafers", "Add an overshirt or light jacket for outfit layering", "Deodorant or mild perfume", "Grooming refresh + improved photo setup", "Simple watch or accessory"], estimatedImpact: "Strong visual upgrade — outfit + grooming + photo quality" },
  ],
  "10000": [
    { priority: 1, actions: ["Full outfit set (shirt, pants, shoes)", "Matching shoes + watch + grooming kit", "Room or background upgrade — clean wall, good lighting area", "Dedicated profile photo session budget", "Skincare basics (cleanser, moisturizer)"], estimatedImpact: "High-impact transformation — outfit, background, and photo quality" },
  ],
  "25000": [
    { priority: 1, actions: ["Wardrobe capsule (3-4 coordinated outfits)", "Professional shoot or high-quality self-portrait session", "Premium grooming (salon, skincare, styling)", "Fitness or grooming plan (3-month commitment)", "Complete profile refresh across platforms"], estimatedImpact: "Maximum signal upgrade — wardrobe, grooming, photography, and consistency" },
  ],
};

export function getBudgetPlans(budgetRange: BudgetRange): BudgetAction[] {
  const plans = ALL_PLANS[budgetRange] || ALL_PLANS["0"];
  return plans.map((p) => ({
    ...p,
    budgetRange,
  }));
}

export function getAllBudgetPlans(): BudgetAction[] {
  const result: BudgetAction[] = [];
  const ranges: BudgetRange[] = ["0", "2000", "5000", "10000", "25000"];
  for (const r of ranges) {
    result.push(...getBudgetPlans(r));
  }
  return result;
}
