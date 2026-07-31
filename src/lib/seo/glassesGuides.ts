// Content for the "best glasses for your face shape" SEO guides. Each entry is
// genuine, substantive eyewear guidance (frames that flatter, what to avoid,
// how to tell your shape) — not thin templated filler — because thin pages hurt
// both ranking and the brand. Every guide funnels to a free face scan (→ ₹25)
// and a Lenskart shop link (→ eyewear commission).

export interface GlassesGuide {
  slug: string;
  shape: string;          // "Oval"
  shapeLower: string;     // "oval"
  metaTitle: string;
  metaDescription: string;
  intro: string;
  howToTell: string;
  bestFrames: { name: string; why: string }[];
  avoid: { name: string; why: string }[];
  proTip: string;
  faqs: { q: string; a: string }[];
}

const G = (g: GlassesGuide) => g;

export const GLASSES_GUIDES: GlassesGuide[] = [
  G({
    slug: "oval",
    shape: "Oval",
    shapeLower: "oval",
    metaTitle: "Best Glasses for an Oval Face Shape (2026 Frame Guide)",
    metaDescription: "Oval faces suit almost every frame — but a few shapes flatter most. See the best glasses for an oval face, what to avoid, and how to shop them.",
    intro: "An oval face is the most balanced and versatile shape — slightly longer than it is wide, with a gently rounded jaw and forehead of similar width. The good news: you can pull off almost any frame. The goal is simply to keep your natural balance and not overwhelm your proportions.",
    howToTell: "Your face length is a little greater than its width, your forehead is marginally wider than your jaw, and your jawline is soft and rounded rather than angular. If a hair tie pulls your hair back and everything looks proportional and symmetrical, you're likely oval.",
    bestFrames: [
      { name: "Rectangular frames", why: "Add gentle structure and keep an oval face from looking too long, while sharpening soft features." },
      { name: "Square frames", why: "Introduce angles that contrast your soft jaw for a sharper, more defined look." },
      { name: "Wayfarers", why: "A universally flattering, slightly angular classic that suits oval proportions effortlessly." },
      { name: "Geometric / browline", why: "Statement shapes work because your balanced proportions can carry them without looking off." },
    ],
    avoid: [
      { name: "Oversized frames that cover too much", why: "They shrink your features and hide the balance that's your biggest asset." },
      { name: "Very narrow frames", why: "They exaggerate the length of an oval face." },
    ],
    proTip: "Match the frame width to the widest part of your face and keep the top of the frame level with or just below your brow line — that single detail makes cheap frames look tailored.",
    faqs: [
      { q: "What is the most flattering glasses shape for an oval face?", a: "Rectangular and square frames are the safest bets — they add structure that complements an oval face's soft balance. Wayfarers are the easiest all-rounder." },
      { q: "Can oval faces wear round glasses?", a: "Yes, but keep them medium-sized. Very round frames on a round-jawed oval face can soften your features more than you may want." },
    ],
  }),
  G({
    slug: "round",
    shape: "Round",
    shapeLower: "round",
    metaTitle: "Best Glasses for a Round Face Shape (Frames That Slim & Define)",
    metaDescription: "Round faces look best in frames that add angles and length. See the best glasses for a round face, what to avoid, and where to shop them.",
    intro: "A round face has soft curves with roughly equal width and length and full cheeks. The right glasses do one job brilliantly: add angles and the illusion of length, so your face looks more defined and a touch slimmer.",
    howToTell: "Your face is about as wide as it is long, your cheeks are the widest point, and your jaw and forehead are soft and rounded with no hard angles.",
    bestFrames: [
      { name: "Rectangular frames", why: "The single best pick — horizontal width and hard corners visually lengthen and slim a round face." },
      { name: "Angular / square frames", why: "Sharp corners contrast your curves and add instant definition." },
      { name: "Wayfarers", why: "Their flat top bar and angles break up the roundness while staying casual." },
    ],
    avoid: [
      { name: "Round frames", why: "They echo and emphasise the roundness you're trying to balance." },
      { name: "Small or rimless frames", why: "They get lost on full cheeks and add no structure." },
    ],
    proTip: "Go for frames that are wider than they are tall, and pick a pair that sits high on the nose — it lengthens the face and lifts the whole look.",
    faqs: [
      { q: "What glasses make a round face look thinner?", a: "Rectangular and angular frames that are wider than they are tall. The horizontal line and sharp corners add length and definition, which slims the face." },
      { q: "Should round faces avoid round glasses?", a: "Generally yes — round frames reinforce a round face. If you love the round look, choose a slightly angular 'panto' shape instead of a full circle." },
    ],
  }),
  G({
    slug: "square",
    shape: "Square",
    shapeLower: "square",
    metaTitle: "Best Glasses for a Square Face Shape (Soften a Strong Jaw)",
    metaDescription: "Square faces suit round and oval frames that soften a strong jaw. See the best glasses for a square face, what to avoid, and where to shop them.",
    intro: "A square face has a strong, wide jaw, a broad forehead, and angular features of similar width top to bottom. Your best frames soften those powerful angles — or lean into them deliberately. Both read well; it's about the effect you want.",
    howToTell: "Your forehead, cheekbones and jaw are all a similar width, your jawline is strong and angular, and your face length and width are close to equal.",
    bestFrames: [
      { name: "Round frames", why: "Curves are the direct counterpoint to a square jaw — they soften and balance strong angles beautifully." },
      { name: "Oval frames", why: "Gently rounded, they take the edge off angular features while staying understated." },
      { name: "Rimless / thin frames", why: "They downplay hard lines and let your bone structure do the talking." },
    ],
    avoid: [
      { name: "Boxy, sharp square frames", why: "They pile angles on angles and can over-square an already strong face." },
      { name: "Very small frames", why: "They exaggerate the width of a square jaw by contrast." },
    ],
    proTip: "Choose frames with a bit of curve on the top edge and keep them slightly wider than your cheekbones — it balances the jaw without hiding your best structural features.",
    faqs: [
      { q: "What glasses suit a square face?", a: "Round and oval frames are ideal — their curves soften a strong, angular jaw. Rimless frames also work by downplaying hard lines." },
      { q: "Can a square face wear rectangular glasses?", a: "It can, but they add angles to an already angular face. If you want that sharp look, keep them softly cornered rather than boxy." },
    ],
  }),
  G({
    slug: "oblong",
    shape: "Oblong",
    shapeLower: "oblong",
    metaTitle: "Best Glasses for an Oblong (Long) Face Shape",
    metaDescription: "Long / oblong faces suit tall, wide frames that add width and cut length. See the best glasses for an oblong face, what to avoid, and where to shop.",
    intro: "An oblong (or long) face is noticeably longer than it is wide, often with a tall forehead and a longer chin. The right glasses add width and break up the length so your face looks more proportioned.",
    howToTell: "Your face is clearly longer than it is wide, your forehead, cheeks and jaw are similar in width, and your chin or forehead adds noticeable length.",
    bestFrames: [
      { name: "Wide / oversized frames", why: "Extra width visually shortens a long face and restores balance." },
      { name: "Frames with decorative or contrasting temples", why: "They draw the eye sideways, cutting the sense of length." },
      { name: "Tall (deep) frames", why: "A frame with more height covers more of the face's length, making it look shorter." },
    ],
    avoid: [
      { name: "Short, narrow frames", why: "They make a long face look even longer and thinner." },
      { name: "Small round frames", why: "They get lost and add nothing to balance the length." },
    ],
    proTip: "Look for frames with a strong, dark or decorative temple and enough depth to sit from your brow to mid-cheek — that horizontal weight is what shortens the face.",
    faqs: [
      { q: "What glasses make a long face look shorter?", a: "Wide, deep frames with bold or decorative temples. The added width and side detail break up the vertical length that defines an oblong face." },
      { q: "Should oblong faces wear big glasses?", a: "Yes — oversized and tall frames suit oblong faces because they add the width and coverage that balances the length." },
    ],
  }),
  G({
    slug: "heart",
    shape: "Heart",
    shapeLower: "heart",
    metaTitle: "Best Glasses for a Heart-Shaped Face (Balance a Wide Forehead)",
    metaDescription: "Heart faces suit bottom-heavy, round and rimless frames that balance a wide forehead and narrow chin. See the best glasses and where to shop them.",
    intro: "A heart-shaped face is widest at the forehead and cheekbones and tapers to a narrow, often pointed chin. The best glasses add visual weight to the lower half of your face so your proportions feel balanced.",
    howToTell: "Your forehead is the widest part of your face, your cheekbones are high, and your chin comes to a narrow point. Sometimes a widow's peak is present.",
    bestFrames: [
      { name: "Bottom-heavy frames", why: "Weight and colour along the lower rim balance a narrow chin against a wider forehead." },
      { name: "Round frames", why: "Soft curves offset the angles of a heart face and add width lower down." },
      { name: "Light or rimless frames", why: "They avoid adding bulk up top where your face is already widest." },
    ],
    avoid: [
      { name: "Heavy, top-bar / browline frames", why: "They add weight to an already-wide forehead, exaggerating the imbalance." },
      { name: "Decorative, wide temples", why: "They broaden the top of the face further." },
    ],
    proTip: "Keep the top of the frame clean and thin, and let any colour or detail sit on the lower half — it draws the eye down and widens the chin visually.",
    faqs: [
      { q: "What glasses suit a heart-shaped face?", a: "Bottom-heavy, round and rimless frames. They add balance to the lower face and avoid widening an already-broad forehead." },
      { q: "Should heart faces avoid browline glasses?", a: "Usually, yes — a heavy top bar adds weight to a wide forehead. If you love browline frames, pick a thin, light version." },
    ],
  }),
  G({
    slug: "diamond",
    shape: "Diamond",
    shapeLower: "diamond",
    metaTitle: "Best Glasses for a Diamond Face Shape (Wide Cheekbones)",
    metaDescription: "Diamond faces suit oval, rimless and cat-eye frames that soften wide cheekbones. See the best glasses for a diamond face and where to shop them.",
    intro: "A diamond face has dramatic, wide cheekbones with a narrower forehead and chin. The right glasses soften those prominent cheekbones and add width to the forehead so your features feel balanced.",
    howToTell: "Your cheekbones are the widest part of your face, while your forehead and chin are narrower and your jaw is pointed. It's one of the rarer, more striking shapes.",
    bestFrames: [
      { name: "Oval frames", why: "Soft and balanced, they gently offset prominent cheekbones without competing with them." },
      { name: "Rimless frames", why: "They minimise width at the cheekbones and keep the look light and open." },
      { name: "Cat-eye / soft browline", why: "Detail at the top adds width to a narrow forehead, balancing the diamond taper." },
    ],
    avoid: [
      { name: "Narrow frames", why: "They emphasise the width of your cheekbones by contrast." },
      { name: "Boxy, slicked-back looks with bare temples", why: "They expose and exaggerate the cheekbones." },
    ],
    proTip: "Choose frames that are as wide as (or slightly wider than) your cheekbones with a little detail on the top edge — it lifts and widens the forehead to match.",
    faqs: [
      { q: "What glasses suit a diamond face?", a: "Oval, rimless and cat-eye frames. They soften wide cheekbones and add balancing width to a narrower forehead." },
      { q: "Are diamond faces rare?", a: "Yes — diamond is one of the less common shapes, defined by cheekbones that are wider than both the forehead and the jaw." },
    ],
  }),
];

export function getGlassesGuide(slug: string): GlassesGuide | undefined {
  return GLASSES_GUIDES.find((g) => g.slug === slug);
}
