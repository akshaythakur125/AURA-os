import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/storage/storageMode";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ orders: [], source: "local" });
    }

    const { searchParams } = new URL(request.url);
    const anonymousId = searchParams.get("anonymousId");
    const auditId = searchParams.get("auditId");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const supabase = getSupabaseAdmin();
    let query = supabase.from("orders").select("*");

    if (anonymousId) {
      query = query.eq("user_id", anonymousId);
    }
    if (auditId) {
      query = query.eq("audit_id", auditId);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch orders: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders: data || [], source: "supabase" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();

    if (!body.product_type && !body.productType) {
      return NextResponse.json(
        { error: "productType is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const orderData: Record<string, unknown> = {
      audit_id: body.auditId || body.audit_id || null,
      user_id: body.anonymousId || null,
      product_type: body.productType || body.product_type,
      product_name: body.productName || body.product_name || "",
      original_amount: body.originalAmount ?? body.original_amount ?? 0,
      discount_code: body.discountCode || body.discount_code || null,
      discount_amount: body.discountAmount ?? body.discount_amount ?? 0,
      final_amount: body.finalAmount ?? body.final_amount ?? 0,
      currency: body.currency || "INR",
      status: body.status || "payment_submitted",
      customer_name: body.customerName || body.customer_name || null,
      customer_contact: body.customerContact || body.customer_contact || null,
      upi_transaction_ref: body.upiTransactionRef || body.upi_transaction_ref || null,
    };

    const { data, error } = await supabase
      .from("orders")
      .insert(orderData as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create order: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ order: data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
