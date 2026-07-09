import { cookies } from "next/headers";

const ADMIN_SESSION_COOKIE = "auracheck_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

function getAdminCode(): string {
  return process.env.ADMIN_ACCESS_CODE || "";
}

function getIsDevMode(): boolean {
  return !process.env.ADMIN_ACCESS_CODE;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE);
  if (!session?.value) return false;

  try {
    const decoded = JSON.parse(
      Buffer.from(session.value, "base64url").toString("utf-8")
    );
    if (!decoded.code || !decoded.expiresAt) return false;
    if (Date.now() > decoded.expiresAt) return false;

    const expectedCode = getAdminCode();
    if (!expectedCode) return false;

    const inputBuf = new TextEncoder().encode(decoded.code);
    const expectedBuf = new TextEncoder().encode(expectedCode);
    if (inputBuf.length !== expectedBuf.length) return false;

    let mismatch = 0;
    for (let i = 0; i < inputBuf.length; i++) {
      mismatch |= inputBuf[i] ^ expectedBuf[i];
    }
    return mismatch === 0;
  } catch {
    return false;
  }
}

export async function requireAdmin(): Promise<{ ok: true } | { ok: false; response: Response }> {
  if (await isAuthenticated()) return { ok: true };

  const devMode = getIsDevMode();
  return {
    ok: false,
    response: Response.json(
      {
        error: "Unauthorized",
        hint: devMode
          ? "Set ADMIN_ACCESS_CODE env var for production auth."
          : undefined,
      },
      { status: 401 }
    ),
  };
}

export function createSessionCookie(code: string): string {
  const payload = JSON.stringify({
    code,
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  });
  return Buffer.from(payload).toString("base64url");
}

export function getSessionCookieName(): string {
  return ADMIN_SESSION_COOKIE;
}

export { SESSION_MAX_AGE, getIsDevMode };
