import { cookies } from "next/headers";
import {
  createSessionCookie,
  getSessionCookieName,
  SESSION_MAX_AGE,
  isAuthenticated,
  getIsDevMode,
} from "@/lib/admin/auth";

const ADMIN_SESSION_COOKIE = getSessionCookieName();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return Response.json({ error: "Code is required" }, { status: 400 });
    }

    const expectedCode = process.env.ADMIN_ACCESS_CODE;
    if (!expectedCode) {
      return Response.json(
        {
          error: "Server configuration error",
          hint: "ADMIN_ACCESS_CODE env var is not set. Set it for production auth.",
        },
        { status: 500 }
      );
    }

    const inputBuf = new TextEncoder().encode(code.trim());
    const expectedBuf = new TextEncoder().encode(expectedCode);
    if (inputBuf.length !== expectedBuf.length) {
      return Response.json({ error: "Invalid admin code" }, { status: 401 });
    }

    let mismatch = 0;
    for (let i = 0; i < inputBuf.length; i++) {
      mismatch |= inputBuf[i] ^ expectedBuf[i];
    }
    if (mismatch !== 0) {
      return Response.json({ error: "Invalid admin code" }, { status: 401 });
    }

    const cookieValue = createSessionCookie(code.trim());
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  const authed = await isAuthenticated();
  const devMode = getIsDevMode();
  return Response.json({
    authenticated: authed,
    devMode,
    hint: devMode ? "Set ADMIN_ACCESS_CODE env var for production auth." : undefined,
  });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  return Response.json({ ok: true });
}
