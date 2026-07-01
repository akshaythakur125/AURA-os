const BLOCKED_PATTERNS = [
  /^javascript:/i,
  /^data:/i,
  /^file:/i,
  /^vbscript:/i,
  /^ftp:/i,
];

const BLOCKED_HOSTS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "192.168.",
  "10.",
  "172.16.",
  "169.254.",
];

export function isSafeRedirectUrl(url: string): { safe: boolean; reason?: string } {
  if (!url || typeof url !== "string") {
    return { safe: false, reason: "URL is empty or invalid" };
  }

  // Check for blocked patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(url)) {
      return { safe: false, reason: `URL uses blocked protocol: ${pattern}` };
    }
  }

  // Must be http or https
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return { safe: false, reason: "URL must start with http:// or https://" };
  }

  // Check for blocked hosts
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    for (const blocked of BLOCKED_HOSTS) {
      if (host === blocked || host.startsWith(blocked)) {
        return { safe: false, reason: `URL points to blocked host: ${host}` };
      }
    }

    // Allow only common TLDs to prevent SSRF via internal TLDs
    const tld = host.split(".").pop() || "";
    if (tld.length > 6 || tld.length < 2) {
      if (!host.includes(".")) {
        return { safe: false, reason: `URL has no valid TLD: ${host}` };
      }
    }
  } catch {
    return { safe: false, reason: "URL could not be parsed" };
  }

  return { safe: true };
}

export function sanitizeRedirectUrl(url: string, fallback: string = "/"): string {
  const result = isSafeRedirectUrl(url);
  if (result.safe) return url;
  return fallback;
}
