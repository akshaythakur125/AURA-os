"use client";

import { Card } from "@/components/ui/Card";

interface ComparisonRow {
  label: string;
  free: boolean | string;
  auraReport: boolean | string;
  datingAudit: boolean | string;
  glowupPlan: boolean | string;
}

const ROWS: ComparisonRow[] = [
  { label: "Aura Score", free: true, auraReport: true, datingAudit: true, glowupPlan: true },
  { label: "Basic status leaks", free: "3 leaks", auraReport: "Unlimited", datingAudit: "Profile-specific", glowupPlan: "Weekly check-in" },
  { label: "Full visual breakdown", free: false, auraReport: true, datingAudit: false, glowupPlan: false },
  { label: "Status archetype", free: false, auraReport: true, datingAudit: false, glowupPlan: false },
  { label: "Signal mismatch map", free: false, auraReport: true, datingAudit: false, glowupPlan: false },
  { label: "Profile text review", free: false, auraReport: false, datingAudit: true, glowupPlan: false },
  { label: "Bio / prompt suggestions", free: false, auraReport: false, datingAudit: true, glowupPlan: false },
  { label: "30-day daily missions", free: false, auraReport: false, datingAudit: false, glowupPlan: true },
  { label: "Budget upgrade roadmap", free: "Basic", auraReport: "Detailed", datingAudit: "General", glowupPlan: "Full tiered" },
  { label: "Marketplace bundle", free: false, auraReport: true, datingAudit: false, glowupPlan: false },
  { label: "Shareable card", free: false, auraReport: true, datingAudit: false, glowupPlan: false },
  { label: "Print / save report", free: false, auraReport: true, datingAudit: true, glowupPlan: true },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <svg className="mx-auto h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (value === false) {
    return (
      <svg className="mx-auto h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  return <span className="text-xs text-gray-400">{value}</span>;
}

const HEADERS = [
  { label: "Free", className: "" },
  { label: "{formatPrice(PAYMENT_PRODUCTS.aura_report.price)} Aura Report", className: "text-purple-300" },
  { label: "{formatPrice(PAYMENT_PRODUCTS.dating_audit.price)} Dating", className: "text-pink-300" },
  { label: "{formatPrice(PAYMENT_PRODUCTS.glowup_plan.price)} Glow-Up", className: "text-amber-300" },
];

export function ComparisonTable() {
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-white">Free vs Paid — What you get</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.04]">
              <th className="pb-3 pr-4 font-medium text-gray-500">Feature</th>
              {HEADERS.map((h) => (
                <th key={h.label} className={`pb-3 px-2 text-center font-medium ${h.className || "text-gray-500"}`}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-b border-white/[0.04]">
                <td className="py-3 pr-4 text-gray-300">{row.label}</td>
                <td className="py-3 px-2 text-center"><Cell value={row.free} /></td>
                <td className="py-3 px-2 text-center"><Cell value={row.auraReport} /></td>
                <td className="py-3 px-2 text-center"><Cell value={row.datingAudit} /></td>
                <td className="py-3 px-2 text-center"><Cell value={row.glowupPlan} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
