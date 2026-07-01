import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/storage/storageMode";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.eventName) {
      return NextResponse.json({ error: "eventName is required" }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(url, key);

      const { error } = await supabase.from("funnel_events").insert({
        event_name: body.eventName,
        anonymous_id: body.anonymousId || null,
        session_id: body.sessionId || null,
        audit_id: body.auditId || null,
        order_id: body.orderId || null,
        product_type: body.productType || null,
        source_page: body.sourcePage || null,
        landing_page: body.landingPage || null,
        referrer: body.referrer || null,
        utm_source: body.utmSource || null,
        utm_campaign: body.utmCampaign || null,
        metadata: body.metadata || null,
      });

      if (error) {
        // Table may not exist
        return NextResponse.json({ success: true, stored: "local" });
      }

      return NextResponse.json({ success: true, stored: "supabase" });
    }

    return NextResponse.json({ success: true, stored: "local" });
  } catch {
    return NextResponse.json({ success: true, stored: "local" });
  }
}
