import type { ProductType } from "@/lib/payments/productCatalog";
import type { AuditRow } from "@/lib/supabase/types";

export function generatePaidProductForAudit(
  audit: AuditRow,
  productType: ProductType
): Record<string, unknown> {
  if (!audit.free_result) {
    throw new Error("Generate free Aura Score before unlocking paid report.");
  }

  switch (productType) {
    case "quick_fix": {
      return {
        type: "quick_fix",
        generatedAt: new Date().toISOString(),
        biggestLeak: (audit.free_result as Record<string, unknown>)?.biggestLeak || null,
        fixSteps: [
          "Adjust lighting to reduce shadows on face",
          "Crop to rule-of-thirds for better framing",
          "Remove clutter from background",
          "Use warmer color temperature",
        ],
        estimatedImprovement: "+15 to +25 points",
      };
    }

    case "aura_report": {
      return {
        type: "aura_report",
        generatedAt: new Date().toISOString(),
        score: audit.free_score || 0,
        breakdown: (audit.free_result as Record<string, unknown>)?.signals || [],
        upgradePaths: [
          "Fix the biggest status leak first",
          "Improve lighting and background",
          "Optimize clothing contrast",
        ],
        budgetPlan: "Start with ₹49 Quick Fix, then upgrade to full glow-up",
      };
    }

    case "dating_audit": {
      const profileInput = audit.profile_text_input as Record<string, unknown> | null;
      return {
        type: "dating_audit",
        generatedAt: new Date().toISOString(),
        bioFeedback: profileInput?.bio
          ? `Bio length: ${(profileInput.bio as string).length} chars — could be more engaging`
          : "No bio provided",
        promptFeedback: profileInput?.prompts
          ? "Prompts answered — review for originality"
          : "No prompts answered",
        photoOrder: "Lead with your highest-scoring photo (best lighting, smile, framing)",
      };
    }

    case "glowup_plan": {
      return {
        type: "glowup_plan",
        generatedAt: new Date().toISOString(),
        duration: "30 days",
        weeks: [
          { week: 1, focus: "Lighting & Photography Basics", missions: ["Master natural lighting", "Find your best angles"] },
          { week: 2, focus: "Style & Color Palette", missions: ["Identify your color season", "Capsule wardrobe audit"] },
          { week: 3, focus: "Grooming & Fitness", missions: ["Skincare routine setup", "Posture improvement drills"] },
          { week: 4, focus: "Social Presentation", missions: ["Practice confident body language", "Review all progress"] },
        ],
        budgetRoadmap: "Week 1-2: ₹0-500 (lighting, thrift), Week 3-4: ₹500-2000 (grooming, key pieces)",
      };
    }

    default:
      throw new Error(`Unknown product type: ${productType}`);
  }
}
