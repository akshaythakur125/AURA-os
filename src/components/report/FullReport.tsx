"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FadeInView } from "@/components/ui/FadeInView";
import type { FullAuraReportContent, Observation } from "@/types/audit";

const OBS_ICON: Record<Observation["category"], string> = {
  hair: "💇",
  clothing: "👕",
  skin: "✨",
  grooming: "🪞",
  accessories: "⌚",
  background: "🏠",
  posing: "📐",
};

/**
 * The paid report body — every section of FullAuraReportContent, rendered.
 * This is what the unlock actually buys: verdict, potential, priorities, a
 * 7-day plan, expert observations, the photo playbook, goal strategy, and a
 * budget map pointed at this photo's measured gaps.
 */
export function FullReport({ content }: { content: FullAuraReportContent }) {
  const imp = content.improvementScore;
  const ba = content.beforeAfter;

  return (
    <div className="space-y-6">
      {/* ─── Verdict + potential ─── */}
      <FadeInView>
        <Card className="border-[#E14434]/20 bg-gradient-to-b from-[#E14434]/[0.06] to-transparent">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#B23A25]">The verdict</span>
          </div>
          <p className="text-sm leading-relaxed text-[#1C1917]">{content.finalVerdict}</p>
          {imp && (
            <div className="mt-4 flex items-center gap-4 rounded-xl bg-[#1c1917]/[0.04] p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1C1917]">{imp.currentScore}</div>
                <div className="text-[10px] uppercase tracking-wide text-[#857b6e]">now</div>
              </div>
              <div className="flex-1">
                <div className="h-1.5 overflow-hidden rounded-full bg-[#1c1917]/[0.08]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#E14434] to-[#ff8a4c]"
                    style={{ width: `${Math.min(100, (imp.currentScore / Math.max(1, imp.potentialScore)) * 100)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-center text-[11px] text-[#6f675e]">{imp.message}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#E14434]">{imp.potentialScore}</div>
                <div className="text-[10px] uppercase tracking-wide text-[#857b6e]">your ceiling</div>
              </div>
            </div>
          )}
          {ba && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#1c1917]/[0.08] p-3">
                <p className="mb-1.5 text-[11px] font-medium text-[#857b6e]">{ba.currentLabel}</p>
                <ul className="space-y-1">
                  {ba.currentTraits.slice(0, 3).map((t) => (
                    <li key={t} className="text-[11px] text-[#6f675e]">• {t}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-[#E14434]/20 bg-[#E14434]/[0.04] p-3">
                <p className="mb-1.5 text-[11px] font-medium text-[#B23A25]">{ba.potentialLabel}</p>
                <ul className="space-y-1">
                  {ba.potentialTraits.slice(0, 3).map((t) => (
                    <li key={t} className="text-[11px] text-[#4a443d]">• {t}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Card>
      </FadeInView>

      {/* ─── Priority map ─── */}
      <FadeInView delay={60}>
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-[#1C1917]">Where your effort goes first</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl bg-[#E14434]/[0.06] p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E14434] text-xs font-bold text-white">1</span>
              <p className="text-sm text-[#1C1917]">{content.priorityUpgradeMap.firstPriority}</p>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-[#1c1917]/[0.03] p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1c1917]/70 text-xs font-bold text-white">2</span>
              <p className="text-sm text-[#4a443d]">{content.priorityUpgradeMap.secondPriority}</p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-3">
              <span className="mt-0.5 text-sm">⚠️</span>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-amber-600">Don&apos;t waste money on</p>
                <p className="text-sm text-[#4a443d]">{content.priorityUpgradeMap.avoidForNow}</p>
              </div>
            </div>
          </div>
        </Card>
      </FadeInView>

      {/* ─── 7-day action plan ─── */}
      {content.actionPlan && content.actionPlan.length > 0 && (
        <FadeInView delay={90}>
          <Card className="border-[#E14434]/15">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[#1C1917]">Your 7-day plan</h3>
              <p className="mt-0.5 text-xs text-[#857b6e]">Built from this photo&apos;s exact gaps — follow it in order.</p>
            </div>
            <div className="space-y-3">
              {content.actionPlan.map((d) => (
                <div key={d.day} className="rounded-xl border border-[#1c1917]/[0.07] p-3">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="rounded-md bg-[#E14434]/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#B23A25]">DAY {d.day}</span>
                    <span className="text-xs font-semibold text-[#1C1917]">{d.focus}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {d.tasks.map((t) => (
                      <li key={t} className="flex items-start gap-2 text-xs leading-relaxed text-[#4a443d]">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#E14434]/60" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        </FadeInView>
      )}

      {/* ─── Expert observations ─── */}
      {content.observations.length > 0 && (
        <FadeInView delay={120}>
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-[#1C1917]">What a stylist would tell you</h3>
            <div className="space-y-3">
              {content.observations.map((o) => (
                <div
                  key={o.category + o.title}
                  className={`rounded-xl border p-3 ${
                    o.severity === "positive"
                      ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                      : o.severity === "needs-work"
                        ? "border-[#E14434]/20 bg-[#E14434]/[0.04]"
                        : "border-[#1c1917]/[0.08] bg-[#1c1917]/[0.02]"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{OBS_ICON[o.category]}</span>
                      <h4 className="text-sm font-medium text-[#1C1917]">{o.title}</h4>
                    </div>
                    <Badge variant={o.severity === "positive" ? "success" : o.severity === "needs-work" ? "danger" : "default"}>
                      {o.severity === "positive" ? "strength" : o.severity === "needs-work" ? "fix" : "neutral"}
                    </Badge>
                  </div>
                  <p className="text-xs leading-relaxed text-[#6f675e]">{o.detail}</p>
                  <p className="mt-1.5 text-xs text-[#4a443d]">
                    <span className="font-medium text-[#B23A25]">Do this: </span>
                    {o.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </FadeInView>
      )}

      {/* ─── Photo playbook ─── */}
      <FadeInView delay={150}>
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-[#1C1917]">Your reshoot playbook</h3>
          <div className="space-y-3">
            {(
              [
                ["💡 Lighting", content.photoGuidance.lighting],
                ["📐 Framing", content.photoGuidance.framing],
                ["🏠 Background", content.photoGuidance.background],
                ["🧍 Presentation", content.photoGuidance.posingOrPresentation],
                ["🎨 Editing", content.photoGuidance.editing],
              ] as const
            ).map(([label, text]) => (
              <div key={label} className="rounded-xl bg-[#1c1917]/[0.03] p-3">
                <p className="mb-1 text-xs font-semibold text-[#1C1917]">{label}</p>
                <p className="text-xs leading-relaxed text-[#6f675e]">{text}</p>
              </div>
            ))}
          </div>
        </Card>
      </FadeInView>

      {/* ─── Goal strategy ─── */}
      <FadeInView delay={180}>
        <Card>
          <h3 className="mb-1 text-sm font-semibold text-[#1C1917]">{content.goalSpecificAdvice.goal}</h3>
          <p className="mb-3 text-xs leading-relaxed text-[#6f675e]">{content.goalSpecificAdvice.strategy}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Do this</p>
              <p className="text-xs leading-relaxed text-[#4a443d]">{content.goalSpecificAdvice.doThis}</p>
            </div>
            <div className="rounded-xl border border-[#E14434]/20 bg-[#E14434]/[0.04] p-3">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#B23A25]">Avoid this</p>
              <p className="text-xs leading-relaxed text-[#4a443d]">{content.goalSpecificAdvice.avoidThis}</p>
            </div>
          </div>
        </Card>
      </FadeInView>

      {/* ─── Budget map ─── */}
      <FadeInView delay={210}>
        <Card>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#1C1917]">Money map — spend where it moves the score</h3>
            <p className="mt-0.5 text-xs text-[#857b6e]">Each tier targets your measured gaps. Start free; only spend when the free wins are done.</p>
          </div>
          <div className="space-y-3">
            {(
              [
                ["Free — do these first", content.budgetUpgradePlan.immediateFree],
                ["Under ₹2,000", content.budgetUpgradePlan.under2000],
                ["Under ₹5,000", content.budgetUpgradePlan.under5000],
                ["Under ₹10,000", content.budgetUpgradePlan.under10000],
                ["₹25,000 — full transformation", content.budgetUpgradePlan.under25000],
              ] as const
            ).map(([tier, items]) => (
              <div key={tier} className="rounded-xl border border-[#1c1917]/[0.07] p-3">
                <p className="mb-2 text-xs font-semibold text-[#B23A25]">{tier}</p>
                <ul className="space-y-1.5">
                  {items.map((it) => (
                    <li key={it} className="flex items-start gap-2 text-xs leading-relaxed text-[#4a443d]">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#1c1917]/40" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </FadeInView>
    </div>
  );
}
