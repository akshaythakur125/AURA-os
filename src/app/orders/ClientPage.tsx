"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { FadeInView } from "@/components/ui/FadeInView";
import { getOrders } from "@/lib/storage/orderStore";
import type { ManualOrder, ManualOrderStatus } from "@/types/order";

// Orders live in this browser's local storage (the app is account-free), so
// this page shows the purchases made on this device.
const STATUS_META: Record<ManualOrderStatus, { label: string; className: string }> = {
  unlocked: { label: "Unlocked", className: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" },
  payment_submitted: { label: "Submitted", className: "text-amber-600 bg-amber-500/10 border-amber-500/20" },
  code_sent: { label: "Code sent", className: "text-amber-600 bg-amber-500/10 border-amber-500/20" },
  payment_pending: { label: "Pending", className: "text-[#6f675e] bg-[#1c1917]/[0.05] border-[#1c1917]/10" },
  draft: { label: "Draft", className: "text-[#6f675e] bg-[#1c1917]/[0.05] border-[#1c1917]/10" },
  cancelled: { label: "Cancelled", className: "text-red-500 bg-red-500/10 border-red-500/20" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<ManualOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOrders(getOrders());
    setLoading(false);
  }, []);

  return (
    <Container className="py-12">
      <FadeInView>
        <h1 className="mb-2 text-2xl font-bold text-[#1C1917]">Order History</h1>
        <p className="mb-8 text-sm text-[#857b6e]">Your purchases on this device. Orders are stored locally, not in an account.</p>
      </FadeInView>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-[#1c1917]/[0.04]" />
          ))}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <Card className="py-12 text-center">
          <p className="text-sm text-[#6f675e]">No orders yet.</p>
          <Link href="/audit/new" className="mt-3 inline-block text-xs text-red-400 hover:text-red-300">
            Start your first aura check →
          </Link>
        </Card>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => {
            const meta = STATUS_META[order.status] || STATUS_META.payment_pending;
            const amount = order.finalAmount ?? order.amount;
            const ref = order.generatedUnlockCode || order.upiTransactionRef;
            return (
              <FadeInView key={order.id}>
                <Card className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-medium text-[#1C1917]">{order.productName}</p>
                    <p className="mt-1 text-xs text-[#857b6e]">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {ref ? ` · ${ref.slice(0, 14)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${meta.className}`}>
                      {meta.label}
                    </span>
                    <span className="text-sm font-medium text-amber-500">₹{amount}</span>
                    {order.status === "unlocked" && (
                      <Link
                        href={`/audit/${order.auditId}`}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        View Report →
                      </Link>
                    )}
                  </div>
                </Card>
              </FadeInView>
            );
          })}
        </div>
      )}
    </Container>
  );
}
