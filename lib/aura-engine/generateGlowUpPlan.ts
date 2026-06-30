import type { Audit, ImageMetrics } from "@/types";
import type { GlowUpPlan, DailyMission, WeeklyPlan, WeekMission, BudgetRoadmap, PhotoSystem, GroomingSystem, OutfitSystem, BackgroundSystem, ProgressTracking } from "@/types/glowup";

function determineBottleneck(metrics: ImageMetrics): string {
  const { lightingScore, clarityScore, compositionScore, backgroundComplexityEstimate } = metrics;
  const lowest = Math.min(lightingScore, clarityScore, compositionScore, 100 - backgroundComplexityEstimate);
  if (lowest === lightingScore) return "Lighting is your primary bottleneck. Improving it will lift every other dimension.";
  if (lowest === clarityScore) return "Clarity is your primary bottleneck. Sharper images will make your presentation more intentional.";
  if (lowest === compositionScore) return "Composition is your primary bottleneck. Better framing will make your photos look more polished.";
  return "Background control is your primary bottleneck. A cleaner environment will strengthen your overall signal.";
}

function generateStartingPoint(audit: Audit): string {
  const score = audit.freeScore || 50;
  if (score >= 80) return "You already have a strong visual baseline. This plan focuses on refining consistency and building a repeatable system.";
  if (score >= 60) return "You have a solid foundation. This plan targets the specific gaps holding you back from a premium presentation.";
  if (score >= 40) return "You are in the building phase. This plan prioritizes fundamentals — lighting, clarity, and grooming basics — first.";
  return "You are starting fresh. This plan builds from the ground up, focusing on one habit at a time.";
}

function generateWeekPlans(dailyMissions: DailyMission[]): WeeklyPlan[] {
  const getWeekMissions = (start: number, end: number): WeekMission[] =>
    dailyMissions.slice(start, end).map((m) => ({
      day: `Day ${m.day}`,
      title: m.title,
      task: m.task,
    }));

  return [
    {
      weekNumber: 1,
      theme: "Clean Base",
      objective: "Fix lighting, background, and grooming fundamentals.",
      missions: getWeekMissions(0, 7),
      checklist: [
        "Identify your best natural light spot",
        "Declutter your most-used background",
        "Set a daily grooming baseline",
        "Clean your camera lens",
        "Take one well-lit test photo",
      ],
      estimatedCost: "Free – ₹500",
    },
    {
      weekNumber: 2,
      theme: "Style Consistency",
      objective: "Build a reliable outfit system that fits and coordinates.",
      missions: getWeekMissions(7, 14),
      checklist: [
        "Identify 3 outfits that fit well",
        "Check shoe condition",
        "Test color combinations",
        "Remove ill-fitting clothes from rotation",
        "Plan 5 go-to outfits",
      ],
      estimatedCost: "₹0 – ₹3,000",
    },
    {
      weekNumber: 3,
      theme: "Profile & Photo Upgrade",
      objective: "Improve photo quality, posing, and profile presentation.",
      missions: getWeekMissions(14, 21),
      checklist: [
        "Practice 3 go-to poses",
        "Scout 2 photo locations",
        "Review and clean up profile text",
        "Take 10+ test photos",
        "Select your best 5",
      ],
      estimatedCost: "Free – ₹2,000",
    },
    {
      weekNumber: 4,
      theme: "Signal System",
      objective: "Build a repeatable personal presentation system.",
      missions: getWeekMissions(21, 30),
      checklist: [
        "Define your personal style in 3 words",
        "Create a photo-type template",
        "Set maintenance habits",
        "Final audit checklist pass",
        "Write your personal presentation rules",
      ],
      estimatedCost: "Free – ₹1,000",
    },
  ];
}

function generateDailyMissions(): DailyMission[] {
  return [
    { day: 1, title: "Find your light", task: "Stand by a window at different times of day. Take a selfie each time. Notice which lighting looks best.", reason: "Lighting is the single cheapest upgrade.", timeRequired: "15 min", cost: "free" },
    { day: 2, title: "Clean your camera lens", task: "Wipe your phone camera lens with a microfiber cloth. Take a before/after photo.", reason: "A dirty lens softens every photo.", timeRequired: "2 min", cost: "free" },
    { day: 3, title: "Declutter one background", task: "Clear the area behind your most-used photo spot. Remove unnecessary items.", reason: "Background clutter distracts from you.", timeRequired: "20 min", cost: "free" },
    { day: 4, title: "Grooming baseline", task: "Trim eyebrows, clean up facial hair (if any), and apply basic skincare (moisturizer).", reason: "Grooming signals self-respect.", timeRequired: "10 min", cost: "free" },
    { day: 5, title: "Solid color test", task: "Wear a solid-color shirt (white, black, navy, or earth tone). Take a well-lit photo.", reason: "Solid colors focus attention on your face.", timeRequired: "10 min", cost: "free" },
    { day: 6, title: "Natural light portrait", task: "Stand facing a window. Take 5 photos with different expressions. Keep the background simple.", reason: "Natural light portraits look premium with zero cost.", timeRequired: "15 min", cost: "free" },
    { day: 7, title: "First week review", task: "Review your best photo from the week. Compare it to your starting point. Note one improvement.", reason: "Tracking progress builds momentum.", timeRequired: "5 min", cost: "free" },

    { day: 8, title: "Fit check", task: "Try on 3 outfits. For each, check: do the shoulders fit? Is the length right? Are the colors coordinated?", reason: "Fit matters more than brand.", timeRequired: "20 min", cost: "free" },
    { day: 9, title: "Shoe assessment", task: "Check your most-worn shoes. Are they clean? In good condition? Do they match your style?", reason: "Shoes are noticed in full-body shots.", timeRequired: "10 min", cost: "free" },
    { day: 10, title: "Color palette test", task: "Hold different colored shirts near your face. Take photos. Note which colors make you look vibrant.", reason: "Right colors improve your skin tone appearance.", timeRequired: "15 min", cost: "free" },
    { day: 11, title: "Remove one ill-fitting item", task: "Identify one clothing item that does not fit well. Donate or set aside.", reason: "Ill-fitting clothes weaken any outfit.", timeRequired: "5 min", cost: "free" },
    { day: 12, title: "Accessory edit", task: "Wear one intentional accessory (watch, bracelet, chain). Take a photo. Does it add or distract?", reason: "One focused signal is stronger than multiple competing ones.", timeRequired: "10 min", cost: "free" },
    { day: 13, title: "Outfit repeater test", task: "Wear an outfit you feel confident in. Take a photo in 3 different backgrounds.", reason: "Your best outfit should work in multiple settings.", timeRequired: "15 min", cost: "free" },
    { day: 14, title: "Style reflection", task: "Write down 3 words that describe your style. Check if your wardrobe matches them.", reason: "Clarity in style leads to consistency.", timeRequired: "10 min", cost: "free" },

    { day: 15, title: "Three poses practice", task: "Practice 3 poses: natural smile, looking away candid, confident straight-on. Take each.", reason: "Good poses make photos look effortless.", timeRequired: "15 min", cost: "free" },
    { day: 16, title: "Location scout", task: "Find 2 locations near you with good lighting and clean backgrounds. Take test shots.", reason: "Location sets the tone of your photo.", timeRequired: "30 min", cost: "free" },
    { day: 17, title: "Profile text review", task: "Read your bio or profile text aloud. Remove any clichés, negativity, or generic phrases.", reason: "Words matter as much as photos on profiles.", timeRequired: "15 min", cost: "free" },
    { day: 18, title: "Photo session practice", task: "Take 10+ photos using your best location and lighting. Try different expressions.", reason: "Volume improves your chances of getting a great shot.", timeRequired: "30 min", cost: "free" },
    { day: 19, title: "Select your top 5", task: "From your photo session, select your 5 strongest images. Ask a friend for their honest pick.", reason: "Curating is part of presentation.", timeRequired: "15 min", cost: "free" },
    { day: 20, title: "Caption/bio rewrite", task: "Write one original prompt or caption. No clichés. End with a conversation hook.", reason: "Original text signals confidence.", timeRequired: "15 min", cost: "free" },
    { day: 21, title: "Third week check", task: `Review your top 5 photos. Do they look consistent? Do they represent your style?`, reason: "Consistency across photos builds trust.", timeRequired: "10 min", cost: "free" },

    { day: 22, title: "Define your style", task: "Write down your personal presentation rules (e.g., 'solid colors only,' 'natural light always').", reason: "Rules make good habits automatic.", timeRequired: "10 min", cost: "free" },
    { day: 23, title: "Build photo template", task: "Create a list of 5 photo types that work for you (e.g., well-lit face, activity, social, full-body, casual).", reason: "A template makes future photo sessions easy.", timeRequired: "15 min", cost: "free" },
    { day: 24, title: "Grooming routine set", task: "Set a weekly grooming schedule (hair, skin, nails, facial hair). Put it in your calendar.", reason: "Consistency beats intensity.", timeRequired: "10 min", cost: "free" },
    { day: 25, title: "Outfit system plan", task: "Document 5 go-to outfits that work for different occasions. Store photos for reference.", reason: "An outfit system removes daily decision fatigue.", timeRequired: "20 min", cost: "free" },
    { day: 26, title: "Background system", task: "List 3 backgrounds you can consistently use that are clean and intentional.", reason: "A reliable background removes photo anxiety.", timeRequired: "10 min", cost: "free" },
    { day: 27, title: "Final audit", task: "Take a new photo using everything you learned. Compare it to your Day 1 photo.", reason: "Seeing progress reinforces the habit.", timeRequired: "15 min", cost: "free" },
    { day: 28, title: "Maintenance plan", task: "Write your weekly maintenance: 1 photo check, 1 groom session, 1 outfit review.", reason: "Small weekly habits sustain your presentation.", timeRequired: "10 min", cost: "free" },
    { day: 29, title: "Share with a trusted friend", task: "Send your best photo to a trusted friend. Ask: 'Does this look like me at my best?'", reason: "External feedback catches blind spots.", timeRequired: "10 min", cost: "free" },
    { day: 30, title: "Plan reflection", task: "Review your 30-day journey. Write down 3 habits you will continue.", reason: "Ending with intention creates lasting change.", timeRequired: "15 min", cost: "free" },
  ];
}

function generateBudgetRoadmap(): BudgetRoadmap {
  return {
    free: [
      "Natural window light — best free upgrade",
      "Clean camera lens before every photo",
      "Declutter any room background",
      "Basic grooming (trim, moisturize, clean nails)",
      "Solid-color outfit from existing wardrobe",
    ],
    under2000: [
      "Ring light (₹500–₹1,000) for consistent lighting",
      "Basic skincare kit (₹500 – face wash, moisturizer, sunscreen)",
      "Plain solid-color t-shirts (2–3 for ₹1,000)",
      "Phone tripod + remote shutter (₹500)",
    ],
    under5000: [
      "Entry-level watch or accessory (₹1,500–₹3,000)",
      "Grooming kit upgrade (₹1,000–₹2,000)",
      "One premium outfit piece (₹2,000–₹3,000)",
      "Haircut at a good salon (₹500–₹1,000)",
    ],
    under10000: [
      "2–3 versatile premium outfits (₹5,000–₹7,000)",
      "Quality footwear (₹2,000–₹4,000)",
      "Skincare + fragrance set (₹2,000–₹3,000)",
      "Professional haircut + grooming session (₹1,000–₹2,000)",
    ],
    under25000: [
      "Wardrobe refresh — 5+ coordinated outfits (₹10,000–₹15,000)",
      "Premium watch or accessory (₹5,000–₹10,000)",
      "Photoshoot with good natural lighting setup (₹3,000–₹5,000)",
      "Grooming professional consultation (₹2,000–₹5,000)",
    ],
  };
}

function generatePhotoSystem(): PhotoSystem {
  return {
    bestPhotoTypes: [
      "Well-lit face portrait (natural window light)",
      "Activity/hobby photo (doing something you enjoy)",
      "Full-body outfit shot (clean background)",
      "Social/candid photo (with friends if appropriate)",
      "Polished casual shot (relaxed but intentional)",
    ],
    lightingGuide: "Use natural window light facing you. Avoid overhead lights. Golden hour (sunrise/sunset) gives the warmest tone.",
    framingGuide: "Keep the camera at eye level. Leave a little headroom. Avoid wide angles that distort.",
    locationIdeas: [
      "Clean wall near a window",
      "Minimal café or coffee shop",
      "Park with open green background",
      "Rooftop with clean sky backdrop",
      "Well-lit room with neutral walls",
    ],
  };
}

function generateGroomingSystem(): GroomingSystem {
  return {
    dailyBasics: [
      "Wash face with mild cleanser",
      "Moisturize",
      "Tidy hair",
      "Clean teeth + fresh breath",
      "Wear deodorant",
    ],
    weeklyHabits: [
      "Trim nails",
      "Tidy eyebrows",
      "Facial hair maintenance (shave or line up)",
      "Haircut every 2–3 weeks",
      "Skincare (exfoliate once a week)",
    ],
    productSuggestions: [
      "Gentle face wash (any pharmacy brand)",
      "Oil-free moisturizer",
      "Sunscreen with matte finish",
      "Hair products (light hold, not greasy)",
      "Fragrance (one signature scent, not overpowering)",
    ],
  };
}

function generateOutfitSystem(): OutfitSystem {
  return {
    capsuleWardrobe: [
      "2 solid-color t-shirts (white, black)",
      "1 neutral button-down shirt",
      "1 well-fitted pair of jeans (dark wash)",
      "1 pair of neutral chinos or trousers",
      "1 clean pair of minimalist sneakers",
    ],
    fitTips: [
      "Shoulders should align with the seam.",
      "Shirt should not be too tight or too loose.",
      "Pant hem should just touch the top of your shoes.",
      "Avoid oversized or saggy fits.",
      "Tuck in for a cleaner look when appropriate.",
    ],
    colorGuidelines: [
      "Stick to neutrals (white, black, navy, grey, beige).",
      "Add one accent color max per outfit.",
      "Avoid large logos or graphics.",
      "Ensure colors complement your skin tone.",
      "Monochromatic outfits look intentional and premium.",
    ],
    shoeGuide: [
      "Clean minimalist sneakers (white or black).",
      "Loafers or clean casual shoes for smart-casual.",
      "Avoid heavily worn or dirty shoes.",
      "Match shoe color to outfit tone.",
    ],
  };
}

function generateBackgroundSystem(): BackgroundSystem {
  return {
    goodBackgrounds: [
      "Clean wall (solid color, no clutter)",
      "Window with soft light coming through",
      "Minimal room with intentional decor",
      "Open outdoor space (avoid crowds)",
      "Neutral café corner with clean table",
    ],
    badBackgrounds: [
      "Cluttered room with random objects",
      "Bathroom mirror selfie with toilet visible",
      "Messy bed or unmade sheets",
      "Crowded or noisy background",
      "Bright colored walls with distractions",
    ],
    quickFixGuide: [
      "Move one arm's length away from clutter",
      "Turn your body to face cleanest direction",
      "Use portrait mode to blur busy backgrounds",
      "Stand against a plain wall if indoors",
      "If outdoors, choose a background with fewer people",
    ],
  };
}

function generateProgressTracking(): ProgressTracking {
  return {
    checkInDays: [7, 14, 21, 30],
    weeklyReflection: "Each week, review your best photo. Compare it to week 1. Note what improved and what still needs work.",
    habitTracker: [
      "Daily: 2-minute grooming check",
      "Daily: Take at least 1 well-lit photo",
      "Weekly: Review and select best photos",
      "Weekly: Outfit coordination check",
      "Weekly: Background cleanliness check",
    ],
  };
}

function generatePlanScore(audit: Audit, metrics: ImageMetrics): number {
  const freeScore = audit.freeScore || 50;
  const { lightingScore, clarityScore, compositionScore, backgroundComplexityEstimate } = metrics;
  const avgVisual = (lightingScore + clarityScore + compositionScore + (100 - backgroundComplexityEstimate)) / 4;
  return Math.round((freeScore + avgVisual) / 2);
}

function generateAvoidForNow(budgetRange: string): string[] {
  const items = [
    "Expensive phone upgrade before fixing lighting basics",
    "Loud accessories before outfit fit is right",
    "Overediting photos before clarity is good",
    "Branded items before background is clean",
    "Paid photoshoot before grooming and base setup",
  ];
  if (budgetRange === "0") {
    items.splice(0, 2, "Any paid upgrade — use free methods first (lighting, background, grooming)", "Cheap fast-fashion haul — invest in 1–2 quality basics instead");
  }
  return items;
}

export function generateGlowUpPlan(audit: Audit, metrics: ImageMetrics): GlowUpPlan {
  const bottleneck = determineBottleneck(metrics);
  const dailyMissions = generateDailyMissions();
  const planScore = generatePlanScore(audit, metrics);

  return {
    planScore,
    planTitle: "30-Day Presentation Upgrade",
    startingPointSummary: generateStartingPoint(audit),
    primaryBottleneck: bottleneck,
    weeklyPlan: generateWeekPlans(dailyMissions),
    dailyMissions,
    budgetRoadmap: generateBudgetRoadmap(),
    shoppingOrActionList: [
      "Ring light (₹500–₹1,000) — best lighting investment",
      "2 solid-color t-shirts (white + black, ₹600–₹1,000)",
      "Basic skincare kit (face wash + moisturizer + sunscreen)",
      "Phone tripod with remote (₹500)",
      "One well-fitted pair of dark jeans or chinos",
    ],
    photoSystem: generatePhotoSystem(),
    groomingSystem: generateGroomingSystem(),
    outfitSystem: generateOutfitSystem(),
    backgroundSystem: generateBackgroundSystem(),
    progressTracking: generateProgressTracking(),
    avoidForNow: generateAvoidForNow(audit.budgetRange),
    expectedPresentationShift: "May help your presentation feel cleaner, more intentional, and more consistent.",
    finalAdvice: "Consistency beats intensity. Small daily actions compound into a noticeably stronger presentation over 30 days. The goal is not perfection — it is progress.",
    generatedAt: new Date().toISOString(),
  };
}
