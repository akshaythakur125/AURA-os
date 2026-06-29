import type { AuraScore, StatusLeak } from "@/types/audit";

export interface ReportTemplate {
  generateSummary(score: AuraScore, leaks: StatusLeak[]): string;
  generateTitle(score: AuraScore): string;
  generateCallToAction(leaks: StatusLeak[]): string;
}

function scoreBand(score: number): string {
  if (score >= 85) return "strong";
  if (score >= 65) return "average";
  return "needs-attention";
}

export const defaultTemplate: ReportTemplate = {
  generateSummary(score, leaks) {
    const band = scoreBand(score.overall);
    const leakCount = leaks.length;
    const summaries: Record<string, string> = {
      strong: `Your visual presentation is making a solid first impression. We identified ${leakCount} minor area${leakCount !== 1 ? "s" : ""} that could refine your image further.`,
      average: `Your first impression has good foundations but ${leakCount} status signal${leakCount !== 1 ? "s" : ""} could be leaking impact. Small adjustments can make a noticeable difference.`,
      "needs-attention": `Your visual presentation has several areas that may be weakening your first impression. Addressing the ${leakCount} identified status leaks could significantly change how you are perceived.`,
    };
    return summaries[band] || summaries.average;
  },

  generateTitle(score) {
    const band = scoreBand(score.overall);
    const titles: Record<string, string> = {
      strong: "Your presentation is working for you",
      average: "You're leaving impression points on the table",
      "needs-attention": "Your first impression has room to grow",
    };
    return titles[band] || titles.average;
  },

  generateCallToAction(leaks) {
    const highLeaks = leaks.filter((l) => l.severity === "high").length;
    if (highLeaks > 0) {
      return "Start with your highest-severity leaks first for the biggest impact.";
    }
    return "Try the easy, free adjustments first to build momentum.";
  },
};
