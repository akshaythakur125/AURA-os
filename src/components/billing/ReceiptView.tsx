"use client";

import { Card } from "@/components/ui/Card";
import { PAYMENT_PRODUCTS, formatPrice } from "@/config/pricing";
import type { Order } from "@/lib/billing/orders";

type Props = { order: Order };

export function ReceiptView({ order }: Props) {
  const product = PAYMENT_PRODUCTS[order.productId as keyof typeof PAYMENT_PRODUCTS];

  return (
    <Card className="max-w-md mx-auto p-6">
      <div className="mb-4 text-center">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Payment Receipt</p>
        <p className="mt-1 text-lg font-bold text-white">AuraCheck</p>
      </div>

      <div className="space-y-3 border-t border-white/[0.06] pt-4 text-sm">
        <Row label="Product" value={product?.name || order.productId} />
        <Row label="Amount" value={formatPrice(order.totalAmount)} highlight />
        <Row label="Status" value={order.status === "paid" ? "Paid" : order.status} />
        <Row label="Date" value={new Date(order.paidAt || order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} />
        <Row label="Order Reference" value={order.providerOrderId?.slice(0, 16) || "—"} />
        <Row label="Payment ID" value={order.providerPaymentId?.slice(0, 20) || "—"} />
      </div>

      <div className="mt-4 border-t border-white/[0.06] pt-3 text-[10px] text-gray-600 text-center">
        This is a payment confirmation, not a tax invoice.
        <br />
        Support: support@fixmyaura.shop
      </div>
    </Card>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={highlight ? "font-medium text-amber-400" : "text-white"}>{value}</span>
    </div>
  );
}
