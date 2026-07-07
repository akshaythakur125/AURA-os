"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getHabitStats, getTodayMission, getMissionDetail, getWeeklyStats, getFreezeCount, useFreeze, isProgramComplete, markMissionComplete, isMissionComplete } from "@/lib/storage/habitStore";
import { getAudits } from "@/lib/storage/auditStore";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { ShareModal } from "@/components/ui/ShareModal";

export default function GlowUpPage() {
  const [stats] = useState(() => getHabitStats());
  const [todayMission] = useState(() => getTodayMission());
  const [freezes] = useState(() => getFreezeCount());
  const [completed] = useState(() => isProgramComplete());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [streakAtRisk, setStreakAtRisk] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [milestone, setMilestone] = useState<number | null>(null);

  useEffect(() => {
    const audits = getAudits();
    const lastAudit = audits[0];
    if (lastAudit) {
      const days = new Set<number>();
      for (let d = 1; d <= 30; d++) {
        if (isMissionComplete(lastAudit.id, d)) days.add(d);
      }
      setCompletedDays(days);
    }
  }, []);

  useEffect(() => {
    const lastActive = stats.lastActiveDate;
    if (!lastActive) return;
    const lastDate = new Date(lastActive);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 1 && stats.currentStreak > 0) {
      setStreakAtRisk(true);
    }
  }, [stats]);

  const missionDetail = selectedDay ? getMissionDetail(selectedDay) : null;

  const handleCompleteMission = (day: number) => {
    const audits = getAudits();
    const lastAudit = audits[0];
    if (!lastAudit) return;
    markMissionComplete(lastAudit.id, day);
    setCompletedDays(prev => new Set([...prev, day]));
    trackEvent("onboarding_step_completed", { step: `glow_day_${day}` });

    // Check milestones
    const newTotal = completedDays.size + 1;
    if ([7, 14, 21, 30].includes(newTotal) && !completedDays.has(day)) {
      setMilestone(newTotal);
      setShareOpen(true);
    }
  };

  const handleUseFreeze = () => {
    if (useFreeze()) {
      trackEvent("onboarding_step_completed", { step: "freeze_used" });
      // Re-read
      window.location.reload();
    }
  };

  const weekLabels = ["W1: Light", "W2: Groom", "W3: Style", "W4: Profile", "+"];
  const weekDays = [[1,7],[8,14],[15,21],[22,28],[29,30]];

  const totalCompleted = completedDays.size;

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <Badge variant="premium" className="mb-3">30-Day Glow-Up</Badge>
          <h1 className="text-4xl font-bold text-white">In 30 days you won&apos;t recognize yourself. The question is — do you like what you see right now?</h1>
          <p className="mt-2 text-sm text-gray-400">Every day you skip is another day walking around with leaks everyone sees but you. One mission a day. No gym. No surgery. Just the things nobody told you were holding you back.</p>
        </div>

        {/* Stats bar */}
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-white">{stats.currentStreak}</div>
            <div className="text-[10px] text-gray-500">Day Streak</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-amber-400">{totalCompleted}</div>
            <div className="text-[10px] text-gray-500">/30 Done</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-white">{stats.longestStreak}</div>
            <div className="text-[10px] text-gray-500">Best Streak</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-sky-400">{freezes}</div>
            <div className="text-[10px] text-gray-500">Freezes</div>
          </Card>
        </div>

        {streakAtRisk && (
          <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-center">
            <p className="text-sm text-amber-300">⚠️ Your {stats.currentStreak}-day streak is at risk!</p>
            <p className="mt-1 text-xs text-gray-400">
              You haven&apos;t checked in today. Complete a mission or use a freeze to keep going.
            </p>
            {freezes > 0 && (
              <Button size="sm" variant="outline" className="mt-2 border-amber-500/30 text-amber-400" onClick={handleUseFreeze}>
                Use Freeze ({freezes} left)
              </Button>
            )}
          </div>
        )}

        {completed && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
            <span className="text-4xl">🎉</span>
            <h2 className="mt-2 text-xl font-bold text-white">30 Days Complete!</h2>
            <p className="mt-2 text-sm text-gray-400">
              You finished the full Glow-Up program. As a reward, get ₹100 off the Full Aura Report.
            </p>
            <div className="mt-4">
              <Button asChild>
                <Link href="/unlock?product=aura_report">Claim ₹100 off Full Report</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Calendar Heatmap */}
        <Card className="mb-8 p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Your Month at a Glance</h3>
          <div className="space-y-3">
            {weekDays.map(([start, end], wi) => {
              const ws = getWeeklyStats(wi + 1);
              return (
                <div key={wi} className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-500 w-14 text-right">{weekLabels[wi]}</span>
                  <div className="flex gap-1.5 flex-1">
                    {Array.from({ length: end - start + 1 }, (_, i) => start + i).map(day => {
                      const done = completedDays.has(day);
                      const isToday = todayMission?.day === day;
                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDay(day)}
                          className={`flex-1 aspect-square rounded-lg flex items-center justify-center text-[11px] font-semibold transition-all ${
                            done
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : isToday
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : "bg-white/5 text-gray-500 border border-transparent hover:border-white/20 hover:text-gray-300"
                          }`}
                          title={`Day ${day}: ${getMissionDetail(day)?.title || ""}`}
                        >
                          {done ? "✓" : day}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-gray-600 w-16 text-left">{ws.completed}/{ws.total}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Today's Mission */}
        {todayMission && (
          <Card className="mb-6 border-purple-500/20 ring-1 ring-purple-500/10 p-6">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="premium">Today&apos;s Mission</Badge>
              <span className="text-[10px] text-gray-500">Day {todayMission.day} of 30</span>
            </div>
            <h3 className="text-lg font-bold text-white">{todayMission.title}</h3>
            <p className="mt-2 text-sm text-gray-400">{todayMission.reason}</p>
            <p className="mt-2 text-sm text-gray-500 italic">{todayMission.task}</p>
            <div className="mt-4">
              <Button onClick={() => handleCompleteMission(todayMission.day)} disabled={completedDays.has(todayMission.day)} size="sm">
                {completedDays.has(todayMission.day) ? "✓ Completed" : "Mark Complete"}
              </Button>
            </div>
          </Card>
        )}

        {/* Selected Day Detail */}
        {missionDetail && (
          <Card className="mb-8 p-6">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="default">Week {missionDetail.weekNumber}</Badge>
              <span className="text-xs text-gray-500">{missionDetail.theme}</span>
            </div>
            <h3 className="text-lg font-bold text-white">Day {selectedDay}: {missionDetail.title}</h3>
            <p className="mt-3 text-sm text-gray-400">{missionDetail.reason}</p>
            <p className="mt-2 text-sm text-gray-300 bg-white/5 rounded-xl p-3">{missionDetail.task}</p>
            <div className="mt-4">
              <Button onClick={() => handleCompleteMission(selectedDay!)} disabled={completedDays.has(selectedDay!)} size="sm">
                {completedDays.has(selectedDay!) ? "✓ Done" : "Mark Done"}
              </Button>
            </div>
          </Card>
        )}

        {/* Milestone Progress */}
        <Card className="mb-8 p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Milestones</h3>
          <div className="space-y-3">
            {[
              { day: 7, label: "Week 1 Complete", reward: "Shareable progress card" },
              { day: 14, label: "Halfway There", reward: "1 streak freeze" },
              { day: 21, label: "3 Weeks Strong", reward: "Style strategy unlocked" },
              { day: 30, label: "Full Glow-Up", reward: "₹100 off Full Report" },
            ].map(m => {
              const reached = totalCompleted >= m.day;
              return (
                <div key={m.day} className={`flex items-center gap-3 rounded-xl p-3 ${reached ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-white/5"}`}>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${reached ? "bg-emerald-500/30 text-emerald-300" : "bg-white/10 text-gray-500"}`}>
                    {reached ? "✓" : m.day}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-semibold ${reached ? "text-emerald-300" : "text-gray-400"}`}>{m.label}</div>
                    <div className={`text-[11px] ${reached ? "text-emerald-500" : "text-gray-600"}`}>{m.reward}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Weekly Recaps */}
        <div className="space-y-4 mb-8">
          {[1, 2, 3, 4].map(w => {
            const ws = getWeeklyStats(w);
            if (ws.completed === 0 && totalCompleted < ws.startDay) return null;
            return (
              <Card key={w} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Week {w}: {["Lighting & Photography", "Grooming & Fit", "Style & Posing", "Profile & Presentation"][w-1]}</h4>
                    <p className="text-xs text-gray-500">{ws.completed} of {ws.total} missions done</p>
                  </div>
                  <div className={`text-lg font-bold ${ws.completed === ws.total ? "text-emerald-400" : ws.completed > 0 ? "text-amber-400" : "text-gray-600"}`}>
                    {ws.completed}/{ws.total}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        {!completed && (
          <Card className="p-6 text-center border-purple-500/20">
            <h3 className="text-lg font-bold text-white">Want a structured plan?</h3>
            <p className="mt-2 text-sm text-gray-400">
              The 30-Day Reset gives you a guided plan with daily missions, budget roadmap, and progress tracking.
            </p>
            <div className="mt-4">
              <Button asChild><Link href="/products/glowup-plan">Get 30-Day Reset — ₹499</Link></Button>
            </div>
          </Card>
        )}

        {/* ─── 30-Day Complete: Before/After Compare ─── */}
        {completed && (
          <Card className="p-6 border-emerald-500/20 bg-emerald-500/5">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold text-white">You finished all 30 days.</h3>
              <p className="mt-2 text-sm text-gray-400">
                Now let&apos;s see what changed. Re-audit your face and we&apos;ll auto-compare your before &amp; after scores.
              </p>
            </div>

            {(() => {
              const audits = getAudits();
              const beforeAudit = audits.find(a => a.freeResult && a.freeScore);
              if (beforeAudit) {
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-8">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">BEFORE</div>
                        <div className="text-3xl font-bold text-gray-400">{beforeAudit.freeScore}</div>
                        <div className="text-[10px] text-gray-600">Day 0</div>
                      </div>
                      <div className="text-2xl text-emerald-400">→</div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">AFTER</div>
                        <div className="text-3xl font-bold text-emerald-400">???</div>
                        <div className="text-[10px] text-gray-600">Day 30</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-3">
                        Your before score was <span className="text-white font-semibold">{beforeAudit.freeScore}</span>. Take a new photo to see how much you&apos;ve improved.
                      </p>
                      <Button asChild className="bg-emerald-600 hover:bg-emerald-500">
                        <Link
                          href={`/audit/new?beforeAuditId=${beforeAudit.id}`}
                          onClick={() => {
                            try { localStorage.setItem("aura_pending_glowup_before", beforeAudit.id); } catch {}
                            trackEvent("glowup_before_after_started", { beforeAuditId: beforeAudit.id });
                          }}
                        >
                          Re-audit Now → See Your Glow-Up
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              }
              return (
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-3">Take a new photo to compare your Day 0 vs Day 30.</p>
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-500">
                    <Link href="/audit/new">Re-audit Now → See Your Glow-Up</Link>
                  </Button>
                </div>
              );
            })()}

            <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-[10px] text-gray-600 text-center">
                Your before photo is saved from your first audit. The comparison is automatic.
              </p>
            </div>
          </Card>
        )}

        <ShareModal
          open={shareOpen}
          onClose={() => { setShareOpen(false); setMilestone(null); }}
          score={milestone || 0}
          category={`${milestone}/30 Days Complete`}
          strongestSignal="30-Day Glow-Up"
          biggestLeak="Journey Progress"
          onShareComplete={() => trackEvent("share_card_shared", { source: "glowup_milestone", milestone: String(milestone) })}
        />
      </div>
    </Container>
  );
}
