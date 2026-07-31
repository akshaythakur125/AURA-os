import type { ImageSignalMetrics, FullStatusLeak, StatusLeak } from "@/types/audit";

/**
 * The verdict is the headline of the paid report — the first thing a ₹21 buyer
 * reads. A canned "good foundation, clear weak spots" line reads like every
 * other AI tool. This composer instead synthesises a stylist-grade paragraph
 * from THIS photo's measured signals: it frames the score honestly, gives
 * credit for the single strongest thing they've got (by name and number),
 * names what's actually costing them the most (the top leak, with its measured
 * impact), and points at the ceiling and the one move to reach it. Every clause
 * is data-driven, so no two people get the same verdict — while phrasing varies
 * deterministically from a seed so the same photo always reads identically.
 */

interface VerdictInputs {
  score: number;
  category: string;
  metrics: ImageSignalMetrics;
  topLeak?: FullStatusLeak;
  ceiling: number;
  seed: number;
}

function seededPick(arr: string[], seed: number, salt: number): string {
  if (arr.length === 0) return "";
  return arr[Math.abs(seed + salt) % arr.length];
}

/** Strip a leak title/fix down to a clean clause: first sentence or pre-colon
 * segment, lowercased, no trailing punctuation. */
function clause(text: string): string {
  const first = text.split(/(?<=[.!?])\s|:\s/)[0].trim().replace(/[.!?:]+$/, "");
  return first.charAt(0).toLowerCase() + first.slice(1);
}

/** The single strongest measured dimension, as a credit clause with its number. */
function strengthClause(m: ImageSignalMetrics, seed: number): string | null {
  const bgControl = 100 - m.backgroundComplexityEstimate;
  type Dim = { v: number; lines: string[] };
  const dims: Dim[] = [
    {
      v: m.lightingScore,
      lines: [
        `your lighting is doing the heavy lifting (${m.lightingScore}/100) — it's clean and it reads as intentional`,
        `the light is genuinely working for you here (${m.lightingScore}/100), which is the hardest thing to get right`,
      ],
    },
    {
      v: m.clarityScore,
      lines: [
        `the shot is sharp and clean (${m.clarityScore}/100 clarity) — every detail is readable`,
        `clarity is a real strength (${m.clarityScore}/100); nothing is soft or lost`,
      ],
    },
    {
      v: m.compositionScore,
      lines: [
        `your framing is balanced and deliberate (${m.compositionScore}/100 composition)`,
        `the composition holds together well (${m.compositionScore}/100) — you're placed with intent`,
      ],
    },
    {
      v: bgControl,
      lines: [
        `your background stays out of the way (${bgControl}/100 control), so all the attention lands on you`,
        `the background is clean and controlled (${bgControl}/100) — it supports you instead of competing`,
      ],
    },
    {
      v: m.skinRegion.evenness,
      lines: [
        `your skin reads clear and even (${m.skinRegion.evenness}/100) — that's a genuine asset`,
        `skin tone is even and healthy-looking (${m.skinRegion.evenness}/100), which most photos struggle with`,
      ],
    },
    {
      v: m.hairRegion.neatnessScore,
      lines: [
        `your hair is tidy and intentional (${m.hairRegion.neatnessScore}/100) — it frames the face instead of fighting it`,
        `hair reads neat and put-together (${m.hairRegion.neatnessScore}/100)`,
      ],
    },
  ];

  // Expression, when we measured a face, can be the standout.
  const p = m.presenceDetail;
  if (p && p.genuineSmile && p.smile >= 45) {
    dims.push({
      v: 70 + Math.min(20, p.smile - 45),
      lines: [
        `your expression is the standout — a genuine, eyes-engaged smile that most photos fake and miss`,
        `the smile actually reaches your eyes here, which is the single warmest signal a photo can send`,
      ],
    });
  }

  const best = dims.sort((a, b) => b.v - a.v)[0];
  if (!best || best.v < 62) return null;
  return seededPick(best.lines, seed, 11);
}

/**
 * The free-report one-liner — the single most-seen line in the product and the
 * hook that decides whether someone pays ₹21. The old version was a canned
 * score-band string. This one is measured and personal: it frames the score,
 * gives credit for the real strongest signal, and names the biggest leak (with
 * its measured evidence) — an honest tension that motivates the full unlock
 * without giving away the fix (that's what the report is for). One tight line.
 */
export function composeTeaserVerdict(
  score: number,
  strongestSignals: string[],
  topLeak?: StatusLeak,
): string {
  const seed = score;
  const strengthRaw = strongestSignals.find((s) => s && !s.toLowerCase().startsWith("potential"));
  const strength = strengthRaw ? strengthRaw.toLowerCase().replace("color", "colour") : null;

  const frame = score >= 78 ? "Strong photo" : score >= 62 ? `Solid — you're at ${score}` : score >= 45 ? `You're at ${score}` : `Honest baseline at ${score}`;

  // Name the biggest leak with its measured evidence, but not the fix.
  let leakClause = "";
  if (topLeak) {
    const ev = topLeak.evidence ? ` (${topLeak.evidence.toLowerCase()})` : "";
    const t = topLeak.title.charAt(0).toLowerCase() + topLeak.title.slice(1);
    leakClause = `${t}${ev}`;
  }

  if (strength && leakClause) {
    return seededPick([
      `${frame}. Your ${strength} is genuinely working — the one thing holding it back is ${leakClause}.`,
      `${frame}. ${strength.charAt(0).toUpperCase() + strength.slice(1)} is a real strength here; your biggest leak is ${leakClause}.`,
    ], seed, 0);
  }
  if (leakClause) {
    return seededPick([
      `${frame}. The biggest thing costing you: ${leakClause}.`,
      `${frame}, and the clearest fix is ${leakClause}.`,
    ], seed, 0);
  }
  if (strength) {
    return `${frame} — your ${strength} is carrying it, and you're close to your ceiling.`;
  }
  return `${frame}. The full breakdown shows exactly where the points are hiding.`;
}

export function composeVerdict({ score, category, metrics, topLeak, ceiling, seed }: VerdictInputs): string {
  const gain = Math.max(0, ceiling - score);

  // ── 1. Honest frame, by band ──
  const frame =
    score >= 78
      ? seededPick([
          `At ${score}, this is already a top-tier photo — the kind most people never quite land.`,
          `Scoring ${score} puts you in rare air; this photo is doing almost everything right.`,
        ], seed, 1)
      : score >= 62
        ? seededPick([
            `At ${score}, this is a genuinely good photo with a couple of clear things holding it back from great.`,
            `You're at ${score} — a strong shot that's closer to excellent than it feels.`,
          ], seed, 1)
        : score >= 45
          ? seededPick([
              `At ${score}, the foundation is here, but the photo isn't yet doing you justice.`,
              `A score of ${score} means the raw material is good — it's the presentation that's leaking points.`,
            ], seed, 1)
          : seededPick([
              `At ${score}, this is an honest baseline — and the good news is your biggest wins from here cost nothing.`,
              `${score} is where you're starting, not where you'll land; the fixes that matter most are free.`,
            ], seed, 1);

  // ── 2. Credit — name the strongest measured signal ──
  const strength = strengthClause(metrics, seed);
  const creditSentence = strength
    ? `${strength.charAt(0).toUpperCase() + strength.slice(1)}.`
    : seededPick([
        "No single signal is carrying this yet — which is actually the opportunity, because every fix moves the needle.",
        "Nothing here is standing out as a strength yet, so almost anything you improve will show up in the score.",
      ], seed, 2);

  // ── 3. The cost — name the biggest leak specifically ──
  let costSentence = "";
  if (topLeak) {
    const worth = topLeak.impactScore >= 12 ? ` — worth roughly ${topLeak.impactScore} points on its own` : "";
    costSentence = seededPick([
      `What's costing you most: ${clause(topLeak.title)}${worth}.`,
      `The one thing dragging the score down: ${clause(topLeak.title)}${worth}.`,
      `Your biggest leak right now: ${clause(topLeak.title)}${worth}.`,
    ], seed, 3);
  }

  // ── 4. Ceiling + the one move ──
  let closeSentence = "";
  if (topLeak && gain > 0) {
    closeSentence = seededPick([
      `Fix that and your measured ceiling is ${ceiling} (+${gain}). Start here: ${clause(topLeak.fix)}.`,
      `Close that gap and this photo tops out around ${ceiling} — a real ${gain}-point jump. First move: ${clause(topLeak.fix)}.`,
    ], seed, 4);
  } else if (gain > 0) {
    closeSentence = seededPick([
      `Your measured ceiling is ${ceiling} — that's ${gain} points still on the table.`,
      `There's a clear ${gain} points between here and your ceiling of ${ceiling}.`,
    ], seed, 4);
  } else {
    closeSentence = seededPick([
      "You're sitting right at your measured ceiling — from here it's about consistency, not fixes.",
      "There's almost no gap left to close; the job now is repeating this, not rebuilding it.",
    ], seed, 4);
  }

  return [frame, creditSentence, costSentence, closeSentence].filter(Boolean).join(" ");
}
