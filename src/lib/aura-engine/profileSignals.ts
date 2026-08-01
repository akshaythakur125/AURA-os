/**
 * Deterministic signal extraction from a dating profile's own text.
 *
 * The whole point: stop handing everyone the same "[your profession] by day,
 * biryani by night" template. If someone wrote "gym rat, learning guitar,
 * Bangalore" we should echo *those* words back — that's what makes a suggestion
 * feel written for them instead of scraped off a listicle. No API, no model —
 * just a well-tuned lexicon over their real input, so it works on the free scan
 * and stays instant.
 */

export interface ProfileSignals {
  /** Natural-language interest phrases we can drop straight into a bio ("the gym", "live music"). */
  interests: string[];
  /** A profession/study hint if we can find one ("a designer", "in med school"). */
  profession?: string;
  /** An Indian city if named — grounds a bio in a real place. */
  city?: string;
  /** Foods/cuisines they mentioned — the single most reply-baiting detail on Indian dating apps. */
  foods: string[];
  /** Pets — dog/cat people convert; worth surfacing. */
  pet?: "dog" | "cat";
  /** Tone words we detected (positive, ambitious, humorous, thoughtful, casual). */
  tone: string[];
  /** How much raw material we actually have — drives whether we personalise or coach. */
  richness: "empty" | "thin" | "workable" | "rich";
}

type Lex = { re: RegExp; label: string; opener?: string };

// Interests worth echoing back. Order matters only for stable output.
const INTERESTS: Lex[] = [
  { re: /\b(gym|lifting|weights|workout|deadlift|calisthenic|fitness freak|gym rat)\b/i, label: "the gym", opener: "trade your go-to pre-workout song" },
  { re: /\b(running|marathon|jogging|5k|10k)\b/i, label: "running", opener: "recommend a route worth waking up for" },
  { re: /\b(guitar|piano|drums|singing|producing|music production|band)\b/i, label: "playing music", opener: "name one song I have to learn" },
  { re: /\b(live music|concert|gig|indie|lo-?fi|hip-?hop|edm|classical|playlist)\b/i, label: "live music", opener: "send me the last song you had on repeat" },
  { re: /\b(coffee|espresso|latte|cafe hop|third wave|filter kaapi)\b/i, label: "chasing good coffee", opener: "settle the best café in town for me" },
  { re: /\b(cooking|baking|home chef|masterchef|i cook|i bake)\b/i, label: "cooking", opener: "tell me a dish worth stealing" },
  { re: /\b(travel|trip|backpack|wanderlust|road ?trip|trek|hik)\b/i, label: "road trips", opener: "pitch me your next weekend escape" },
  { re: /\b(read|reading|books?|novel|kindle|bookstore)\b/i, label: "reading", opener: "give me one book that stuck with you" },
  { re: /\b(gaming|gamer|valorant|bgmi|cod|fifa|playstation|xbox|pc build)\b/i, label: "gaming", opener: "1v1 me, loser buys coffee" },
  { re: /\b(anime|manga|one piece|naruto|studio ghibli|weeb)\b/i, label: "anime", opener: "what should I watch next" },
  { re: /\b(photography|photograph|shooting|street photo|film camera|dslr)\b/i, label: "photography", opener: "let's shoot somewhere new" },
  { re: /\b(painting|sketch|drawing|art|pottery|ceramics|design)\b/i, label: "making things", opener: "swap our worst first attempts" },
  { re: /\b(cricket|football|soccer|basketball|badminton|tennis|fc barcelona|manchester|rcb|csk)\b/i, label: "sport", opener: "who's your team" },
  { re: /\b(dancing|dance|salsa|hip-?hop dance|zumba)\b/i, label: "dancing", opener: "teach me one move" },
  { re: /\b(startup|founder|building|side project|entrepreneur|indie hacker)\b/i, label: "building things", opener: "trade the story for a coffee rec" },
  { re: /\b(dogs?|puppy|puppies)\b/i, label: "dogs", opener: "show me a photo of yours" },
  { re: /\b(cats?|kitten)\b/i, label: "cats", opener: "settle it: cats or chaos" },
  { re: /\b(movies?|cinema|film|nolan|tarantino|marvel|letterboxd)\b/i, label: "films", opener: "give me one film to fix my watchlist" },
  { re: /\b(foodie|street food|biryani|dosa|momos|pizza|sushi|ramen|chai|butter chicken)\b/i, label: "food", opener: "argue for your favourite comfort food" },
];

const FOODS: { re: RegExp; label: string }[] = [
  { re: /\bbiryani\b/i, label: "biryani" },
  { re: /\bbutter chicken\b/i, label: "butter chicken" },
  { re: /\bdosa\b/i, label: "dosa" },
  { re: /\bmomos?\b/i, label: "momos" },
  { re: /\bramen\b/i, label: "ramen" },
  { re: /\bsushi\b/i, label: "sushi" },
  { re: /\bpizza\b/i, label: "pizza" },
  { re: /\bchai\b/i, label: "chai" },
  { re: /\bstreet food\b/i, label: "street food" },
];

const PROFESSIONS: { re: RegExp; label: string }[] = [
  { re: /\b(software|developer|programmer|coder|swe|full[- ]?stack|backend|frontend)\b/i, label: "a developer" },
  { re: /\b(designer|ux|ui|graphic design|product design)\b/i, label: "a designer" },
  { re: /\b(doctor|mbbs|surgeon|med student|med school|medico|resident)\b/i, label: "in medicine" },
  { re: /\b(engineer|engineering|iit|nit|b\.?tech|mechanical|civil|electrical)\b/i, label: "an engineer" },
  { re: /\b(founder|ceo|co-?founder|entrepreneur)\b/i, label: "a founder" },
  { re: /\b(lawyer|law student|advocate|llb)\b/i, label: "in law" },
  { re: /\b(ca\b|chartered accountant|finance|analyst|investment|consultant)\b/i, label: "in finance" },
  { re: /\b(teacher|professor|lecturer|educator)\b/i, label: "a teacher" },
  { re: /\b(marketing|marketer|brand manager|growth)\b/i, label: "in marketing" },
  { re: /\b(student|college|university|undergrad|final year|studying)\b/i, label: "a student" },
  { re: /\b(artist|musician|writer|creator|content)\b/i, label: "a creative" },
];

const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Bengaluru", "Hyderabad", "Chennai", "Kolkata",
  "Pune", "Ahmedabad", "Jaipur", "Chandigarh", "Kochi", "Goa", "Lucknow", "Indore",
  "Gurgaon", "Gurugram", "Noida", "Surat", "Nagpur", "Bhopal",
];

function detectTone(text: string): string[] {
  const t: string[] = [];
  if (/fun|love|happ|excite|adventure|explore|enjoy/i.test(text)) t.push("positive");
  if (/ambiti|driven|work|career|passion|goal|build|grind/i.test(text)) t.push("ambitious");
  if (/chill|relax|casual|easy|simple|laid.?back|go with the flow/i.test(text)) t.push("casual");
  if (/funny|humor|joke|wit|sarcasm|laugh|meme/i.test(text)) t.push("humorous");
  if (/deep|meaning|think|philosoph|soul|mind|connect|intentional/i.test(text)) t.push("thoughtful");
  return t;
}

function uniq<T>(a: T[]): T[] {
  return Array.from(new Set(a));
}

/** Pull every echo-back-able detail out of the user's own profile text. */
export function extractProfileSignals(texts: string[]): ProfileSignals {
  const blob = texts.filter(Boolean).join(" \n ");
  const cleaned = blob.trim();

  const interests = uniq(INTERESTS.filter((l) => l.re.test(cleaned)).map((l) => l.label));
  const foods = uniq(FOODS.filter((f) => f.re.test(cleaned)).map((f) => f.label));
  const profession = PROFESSIONS.find((p) => p.re.test(cleaned))?.label;
  const city = CITIES.find((c) => new RegExp(`\\b${c}\\b`, "i").test(cleaned));
  const pet: ProfileSignals["pet"] | undefined = /\bdogs?|puppy|puppies\b/i.test(cleaned)
    ? "dog"
    : /\bcats?|kitten\b/i.test(cleaned)
      ? "cat"
      : undefined;
  const tone = detectTone(cleaned);

  const signalCount = interests.length + foods.length + (profession ? 1 : 0) + (city ? 1 : 0) + (pet ? 1 : 0);
  const len = cleaned.length;
  const richness: ProfileSignals["richness"] =
    len < 15 ? "empty" : signalCount === 0 ? "thin" : signalCount <= 2 ? "workable" : "rich";

  return {
    interests,
    profession,
    city: city ? (city === "Bengaluru" ? "Bangalore" : city === "Gurugram" ? "Gurgaon" : city) : undefined,
    foods,
    pet,
    tone,
    richness,
  };
}

/** The single strongest reply-hook, ready to drop at the end of a bio. */
export function topBioHook(signals: ProfileSignals): string | undefined {
  const match = INTERESTS.find((l) => l.opener && signals.interests.includes(l.label));
  if (!match?.opener) return undefined;
  const s = match.opener;
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
}

/** Join phrases into natural English: "a, b, and c". */
export function phraseList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

/** Opener suggestions grounded in what they actually mentioned (best first). */
export function openersFromSignals(signals: ProfileSignals): string[] {
  const out: string[] = [];
  for (const l of INTERESTS) {
    if (l.opener && signals.interests.includes(l.label)) {
      out.push(`You mentioned ${l.label} — end a prompt with "${l.opener}". A hook they can answer in one line gets far more replies than a blank like.`);
    }
    if (out.length >= 3) break;
  }
  return out;
}
