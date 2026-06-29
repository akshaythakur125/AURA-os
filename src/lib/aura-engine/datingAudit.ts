import type { Audit, BioAnalysis, PromptAnalysis, RedFlag, SuggestedBio, DatingProfileReport } from "@/types/audit";

const NEGATIVE_WORDS = ["hate", "boring", "sucks", "awful", "terrible", "worst", "ugly", "dull", "lame", "cringe", "dead", "hopeless", "lonely", "alone", "nobody", "nothing"];
const CLICHE_PHRASES = ["i love to travel", "i love food", "looking for my partner in crime", "fluent in sarcasm", "dog mom", "dog dad", "live laugh love", "adventure seeker", "coffee addict", "netflix and chill", "go with the flow", "i like to have fun", "just ask", "i enjoy long walks", "work hard play hard", "living my best life", "not sure what to put here", "i like to laugh"];
const LOW_EFFORT_PATTERNS = [/^\.+$/, /^……+$/, /^whats up/i, /^hey$/i, /^idk/i, /^\s*$/, /^$/, /^hi$/i, /^hello$/i, /^just (here|looking|browsing)/i];
const AGGRESSIVE_WORDS = ["swipe left if", "don't waste my time", "if you can't handle me", "no drama", "you should be", "must have", "require", "demand"];
const DESPERATE_SIGNS = ["anyone interested", "please like me", "i need", "desperate", "i'll take anyone", "low standards", "begging", "any girl", "any guy"];

function analyzeBio(bio: string): BioAnalysis {
  const cleaned = bio.trim();
  const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
  const charCount = cleaned.length;

  const length: BioAnalysis["length"] = charCount < 30 ? "too_short" : charCount > 500 ? "too_long" : "good";
  const effort: BioAnalysis["effort"] = charCount < 50 ? "low" : charCount > 150 ? "high" : "medium";

  const toneWords: string[] = [];
  if (/fun|love|happ|excite|adventure|explore/i.test(cleaned)) toneWords.push("positive");
  if (/ambiti|driven|work|career|passion|goal/i.test(cleaned)) toneWords.push("ambitious");
  if (/chill|relax|casual|easy|simple|laid.back/i.test(cleaned)) toneWords.push("casual");
  if (/funny|humor|joke|wit|sarcasm|laugh/i.test(cleaned)) toneWords.push("humorous");
  if (/deep|meaning|think|philosoph|soul|mind|connect/i.test(cleaned)) toneWords.push("thoughtful");
  const tone = toneWords.length > 0 ? toneWords.join(", ") : "neutral / unclear";

  const hooksReader = /you|we|let's|together|someone who|looking for|if you|a guy who|a girl who/i.test(cleaned);
  const showsPersonality = charCount > 60 && /i (love|enjoy|like|am|do|play|read|watch|create|make|code|cook|draw)/i.test(cleaned);

  let feedback = "";
  if (charCount < 30) feedback = "Your bio is very short, which can read as low effort. Adding a sentence about your interests or what you are looking for helps.";
  else if (charCount > 500) feedback = "Your bio is quite long. Consider trimming it to keep the most interesting parts — shorter bios get read more often.";
  else if (!hooksReader) feedback = "Your bio describes you but does not invite engagement. Try adding a question or a 'we' statement to start conversations.";
  else if (!showsPersonality) feedback = "Your bio covers the basics but could use a specific detail that shows your personality — a hobby, a quirk, or a specific interest.";
  else feedback = "Your bio has good structure. To make it stronger, consider adding one specific conversation starter.";

  return { length, effort, tone, hooksReader, showsPersonality, feedback };
}

function analyzePrompts(prompts: { prompt: string; answer: string }[]): PromptAnalysis[] {
  return prompts.map((p) => {
    const answerLength = p.answer.trim().length;
    let quality: PromptAnalysis["quality"] = "average";
    let feedback = "";
    let suggestedImprovement = "";

    if (answerLength < 15) {
      quality = "weak";
      feedback = "This answer is too short to make an impression.";
      suggestedImprovement = `Add a specific detail about "${p.prompt.replace(/^(i am|my|what|the|a|an)/i, "").trim()}" — something unique to you.`;
    } else if (answerLength > 200) {
      quality = "average";
      feedback = "This answer is quite detailed. Consider making it punchier.";
      suggestedImprovement = `Shorten to 1-2 sentences. Keep the most interesting part.`;
    } else if (/interesting|fun|nice|good|okay|fine/i.test(p.answer) && answerLength < 40) {
      quality = "weak";
      feedback = "This answer feels generic. Specific details make prompts memorable.";
      suggestedImprovement = "Replace generic words with a specific example or story.";
    } else if (CLICHE_PHRASES.some((c) => p.answer.toLowerCase().includes(c))) {
      quality = "average";
      feedback = "This answer uses a common phrase that appears in many profiles.";
      suggestedImprovement = "Put a unique spin on this — instead of the cliché, say something specific about your version of it.";
    } else if (answerLength >= 30 && answerLength <= 150) {
      quality = "good";
      feedback = "Solid answer. It has enough detail to be interesting.";
      suggestedImprovement = "Consider adding a playful or unexpected detail to make it stand out more.";
    }

    if (answerLength >= 50 && quality === "average") {
      quality = "good";
      feedback = "Good effort on this answer. It shows you put thought into it.";
      suggestedImprovement = "Try adding one very specific detail (a place, a memory, a preference) for a personal touch.";
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

function generateSuggestedBios(audit: Audit): SuggestedBio[] {
  const d = audit.deepInput;
  const style = d?.styleIntent || "clean";
  const goal = audit.goal;

  const versions: { version: string; text: string; whyItWorks: string }[] = [];

  if (goal === "dating" || goal === "instagram") {
    versions.push({
      version: "The Balanced",
      text: "I spend most of my time between work, the gym, and finding the best coffee spots in town. Looking for someone who is down for a Sunday market visit or a random road trip. If you can suggest a better playlist than mine, we are already off to a good start.",
      whyItWorks: "It shows routine + hobbies + a conversation starter (playlist challenge). Balanced effort without oversharing.",
    });
    versions.push({
      version: "The Specific Hook",
      text: "I am a [your profession] by day and a [your hobby] enthusiast by night. Currently trying to perfect my mom's biryani recipe and learning guitar. Tell me your favorite song to play on a road trip — I will add it to my playlist.",
      whyItWorks: "Shows personality, ambition, and ends with a question that invites reply. Specificity signals confidence.",
    });
    if (d?.selfRatedConfidence === "high" || style === "bold") {
      versions.push({
        version: "The Direct",
        text: "I know what I bring to the table. Looking for someone who has their own menu. Let's skip the small talk and grab a coffee this week. Bonus points if you can beat me at chess or foosball.",
        whyItWorks: "Direct and confident without being aggressive. It sets expectations and filters for confident matches.",
      });
    } else {
      versions.push({
        version: "The Casual Opener",
        text: "Pretty simple — I enjoy good food, great conversations, and exploring new places. Recently got into pottery (my first vase looked like a potato, but it is the thought that counts). Send me your best travel story if you want to skip the boring intro.",
        whyItWorks: "Honest and self-deprecating in a charming way. The pottery detail is memorable and the last line invites a response.",
      });
    }
  } else {
    versions.push({
      version: "The Professional",
      text: "Professional working in [industry] with a passion for [interest]. I value genuine connections, good conversations, and people who are intentional about where they are headed. Looking for someone with a spark.",
      whyItWorks: "Professional but warm, suitable for office or college contexts.",
    });
    versions.push({
      version: "The Simple Approach",
      text: "Down-to-earth person who values honesty and good vibes. When I'm not working/studying, you will find me exploring new restaurants or catching up on [show/book genre]. Let's start with coffee and see where it goes.",
      whyItWorks: "Low-pressure and approachable. It sets realistic expectations while showing personality.",
    });
  }

  return versions;
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

export function generateDatingProfileReport(audit: Audit): DatingProfileReport {
  const texts = audit.profileTexts;
  const bio = texts?.bio || "";
  const prompts = texts?.prompts || [];

  const allTexts = [bio, ...prompts.map((p) => p.answer), texts?.captions || ""].filter(Boolean);

  const bioAnalysis = analyzeBio(bio);
  const promptAnalysis = analyzePrompts(prompts);
  const redFlags = detectRedFlags(allTexts);
  const suggestedBios = generateSuggestedBios(audit);
  const textScore = calculateTextScore(bio, prompts, redFlags);

  let overallAdvice = "";
  if (textScore < 35) {
    overallAdvice = "Your profile text needs significant improvement. Start by expanding your bio to at least 2-3 sentences, remove any negative language, and add a specific detail about your interests. Even small changes will improve how your profile is perceived.";
  } else if (textScore < 55) {
    overallAdvice = "Your profile has some good elements but also several areas that can be improved. Focus on adding a conversation hook, removing clichés, and making your prompts more specific. The suggested bios below can give you a strong starting point.";
  } else if (textScore < 75) {
    overallAdvice = "You have a solid profile text foundation. To take it to the next level, refine your prompts with more specific details and ensure your bio has a clear conversation starter. Authenticity is your strongest asset here.";
  } else {
    overallAdvice = "Your profile text is already strong. Small tweaks to prompt answers and ensuring every line adds value will push it to excellent. Keep being specific and authentic — that is what connects best.";
  }

  return {
    textScore,
    bioAnalysis,
    promptAnalysis,
    redFlags,
    suggestedBios,
    overallAdvice,
    generatedAt: new Date().toISOString(),
  };
}
