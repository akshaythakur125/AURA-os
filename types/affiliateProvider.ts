export interface AffiliateProvider {
  key: string;
  displayName: string;
  providerType: "affiliate_network" | "official_api" | "feed" | "manual";
  homepageUrl?: string;
  docsUrl?: string;
  signupUrl?: string;
  envVars: string[];
  supportsAffiliateLinks: boolean;
  supportsProductFeed: boolean;
  supportsPriceCheck: boolean;
  isConfigured: boolean;
  commissionNotes?: string;
}

export interface AffiliateLinkConfig {
  providerKey: string;
  baseUrl: string;
  tagParam?: string;
  clickIdParam?: string;
  linkTemplate?: string;
}
