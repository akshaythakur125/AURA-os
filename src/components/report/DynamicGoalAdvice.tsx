"use client";

import { FadeInView } from "@/components/ui/FadeInView";

/**
 * Dynamic, personalized goal advice — reacts to actual metrics, not hardcoded.
 * Replaces the static if/else blocks for dating/instagram/college/office/glowup.
 */
export function DynamicGoalAdvice({
  goal,
  metrics,
}: {
  goal: string;
  metrics: {
    lightingScore: number;
    clarityScore: number;
    groomingScore: number;
    expressionScore: number;
    clothingScore: number;
    backgroundComplexityEstimate: number;
    symmetryScore: number;
    faceBrightness: number;
    saturation: number;
    imageDullness: number;
  };
}) {
  // Build personalized advice based on what the analysis actually found
  const tips = getPersonalizedTips(goal, metrics);
  const headline = getGoalHeadline(goal);
  const subtext = getGoalSubtext(goal, metrics);

  return (
    <FadeInView>
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/[0.08] to-transparent p-5">
        <div className="mb-3">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1">
            <span className="text-xs">{headline.icon}</span>
            <span className="text-xs font-medium text-blue-300">{headline.badge}</span>
          </div>
          <h3 className="text-base font-bold text-white">{headline.title}</h3>
          <p className="mt-1 text-xs text-gray-400">{subtext}</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {tips.map((tip) => (
            <div key={tip.label} className="rounded-xl bg-white/[0.03] p-3 text-center">
              <div className="mb-1 text-lg">{tip.icon}</div>
              <div className="text-xs font-medium text-white">{tip.label}</div>
              <div className="text-[10px] text-gray-500">{tip.detail}</div>
            </div>
          ))}
        </div>

        {/* Priority action — the ONE thing to fix right now */}
        <div className="mt-4 rounded-xl border border-blue-500/10 bg-blue-500/5 p-3">
          <div className="text-[10px] font-medium text-blue-400 uppercase tracking-wider mb-1">
            Your #1 priority right now
          </div>
          <p className="text-sm text-white font-medium">{getTopPriority(goal, metrics)}</p>
        </div>
      </div>
    </FadeInView>
  );
}

function getGoalHeadline(goal: string) {
  const map: Record<string, { icon: string; badge: string; title: string }> = {
    dating: { icon: "💘", badge: "Dating Profile", title: "Optimized for dating" },
    instagram: { icon: "📸", badge: "Instagram", title: "Built for the feed" },
    office: { icon: "💼", badge: "Professional", title: "LinkedIn-ready" },
    college: { icon: "🎓", badge: "Campus", title: "Stand out on campus" },
    glowup: { icon: "✨", badge: "Glow-Up", title: "Your transformation plan" },
  };
  return map[goal] || map.glowup;
}

function getGoalSubtext(
  goal: string,
  m: { lightingScore: number; groomingScore: number; expressionScore: number; clothingScore: number }
): string {
  const avg = Math.round((m.lightingScore + m.groomingScore + m.expressionScore + m.clothingScore) / 4);

  const subtexts: Record<string, string> = {
    dating:
      avg >= 65
        ? "Your profile is already above average. Small tweaks to lighting and expression will make it stand out."
        : "Fix the 2-3 issues below and your profile will outperform 80% of others on the platform.",
    instagram:
      avg >= 65
        ? "Your visual consistency is solid. Focus on color palette and background for feed cohesion."
        : "Start with lighting and background — those two fixes alone will transform your grid.",
    office:
      avg >= 65
        ? "Professional and polished. Minor grooming and expression tweaks will push you to the top tier."
        : "Simple fixes — clean background, solid-color shirt, soft lighting — will make you look executive-level.",
    college:
      avg >= 65
        ? "You're already ahead of most college profiles. One good photoshoot with friends will seal it."
        : "Clean lighting + simple background + fitted outfit = instant upgrade. No expensive stuff needed.",
    glowup:
      avg >= 65
        ? "Great foundation. Focus on consistency — retake every 2 weeks to track improvement."
        : "Start with the basics (lighting, clarity, background). These are free and make the biggest difference.",
  };

  return subtexts[goal] || subtexts.glowup;
}

function getPersonalizedTips(
  goal: string,
  m: {
    lightingScore: number;
    clarityScore: number;
    groomingScore: number;
    expressionScore: number;
    clothingScore: number;
    backgroundComplexityEstimate: number;
    faceBrightness: number;
    saturation: number;
  }
) {
  // Build tips based on actual weakest areas
  const areas = [
    { key: "lighting", score: m.lightingScore },
    { key: "grooming", score: m.groomingScore },
    { key: "expression", score: m.expressionScore },
    { key: "clothing", score: m.clothingScore },
    { key: "clarity", score: m.clarityScore },
    { key: "background", score: 100 - m.backgroundComplexityEstimate },
  ].sort((a, b) => a.score - b.score);

  const weakest = areas.slice(0, 3);

  const tipMap: Record<string, Record<string, { icon: string; label: string; detail: string }>> = {
    dating: {
      lighting: { icon: "💡", label: "Warm light", detail: m.lightingScore < 50 ? "Face a window for soft, flattering light" : "Golden hour for a warm, inviting feel" },
      grooming: { icon: "✂️", label: "Grooming", detail: m.groomingScore < 50 ? "Clean shave or shaped beard makes a huge difference" : "Maintain your current look — it's working" },
      expression: { icon: "😊", label: "Expression", detail: m.expressionScore < 50 ? "Think of something genuine before the shot — avoid forced smiles" : "Soft eye contact + slight smile = trustworthy" },
      clothing: { icon: "👔", label: "Outfit", detail: "Solid neutral colors signal confidence on dating apps" },
      clarity: { icon: "📸", label: "Clarity", detail: "Sharp photos get 3x more right-swipes" },
      background: { icon: "🏠", label: "Background", detail: "Clean, simple background keeps focus on you" },
    },
    instagram: {
      lighting: { icon: "💡", label: "Lighting", detail: m.lightingScore < 50 ? "Natural light = better engagement than indoor" : "Consistent lighting style across your feed" },
      grooming: { icon: "✂️", label: "Style", detail: "Your look IS your brand — keep it consistent" },
      expression: { icon: "😎", label: "Vibe", detail: "Confident > perfect. Instagram rewards authenticity" },
      clothing: { icon: "🎨", label: "Color", detail: "Pick 2-3 colors and stick to them for feed cohesion" },
      clarity: { icon: "📸", label: "Quality", detail: "HD photos get pushed by the algorithm" },
      background: { icon: "🖼️", label: "Background", detail: "Your grid is a visual story — backgrounds should match" },
    },
    office: {
      lighting: { icon: "💡", label: "Soft light", detail: "Even, diffused light = professional" },
      grooming: { icon: "✂️", label: "Neat", detail: "Trimmed hair + clean-shaven or shaped beard" },
      expression: { icon: "🤝", label: "Approachable", detail: "Slight smile signals competence + warmth" },
      clothing: { icon: "👔", label: "Solid", detail: "Navy, grey, white — power colors for LinkedIn" },
      clarity: { icon: "📸", label: "Sharpness", detail: "Crisp, well-lit headshots get more recruiter views" },
      background: { icon: "🏠", label: "Clean", detail: "Plain wall or office background — no clutter" },
    },
    college: {
      lighting: { icon: "💡", label: "Natural", detail: "Outdoor or window light works best" },
      grooming: { icon: "✂️", label: "Fresh", detail: "Fresh trim + clean skin = instant upgrade" },
      expression: { icon: "😄", label: "Fun", detail: "Genuine laugh > posed smile for college profiles" },
      clothing: { icon: "👕", label: "Fitted", detail: "Fitted tee + clean sneakers = campus ready" },
      clarity: { icon: "📸", label: "Quality", detail: "No screenshots — use actual camera photos" },
      background: { icon: "🏫", label: "Context", detail: "Campus, coffee shop, or clean outdoor space" },
    },
    glowup: {
      lighting: { icon: "💡", label: "Master light", detail: "This is your #1 upgrade — learn window light" },
      grooming: { icon: "✂️", label: "Basics", detail: "Moisturize, trim, groom — the foundation" },
      expression: { icon: "😊", label: "Confidence", detail: "Stand tall, chin up, genuine smile" },
      clothing: { icon: "👕", label: "Basics", detail: "Solid neutrals first, then add personality" },
      clarity: { icon: "📸", label: "Quality", detail: "Quality photos show the real you" },
      background: { icon: "🖼️", label: "Clean", detail: "Simple = premium. Cluttered = amateur." },
    },
  };

  const goalTips = tipMap[goal] || tipMap.glowup;

  return weakest.map((w) => goalTips[w.key] || { icon: "⚡", label: w.key, detail: "Focus here" });
}

function getTopPriority(
  goal: string,
  m: {
    lightingScore: number;
    clarityScore: number;
    groomingScore: number;
    expressionScore: number;
    clothingScore: number;
  }
): string {
  const areas = [
    { key: "lighting", score: m.lightingScore, fix: "Face a window at 45° — light from the side, not behind" },
    { key: "clarity", score: m.clarityScore, fix: "Wipe your lens, tap to focus, use rear camera" },
    { key: "grooming", score: m.groomingScore, fix: "Quick grooming session — trim, shape, moisturize" },
    { key: "expression", score: m.expressionScore, fix: "Think of something funny, then shoot — natural beats forced" },
    { key: "clothing", score: m.clothingScore, fix: "Switch to a solid neutral-color top" },
  ].sort((a, b) => a.score - b.score);

  const worst = areas[0];

  const goalContext: Record<string, string> = {
    dating: " for your dating profile",
    instagram: " for your Instagram grid",
    office: " for your LinkedIn headshot",
    college: " for your campus presence",
    glowup: " for your glow-up journey",
  };

  return `Fix ${worst.key}${goalContext[goal] || ""}: ${worst.fix}`;
}
