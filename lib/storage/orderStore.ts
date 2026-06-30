"use client";

import { getItem, setItem } from "@/lib/storage/localStore";
import type { ManualOrder, OrderStats } from "@/types/order";
import type { ProductType } from "@/types";

const ORDERS_KEY = "auracheck:v1:orders";

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getOrders(): ManualOrder[] {
  return getItem<ManualOrder[]>(ORDERS_KEY, []);
}

export function getOrderById(id: string): ManualOrder | undefined {
  return getOrders().find((o) => o.id === id);
}

export function getOrdersByAuditId(auditId: string): ManualOrder[] {
  return getOrders().filter((o) => o.auditId === auditId);
}

export function createOrder(input: {
  auditId: string;
  productType: ProductType;
  productName: string;
  amount: number;
  upiId: string;
  customerName?: string;
  customerContact?: string;
  upiTransactionRef?: string;
  userNote?: string;
}): ManualOrder {
  const now = new Date().toISOString();
  const order: ManualOrder = {
    id: generateId(),
    status: "payment_submitted",
    createdAt: now,
    updatedAt: now,
    ...input,
  };
  const orders = getOrders();
  orders.unshift(order);
  setItem(ORDERS_KEY, orders);
  return order;
}

export function updateOrder(id: string, updates: Partial<ManualOrder>): ManualOrder | undefined {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return undefined;
  orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
  setItem(ORDERS_KEY, orders);
  return orders[index];
}

export function deleteOrder(id: string): void {
  const orders = getOrders().filter((o) => o.id !== id);
  setItem(ORDERS_KEY, orders);
}

export function clearOrders(): void {
  setItem(ORDERS_KEY, []);
}

export function getOrderStats(): OrderStats {
  const orders = getOrders();
  const stats: OrderStats = {
    totalOrders: orders.length,
    paymentPending: orders.filter((o) => o.status === "payment_pending").length,
    paymentSubmitted: orders.filter((o) => o.status === "payment_submitted").length,
    unlockedOrders: orders.filter((o) => o.status === "unlocked").length,
    cancelledOrders: orders.filter((o) => o.status === "cancelled").length,
    totalExpectedRevenue: orders.reduce((sum, o) => sum + (o.status !== "cancelled" ? o.amount : 0), 0),
    totalUnlockedRevenue: orders.filter((o) => o.status === "unlocked").reduce((sum, o) => sum + o.amount, 0),
    latestOrderDate: orders.length > 0 ? orders[0].createdAt : null,
  };
  return stats;
}
