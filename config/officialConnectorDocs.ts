import type { ConnectorConfig } from "@/types/connectorRuntime";

export const CONNECTOR_DOCS: Record<string, { setup: string; notes: string; limitations: string[] }> = {
  manual_upload: {
    setup: "No setup needed. Upload CSV or JSON files via the admin feed import page.",
    notes: "Works out of the box. Products are saved to the AuraCheck product index with 'manual' freshness.",
    limitations: ["No automatic price refresh", "Prices must be updated by re-uploading"],
  },
  generic_csv_feed: {
    setup: `Set COMMERCE_GENERIC_CSV_FEED_URL in your environment variables.\n\nThe feed should be a CSV file with headers matching common field names:\ntitle, price, mrp, productUrl, storeKey, category, brand, imageUrl, affiliateUrl, etc.\n\nOptional: COMMERCE_GENERIC_FEED_TOKEN for authenticated feeds.\n\nSee /api/commerce/feed/template?format=csv for an example template.`,
    notes: "Fetches the CSV from the configured URL, parses it, detects field mappings, validates rows, and imports valid products into the search index.",
    limitations: ["Requires a publicly accessible CSV URL", "No real-time price checking", "Feed must be refreshed by re-fetching"],
  },
  generic_json_feed: {
    setup: `Set COMMERCE_GENERIC_JSON_FEED_URL in your environment variables.\n\nThe feed should be a JSON array of product objects.\n\nOptional: COMMERCE_GENERIC_FEED_TOKEN for authenticated feeds.\n\nSee /api/commerce/feed/template?format=json for an example.`,
    notes: "Fetches the JSON from the configured URL, parses it, detects field mappings, validates rows, and imports valid products.",
    limitations: ["Requires a publicly accessible JSON URL", "No real-time price checking", "Feed must be refreshed by re-fetching"],
  },
  generic_affiliate_network: {
    setup: "Set COMMERCE_GENERIC_FEED_TOKEN and provide a feed URL in the connector configuration.",
    notes: "Generic connector for affiliate networks that provide JSON/CSV product feeds with affiliate links.",
    limitations: ["Feed URL must be configured", "No standard format across networks", "Requires manual feed URL setup"],
  },
  amazon_paapi: {
    setup: `To use Amazon PA-API:\n1. Sign up for Amazon Associates: https://affiliate-program.amazon.com/\n2. Get your PA-API credentials in the Associate dashboard\n3. Set these environment variables:\n   - AMAZON_PAAPI_ACCESS_KEY\n   - AMAZON_PAAPI_SECRET_KEY\n   - AMAZON_PAAPI_PARTNER_TAG\n   - AMAZON_PAAPI_HOST (default: webservices.amazon.com)\n   - AMAZON_PAAPI_REGION (default: us-east-1)\n\nAPI Docs: https://webservices.amazon.com/paapi5/documentation/`,
    notes: "Amazon Product Advertising API v5. Supports product search, price lookup, and affiliate link generation. Currently in placeholder state — implementation is prepared but not wired to live API calls.",
    limitations: [
      "Requires Amazon Associates account",
      "Rate limited by Amazon",
      "Not all categories return pricing data",
      "Implementation is placeholder — no live API calls yet",
    ],
  },
  flipkart_affiliate: {
    setup: `To use Flipkart Affiliate API:\n1. Sign up for Flipkart Affiliate: https://affiliate.flipkart.com/\n2. Get your Affiliate ID and API Token\n3. Set these environment variables:\n   - FLIPKART_AFFILIATE_ID\n   - FLIPKART_AFFILIATE_TOKEN\n   - FLIPKART_FEED_URL (optional, for feed-based import)\n\nAPI Docs: https://affiliate.flipkart.com/api-docs`,
    notes: "Flipkart Affiliate program provides product feeds and affiliate links. Currently in placeholder state.",
    limitations: [
      "Requires Flipkart Affiliate account",
      "API token required for feed access",
      "Implementation is placeholder — no live API calls yet",
    ],
  },
  cuelinks: {
    setup: `To use Cuelinks:\n1. Sign up: https://cuelinks.com/register\n2. Get your API Key from the dashboard\n3. Set these environment variables:\n   - CUELINKS_API_KEY\n   - CUELINKS_FEED_URL\n\nDocs: https://cuelinks.com/api`,
    notes: "Cuelinks is an Indian affiliate network. Supports multiple merchant feeds. Currently in placeholder state.",
    limitations: [
      "Requires Cuelinks account and API key",
      "Feed URL must be obtained from Cuelinks dashboard",
      "Implementation is placeholder — no live feed fetch yet",
    ],
  },
  admitad: {
    setup: `To use Admitad:\n1. Sign up: https://admitad.com/register/\n2. Create an application in developer dashboard\n3. Set these environment variables:\n   - ADMITAD_CLIENT_ID\n   - ADMITAD_CLIENT_SECRET\n   - ADMITAD_ACCESS_TOKEN (optional)\n   - ADMITAD_FEED_URL\n\nAPI Docs: https://admitad.com/developers/`,
    notes: "Admitad is a global affiliate network with Indian merchant support. Currently in placeholder state.",
    limitations: [
      "Requires Admitad account and API credentials",
      "OAuth-based authentication needed",
      "Feed URL must be configured",
      "Implementation is placeholder — no live API calls yet",
    ],
  },
};

export function getConnectorDocs(key: string): { setup: string; notes: string; limitations: string[] } | null {
  return CONNECTOR_DOCS[key] || null;
}

export const ALL_CONNECTOR_DOCS: ConnectorConfig[] = [
  { key: "manual_upload", displayName: "Manual Upload", provider: "auracheck", sourceType: "manual", envVars: [], supportsTest: false, supportsRefresh: false, supportsPriceRefresh: false, supportsProductImport: true, isOfficial: true, publicNotes: "Upload CSV/JSON files via the admin feed import page.", safetyNotes: "Admin-only access. No automated refresh." },
  { key: "generic_csv_feed", displayName: "Generic CSV Feed", provider: "generic", sourceType: "csv", envVars: ["COMMERCE_GENERIC_CSV_FEED_URL"], supportsTest: true, supportsRefresh: true, supportsPriceRefresh: true, supportsProductImport: true, isOfficial: false, publicNotes: "Fetches products from a configured CSV feed URL.", safetyNotes: "Feed URL must be configured server-side. SSRF protection applied." },
  { key: "generic_json_feed", displayName: "Generic JSON Feed", provider: "generic", sourceType: "json", envVars: ["COMMERCE_GENERIC_JSON_FEED_URL"], supportsTest: true, supportsRefresh: true, supportsPriceRefresh: true, supportsProductImport: true, isOfficial: false, publicNotes: "Fetches products from a configured JSON feed URL.", safetyNotes: "Feed URL must be configured server-side. SSRF protection applied." },
  { key: "generic_affiliate_network", displayName: "Generic Affiliate Network", provider: "generic", sourceType: "affiliate_feed", envVars: ["COMMERCE_GENERIC_FEED_TOKEN"], supportsTest: true, supportsRefresh: true, supportsPriceRefresh: false, supportsProductImport: true, isOfficial: false, publicNotes: "Generic connector for affiliate networks providing feeds.", safetyNotes: "Feed URL and token must be configured server-side." },
  { key: "amazon_paapi", displayName: "Amazon PA-API", provider: "amazon", sourceType: "official_api", envVars: ["AMAZON_PAAPI_ACCESS_KEY", "AMAZON_PAAPI_SECRET_KEY", "AMAZON_PAAPI_PARTNER_TAG"], supportsTest: true, supportsRefresh: true, supportsPriceRefresh: true, supportsProductImport: false, isOfficial: true, publicNotes: "Amazon Product Advertising API v5 for price lookup and affiliate links.", safetyNotes: "Requires Amazon Associates account. Not implemented — placeholder." },
  { key: "flipkart_affiliate", displayName: "Flipkart Affiliate", provider: "flipkart", sourceType: "official_api", envVars: ["FLIPKART_AFFILIATE_ID", "FLIPKART_AFFILIATE_TOKEN"], supportsTest: true, supportsRefresh: true, supportsPriceRefresh: true, supportsProductImport: true, isOfficial: true, publicNotes: "Flipkart Affiliate API for product feeds and affiliate links.", safetyNotes: "Requires Flipkart Affiliate account. Not implemented — placeholder." },
  { key: "cuelinks", displayName: "Cuelinks", provider: "cuelinks", sourceType: "affiliate_feed", envVars: ["CUELINKS_API_KEY", "CUELINKS_FEED_URL"], supportsTest: true, supportsRefresh: true, supportsPriceRefresh: false, supportsProductImport: true, isOfficial: true, publicNotes: "Cuelinks affiliate network for Indian merchant feeds.", safetyNotes: "Requires Cuelinks account. Not implemented — placeholder." },
  { key: "admitad", displayName: "Admitad", provider: "admitad", sourceType: "affiliate_feed", envVars: ["ADMITAD_CLIENT_ID", "ADMITAD_CLIENT_SECRET", "ADMITAD_FEED_URL"], supportsTest: true, supportsRefresh: true, supportsPriceRefresh: false, supportsProductImport: true, isOfficial: true, publicNotes: "Admitad global affiliate network with Indian merchant support.", safetyNotes: "Requires Admitad account. Not implemented — placeholder." },
];
