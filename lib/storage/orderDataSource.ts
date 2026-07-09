"use client";

import { shouldUseSupabase } from "@/lib/storage/storageMode";
import { getAnonymousId } from "@/lib/identity/anonymousId";
import {
  createOrder as localCreateOrder,
  getOrders as localGetOrders,
  getOrderById as localGetOrderById,
  getOrdersByAuditId as localGetOrdersByAuditId,
  updateOrder as localUpdateOrder,
  deleteOrder as localDeleteOrder,
  getOrderStats as localGetOrderStats,
} from "@/lib/storage/orderStore";

async function supabaseCreateOrder(input: Record<string, unknown>) {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, anonymousId: getAnonymousId() }),
  });
  if (!res.ok) throw new Error("Supabase create order failed");
  const data = await res.json();
  return data.order;
}

async function supabaseGetOrders(params?: { auditId?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.auditId) searchParams.set("auditId", params.auditId);
  searchParams.set("anonymousId", getAnonymousId());
  const res = await fetch(`/api/orders?${searchParams.toString()}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.orders || [];
}

async function supabaseUpdateOrder(id: string, updates: Record<string, unknown>) {
  const res = await fetch(`/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Supabase update order failed");
  const data = await res.json();
  return data.order;
}

async function supabaseDeleteOrder(id: string) {
  const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Supabase delete order failed");
}

export const orderDataSource = {
  createOrder: async (input: Record<string, unknown>) => {
    if (shouldUseSupabase()) {
      try {
        return await supabaseCreateOrder(input);
      } catch {
        // fall through
      }
    }
    return localCreateOrder(input as never);
  },

  getOrders: async () => {
    if (shouldUseSupabase()) {
      const result = await supabaseGetOrders();
      if (result) return result;
    }
    return localGetOrders();
  },

  getOrdersByAuditId: async (auditId: string) => {
    if (shouldUseSupabase()) {
      const result = await supabaseGetOrders({ auditId });
      if (result) return result;
    }
    return localGetOrdersByAuditId(auditId);
  },

  updateOrder: async (id: string, updates: Record<string, unknown>) => {
    if (shouldUseSupabase()) {
      try {
        return await supabaseUpdateOrder(id, updates);
      } catch {
        // fall through
      }
    }
    return localUpdateOrder(id, updates as never);
  },

  deleteOrder: async (id: string) => {
    if (shouldUseSupabase()) {
      try {
        await supabaseDeleteOrder(id);
      } catch {
        // fall through
      }
    }
    localDeleteOrder(id);
  },

  getOrderStats: () => {
    return localGetOrderStats();
  },

  getOrderById: async (id: string) => {
    return localGetOrderById(id);
  },
};
