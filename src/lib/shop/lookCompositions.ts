import type { Look } from "./catalogTypes";
import { HERO_LOOKS } from "./heroLooks";
import { getExactProductLink } from "./exactProductLinks";

export interface LookPieceRef {
  slot: string;
  productId: string;
}

export interface LookComposition {
  lookName: string;
  stylingNote: string;
  pieces: LookPieceRef[];
}

export interface ResolvedLookPiece {
  slot: string;
  item: Look;
  productTitle: string;
  buyUrl: string;
}

const HERO_LOOKS_BY_ID = new Map(HERO_LOOKS.map((look) => [look.id, look]));

const LOOK_COMPOSITIONS: Record<string, LookComposition> = {
  "hero-m-001": { lookName: "Street Starter Look", stylingNote: "A black oversized tee, dark denim, clean white sneakers, and a simple watch give you an easy off-duty frame that still photographs sharp.", pieces: [{ slot: "Top", productId: "hero-m-001" }, { slot: "Bottom", productId: "hero-m-020" }, { slot: "Shoes", productId: "hero-m-030" }, { slot: "Accessory", productId: "hero-m-040" }] },
  "hero-m-002": { lookName: "Clean Date-Night Look", stylingNote: "A fitted white tee with black trousers and brown loafers keeps the silhouette simple and expensive-looking.", pieces: [{ slot: "Top", productId: "hero-m-002" }, { slot: "Bottom", productId: "hero-m-021" }, { slot: "Shoes", productId: "hero-m-033" }, { slot: "Accessory", productId: "hero-m-040" }] },
  "hero-m-003": { lookName: "Smart Casual Polo Look", stylingNote: "The navy polo and beige chinos combo works when you want to look polished without reading over-dressed.", pieces: [{ slot: "Top", productId: "hero-m-003" }, { slot: "Bottom", productId: "hero-m-022" }, { slot: "Shoes", productId: "hero-m-033" }, { slot: "Accessory", productId: "hero-m-042" }] },
  "hero-m-004": { lookName: "Olive Utility Look", stylingNote: "This olive tee, straight denim, and runners combination reads rugged but still clean enough for casual photos.", pieces: [{ slot: "Top", productId: "hero-m-004" }, { slot: "Bottom", productId: "hero-m-023" }, { slot: "Shoes", productId: "hero-m-032" }, { slot: "Accessory", productId: "hero-m-043" }] },
  "hero-m-005": { lookName: "Charcoal Minimal Look", stylingNote: "A charcoal henley and black trousers give you shape and contrast without needing loud styling.", pieces: [{ slot: "Top", productId: "hero-m-005" }, { slot: "Bottom", productId: "hero-m-021" }, { slot: "Shoes", productId: "hero-m-031" }, { slot: "Accessory", productId: "hero-m-041" }] },
  "hero-m-010": { lookName: "White Oxford Office Look", stylingNote: "This is the easiest crisp office fit: white oxford, dark denim, white sneakers, and a clean watch.", pieces: [{ slot: "Top", productId: "hero-m-010" }, { slot: "Bottom", productId: "hero-m-020" }, { slot: "Shoes", productId: "hero-m-030" }, { slot: "Accessory", productId: "hero-m-040" }] },
  "hero-m-011": { lookName: "Blue Shirt Work Look", stylingNote: "The light-blue shirt and black trousers pairing is safe in the best possible way: neat, sharp, and reliable.", pieces: [{ slot: "Top", productId: "hero-m-011" }, { slot: "Bottom", productId: "hero-m-021" }, { slot: "Shoes", productId: "hero-m-033" }, { slot: "Accessory", productId: "hero-m-040" }] },
  "hero-m-012": { lookName: "Black Camp-Collar Evening Look", stylingNote: "Relaxed black linen up top with beige chinos underneath gives you that dressed-but-not-trying energy.", pieces: [{ slot: "Top", productId: "hero-m-012" }, { slot: "Bottom", productId: "hero-m-022" }, { slot: "Shoes", productId: "hero-m-033" }, { slot: "Accessory", productId: "hero-m-041" }] },
  "hero-m-013": { lookName: "Layered Beige Overshirt Look", stylingNote: "A beige overshirt over dark jeans gives bulk up top and a cleaner silhouette in full-body shots.", pieces: [{ slot: "Layer", productId: "hero-m-013" }, { slot: "Bottom", productId: "hero-m-020" }, { slot: "Shoes", productId: "hero-m-030" }, { slot: "Accessory", productId: "hero-m-043" }] },
  "hero-m-014": { lookName: "Resort Linen Look", stylingNote: "The white resort shirt, beige chinos, loafers, and sunglasses make a travel or cafe fit look instantly more intentional.", pieces: [{ slot: "Top", productId: "hero-m-014" }, { slot: "Bottom", productId: "hero-m-022" }, { slot: "Shoes", productId: "hero-m-033" }, { slot: "Accessory", productId: "hero-m-041" }] },
  "hero-m-020": { lookName: "Dark Denim Everyday Look", stylingNote: "Dark indigo jeans work best when the rest stays clean: white tee, white sneakers, and one sharp accessory.", pieces: [{ slot: "Top", productId: "hero-m-002" }, { slot: "Bottom", productId: "hero-m-020" }, { slot: "Shoes", productId: "hero-m-030" }, { slot: "Accessory", productId: "hero-m-040" }] },
  "hero-m-021": { lookName: "Black Trouser Power Look", stylingNote: "Black tailored trousers anchor the whole fit and make even a simple top look more expensive.", pieces: [{ slot: "Top", productId: "hero-m-010" }, { slot: "Bottom", productId: "hero-m-021" }, { slot: "Shoes", productId: "hero-m-033" }, { slot: "Accessory", productId: "hero-m-042" }] },
  "hero-m-022": { lookName: "Beige Chino Smart Look", stylingNote: "Beige chinos with a polo and loafers give you the easiest soft, premium smart-casual look.", pieces: [{ slot: "Top", productId: "hero-m-003" }, { slot: "Bottom", productId: "hero-m-022" }, { slot: "Shoes", productId: "hero-m-033" }, { slot: "Accessory", productId: "hero-m-040" }] },
  "hero-m-023": { lookName: "Grey Athleisure Look", stylingNote: "Tapered joggers only work when the upper half stays structured, so this look keeps the casual side cleaned up.", pieces: [{ slot: "Top", productId: "hero-m-004" }, { slot: "Bottom", productId: "hero-m-023" }, { slot: "Shoes", productId: "hero-m-032" }, { slot: "Accessory", productId: "hero-m-043" }] },
  "hero-m-030": { lookName: "Minimal White Sneaker Look", stylingNote: "White sneakers are the bridge piece that makes dark denim and a plain tee feel fully styled.", pieces: [{ slot: "Top", productId: "hero-m-002" }, { slot: "Bottom", productId: "hero-m-020" }, { slot: "Shoes", productId: "hero-m-030" }, { slot: "Accessory", productId: "hero-m-041" }] },
  "hero-m-031": { lookName: "Chelsea Boot Night Look", stylingNote: "Black suede boots lift a charcoal-and-black outfit fast, especially in low-light evening pictures.", pieces: [{ slot: "Top", productId: "hero-m-005" }, { slot: "Bottom", productId: "hero-m-021" }, { slot: "Shoes", productId: "hero-m-031" }, { slot: "Fragrance", productId: "hero-m-050" }] },
  "hero-m-032": { lookName: "Runner Street Look", stylingNote: "Performance sneakers look best when the rest of the outfit still feels edited, not random gym wear.", pieces: [{ slot: "Top", productId: "hero-m-004" }, { slot: "Bottom", productId: "hero-m-023" }, { slot: "Shoes", productId: "hero-m-032" }, { slot: "Accessory", productId: "hero-m-041" }] },
  "hero-m-033": { lookName: "Loafer Upgrade Look", stylingNote: "Brown loafers change the whole tone of a simple shirt-and-trouser combination from average to put-together.", pieces: [{ slot: "Top", productId: "hero-m-011" }, { slot: "Bottom", productId: "hero-m-021" }, { slot: "Shoes", productId: "hero-m-033" }, { slot: "Accessory", productId: "hero-m-040" }] },
  "hero-m-040": { lookName: "Watch-Finished Minimal Look", stylingNote: "This outfit stays simple, then the watch adds the one detail that makes it feel finished rather than plain.", pieces: [{ slot: "Top", productId: "hero-m-003" }, { slot: "Bottom", productId: "hero-m-022" }, { slot: "Shoes", productId: "hero-m-033" }, { slot: "Accessory", productId: "hero-m-040" }] },
  "hero-m-041": { lookName: "Sunglasses Summer Look", stylingNote: "A resort shirt, chinos, and sunglasses are enough to make vacation or outdoor photos feel intentional.", pieces: [{ slot: "Top", productId: "hero-m-014" }, { slot: "Bottom", productId: "hero-m-022" }, { slot: "Shoes", productId: "hero-m-030" }, { slot: "Accessory", productId: "hero-m-041" }] },
  "hero-m-042": { lookName: "Slim Wallet Date Look", stylingNote: "Small accessories matter most when the rest of the look is quiet and fitted.", pieces: [{ slot: "Top", productId: "hero-m-012" }, { slot: "Bottom", productId: "hero-m-021" }, { slot: "Shoes", productId: "hero-m-033" }, { slot: "Accessory", productId: "hero-m-042" }] },
  "hero-m-043": { lookName: "Campus Backpack Look", stylingNote: "A dark backpack works best with clean casual basics so it reads intentional, not school-uniform accidental.", pieces: [{ slot: "Top", productId: "hero-m-001" }, { slot: "Bottom", productId: "hero-m-020" }, { slot: "Shoes", productId: "hero-m-030" }, { slot: "Bag", productId: "hero-m-043" }] },
  "hero-m-050": { lookName: "Fresh Daytime Look", stylingNote: "A simple, clean outfit plus a fresh fragrance gives you the easiest all-round dating or campus combo.", pieces: [{ slot: "Top", productId: "hero-m-002" }, { slot: "Bottom", productId: "hero-m-022" }, { slot: "Shoes", productId: "hero-m-030" }, { slot: "Fragrance", productId: "hero-m-050" }] },
  "hero-m-051": { lookName: "Evening Signature Look", stylingNote: "Darker tones, sharper shoes, and a richer scent create a stronger after-dark presence.", pieces: [{ slot: "Top", productId: "hero-m-012" }, { slot: "Bottom", productId: "hero-m-021" }, { slot: "Shoes", productId: "hero-m-031" }, { slot: "Fragrance", productId: "hero-m-051" }] },
  "hero-m-060": { lookName: "Groomed Casual Look", stylingNote: "Good basics only look premium when the grooming signal matches, so this look bundles both.", pieces: [{ slot: "Top", productId: "hero-m-005" }, { slot: "Bottom", productId: "hero-m-020" }, { slot: "Shoes", productId: "hero-m-030" }, { slot: "Grooming", productId: "hero-m-060" }] },
  "hero-m-061": { lookName: "Textured Hair Clean Look", stylingNote: "This one is about shape: a cleaner haircut finish plus a simple monochrome outfit.", pieces: [{ slot: "Top", productId: "hero-m-002" }, { slot: "Bottom", productId: "hero-m-021" }, { slot: "Shoes", productId: "hero-m-031" }, { slot: "Grooming", productId: "hero-m-061" }] },
  "hero-w-001": { lookName: "Clean White Denim Look", stylingNote: "A fitted white top, black jeans, platform sneakers, and a small bag give an effortless polished casual frame.", pieces: [{ slot: "Top", productId: "hero-w-001" }, { slot: "Bottom", productId: "hero-w-020" }, { slot: "Shoes", productId: "hero-w-030" }, { slot: "Bag", productId: "hero-w-042" }] },
  "hero-w-002": { lookName: "Black Going-Out Look", stylingNote: "The black bodysuit anchors the whole outfit, then cream trousers and heels keep it sleek instead of heavy.", pieces: [{ slot: "Top", productId: "hero-w-002" }, { slot: "Bottom", productId: "hero-w-021" }, { slot: "Shoes", productId: "hero-w-031" }, { slot: "Accessory", productId: "hero-w-040" }] },
  "hero-w-003": { lookName: "Soft Sage Weekend Look", stylingNote: "Muted sage, blue denim, and a tote give you a softer, more expensive-looking daytime vibe.", pieces: [{ slot: "Top", productId: "hero-w-003" }, { slot: "Bottom", productId: "hero-w-022" }, { slot: "Shoes", productId: "hero-w-032" }, { slot: "Bag", productId: "hero-w-043" }] },
  "hero-w-004": { lookName: "Breton City Look", stylingNote: "Stripes work when everything else stays pared back, so this look keeps the accessories crisp and simple.", pieces: [{ slot: "Top", productId: "hero-w-004" }, { slot: "Bottom", productId: "hero-w-020" }, { slot: "Shoes", productId: "hero-w-030" }, { slot: "Accessory", productId: "hero-w-042" }] },
  "hero-w-010": { lookName: "Black Wrap Dress Look", stylingNote: "This is your easiest one-piece date-night answer: wrap dress, block heels, and hoops.", pieces: [{ slot: "Dress", productId: "hero-w-010" }, { slot: "Shoes", productId: "hero-w-031" }, { slot: "Bag", productId: "hero-w-042" }, { slot: "Accessory", productId: "hero-w-040" }] },
  "hero-w-011": { lookName: "White Shirt-Dress Power Look", stylingNote: "A shirt dress already does most of the work, so the rest just needs to look clean and structured.", pieces: [{ slot: "Dress", productId: "hero-w-011" }, { slot: "Shoes", productId: "hero-w-031" }, { slot: "Bag", productId: "hero-w-043" }, { slot: "Accessory", productId: "hero-w-041" }] },
  "hero-w-012": { lookName: "Dark Floral Evening Look", stylingNote: "The floral dress carries the personality, so the shoes and accessories only need to refine it.", pieces: [{ slot: "Dress", productId: "hero-w-012" }, { slot: "Shoes", productId: "hero-w-031" }, { slot: "Bag", productId: "hero-w-042" }, { slot: "Fragrance", productId: "hero-w-050" }] },
  "hero-w-020": { lookName: "Black-Jeans Core Look", stylingNote: "Black jeans are the grounding piece here; the white top and sneakers keep the look crisp for everyday use.", pieces: [{ slot: "Top", productId: "hero-w-001" }, { slot: "Bottom", productId: "hero-w-020" }, { slot: "Shoes", productId: "hero-w-030" }, { slot: "Accessory", productId: "hero-w-040" }] },
  "hero-w-021": { lookName: "Cream Trouser Editorial Look", stylingNote: "Cream wide-leg trousers immediately create movement, so the styling just needs one strong top and one neat accessory.", pieces: [{ slot: "Top", productId: "hero-w-002" }, { slot: "Bottom", productId: "hero-w-021" }, { slot: "Shoes", productId: "hero-w-031" }, { slot: "Bag", productId: "hero-w-043" }] },
  "hero-w-022": { lookName: "Mom-Jeans Casual Look", stylingNote: "Relaxed jeans, a soft linen top, and flats make this one easy to wear and easy to photograph.", pieces: [{ slot: "Top", productId: "hero-w-003" }, { slot: "Bottom", productId: "hero-w-022" }, { slot: "Shoes", productId: "hero-w-032" }, { slot: "Bag", productId: "hero-w-042" }] },
  "hero-w-030": { lookName: "Platform Sneaker Street Look", stylingNote: "The chunkier sneaker does the lifting here, so the rest of the outfit stays clean and body-skimming.", pieces: [{ slot: "Top", productId: "hero-w-001" }, { slot: "Bottom", productId: "hero-w-020" }, { slot: "Shoes", productId: "hero-w-030" }, { slot: "Accessory", productId: "hero-w-041" }] },
  "hero-w-031": { lookName: "Nude-Heel Date Look", stylingNote: "Block heels work best when the rest of the outfit is smooth and minimal rather than overly busy.", pieces: [{ slot: "Top", productId: "hero-w-002" }, { slot: "Bottom", productId: "hero-w-021" }, { slot: "Shoes", productId: "hero-w-031" }, { slot: "Accessory", productId: "hero-w-040" }] },
  "hero-w-032": { lookName: "Black Flats Work Look", stylingNote: "Pointed flats let the outfit stay practical while still feeling office-ready and neat.", pieces: [{ slot: "Top", productId: "hero-w-003" }, { slot: "Bottom", productId: "hero-w-021" }, { slot: "Shoes", productId: "hero-w-032" }, { slot: "Bag", productId: "hero-w-043" }] },
  "hero-w-040": { lookName: "Gold-Hoops Everyday Look", stylingNote: "Hoops are the last ten percent that stop a simple tee-and-jeans outfit from feeling unfinished.", pieces: [{ slot: "Top", productId: "hero-w-001" }, { slot: "Bottom", productId: "hero-w-022" }, { slot: "Shoes", productId: "hero-w-030" }, { slot: "Accessory", productId: "hero-w-040" }] },
  "hero-w-041": { lookName: "Layered-Necklace Soft Glam Look", stylingNote: "The necklace gives a clean neckline more depth, which helps close-up selfies read more styled.", pieces: [{ slot: "Top", productId: "hero-w-002" }, { slot: "Bottom", productId: "hero-w-021" }, { slot: "Shoes", productId: "hero-w-031" }, { slot: "Accessory", productId: "hero-w-041" }] },
  "hero-w-042": { lookName: "Crossbody Weekend Look", stylingNote: "This is a reliable run-around look: easy top, black jeans, sneakers, and a structured small bag.", pieces: [{ slot: "Top", productId: "hero-w-004" }, { slot: "Bottom", productId: "hero-w-020" }, { slot: "Shoes", productId: "hero-w-030" }, { slot: "Bag", productId: "hero-w-042" }] },
  "hero-w-043": { lookName: "Structured Tote Office Look", stylingNote: "The tote pushes the whole outfit more grown-up, especially when paired with cream trousers and flats.", pieces: [{ slot: "Top", productId: "hero-w-003" }, { slot: "Bottom", productId: "hero-w-021" }, { slot: "Shoes", productId: "hero-w-032" }, { slot: "Bag", productId: "hero-w-043" }] },
  "hero-w-050": { lookName: "Soft-Scent Feminine Look", stylingNote: "This one stays light, easy, and polished, with the fragrance acting as the finishing move rather than the whole story.", pieces: [{ slot: "Top", productId: "hero-w-001" }, { slot: "Bottom", productId: "hero-w-022" }, { slot: "Shoes", productId: "hero-w-032" }, { slot: "Fragrance", productId: "hero-w-050" }] },
  "hero-w-060": { lookName: "Minimal Kurta Look", stylingNote: "A simple white kurta looks strongest when everything around it stays neutral and clean.", pieces: [{ slot: "Kurta", productId: "hero-w-060" }, { slot: "Shoes", productId: "hero-w-032" }, { slot: "Bag", productId: "hero-w-043" }, { slot: "Accessory", productId: "hero-w-040" }] },
  "hero-w-061": { lookName: "Indigo Kurti Day Look", stylingNote: "The printed kurti already brings the personality, so the rest of the look only needs balance and polish.", pieces: [{ slot: "Kurti", productId: "hero-w-061" }, { slot: "Shoes", productId: "hero-w-032" }, { slot: "Bag", productId: "hero-w-042" }, { slot: "Accessory", productId: "hero-w-041" }] },
  "hero-u-001": { lookName: "Creator Lighting Setup", stylingNote: "This is the fastest way to make your photos look cleaner before you buy anything else for style.", pieces: [{ slot: "Light", productId: "hero-u-001" }, { slot: "Tripod", productId: "hero-u-004" }, { slot: "Backdrop", productId: "hero-u-003" }, { slot: "Lens", productId: "hero-u-002" }] },
  "hero-u-002": { lookName: "Phone-Camera Upgrade Setup", stylingNote: "This bundle improves framing, stability, and lighting together so your pictures stop looking accidental.", pieces: [{ slot: "Lens", productId: "hero-u-002" }, { slot: "Light", productId: "hero-u-001" }, { slot: "Tripod", productId: "hero-u-004" }, { slot: "Backdrop", productId: "hero-u-003" }] },
  "hero-u-003": { lookName: "Clean Background Setup", stylingNote: "A simple neutral background removes the room-noise problem that ruins otherwise decent photos.", pieces: [{ slot: "Backdrop", productId: "hero-u-003" }, { slot: "Light", productId: "hero-u-001" }, { slot: "Tripod", productId: "hero-u-004" }, { slot: "Lens", productId: "hero-u-002" }] },
  "hero-u-004": { lookName: "Stable Framing Setup", stylingNote: "A tripod-based setup makes it much easier to get repeatable photos with better posture, angle, and sharpness.", pieces: [{ slot: "Tripod", productId: "hero-u-004" }, { slot: "Light", productId: "hero-u-001" }, { slot: "Backdrop", productId: "hero-u-003" }, { slot: "Lens", productId: "hero-u-002" }] },
};

function getAffiliateRedirectUrl(lookId: string): string {
  return `/api/shop/affiliate?lookId=${encodeURIComponent(lookId)}`;
}

export function hasLookComposition(lookId: string): boolean {
  return Boolean(LOOK_COMPOSITIONS[lookId]);
}

export function getLookComposition(lookId: string): LookComposition | null {
  return LOOK_COMPOSITIONS[lookId] || null;
}

export function getLookDisplayTitle(look: Look): string {
  return LOOK_COMPOSITIONS[look.id]?.lookName || look.title;
}

export function getLookDisplayDescription(look: Look): string {
  return LOOK_COMPOSITIONS[look.id]?.stylingNote || look.description;
}

export function getResolvedLookPieces(look: Look): ResolvedLookPiece[] {
  const composition = LOOK_COMPOSITIONS[look.id];
  if (!composition) return [];

  return composition.pieces.flatMap((piece) => {
    const item = HERO_LOOKS_BY_ID.get(piece.productId);
    const exact = getExactProductLink(piece.productId);
    if (!item || !exact) return [];

    return [{
      slot: piece.slot,
      item,
      productTitle: exact.productTitle,
      buyUrl: getAffiliateRedirectUrl(piece.productId),
    }];
  });
}

export function getLookPieceCount(look: Look): number {
  return getResolvedLookPieces(look).length;
}

export function getLookTotalPrice(look: Look): number {
  const pieces = getResolvedLookPieces(look);
  if (pieces.length === 0) return look.price;
  return pieces.reduce((sum, piece) => sum + piece.item.price, 0);
}

export function formatIndianPrice(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}
