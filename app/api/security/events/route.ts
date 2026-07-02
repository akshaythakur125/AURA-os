import { NextRequest, NextResponse } from "next/server";
import { getSecurityEvents, addSecurityEvent, clearSecurityEvents } from "@/lib/security/securityEventStore";
import { requireAdmin } from "@/lib/admin/auth";
import type { SecurityEventType } from "@/types/security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity");

    let events = getSecurityEvents();
    if (severity) {
      events = events.filter((e) => e.severity === severity);
    }

    return NextResponse.json({ success: true, events: events.slice(-100) });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = body.eventType as SecurityEventType;

    if (!eventType) {
      return NextResponse.json({ success: false, error: "eventType is required" }, { status: 400 });
    }

    addSecurityEvent({
      eventType,
      severity: body.severity || "low",
      message: body.message || eventType,
      source: body.source,
      metadata: body.metadata,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

export async function DELETE() {
  clearSecurityEvents();
  return NextResponse.json({ success: true });
}
