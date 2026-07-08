export const SAMPLE_FULL_REPORT = {
  score: 73,
  archetype: "The Quiet Achiever",
  oneLineVerdict: "Strong presence, but your digital signals are speaking a different language online.",
  expertAnalysis: {
    photographer: {
      title: "What a photographer sees",
      diagnosis: "Your lighting is functional but flat — likely a single overhead or frontal source. The Rembrandt triangle (the small inverted triangle of light on the far cheek that sculpts bone structure) is absent. This eliminates the cheekbone and jawline definition that separates 'good' from 'photogenic.'",
      actionItems: [
        "Shift to 45° window light at chin height — this creates the Rembrandt triangle that scours cheekbones naturally",
        "Kill overhead fixtures — they cast brow shadows into eye sockets, aging you 5-10 years in the photo",
        "Add a sheer curtain as diffuser if window light is too harsh — softens shadow edges while maintaining direction",
      ],
    },
    stylist: {
      title: "What a stylist notices",
      diagnosis: "Your outfit reads functional but not intentional. The three-element rule (face, outfit, one detail) is being violated — there are 4+ competing visual elements including visible brand logos, clashing accessories, and a background that adds noise.",
      actionItems: [
        "Remove all visible logos — they brand the company, not you",
        "Adopt three-color maximum across outfit + background",
        "Ensure outfit contrasts with background (light-on-dark or dark-on-light)",
      ],
    },
    designer: {
      title: "What a designer notices",
      diagnosis: "Your background occupies 60%+ of visual real estate but contains 7+ competing objects. The visual hierarchy is inverted — the viewer's brain processes background elements before landing on your face. Eye-tracking scatter time: ~0.8 seconds.",
      actionItems: [
        "Reduce background complexity to under 40/100 — move to a plain wall",
        "Apply the three-element rule: face, outfit, one detail — nothing more",
        "Establish consistent color temperature across your feed (5500K daylight)",
      ],
    },
  },
  statusLeaks: [
    {
      title: "Candid photo with messy background on 2nd slide",
      severity: "high",
      explanation: "Background complexity at 78/100 — 8+ competing objects (furniture, cables, visible mess) diluting subject presence. Eye-tracking studies show viewers spend 0.6-1.2 seconds processing background before settling on the face.",
      fix: "Relocate to a plain wall or declutter visible area within arm's reach. Goal: reduce to 3 or fewer background elements.",
      impactScore: 18,
    },
    {
      title: "Bio is just your emoji — no context",
      severity: "medium",
      explanation: "A bio with only emojis provides zero hooks for conversation. On dating apps, the bio is the #1 conversation starter — each sentence should pass the 'would I say this to a stranger?' test.",
      fix: "Add 2-3 specific personal details. Instead of 'foodie', try 'I once drove 2 hours for a plate of dosa in Madurai.' Specificity is memorable. Generics are forgettable.",
      impactScore: 12,
    },
    {
      title: "Your Spotify is private — missed trust signal",
      severity: "low",
      explanation: "Shared music taste is one of the fastest rapport-builders on dating apps. A private Spotify removes a potential connection point.",
      fix: "Make Spotify public and curate a 'dating profile' playlist — 15-20 songs that reflect your taste without being polarizing.",
      impactScore: 5,
    },
  ],
  colorSeasonAnalysis: "Your image reads warm with moderate saturation — you likely have warm skin undertones (golden, olive, or deep). Your color season is likely Warm Autumn. Best colors: earth tones (olive, rust, camel, cream), warm neutrals (tan, brown, off-white), and saturated warm accents (burnt orange, forest green, mustard). Avoid: pastels, icy blues, and cool grays which will wash you out.",
  groomingAdvice: "Eyebrow threading to define the arch (₹50-100), haircut that adds volume on top for your face shape (₹200-500), basic skincare routine: cleanser + moisturizer + SPF (₹300-600). Total: under ₹1200 for immediate visible improvement.",
  expressionCoaching: "The Duchenne smile (eyes + mouth) reads as genuine — practice thinking of something genuinely funny before the shutter. Head tilt of 5-10 degrees softens the jawline. Push jaw slightly forward ('turtle neck') to eliminate double chin and define jawline.",
};

export const SAMPLE_DATING_AUDIT = {
  profileScore: 68,
  profileFrictionSummary: "You come across warm, but too many clichés make you blend in with 60%+ of profiles on the platform.",
  expertAnalysis: {
    photographer: {
      title: "Photo order strategy",
      advice: "Your first photo must pass the 0.3-second test — instant identification with good lighting. The optimal order: (1) clear solo portrait, (2) full body shot, (3) activity/hobby, (4) social proof, (5) close-up with genuine expression.",
      photoOrder: [
        "Photo 1: Solo portrait with window light, slight smile, eye contact — instant clarity",
        "Photo 2: Full body showing outfit and physique in context",
        "Photo 3: Activity shot (cooking, hiking, guitar) — conversation hook",
        "Photo 4: Social proof with friends (clearly identifiable)",
        "Photo 5: Close-up with genuine Duchenne smile",
      ],
    },
    stylist: {
      title: "Outfit strategy for dating",
      advice: "Dating photos require different rules than LinkedIn. Show personality through color and fit, not logos. The 'boyfriend test': would someone describe you positively to a friend based on this outfit? Solid colors > patterns. Fit > brand. Personality > prestige.",
    },
    copywriter: {
      title: "Bio and prompt analysis",
      bioQuality: "Cliche-heavy — blending in rather than standing out",
      clicheFlags: ["Love traveling", "Good vibes only", "Looking for my better half"],
      rewriteExamples: [
        { original: "Love traveling", rewrite: "I once spent 3 weeks in Kerala and still think about the fish curry in Fort Kochi" },
        { original: "Good vibes only", rewrite: "I'm the person who remembers your coffee order after one meeting" },
        { original: "Looking for my better half", rewrite: "Looking for someone who argues about which old Bollywood movie to watch on a Sunday" },
      ],
    },
  },
  textMetrics: {
    originalityScore: 3.8,
    warmthScore: 8.1,
    emojiDensity: 0.12,
    specificityScore: 2.4,
    conversationHooks: 1,
  },
  photoAnalysis: [
    { photo: 1, issue: "Group shot — viewer cannot tell which person owns the profile", fix: "Replace with clear solo portrait" },
    { photo: 2, issue: "Blurry mirror selfie — low effort signal", fix: "Replace with well-lit full body shot" },
    { photo: 3, issue: "Landscape with person barely visible — fails 0.3s identification test", fix: "Replace with activity shot where face is clear" },
  ],
};

export const SAMPLE_GLOWUP_PLAN = {
  planScore: 81,
  primaryBottleneck: "Your wardrobe lacks a signature color palette — outfits feel scattered across warm and cool tones without intentional coordination.",
  personalization: {
    currentScore: 58,
    targetScore: 89,
    biggestWeakness: "lighting",
    colorSeason: "Warm Autumn",
    faceShape: "oval — can wear most styles",
  },
  weeklyBreakdown: [
    {
      week: 1,
      focus: "Lighting & Photography Foundations",
      whyThisWeek: "Lighting accounts for 60-70% of perceived photo quality. Master this first — it's the highest-ROI fix at ₹0 cost.",
      dailyMissions: [
        { day: 1, task: "Identify best natural light source — the window with consistent daylight between 10am-4pm", cost: "₹0" },
        { day: 2, task: "Practice 45° angle — face window at 10 or 2 o'clock, chin height, 10 test shots", cost: "₹0" },
        { day: 3, task: "Kill all overhead lights — retake profile photo with only window light", cost: "₹0" },
        { day: 4, task: "Experiment with diffusion — sheer curtain or bedsheet over window", cost: "₹0-200" },
        { day: 5, task: "Find your best expression — 20 photos, different expressions, compare", cost: "₹0" },
        { day: 6, task: "Compare Day 1 vs Day 5 — note specific improvements", cost: "₹0" },
        { day: 7, task: "Establish your 'golden hour' — 2 hours before sunset", cost: "₹0" },
      ],
    },
    {
      week: 2,
      focus: "Background & Visual Hierarchy",
      whyThisWeek: "Background occupies 60%+ of visual real estate. Getting this right separates 'amateur' from 'intentional.'",
      dailyMissions: [
        { day: 8, task: "Audit current background — count visible objects. If >3, remove.", cost: "₹0" },
        { day: 9, task: "Find 3 plain-wall locations — light, medium, dark tone", cost: "₹0" },
        { day: 10, task: "Practice background-to-outfit contrast — light wall = dark outfit, vice versa", cost: "₹0" },
        { day: 11, task: "Shoot in Portrait mode to blur background detail", cost: "₹0" },
        { day: 12, task: "Create 'shooting corner' — one spot with good light, clean background", cost: "₹0-500" },
        { day: 13, task: "Take 10 photos in corner with different outfits — establish go-to look", cost: "₹0" },
        { day: 14, task: "Review Week 2 — compare background consistency across last 7 photos", cost: "₹0" },
      ],
    },
    {
      week: 3,
      focus: "Outfit, Grooming & Color Science",
      whyThisWeek: "With lighting and background fixed, outfit and grooming are the next highest-ROI improvements.",
      dailyMissions: [
        { day: 15, task: "Identify color season — warm undertones = earth tones, cool = jewel tones", cost: "₹0" },
        { day: 16, task: "Audit wardrobe — remove visible logos, clashing patterns, off-season colors", cost: "₹0" },
        { day: 17, task: "Get haircut that works with face shape — oval: most styles, round: volume on top", cost: "₹200-500" },
        { day: 18, task: "Start skincare: cleanser + moisturizer + SPF every morning", cost: "₹300-600" },
        { day: 19, task: "Eyebrow cleanup — threading to define arch", cost: "₹50-100" },
        { day: 20, task: "Shoot new look — same corner, new outfit + grooming", cost: "₹0" },
        { day: 21, task: "Plan signature look — 2-3 outfits for different occasions", cost: "₹500-2000" },
      ],
    },
    {
      week: 4,
      focus: "Consistency System & Long-Term Habits",
      whyThisWeek: "The biggest risk after improvement is regression. This week creates the system that locks in gains.",
      dailyMissions: [
        { day: 22, task: "Batch-shoot 10 photos in best lighting — content bank for next 2 weeks", cost: "₹0" },
        { day: 23, task: "Edit top 5 — subtle brightness/contrast only. No filters, no face tuning.", cost: "₹0" },
        { day: 24, task: "Set up weekly 10-minute review — every Sunday, compare to Day 1 baseline", cost: "₹0" },
        { day: 25, task: "Establish 'minimum viable routine' — clean lens, find light, check background", cost: "₹0" },
        { day: 26, task: "Create photo checklist — lighting, background, outfit, expression, framing", cost: "₹0" },
        { day: 27, task: "Share best photo with trusted friend — ask for honest first impression", cost: "₹0" },
        { day: 28, task: "Plan next month — which areas need continued attention", cost: "₹0" },
        { day: 29, task: "Final comparison — Day 1 vs Day 29, calculate total improvement", cost: "₹0" },
        { day: 30, task: "Celebrate — habits are established, improvement compounds", cost: "₹0" },
      ],
    },
  ],
  budgetRoadmap: {
    week1: "₹0 — Lighting and framing are free fixes with highest ROI",
    week2: "₹0-500 — Background cleanup and basic setup",
    week3: "₹500-2500 — Haircut, skincare, eyebrow grooming, key wardrobe piece",
    week4: "₹0 — Consistency system costs nothing",
    total: "₹500-3000 for entire 30-day transformation",
  },
  expectedOutcome: "Based on current score of 58, this system targets 89/100 by Day 30. The 31-point gain comes from compounding small fixes across lighting, background, outfit, grooming, and consistency — not from any single dramatic change.",
};
