import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/storage/storageMode";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.eventName && !body.event_name) {
      return NextResponse.json(
        { error: "eventName is required" },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.from("analytics_events").insert({
        event_name: body.eventName || body.event_name,
        audit_id: body.auditId || body.audit_id || null,
        order_id: body.orderId || body.order_id || null,
        product_type: body.productType || body.product_type || null,
        metadata: body.metadata || null,
        anonymous_id: body.anonymousId || body.anonymous_id || null,
      } as never);

      if (error) {
        return NextResponse.json(
          { error: `Failed to track event: ${error.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
