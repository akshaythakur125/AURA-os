export const CONNECTOR_REFRESH_POLICY = {
  minIntervalMinutes: 10,
  maxConnectorsPerRun: 10,
  defaultRefreshIntervalHours: 24,
  lockExpiryMinutes: 15,
  maxRetries: 3,
  retryDelayMs: 5000,
  priceSnapshotEnabled: true,
  rebuildIndexAfterRefresh: true,
  refreshLogRetentionDays: 30,
};

export function getRefreshInterval(providerKey: string): number {
  const intervals: Record<string, number> = {
    amazon_paapi: 24,
    flipkart_affiliate: 12,
    cuelinks: 6,
    admitad: 6,
    generic_csv_feed: 12,
    generic_json_feed: 12,
    generic_affiliate_network: 6,
    manual_upload: 0, // never auto-refresh
  };
  return intervals[providerKey] ?? CONNECTOR_REFRESH_POLICY.defaultRefreshIntervalHours;
}

export function shouldAutoRefresh(providerKey: string): boolean {
  return getRefreshInterval(providerKey) > 0;
}
