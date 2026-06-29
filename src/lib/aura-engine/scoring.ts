import type { ScoringInput, ScoringOutput } from "./types";

export function calculateAuraScore(_input: ScoringInput): ScoringOutput {
  void _input;
  const visual = 75;
  const presentation = 70;
  const signals = 65;
  const cohesion = 80;

  const overall = Math.round((visual + presentation + signals + cohesion) / 4);

  return {
    score: {
      overall,
      categories: { visual, presentation, signals, cohesion },
    },
    leaks: [
      {
        id: "leak-1",
        severity: "medium",
        category: "visual",
        title: "Facial expression appears neutral",
        description:
          "A neutral expression can sometimes be perceived as disinterest in photos.",
        impact: "May weaken approachability signals in first impressions.",
      },
      {
        id: "leak-2",
        severity: "low",
        category: "presentation",
        title: "Background lacks intentional composition",
        description:
          "The background of your photo does not clearly support your personal brand.",
        impact: "Can dilute the visual story you're trying to tell.",
      },
    ],
    suggestions: [
      {
        id: "sug-1",
        category: "visual",
        title: "Try a genuine smile with eyes",
        description:
          "A subtle smile that reaches your eyes increases warmth perception.",
        effort: "easy",
        cost: "free",
      },
      {
        id: "sug-2",
        category: "presentation",
        title: "Use clean, uncluttered backgrounds",
        description:
          "A simple background keeps the focus on you and your expression.",
        effort: "easy",
        cost: "free",
      },
    ],
  };
}
