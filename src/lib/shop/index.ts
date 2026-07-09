export { buildRetailerUrl, buildAllShopLinks, buildPrimaryShopLink } from "./linkBuilder";
export type { Retailer, LookSpec } from "./linkBuilder";

export type { Look, LookCategory } from "./catalogTypes";
export { getLookShopLinks, getLookPrimaryUrl } from "./catalogTypes";

export { HERO_LOOKS } from "./heroLooks";
export { generateLongTailLooks } from "./generatedLooks";

export {
  getAllLooks,
  getHeroLooks,
  getCatalogStats,
  getPersonalizedLooks,
  getDefaultLooks,
} from "./catalog";
export type { PersonalizationParams } from "./catalog";
