"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { ScoreTrend } from "@/components/dashboard/ScoreTrend";
import { StreakIndicator } from "@/components/dashboard/StreakIndicator";
import { ImprovementCard } from "@/components/dashboard/ImprovementCard";
import { getAudits, deleteAudit, getAuditStats } from "@/lib/storage/auditStore";
import { getLocalUser, updateLocalUser } from "@/lib/storage/userStore";
import { clearAll } from "@/lib/storage/localStore";
import { ReferralProgress } from "@/components/referral/ReferralProgress";
import { ReferralShare } from "@/components/referral/ReferralShare";
import type { Audit, AuditStats } from "@/types/audit";
import type { LocalUser } from "@/types/user";

const auditTypeLabels: Record<string, string> = {
  photo: "Photo Aura Check",
  instagram: "Instagram Profile Audit",
  dating: "Dating Profile Audit",
  outfit: "Outfit Audit",
  room: "Room / Background Audit",
};

const statusBadge: Record<string, "default" | "success" | "warning" | "danger" | "premium"> = {
  draft: "default",
  free_generated: "success",
  locked: "warning",
  unlocked: "premium",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function loadState() {
  if (typeof window === "undefined") {
    return { audits: [] as Audit[], stats: null as AuditStats | null, user: null as LocalUser | null };
  }
  const u = getLocalUser();
  return { audits: getAudits(), stats: getAuditStats(), user: u };
}

export default function DashboardPage() {
  const initial = loadState();
  const [audits, setAudits] = useState<Audit[]>(initial.audits);
  const [stats, setStats] = useState<AuditStats | null>(initial.stats);
  const [user, setUser] = useState<LocalUser | null>(initial.user);
  const [displayName, setDisplayName] = useState(initial.user?.displayName || "");
  const [city, setCity] = useState(initial.user?.city || "");
  const [saved, setSaved] = useState(false);

  function refresh() {
    setAudits(getAudits());
    setStats(getAuditStats());
    const u = getLocalUser();
    setUser(u);
  }

  function handleSaveProfile() {
    updateLocalUser({ displayName: displayName || undefined, city: city || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleClearData() {
    if (!window.confirm("This will delete all local audits and preferences. Continue?")) return;
    clearAll();
    refresh();
  }

  function handleDeleteAudit(id: string) {
    if (!window.confirm("Delete this audit? This cannot be undone.")) return;
    deleteAudit(id);
    refresh();
  }

  const hasAudits = audits.length > 0;

  const scoresForTrend = audits
    .filter((a) => a.freeScore !== undefined)
    .map((a) => ({ score: a.freeScore!, date: a.createdAt }));

  function getCategory(audit: Audit): string | undefined {
    if (audit.fullReport?.fullContent?.category) return audit.fullReport.fullContent.category;
    return audit.fullReport?.freeResult?.category;
  }

  return (
    <>
      <div className="aurora-mesh" />
      <Container className="relative py-12">
        <GlowOrb color="rgba(147, 51, 234, 0.08)" size={300} className="top-[10%] right-[8%]" delay={0} />
        <GlowOrb color="rgba(236, 72, 153, 0.06)" size={200} className="bottom-[15%] left-[5%]" delay={300} />

      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            {user?.displayName
              ? `Welcome back, ${user.displayName}`
              : "Your Dashboard"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your improvement. Check in regularly to keep your score rising.
          </p>
        </div>
        <Link href="/audit/new">
          <Button size="sm">+ New Aura Check</Button>
        </Link>
      </div>

      {!hasAudits && (
        <Card className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="mb-2 text-lg text-gray-300">No audits yet</p>
          <p className="mb-6 text-sm text-gray-500">
            Start your first Aura Check to see your results here.
          </p>
          <Link href="/audit/new">
            <Button>Start Your First Audit</Button>
          </Link>
        </Card>
      )}

      {/* Hero: Score Trend + Streak */}
      {hasAudits && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <ScoreTrend scores={scoresForTrend} />
          </Card>
          <Card className="p-5">
            <StreakIndicator audits={audits} />
          </Card>
        </div>
      )}

      {/* Improvement Celebration */}
      {hasAudits && <ImprovementCard audits={audits} />}

      {/* Stats Row */}
      {hasAudits && stats && (
        <div className="my-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <div className="text-xs text-gray-500">Total Checks</div>
            <div className="mt-1 text-2xl font-bold text-white">{stats.totalAudits}</div>
          </Card>
          <Card>
            <div className="text-xs text-gray-500">Latest Score</div>
            <div className="mt-1 text-2xl font-bold text-white">
              {stats.latestScore ?? "—"}
            </div>
          </Card>
          <Card>
            <div className="text-xs text-gray-500">Best Score</div>
            <div className="mt-1 text-2xl font-bold text-emerald-400">
              {stats.bestScore ?? "—"}
            </div>
          </Card>
          <Card>
            <div className="text-xs text-gray-500">Avg Score</div>
            <div className="mt-1 text-2xl font-bold text-purple-400">
              {stats.averageFreeScore ?? "—"}
            </div>
          </Card>
        </div>
      )}

      {/* Onboarding Checklist */}
      <OnboardingChecklist />

      {/* Referral Progress + Share */}
      <ReferralProgress />
      {hasAudits && <ReferralShare />}

      {/* Upgrade Recommendations Card */}
      {hasAudits && (
        <Card className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Upgrade Recommendations
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Personalized product suggestions based on your latest audit.
              </p>
            </div>
            <Link href="/shop">
              <Button size="sm">Open Shop</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Repeated Pattern Insight */}
      {hasAudits && (() => {
        const withMetrics = audits.filter(
          (a) => a.fullReport?.freeResult?.imageMetrics
        );
        if (withMetrics.length < 2) return null;
        const lowLighting = withMetrics.filter(
          (a) => (a.fullReport?.freeResult?.imageMetrics.lightingScore ?? 50) < 55
        ).length;
        const lowClarity = withMetrics.filter(
          (a) => (a.fullReport?.freeResult?.imageMetrics.clarityScore ?? 50) < 55
        ).length;
        const highBg = withMetrics.filter(
          (a) => (a.fullReport?.freeResult?.imageMetrics.backgroundComplexityEstimate ?? 0) > 60
        ).length;
        const total = withMetrics.length;

        let insight = "";
        if (lowLighting >= total * 0.6) insight = "Low lighting is a recurring pattern across your audits. Improving your lighting setup will lift every future photo.";
        else if (highBg >= total * 0.6) insight = "Busy backgrounds appear repeatedly. A clean, consistent background will improve all your photos.";
        else if (lowClarity >= total * 0.6) insight = "Clarity is a repeated challenge. Focus on steady framing and clean lenses for sharper results.";
        else if (lowLighting >= total * 0.4) insight = "Lighting tends to be a common area for improvement. Even small lighting upgrades can make a difference.";
        else return null;

        return (
          <Card className="mb-10">
            <h3 className="mb-2 text-sm font-semibold text-white">Your Repeated Pattern</h3>
            <p className="text-xs text-gray-300">{insight}</p>
          </Card>
        );
      })()}

      {/* Audit History */}
      {hasAudits && (
        <div className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-white">Audit History</h2>
          <div className="space-y-4">
            {audits.map((audit) => {
              const category = getCategory(audit);
              return (
                <Card key={audit.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    {audit.imageDataUrl && (
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/[0.04]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={audit.imageDataUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-white">
                          {auditTypeLabels[audit.auditType] || audit.auditType}
                        </h3>
                        <Badge variant={statusBadge[audit.reportStatus] || "default"}>
                          {audit.reportStatus === "unlocked" ? "Full Report Unlocked" : audit.reportStatus.replace("_", " ")}
                        </Badge>
                        {category && (
                          <Badge variant="premium">{category}</Badge>
                        )}
                        {audit.personalization?.archetype && (
                          <span className="text-[10px] text-amber-400">{audit.personalization.archetype}</span>
                        )}
                        {audit.unlockedProducts && audit.unlockedProducts.length > 0 && audit.unlockedProducts.map((up) => (
                          <Badge key={up} variant="success">
                            {up === "aura_report" ? "Full Report" : up === "dating_audit" ? "Dating" : "Glow-Up"}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>Goal: {audit.goal}</span>
                        <span>Budget: &#8377;{audit.budgetRange.toLocaleString()}</span>
                        {audit.freeScore !== undefined && (
                          <span>
                            Score:{" "}
                            <span className="text-purple-300">{audit.freeScore}</span>
                          </span>
                        )}
                        <span>{formatDate(audit.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link href={`/audit/${audit.id}`}>
                      <Button variant="secondary" size="sm">View</Button>
                    </Link>
                    {audit.reportStatus === "free_generated" && audit.unlockStatus === "locked" && (
                      <Link href={`/unlock?auditId=${audit.id}&product=aura_report`}>
                        <Button size="sm">Unlock ₹99</Button>
                      </Link>
                    )}
                    <button
                      onClick={() => handleDeleteAudit(audit.id)}
                      className="rounded-lg px-2 py-1.5 text-xs text-gray-500 transition-colors hover:bg-white/5 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <Link href="/data"><Button variant="ghost" size="sm">Your Local Data</Button></Link>
        <Link href="/help"><Button variant="ghost" size="sm">Help & FAQ</Button></Link>
        <Link href="/privacy-center"><Button variant="ghost" size="sm">Privacy Center</Button></Link>
      </div>

      <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 text-center text-xs text-gray-600">
        Local-only MVP: your data is stored in your browser, not uploaded to a server. Referral and challenge tracking is local — no real social network.
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-white">Profile Settings</h2>
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Your city"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button size="sm" onClick={handleSaveProfile}>
              {saved ? "Saved!" : "Save Profile"}
            </Button>
            <button
              onClick={handleClearData}
              className="rounded-lg px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/10"
            >
              Clear All Local Data
            </button>
          </div>
        </Card>
      </div>
      </Container>
    </>
  );
}
