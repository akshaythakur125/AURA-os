/**
 * Celebrity Style Matching — Aspirational look-alike engine.
 *
 * Matches user photos to Indian celebrities based on:
 * - Facial structure (face-api.js landmarks)
 * - Skin tone / undertone
 * - Style signals (outfit, grooming, expression)
 *
 * Then provides "shop the look" product links for each match.
 */

export interface CelebrityProfile {
  name: string;
  title: string; // "Bollywood's Clean-Tailored King"
  photo: string; // placeholder URL or emoji
  style: string;
  tags: string[];
  shopLinks: {
    category: string;
    items: { name: string; price: string; url: string }[];
  }[];
  improvementNote: string; // "Fix X and you'll be 70% there"
}

// Indian celebrity style profiles — curated for aspirational matching
export const CELEBRITY_PROFILES: CelebrityProfile[] = [
  {
    name: "Ranbir Kapoor",
    title: "Bollywood's Effortless Charm",
    photo: "🎭",
    style: "Clean casual with subtle luxury — earth tones, well-fitted basics, minimal accessories",
    tags: ["warm", "casual", "natural", "minimal", "warm-tones", "soft-features"],
    shopLinks: [
      {
        category: "👕 His Style — Earth Tone Basics",
        items: [
          { name: "Linen Shirt (Beige/Olive)", price: "₹899", url: "https://www.myntra.com/gateway/v2/search/query?q=men+linen+shirt+beige" },
          { name: "Slim Fit Chinos", price: "₹1,299", url: "https://www.myntra.com/gateway/v2/search/query?q=men+slim+chinos+brown" },
          { name: "White Sneakers (Clean)", price: "₹1,499", url: "https://www.myntra.com/gateway/v2/search/query?q=men+white+sneakers+minimal" },
        ],
      },
    ],
    improvementNote: "Fix your lighting and you're 60% there. Ranbir's photos always use warm, directional light.",
  },
  {
    name: "Hrithik Roshan",
    title: "The Greek God Standard",
    photo: "💪",
    style: "Sharp, athletic, high-contrast — dark colors, structured fits, strong grooming",
    tags: ["sharp", "athletic", "dark", "structured", "groomed", "strong-features"],
    shopLinks: [
      {
        category: "👔 His Style — Sharp & Structured",
        items: [
          { name: "Black Fitted T-Shirt", price: "₹599", url: "https://www.myntra.com/gateway/v2/search/query?q=men+black+fitted+tshirt" },
          { name: "Dark Blazer", price: "₹2,499", url: "https://www.myntra.com/gateway/v2/search/query?q=men+dark+blazer+slim+fit" },
          { name: "Grooming Kit", price: "₹899", url: "https://www.nykaa.com/search/result/?q=grooming+kit+men" },
        ],
      },
    ],
    improvementNote: "Your grooming score is holding you back. Hrithik's look is 70% grooming discipline.",
  },
  {
    name: "Sidharth Malhotra",
    title: "The College Crush",
    photo: "🎓",
    style: "Relaxed but put-together — light layers, denim, approachable warmth",
    tags: ["relaxed", "layered", "denim", "approachable", "young", "light-colors"],
    shopLinks: [
      {
        category: "🧥 His Style — Relaxed Layers",
        items: [
          { name: "Denim Jacket", price: "₹1,499", url: "https://www.myntra.com/gateway/v2/search/query?q=men+denim+jacket+blue" },
          { name: "Crew Neck T-Shirt", price: "₹499", url: "https://www.myntra.com/gateway/v2/search/query?q=men+crew+neck+tshirt+white" },
          { name: "Casual Loafers", price: "₹999", url: "https://www.myntra.com/gateway/v2/search/query?q=men+casual+loafers+brown" },
        ],
      },
    ],
    improvementNote: "Your expression is good — now fix the background. Sid's photos always have clean, simple backgrounds.",
  },
  {
    name: "Vicky Kaushal",
    title: "The Quiet Confidence",
    photo: "🔥",
    style: "Understated power — neutral palette, clean grooming, strong posture",
    tags: ["neutral", "clean", "power", "understated", "groomed", "confident"],
    shopLinks: [
      {
        category: "🎯 His Style — Understated Power",
        items: [
          { name: "Neutral Polo Shirt", price: "₹799", url: "https://www.myntra.com/gateway/v2/search/query?q=men+polo+shirt+neutral" },
          { name: "Tailored Trousers", price: "₹1,299", url: "https://www.myntra.com/gateway/v2/search/query?q=men+tailored+trousers+beige" },
          { name: "Minimal Watch", price: "₹1,299", url: "https://www.myntra.com/gateway/v2/search/query?q=men+minimal+watch+leather" },
        ],
      },
    ],
    improvementNote: "Your outfit is generic. Vicky's look is about choosing ONE clean piece and owning it.",
  },
  {
    name: "Aditya Roy Kapur",
    title: "The Brooding Romantic",
    photo: "🌙",
    style: "Dark, moody, artistic — black/charcoal, textured fabrics, emotional expression",
    tags: ["dark", "moody", "artistic", "textured", "emotional", "romantic"],
    shopLinks: [
      {
        category: "🖤 His Style — Dark & Moody",
        items: [
          { name: "Black Henley Shirt", price: "₹699", url: "https://www.myntra.com/gateway/v2/search/query?q=men+black+henley+shirt" },
          { name: "Dark Wash Jeans", price: "₹1,199", url: "https://www.myntra.com/gateway/v2/search/query?q=men+dark+wash+jeans" },
          { name: "Leather Bracelet", price: "₹299", url: "https://www.amazon.in/s?k=men+leather+bracelet+minimal" },
        ],
      },
    ],
    improvementNote: "Your lighting is too flat. Aditya's photos use dramatic shadows — try window light from one side.",
  },
  {
    name: "Kartik Aaryan",
    title: "The Boy Next Door",
    photo: "😊",
    style: "Fun, colorful, youthful — bright colors, casual fits, genuine smile",
    tags: ["fun", "colorful", "youthful", "bright", "casual", "smile"],
    shopLinks: [
      {
        category: "🎨 His Style — Fun & Colorful",
        items: [
          { name: "Color Block T-Shirt", price: "₹599", url: "https://www.myntra.com/gateway/v2/search/query?q=men+color+block+tshirt" },
          { name: "Slim Fit Jeans (Blue)", price: "₹999", url: "https://www.myntra.com/gateway/v2/search/query?q=men+slim+fit+jeans+blue" },
          { name: "Canvas Sneakers", price: "₹799", url: "https://www.myntra.com/gateway/v2/search/query?q=men+canvas+sneakers+colorful" },
        ],
      },
    ],
    improvementNote: "Your expression is too stiff. Kartik's secret is a genuine, relaxed smile — practice in the mirror.",
  },
];

export interface MatchResult {
  celebrity: CelebrityProfile;
  matchScore: number; // 0-100
  matchReasons: string[];
  gapScore: number; // how far user is from this look (0-100)
  gapReasons: string[];
  shopLink: string; // deep link to shopping
}

/**
 * Match a user's photo analysis to celebrity profiles.
 */
export function matchCelebrity(options: {
  goal: string;
  undertone?: string;
  lightingScore: number;
  groomingScore: number;
  outfitScore: number;
  expressionScore: number;
  symmetryScore: number;
  backgroundScore: number;
}): MatchResult[] {
  const results: MatchResult[] = [];

  for (const celeb of CELEBRITY_PROFILES) {
    let matchScore = 50; // base
    const matchReasons: string[] = [];
    const gapReasons: string[] = [];
    let gapScore = 0;

    // Tag matching
    const goalTags: Record<string, string[]> = {
      dating: ["warm", "approachable", "natural", "smile", "romantic"],
      instagram: ["dark", "moody", "artistic", "sharp", "colorful"],
      office: ["sharp", "clean", "structured", "neutral", "understated"],
      college: ["relaxed", "youthful", "fun", "layered", "casual"],
      glowup: ["groomed", "sharp", "athletic", "power", "structured"],
    };

    const userGoalTags = goalTags[options.goal] || goalTags.dating;
    const matchingTags = celeb.tags.filter((t) => userGoalTags.includes(t));
    matchScore += matchingTags.length * 5;
    if (matchingTags.length > 0) {
      matchReasons.push(`${matchingTags.length} style traits match your ${options.goal} goal`);
    }

    // Lighting match — good lighting = closer to celeb look
    if (options.lightingScore > 65) {
      matchScore += 10;
      matchReasons.push("Good lighting — celebs always have this");
    } else {
      gapScore += 15;
      gapReasons.push("Fix lighting to match celebrity-level photos");
    }

    // Grooming
    if (options.groomingScore > 65) {
      matchScore += 10;
      matchReasons.push("Grooming is on track");
    } else {
      gapScore += 15;
      gapReasons.push("Grooming needs work — this is 70% of a celebrity look");
    }

    // Outfit
    if (options.outfitScore > 60) {
      matchScore += 8;
      matchReasons.push("Outfit coordination is decent");
    } else {
      gapScore += 12;
      gapReasons.push("Outfit is generic — copy this celebrity's style");
    }

    // Expression
    if (options.expressionScore > 60) {
      matchScore += 5;
      matchReasons.push("Expression has potential");
    } else {
      gapScore += 8;
      gapReasons.push("Work on expression — practice your signature look");
    }

    // Symmetry
    if (options.symmetryScore > 60) {
      matchScore += 5;
      matchReasons.push("Good facial symmetry");
    }

    // Undertone match
    if (options.undertone === "warm" && celeb.tags.includes("warm")) {
      matchScore += 8;
      matchReasons.push("Skin undertone matches this celebrity's palette");
    } else if (options.undertone === "cool" && celeb.tags.includes("dark")) {
      matchScore += 8;
      matchReasons.push("Cool undertone works with this celebrity's dark style");
    }

    // Goal-specific boost
    if (options.goal === "dating" && celeb.tags.some((t) => ["warm", "approachable", "smile", "romantic"].includes(t))) {
      matchScore += 10;
    }
    if (options.goal === "instagram" && celeb.tags.some((t) => ["dark", "moody", "artistic", "colorful"].includes(t))) {
      matchScore += 10;
    }
    if (options.goal === "office" && celeb.tags.some((t) => ["sharp", "structured", "neutral", "clean"].includes(t))) {
      matchScore += 10;
    }
    if (options.goal === "college" && celeb.tags.some((t) => ["relaxed", "youthful", "fun", "casual"].includes(t))) {
      matchScore += 10;
    }

    matchScore = Math.min(95, Math.max(20, matchScore));
    gapScore = Math.min(80, Math.max(10, gapScore));

    results.push({
      celebrity: celeb,
      matchScore,
      matchReasons: matchReasons.slice(0, 3),
      gapScore,
      gapReasons: gapReasons.slice(0, 2),
      shopLink: celeb.shopLinks[0]?.items[0]?.url || "https://www.myntra.com",
    });
  }

  // Sort by match score, return top 3
  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
}

/**
 * Get a personalized "You could look like" message.
 */
export function getAspirationalMessage(match: MatchResult): string {
  if (match.matchScore > 75) {
    return `You're already ${match.matchScore}% of the way to a ${match.celebrity.name}-level look. Just fix ${match.gapReasons[0]?.toLowerCase() || "a few details"} and you're there.`;
  }
  if (match.matchScore > 55) {
    return `Your current vibe is ${match.matchScore}% aligned with ${match.celebrity.name}'s style. ${match.gapReasons[0] || "Fix a few things"} to get closer.`;
  }
  return `With ${match.matchScore}% style alignment, ${match.celebrity.name}'s look is aspirational but achievable. Start with: ${match.gapReasons[0]?.toLowerCase() || "the basics"}.`;
}
