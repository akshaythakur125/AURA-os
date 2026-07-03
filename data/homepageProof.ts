export interface HomepageProofEntry {
  initials: string;
  city: string;
  beforeScore: number;
  afterScore: number;
  leakLabel: string;
  pointsGained: number;
  timeframe: string;
  gradient: string;
}

const ALL: HomepageProofEntry[] = [
  {
    initials: "AK",
    city: "Bangalore",
    beforeScore: 58,
    afterScore: 84,
    leakLabel: "corporate_sharp",
    pointsGained: 26,
    timeframe: "4 weeks",
    gradient: "from-purple-600 to-pink-500",
  },
  {
    initials: "RJ",
    city: "Mumbai",
    beforeScore: 45,
    afterScore: 76,
    leakLabel: "background_clutter",
    pointsGained: 31,
    timeframe: "3 weeks",
    gradient: "from-sky-500 to-indigo-500",
  },
  {
    initials: "SM",
    city: "Delhi",
    beforeScore: 62,
    afterScore: 91,
    leakLabel: "lighting_flat",
    pointsGained: 29,
    timeframe: "6 weeks",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    initials: "VP",
    city: "Pune",
    beforeScore: 51,
    afterScore: 79,
    leakLabel: "expression_neutral",
    pointsGained: 28,
    timeframe: "2 weeks",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    initials: "AT",
    city: "Hyderabad",
    beforeScore: 55,
    afterScore: 82,
    leakLabel: "outfit_contrast",
    pointsGained: 27,
    timeframe: "5 weeks",
    gradient: "from-rose-500 to-red-500",
  },
  {
    initials: "KC",
    city: "Chennai",
    beforeScore: 48,
    afterScore: 73,
    leakLabel: "framing_off",
    pointsGained: 25,
    timeframe: "3 weeks",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    initials: "PS",
    city: "Kolkata",
    beforeScore: 60,
    afterScore: 88,
    leakLabel: "color_mismatch",
    pointsGained: 28,
    timeframe: "4 weeks",
    gradient: "from-violet-500 to-fuchsia-500",
  },
  {
    initials: "AN",
    city: "Jaipur",
    beforeScore: 53,
    afterScore: 80,
    leakLabel: "background_clutter",
    pointsGained: 27,
    timeframe: "3 weeks",
    gradient: "from-lime-500 to-green-500",
  },
];

export function getHomepageProofEntries(): HomepageProofEntry[] {
  return ALL;
}
