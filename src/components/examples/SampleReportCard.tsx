import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { SampleReport } from "@/config/sampleReports";

const PRODUCT_LINKS: Record<string, string> = {
  aura_report: "/products/aura-report",
  dating_audit: "/products/dating-audit",
  glowup_plan: "/products/glowup-plan",
};

const PRODUCT_COLORS: Record<string, string> = {
  aura_report: "from-purple-600 to-pink-500",
  dating_audit: "from-pink-500 to-rose-500",
  glowup_plan: "from-amber-500 to-orange-500",
};

export function SampleReportCard({ report }: { report: SampleReport }) {
  return (
    <Card className="relative flex flex-col overflow-hidden">
      <div
        className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${PRODUCT_COLORS[report.productType] || "from-purple-600 to-pink-500"} opacity-10 blur-3xl`}
      />
      <Badge variant="premium" className="mb-3 self-start">
        {report.productName}
      </Badge>

      <div className="mb-4">
        <div className="text-xs text-gray-500">Score</div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white">{report.score}</span>
          <span className="text-sm text-gray-500">/ 100</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500"
            style={{ width: `${report.score}%` }}
          />
        </div>
      </div>

      {report.archetype && (
        <div className="mb-2 text-xs text-gray-500">
          Archetype: <span className="text-purple-300">{report.archetype}</span>
        </div>
      )}

      <div className="mb-3 rounded-lg border border-red-500/10 bg-red-500/5 px-3 py-2">
        <div className="text-xs text-red-400">Primary bottleneck</div>
        <div className="text-sm text-gray-300">{report.bottleneck}</div>
      </div>

      <div className="mb-4 flex-1">
        <div className="mb-2 text-xs text-gray-500">Top insight</div>
        <p className="text-sm leading-relaxed text-gray-400">
          {report.topInsight}
        </p>
      </div>

      <div className="mb-4">
        <div className="mb-2 text-xs text-gray-500">Sample recommendations</div>
        <ul className="space-y-1">
          {report.sampleRecommendations.map((r, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-xs text-gray-300"
            >
              <svg
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {r}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
        <span className="text-xs text-gray-500">
          Budget range:{" "}
          <span className="text-amber-400">{report.budgetRange}</span>
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <Link href={PRODUCT_LINKS[report.productType] || "/pricing"} className="flex-1">
          <Button variant="outline" size="sm" className="w-full text-xs">
            View Product
          </Button>
        </Link>
        <Link href="/audit/new" className="flex-1">
          <Button size="sm" className="w-full text-xs">
            Start Audit
          </Button>
        </Link>
      </div>
    </Card>
  );
}
