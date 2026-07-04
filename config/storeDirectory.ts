import type { StoreInfo, StoreKey } from "@/types/commerce";

const STORE_MAP: Record<StoreKey, StoreInfo> = {
  myntra: {
    key: "myntra",
    displayName: "Myntra",
    homepageUrl: "https://www.myntra.com",
    affiliateSupported: false,
    notes: "Major Indian fashion e-commerce platform",
    isActive: true,
    trustWeight: 0.9,
  },
  ajio: {
    key: "ajio",
    displayName: "AJIO",
    homepageUrl: "https://www.ajio.com",
    affiliateSupported: false,
    notes: "Reliance-owned fashion platform",
    isActive: true,
    trustWeight: 0.85,
  },
  amazon_fashion: {
    key: "amazon_fashion",
    displayName: "Amazon Fashion",
    homepageUrl: "https://www.amazon.in/s/ref=lp_1968124031_nr_p_n_ideal_2",
    categoryBaseUrl: "https://www.amazon.in/gp/browse.html?node=1968124031",
    affiliateSupported: false,
    notes: "Amazon India fashion store",
    isActive: true,
    trustWeight: 0.9,
  },
  flipkart_fashion: {
    key: "flipkart_fashion",
    displayName: "Flipkart Fashion",
    homepageUrl: "https://www.flipkart.com/fashion",
    categoryBaseUrl: "https://www.flipkart.com/clothing-",
    affiliateSupported: false,
    notes: "Major Indian marketplace with fashion section",
    isActive: true,
    trustWeight: 0.85,
  },
  tata_cliq: {
    key: "tata_cliq",
    displayName: "Tata CLiQ",
    homepageUrl: "https://www.tatacliq.com",
    affiliateSupported: false,
    notes: "Tata-owned multi-brand fashion e-commerce",
    isActive: true,
    trustWeight: 0.8,
  },
  nykaa_fashion: {
    key: "nykaa_fashion",
    displayName: "Nykaa Fashion",
    homepageUrl: "https://www.nykaafashion.com",
    affiliateSupported: false,
    notes: "Nykaa's fashion vertical",
    isActive: true,
    trustWeight: 0.75,
  },
  meesho: {
    key: "meesho",
    displayName: "Meesho",
    homepageUrl: "https://www.meesho.com",
    affiliateSupported: false,
    notes: "Budget-friendly social commerce platform",
    isActive: true,
    trustWeight: 0.5,
  },
  snitch: {
    key: "snitch",
    displayName: "Snitch",
    homepageUrl: "https://www.snitch.co.in",
    affiliateSupported: false,
    notes: "Indian youth fashion brand",
    isActive: true,
    trustWeight: 0.6,
  },
  souled_store: {
    key: "souled_store",
    displayName: "The Souled Store",
    homepageUrl: "https://www.thesouledstore.com",
    affiliateSupported: false,
    notes: "Independent Indian youth culture brand",
    isActive: true,
    trustWeight: 0.6,
  },
  bewakoof: {
    key: "bewakoof",
    displayName: "Bewakoof",
    homepageUrl: "https://www.bewakoof.com",
    affiliateSupported: false,
    notes: "Quirky Indian youth fashion brand",
    isActive: true,
    trustWeight: 0.55,
  },
  hm_india: {
    key: "hm_india",
    displayName: "H&M India",
    homepageUrl: "https://www.hm.com/in",
    affiliateSupported: false,
    notes: "Global fast-fashion brand in India",
    isActive: true,
    trustWeight: 0.7,
  },
  narzo_manual: {
    key: "narzo_manual",
    displayName: "Narzo / Manual Store",
    homepageUrl: "#",
    affiliateSupported: false,
    notes: "Manual store placeholder — not a fashion marketplace",
    isActive: true,
    trustWeight: 0.3,
  },
  other: {
    key: "other",
    displayName: "Other Store",
    homepageUrl: "#",
    affiliateSupported: false,
    notes: "Generic store placeholder",
    isActive: true,
    trustWeight: 0.3,
  },
};

// Native on-site search URL per store. Every one of these resolves to a real,
// working results page for any query — unlike product-page deep links, they
// cannot 404, which is what "links work flawlessly" requires for a catalog
// with no live inventory API.
const STORE_SEARCH_URLS: Partial<Record<StoreKey, (q: string) => string>> = {
  myntra: (q) => `https://www.myntra.com/${q.trim().toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-")}`,
  ajio: (q) => `https://www.ajio.com/search/?text=${encodeURIComponent(q)}`,
  amazon_fashion: (q) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}`,
  flipkart_fashion: (q) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`,
  tata_cliq: (q) => `https://www.tatacliq.com/search/?searchCategory=all&text=${encodeURIComponent(q)}`,
  nykaa_fashion: (q) => `https://www.nykaafashion.com/catalogsearch/result/?q=${encodeURIComponent(q)}`,
  meesho: (q) => `https://www.meesho.com/search?q=${encodeURIComponent(q)}`,
  snitch: (q) => `https://www.snitch.co.in/search?q=${encodeURIComponent(q)}`,
  souled_store: (q) => `https://www.thesouledstore.com/search?q=${encodeURIComponent(q)}`,
  bewakoof: (q) => `https://www.bewakoof.com/search?q=${encodeURIComponent(q)}`,
  hm_india: (q) => `https://www2.hm.com/en_in/search-results.html?q=${encodeURIComponent(q)}`,
};

export function buildStoreSearchUrl(key: StoreKey, query: string): string | undefined {
  const builder = STORE_SEARCH_URLS[key];
  return builder ? builder(query) : undefined;
}

export function getStoreInfo(key: StoreKey): StoreInfo {
  return STORE_MAP[key];
}

export function getAllStores(): StoreInfo[] {
  return Object.values(STORE_MAP);
}

export function getActiveStores(): StoreInfo[] {
  return Object.values(STORE_MAP).filter((s) => s.isActive);
}

export function getStoreByKey(key: string): StoreInfo | undefined {
  return STORE_MAP[key as StoreKey];
}

export function formatStoreName(key: StoreKey): string {
  return STORE_MAP[key]?.displayName || key;
}
