// Content for the "best haircuts for your face shape" SEO guides. Genuine,
// substantive styling guidance — cuts that balance each shape, what to avoid,
// how to tell your shape, and a styling-product note — because thin pages hurt
// both ranking and the brand. Every guide funnels to a free face-shape scan
// (→ ₹21) and a grooming-product shop link (→ commission).

export interface HaircutGuide {
  slug: string; // "oval"
  shape: string; // "Oval"
  shapeLower: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  howToTell: string;
  bestCuts: { name: string; why: string }[];
  avoid: { name: string; why: string }[];
  styling: string; // product-led styling note
  stylingQuery: string; // grooming shop query
  proTip: string;
  faqs: { q: string; a: string }[];
}

const H = (g: HaircutGuide) => g;

export const HAIRCUT_GUIDES: HaircutGuide[] = [
  H({
    slug: "oval",
    shape: "Oval",
    shapeLower: "oval",
    metaTitle: "Best Haircuts for an Oval Face Shape (2026 Men's Guide)",
    metaDescription: "Oval faces suit almost any haircut — but a few keep your balance best. See the top cuts for an oval face, what to avoid, and how to style them.",
    intro: "An oval face is the most balanced shape — slightly longer than wide, with a soft jaw and forehead of similar width. Almost any cut works, so the goal is simply to keep your natural proportions and avoid adding too much length up top.",
    howToTell: "Your face is a little longer than it is wide, your forehead is marginally wider than your jaw, and your jawline is soft rather than angular. Pull your hair back: if everything looks even and symmetrical, you're likely oval.",
    bestCuts: [
      { name: "Textured crop", why: "Keeps proportions balanced with a modern, low-effort finish that suits your versatile shape." },
      { name: "Side part", why: "A clean classic that flatters oval balance without adding unwanted height." },
      { name: "Quiff (moderate height)", why: "Adds a little lift and personality while keeping your natural proportions in check." },
      { name: "Medium length swept back", why: "Shows off balanced features — one of the few shapes that carries longer styles easily." },
    ],
    avoid: [
      { name: "Very tall styles / big pompadours", why: "Too much height stretches an oval face and breaks its natural balance." },
      { name: "Heavy full fringes", why: "Covering the forehead can shorten and flatten your proportions." },
    ],
    styling: "A matte clay gives an oval face texture and hold without shine — ideal for a crop or quiff that looks styled, not stiff.",
    stylingQuery: "matte hair clay men",
    proTip: "Your shape is forgiving, so pick your cut around your hair type and lifestyle rather than fighting your face — you have the freedom most shapes don't.",
    faqs: [
      { q: "What haircut suits an oval face best?", a: "A textured crop, side part, moderate quiff or medium swept-back cut all flatter an oval face. Just avoid very tall styles that add length." },
      { q: "Can oval faces have long hair?", a: "Yes — oval is one of the few shapes that carries longer, swept-back styles well thanks to its balanced proportions." },
      { q: "How do I know my face is oval?", a: "It's a little longer than wide, with a soft jaw and even proportions. AuraCheck can detect your face shape from one photo, free." },
    ],
  }),
  H({
    slug: "round",
    shape: "Round",
    shapeLower: "round",
    metaTitle: "Best Haircuts for a Round Face Shape (2026 Men's Guide)",
    metaDescription: "Round faces look sharper with height and angles. See the best haircuts to lengthen and define a round face, what to avoid, and how to style them.",
    intro: "A round face is roughly as wide as it is long, with soft cheeks and a rounded jaw. The goal is to add height and angles — length on top and tight sides — to lengthen the face and introduce definition.",
    howToTell: "Your face width and length are similar, your cheeks are the widest point, and your jaw and hairline are soft and curved. Little contrast between forehead, cheek and jaw width usually means round.",
    bestCuts: [
      { name: "Pompadour", why: "Height on top visually lengthens a round face and adds instant structure." },
      { name: "High fade with volume", why: "Tight sides and a taller top slim the face and create the angles roundness lacks." },
      { name: "Quiff with lift", why: "Adds vertical height that offsets width for a longer, sharper look." },
      { name: "Textured crop with short sides", why: "Keeps the sides tight so the eye reads length, not width." },
    ],
    avoid: [
      { name: "Buzz cuts", why: "Uniform short length emphasises the roundness instead of countering it." },
      { name: "Full, floppy fringes over the forehead", why: "They widen the face and hide the length you're trying to add." },
    ],
    styling: "A strong-hold pomade or clay lets you build and keep vertical height all day — the single biggest lever for a round face.",
    stylingQuery: "strong hold pomade men",
    proTip: "Keep the sides tighter than you think and the top taller than you think — contrast between the two is what slims a round face on camera.",
    faqs: [
      { q: "What haircut makes a round face look slimmer?", a: "Anything that adds height and keeps the sides tight — a pompadour, high fade with volume, or quiff. Height lengthens the face and angles add definition." },
      { q: "Should round faces avoid fringes?", a: "Avoid full, floppy fringes that cover the forehead and widen the face. A short, textured or swept fringe can work if it keeps height." },
      { q: "How do I know my face is round?", a: "Width and length are similar and your features are soft and curved. AuraCheck detects your face shape from one photo, free." },
    ],
  }),
  H({
    slug: "square",
    shape: "Square",
    shapeLower: "square",
    metaTitle: "Best Haircuts for a Square Face Shape (2026 Men's Guide)",
    metaDescription: "Square faces can lean into a strong jaw or soften it. See the best haircuts for a square face, what to avoid, and how to style them.",
    intro: "A square face has a strong, wide jaw and forehead of similar width, with angular lines. It's a classically masculine shape — you can either lean into the structure or soften it slightly. Most cuts work; the trick is balancing the strong jaw up top.",
    howToTell: "Your forehead, cheeks and jaw are close to the same width, and your jawline is sharp and angular rather than rounded. A strong, defined jaw is the giveaway.",
    bestCuts: [
      { name: "Textured crop", why: "Adds softness and movement up top to balance a strong, angular jaw." },
      { name: "Side part", why: "A sharp classic that complements the face's natural structure." },
      { name: "Medium swept back", why: "Length with a little height flatters square proportions and reads put-together." },
      { name: "Buzz / short back and sides", why: "One of the few shapes a buzz genuinely suits — it showcases a strong jaw." },
    ],
    avoid: [
      { name: "Very boxy, blunt styles", why: "Hard, squared lines up top can over-square an already angular face." },
    ],
    styling: "A medium-hold matte paste adds soft texture that balances the jaw without looking rigid or overly sharp.",
    stylingQuery: "matte hair paste men",
    proTip: "You can go either way — sharpen the look with tighter sides, or soften it with texture on top. Both read well, so pick by the vibe you want.",
    faqs: [
      { q: "What haircut suits a square face?", a: "A textured crop, side part, medium swept-back, or even a buzz all work. Add softness on top if you want to balance the strong jaw, or keep it sharp to lean into it." },
      { q: "Can square faces pull off a buzz cut?", a: "Yes — square is one of the shapes a buzz genuinely flatters, because it showcases a strong, defined jaw." },
      { q: "How do I know my face is square?", a: "Forehead, cheeks and jaw are similar width with an angular, sharp jawline. AuraCheck detects it from one photo, free." },
    ],
  }),
  H({
    slug: "oblong",
    shape: "Oblong",
    shapeLower: "oblong",
    metaTitle: "Best Haircuts for an Oblong (Long) Face Shape (2026 Men's Guide)",
    metaDescription: "Oblong faces look best with width, not height. See the best haircuts to balance a long face, what to avoid, and how to style them.",
    intro: "An oblong (long) face is noticeably longer than it is wide, often with a tall forehead. The goal is the opposite of a round face: reduce length and add width with fringes, medium sides and flatter styles.",
    howToTell: "Your face is clearly longer than wide, your forehead is tall, and your cheeks, jaw and forehead are similar in width. If length is your dominant feature, you're likely oblong.",
    bestCuts: [
      { name: "Fringe / forward styles", why: "Bringing hair onto the forehead shortens the face and cuts the length." },
      { name: "Medium sides with fullness", why: "Width at the sides balances a long face far better than a tight fade." },
      { name: "Low fade", why: "Keeps volume lower and wider rather than adding to the height." },
      { name: "Textured crop with fringe", why: "Modern and low-effort, and the fringe does the length-reducing work." },
    ],
    avoid: [
      { name: "Tall styles and big pompadours", why: "Extra height stretches an already long face." },
      { name: "Long goatees", why: "They add even more length to the chin — keep facial hair fuller on the sides." },
    ],
    styling: "A low-shine cream helps you keep width and a soft fringe without stiff height — exactly what an oblong face wants.",
    stylingQuery: "hair styling cream men matte",
    proTip: "Think horizontal, not vertical: a fringe and a little width at the sides do more for a long face than any amount of product on top.",
    faqs: [
      { q: "What haircut suits a long (oblong) face?", a: "Fringe and forward styles, medium sides with fullness, and low fades — anything that adds width and reduces length. Avoid tall styles." },
      { q: "Should oblong faces have a fringe?", a: "Yes — a fringe is one of the best tools for a long face, because it shortens the forehead and cuts overall length." },
      { q: "How do I know my face is oblong?", a: "It's clearly longer than wide with a tall forehead. AuraCheck detects your face shape from one photo, free." },
    ],
  }),
  H({
    slug: "heart",
    shape: "Heart",
    shapeLower: "heart",
    metaTitle: "Best Haircuts for a Heart Face Shape (2026 Men's Guide)",
    metaDescription: "Heart faces balance a wide forehead with a narrow chin. See the best haircuts for a heart-shaped face, what to avoid, and how to style them.",
    intro: "A heart face has a wider forehead that narrows to a pointed chin. The goal is to avoid adding width or volume up top and instead balance the narrower lower face — medium lengths and softer, textured styles work best.",
    howToTell: "Your forehead is the widest part of your face and your chin is narrow or pointed, often with higher cheekbones. Width up top and a narrow chin is the classic heart tell.",
    bestCuts: [
      { name: "Medium length", why: "Adds a little weight around the lower face to balance a wider forehead." },
      { name: "Side-swept fringe", why: "Softens and slightly narrows the forehead without covering it completely." },
      { name: "Textured, not too voluminous", why: "Movement without big height keeps the top from widening further." },
      { name: "Longer on top, natural fall", why: "Length that falls rather than lifts balances your proportions." },
    ],
    avoid: [
      { name: "Heavy volume up top", why: "Extra height and width exaggerate an already wider forehead." },
      { name: "Very short, tight sides with a big top", why: "The contrast makes the forehead look even wider." },
    ],
    styling: "A light, pliable cream keeps texture soft and low so the top doesn't widen — pair it with a fuller-on-the-chin beard to add lower-face width.",
    stylingQuery: "light hold hair cream men",
    proTip: "A little beard or stubble on the chin is your secret weapon — it adds width exactly where a heart face is narrowest.",
    faqs: [
      { q: "What haircut suits a heart-shaped face?", a: "Medium lengths, a side-swept fringe, and soft textured styles that don't add volume up top. The aim is to balance a wider forehead with a narrower chin." },
      { q: "Should heart faces grow a beard?", a: "Often yes — a fuller beard around the chin adds width to the narrowest part of a heart face and improves overall balance." },
      { q: "How do I know my face is heart-shaped?", a: "A wide forehead narrowing to a pointed chin, often with high cheekbones. AuraCheck detects it from one photo, free." },
    ],
  }),
  H({
    slug: "diamond",
    shape: "Diamond",
    shapeLower: "diamond",
    metaTitle: "Best Haircuts for a Diamond Face Shape (2026 Men's Guide)",
    metaDescription: "Diamond faces have wide cheekbones and a narrow forehead and chin. See the best haircuts for a diamond face, what to avoid, and how to style them.",
    intro: "A diamond face has prominent cheekbones with a narrower forehead and chin. The goal is to add width and fullness at the forehead and soften the cheekbones — fringes and textured, fuller-on-top styles work best.",
    howToTell: "Your cheekbones are the widest part of your face, while your forehead and chin are narrower and your jaw comes to a soft point. Standout cheekbones are the giveaway.",
    bestCuts: [
      { name: "Fringe", why: "Adds width at a narrow forehead and draws the eye up, away from the cheekbones." },
      { name: "Longer on top with texture", why: "Fullness up top balances wide cheekbones and broadens the forehead." },
      { name: "Textured, tousled styles", why: "Soft movement offsets sharp cheekbones for a more balanced look." },
      { name: "Side-swept fringe", why: "Widens the forehead while keeping the style soft and natural." },
    ],
    avoid: [
      { name: "Slicked-back styles", why: "Pulling everything back fully exposes and exaggerates the cheekbones." },
      { name: "Very tight sides with no top volume", why: "They narrow the head further and over-emphasise the cheekbones." },
    ],
    styling: "A matte clay builds soft fullness and a fringe without shine — exactly the volume a diamond face wants at the top.",
    stylingQuery: "matte hair clay men",
    proTip: "Volume and width belong at your forehead, not your crown — keep the top full and forward rather than slicked flat or back.",
    faqs: [
      { q: "What haircut suits a diamond face?", a: "Fringes, longer-on-top textured styles, and tousled cuts that add width at the forehead and soften prominent cheekbones. Avoid slicked-back looks." },
      { q: "Why should diamond faces avoid slicked-back hair?", a: "Slicking everything back fully exposes the cheekbones — the widest part of a diamond face — and exaggerates them. Keep some fullness and a fringe instead." },
      { q: "How do I know my face is diamond?", a: "Wide cheekbones with a narrower forehead and chin, and a soft-pointed jaw. AuraCheck detects it from one photo, free." },
    ],
  }),
];

export function getHaircutGuide(slug: string): HaircutGuide | undefined {
  return HAIRCUT_GUIDES.find((g) => g.slug === slug.toLowerCase());
}
