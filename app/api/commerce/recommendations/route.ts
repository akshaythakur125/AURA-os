import { NextRequest, NextResponse } from "next/server";
import { buildAuraCommercePlan } from "@/lib/wardrobe/auraCommerceEngine";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { goal, budget, freeScore } = body;

    const plan = buildAuraCommercePlan({
      goal: goal || undefined,
      budget: budget || undefined,
      freeResult: body.freeResult || undefined,
      freeScore: typeof freeScore === "number" ? freeScore : undefined,
    });

    return NextResponse.json({
      diagnosis: plan.diagnosis,
      topRecommendations: plan.topRecommendations.slice(0, 5),
      outfitBundles: plan.outfitBundles.slice(0, 3),
      bestSingleUpgrade: plan.bestSingleUpgrade,
      cheapestUsefulUpgrade: plan.cheapestUsefulUpgrade,
      highestAuraImpactUpgrade: plan.highestAuraImpactUpgrade,
      whatNotToBuy: plan.whatNotToBuy.slice(0, 3),
      finalAdvice: plan.finalAdvice,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
