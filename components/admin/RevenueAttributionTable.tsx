"use client";

import { Card } from "@/components/ui/Card";
import type { RevenueAttribution } from "@/types/revenueAnalytics";

interface Props {
  records: RevenueAttribution[];
}

export function RevenueAttributionTable({ records }: Props) {
  if (records.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-500">No revenue records yet.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-white">Revenue Records</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-500">
              <th className="py-1 pr-2">Date</th>
              <th className="py-1 pr-2">Product</th>
              <th className="py-1 pr-2">Amount</th>
              <th className="py-1 pr-2">Method</th>
              <th className="py-1 pr-2">Source</th>
              <th className="py-1">Landing Page</th>
            </tr>
          </thead>
          <tbody>
            {records.slice(-30).reverse().map((r) => (
              <tr key={r.orderId} className="border-b border-white/5 text-gray-300">
                <td className="py-1 pr-2 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                <td className="py-1 pr-2">{r.productType.replace(/_/g, " ")}</td>
                <td className="py-1 pr-2 font-medium text-emerald-400">₹{r.amount}</td>
                <td className="py-1 pr-2 text-gray-500">{r.paymentMethod.replace(/_/g, " ")}</td>
                <td className="py-1 pr-2 text-gray-500">{r.firstTouchSource}</td>
                <td className="py-1 text-gray-500 max-w-[120px] truncate">{r.landingPage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
