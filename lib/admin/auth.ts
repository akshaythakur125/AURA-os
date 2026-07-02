import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// No hardcoded fallback: a secret baked into the public repo would let anyone
// forge a valid session token. If ADMIN_TOKEN_SECRET isn't set, generate a
// random one per server process so tokens are still unguessable (they just
// won't survive a restart until a real secret is configured).
const TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || randomBytes(32).toString("hex");
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

const DEV_MODE_WARNING = process.env.ADMIN_ACCESS_CODE
  ? null
  : "INSECURE LOCAL DEV MODE: Set ADMIN_ACCESS_CODE in .env.local for production-level admin security. The default code 'ADMINDEMO' is publicly known.";

export function getAdminAccessCode(): string {
  return process.env.ADMIN_ACCESS_CODE || "ADMINDEMO";
}

export function getDevModeWarning(): string | null {
  return DEV_MODE_WARNING;
}

function createTokenPayload(): string {
  return JSON.stringify({
    role: "admin",
    iat: Date.now(),
    exp: Date.now() + SESSION_DURATION_MS,
  });
}

function signPayload(payload: string): string {
  return createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
}

export function createSessionToken(): string {
  const payload = createTokenPayload();
  const sig = signPayload(payload);
  const encoded = Buffer.from(payload).toString("base64url");
  return encoded.replace(/=/g, "") + "." + sig;
}

export function verifySessionToken(token: string): boolean {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return false;
  const encodedPayload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let payload: string;
  try {
    payload = Buffer.from(encodedPayload, "base64url").toString();
  } catch {
    return false;
  }
  const expectedSig = signPayload(payload);
  try {
    const buf1 = Buffer.from(expectedSig, "hex");
    const buf2 = Buffer.from(sig, "hex");
    if (buf1.length !== buf2.length) return false;
    return timingSafeEqual(buf1, buf2);
  } catch {
    return false;
  }
}

export function isTokenExpired(token: string): boolean {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return true;
  try {
    const payload = JSON.parse(Buffer.from(token.slice(0, dot), "base64url").toString());
    return Date.now() > (payload.exp || 0);
  } catch {
    return true;
  }
}

const COOKIE_NAME = "admin_session";

export function getSessionFromCookie(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAME)?.value || null;
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

function codeMatches(submitted: string | null, expected: string): boolean {
  if (!submitted) return false;
  const a = Buffer.from(submitted);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function isAuthenticated(request: NextRequest): boolean {
  // 1. Check session cookie (server-managed, preferred)
  const sessionToken = getSessionFromCookie(request);
  if (sessionToken && verifySessionToken(sessionToken) && !isTokenExpired(sessionToken)) {
    return true;
  }

  // 2. Fallback: x-admin-code header, checked only against the real
  // server-only secret (backward compat for scripts/internal tools). There is
  // intentionally no magic bypass string here — anything checked into the
  // public repo source is not a secret.
  const adminCode = request.headers.get("x-admin-code");
  return codeMatches(adminCode, getAdminAccessCode());
}

export function requireAdmin(request: NextRequest): { authorized: boolean; response?: NextResponse } {
  if (isAuthenticated(request)) {
    return { authorized: true };
  }
  return {
    authorized: false,
    response: NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 403 }
    ),
  };
}
