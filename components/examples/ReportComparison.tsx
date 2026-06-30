import { SAMPLE_FULL_REPORT, SAMPLE_DATING_AUDIT, SAMPLE_GLOWUP_PLAN } from "@/config/sampleReports";
import { SampleReportCard } from "@/components/examples/SampleReportCard";

export function ReportComparison() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <SampleReportCard
        title="Full Aura Report"
        score={SAMPLE_FULL_REPORT.score}
        badgeText={SAMPLE_FULL_REPORT.archetype}
        gradient="from-purple-600 to-pink-500"
        leaks={SAMPLE_FULL_REPORT.statusLeaks}
      >
        <p className="mb-3 text-xs text-gray-400">{SAMPLE_FULL_REPORT.oneLineVerdict}</p>
        <div className="rounded-lg bg-purple-500/10 p-2 text-xs">
          <span className="text-purple-300">Priority:</span>
          <p className="mt-0.5 text-gray-300">{SAMPLE_FULL_REPORT.priorityUpgrade}</p>
        </div>
      </SampleReportCard>

      <SampleReportCard
        title="Dating/Profile Audit"
        score={SAMPLE_DATING_AUDIT.profileScore}
        badgeText="Profile Score"
        badgeVariant="success"
        gradient="from-rose-500 to-red-500"
      >
        <p className="mb-3 text-xs text-gray-400">{SAMPLE_DATING_AUDIT.profileFrictionSummary}</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-gray-500">Originality</span><span>{SAMPLE_DATING_AUDIT.textMetrics.originalityScore}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Warmth</span><span>{SAMPLE_DATING_AUDIT.textMetrics.warmthScore}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Clichés</span><span className="text-rose-300">{SAMPLE_DATING_AUDIT.clichéFlags.join(", ")}</span></div>
        </div>
      </SampleReportCard>

      <SampleReportCard
        title="30-Day Glow-Up Plan"
        score={SAMPLE_GLOWUP_PLAN.planScore}
        badgeText="Plan Score"
        badgeVariant="warning"
        gradient="from-amber-500 to-orange-500"
      >
        <p className="mb-3 text-xs text-gray-400">{SAMPLE_GLOWUP_PLAN.primaryBottleneck}</p>
        <div className="space-y-1 text-xs">
          {SAMPLE_GLOWUP_PLAN.weeklyBreakdown.map((w) => (
            <div key={w.week} className="flex justify-between">
              <span className="text-gray-500">Week {w.week}</span>
              <span className="text-gray-300">{w.focus}</span>
            </div>
          ))}
        </div>
      </SampleReportCard>
    </div>
  );
}
