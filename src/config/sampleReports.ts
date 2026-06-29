import type { ProductType } from "@/types/payment";

export interface SampleReport {
  id: string;
  productType: ProductType;
  productName: string;
  score: number;
  archetype?: string;
  bottleneck: string;
  topInsight: string;
  sampleRecommendations: string[];
  budgetRange: string;
}

export const SAMPLE_REPORTS: SampleReport[] = [
  {
    id: "sample-aura",
    productType: "aura_report",
    productName: "Full Aura Report",
    score: 72,
    archetype: "Urban Aspirational",
    bottleneck: "Background control",
    topInsight:
      "Your outfit and grooming are above average, but your background signals inconsistency — a cluttered frame weakens the premium story your clothes tell.",
    sampleRecommendations: [
      "Use a neutral, uncluttered background",
      "Improve lighting to reduce harsh shadows",
      "Crop out distracting elements before sharing",
    ],
    budgetRange: "₹0 – ₹5,000",
  },
  {
    id: "sample-dating",
    productType: "dating_audit",
    productName: "Dating / Profile Audit",
    score: 68,
    bottleneck: "Generic bio + weak photo order",
    topInsight:
      "Your photos are decent but your bio is generic — 'I like traveling and food' does not start a conversation. Your best photo is buried third.",
    sampleRecommendations: [
      "Rewrite bio with a specific hook",
      "Move strongest photo to position one",
      "Remove low-effort prompt answers",
    ],
    budgetRange: "₹0 – ₹2,000",
  },
  {
    id: "sample-glowup",
    productType: "glowup_plan",
    productName: "30-Day Glow-Up Plan",
    score: 74,
    bottleneck: "Inconsistent visual system",
    topInsight:
      "You have individual good elements but no visual consistency across photos — each image could belong to a different person.",
    sampleRecommendations: [
      "Establish a consistent color palette",
      "Use same grooming style across all photos",
      "Create a go-to outfit formula",
    ],
    budgetRange: "₹2,000 – ₹10,000",
  },
];
