export interface HomepageProofEntry {
  initials: string;
  city: string;
  beforeScore: number;
  afterScore: number;
  leakLabel: string;
  expertDetail: string;
  pointsGained: number;
  timeframe: string;
  gradient: string;
}

const ALL: HomepageProofEntry[] = [
  {
    initials: "AK",
    city: "Bangalore",
    beforeScore: 48,
    afterScore: 81,
    leakLabel: "Lighting + wardrobe overhaul",
    expertDetail: "Moved from overhead fluorescent to 45° window light (Rembrandt triangle technique). Replaced logo-heavy graphic tee with solid navy crew neck. Background clutter removed. Score jumped 33 points in 3 weeks.",
    pointsGained: 33,
    timeframe: "3 weeks",
    gradient: "from-purple-600 to-pink-500",
  },
  {
    initials: "RJ",
    city: "Mumbai",
    beforeScore: 42,
    afterScore: 76,
    leakLabel: "Background complexity reduced from 85 to 32",
    expertDetail: "Background had 12+ competing objects — bed, boxes, cables, posters. Relocated to plain white wall at 45° to window. Eye-tracking scatter dropped from 1.2s to 0.3s. Viewer's gaze now lands directly on face.",
    pointsGained: 34,
    timeframe: "2 weeks",
    gradient: "from-sky-500 to-indigo-500",
  },
  {
    initials: "SM",
    city: "Delhi",
    beforeScore: 55,
    afterScore: 88,
    leakLabel: "Framing + expression coaching",
    expertDetail: "Was shooting horizontal with 35% frame occupancy. Switched to 4:5 vertical, eyes at upper-third intersection. Applied Duchenne smile technique (genuine eye contraction). Added jaw-forward positioning to define jawline. +33 points.",
    pointsGained: 33,
    timeframe: "4 weeks",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    initials: "VP",
    city: "Pune",
    beforeScore: 51,
    afterScore: 79,
    leakLabel: "Color season matching + outfit coordination",
    expertDetail: "Identified as Warm Autumn (olive skin undertone). Shifted from cool-toned grays to earth tones (olive, rust, cream). Applied three-color rule — entire outfit + background in 3 colors max. Visual coherence score jumped from 42 to 78.",
    pointsGained: 28,
    timeframe: "3 weeks",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    initials: "AT",
    city: "Hyderabad",
    beforeScore: 46,
    afterScore: 82,
    leakLabel: "Instagram feed consistency system",
    expertDetail: "Feed had 6 different lighting conditions and 4 filter styles. Established consistent 5500K color temperature across all posts. Applied same warm preset to 12 photos. Feed now reads as one coherent identity. Engagement up 40%.",
    pointsGained: 36,
    timeframe: "5 weeks",
    gradient: "from-rose-500 to-red-500",
  },
  {
    initials: "KC",
    city: "Chennai",
    beforeScore: 44,
    afterScore: 73,
    leakLabel: "Dating profile photo order optimization",
    expertDetail: "First photo was group shot — viewers spent 1.8s identifying who owned the profile. Reordered: solo portrait → full body → activity → social proof → close-up. Each photo now passes the 0.3-second identification test independently.",
    pointsGained: 29,
    timeframe: "2 weeks",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    initials: "PS",
    city: "Kolkata",
    beforeScore: 52,
    afterScore: 85,
    leakLabel: "Premium minimal signal fix",
    expertDetail: "Was wearing 4+ brand logos per photo — Nike tee, gold chain, branded cap, logo belt. Each logo added cognitive load. Reduced to zero logos, 3 color temperatures max. The 'three-element rule' (face, outfit, one detail) now satisfied.",
    pointsGained: 33,
    timeframe: "3 weeks",
    gradient: "from-violet-500 to-fuchsia-500",
  },
  {
    initials: "AN",
    city: "Jaipur",
    beforeScore: 47,
    afterScore: 80,
    leakLabel: "30-day compounding system",
    expertDetail: "Sporadic improvement — one good photo, then back to old habits. Implemented 4-week progressive system: Week 1 (lighting + framing), Week 2 (background + outfit), Week 3 (grooming + skincare), Week 4 (consistency + batch shooting). Each week built on the previous. +33 points total.",
    pointsGained: 33,
    timeframe: "4 weeks",
    gradient: "from-lime-500 to-green-500",
  },
];

export function getHomepageProofEntries(): HomepageProofEntry[] {
  return ALL;
}
