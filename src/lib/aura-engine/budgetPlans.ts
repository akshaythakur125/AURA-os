import type { BudgetAmount, BudgetUpgradePlan } from "@/types/audit";

export function getBudgetUpgradePlan(budget: BudgetAmount): BudgetUpgradePlan {
  const plans: Record<BudgetAmount, BudgetUpgradePlan> = {
    0: {
      budgetRange: 0,
      priority: "Immediate — Free",
      actions: [
        "Retake photo in natural window light",
        "Clean the background — remove clutter and distractions",
        "Improve framing — center subject with headroom",
        "Clean your phone camera lens before shooting",
        "Wear a solid, neutral-colored top",
      ],
      estimatedImpact: "Moderate — lighting and framing alone can improve perceived clarity by 15–25%",
      currency: "INR",
    },
    2000: {
      budgetRange: 2000,
      priority: "Quick Wins — ₹2,000",
      actions: [
        "Get a basic haircut or grooming refresh",
        "Buy a solid-color shirt or t-shirt (neutral tones)",
        "Use a simple phone tripod or stand for steady shots",
        "Clean or replace your phone case",
        "Get a basic grooming kit (nails, brows, skin)",
      ],
      estimatedImpact: "Good — grooming and a clean outfit can shift first impression perception significantly",
      currency: "INR",
    },
    5000: {
      budgetRange: 5000,
      priority: "Focused Upgrade — ₹5,000",
      actions: [
        "Upgrade footwear — clean, minimal sneakers or casual shoes",
        "Add an overshirt or lightweight jacket to your wardrobe",
        "Buy a reliable deodorant or mild perfume",
        "Full grooming session — haircut, face, nails",
        "Add a simple watch or minimal accessory",
      ],
      estimatedImpact: "High — coordinated outfit and grooming create a cohesive premium signal",
      currency: "INR",
    },
    10000: {
      budgetRange: 10000,
      priority: "Confidence Package — ₹10,000",
      actions: [
        "Buy a complete outfit set — top, bottom, and shoes",
        "Upgrade watch or accessory within budget",
        "Full premium grooming session",
        "Improve room or photo background — curtains, clean wall setup",
        "Book a profile photo session with a friend or local photographer",
      ],
      estimatedImpact: "Very High — a complete look refresh plus professional-feeling photos",
      currency: "INR",
    },
    25000: {
      budgetRange: 25000,
      priority: "Premium Transformation — ₹25,000+",
      actions: [
        "Build a small wardrobe capsule — 3–5 coordinated outfits",
        "Book a professional photoshoot for profile photos",
        "Premium grooming — skin, hair, nails, fragrance",
        "Join a fitness or grooming program (3-month commitment)",
        "Refresh your social/profile presence across platforms",
      ],
      estimatedImpact: "Maximum — full visual signal overhaul across photos, presence, and presentation",
      currency: "INR",
    },
  };

  return plans[budget] || plans[0];
}
