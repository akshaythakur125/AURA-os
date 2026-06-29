import type { Audit, GlowupPlan, WeekPlan, DailyMission, BudgetRoadmap2 } from "@/types/audit";

function generateWeek1(audit: Audit): WeekPlan {
  const d = audit.deepInput;
  const concern = d?.biggestConcern;
  const focus = concern === "grooming_issue" ? "Grooming & Personal Care" : "Lighting & Photo Basics";

  const missions: DailyMission[] = [
    {
      day: 1,
      category: "photo",
      title: "Find your best natural light spot",
      description: "Walk around your home at different times of day. Find the spot with the most even, soft natural light near a window. This is now your go-to photo spot.",
      effort: "easy",
    },
    {
      day: 2,
      category: "grooming",
      title: "Grooming audit",
      description: "Check your hair, nails, brows, and facial hair. Note what needs attention. Book a haircut or trim if needed.",
      effort: "easy",
    },
    {
      day: 3,
      category: "background",
      title: "Declutter your photo background",
      description: "Clean and simplify the area behind your go-to photo spot. Remove visible clutter, wires, and personal items. A plain wall or clean corner works best.",
      effort: "medium",
    },
    {
      day: 4,
      category: "outfit",
      title: "Pick 3 solid-color outfits",
      description: "Choose 3 outfits that fit well and use solid, neutral colors. Lay them out and take a photo of each. These are your go-to photo outfits.",
      effort: "medium",
    },
    {
      day: 5,
      category: "photo",
      title: "Take your first well-lit photo",
      description: "Use your best light spot, clean background, and best outfit. Take 10-15 shots with different angles and expressions. Pick the best one.",
      effort: "medium",
    },
    {
      day: 6,
      category: "grooming",
      title: "Skincare basics",
      description: "Start a simple routine: cleanse, moisturize, sunscreen. Consistent skin health improves close-up photo quality more than any filter.",
      effort: "easy",
    },
    {
      day: 7,
      category: "mindset",
      title: "Reflect on week 1 progress",
      description: "Compare your day 5 photo with any older photo. Note 3 things that already look better. This builds momentum for the next week.",
      effort: "easy",
    },
  ];

  return {
    title: "Foundation Week",
    focus,
    dailyMissions: missions,
  };
}

function generateWeek2(audit: Audit): WeekPlan {
  const missions: DailyMission[] = [
    {
      day: 8,
      category: "photo",
      title: "Master the chest-up frame",
      description: "Take a series of chest-up shots. Keep the camera at eye level, leave 20% headroom, and angle your body slightly to the side for a natural look.",
      effort: "medium",
    },
    {
      day: 9,
      category: "outfit",
      title: "Layer an outfit",
      description: "Add a layer (overshirt, jacket, blazer) to one of your solid outfits. Layering instantly makes any outfit look more intentional.",
      effort: "easy",
    },
    {
      day: 10,
      category: "grooming",
      title: "Eyebrow tidy-up",
      description: "Tidy your eyebrows — trim, pluck, or brush them. Well-maintained brows frame your face and improve close-up photos significantly.",
      effort: "easy",
    },
    {
      day: 11,
      category: "background",
      title: "Add subtle background texture",
      description: "Introduce one element to your background — a plant, a framed poster, or a textured wall area. Keep it minimal. One item is enough.",
      effort: "medium",
    },
    {
      day: 12,
      category: "photo",
      title: "Full-body shot practice",
      description: "Take a full-body photo using your phone tripod or a friend. Check your posture, hand placement, and outfit silhouette. Shoes matter here.",
      effort: "medium",
    },
    {
      day: 13,
      category: "grooming",
      title: "Fragrance check",
      description: "If you use fragrance, pick one mild, versatile option for daily wear. If not, consider a mild deodorant that does not clash with your natural scent.",
      effort: "easy",
    },
    {
      day: 14,
      category: "mindset",
      title: "Style inspiration board",
      description: "Save 5-10 photos of looks/styles you admire. Note what they have in common — colors, fits, vibes. Use this as your style reference going forward.",
      effort: "easy",
    },
  ];

  return {
    title: "Style Awareness Week",
    focus: "Photo quality & outfit coordination",
    dailyMissions: missions,
  };
}

function generateWeek3(audit: Audit): WeekPlan {
  const missions: DailyMission[] = [
    {
      day: 15,
      category: "photo",
      title: "Hobby/context photo",
      description: "Take a photo that shows you doing something you love — reading, cooking, playing guitar, sketching, working out. Context photos perform better than plain portraits for dating and Instagram.",
      effort: "medium",
    },
    {
      day: 16,
      category: "outfit",
      title: "Accessory experiment",
      description: "Try adding one minimal accessory — a watch, a chain, sunglasses. Take a before/after photo. Notice how one intentional item changes the frame.",
      effort: "easy",
    },
    {
      day: 17,
      category: "grooming",
      title: "Hair experiment",
      description: "Try 2-3 different hair styles. Take photos of each. Ask a friend which one looks best. Stick with that style for the rest of the month.",
      effort: "medium",
    },
    {
      day: 18,
      category: "background",
      title: "Outdoor background test",
      description: "Find a clean outdoor spot — a park bench, a coffee shop wall, a campus corner. Take a photo there. Compare it with your indoor shot from week 1.",
      effort: "medium",
    },
    {
      day: 19,
      category: "photo",
      title: "Golden hour shoot",
      description: "Go outside during golden hour (sunrise or sunset). Take photos facing the light at a slight angle. Note the difference in warmth and skin tone quality.",
      effort: "medium",
    },
    {
      day: 20,
      category: "grooming",
      title: "Nail care",
      description: "Trim, file, and clean your nails. Well-maintained hands matter in close-up and dating profile photos. Clear nails look cleaner than painted ones for men.",
      effort: "easy",
    },
    {
      day: 21,
      category: "mindset",
      title: "Compare week 1 vs week 3",
      description: "Look at your day 5 photo next to your day 19 photo. Write down 3 visible improvements. This is proof that small daily actions create real change.",
      effort: "easy",
    },
  ];

  return {
    title: "Expression & Context Week",
    focus: "Personality expression & outdoor lighting",
    dailyMissions: missions,
  };
}

function generateWeek4(audit: Audit): WeekPlan {
  const missions: DailyMission[] = [
    {
      day: 22,
      category: "photo",
      title: "Smile practice",
      description: "Take photos with different smile intensities — no smile, slight smile, genuine laugh. The genuine one usually looks best. Identify your best smile and practice holding it.",
      effort: "easy",
    },
    {
      day: 23,
      category: "outfit",
      title: "Outfit coordination check",
      description: "Make sure your outfits work together — belt matches shoes, colors complement, fit is consistent across all pieces. One coordinated outfit beats five random ones.",
      effort: "medium",
    },
    {
      day: 24,
      category: "grooming",
      title: "Full grooming session",
      description: "Book or do a full grooming session — haircut, shave/trim, nails, skin. A fully groomed look changes how every photo reads.",
      effort: "hard",
    },
    {
      day: 25,
      category: "photo",
      title: "Profile photo selection",
      description: "Choose your top 3 photos from the past 3 weeks. Ask 2-3 friends which one they would use as a profile photo. Pick the winner.",
      effort: "medium",
    },
    {
      day: 26,
      category: "background",
      title: "Final background polish",
      description: "Review all your photo spots. Make one final improvement to each — move one distracting item, adjust lighting, or add a small decorative element.",
      effort: "easy",
    },
    {
      day: 27,
      category: "photo",
      title: "Color palette test",
      description: "Take photos wearing different solid colors (black, white, navy, olive). See which color makes your skin tone and features look best. Use that as your go-to.",
      effort: "medium",
    },
    {
      day: 28,
      category: "outfit",
      title: "Capsule wardrobe selection",
      description: "Pick 5-7 items from your wardrobe that coordinate well together. These are your capsule pieces — they should cover most photo and social situations.",
      effort: "hard",
    },
    {
      day: 29,
      category: "photo",
      title: "Final photo shoot",
      description: "Do a final photo session using everything you have learned — best lighting, best outfit, best background, best expression. Take at least 20 shots.",
      effort: "hard",
    },
    {
      day: 30,
      category: "mindset",
      title: "Glow-up review",
      description: "Compare your day 1 photo with your day 29 photo. Write down everything that changed. This is your glow-up proof. Keep these habits going beyond 30 days.",
      effort: "easy",
    },
  ];

  return {
    title: "Integration & Polish Week",
    focus: "Consolidation, final photos, lasting habits",
    dailyMissions: missions,
  };
}

function generateBudgetRoadmap(audit: Audit): BudgetRoadmap2 {
  return {
    free: [
      "Use natural window light instead of overhead lights",
      "Clean your camera lens before every photo",
      "Declutter your most-used photo background",
      "Wear solid neutral colors (black, white, grey)",
      "Use a phone tripod or steady surface for stable frames",
      "Take photos during golden hour (sunrise/sunset)",
      "Practice smiling naturally in front of a mirror",
    ],
    under2000: [
      "Clip-on ring light for even indoor lighting (₹600)",
      "Phone tripod for steady shots (₹800)",
      "Basic grooming kit — nail trimmer, brow tool, comb (₹700)",
      "Hair clay or wax for styled but natural look (₹350)",
      "Simple facial cleanser and moisturizer (₹300)",
      "Minimal phone case without wear or logos (₹400)",
    ],
    under5000: [
      "Solid-color overshirt or layering piece (₹2,200)",
      "Well-fitted collar shirt for profiles (₹1,400)",
      "Minimal metal watch for accessory presence (₹1,500)",
      "Complete outfit bundle — shirt, shoes, accessory (₹4,500)",
      "Denim jacket for versatile layering (₹2,000)",
      "Local barber/salon grooming session (₹300+)",
    ],
    under10000: [
      "Professional profile photo session (₹2,500+)",
      "Small wardrobe capsule — 3-5 coordinated outfits (₹5,000+)",
      "Local stylist or image consultant session (₹5,000+)",
      "Fitness or grooming program (3-month commitment) (₹6,000)",
      "Advanced lighting setup — softbox or LED panel (₹3,000+)",
    ],
    totalEstimatedCost: audit.budgetRange > 0 ? audit.budgetRange : 2000,
  };
}

export function generateGlowupPlan(audit: Audit): GlowupPlan {
  return {
    week1: generateWeek1(audit),
    week2: generateWeek2(audit),
    week3: generateWeek3(audit),
    week4: generateWeek4(audit),
    budgetRoadmap: generateBudgetRoadmap(audit),
    generatedAt: new Date().toISOString(),
  };
}
