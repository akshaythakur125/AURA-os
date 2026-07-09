export interface StoreTrustScore {
  storeKey: string;
  trustWeight: number;
  label: string;
}

export const STORE_TRUST_SCORES: Record<string, StoreTrustScore> = {
  myntra: { storeKey: "myntra", trustWeight: 0.9, label: "High trust" },
  ajio: { storeKey: "ajio", trustWeight: 0.85, label: "High trust" },
  amazon_fashion: { storeKey: "amazon_fashion", trustWeight: 0.9, label: "High trust" },
  flipkart_fashion: { storeKey: "flipkart_fashion", trustWeight: 0.85, label: "High trust" },
  tata_cliq: { storeKey: "tata_cliq", trustWeight: 0.8, label: "Good trust" },
  nykaa_fashion: { storeKey: "nykaa_fashion", trustWeight: 0.75, label: "Good trust" },
  hm_india: { storeKey: "hm_india", trustWeight: 0.7, label: "Medium trust" },
  snitch: { storeKey: "snitch", trustWeight: 0.6, label: "Medium trust" },
  souled_store: { storeKey: "souled_store", trustWeight: 0.6, label: "Medium trust" },
  bewakoof: { storeKey: "bewakoof", trustWeight: 0.55, label: "Medium trust" },
  meesho: { storeKey: "meesho", trustWeight: 0.5, label: "Budget store" },
  other: { storeKey: "other", trustWeight: 0.3, label: "Unknown store" },
  narzo_manual: { storeKey: "narzo_manual", trustWeight: 0.3, label: "Manual entry" },
};

export function getStoreTrustScore(storeKey: string): StoreTrustScore {
  return STORE_TRUST_SCORES[storeKey] || { storeKey: "other", trustWeight: 0.3, label: "Unknown store" };
}

export function getStoreTrustWeight(storeKey: string): number {
  return getStoreTrustScore(storeKey).trustWeight;
}

export function normalizeStoreKey(input: string): string {
  const lower = input.toLowerCase().trim();

  const storeMap: Record<string, string> = {
    myntra: "myntra",
    ajio: "ajio",
    "amazon": "amazon_fashion",
    "amazon fashion": "amazon_fashion",
    "amazon.in": "amazon_fashion",
    "flipkart": "flipkart_fashion",
    "flipkart fashion": "flipkart_fashion",
    "tata cliq": "tata_cliq",
    "tatacliq": "tata_cliq",
    "tata": "tata_cliq",
    "nykaa": "nykaa_fashion",
    "nykaa fashion": "nykaa_fashion",
    "meesho": "meesho",
    "snitch": "snitch",
    "bewakoof": "bewakoof",
    "h&m": "hm_india",
    "h&m india": "hm_india",
    "hm": "hm_india",
    "hm india": "hm_india",
    "souled store": "souled_store",
    "the souled store": "souled_store",
    "narzo": "narzo_manual",
    "narzo manual": "narzo_manual",
  };

  for (const [key, value] of Object.entries(storeMap)) {
    if (lower === key || lower.includes(key)) {
      return value;
    }
  }

  return "other";
}
