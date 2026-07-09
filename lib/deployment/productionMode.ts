export interface ProductionMode {
  isLocalhost: boolean;
  isVercel: boolean;
  isProductionDomain: boolean;
  appUrl: string;
  hostMode: "local" | "preview" | "production" | "unknown";
  domain: string;
}

export function detectProductionMode(): ProductionMode {
  const appUrl = getAppUrl();
  const domain = getDomain(appUrl);

  const isLocalhost = appUrl.includes("localhost") || appUrl.includes("127.0.0.1") || appUrl.includes("::1");
  const isVercel = domain.includes("vercel.app");
  const isProductionDomain = domain === "fixmyaura.shop" || domain === "www.fixmyaura.shop";

  let hostMode: ProductionMode["hostMode"];
  if (isProductionDomain) hostMode = "production";
  else if (isVercel) hostMode = "preview";
  else if (isLocalhost) hostMode = "local";
  else hostMode = "unknown";

  return { isLocalhost, isVercel, isProductionDomain, appUrl, hostMode, domain };
}

export function isProduction(): boolean {
  return detectProductionMode().isProductionDomain;
}

export function isDevelopment(): boolean {
  return detectProductionMode().isLocalhost;
}

function getAppUrl(): string {
  if (typeof process !== "undefined") {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:3000";
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "unknown";
  }
}
