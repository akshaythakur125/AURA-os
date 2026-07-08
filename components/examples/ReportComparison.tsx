import { SAMPLE_FULL_REPORT, SAMPLE_DATING_AUDIT, SAMPLE_GLOWUP_PLAN } from "@/config/sampleReports";
import { SampleReportCard } from "@/components/examples/SampleReportCard";

export function ReportComparison() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Full Read */}
      <SampleReportCard
        title="Full Read"
        score={SAMPLE_FULL_REPORT.score}
        badgeText={SAMPLE_FULL_REPORT.archetype}
        gradient="from-purple-600 to-pink-500"
        leaks={SAMPLE_FULL_REPORT.statusLeaks}
      >
        <p className="mb-3 text-xs text-gray-400">{SAMPLE_FULL_REPORT.oneLineVerdict}</p>

        {/* Expert Voices */}
        <div className="mb-3 space-y-2">
          {Object.entries(SAMPLE_FULL_REPORT.expertAnalysis).map(([key, expert]) => (
            <div key={key} className="rounded-lg bg-purple-500/5 p-2 border border-purple-500/10">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-purple-300">{expert.title}</div>
              <p className="mb-1 text-[10px] text-gray-400">{expert.diagnosis}</p>
              <ul className="space-y-0.5">
                {expert.actionItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-1 text-[10px] text-gray-500">
                    <span className="mt-0.5 text-purple-400">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Color Season */}
        <div className="mb-2 rounded-lg bg-amber-500/5 p-2 border border-amber-500/10">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-300">Color Season</div>
          <p className="text-[10px] text-gray-400">{SAMPLE_FULL_REPORT.colorSeasonAnalysis}</p>
        </div>

        {/* Grooming */}
        <div className="mb-2 rounded-lg bg-emerald-500/5 p-2 border border-emerald-500/10">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Grooming</div>
          <p className="text-[10px] text-gray-400">{SAMPLE_FULL_REPORT.groomingAdvice}</p>
        </div>

        {/* Expression */}
        <div className="rounded-lg bg-sky-500/5 p-2 border border-sky-500/10">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-sky-300">Expression</div>
          <p className="text-[10px] text-gray-400">{SAMPLE_FULL_REPORT.expressionCoaching}</p>
        </div>
      </SampleReportCard>

      {/* Dating/Profile Audit */}
      <SampleReportCard
        title="Dating/Profile Audit"
        score={SAMPLE_DATING_AUDIT.profileScore}
        badgeText="Profile Score"
        badgeVariant="success"
        gradient="from-rose-500 to-red-500"
      >
        <p className="mb-3 text-xs text-gray-400">{SAMPLE_DATING_AUDIT.profileFrictionSummary}</p>

        {/* Text Metrics */}
        <div className="mb-3 grid grid-cols-2 gap-1 text-xs">
          <div className="rounded bg-white/5 p-1.5">
            <span className="text-gray-500">Originality</span>
            <span className="ml-1 font-mono text-rose-300">{SAMPLE_DATING_AUDIT.textMetrics.originalityScore}/10</span>
          </div>
          <div className="rounded bg-white/5 p-1.5">
            <span className="text-gray-500">Warmth</span>
            <span className="ml-1 font-mono text-emerald-300">{SAMPLE_DATING_AUDIT.textMetrics.warmthScore}/10</span>
          </div>
          <div className="rounded bg-white/5 p-1.5">
            <span className="text-gray-500">Specificity</span>
            <span className="ml-1 font-mono text-amber-300">{SAMPLE_DATING_AUDIT.textMetrics.specificityScore}/10</span>
          </div>
          <div className="rounded bg-white/5 p-1.5">
            <span className="text-gray-500">Hooks</span>
            <span className="ml-1 font-mono text-sky-300">{SAMPLE_DATING_AUDIT.textMetrics.conversationHooks}</span>
          </div>
        </div>

        {/* Expert Voices */}
        <div className="mb-3 space-y-2">
          {Object.entries(SAMPLE_DATING_AUDIT.expertAnalysis).map(([key, expert]) => (
            <div key={key} className="rounded-lg bg-rose-500/5 p-2 border border-rose-500/10">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-rose-300">{expert.title}</div>
              <p className="text-[10px] text-gray-400">{"advice" in expert ? expert.advice : "diagnosis" in expert ? (expert as { diagnosis: string }).diagnosis : ""}</p>
              {"photoOrder" in expert && (
                <ul className="mt-1 space-y-0.5">
                  {(expert as { photoOrder: string[] }).photoOrder.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-1 text-[10px] text-gray-500">
                      <span className="mt-0.5 text-rose-400">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {"rewriteExamples" in expert && (
                <ul className="mt-1 space-y-1">
                  {(expert as { rewriteExamples: Array<{ original: string; rewrite: string }> }).rewriteExamples.map((ex, i) => (
                    <li key={i} className="text-[10px]">
                      <span className="text-red-400 line-through">{ex.original}</span>
                      <span className="text-gray-500"> → </span>
                      <span className="text-emerald-400">{ex.rewrite}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Cliche Flags */}
        <div className="rounded-lg bg-red-500/5 p-2 border border-red-500/10">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-red-300">Clichés Detected</div>
          <div className="flex flex-wrap gap-1">
            {SAMPLE_DATING_AUDIT.expertAnalysis.copywriter.clicheFlags.map((c) => (
              <span key={c} className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-300 line-through">{c}</span>
            ))}
          </div>
        </div>
      </SampleReportCard>

      {/* 30-Day Reset */}
      <SampleReportCard
        title="30-Day Reset"
        score={SAMPLE_GLOWUP_PLAN.planScore}
        badgeText="Plan Score"
        badgeVariant="warning"
        gradient="from-amber-500 to-orange-500"
      >
        <p className="mb-3 text-xs text-gray-400">{SAMPLE_GLOWUP_PLAN.primaryBottleneck}</p>

        {/* Personalization */}
        <div className="mb-3 grid grid-cols-2 gap-1 text-xs">
          <div className="rounded bg-white/5 p-1.5">
            <span className="text-gray-500">Current</span>
            <span className="ml-1 font-mono text-amber-300">{SAMPLE_GLOWUP_PLAN.personalization.currentScore}</span>
          </div>
          <div className="rounded bg-white/5 p-1.5">
            <span className="text-gray-500">Target</span>
            <span className="ml-1 font-mono text-emerald-300">{SAMPLE_GLOWUP_PLAN.personalization.targetScore}</span>
          </div>
          <div className="rounded bg-white/5 p-1.5">
            <span className="text-gray-500">Weakness</span>
            <span className="ml-1 font-mono text-rose-300">{SAMPLE_GLOWUP_PLAN.personalization.biggestWeakness}</span>
          </div>
          <div className="rounded bg-white/5 p-1.5">
            <span className="text-gray-500">Season</span>
            <span className="ml-1 font-mono text-sky-300">{SAMPLE_GLOWUP_PLAN.personalization.colorSeason}</span>
          </div>
        </div>

        {/* Weekly Breakdown */}
        <div className="mb-3 space-y-2">
          {SAMPLE_GLOWUP_PLAN.weeklyBreakdown.map((week) => (
            <div key={week.week} className="rounded-lg bg-amber-500/5 p-2 border border-amber-500/10">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-amber-300">Week {week.week}</span>
                <span className="text-[10px] text-gray-500">{week.dailyMissions.length} days</span>
              </div>
              <div className="text-[10px] font-medium text-white">{week.focus}</div>
              <p className="mt-0.5 text-[10px] text-gray-500">{week.whyThisWeek}</p>
              <div className="mt-1 space-y-0.5">
                {week.dailyMissions.slice(0, 3).map((m) => (
                  <div key={m.day} className="flex items-start gap-1 text-[10px] text-gray-500">
                    <span className="mt-0.5 text-amber-400">D{m.day}</span>
                    <span>{m.task}</span>
                  </div>
                ))}
                {week.dailyMissions.length > 3 && (
                  <div className="text-[10px] text-gray-600">+{week.dailyMissions.length - 3} more days...</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Budget */}
        <div className="rounded-lg bg-emerald-500/5 p-2 border border-emerald-500/10">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Budget</div>
          <div className="text-[10px] font-medium text-emerald-400">{SAMPLE_GLOWUP_PLAN.budgetRoadmap.total}</div>
        </div>
      </SampleReportCard>
    </div>
  );
}
