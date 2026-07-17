"use client";

import { Badge } from "@/components/ui/Badge";
import { FadeInView } from "@/components/ui/FadeInView";

interface RoadmapStep {
  priority: 1 | 2 | 3;
  title: string;
  description: string;
  effort: "free" | "cheap" | "invest";
  timeframe: string;
  impactPercent: number;
}

/**
 * Build prioritized roadmap from metrics — personalized per photo, not generic.
 */
function buildRoadmap(metrics: {
  lightingScore: number;
  clarityScore: number;
  compositionScore: number;
  groomingScore: number;
  expressionScore: number;
  backgroundComplexityEstimate: number;
  symmetryScore: number;
}): RoadmapStep[] {
  const steps: { key: string; score: number; step: RoadmapStep }[] = [];

  if (metrics.lightingScore < 65) {
    steps.push({
      key: "lighting",
      score: metrics.lightingScore,
      step: {
        priority: 1,
        title: "Fix your lighting first",
        description:
          "Face a window at 45°. Light should hit your face from the side — not from behind or above. This is one of the highest-impact corrections you can make.",
        effort: "free",
        timeframe: "5 minutes",
        impactPercent: 20,
      },
    });
  }

  if (metrics.clarityScore < 55) {
    steps.push({
      key: "clarity",
      score: metrics.clarityScore,
      step: {
        priority: 1,
        title: "Get a sharper photo",
        description:
          "Wipe your lens. Tap to focus on your eyes. Use rear camera. Stand still or lean against something stable.",
        effort: "free",
        timeframe: "2 minutes",
        impactPercent: 15,
      },
    });
  }

  if (metrics.backgroundComplexityEstimate > 55) {
    steps.push({
      key: "background",
      score: 100 - metrics.backgroundComplexityEstimate,
      step: {
        priority: 2,
        title: "Simplify your background",
        description:
          "Stand in front of a plain wall, open doorway, or clean outdoor space. Anything 4+ feet behind you should be simple and darker than your face.",
        effort: "free",
        timeframe: "5 minutes",
        impactPercent: 12,
      },
    });
  }

  if (metrics.groomingScore < 55) {
    steps.push({
      key: "grooming",
      score: metrics.groomingScore,
      step: {
        priority: 2,
        title: "Groom before your next photo",
        description:
          "Trim stray hairs, clean up brows, moisturize. If you have a beard, shape it. These details matter more than you think.",
        effort: "cheap",
        timeframe: "30 minutes",
        impactPercent: 10,
      },
    });
  }

  if (metrics.compositionScore < 55) {
    steps.push({
      key: "composition",
      score: metrics.compositionScore,
      step: {
        priority: 2,
        title: "Frame yourself properly",
        description:
          "Center yourself. Eyes at the top-third line. Leave a little headroom. Shoot from mid-chest up. Portrait (vertical) orientation.",
        effort: "free",
        timeframe: "1 minute",
        impactPercent: 10,
      },
    });
  }

  if (metrics.expressionScore < 50) {
    steps.push({
      key: "expression",
      score: metrics.expressionScore,
      step: {
        priority: 3,
        title: "Work on your expression",
        description:
          "A slight, genuine smile works better than a forced grin. Relax your jaw. Think of something funny before the shot. Eye contact with the camera lens.",
        effort: "free",
        timeframe: "Practice",
        impactPercent: 8,
      },
    });
  }

  if (metrics.symmetryScore < 50) {
    steps.push({
      key: "symmetry",
      score: metrics.symmetryScore,
      step: {
        priority: 3,
        title: "Balance the composition",
        description:
          "A slight head tilt or angle adjustment can balance asymmetry. Don't turn more than 15° from the camera.",
        effort: "free",
        timeframe: "1 minute",
        impactPercent: 5,
      },
    });
  }

  // Sort by priority, then by score (lowest score = most impact first)
  steps.sort((a, b) => a.step.priority - b.step.priority || a.score - b.score);

  // Assign sequential priorities
  return steps.slice(0, 6).map((s, i) => ({
    ...s.step,
    priority: (i < 2 ? 1 : i < 4 ? 2 : 3) as 1 | 2 | 3,
  }));
}

const effortColors: Record<string, string> = {
  free: "text-emerald-400 border-emerald-500/30",
  cheap: "text-amber-400 border-amber-500/30",
  invest: "text-red-400 border-red-500/30",
};

const effortLabels: Record<string, string> = {
  free: "Free",
  cheap: "Under ₹500",
  invest: "Worth investing",
};

const priorityColors: Record<number, string> = {
  1: "bg-red-500/20 text-red-400 border-red-500/30",
  2: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  3: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const priorityLabels: Record<number, string> = {
  1: "Do first",
  2: "Next up",
  3: "Polish",
};

export function ImprovementRoadmap({
  metrics,
}: {
  metrics: {
    lightingScore: number;
    clarityScore: number;
    compositionScore: number;
    groomingScore: number;
    expressionScore: number;
    backgroundComplexityEstimate: number;
    symmetryScore: number;
  };
}) {
  const steps = buildRoadmap(metrics);
  const totalImpact = steps.reduce((s, step) => s + step.impactPercent, 0);

  if (steps.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-5 text-center">
        <div className="mb-2 text-3xl">🎉</div>
        <h3 className="text-lg font-bold text-[#1C1917]">Your profile is already strong</h3>
        <p className="mt-1 text-xs text-[#6f675e]">
          Minor refinements only — you&apos;re in the top tier. Consider a professional
          photoshoot to push further.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/[0.08] to-transparent p-5">
      <div className="mb-4">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1">
          <span className="text-xs">🗺️</span>
          <span className="text-xs font-medium text-red-300">Your Improvement Roadmap</span>
        </div>
        <h3 className="text-base font-bold text-[#1C1917]">
          Follow these steps in order for the biggest improvement
        </h3>
        <p className="mt-1 text-[11px] text-[#857b6e]">
          Estimated total improvement: <span className="text-emerald-400 font-medium">+{totalImpact} points</span> if you complete all steps
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <FadeInView key={step.title} delay={i * 80}>
            <div className="rounded-xl border border-[#1c1917]/10 bg-[#1c1917]/[0.03] p-4">
              <div className="mb-2 flex items-center gap-2 flex-wrap">
                <Badge variant="default" className={priorityColors[step.priority]}>
                  {priorityLabels[step.priority]}
                </Badge>
                <Badge variant="default" className={effortColors[step.effort]}>
                  {effortLabels[step.effort]}
                </Badge>
                <span className="text-[10px] text-[#9c9184] ml-auto">{step.timeframe}</span>
              </div>
              <h4 className="text-sm font-semibold text-[#1C1917]">{step.title}</h4>
              <p className="mt-1 text-xs text-[#6f675e] leading-relaxed">{step.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#1c1917]/[0.04]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-500"
                    style={{ width: `${step.impactPercent * 5}%` }}
                  />
                </div>
                <span className="text-[10px] text-red-400">+{step.impactPercent} pts</span>
              </div>
            </div>
          </FadeInView>
        ))}
      </div>
    </div>
  );
}
