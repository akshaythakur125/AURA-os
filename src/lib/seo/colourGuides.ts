// Content for the "best colours for your skin tone / undertone" SEO guides.
// Genuine, substantive colour-analysis guidance — how to find your undertone,
// the colours that make your skin glow, what to skip, and how to shop them —
// because thin pages hurt both ranking and the brand. Every guide funnels to a
// free undertone scan (→ ₹25) and colour-specific shop links (→ apparel
// commission).

export interface ColourGuide {
  slug: string; // "warm"
  undertone: string; // "Warm"
  undertoneLower: string; // "warm"
  metaTitle: string;
  metaDescription: string;
  intro: string;
  howToTell: string;
  bestColours: { name: string; why: string; q: string }[]; // q = shop query
  avoid: { name: string; why: string }[];
  metals: string;
  occasions: { label: string; colours: string }[];
  proTip: string;
  faqs: { q: string; a: string }[];
}

const C = (g: ColourGuide) => g;

export const COLOUR_GUIDES: ColourGuide[] = [
  C({
    slug: "warm",
    undertone: "Warm",
    undertoneLower: "warm",
    metaTitle: "Best Colours for Warm Undertones (2026 Skin-Tone Guide)",
    metaDescription:
      "Warm undertones glow in earthy, golden colours. See the exact shades that flatter warm skin, what to avoid, the metals that suit you, and how to shop them.",
    intro:
      "A warm undertone means your skin has golden, peachy or yellow-based warmth beneath the surface. The colours that flatter you are the ones that echo that warmth — earthy, sun-baked, spice-drawer shades — while cold, icy colours can leave you looking washed out. Get this right and your skin reads healthier and more radiant in every photo, before you change a single other thing.",
    howToTell:
      "Check the veins on your inner wrist in daylight: if they look greenish, you likely lean warm. Gold jewellery tends to suit you more than silver, and you probably tan more easily than you burn. Plain white can look slightly harsh against your skin, while cream and ivory look soft and natural — a classic warm-undertone tell.",
    bestColours: [
      { name: "Olive & sage green", why: "Muted, earthy greens sit in the same warm family as your skin and make it look luminous.", q: "olive green shirt" },
      { name: "Rust, terracotta & burnt orange", why: "Spice tones flatter warm skin more than almost anything — rich without fighting your natural warmth.", q: "rust terracotta top" },
      { name: "Camel, tan & warm brown", why: "Warm neutrals that read expensive and let your skin be the brightest thing in frame.", q: "camel tan outfit" },
      { name: "Mustard & marigold", why: "Golden yellows amplify a warm undertone's glow — especially photogenic in natural light.", q: "mustard yellow kurta" },
      { name: "Cream & ivory", why: "Your version of white — soft and flattering where stark white can be harsh.", q: "cream ivory shirt" },
    ],
    avoid: [
      { name: "Icy blue & bright cyan", why: "Cold, blue-based brights clash with golden warmth and can make skin look grey." },
      { name: "Pure stark white", why: "Too cold against warm skin — reach for cream or ivory instead." },
      { name: "Silver-toned pastels & lavender", why: "Cool, ashy pastels drain warm complexions of their natural glow." },
    ],
    metals: "Gold, brass, bronze and rose gold sit best on warm skin — they echo the warmth instead of fighting it. Save cool silver for cool undertones.",
    occasions: [
      { label: "Dating / evening", colours: "Burnt orange, olive, warm red, camel" },
      { label: "Office / LinkedIn", colours: "Navy, camel, olive, cream, burgundy" },
      { label: "Festive / ethnic", colours: "Marigold, vermillion, emerald, gold, ivory" },
    ],
    proTip:
      "When in doubt, wear your flattering colour near your face (a top, a scarf, a collar) and keep bolder experiments lower down. The camera reads whatever is closest to your skin first.",
    faqs: [
      { q: "What colours suit a warm undertone best?", a: "Earthy, golden shades: olive and sage green, rust and terracotta, camel and tan, mustard, and warm reds. Cream and ivory are your best 'whites'." },
      { q: "Can warm undertones wear black?", a: "Yes, but it's not your most flattering neutral — it can look a little flat against warm skin. Warm navy, deep olive or chocolate brown usually read richer on you." },
      { q: "How do I know if I'm warm or cool?", a: "Green-looking wrist veins, gold jewellery suiting you, and tanning more than burning all point to warm. AuraCheck can also read your undertone from one photo for free." },
    ],
  }),
  C({
    slug: "cool",
    undertone: "Cool",
    undertoneLower: "cool",
    metaTitle: "Best Colours for Cool Undertones (2026 Skin-Tone Guide)",
    metaDescription:
      "Cool undertones pop in jewel and blue-based colours. See the exact shades that flatter cool skin, what to avoid, the metals that suit you, and how to shop them.",
    intro:
      "A cool undertone means your skin has pink, red or blue-based coolness beneath the surface. Your most flattering colours are crisp and jewel-like — the shades that carry a hint of blue rather than yellow. Warm, mustardy colours can make cool skin look sallow, while the right cool tones make you look sharp and awake in every photo.",
    howToTell:
      "The veins on your inner wrist look blue or purple in daylight, silver jewellery flatters you more than gold, and you tend to burn before you tan. Pure white looks clean and crisp against your skin, while cream can look slightly dull — the opposite of a warm undertone.",
    bestColours: [
      { name: "Navy & true blue", why: "Blue-based colours are your home turf — they make cool skin look crisp and healthy.", q: "navy blue shirt" },
      { name: "Emerald & teal", why: "Cool jewel greens have the blue base that flatters your undertone, unlike warm olive.", q: "emerald teal top" },
      { name: "Burgundy & berry", why: "Cool reds with a blue lean read rich and expensive on cool skin.", q: "burgundy top" },
      { name: "Charcoal & true grey", why: "Cool greys are your best everyday neutral — sharper on you than warm brown.", q: "charcoal grey outfit" },
      { name: "Pure white & cool pastels", why: "Crisp white and icy pastels (lavender, sky, rose) suit you where they'd wash out warm skin.", q: "white cool pastel shirt" },
    ],
    avoid: [
      { name: "Mustard & marigold", why: "Golden yellows can make cool skin look sallow and tired." },
      { name: "Orange & rust", why: "Warm spice tones fight a cool undertone rather than flattering it." },
      { name: "Camel & warm beige", why: "Yellow-based neutrals can drain cool complexions — reach for grey instead." },
    ],
    metals: "Silver, platinum and white gold sit best on cool skin. Cool gunmetal and steel watch cases suit you too; save yellow gold for warm undertones.",
    occasions: [
      { label: "Dating / evening", colours: "Navy, burgundy, emerald, charcoal" },
      { label: "Office / LinkedIn", colours: "Navy, charcoal, true grey, cool white" },
      { label: "Festive / ethnic", colours: "Royal blue, emerald, magenta, silver" },
    ],
    proTip:
      "Keep your crispest cool colour closest to your face. A cool white or navy collar under an outfit instantly sharpens how awake and put-together you read on camera.",
    faqs: [
      { q: "What colours suit a cool undertone best?", a: "Blue-based, jewel shades: navy and true blue, emerald and teal, burgundy and berry, plus charcoal and pure white. Icy pastels flatter you too." },
      { q: "Can cool undertones wear brown?", a: "Cooler browns like taupe work, but warm camel and tan can look dull on cool skin. Charcoal and true grey are usually your stronger neutrals." },
      { q: "How do I know if I'm cool or warm?", a: "Blue or purple wrist veins, silver jewellery suiting you, and burning more than tanning point to cool. AuraCheck reads your undertone from one photo for free." },
    ],
  }),
  C({
    slug: "neutral",
    undertone: "Neutral",
    undertoneLower: "neutral",
    metaTitle: "Best Colours for Neutral Undertones (2026 Skin-Tone Guide)",
    metaDescription:
      "Neutral undertones can wear the widest range of colours. See the shades that flatter neutral skin most, the few to soften, and how to shop them.",
    intro:
      "A neutral undertone means your skin carries a balance of warm and cool — no single base dominates. It's the most flexible undertone: you can wear far more of the colour wheel than warm or cool types. The trick is less about avoiding colours and more about choosing muted, balanced versions over the most extreme brights.",
    howToTell:
      "Your wrist veins look somewhere between blue and green, gold and silver jewellery both suit you reasonably well, and your skin doesn't obviously clash with either warm or cool tops. If you've always struggled to place yourself as clearly warm or cool, you're probably neutral.",
    bestColours: [
      { name: "Jade & soft teal", why: "Balanced greens that lean neither too warm nor too cool — flattering on neutral skin.", q: "jade teal top" },
      { name: "Soft rose & dusty pink", why: "Muted pinks with a balanced base read healthy without overpowering.", q: "dusty rose top" },
      { name: "Navy & denim blue", why: "A universally safe, sharp choice that anchors most neutral-undertone outfits.", q: "navy denim shirt" },
      { name: "Taupe, stone & true beige", why: "Balanced neutrals are your everyday backbone — they go with almost anything.", q: "taupe beige outfit" },
      { name: "Off-white & soft grey", why: "Your best 'white' sits just off pure white — clean without being stark or dull.", q: "off white grey shirt" },
    ],
    avoid: [
      { name: "The most neon brights", why: "Extreme electric shades can overpower a balanced complexion — pick a muted version instead." },
      { name: "Very heavy all-black head to toe", why: "Not clashing, but it can flatten neutral skin — break it with a mid-tone near the face." },
    ],
    metals: "Both gold and silver work on neutral skin — a genuine advantage. Pick metal by outfit and mood rather than by undertone rule.",
    occasions: [
      { label: "Dating / evening", colours: "Navy, soft rose, jade, charcoal" },
      { label: "Office / LinkedIn", colours: "Navy, taupe, soft grey, off-white" },
      { label: "Festive / ethnic", colours: "Teal, magenta, gold or silver, ivory" },
    ],
    proTip:
      "Your edge is versatility — build a wardrobe of muted mid-tones and you'll rarely make a wrong call. Save the one bold colour for a single statement piece near your face.",
    faqs: [
      { q: "What colours suit a neutral undertone best?", a: "Balanced, muted shades: jade and soft teal, dusty rose, navy and denim blue, taupe and stone, and off-white. You can wear far more of the wheel than warm or cool types." },
      { q: "Do neutral undertones have colours to avoid?", a: "Very few — mostly just the most extreme neon brights and heavy head-to-toe black, both of which can overpower or flatten balanced skin. Muted versions almost always work." },
      { q: "How do I know if I'm neutral?", a: "Blue-green wrist veins, both gold and silver suiting you, and never clearly clashing with warm or cool tops point to neutral. AuraCheck confirms it from one photo for free." },
    ],
  }),
];

export function getColourGuide(slug: string): ColourGuide | undefined {
  return COLOUR_GUIDES.find((g) => g.slug === slug.toLowerCase());
}
