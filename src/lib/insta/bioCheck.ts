/**
 * Instagram bio check — the copy half of the profile. A visitor reads the grid
 * AND the bio in the same two seconds; a strong grid with a dead bio still
 * loses the follow. Scores an IG bio on the things that actually convert a
 * browser into a follower: a clear "what you post" line, a call-to-action, the
 * right length, visual anchors, and no filler. Pure and deterministic — no key.
 */

export interface BioNote {
  ok: boolean;
  text: string;
}

export interface BioCheckResult {
  score: number; // 0–100
  label: string;
  notes: BioNote[];
  rewriteHint: string;
}

const IG_CLICHES = [
  "living my best life", "just vibes", "god's plan", "blessed", "professional overthinker",
  "fluent in sarcasm", "here for a good time", "making memories", "adventure awaits",
  "stay tuned", "dreamer", "wanderlust", "just a girl", "just a guy", "简单", "coffee lover",
];
// Words that signal the account actually tells you what it posts.
const NICHE_HINTS = /photograph|fitness|gym|food|recipe|travel|design|meme|fashion|style|art|tech|coding|music|film|book|fit|makeup|skincare|dance|poetry|startup|finance|study|daily|posting|sharing|i post|i share|creator of/i;
const CTA = /link (in bio|below)|👇|⬇|dm( me)?\b|follow for|shop|check out|new (video|post|drop)|http|\.com|swipe/i;
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

export function checkInstaBio(raw: string): BioCheckResult {
  const bio = raw.trim();
  const len = bio.length;
  const notes: BioNote[] = [];
  let score = 60;

  // Length — IG caps at 150 visible characters.
  if (len === 0) {
    return {
      score: 20,
      label: "Empty — you're leaving the easiest points on the table",
      notes: [{ ok: false, text: "Your bio is blank. It's prime real estate right under your name — a visitor's eye goes straight to it. Even one good line lifts follows." }],
      rewriteHint: "Line 1: who you are + what you post. Line 2: a personality or proof detail. Line 3: a call-to-action (follow for X · link below 👇).",
    };
  }
  if (len < 15) { score -= 16; notes.push({ ok: false, text: `"${bio}" is too short to tell anyone why to follow. Add what you post and a reason to stick around.` }); }
  else if (len > 150) { score -= 10; notes.push({ ok: false, text: `You're over Instagram's ~150-character limit — the tail gets cut off with "…more". Trim to the essentials so the whole thing shows.` }); }
  else if (len >= 40) { score += 8; notes.push({ ok: true, text: "Good length — enough to say something, short enough to read at a glance." }); }

  // What you post — the single biggest follow driver.
  if (NICHE_HINTS.test(bio)) { score += 12; notes.push({ ok: true, text: "You say what you post — that's exactly what turns a browser into a follower." }); }
  else { score -= 6; notes.push({ ok: false, text: "It's not clear what you actually post. One line — 'daily [your thing]' — converts far better than adjectives about yourself." }); }

  // Call-to-action.
  if (CTA.test(bio)) { score += 8; notes.push({ ok: true, text: "Clear call-to-action — you tell visitors what to do next." }); }
  else { notes.push({ ok: false, text: "No call-to-action. Add one line telling people what to do next — 'follow for [X]' or 'link below 👇'." }); }

  // Visual anchors.
  if (EMOJI.test(bio)) { score += 5; notes.push({ ok: true, text: "Emoji give the eye anchors and break the text up — good." }); }
  else { notes.push({ ok: false, text: "Add 1–3 emoji as visual anchors — bios with them read faster and feel more alive." }); }

  // Clichés.
  const cliche = IG_CLICHES.find((c) => bio.toLowerCase().includes(c));
  if (cliche) { score -= 8; notes.push({ ok: false, text: `"${cliche}" shows up in countless bios — swap it for something only you would say.` }); }

  const clamp = (v: number) => (v < 15 ? 15 : v > 100 ? 100 : Math.round(v));
  const s = clamp(score);
  const label = s >= 78 ? "Strong — it earns the follow" : s >= 58 ? "Decent — a few tweaks from great" : "Weak — it's costing you followers";

  return {
    score: s,
    label,
    notes,
    rewriteHint: "Line 1: who you are + what you post. Line 2: a personality or proof detail. Line 3: a call-to-action (follow for X · link below 👇).",
  };
}
