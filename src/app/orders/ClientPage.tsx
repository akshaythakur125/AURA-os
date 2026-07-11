"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { FadeInView } from "@/components/ui/FadeInView";
import { getOrders, type Order } from "@/lib/billing/orders";
import { PAYMENT_PRODUCTS, formatPrice } from "@/config/pricing";

const STATUS_COLORS: Record<string, string> = {
  paid: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  pending: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  failed: "text-red-400 bg-red-500/10 border-red-500/20",
  refunded: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  created: "text-gray-400 bg-gray-500/10 border-gray-500/20",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders(20).then((o) => { setOrders(o); setLoading(false); });
  }, []);

  return (
    <Container className="py-12">
      <FadeInView>
        <h1 className="mb-2 text-2xl font-bold text-white">Order History</h1>
        <p className="mb-8 text-sm text-gray-500">Your purchases and payment history.</p>
      </FadeInView>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <Card className="py-12 text-center">
          <p className="text-sm text-gray-400">No orders yet.</p>
          <Link href="/audit/new" className="mt-3 inline-block text-xs text-violet-400 hover:text-violet-300">
            Start your first aura check →
          </Link>
        </Card>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => {
            const product = PAYMENT_PRODUCTS[order.productId as keyof typeof PAYMENT_PRODUCTS];
            return (
              <FadeInView key={order.id}>
                <Card className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {product?.name || order.productId}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {" · "}
                      {order.providerOrderId?.slice(0, 12) || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${STATUS_COLORS[order.status] || STATUS_COLORS.created}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-medium text-amber-400">
                      {formatPrice(order.totalAmount)}
                    </span>
                    {order.status === "paid" && (
                      <Link
                        href={`/audit/${order.auditId}`}
                        className="text-xs text-violet-400 hover:text-violet-300"
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
