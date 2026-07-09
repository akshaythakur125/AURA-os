"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ColorPaletteCard } from "./ColorPaletteCard";
import { WardrobeGapCard } from "./WardrobeGapCard";
import { StyleDirectionCard } from "./StyleDirectionCard";
import { CommerceIntentCard } from "./CommerceIntentCard";
import type { VisualWardrobeDiagnosis } from "@/types/visualWardrobe";
import Link from "next/link";

interface Props {
  diagnosis: VisualWardrobeDiagnosis;
  compact?: boolean;
}

export function VisualWardrobeSection({ diagnosis, compact }: Props) {
  return (
    <div className="space-y-4">
      {/* Score bar */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white">Visual Wardrobe Diagnosis</h3>
          <Badge variant="premium" className="text-[10px]">
            Harmony: {diagnosis.colorHarmonyScore}/100
          </Badge>
        </div>
        <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 transition-all"
            style={{ width: `${diagnosis.colorHarmonyScore}%` }}
          />
        </div>
        <div className="grid gap-3 text-center text-[10px] sm:grid-cols-3">
          <div>
            <span className="text-gray-500">Outfit/Background</span>
            <div className="font-medium text-white">{diagnosis.outfitBackgroundContrastScore}/100</div>
          </div>
          <div>
            <span className="text-gray-500">Premium Signal</span>
            <div className="font-medium text-purple-300">{diagnosis.premiumPaletteScore}/100</div>
          </div>
          <div>
            <span className="text-gray-500">Visual Noise</span>
            <div className={`font-medium ${diagnosis.visualNoiseScore > 50 ? "text-amber-400" : "text-emerald-400"}`}>
              {diagnosis.visualNoiseScore}/100
            </div>
          </div>
        </div>
      </Card>

      {/* Palette */}
      <ColorPaletteCard
        dominantColors={diagnosis.dominantColors}
        recommendedPalette={diagnosis.recommendedColorPalette}
        paletteType={diagnosis.paletteType}
      />

      {/* Style direction */}
      <StyleDirectionCard
        styleDirection={diagnosis.recommendedStyleDirection}
        recommendedCategories={diagnosis.recommendedCategories}
        avoidCategories={diagnosis.avoidCategories}
        recommendedColors={diagnosis.recommendedColorPalette}
      />

      {/* Wardrobe gaps */}
      {!compact && diagnosis.wardrobeGaps.length > 0 && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-white">Wardrobe Gaps</h3>
          <div className="space-y-2">
            {diagnosis.wardrobeGaps.slice(0, 4).map((gap, i) => (
              <WardrobeGapCard key={i} gap={gap} />
            ))}
          </div>
        </Card>
      )}

      {/* Commerce intents */}
      {!compact && diagnosis.commerceSearchIntents.length > 0 && (
        <CommerceIntentCard intents={diagnosis.commerceSearchIntents} />
      )}

      {/* Advice */}
      <Card className="border-purple-500/20">
        <p className="text-xs text-gray-300">{diagnosis.finalAdvice}</p>
        <p className="mt-2 text-[9px] text-gray-600">{diagnosis.safetyNote}</p>
      </Card>

      {/* CTAs */}
      <div className="flex flex-wrap gap-2">
        {diagnosis.commerceSearchIntents.length > 0 && (
          <Button asChild size="sm">
            <Link href={`/wardrobe/search?style=${diagnosis.recommendedStyleDirection}`}>Find Matching Clothes</Link>
          </Button>
        )}
        {diagnosis.auditId && (
          <Button asChild size="sm" variant="outline">
            <Link href={`/wardrobe/${diagnosis.auditId}`}>Build Outfit</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
