import type { Audit, BioAnalysis, PromptAnalysis, RedFlag, SuggestedBio, DatingProfileReport, PhotoStrategy, PlatformTip } from "@/types/audit";
import { extractProfileSignals, openersFromSignals, topBioHook, phraseList, type ProfileSignals } from "./profileSignals";

/**
 * Photo strategy — the highest-leverage part of any dating profile, and the one
 * most people get wrong. Expert best-practice, lightly personalised from the
 * free scan's measured signals when a photo is present.
 */
function analyzePhotoStrategy(audit: Audit): PhotoStrategy {
  const m = audit.fullReport?.freeResult?.imageMetrics as
    | { lightingScore?: number; clarityScore?: number; scores?: { expression?: number; background?: number } }
    | undefined;
  const weakLight = typeof m?.lightingScore === "number" && m.lightingScore < 50;
  const weakClarity = typeof m?.clarityScore === "number" && m.clarityScore < 45;
  const strongExpression = (m?.scores?.expression ?? 0) >= 62;

  const leadPhoto = strongExpression
    ? "Lead with a clear, well-lit solo photo where your eyes are visible and you're giving a genuine smile — your scan shows expression is your strongest asset, so open on it."
    : "Lead with a bright, front-facing solo shot from the chest up: eyes visible, soft natural light, clean background, a real (not forced) smile. This is the half-second decision photo — everything else only gets seen if this one lands.";

  const sequence: { slot: string; show: string }[] = [
    { slot: "1 · The hook", show: "Sharp solo headshot, natural light, genuine expression. No sunglasses, no group, no filter." },
    { slot: "2 · Full body", show: "A full-length shot in a fitted outfit so your build reads honestly — this quietly builds trust." },
    { slot: "3 · Social proof", show: "You with one or two others (not a crowd you disappear into) — signals you have a life and friends." },
    { slot: "4 · A passion", show: "Mid-activity: gym, guitar, hiking, cooking, travel. This is the photo people actually message you about." },
    { slot: "5 · Warmth", show: "A candid with real emotion — laughing, relaxed. End the set on likeability, not another posed shot." },
  ];

  const avoid: string[] = [
    "A group photo as photo #1 — matches can't tell which one is you and just swipe on.",
    "Sunglasses or a cap in every shot — hiding your eyes reads as hiding something.",
    weakLight
      ? "Dark or yellow indoor lighting — your scan flagged weak lighting, and it looks even worse shrunk to a profile card."
      : "Heavy filters or beauty-smoothing — they read as 'catfish' and kill trust instantly.",
    weakClarity
      ? "Soft / blurry shots — your scan flagged low sharpness; wipe the lens and use the rear camera."
      : "Mirror selfies with a cluttered background — they undercut every other signal you're sending.",
    "Only stiff, posed photos — at least one genuine candid is what makes you look human and dateable.",
  ];

  return { leadPhoto, sequence, avoid };
}

/** Platform-specific tactics — the same profile should be played differently. */
function platformPlaybook(): PlatformTip[] {
  return [
    { platform: "Hinge", tip: "Hinge is prompt-first — answers do the work, not the bio. Make prompts specific and story-shaped, and leave one obvious 'reply here' hook. A like on a specific prompt (with a comment) converts far better than a blank like." },
    { platform: "Bumble", tip: "Women message first, so make replying effortless: one clear mid-activity photo plus one prompt that ends in a natural question-back. Keep the bio short and warm — a vibe, not a CV." },
    { platform: "Tinder", tip: "Tinder is photo-first and brutally fast — your lead photo is ~80% of the outcome. Keep the bio to one or two punchy lines with a single hook; nobody reads paragraphs mid-swipe." },
  ];
}

/**
 * Opening hooks — lead with lines grounded in what they actually wrote, then
 * top up with strong generics so there are always at least three.
 */
function generateOpeningHooks(signals: ProfileSignals): string[] {
  const grounded = openersFromSignals(signals);
  const generic = [
    "End your bio with a low-stakes question they can answer in five words — e.g. 'Settle a debate: is cereal a soup?'",
    "Drop one oddly specific detail ('I make the third-best butter chicken in my building') — specifics get replies, generic 'I love food' gets ignored.",
    "Give them a fill-in-the-blank: 'The way to my heart is ____ (wrong answers encouraged)' — it's almost impossible not to reply to.",
  ];
  if (signals.tone.includes("humorous")) generic.push("Lean into your humour with a bit: 'Two truths and a lie — I've met a celebrity, I can do a backflip, I reply within a day.'");
  if (signals.tone.includes("ambitious")) generic.push("Turn ambition into a hook, not a flex: 'Building something cool — will trade the story for a good coffee rec.'");
  if (signals.tone.includes("thoughtful")) generic.push("Invite a real answer: 'Best thing you've read/watched lately? I'm collecting recommendations from strangers with taste.'");
  return [...grounded, ...generic].slice(0, 4);
}

const NEGATIVE_WORDS = ["hate", "boring", "sucks", "awful", "terrible", "worst", "ugly", "dull", "lame", "cringe", "dead", "hopeless", "lonely", "alone", "nobody", "nothing"];
const CLICHE_PHRASES = ["i love to travel", "i love food", "looking for my partner in crime", "fluent in sarcasm", "dog mom", "dog dad", "live laugh love", "adventure seeker", "coffee addict", "netflix and chill", "go with the flow", "i like to have fun", "just ask", "i enjoy long walks", "work hard play hard", "living my best life", "not sure what to put here", "i like to laugh"];
const LOW_EFFORT_PATTERNS = [/^\.+$/, /^……+$/, /^whats up/i, /^hey$/i, /^idk/i, /^\s*$/, /^$/, /^hi$/i, /^hello$/i, /^just (here|looking|browsing)/i];
const AGGRESSIVE_WORDS = ["swipe left if", "don't waste my time", "if you can't handle me", "no drama", "you should be", "must have", "require", "demand"];
const DESPERATE_SIGNS = ["anyone interested", "please like me", "i need", "desperate", "i'll take anyone", "low standards", "begging", "any girl", "any guy"];

function analyzeBio(bio: string, signals: ProfileSignals): BioAnalysis {
  const cleaned = bio.trim();
  const charCount = cleaned.length;

  const length: BioAnalysis["length"] = charCount < 30 ? "too_short" : charCount > 500 ? "too_long" : "good";
  const effort: BioAnalysis["effort"] = charCount < 50 ? "low" : charCount > 150 ? "high" : "medium";

  const tone = signals.tone.length > 0 ? signals.tone.join(", ") : "neutral / unclear";

  const hooksReader = /you|we|let's|together|someone who|looking for|if you|a guy who|a girl who|\?/i.test(cleaned);
  // Real, named specifics beat a keyword regex — if we extracted an interest,
  // food, job or city, the bio genuinely shows personality.
  const namedSpecifics = signals.interests.length + signals.foods.length + (signals.profession ? 1 : 0) + (signals.city ? 1 : 0);
  const showsPersonality = charCount > 40 && namedSpecifics > 0;

  // Echo their actual details back so the feedback can't be mistaken for generic.
  const detailList = phraseList([...signals.interests.slice(0, 2), ...signals.foods.slice(0, 1)]);

  let feedback = "";
  if (charCount < 30) {
    feedback = "Your bio is very short, which reads as low effort — matches assume you didn't bother. Add two sentences: one specific thing you're into, and one line that invites a reply.";
  } else if (charCount > 500) {
    feedback = "Your bio is long enough that most people won't finish it. Cut to the two most interesting lines — shorter bios get read all the way through.";
  } else if (!showsPersonality) {
    feedback = "Your bio covers the basics but stays generic — nothing in it is unmistakably you. Name one concrete thing (a hobby, a dish, a place you love), because a specific detail is what a stranger can actually reply to.";
  } else if (!hooksReader) {
    feedback = `Good — you mention ${detailList || "real details"}, so your personality comes through. What's missing is a way in: end on a question or a 'you' line so a match has an obvious reason to message.`;
  } else {
    feedback = `Strong bio — ${detailList ? `${detailList} give it real personality` : "it has personality"} and it invites a reply. Keep every line earning its place and you're in the top tier.`;
  }

  return { length, effort, tone, hooksReader, showsPersonality, feedback };
}

// Vague filler words that carry no information on their own — quoted back at the user.
const VAGUE_WORDS = ["interesting", "fun", "nice", "good", "okay", "fine", "cool", "chill", "amazing", "stuff", "things", "whatever", "anything"];

/** Trim a prompt down to the topic word so we can reference it naturally in advice. */
function promptTopic(prompt: string): string {
  return prompt.replace(/[?.]+$/, "").replace(/^(i am|i'm|my|what|the|a|an|about|is)\b/i, "").trim().toLowerCase() || "this";
}

function analyzePrompts(prompts: { prompt: string; answer: string }[]): PromptAnalysis[] {
  return prompts.map((p) => {
    const answer = p.answer.trim();
    const answerLength = answer.length;
    const topic = promptTopic(p.prompt);
    let quality: PromptAnalysis["quality"] = "average";
    let feedback = "";
    let suggestedImprovement = "";

    const cliche = CLICHE_PHRASES.find((c) => answer.toLowerCase().includes(c));
    const vague = VAGUE_WORDS.find((w) => new RegExp(`\\b${w}\\b`, "i").test(answer));

    if (answerLength < 15) {
      quality = "weak";
      feedback = answerLength === 0 ? "You left this one blank — an empty prompt is a wasted slot." : `"${answer}" is too short to land — it reads as effort you didn't want to spend.`;
      suggestedImprovement = `Answer it with one concrete, true thing about ${topic} — a real example beats a clever half-line.`;
    } else if (cliche) {
      quality = "average";
      feedback = `"${cliche}" shows up in thousands of profiles, so it makes you blend in exactly where you want to stand out.`;
      suggestedImprovement = `Swap "${cliche}" for your specific version of it — the exact trip, the exact dish, the exact show — so it could only be your answer.`;
    } else if (vague && answerLength < 60) {
      quality = "weak";
      feedback = `The word "${vague}" is doing all the work here, and it tells a stranger nothing they can picture or reply to.`;
      suggestedImprovement = `Replace "${vague}" with the actual detail behind it — what specifically about ${topic}? Name it.`;
    } else if (answerLength > 200) {
      quality = "average";
      feedback = "This answer is detailed but long — the best part is probably buried in the middle.";
      suggestedImprovement = "Cut to the single most interesting sentence; a punchy prompt gets read, a paragraph gets skimmed.";
    } else if (answerLength >= 30 && answerLength <= 150) {
      quality = "good";
      feedback = "Solid answer — enough real detail to be interesting.";
      suggestedImprovement = "Add one unexpected or playful beat at the end to turn a good answer into a memorable one.";
    }

    if (answerLength >= 50 && quality === "average" && !cliche) {
      quality = "good";
      feedback = "Good answer — it clearly took some thought.";
      suggestedImprovement = `End on a small hook about ${topic} that a match can react to, so the prompt does some of the messaging for you.`;
    }

    return { prompt: p.prompt, answer: p.answer, quality, feedback, suggestedImprovement };
  });
}

function detectRedFlags(texts: string[]): RedFlag[] {
  const flags: RedFlag[] = [];
  const combined = texts.join(" ").toLowerCase();

  for (const word of NEGATIVE_WORDS) {
    if (new RegExp(`\\b${word}\\b`, "i").test(combined)) {
      const contextMatch = combined.match(new RegExp(`[^.!?]*\\b${word}\\b[^.!?]*[.!?]`, "i"));
      flags.push({
        text: contextMatch ? contextMatch[0].trim() : word,
        type: "negative",
        severity: "high",
        explanation: `The word "${word}" introduces negativity into your profile. Negativity in dating profiles reduces approachability.`,
        fixSuggestion: `Remove or rephrase the sentence containing "${word}". Frame things positively — say what you want instead of what you do not.`,
      });
    }
  }

  for (const phrase of CLICHE_PHRASES) {
    if (combined.includes(phrase)) {
      flags.push({
        text: phrase,
        type: "cliche",
        severity: "medium",
        explanation: `"${phrase}" appears in countless profiles. It does not help you stand out.`,
        fixSuggestion: `Replace "${phrase}" with a specific example. Instead of "I love to travel", say "I am planning a trip to Rajasthan next month".`,
      });
    }
  }

  for (const pattern of LOW_EFFORT_PATTERNS) {
    if (pattern.test(combined)) {
      const match = combined.match(pattern);
      flags.push({
        text: (match ? match[0] : combined.slice(0, 30)).trim(),
        type: "low_effort",
        severity: "high",
        explanation: "This reads as very low effort. Profiles with minimal text get fewer matches and responses.",
        fixSuggestion: "Write at least 2-3 sentences about your interests, what makes you unique, or what you are looking for.",
      });
    }
  }

  for (const word of AGGRESSIVE_WORDS) {
    if (combined.includes(word.toLowerCase())) {
      flags.push({
        text: word,
        type: "aggressive",
        severity: "high",
        explanation: `"${word}" can come across as demanding or negative in a profile context. It may reduce approachability.`,
        fixSuggestion: `Rephrase to focus on what you are looking for, not what you do not want. Instead of "${word}", try a gentle preference.`,
      });
    }
  }

  for (const sign of DESPERATE_SIGNS) {
    if (combined.includes(sign)) {
      flags.push({
        text: sign,
        type: "desperate",
        severity: "high",
        explanation: `"${sign}" signals desperation, which can reduce perceived value in dating contexts.`,
        fixSuggestion: "Remove this phrase entirely. Confidence is attractive — let your profile speak through your interests and personality.",
      });
    }
  }

  return flags.slice(0, 8);
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Bios built from the user's OWN extracted details — their real interests,
 * work, city and go-to food — so the suggestions read as written for them.
 * Falls back to clearly-labelled starter templates only when there's genuinely
 * nothing to work with.
 */
function personalisedBios(signals: ProfileSignals, confident: boolean): SuggestedBio[] {
  const top = signals.interests.slice(0, 3);
  const hook = topBioHook(signals);
  const food = signals.foods[0];
  const place = signals.city;
  const prof = signals.profession;
  const bios: SuggestedBio[] = [];

  // 1 — Tightened & specific: their real details, cleaned into a punchy bio.
  {
    const parts: string[] = [];
    if (prof) parts.push(`${cap(prof)}${place ? `, based in ${place}` : ""}.`);
    else if (place) parts.push(`${place}-based.`);
    if (top.length) parts.push(`Off the clock: ${phraseList(top)}.`);
    if (food) parts.push(`Firm believer that ${food} fixes most bad days.`);
    parts.push(hook || "Tell me the most niche thing you're weirdly passionate about — I'll match it.");
    const drivers = [prof && "your work", top.length > 0 && "your interests", food && "your go-to food"].filter(Boolean).join(", ");
    bios.push({
      version: "Tightened & specific",
      text: parts.join(" ").trim(),
      whyItWorks: `Built from what you actually wrote${drivers ? ` (${drivers})` : ""} — that specificity is what makes a profile read as real instead of copy-pasted, and it ends on a question so a match has an obvious way in.`,
    });
  }

  // 2 — Hook-first: lead with the most distinctive interest, not a résumé line.
  {
    const lead = top[0] || "the stuff I actually care about";
    const parts: string[] = [`Ask me about ${lead} and you won't get me to shut up.`];
    const rest = [top[1], top[2]].filter(Boolean) as string[];
    if (rest.length) parts.push(`Also deep into ${phraseList(rest)}.`);
    if (place) parts.push(`Around ${place}.`);
    parts.push(hook || "Tell me your most niche obsession and I'll raise you mine.");
    bios.push({
      version: "Hook-first",
      text: parts.join(" ").trim(),
      whyItWorks: "Opens on your strongest interest instead of a job title, so the first thing they read is a conversation, not a list — ideal for Hinge prompts and Bumble where a reply has to feel easy.",
    });
  }

  // 3 — tone-matched third option.
  if (confident) {
    bios.push({
      version: "Direct & confident",
      text: `I know what I bring to the table${prof ? ` ${prof}, sorted, low on drama` : ""} — looking for someone just as clear about theirs.${top[0] ? ` Fastest way in: talk to me about ${top[0]}.` : ""} Let's skip the small talk and grab a coffee this week.`,
      whyItWorks: "Direct without being aggressive — it sets expectations and quietly filters for people who match your confidence. Works best when your photos already carry warmth.",
    });
  } else {
    bios.push({
      version: "Warm & self-aware",
      text: `Pretty low-key — big on ${top[0] || "good food and better conversations"}${top[1] ? `, and enthusiastically mediocre at ${top[1]}` : ""}. ${hook || "Send me your best story if you want to skip the boring intro."}`,
      whyItWorks: "Honest and a little self-deprecating, which reads as secure, not insecure. The specific interest makes you memorable and the last line hands them a reason to reply.",
    });
  }

  return bios;
}

/** Clearly-labelled starter bios — only used when the profile text is basically empty. */
function starterBios(goal: string): SuggestedBio[] {
  if (goal === "dating" || goal === "instagram") {
    return [
      {
        version: "Starter — swap the brackets",
        text: "I'm a [your work] with a [your hobby] problem. Currently [something you're into right now]. Tell me [a question about a thing you love] — best answer wins a coffee.",
        whyItWorks: "You haven't given us enough to personalise yet — fill each bracket with one true, specific detail and this becomes yours. Specifics beat adjectives every time.",
      },
      {
        version: "Starter — the one-liner",
        text: "[City]-based, mildly obsessed with [one specific thing]. Warning: I will absolutely send you [a meme / a playlist / a food rec] unprompted.",
        whyItWorks: "Short, punchy, and built around one memorable detail — swap the brackets for your real ones. Great for Tinder where nobody reads paragraphs.",
      },
    ];
  }
  return [
    {
      version: "Starter — swap the brackets",
      text: "[Your work] who cares about [one thing you actually care about]. Off the clock you'll find me [your go-to activity]. Looking for someone I can [do that thing] with.",
      whyItWorks: "Add your real details in place of the brackets — one specific interest does more work than three vague adjectives.",
    },
  ];
}

function generateSuggestedBios(audit: Audit, signals: ProfileSignals): SuggestedBio[] {
  const confident = audit.deepInput?.selfRatedConfidence === "high" || audit.deepInput?.styleIntent === "bold";
  if (signals.richness === "empty" || signals.richness === "thin") {
    return starterBios(audit.goal);
  }
  return personalisedBios(signals, confident);
}

function calculateTextScore(bio: string, prompts: { prompt: string; answer: string }[], redFlags: RedFlag[]): number {
  let score = 65;
  const charCount = bio.trim().length;

  if (charCount < 30) score -= 20;
  else if (charCount < 60) score -= 10;
  else if (charCount > 500) score -= 5;
  else if (charCount > 100) score += 5;
  else if (charCount > 60) score += 3;

  const hasHooks = /you|we|let's|together|someone who/i.test(bio);
  if (hasHooks) score += 8;

  const hasPersonality = /i (love|enjoy|like|am|do|play|read|watch|create|make|code|cook|draw)/i.test(bio);
  if (hasPersonality) score += 7;

  const hasEmoji = /[\u{1F300}-\u{1FAFF}]/u.test(bio);
  if (hasEmoji) score += 3;

  const highSeverityFlags = redFlags.filter((f) => f.severity === "high").length;
  score -= highSeverityFlags * 8;

  const mediumFlags = redFlags.filter((f) => f.severity === "medium").length;
  score -= mediumFlags * 4;

  for (const p of prompts) {
    const len = p.answer.trim().length;
    if (len >= 30) score += 3;
    if (len >= 60) score += 2;
    if (p.answer.trim().length < 15) score -= 5;
  }

  return Math.max(15, Math.min(100, Math.round(score)));
}

/**
 * Overall advice built from the person's ACTUAL diagnosed gaps, in priority
 * order — not a score band. It names their biggest lever first, then the next,
 * and opens by crediting a real strength when there is one, so the summary
 * reads like it was written after reading their profile (because it was).
 */
function buildOverallAdvice(x: {
  signals: ProfileSignals;
  bioAnalysis: BioAnalysis;
  promptAnalysis: PromptAnalysis[];
  redFlags: RedFlag[];
  textScore: number;
  bioLength: number;
}): string {
  const { signals, bioAnalysis, promptAnalysis, redFlags, textScore, bioLength } = x;
  const detail = phraseList([...signals.interests.slice(0, 2), ...signals.foods.slice(0, 1)]);
  const weakPrompts = promptAnalysis.filter((p) => p.quality === "weak").length;
  const highFlags = redFlags.filter((f) => f.severity === "high").length;
  const clicheFlags = redFlags.filter((f) => f.type === "cliche").length;

  // Priority-ordered levers — biggest impact first. We surface the top two.
  const levers: string[] = [];
  if (highFlags > 0) levers.push(`clear the ${highFlags} flagged line${highFlags > 1 ? "s" : ""} above — one negative or low-effort line drags the whole profile down faster than anything else lifts it`);
  if (bioLength < 30) levers.push("write an actual bio — even two specific sentences beat a blank, which reads as 'didn't bother'");
  else if (!bioAnalysis.showsPersonality) levers.push("put one concrete detail in your bio (a hobby, a dish, a place) so a stranger has something real to picture and reply to");
  else if (!bioAnalysis.hooksReader) levers.push("add a reply hook — end your bio on a question or a 'you' line, because a profile people can't answer just gets a silent like at best");
  if (clicheFlags > 0) levers.push(`swap the flagged cliché${clicheFlags > 1 ? "s" : ""} for your specific version — the exact trip or dish, not the category`);
  if (weakPrompts > 0) levers.push(`rewrite the ${weakPrompts} weak prompt answer${weakPrompts > 1 ? "s" : ""} flagged above — a strong prompt often out-pulls the bio itself`);

  const opener = signals.richness === "rich" || signals.richness === "workable"
    ? `You've given us real material to work with${detail ? ` — ${detail} come through` : ""}, so this is about sharpening, not starting over. `
    : textScore >= 60
      ? "The bones are here. "
      : "There's a clear path up from here. ";

  if (levers.length === 0) {
    return `${opener}Your text is genuinely strong — it's specific, it invites a reply, and nothing is dragging it down. From here it's maintenance: make sure every single line earns its place, and refresh a prompt whenever an answer starts to feel stale.`;
  }

  const top = levers.slice(0, 2);
  const body = top.length === 2
    ? `Two things will move the needle most: first, ${top[0]}. Then, ${top[1]}.`
    : `The single highest-leverage move: ${top[0]}.`;
  return `${opener}${body} The suggested bios below already do this with your own details — use them as your starting point.`;
}

export function generateDatingProfileReport(audit: Audit): DatingProfileReport {
  const texts = audit.profileTexts;
  const bio = texts?.bio || "";
  const prompts = texts?.prompts || [];

  const allTexts = [bio, ...prompts.map((p) => p.answer), texts?.captions || ""].filter(Boolean);

  const signals = extractProfileSignals(allTexts);
  const bioAnalysis = analyzeBio(bio, signals);
  const promptAnalysis = analyzePrompts(prompts);
  const redFlags = detectRedFlags(allTexts);
  const suggestedBios = generateSuggestedBios(audit, signals);
  const textScore = calculateTextScore(bio, prompts, redFlags);

  const overallAdvice = buildOverallAdvice({ signals, bioAnalysis, promptAnalysis, redFlags, textScore, bioLength: bio.trim().length });

  return {
    textScore,
    bioAnalysis,
    promptAnalysis,
    redFlags,
    suggestedBios,
    photoStrategy: analyzePhotoStrategy(audit),
    platformTips: platformPlaybook(),
    openingHooks: generateOpeningHooks(signals),
    overallAdvice,
    generatedAt: new Date().toISOString(),
  };
}
