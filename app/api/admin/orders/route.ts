import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/storage/storageMode";
import { requireAdmin } from "@/lib/admin/auth";
import type { ManualOrder } from "@/types/order";

export const dynamic = "force-dynamic";

function mapSupabaseStatus(status: string): ManualOrder["status"] {
  switch (status) {
    case "pending":
    case "payment_pending":
      return "payment_pending";
    case "payment_submitted":
      return "payment_submitted";
    case "code_sent":
      return "code_sent";
    case "completed":
    case "unlocked":
    case "paid_verified":
      return "unlocked";
    case "cancelled":
      return "cancelled";
    default:
      return "payment_pending";
  }
}

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (!auth.authorized) return auth.response;

  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, orders: [], source: "local" });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const rows = (data || []) as Record<string, unknown>[];

    const orders: ManualOrder[] = rows.map((row) => ({
      id: (row.id as string) || "",
      auditId: (row.audit_id as string) || "",
      productType: (row.product_type as ManualOrder["productType"]) || "quick_fix",
      productName: (row.product_name as string) || "",
      amount: (row.final_amount as number) ?? (row.original_amount as number) ?? 0,
      originalAmount: (row.original_amount as number) ?? undefined,
      finalAmount: (row.final_amount as number) ?? undefined,
      discountCode: (row.discount_code as string) || undefined,
      discountAmount: (row.discount_amount as number) ?? undefined,
      status: mapSupabaseStatus((row.status as string) || "payment_pending"),
      customerName: (row.customer_name as string) || undefined,
      customerContact: (row.customer_contact as string) || undefined,
      upiId: "",
      upiTransactionRef: (row.upi_transaction_ref as string) || undefined,
      razorpayPaymentId: (row.razorpay_payment_id as string) || undefined,
      razorpayOrderId: (row.razorpay_order_id as string) || undefined,
      paymentMethod: (row.razorpay_payment_id as string) ? "razorpay" : (row.upi_transaction_ref as string) ? "upi" : undefined,
      generatedUnlockCode: (row.generated_unlock_code as string) || undefined,
      createdAt: (row.created_at as string) || new Date().toISOString(),
      updatedAt: (row.updated_at as string) || (row.created_at as string) || new Date().toISOString(),
      unlockedAt: (row.unlocked_at as string) || undefined,
    }));

    return NextResponse.json({ success: true, orders, source: "supabase" });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch admin orders",
    }, { status: 500 });
  }
}
