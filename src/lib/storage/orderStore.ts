import type { ManualOrder, OrderStats } from "@/types/order";
import type { ProductType } from "@/types/payment";
import { createLocalId } from "@/types/audit";
import { getItem, setItem } from "./localStore";
import { STORAGE_KEYS } from "./storageKeys";
import { getProductPrice, getProductName } from "@/lib/payments/manualUnlock";

function getAll(): ManualOrder[] {
  return getItem<ManualOrder[]>(STORAGE_KEYS.ORDERS, []);
}

function persist(orders: ManualOrder[]): void {
  setItem(STORAGE_KEYS.ORDERS, orders);
}

export function getOrders(): ManualOrder[] {
  return getAll().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getOrderById(id: string): ManualOrder | undefined {
  return getAll().find((o) => o.id === id);
}

export function getOrdersByAuditId(auditId: string): ManualOrder[] {
  return getAll().filter((o) => o.auditId === auditId);
}

export function getOrderByAuditAndProduct(
  auditId: string,
  productType: ProductType
): ManualOrder | undefined {
  return getAll().find(
    (o) => o.auditId === auditId && o.productType === productType
  );
}

export function createOrder(input: {
  auditId: string;
  productType: ProductType;
  customerName?: string;
  customerContact?: string;
  userNote?: string;
  offerCode?: string;
  originalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
}): ManualOrder {
  const now = new Date().toISOString();
  const amount = getProductPrice(input.productType);
  const productName = getProductName(input.productType);
  const upiId =
    typeof process !== "undefined" &&
    process.env &&
    (process.env as Record<string, string | undefined>)
      .NEXT_PUBLIC_MANUAL_UPI_ID
      ? ((process.env as Record<string, string | undefined>)
          .NEXT_PUBLIC_MANUAL_UPI_ID as string)
      : "your-upi-id@upi";

  const order: ManualOrder = {
    id: createLocalId(),
    auditId: input.auditId,
    productType: input.productType,
    productName,
    amount: input.finalAmount ?? amount,
    originalAmount: input.originalAmount,
    discountCode: input.offerCode,
    discountAmount: input.discountAmount,
    finalAmount: input.finalAmount,
    status: "payment_submitted",
    customerName: input.customerName || undefined,
    customerContact: input.customerContact || undefined,
    userNote: input.userNote || undefined,
    upiId,
    createdAt: now,
    updatedAt: now,
  };
  const orders = getAll();
  orders.push(order);
  persist(orders);
  return order;
}

export function updateOrder(
  id: string,
  updates: Partial<ManualOrder>
): ManualOrder | undefined {
  const orders = getAll();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return undefined;
  orders[idx] = { ...orders[idx], ...updates, updatedAt: new Date().toISOString() };
  persist(orders);
  return orders[idx];
}

export function deleteOrder(id: string): boolean {
  const orders = getAll();
  const filtered = orders.filter((o) => o.id !== id);
  if (filtered.length === orders.length) return false;
  persist(filtered);
  return true;
}

export function clearOrders(): void {
  setItem(STORAGE_KEYS.ORDERS, []);
}

export function getOrderStats(): OrderStats {
  const orders = getAll();
  const paymentSubmitted = orders.filter((o) => o.status === "payment_submitted").length;
  const unlockedOrders = orders.filter((o) => o.status === "unlocked").length;
  const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;
  const codeSent = orders.filter((o) => o.status === "code_sent").length;
  const paymentPending = orders.filter((o) => o.status === "payment_pending" || o.status === "draft").length;

  const totalExpectedRevenue = orders
    .filter((o) => o.status !== "cancelled" && o.status !== "draft")
    .reduce((sum, o) => sum + o.amount, 0);

  const totalUnlockedRevenue = unlockedOrders > 0
    ? orders.filter((o) => o.status === "unlocked").reduce((sum, o) => sum + o.amount, 0)
    : 0;

  return {
    totalOrders: orders.length,
    paymentPending,
    paymentSubmitted,
    codeSent,
    unlockedOrders,
    cancelledOrders,
    totalExpectedRevenue,
    totalUnlockedRevenue,
    latestOrderDate:
      orders.length > 0
        ? orders.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0].createdAt
        : null,
  };
}
