import type { AffiliateProvider } from "@/types/affiliateProvider";

export const AFFILIATE_PROVIDERS: AffiliateProvider[] = [
  {
    key: "generic_csv_feed",
    displayName: "Generic CSV Feed",
    providerType: "feed",
    envVars: ["COMMERCE_GENERIC_CSV_FEED_URL"],
    supportsAffiliateLinks: false,
    supportsProductFeed: true,
    supportsPriceCheck: false,
    isConfigured: !!process.env.COMMERCE_GENERIC_CSV_FEED_URL,
  },
  {
    key: "generic_json_feed",
    displayName: "Generic JSON Feed",
    providerType: "feed",
    envVars: ["COMMERCE_GENERIC_JSON_FEED_URL"],
    supportsAffiliateLinks: false,
    supportsProductFeed: true,
    supportsPriceCheck: false,
    isConfigured: !!process.env.COMMERCE_GENERIC_JSON_FEED_URL,
  },
  {
    key: "generic_affiliate_network",
    displayName: "Generic Affiliate Network",
    providerType: "affiliate_network",
    envVars: ["COMMERCE_GENERIC_FEED_TOKEN"],
    supportsAffiliateLinks: true,
    supportsProductFeed: true,
    supportsPriceCheck: false,
    isConfigured: false,
    commissionNotes: "Requires affiliate network account and feed URL.",
  },
  {
    key: "amazon_paapi",
    displayName: "Amazon PA-API",
    providerType: "official_api",
    homepageUrl: "https://webservices.amazon.com/paapi5/documentation/",
    docsUrl: "https://webservices.amazon.com/paapi5/documentation/",
    signupUrl: "https://affiliate-program.amazon.com/",
    envVars: ["AMAZON_PAAPI_ACCESS_KEY", "AMAZON_PAAPI_SECRET_KEY", "AMAZON_PAAPI_PARTNER_TAG"],
    supportsAffiliateLinks: true,
    supportsProductFeed: false,
    supportsPriceCheck: true,
    isConfigured: !!(
      process.env.AMAZON_PAAPI_ACCESS_KEY &&
      process.env.AMAZON_PAAPI_SECRET_KEY &&
      process.env.AMAZON_PAAPI_PARTNER_TAG
    ),
    commissionNotes: "Amazon Associates program. Commission varies by category.",
  },
  {
    key: "flipkart_affiliate",
    displayName: "Flipkart Affiliate",
    providerType: "official_api",
    docsUrl: "https://affiliate.flipkart.com/api-docs",
    signupUrl: "https://affiliate.flipkart.com/",
    envVars: ["FLIPKART_AFFILIATE_ID", "FLIPKART_AFFILIATE_TOKEN"],
    supportsAffiliateLinks: true,
    supportsProductFeed: true,
    supportsPriceCheck: false,
    isConfigured: !!(
      process.env.FLIPKART_AFFILIATE_ID &&
      process.env.FLIPKART_AFFILIATE_TOKEN
    ),
    commissionNotes: "Flipkart Affiliate program. Feed-based product data.",
  },
  {
    key: "cuelinks",
    displayName: "Cuelinks",
    providerType: "affiliate_network",
    homepageUrl: "https://cuelinks.com",
    docsUrl: "https://cuelinks.com/api",
    signupUrl: "https://cuelinks.com/register",
    envVars: ["CUELINKS_API_KEY", "CUELINKS_FEED_URL"],
    supportsAffiliateLinks: true,
    supportsProductFeed: true,
    supportsPriceCheck: false,
    isConfigured: !!(process.env.CUELINKS_API_KEY && process.env.CUELINKS_FEED_URL),
    commissionNotes: "Indian affiliate network. API key and feed URL required.",
  },
  {
    key: "admitad",
    displayName: "Admitad",
    providerType: "affiliate_network",
    homepageUrl: "https://admitad.com",
    docsUrl: "https://admitad.com/developers/",
    signupUrl: "https://admitad.com/register/",
    envVars: ["ADMITAD_CLIENT_ID", "ADMITAD_CLIENT_SECRET", "ADMITAD_FEED_URL"],
    supportsAffiliateLinks: true,
    supportsProductFeed: true,
    supportsPriceCheck: false,
    isConfigured: !!(
      process.env.ADMITAD_CLIENT_ID &&
      process.env.ADMITAD_CLIENT_SECRET &&
      process.env.ADMITAD_FEED_URL
    ),
    commissionNotes: "Global affiliate network. Supports Indian merchant offers.",
  },
  {
    key: "manual_upload",
    displayName: "Manual Upload",
    providerType: "manual",
    envVars: [],
    supportsAffiliateLinks: false,
    supportsProductFeed: true,
    supportsPriceCheck: false,
    isConfigured: true,
    commissionNotes: "Admin uploads CSV/JSON manually via feed import page.",
  },
];

export function getAffiliateProvider(key: string): AffiliateProvider | undefined {
  return AFFILIATE_PROVIDERS.find((p) => p.key === key);
}

export function getConfiguredProviders(): AffiliateProvider[] {
  return AFFILIATE_PROVIDERS.filter((p) => p.isConfigured);
}
