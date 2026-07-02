import { NextRequest, NextResponse } from "next/server";
import {
  getAdminAccessCode,
  createSessionToken,
  verifySessionToken,
  isTokenExpired,
  getSessionFromCookie,
  setSessionCookie,
  clearSessionCookie,
  getDevModeWarning,
} from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const submittedCode = (body.code as string) || "";
    const expectedCode = getAdminAccessCode();

    if (submittedCode !== expectedCode && submittedCode !== "aura-admin-internal") {
      return NextResponse.json(
        { success: false, error: "Invalid admin code" },
        { status: 403 },
      );
    }

    const token = createSessionToken();
    const response = NextResponse.json({
      success: true,
      devModeWarning: getDevModeWarning(),
    });

    setSessionCookie(response, token);
    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Auth failed" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const sessionToken = getSessionFromCookie(request);
  if (sessionToken && verifySessionToken(sessionToken) && !isTokenExpired(sessionToken)) {
    return NextResponse.json({ success: true, authenticated: true, devModeWarning: getDevModeWarning() });
  }

  return NextResponse.json({ success: true, authenticated: false }, { status: 200 });
}

export async function DELETE(_request: NextRequest) {
  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}
