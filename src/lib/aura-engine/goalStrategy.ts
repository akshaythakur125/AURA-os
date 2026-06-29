import type { Audit } from "@/types/audit";
import type { GoalStrategy, PersonalizationResult } from "@/types/personalization";

export function generateGoalStrategy(
  audit: Audit,
  _personalization: PersonalizationResult
): GoalStrategy {
  void(_personalization);
  const goal = audit.goal;
  const d = audit.deepInput;
  const style = d?.styleIntent;
  const concern = d?.biggestConcern;

  switch (goal) {
    case "dating":
      return {
        goal: "Dating Profile Optimization",
        strategyTitle: "Warmth, clarity, and approachability",
        whatToOptimize:
          "Optimize for warmth and authenticity. Dating profile photos perform best when they feel genuine, well-lit, and focused on your face. A clear, friendly expression signals confidence without arrogance.",
        whatToAvoid:
          "Avoid heavy filters, cluttered backgrounds, group photos as primary, and too many status props. Over-edited or try-hard photos reduce trust signals significantly.",
        bestNextMove:
          concern === "low_matches"
            ? "Replace your primary photo with a well-lit chest-up shot with natural smile and simple background."
            : concern === "weak_photos"
              ? "Improve lighting and framing before retaking your main profile photo."
              : "Ensure your first photo is a clear, warm, solo shot with good lighting and minimal background.",
        suggestedPhotoDirection:
          "Use a chest-up frame with natural window light, simple background, relaxed smile, and solid neutral-colored top.",
        suggestedStyleDirection:
          "Clean, intentional, but not overly styled. Aim for 'put together without trying too hard' — solid colors, minimal accessories, good grooming.",
      };

    case "instagram":
      return {
        goal: "Instagram Profile Cohesion",
        strategyTitle: "Visual consistency and identity",
        whatToOptimize:
          "Optimize for visual consistency across your feed. A cohesive color palette, repeatable lighting style, and intentional framing make your profile feel curated and premium.",
        whatToAvoid:
          "Avoid mixing random photo qualities, jumping between heavy filters and natural shots, or posting inconsistent background styles. Visual noise weakens your feed identity.",
        bestNextMove:
          style === "creator"
            ? "Establish 2-3 signature color tones and stick with them across all posts."
            : "Pick a lighting setup (natural window light or golden hour) and use it consistently for your next 5 posts.",
        suggestedPhotoDirection:
          "Consistent vertical framing with similar lighting conditions across posts. Use one editing preset and apply it uniformly.",
        suggestedStyleDirection:
          "Define a personal style signature — it can be colors, angles, or a recurring background element. Repeat it enough to become recognizable.",
      };

    case "college":
      return {
        goal: "College / University Social Presence",
        strategyTitle: "Relaxed intentionality",
        whatToOptimize:
          "Optimize for authentic but intentional presentation. College settings reward being put-together without looking like you tried too hard. Good grooming and clean framing set you apart naturally.",
        whatToAvoid:
          "Avoid overly formal styling, excessive accessories, or backgrounds that look staged. Also avoid messy dorm rooms or overcrowded group shots.",
        bestNextMove:
          concern === "looking_average"
            ? "Upgrade your daily outfit to a well-fitted solid-color tee or shirt — it changes how put-together you look instantly."
            : "Improve your room background by clearing visible clutter before taking photos.",
        suggestedPhotoDirection:
          "Natural, relaxed framing. Outdoor campus shots or clean indoor corners with good window light work best.",
        suggestedStyleDirection:
          "Casual but intentional. Well-fitted basics (solid tees, clean sneakers, simple jacket) read as confident without trying too hard.",
      };

    case "office":
      return {
        goal: "Professional / LinkedIn Presentation",
        strategyTitle: "Clean, mature, reliable",
        whatToOptimize:
          "Optimize for understated professionalism. Neutral colors, clean backgrounds, and even lighting signal reliability and maturity. Every detail should communicate that you are intentional and prepared.",
        whatToAvoid:
          "Avoid loud colors, busy backgrounds, casual outfit details, extreme filters, or casual selfie-style framing. Maintain eye contact with the camera.",
        bestNextMove:
          concern === "weak_photos"
            ? "Retake your profile photo with a solid neutral background (white or grey) and even frontal lighting."
            : "Replace your current profile photo with a well-lit, neutral-background shot in professional attire.",
        suggestedPhotoDirection:
          "Chest-up frame, solid neutral background, even lighting from the front or slightly angled, neutral expression with slight smile.",
        suggestedStyleDirection:
          "Solid well-fitted shirt or blazer in neutral tones. Minimal accessories. Clean, polished grooming. Less is more in professional contexts.",
      };

    case "glowup":
    default:
      return {
        goal: "Overall Glow-Up / Personal Upgrade",
        strategyTitle: "Fundamentals first, then build up",
        whatToOptimize:
          "Optimize overall presentation consistency. A glow-up works best when you fix the basics (lighting, grooming, background) before spending on accessories or expensive changes.",
        whatToAvoid:
          "Avoid buying expensive items before fixing lighting and background basics. Avoid trying to change everything at once — focus on one area per week.",
        bestNextMove:
          concern === "grooming_issue"
            ? "Book a grooming session (haircut, brows, skin) — this is the highest-ROI first step."
            : concern === "background_issue"
              ? "Clear and simplify your most-used photo background. This is free and changes every photo you take there."
              : "Improve your lighting setup — natural window light or a simple ring light. This single change affects every photo.",
        suggestedPhotoDirection:
          "Start with well-lit, clean-background photos. Once basics are solid, experiment with different settings and styles.",
        suggestedStyleDirection:
          "Build a small capsule wardrobe of well-fitted basics first. Then add one or two statement pieces. Upgrade grooming before upgrading accessories.",
      };
  }
}
