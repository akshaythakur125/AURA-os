"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { FadeInView } from "@/components/ui/FadeInView";
import { CountUp } from "@/components/ui/CountUp";
import { getAuditById, updateAudit, deleteAudit, createAudit } from "@/lib/storage/auditStore";
import { trackEvent, EVENTS } from "@/lib/analytics/events";
import { generateFreeAuraReport } from "@/lib/aura-engine/generateAuraReport";
import { generateFullAuraReport } from "@/lib/aura-engine/generateFullAuraReport";
import { FullReport } from "@/components/report/FullReport";
import { LockedSection } from "@/components/report/LockedSection";
import { GroomingLocalCard, type NearbyPlace } from "@/components/report/GroomingLocalCard";
import { YourColorsCard } from "@/components/report/YourColorsCard";
import { CapsuleWardrobeCard } from "@/components/report/CapsuleWardrobeCard";
import { FaceShapeCard } from "@/components/report/FaceShapeCard";
import { Scene3DAccent } from "@/components/hero/Scene3DAccent";
import { generateStatusArchetype } from "@/lib/aura-engine/archetypes";
import { ShareCardBuilder } from "@/components/share/ShareCardBuilder";
import { ReferralShare } from "@/components/referral/ReferralShare";
import { ResultCapture } from "@/components/recovery/ResultCapture";
import { PersonalizedShop } from "@/components/shop/PersonalizedShop";
import { getPersonalizedLooks } from "@/lib/shop/catalog";
import { SocialProofBar } from "@/components/social-proof/SocialProofBar";
import { RecentScores } from "@/components/social-proof/RecentScores";
import { PercentileBadge } from "@/components/social-proof/PercentileBadge";
import { PaymentTrust } from "@/components/trust/PaymentTrust";
import type { Audit, FreeAuraResult, FullAuraReportContent, Observation, ImageSignalMetrics } from "@/types/audit";
import type { PersonalizationResult, SignalMismatch, GoalStrategy } from "@/types/personalization";
import { getBuyLinksForObservation, getTutorialLinks } from "@/lib/aura-engine/productLinks";
import { ConversionFunnel } from "@/components/conversion/ConversionFunnel";
import { PaywallPopup } from "@/components/conversion/PaywallPopup";
import { CelebrityMatch } from "@/components/celebrity/CelebrityMatch";
import { SmartInsights } from "@/components/report/SmartInsights";
import { ScoreBreakdown } from "@/components/report/ScoreBreakdown";
import { ImprovementRoadmap } from "@/components/report/ImprovementRoadmap";
import { DynamicGoalAdvice } from "@/components/report/DynamicGoalAdvice";
import { SignalSculpture, SignalSculptureFallback } from "@/components/report/SignalSculpture";
import { ScoreHistory } from "@/components/report/ScoreHistory";
import { matchCelebrity, type MatchResult } from "@/lib/aura-engine/celebrityMatch";

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
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ArchetypeCard({ personalization }: { personalization: PersonalizationResult }) {
  const colorMap: Record<string, string> = {
    "Clean Basic": "border-slate-500/30 bg-slate-500/10",
    "Urban Aspirational": "border-red-500/30 bg-red-500/10",
    "Premium Minimalist": "border-emerald-500/30 bg-emerald-500/10",
    "Loud Flex": "border-red-500/30 bg-red-500/10",
    "Soft Luxury": "border-amber-500/30 bg-amber-500/10",
    "Creator Vibe": "border-cyan-500/30 bg-cyan-500/10",
    "College Casual": "border-blue-500/30 bg-blue-500/10",
    "Corporate Sharp": "border-red-500/30 bg-red-500/10",
    "Try-Hard Signal": "border-orange-500/30 bg-orange-500/10",
    "Mismatched Flex": "border-red-500/30 bg-red-500/10",
    "Low-Clarity Potential": "border-gray-500/30 bg-gray-500/10",
  };
  const colors = colorMap[personalization.archetype] || colorMap["Clean Basic"];
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-[#1C1917]">Your Status Archetype</h3>
      <div className={`mb-4 rounded-xl border p-4 ${colors}`}>
        <div className="text-lg font-bold text-[#1C1917]">{personalization.archetype}</div>
        <p className="mt-2 text-xs text-[#4a443d]">{personalization.archetypeExplanation}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-3">
          <div className="text-xs text-red-400">Priority</div>
          <p className="mt-1 text-xs text-[#4a443d]">{personalization.userPriority}</p>
        </div>
        <div className="rounded-lg border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-3">
          <div className="text-xs text-red-400">Focus Areas</div>
          <p className="mt-1 text-xs text-[#4a443d]">{personalization.recommendedFocus}</p>
        </div>
      </div>
    </Card>
  );
}

function SignalMismatchCard({ mismatches }: { mismatches: SignalMismatch[] }) {
  if (mismatches.length === 0) return null;
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-[#1C1917]">Signal Mismatches</h3>
      <div className="space-y-4">
        {mismatches.map((m) => (
          <div key={m.title} className="rounded-xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium text-[#1C1917]">{m.title}</h4>
              <Badge variant={m.severity === "high" ? "danger" : m.severity === "medium" ? "warning" : "default"}>
                {m.severity}
              </Badge>
            </div>
            <p className="mb-2 text-xs text-[#6f675e]">{m.explanation}</p>
            <p className="text-xs text-[#857b6e]">
              <span className="text-red-300">Correction:</span> {m.correction}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function GoalStrategyCard({ strategy }: { strategy: GoalStrategy }) {
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-[#1C1917]">Goal Strategy</h3>
      <div className="space-y-4">
        <div>
          <div className="mb-1 text-xs text-red-400">{strategy.goal}</div>
          <div className="text-xs text-[#857b6e]">Strategy</div>
          <p className="text-sm text-[#4a443d]">{strategy.strategyTitle}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <div className="mb-1 text-xs text-emerald-400">Optimize</div>
            <p className="text-xs text-[#4a443d]">{strategy.whatToOptimize}</p>
          </div>
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
            <div className="mb-1 text-xs text-red-400">Avoid</div>
            <p className="text-xs text-[#4a443d]">{strategy.whatToAvoid}</p>
          </div>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
          <div className="mb-1 text-xs text-red-400">Best Next Move</div>
          <p className="text-xs text-[#4a443d]">{strategy.bestNextMove}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-3">
            <div className="mb-1 text-xs text-[#857b6e]">Photo Direction</div>
            <p className="text-xs text-[#4a443d]">{strategy.suggestedPhotoDirection}</p>
          </div>
          <div className="rounded-lg border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-3">
            <div className="mb-1 text-xs text-[#857b6e]">Style Direction</div>
            <p className="text-xs text-[#4a443d]">{strategy.suggestedStyleDirection}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}


// ─── Premium Bundles inline component ───

// ─── Buy links + YouTube tutorials for each observation ───
function ObsLinks({ obs }: { obs: Observation }) {
  const buyLinks = getBuyLinksForObservation(obs);
  const tutorials = getTutorialLinks(obs);
  if (buyLinks.length === 0 && tutorials.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {buyLinks.map((link) => (
        <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
           className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[10px] text-red-300 hover:bg-red-500/20">
          <span>{link.icon}</span> {link.label}
        </a>
      ))}
      {tutorials.map((t) => (
        <a key={t.url} href={t.url} target="_blank" rel="noopener noreferrer"
           className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[10px] text-red-300 hover:bg-red-500/20">
          <span>🎬</span> {t.title}
        </a>
      ))}
    </div>
  );
}

function PremiumBundles({ metrics, observations }: { metrics: ImageSignalMetrics; observations: Observation[] }) {
  // ponytail: inline bundle builder, no new file needed
  const bundles: { name: string; emoji: string; desc: string; items: { name: string; price: string; url: string }[]; total: string }[] = [];

  const hasGrooming = observations.some(o => o.category === "grooming" || o.category === "skin");
  const hasClothing = observations.some(o => o.category === "clothing") || metrics.clothingRegion.contrastWithSkin < 20;
  const hasPhoto = metrics.backgroundComplexityEstimate > 50 || metrics.lightingScore < 60;
  const hasHair = observations.some(o => o.category === "hair") || metrics.hairRegion.neatnessScore < 50;

  if (hasGrooming) bundles.push({
    name: "Essential Grooming Kit", emoji: "🧴",
    desc: "Skincare + grooming basics for a polished look.",
    items: [
      { name: "Face Wash + Moisturizer", price: "₹499", url: "https://www.nykaa.com/search/result/?q=grooming+kit+men" },
      { name: "Hair Styling Product", price: "₹349", url: "https://www.amazon.in/s?k=hair+styling+cream+men" },
      { name: "Sunscreen SPF50", price: "₹399", url: "https://www.nykaa.com/search/result/?q=sunscreen+men" },
    ], total: "₹1,247"
  });
  if (hasClothing) bundles.push({
    name: "Profile Photo Outfit", emoji: "👔",
    desc: "Photographer-approved picks for profile photos.",
    items: [
      { name: "Solid Color Shirt", price: "₹799", url: "https://www.myntra.com/gateway/v2/search/query?q=solid+shirt+men" },
      { name: "Minimal Watch", price: "₹1,299", url: "https://www.myntra.com/gateway/v2/search/query?q=minimal+watch+men" },
      { name: "Casual Blazer", price: "₹1,999", url: "https://www.ajio.com/search/?text=men+casual+blazer" },
    ], total: "₹4,097"
  });
  if (hasPhoto) bundles.push({
    name: "Home Photo Studio Kit", emoji: "📸",
    desc: "Better lighting, cleaner backgrounds, steadier shots.",
    items: [
      { name: "Ring Light + Stand", price: "₹899", url: "https://www.amazon.in/s?k=ring+light+with+stand" },
      { name: "Phone Tripod", price: "₹499", url: "https://www.amazon.in/s?k=phone+tripod+stand" },
      { name: "Plain Backdrop", price: "₹399", url: "https://www.amazon.in/s?k=photo+backdrop+plain" },
    ], total: "₹1,797"
  });
  if (hasHair) bundles.push({
    name: "Hair Care Essentials", emoji: "💈",
    desc: "Tame frizz, add definition, look sharp.",
    items: [
      { name: "Hair Serum", price: "₹349", url: "https://www.nykaa.com/search/result/?q=hair+serum+men" },
      { name: "Styling Wax", price: "₹299", url: "https://www.amazon.in/s?k=hair+wax+men" },
      { name: "Leave-in Conditioner", price: "₹449", url: "https://www.amazon.in/s?k=leave+in+conditioner+men" },
    ], total: "₹1,097"
  });

  if (bundles.length === 0) return null;

  return (
    <Card className="mb-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-lg">🛍️</span>
        <h3 className="text-sm font-semibold text-[#1C1917]">Recommended Product Bundles</h3>
      </div>
      <p className="mb-4 text-xs text-[#6f675e]">Curated picks based on your analysis. Tap to shop.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {bundles.map((b) => (
          <div key={b.name} className="rounded-xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-lg">{b.emoji}</span>
              <div>
                <div className="text-sm font-medium text-[#1C1917]">{b.name}</div>
                <div className="text-[10px] text-[#857b6e]">{b.desc}</div>
              </div>
            </div>
            <div className="mb-2 space-y-1">
              {b.items.map((item) => (
                <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-between rounded-lg bg-[#1c1917]/[0.03] px-2.5 py-1.5 text-[11px] text-[#4a443d] hover:bg-[#1c1917]/[0.04]">
                  <span>{item.name}</span>
                  <span className="text-red-400 font-medium">{item.price}</span>
                </a>
              ))}
            </div>
            <div className="text-[10px] text-[#857b6e]">Est. total: <span className="text-red-400">{b.total}</span></div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function AuditDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();

  // Start undefined on both server and client so the first render matches
  // (avoids a hydration mismatch); load from localStorage after mount.
  const [audit, rawSetAudit] = useState<Audit | null | undefined>(undefined);
  useEffect(() => {
    rawSetAudit(getAuditById(id) ?? null);
  }, [id]);
  const [generating, setGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FreeAuraResult | null>(null);
  const [fullContent, setFullContent] = useState<FullAuraReportContent | null>(null);
  const [reportTab, setReportTab] = useState<"report" | "looks" | "tools">("report");
  // Deep-link (?tab=looks) + remember the last-viewed tab. Client-only so the
  // initial server/client render matches (default "report"), then we restore.
  useEffect(() => {
    try {
      const fromUrl = new URLSearchParams(window.location.search).get("tab");
      const fromStore = sessionStorage.getItem("auracheck:reportTab");
      const val = [fromUrl, fromStore].find((v) => v === "report" || v === "looks" || v === "tools");
      if (val) {
        setReportTab(val as "report" | "looks" | "tools");
        sessionStorage.setItem("auracheck:reportTab", val); // persist deep-links too
      }
    } catch { /* no-op */ }
  }, []);
  const selectTab = (id: "report" | "looks" | "tools") => {
    setReportTab(id);
    try {
      sessionStorage.setItem("auracheck:reportTab", id);
      const url = new URL(window.location.href);
      url.searchParams.set("tab", id);
      window.history.replaceState({}, "", url.toString());
    } catch { /* no-op */ }
  };
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ city: string; lat: number; lng: number } | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<{
    salons: NearbyPlace[]; photographers: NearbyPlace[]; gyms: NearbyPlace[];
    opticians: NearbyPlace[]; tailors: NearbyPlace[]; skinClinics: NearbyPlace[];
  }>({ salons: [], photographers: [], gyms: [], opticians: [], tailors: [], skinClinics: [] });
  const [celebMatches, setCelebMatches] = useState<MatchResult[]>([]);

  function handlePrint() {
    window.print();
  }

  function setAudit(a: Audit | null) {
    rawSetAudit(a);
  }

  async function handleGenerate() {
    if (!audit || !audit.imageDataUrl) return;
    setGenerating(true);
    setError(null);
    trackEvent(EVENTS.ANALYSIS_STARTED, { auditId: audit.id });
    let stage = "init";

    try {
      stage = "running-pixel-analysis";
      const report = await generateFreeAuraReport(audit);
      if (!report) throw new Error("REPORT_GENERATION_FAILED");
      setResult(report);

      // ponytail: wrap every downstream step — none must crash the page
      stage = "computing-celebrity-matches";
      try {
        const im = report.imageMetrics;
        const matches = matchCelebrity({
          goal: audit.goal || "dating",
          lightingScore: im?.lightingScore ?? 50,
          groomingScore: im?.clarityScore ?? 50,
          outfitScore: im?.contrast ?? 50,
          expressionScore: im?.compositionScore ?? 50,
          symmetryScore: im?.symmetryScore ?? 50,
          backgroundScore: im?.backgroundBrightness ?? 50,
        });
        setCelebMatches(matches);
      } catch (e) {
        console.error("[analysis] celebrity match failed:", e);
      }

      stage = "building-personalization";
      try {
        const personalization = generateStatusArchetype(audit, report.imageMetrics);
        const im = report.imageMetrics;
        const updated = updateAudit(audit.id, {
          freeScore: report.auraScore,
          freeSummary: report.oneLineVerdict,
          reportStatus: "free_generated",
          unlockStatus: "locked",
          personalization,
          fullReport: {
            id: audit.id + "-report",
            auditId: audit.id,
            score: {
              overall: report.auraScore,
              categories: {
                visual: im?.lightingScore ?? 50,
                presentation: im?.clarityScore ?? 50,
                signals: Math.round(((im?.contrast ?? 50) + (im?.saturation ?? 50)) / 2),
                cohesion: im?.compositionScore ?? 50,
              },
            },
            leaks: report.statusLeaks ?? [],
            suggestions: (report.quickFixes ?? []).map((q) => ({
              id: "qf-" + (q.title || "untitled").toLowerCase().replace(/\s+/g, "-"),
              category: "quick-fix",
              title: q.title,
              description: q.description,
              effort: q.effort,
              cost: q.cost,
            })),
            summary: report.oneLineVerdict,
            createdAt: report.generatedAt,
            isPremium: false,
            freeResult: report,
          },
        });
        if (updated) setAudit(updated);
      } catch (e) {
        console.error("[analysis] audit save failed:", e);
        // Result is still set — page can show it even if save failed
      }

      stage = "done";
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[AuraCheck] generation failed", { stage, error: msg });
      if (stage === "running-pixel-analysis") {
        setError("Analysis failed (" + stage + "). We could not read this image. Upload the original JPEG, PNG, or WebP file.");
      } else {
        setError("Analysis failed during " + stage + ". Please try again.");
      }
    } finally {
      setGenerating(false);
      setTimeout(() => {
        setReportReady(true);
        document.querySelector("[data-score-card]")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }

  const canGenerate = audit?.reportStatus === "draft" && audit?.imageDataUrl;

  useEffect(() => {
    if (canGenerate && !generating) {
      handleGenerate();
    }
  }, [canGenerate]);
  // Unlocked audits keep their free result — without this, a paid report page
  // rendered nothing at all after reload (displayResult was null for
  // reportStatus "unlocked", hiding the entire analysis body).
  const hasResult =
    (audit?.reportStatus === "free_generated" || audit?.reportStatus === "unlocked") &&
    audit?.fullReport?.freeResult;
  const displayResult = result || (hasResult ? (audit!.fullReport!.freeResult as FreeAuraResult) : null);
  const [serverVerified, setServerVerified] = useState<boolean | null>(null);
  const isUnlocked = audit?.reportStatus === "unlocked" && audit?.fullReport?.fullContent && serverVerified !== false;
  const unlockHref = `/unlock?auditId=${id}&product=aura_report`;
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallTrigger, setPaywallTrigger] = useState("");
  const displayFull = fullContent || (isUnlocked ? (audit!.fullReport!.fullContent as FullAuraReportContent) : null);
  const personalization = audit?.personalization;

  // ponytail: re-verify payment with Razorpay on page load — localStorage alone is not proof
  useEffect(() => {
    if (!audit?.reportStatus || audit.reportStatus !== "unlocked") { setServerVerified(true); return; }
    if (!((audit as unknown) as Record<string, unknown>).razorpayOrderId) { setServerVerified(true); return; }
    const orderId = ((audit as unknown) as Record<string, unknown>).razorpayOrderId as string;
    const paymentId = ((audit as unknown) as Record<string, unknown>).razorpayPaymentId as string;
    if (!orderId || !paymentId) { setServerVerified(true); return; }
    fetch("/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auditId: id, productType: "aura_report", razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: "recheck" }),
    }).then((r) => r.json()).then((d) => {
      setServerVerified(d.valid === true);
      if (d.valid === false) {
        // Payment not verified — re-lock the report
        try {
          const audits = JSON.parse(localStorage.getItem("aura_audits") || "[]");
          const idx = audits.findIndex((a: { id: string }) => a.id === id);
          if (idx >= 0) { audits[idx].reportStatus = "free_generated"; localStorage.setItem("aura_audits", JSON.stringify(audits)); }
        } catch {}
      }
    }).catch(() => setServerVerified(true)); // On network error, don't lock out
  }, [audit, id]);

  useEffect(() => {
    if (displayResult) {
      trackEvent(EVENTS.RESULTS_VIEWED, { auditId: id, score: displayResult.auraScore });
    }
  }, [displayResult, id]);

  useEffect(() => {
    if (displayResult && !isUnlocked) {
      trackEvent(EVENTS.PAYWALL_VIEWED, { auditId: id, score: displayResult.auraScore });
    }
  }, [displayResult, isUnlocked, id]);

  // Self-heal the paid report: if this audit is unlocked but its full content is
  // missing (legacy unlock, storage eviction) or predates the action plan,
  // regenerate it client-side so paying users always get the complete report.
  useEffect(() => {
    if (!audit || audit.reportStatus !== "unlocked" || !audit.imageDataUrl) return;
    const existing = audit.fullReport?.fullContent as FullAuraReportContent | undefined;
    if (existing && existing.actionPlan && existing.actionPlan.length > 0) return;
    let cancelled = false;
    generateFullAuraReport(audit)
      .then((fresh) => {
        if (cancelled) return;
        setFullContent(fresh);
        const updated = updateAudit(audit.id, {
          fullReport: audit.fullReport
            ? { ...audit.fullReport, isPremium: true, fullContent: fresh }
            : { id: `${audit.id}-report`, auditId: audit.id, score: { overall: fresh.fullScore, categories: { visual: fresh.visualBreakdown.lighting, presentation: fresh.visualBreakdown.clarity, signals: fresh.visualBreakdown.colorSignal, cohesion: fresh.visualBreakdown.overallConsistency } }, leaks: [], suggestions: [], summary: fresh.detailedVerdict, createdAt: fresh.generatedAt, isPremium: true, fullContent: fresh },
        });
        // refresh state so isUnlocked (which reads fullReport.fullContent)
        // flips immediately and the locked sections open without a reload
        if (updated) rawSetAudit(updated);
      })
      .catch((e) => { console.warn("[AuraCheck] full report self-heal failed:", e instanceof Error ? e.message : e); });
    return () => { cancelled = true; };
  }, [audit]);
  // Geolocation for nearby services
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const city = lat > 28.4 && lat < 28.9 && lng > 76.8 && lng < 77.4 ? "Delhi"
          : lat > 18.8 && lat < 19.3 && lng > 72.7 && lng < 73.0 ? "Mumbai"
          : lat > 12.8 && lat < 13.1 && lng > 77.4 && lng < 77.8 ? "Bangalore"
          : lat > 13.0 && lat < 13.2 && lng > 80.1 && lng < 80.4 ? "Chennai"
          : lat > 22.5 && lat < 22.7 && lng > 88.3 && lng < 88.5 ? "Kolkata"
          : lat > 17.3 && lat < 17.6 && lng > 78.3 && lng < 78.6 ? "Hyderabad"
          : lat > 23.0 && lat < 23.3 && lng > 72.5 && lng < 72.8 ? "Ahmedabad"
          : lat > 18.5 && lat < 18.6 && lng > 73.7 && lng < 73.9 ? "Pune"
          : lat > 26.8 && lat < 27.0 && lng > 80.8 && lng < 81.1 ? "Lucknow"
          : lat > 26.9 && lat < 27.2 && lng > 75.7 && lng < 76.0 ? "Jaipur"
          : null;
        // Show nearby services for everyone, not just the 10 mapped cities —
        // the Places lookup works from raw lat/lng anywhere.
        setUserLocation({ city: city || "your area", lat, lng });
      },
      () => {},
      { timeout: 5000, maximumAge: 300000 }
    );
  }, []);
  // Fetch nearby places from Google Maps API
  useEffect(() => {
    if (!userLocation) return;
    const fetchPlaces = async (type: string) => {
      try {
        const res = await fetch(`/api/places/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=5000&type=${type}`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.places || [];
      } catch { return []; }
    };
    Promise.all([
      fetchPlaces("salon"),
      fetchPlaces("photographer"),
      fetchPlaces("gym"),
      fetchPlaces("optician"),
      fetchPlaces("tailor"),
      fetchPlaces("skin clinic dermatologist"),
    ]).then(([salons, photographers, gyms, opticians, tailors, skinClinics]) => {
      setNearbyPlaces({ salons, photographers, gyms, opticians, tailors, skinClinics });
    });
  }, [userLocation]);

  return (
    <>
      <div className="aurora-mesh" />
    <Container className="relative py-12">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-[#857b6e] hover:text-[#4a443d]"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      {audit === undefined && (
        <Card className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1c1917]/[0.04]">
            <svg className="h-8 w-8 text-[#857b6e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="mb-2 text-lg text-[#4a443d]">Loading...</p>
        </Card>
      )}

      {audit === null && (
        <Card className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1c1917]/[0.04]">
            <svg className="h-8 w-8 text-[#857b6e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="mb-2 text-lg text-[#4a443d]">Audit not found</p>
          <p className="mb-6 text-sm text-[#857b6e]">
            This audit does not exist or may have been deleted.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/dashboard">
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
            <Link href="/audit/new">
              <Button>Start New Audit</Button>
            </Link>
          </div>
        </Card>
      )}

      {audit && !audit.imageDataUrl && audit.reportStatus === "draft" && (
        <Card className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1c1917]/[0.04]">
            <svg className="h-8 w-8 text-[#857b6e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="mb-2 text-lg text-[#4a443d]">No image to analyze</p>
          <p className="mb-6 text-sm text-[#857b6e]">
            This audit has no image. Please create a new audit with an image.
          </p>
          <Link href="/audit/new">
            <Button>Create New Audit</Button>
          </Link>
        </Card>
      )}

      {audit && (audit.imageDataUrl || audit.reportStatus !== "draft") && (
        <div className="mx-auto max-w-2xl">
          <Card className="mb-6">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-[#1C1917]">
                  {auditTypeLabels[audit.auditType] || audit.auditType}
                </h1>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#857b6e]">
                  <span>Created: {formatDate(audit.createdAt)}</span>
                  <span>Updated: {formatDate(audit.updatedAt)}</span>
                </div>
              </div>
              <Badge variant={statusBadge[audit.reportStatus] || "default"}>
                {audit.reportStatus.replace("_", " ")}
              </Badge>
            </div>

            {audit.imageDataUrl && (
              <div className="mb-6 overflow-hidden rounded-xl border border-[#1c1917]/[0.08]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={audit.imageDataUrl}
                  alt="Audit image"
                  className="max-h-[400px] w-full object-contain"
                />
              </div>
            )}

            {audit.imageMeta && (
              <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-4 sm:grid-cols-4">
                <div>
                  <div className="text-xs text-[#857b6e]">Width</div>
                  <div className="text-sm text-[#1C1917]">{audit.imageMeta.width || "ΓÇö"} px</div>
                </div>
                <div>
                  <div className="text-xs text-[#857b6e]">Height</div>
                  <div className="text-sm text-[#1C1917]">{audit.imageMeta.height || "ΓÇö"} px</div>
                </div>
                <div>
                  <div className="text-xs text-[#857b6e]">Original Size</div>
                  <div className="text-sm text-[#1C1917]">{formatBytes(audit.imageMeta.fileSize)}</div>
                </div>
                <div>
                  <div className="text-xs text-[#857b6e]">Compressed</div>
                  <div className="text-sm text-[#1C1917]">
                    {audit.imageMeta.compressedSize ? formatBytes(audit.imageMeta.compressedSize) : "ΓÇö"}
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-4">
                <div className="text-xs text-[#857b6e]">Goal</div>
                <div className="mt-1 text-sm font-medium capitalize text-[#1C1917]">{audit.goal}</div>
              </div>
              <div className="rounded-xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-4">
                <div className="text-xs text-[#857b6e]">Budget Range</div>
                <div className="mt-1 text-sm font-medium text-amber-400">
                  &#8377;{audit.budgetRange.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-4">
                <div className="text-xs text-[#857b6e]">Unlock Status</div>
                <div className="mt-1 text-sm font-medium capitalize text-[#1C1917]">{audit.unlockStatus}</div>
              </div>
            </div>
          </Card>

          {/* Score generation area */}
          {canGenerate && (
            <div className="mb-6">
              {generating ? (
                <Card className="relative overflow-hidden p-8 text-center">
                  <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-red-500/10 blur-3xl" />
                  <div className="pointer-events-none absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-red-500/10 blur-3xl" />
                  <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
                    <svg className="h-7 w-7 animate-spin text-red-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                  <h2 className="mb-2 text-lg font-semibold text-[#1C1917]">Analyzing your photo</h2>
                  <p className="mb-6 text-xs text-[#857b6e]">Running 12+ visual signal checks in your browser...</p>
                  <div className="mx-auto max-w-xs space-y-2">
                    {[
                      "Reading image signals...",
                      "Detecting photo-quality issues...",
                      "Building your score...",
                    ].map((text, i) => (
                      <div key={text} className="flex items-center gap-2 text-xs text-[#6f675e]">
                        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" style={{ animationDelay: `${i * 400}ms` }} />
                        {text}
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <div className="text-center">
                  {generating ? (
                    <div className="inline-flex flex-col items-center gap-3">
                      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#1c1917]/10 border-t-red-400" />
                      <p className="text-sm text-[#6f675e]">Analyzing your photo...</p>
                    </div>
                  ) : (
                    <Button size="lg" onClick={handleGenerate}>
                      Generate Free Aura Score
                    </Button>
                  )}
                </div>
              )}
              {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}
            </div>
          )}

          {/* Personalization sections for any generated result */}
          {personalization && (displayResult || displayFull) && (
            <div className="mb-6 space-y-6">
              <ArchetypeCard personalization={personalization} />
              <SignalMismatchCard mismatches={personalization.signalMismatches} />
              <GoalStrategyCard strategy={personalization.goalStrategy} />
            </div>
          )}

          {/* Full Paid Report */}
{/* ponytail: old full report section hidden — verified new premium section works */}
{/* Free Result + Locked Teaser */}
          {/* The report body renders for free AND unlocked audits — unlocked
              users get the free sections plus the FullReport below. (This was
              previously gated on !displayFull, which hid the entire analysis
              the moment paid content existed.) */}
          {displayResult && (
            <>
              {/* ─── Report tab bar — keeps the report curated, not endless ─── */}
              <div className="no-print sticky top-16 z-20 mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-[#1c1917]/[0.08] bg-[#F2ECE1]/85 p-1 backdrop-blur-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {([
                  { id: "report", label: "Your Report" },
                  { id: "looks", label: "Looks & Grooming" },
                  { id: "tools", label: "Pro Tools" },
                ] as const).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => selectTab(t.id)}
                    className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${reportTab === t.id ? "bg-[#1c1917] text-white" : "text-[#6f675e] hover:bg-[#1c1917]/[0.05]"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {reportTab === "report" && (
              <>
              {/* ΓöÇΓöÇΓöÇ HERO: The Leak ΓöÇΓöÇΓöÇ */}
              {(() => {
                const sortedLeaks = [...(displayResult.statusLeaks ?? [])].sort(
                  (a, b) => (a.severity === "high" ? 0 : a.severity === "medium" ? 1 : 2) - (b.severity === "high" ? 0 : b.severity === "medium" ? 1 : 2)
                );
                const heroLeak = sortedLeaks[0];
                const otherLeaks = sortedLeaks.slice(1, 2);

                return (
                  <>
                    {heroLeak && (
                      <FadeInView>
                        <div className="mb-8">
                          <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-b from-red-500/[0.08] to-transparent p-6 sm:p-8 text-center">
                            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-red-500/10 blur-3xl" />
                            <div className="pointer-events-none absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-red-500/10 blur-3xl" />
                            <Badge variant="danger" className="mb-4">
                              {heroLeak.severity === "high" ? "Critical" : "Major"} Photo-Quality Issue
                            </Badge>
                            <h2 className="mb-3 bg-gradient-to-r from-[#1c1917] via-[#E14434] to-[#c0341f] bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                              {heroLeak.title}
                            </h2>
                            <p className="mx-auto mb-4 max-w-md text-sm text-[#4a443d]">
                              {heroLeak.description}
                            </p>
                            <div className="mx-auto max-w-md rounded-xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-4">
                              <div className="mb-1 text-xs text-red-400">Fix this first</div>
                              <p className="text-sm text-[#4a443d]">{heroLeak.fix}</p>
                            </div>
                          </div>
                          {otherLeaks.length > 0 && (
                            <p className="mt-4 text-center text-xs text-[#857b6e]">
                              +{otherLeaks.length} more {otherLeaks.length === 1 ? "leak" : "leaks"} found ΓÇö see below
                            </p>
                          )}
                        </div>
                      </FadeInView>
                    )}

                    {/* ΓöÇΓöÇΓöÇ Score Card ΓöÇΓöÇΓöÇ */}
                    <FadeInView delay={100}>
                      <Card className="relative mb-6 overflow-hidden text-center" data-score-card>
                        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-600/10 blur-3xl" />
                        {displayResult.auraScore === null ? (
                          <>
                            <Badge variant="danger" className="mb-4">Insufficient Quality</Badge>
                            <p className="text-sm text-[#4a443d]">{displayResult.oneLineVerdict}</p>
                            {(displayResult as any).limitations?.map((l: string, i: number) => (
                              <p key={i} className="mt-2 text-xs text-[#857b6e]">{l}</p>
                            ))}
                            <Link href="/audit/new" className="mt-4 inline-block text-sm text-red-400 hover:text-red-300 underline">Upload another photo</Link>
                          </>
                        ) : (
                          <>
                            <Badge variant="premium" className="mb-4">
                              {displayResult.category}
                            </Badge>
                            <div className="text-6xl font-bold text-[#1C1917]">
                              <CountUp target={displayResult.auraScore} duration={1400} />
                            </div>
                        <div className="mt-1 text-sm text-[#857b6e]">/ 100</div>
                        <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-[#1c1917]/[0.04]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-1000 ease-out"
                            style={{ width: `${displayResult.auraScore}%` }}
                          />
                        </div>
                        <p className="mx-auto mt-4 max-w-md text-sm text-[#4a443d] animate-[fade-in-up_0.8s_var(--ease-out-expo)_0.3s_both]">
                          {displayResult.oneLineVerdict}
                        </p>
                          </>
                        )}
                        <div className="mx-auto mt-4 max-w-md">
                          <PercentileBadge score={displayResult.auraScore} />
                        </div>
                        {!isUnlocked && (
                          <p className="mt-3 text-center text-[11px] text-[#857b6e]">
                            <Link href="/audit/new" className="text-red-400 hover:text-red-300 underline underline-offset-2">
                              Try a different photo
                            </Link>{' '}
                            — see how your score changes
                          </p>
                        )}
                      </Card>
                    </FadeInView>

                    {/* Signal Sculpture — data-driven 3D visualization */}
                    {displayResult && (() => {
                      const dims = [
                        { id: "lighting", label: "Lighting", score: displayResult.imageMetrics?.lightingScore ?? 50, confidence: Math.min(95, 50 + Math.round((displayResult.imageMetrics?.lightingScore ?? 50) * 0.4)), assessmentStatus: "assessed" as const },
                        { id: "clarity", label: "Clarity", score: displayResult.imageMetrics?.clarityScore ?? 50, confidence: Math.min(95, 50 + Math.round((displayResult.imageMetrics?.clarityScore ?? 50) * 0.4)), assessmentStatus: "assessed" as const },
                        { id: "composition", label: "Composition", score: displayResult.imageMetrics?.compositionScore ?? 50, confidence: Math.min(90, 40 + Math.round((displayResult.imageMetrics?.compositionScore ?? 50) * 0.4)), assessmentStatus: "assessed" as const },
                        { id: "background", label: "Background", score: Math.max(0, 100 - (displayResult.imageMetrics?.backgroundComplexityEstimate ?? 50)), confidence: Math.min(85, 35 + Math.round((displayResult.imageMetrics?.backgroundComplexityEstimate ?? 50) * 0.3)), assessmentStatus: "assessed" as const },
                        { id: "colour-harmony", label: "Colour Harmony", score: displayResult.imageMetrics?.colorHarmony ?? 50, confidence: Math.min(80, 30 + Math.round((displayResult.imageMetrics?.colorHarmony ?? 50) * 0.3)), assessmentStatus: "assessed" as const },
                        { id: "style", label: "Style", score: null, confidence: 0, assessmentStatus: "not-assessable" as const },
                        { id: "consistency", label: "Consistency", score: null, confidence: 0, assessmentStatus: "not-assessable" as const },
                      ];
                      return (
                        <FadeInView delay={100}>
                          <div className="mb-6 flex justify-center">
                            <SignalSculpture
                              dimensions={dims}
                              overallScore={displayResult.auraScore}
                              overallConfidence={70}
                              interactive
                            />
                          </div>
                        </FadeInView>
                      );
                    })()}

                    {/* Conversion funnel — only for accepted/limited results */}
                    {!isUnlocked && displayResult && typeof displayResult.auraScore === "number" && (
                      <ConversionFunnel
                        auditId={audit.id}
                        score={displayResult.auraScore}
                        photoIssueCount={displayResult.statusLeaks?.length ?? 0}
                        topLeakTitle={displayResult.statusLeaks?.[0]?.title || "Unknown"}
                      />
                    )}

                    {/* Celebrity match — blurred teaser for free users */}
                    {!isUnlocked && celebMatches.length > 0 && (
                      <div className="relative overflow-hidden rounded-2xl border border-red-500/15 bg-red-500/5 p-4">
                        <div className="absolute inset-0 blur-md cursor-pointer" onClick={() => { setPaywallTrigger("Style inspiration"); setPaywallOpen(true); }}>
                          <CelebrityMatch matches={celebMatches} />
                        </div>
                        <div className="relative z-10 text-center py-6">
                          <div className="text-2xl mb-2">✨</div>
                          <p className="text-sm font-medium text-red-300">
                            Inspired by similar styles
                          </p>
                          <p className="text-[11px] text-[#857b6e] mt-1">
                            Unlock to see who + how to get the look
                          </p>
                        </div>
                      </div>
                    )}



                    {isUnlocked && (
                    <>
                    <FadeInView delay={50}>
                      <SmartInsights
                        grooming={displayResult?.imageMetrics.groomingResult}
                        style={displayResult?.imageMetrics.detectedStyle}
                        colorPalette={displayResult?.imageMetrics.colorPalette}
                      />
                    </FadeInView>

                    <FadeInView delay={50}>
                      <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.08] to-transparent p-5 sm:p-6">
                        <div className="mb-4 text-center">
                          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
                            <span className="text-xs">⚡</span>
                            <span className="text-xs font-medium text-emerald-300">Quick Wins — Fix Now, Free</span>
                            {audit?.imageDataUrl && (
                              <Link
                                href="/aura-twin"
                                onClick={() => {
                                  try {
                                    localStorage.setItem("aura_twin_image", audit.imageDataUrl!);
                                    localStorage.setItem("aura_twin_audit_id", audit.id);
                                    if (displayResult?.statusLeaks?.[0]) localStorage.setItem("aura_twin_top_finding", displayResult.statusLeaks[0].title);
                                  } catch {}
                                }}
                                className="ml-auto text-[10px] text-red-400 hover:text-red-300"
                              >
                                Preview improvements →
                              </Link>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-[#1C1917]">3 things you can fix before leaving</h3>
                        </div>
                        <div className="space-y-3">
                          {(displayResult.quickFixes ?? []).slice(0, 3).map((fix, i) => (
                            <div key={fix.title} className="flex items-start gap-3 rounded-xl bg-[#1c1917]/[0.03] p-3">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400">
                                {i + 1}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#1C1917]">{fix.title}</p>
                                <p className="text-xs text-[#6f675e]">{fix.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </FadeInView>

                                            <FadeInView delay={100}>
                        <DynamicGoalAdvice
                          goal={audit.goal || "glowup"}
                          metrics={{
                            lightingScore: displayResult.imageMetrics?.lightingScore ?? 50,
                            clarityScore: displayResult.imageMetrics?.clarityScore ?? 50,
                            groomingScore: Math.round((displayResult.imageMetrics.hairRegion?.neatnessScore || 50) + (displayResult.imageMetrics.skinRegion?.evenness || 50)) / 2,
                            expressionScore: displayResult.imageMetrics.symmetryScore || 50,
                            clothingScore: displayResult.imageMetrics.clothingRegion?.contrastWithSkin || 50,
                            backgroundComplexityEstimate: displayResult.imageMetrics.backgroundComplexityEstimate || 50,
                            symmetryScore: displayResult.imageMetrics.symmetryScore || 50,
                            faceBrightness: displayResult.imageMetrics.faceBrightness || 50,
                            saturation: displayResult.imageMetrics.saturation || 45,
                            imageDullness: displayResult.imageMetrics.imageDullness || 30,
                          }}
                        />
                      </FadeInView>
                    </>

                    )}

                    {/* ─── The full paid report — verdict, 7-day plan, expert
                        observations, playbook, goal strategy, money map ─── */}
                    {audit?.reportStatus === "unlocked" && serverVerified !== false && displayFull && (
                      <div className="mb-6">
                        <FullReport content={displayFull} />
                      </div>
                    )}
                    <LockedSection locked={!isUnlocked} label="Strongest Signals" unlockHref={unlockHref}>
                    <FadeInView delay={100}>
                      <Card className="mb-6">
                        <h3 className="mb-3 text-sm font-semibold text-[#1C1917]">
                          Strongest Signals
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {displayResult.strongestSignals.map((s) => (
                            <Badge key={s} variant="success">{s}</Badge>
                          ))}
                        </div>
                      </Card>
                    </FadeInView>
                    </LockedSection>

                    {/* ΓöÇΓöÇΓöÇ Remaining Leaks (Blurred Previews) ΓöÇΓöÇΓöÇ */}
                    {otherLeaks.length > 0 && (
                      <FadeInView delay={150}>
                        <div className="mb-6">
                        <Card className="relative overflow-hidden">
                          <h3 className="mb-4 text-sm font-semibold text-[#1C1917]">
                            {otherLeaks.length} more {otherLeaks.length === 1 ? "leak" : "leaks"} found
                          </h3>
                          <div className="space-y-3">
                            {otherLeaks.map((leak) => (
                              <div key={leak.id} className="relative rounded-xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-4">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-sm font-medium text-[#1C1917]">{leak.title}</h4>
                                  <Badge
                                    variant={leak.severity === "high" ? "danger" : leak.severity === "medium" ? "warning" : "default"}
                                  >
                                    {leak.severity}
                                  </Badge>
                                </div>
                                {/* Blurred content ΓÇö visible shape, unreadable text */}
                                <div className="mt-2 blur-sm cursor-pointer" onClick={() => { setPaywallTrigger("Status leak details"); setPaywallOpen(true); }}>
                                  <p className="text-xs text-[#6f675e]">{leak.description}</p>
                                  <p className="mt-1 text-xs text-[#857b6e]">
                                    <span className="text-red-300">Fix:</span> {leak.fix}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          {/* Gradient overlay for extraΘöü feel */}
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050508]/90" />
                        </Card>
                        <p className="mt-2 text-center text-xs text-[#9c9184]">
                          Unlock to see all leaks and how to fix them
                        </p>
                      </div>
                      </FadeInView>
                    )}

                    <LockedSection locked={!isUnlocked} label="Quick Fixes" unlockHref={unlockHref}>
                    <FadeInView delay={200}>
                      <Card className="mb-6">
                        <h3 className="mb-4 text-sm font-semibold text-[#1C1917]">
                          Quick Fixes
                        </h3>
                        <div className="space-y-3">
                          {displayResult.quickFixes.map((fix) => (
                            <div key={fix.title} className="flex items-start gap-3">
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs text-emerald-400">
                                &#10003;
                              </div>
                              <div>
                                <p className="text-sm text-[#1C1917]">{fix.title}</p>
                                <p className="text-xs text-[#857b6e]">{fix.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </FadeInView>
                    </LockedSection>

                    <LockedSection locked={!isUnlocked} label="Budget Upgrade Plan" unlockHref={unlockHref}>
                    <FadeInView delay={250}>
                      <Card className="mb-6">
                        <h3 className="mb-1 text-sm font-semibold text-[#1C1917]">
                          Budget Upgrade Plan
                        </h3>
                      <p className="mb-4 text-xs text-[#857b6e]">
                        {displayResult.budgetUpgradePlan.priority}
                      </p>
                      <ul className="space-y-2">
                        {displayResult.budgetUpgradePlan.actions.map((action) => (
                          <li key={action} className="flex items-start gap-3 text-xs text-[#4a443d]">
                            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                            {action}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 rounded-lg bg-[#1c1917]/[0.03] p-3 text-xs text-[#857b6e]">
                        Estimated impact: {displayResult.budgetUpgradePlan.estimatedImpact}
                      </p>
                    </Card>
                    </FadeInView>
                    </LockedSection>

                    <LockedSection locked={!isUnlocked} label="Improvement Roadmap" unlockHref={unlockHref}>
                    <FadeInView delay={280}>
                      <ImprovementRoadmap
                        metrics={{
                          lightingScore: displayResult.imageMetrics?.lightingScore ?? 50,
                          clarityScore: displayResult.imageMetrics?.clarityScore ?? 50,
                          compositionScore: displayResult.imageMetrics?.compositionScore ?? 50,
                          groomingScore: Math.round((displayResult.imageMetrics.hairRegion?.neatnessScore || 50) + (displayResult.imageMetrics.skinRegion?.evenness || 50)) / 2,
                          expressionScore: displayResult.imageMetrics.symmetryScore || 50,
                          backgroundComplexityEstimate: displayResult.imageMetrics.backgroundComplexityEstimate || 50,
                          symmetryScore: displayResult.imageMetrics.symmetryScore || 50,
                        }}
                      />
                    </FadeInView>
                    </LockedSection>

                    <LockedSection locked={!isUnlocked} label="Full Score Breakdown" unlockHref={unlockHref}>
                    <ScoreBreakdown
                        lighting={displayResult.imageMetrics.lightingScore}
                        clarity={displayResult.imageMetrics.clarityScore}
                        composition={displayResult.imageMetrics.compositionScore}
                        contrast={displayResult.imageMetrics.contrast}
                        grooming={Math.round(((displayResult.imageMetrics.hairRegion?.neatnessScore || 50) + (displayResult.imageMetrics.skinRegion?.evenness || 50)) / 2)}
                        expression={displayResult.imageMetrics.symmetryScore || 50}
                        symmetry={displayResult.imageMetrics.symmetryScore || 50}
                        colorBalance={displayResult.imageMetrics.saturation}
                      />
                    </LockedSection>
                  </>
                );
              })()}

              {/* ─── Challenge CTA ─── */}
              <Card className="mb-6">
                <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-lg font-bold text-[#1C1917]">!</div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-[#1C1917]">Compete in a Challenge</h4>
                    <p className="text-xs text-[#6f675e]">Submit this audit to a challenge and see how you rank on the local leaderboard.</p>
                  </div>
                  <Link href="/challenges"><Button size="sm" variant="outline">View Challenges</Button></Link>
                </div>
              </Card>
              </>
              )}

              {reportTab === "looks" && (
              <>
              {/* ─── Shop For Looks — 1 free pick, rest paywalled ─── */}
              {/* Renders whenever a personalization profile exists — even when the
                  photo was quality-gated (auraScore null). The archetype, leaks, goal
                  and budget still drive accurate picks, so a shopper is never left
                  without suggestions just because their photo scored low. */}
              {personalization != null && displayResult != null && (
                <PersonalizedShop
                  looks={getPersonalizedLooks({
                    styleArchetypes: [personalization.archetype === "Corporate Sharp" ? "professional" : personalization.archetype === "Creator Vibe" ? "creator" : personalization.archetype === "College Casual" ? "college" : personalization.archetype === "Premium Minimalist" ? "premium" : personalization.archetype === "Urban Aspirational" ? "confident" : personalization.archetype === "Loud Flex" ? "bold" : personalization.archetype === "Soft Luxury" ? "understated" : "clean"],
                    statusLeakTags: (displayResult.statusLeaks ?? []).map((l) => l.category as any).filter(Boolean),
                    goalTags: audit!.goal ? [audit!.goal as any] : undefined,
                    budgetMax: audit!.budgetRange as any,
                  })}
                  userScore={displayResult.auraScore ?? undefined}
                  archetype={personalization.archetype}
                  leakTags={(displayResult.statusLeaks ?? []).map((l) => l.category)}
                  locked={!isUnlocked}
                  freeCount={1}
                  unlockHref={unlockHref}
                />
              )}

              {/* ─── Grooming, Hair & Local Pros — paid perk ─── */}
              {displayResult != null && (
                <div className="mb-6">
                  <LockedSection locked={!isUnlocked} label="Grooming, Hair & Nearby Salons" unlockHref={unlockHref}>
                    <GroomingLocalCard
                      grooming={displayResult.imageMetrics?.groomingResult}
                      hairNeatnessFallback={displayResult.imageMetrics?.hairRegion?.neatnessScore}
                      places={nearbyPlaces}
                      city={userLocation?.city}
                      locationKnown={userLocation != null}
                    />
                  </LockedSection>
                </div>
              )}

              {/* ─── Face-Shape Studio — paid perk ─── */}
              {displayResult != null && (
                <div className="mb-6">
                  <LockedSection locked={!isUnlocked} label="Face-Shape Studio" unlockHref={unlockHref}>
                    <FaceShapeCard />
                  </LockedSection>
                </div>
              )}

              {/* ─── Your Colors — paid perk ─── */}
              {displayResult?.imageMetrics?.colorPalette && (
                <div className="mb-6">
                  <LockedSection locked={!isUnlocked} label="Your Colors" unlockHref={unlockHref}>
                    <YourColorsCard
                      palette={displayResult.imageMetrics.colorPalette}
                      undertone={displayResult.imageMetrics.undertone}
                    />
                  </LockedSection>
                </div>
              )}

              {/* ─── Capsule Wardrobe — paid perk ─── */}
              {personalization != null && displayResult != null && (
                <div className="mb-6">
                  <LockedSection locked={!isUnlocked} label="Your Capsule Wardrobe" unlockHref={unlockHref}>
                    <CapsuleWardrobeCard
                      archetype={personalization.archetype}
                      looks={getPersonalizedLooks({
                        styleArchetypes: [personalization.archetype === "Corporate Sharp" ? "professional" : personalization.archetype === "Creator Vibe" ? "creator" : personalization.archetype === "College Casual" ? "college" : personalization.archetype === "Premium Minimalist" ? "premium" : personalization.archetype === "Urban Aspirational" ? "confident" : personalization.archetype === "Loud Flex" ? "bold" : personalization.archetype === "Soft Luxury" ? "understated" : "clean"],
                        statusLeakTags: (displayResult.statusLeaks ?? []).map((l) => l.category as any).filter(Boolean),
                        goalTags: audit!.goal ? [audit!.goal as any] : undefined,
                        budgetMax: audit!.budgetRange as any,
                        limit: 40,
                      })}
                    />
                  </LockedSection>
                </div>
              )}
              </>
              )}

              {reportTab === "tools" && (
              <>
              {/* ─── Pro Tools — quick links ─── */}
              <div className="mb-6 grid gap-3 sm:grid-cols-3">
                {[
                  { href: "/best-photo", emoji: "🏆", title: "Best-Photo Picker", desc: "Rank your photos per platform" },
                  { href: "/retake-coach", emoji: "🎥", title: "Retake Coach", desc: "Live camera guidance" },
                  { href: "/platform-packs", emoji: "📐", title: "Platform Packs", desc: "One photo, every format" },
                  { href: "/dating-pack", emoji: "💘", title: "Dating Profile Teardown", desc: "Rank, order & caption your profile" },
                ].map((t) => (
                  <Link key={t.href} href={t.href} className="group rounded-2xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.02] p-4 transition-all hover:-translate-y-0.5 hover:border-[#E14434]/30">
                    <div className="text-2xl transition-transform group-hover:scale-110">{t.emoji}</div>
                    <p className="mt-1.5 text-sm font-semibold text-[#1C1917]">{t.title}</p>
                    <p className="text-xs text-[#857b6e]">{t.desc}</p>
                  </Link>
                ))}
              </div>

              {/* ─── Keepsake PDF — paid perk ─── */}
              {isUnlocked && (
                <div className="mb-6 no-print">
                  <Card className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
                    <div>
                      <h4 className="text-sm font-semibold text-[#1C1917]">📄 Keep a copy of your report</h4>
                      <p className="text-xs text-[#6f675e]">Save the full report as a PDF to revisit or share later.</p>
                    </div>
                    <Button onClick={() => window.print()}>Save as PDF</Button>
                  </Card>
                </div>
              )}
              </>
              )}

              {/* ─── Conversion CTA ─── */}
              {!isUnlocked && displayResult && (
                <FadeInView delay={450}>
                  <div className="mb-6 rounded-2xl border border-red-500/20 bg-gradient-to-b from-red-500/[0.06] to-transparent p-6 text-center">
                    <div className="mb-2 flex justify-center">
                      <Scene3DAccent size={90} shape="sunglasses" />
                    </div>
                    <p className="mb-2 text-sm text-[#4a443d]">
                      Your score is <span className="font-bold text-[#1C1917]">{displayResult.auraScore}</span>.
                      Small corrections to your top issues can make a meaningful difference.
                    </p>
                    <p className="mb-4 text-xs text-[#857b6e]">Your full report includes {displayResult.statusLeaks.length} personalized fixes, nearby salons & gyms, and buy links for every recommendation.</p>
                    <div className="flex flex-wrap justify-center gap-2 text-xs text-[#857b6e]">
                      <span className="flex items-center gap-1"><span className="text-emerald-400">✓</span> Improvement score</span>
                      <span className="flex items-center gap-1"><span className="text-emerald-400">✓</span> Before/after preview</span>
                      <span className="flex items-center gap-1"><span className="text-emerald-400">✓</span> Google Maps locations</span>
                      <span className="flex items-center gap-1"><span className="text-emerald-400">✓</span> Product links</span>
                    </div>
                  </div>
                </FadeInView>
              )}

              {/* ΓöÇΓöÇΓöÇ Dating Profile Report Display ΓöÇΓöÇΓöÇ */}
              {audit.datingProfileReport && (
                <FadeInView>
                  <Card className="mb-6">
                    <Badge variant="success" className="mb-2">Dating / Profile Audit</Badge>
                    <h3 className="mb-4 text-sm font-semibold text-[#1C1917]">Profile Text Analysis</h3>
                    <div className="mb-4 text-center">
                      <div className="text-4xl font-bold text-[#1C1917]">
                        <CountUp target={audit.datingProfileReport.textScore} duration={1200} />
                      </div>
                      <div className="text-xs text-[#857b6e]">Text Score / 100</div>
                    </div>
                  <div className="mb-4 rounded-lg border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-4">
                    <p className="text-xs text-[#4a443d]">{audit.datingProfileReport.overallAdvice}</p>
                  </div>
                  {audit.datingProfileReport.bioAnalysis && (
                    <div className="mb-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-3">
                        <div className="text-xs text-[#857b6e]">Bio Length</div>
                        <div className="text-sm text-[#1C1917] capitalize">{audit.datingProfileReport.bioAnalysis.length.replace(/_/g, " ")}</div>
                      </div>
                      <div className="rounded-lg border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-3">
                        <div className="text-xs text-[#857b6e]">Effort</div>
                        <div className="text-sm text-[#1C1917] capitalize">{audit.datingProfileReport.bioAnalysis.effort}</div>
                      </div>
                      <div className="rounded-lg border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-3 sm:col-span-2">
                        <div className="text-xs text-red-400">Feedback</div>
                        <p className="mt-1 text-xs text-[#4a443d]">{audit.datingProfileReport.bioAnalysis.feedback}</p>
                      </div>
                    </div>
                  )}
                  {audit.datingProfileReport.redFlags.length > 0 && (
                    <div className="mb-4">
                      <h4 className="mb-2 text-xs font-semibold text-[#1C1917]">Detected Issues</h4>
                      <div className="space-y-2">
                        {audit.datingProfileReport.redFlags.map((rf, i) => (
                          <div key={i} className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                            <div className="mb-1 flex items-center gap-2">
                              <Badge variant={rf.severity === "high" ? "danger" : rf.severity === "medium" ? "warning" : "default"}>{rf.type}</Badge>
                            </div>
                            <p className="text-xs text-[#4a443d]">{rf.explanation}</p>
                            <p className="mt-1 text-xs text-[#857b6e]"><span className="text-red-300">Fix:</span> {rf.fixSuggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {audit.datingProfileReport.suggestedBios.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold text-[#1C1917]">Suggested Bio Versions</h4>
                      <div className="space-y-3">
                        {audit.datingProfileReport.suggestedBios.map((sb, i) => (
                          <div key={i} className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                            <div className="mb-1 text-xs text-red-300">{sb.version}</div>
                            <p className="mb-1 text-xs text-[#33302b]">{sb.text}</p>
                            <p className="text-[10px] text-[#857b6e]">{sb.whyItWorks}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
                </FadeInView>
              )}

              {/* ΓöÇΓöÇΓöÇ Glow-Up Plan Display ΓöÇΓöÇΓöÇ */}
              {audit.glowupPlan && (
                <FadeInView>
                <Card className="mb-6">
                  <Badge variant="success" className="mb-2">30-Day Glow-Up Plan</Badge>
                  <h3 className="mb-4 text-sm font-semibold text-[#1C1917]">Your 4-Week Roadmap</h3>
                  <div className="mb-4 grid gap-4 sm:grid-cols-2">
                    {[audit.glowupPlan.week1, audit.glowupPlan.week2, audit.glowupPlan.week3, audit.glowupPlan.week4].map((week, wi) => (
                      <details key={wi} className="group rounded-lg border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03]">
                        <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium text-[#1C1917] hover:bg-[#1c1917]/[0.04]">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-[10px] text-red-300">W{wi + 1}</span>
                          {week.title}
                        </summary>
                        <div className="px-4 pb-3">
                          <p className="mb-2 text-xs text-red-300">{week.focus}</p>
                          <div className="space-y-1">
                            {week.dailyMissions.map((m) => (
                              <div key={m.day} className="flex items-start gap-2 text-xs">
                                <span className="shrink-0 text-[#857b6e]">D{m.day}</span>
                                <span className="text-[#4a443d]">{m.title}</span>
                                <Badge variant={m.effort === "hard" ? "danger" : m.effort === "medium" ? "warning" : "default"}>{m.effort}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                  <div className="rounded-lg border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-4">
                    <h4 className="mb-2 text-xs font-semibold text-[#1C1917]">Budget Roadmap</h4>
                    <div className="space-y-2 text-xs">
                      {audit.glowupPlan.budgetRoadmap.free.length > 0 && (
                        <div>
                          <div className="text-emerald-400">Free Actions</div>
                          <ul className="ml-3 list-disc text-[#6f675e]">{audit.glowupPlan.budgetRoadmap.free.map((a) => <li key={a}>{a}</li>)}</ul>
                        </div>
                      )}
                      {audit.glowupPlan.budgetRoadmap.under2000.length > 0 && (
                        <div>
                          <div className="text-amber-400">Under Γé╣2,000</div>
                          <ul className="ml-3 list-disc text-[#6f675e]">{audit.glowupPlan.budgetRoadmap.under2000.map((a) => <li key={a}>{a}</li>)}</ul>
                        </div>
                      )}
                      {audit.glowupPlan.budgetRoadmap.under5000.length > 0 && (
                        <div>
                          <div className="text-red-400">Under Γé╣5,000</div>
                          <ul className="ml-3 list-disc text-[#6f675e]">{audit.glowupPlan.budgetRoadmap.under5000.map((a) => <li key={a}>{a}</li>)}</ul>
                        </div>
                      )}
                      {audit.glowupPlan.budgetRoadmap.under10000.length > 0 && (
                        <div>
                          <div className="text-blue-400">Under Γé╣10,000</div>
                          <ul className="ml-3 list-disc text-[#6f675e]">{audit.glowupPlan.budgetRoadmap.under10000.map((a) => <li key={a}>{a}</li>)}</ul>
                        </div>
                      )}
                      <div className="mt-2 border-t border-[#1c1917]/[0.08] pt-2">
                        <span className="text-[#857b6e]">Estimated total: </span>
                        <span className="text-amber-400">Γé╣{audit.glowupPlan.budgetRoadmap.totalEstimatedCost}</span>
                      </div>
                    </div>
                  </div>
                </Card>
                </FadeInView>
              )}

              {/* Share section for free result */}
              <div className="mb-6">
                <ShareCardBuilder audit={audit!} type="free_result" />
              </div>

              {/* Referral share */}
              <div className="mb-6">
                <ReferralShare variant="inline" />
              </div>

              {/* Save result */}
              <div className="mb-6">
                <ResultCapture audit={audit!} />
              </div>

              {/* (Personalized shop picks render once, higher up in the report.) */}

              <div className="space-y-2 text-center text-xs text-[#9c9184]">
                <p>
                  AuraCheck analyzes presentation signals using local
                  browser-based rules. This is guidance, not objective truth.
                </p>
                <p>Archetypes describe presentation style, not your identity or worth.</p>
                <p>
                  No image is sent to an external AI service in this MVP.
                </p>
              </div>
            </>
          )}

          {!canGenerate && !displayResult && !displayFull && (
            <div className="flex flex-wrap gap-3">
              <Link href="/unlock">
                <Button variant="outline">Unlock Premium Report</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary">Back to Dashboard</Button>
              </Link>
            </div>
          )}

          {/* Report Management */}
          <Card className="mt-10 border-[#1c1917]/[0.08]">
            <h3 className="mb-4 text-sm font-semibold text-[#1C1917]">Report Management</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const draft = createAudit({ auditType: audit.auditType, goal: audit.goal, budgetRange: audit.budgetRange });
                  if (audit.deepInput) updateAudit(draft.id, { deepInput: audit.deepInput });
                  if (audit.profileTexts) updateAudit(draft.id, { profileTexts: audit.profileTexts });
                  router.push(`/audit/${draft.id}`);
                }}
              >
                Duplicate Settings
              </Button>
              {audit.imageDataUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setConfirmAction("remove_image");
                  }}
                >
                  Remove Image Only
                </Button>
              )}
              {audit.reportStatus !== "draft" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setConfirmAction("regenerate_free");
                  }}
                >
                  Regenerate Free Score
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setConfirmAction("delete_audit");
                }}
              >
                Delete This Audit
              </Button>
            </div>
            <p className="mt-3 text-[10px] text-[#9c9184]">
              Removing the image keeps metadata and scores. Deleting the audit removes all associated data including unlocked products.
            </p>
          </Card>

          {/* Confirm Dialogs */}
          <ConfirmDialog
            open={confirmAction === "delete_audit"}
            title="Delete this audit?"
            message="This will permanently remove this audit and all associated data including unlocked products. This cannot be undone."
            confirmLabel="DELETE"
            variant="danger"
            requireTypedConfirm="DELETE"
            onConfirm={() => {
              deleteAudit(audit.id);
              toast("Audit deleted", "success");
              router.push("/dashboard");
            }}
            onCancel={() => setConfirmAction(null)}
          />
          <ConfirmDialog
            open={confirmAction === "remove_image"}
            title="Remove uploaded image?"
            message="This will remove the uploaded image data. Metadata, scores, and reports will be kept. Future regeneration may not work without an image."
            confirmLabel="Remove Image"
            variant="warning"
            onConfirm={() => {
              const updated = updateAudit(audit.id, {
                imageDataUrl: undefined,
              });
              if (updated) setAudit(updated);
              toast("Image removed", "success");
              setConfirmAction(null);
            }}
            onCancel={() => setConfirmAction(null)}
          />
          <ConfirmDialog
            open={confirmAction === "regenerate_free"}
            title="Regenerate free score?"
            message="This will overwrite the existing free score and personalization data. Your unlocked premium reports will not be affected."
            confirmLabel="Regenerate"
            variant="warning"
            onConfirm={async () => {
              setConfirmAction(null);
              if (!audit.imageDataUrl) {
                toast("No image to analyze", "error");
                return;
              }
              setGenerating(true);
              try {
                const report = await generateFreeAuraReport(audit);
                const personalization = generateStatusArchetype(audit, report.imageMetrics);
                const updated = updateAudit(audit.id, {
                  freeScore: report.auraScore,
                  freeSummary: report.oneLineVerdict,
                  reportStatus: "free_generated",
                  unlockStatus: "locked",
                  personalization,
                  fullReport: {
                    id: audit.id + "-report",
                    auditId: audit.id,
                    score: { overall: report.auraScore, categories: { visual: report.imageMetrics.lightingScore, presentation: report.imageMetrics.clarityScore, signals: Math.round((report.imageMetrics.contrast + report.imageMetrics.saturation) / 2), cohesion: report.imageMetrics.compositionScore } },
                    leaks: report.statusLeaks,
                    suggestions: report.quickFixes.map((q) => ({ id: "qf-" + q.title.toLowerCase().replace(/\s+/g, "-"), category: "quick-fix" as const, title: q.title, description: q.description, effort: q.effort, cost: q.cost })),
                    summary: report.oneLineVerdict,
                    createdAt: report.generatedAt,
                    isPremium: false,
                    freeResult: report,
                  },
                });
      if (updated) setAudit(updated);
      trackEvent(EVENTS.ANALYSIS_COMPLETED, { auditId: audit.id, score: report.auraScore });
                toast("Free score regenerated", "success");
              } catch {
                toast("Failed to regenerate", "error");
              } finally {
                setGenerating(false);
              }
            }}
            onCancel={() => setConfirmAction(null)}
          />
        </div>
      )}
    <PaywallPopup open={paywallOpen} onClose={() => setPaywallOpen(false)} auditId={audit?.id || ""} trigger={paywallTrigger} />
      </Container>
    </>
  );
}
