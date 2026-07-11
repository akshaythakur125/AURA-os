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
import { runLocalVisionAnalysis } from "@/lib/aura-engine/localVision";
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
import { CelebrityMatch } from "@/components/celebrity/CelebrityMatch";
import { ScoreBreakdown } from "@/components/report/ScoreBreakdown";
import { ImprovementRoadmap } from "@/components/report/ImprovementRoadmap";
import { DynamicGoalAdvice } from "@/components/report/DynamicGoalAdvice";
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
    "Urban Aspirational": "border-purple-500/30 bg-purple-500/10",
    "Premium Minimalist": "border-emerald-500/30 bg-emerald-500/10",
    "Loud Flex": "border-rose-500/30 bg-rose-500/10",
    "Soft Luxury": "border-amber-500/30 bg-amber-500/10",
    "Creator Vibe": "border-cyan-500/30 bg-cyan-500/10",
    "College Casual": "border-blue-500/30 bg-blue-500/10",
    "Corporate Sharp": "border-indigo-500/30 bg-indigo-500/10",
    "Try-Hard Signal": "border-orange-500/30 bg-orange-500/10",
    "Mismatched Flex": "border-red-500/30 bg-red-500/10",
    "Low-Clarity Potential": "border-gray-500/30 bg-gray-500/10",
  };
  const colors = colorMap[personalization.archetype] || colorMap["Clean Basic"];
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-white">Your Status Archetype</h3>
      <div className={`mb-4 rounded-xl border p-4 ${colors}`}>
        <div className="text-lg font-bold text-white">{personalization.archetype}</div>
        <p className="mt-2 text-xs text-gray-300">{personalization.archetypeExplanation}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
          <div className="text-xs text-purple-400">Priority</div>
          <p className="mt-1 text-xs text-gray-300">{personalization.userPriority}</p>
        </div>
        <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
          <div className="text-xs text-purple-400">Focus Areas</div>
          <p className="mt-1 text-xs text-gray-300">{personalization.recommendedFocus}</p>
        </div>
      </div>
    </Card>
  );
}

function SignalMismatchCard({ mismatches }: { mismatches: SignalMismatch[] }) {
  if (mismatches.length === 0) return null;
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-white">Signal Mismatches</h3>
      <div className="space-y-4">
        {mismatches.map((m) => (
          <div key={m.title} className="rounded-xl border border-white/[0.04] bg-white/[0.03] p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium text-white">{m.title}</h4>
              <Badge variant={m.severity === "high" ? "danger" : m.severity === "medium" ? "warning" : "default"}>
                {m.severity}
              </Badge>
            </div>
            <p className="mb-2 text-xs text-gray-400">{m.explanation}</p>
            <p className="text-xs text-gray-500">
              <span className="text-purple-300">Correction:</span> {m.correction}
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
      <h3 className="mb-4 text-sm font-semibold text-white">Goal Strategy</h3>
      <div className="space-y-4">
        <div>
          <div className="mb-1 text-xs text-purple-400">{strategy.goal}</div>
          <div className="text-xs text-gray-500">Strategy</div>
          <p className="text-sm text-gray-300">{strategy.strategyTitle}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <div className="mb-1 text-xs text-emerald-400">Optimize</div>
            <p className="text-xs text-gray-300">{strategy.whatToOptimize}</p>
          </div>
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
            <div className="mb-1 text-xs text-red-400">Avoid</div>
            <p className="text-xs text-gray-300">{strategy.whatToAvoid}</p>
          </div>
        </div>
        <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
          <div className="mb-1 text-xs text-purple-400">Best Next Move</div>
          <p className="text-xs text-gray-300">{strategy.bestNextMove}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
            <div className="mb-1 text-xs text-gray-500">Photo Direction</div>
            <p className="text-xs text-gray-300">{strategy.suggestedPhotoDirection}</p>
          </div>
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
            <div className="mb-1 text-xs text-gray-500">Style Direction</div>
            <p className="text-xs text-gray-300">{strategy.suggestedStyleDirection}</p>
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
           className="inline-flex items-center gap-1 rounded-lg border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-[10px] text-purple-300 hover:bg-purple-500/20">
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
        <h3 className="text-sm font-semibold text-white">Recommended Product Bundles</h3>
      </div>
      <p className="mb-4 text-xs text-gray-400">Curated picks based on your analysis. Tap to shop.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {bundles.map((b) => (
          <div key={b.name} className="rounded-xl border border-white/[0.04] bg-white/[0.03] p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-lg">{b.emoji}</span>
              <div>
                <div className="text-sm font-medium text-white">{b.name}</div>
                <div className="text-[10px] text-gray-500">{b.desc}</div>
              </div>
            </div>
            <div className="mb-2 space-y-1">
              {b.items.map((item) => (
                <a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-between rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-gray-300 hover:bg-white/[0.06]">
                  <span>{item.name}</span>
                  <span className="text-purple-400 font-medium">{item.price}</span>
                </a>
              ))}
            </div>
            <div className="text-[10px] text-gray-500">Est. total: <span className="text-purple-400">{b.total}</span></div>
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

  const [audit, rawSetAudit] = useState<Audit | null | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    return getAuditById(id) ?? null;
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FreeAuraResult | null>(null);
  const [fullContent] = useState<FullAuraReportContent | null>(null);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ city: string; lat: number; lng: number } | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<{ salons: { name: string; type: string; area: string; rating: number; mapUrl: string }[]; photographers: { name: string; type: string; area: string; rating: number; mapUrl: string }[]; gyms: { name: string; type: string; area: string; rating: number; mapUrl: string }[] }>({ salons: [], photographers: [], gyms: [] });
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

    try {
      // Run local CLIP vision analysis if not already done
      let visionResults = audit.visionResults;
      if (!visionResults && audit.imageDataUrl) {
        const vr = await runLocalVisionAnalysis(audit.imageDataUrl);
        if (vr) {
          visionResults = vr;
          updateAudit(audit.id, { visionResults });
        }
      }

      const report = await generateFreeAuraReport(audit, visionResults);
      setResult(report);

      // Compute celebrity matches
      const matches = matchCelebrity({
        goal: audit.goal || "dating",
        undertone: visionResults?.scores?.overall ? undefined : undefined,
        lightingScore: report.imageMetrics.lightingScore,
        groomingScore: report.imageMetrics.clarityScore,
        outfitScore: report.imageMetrics.contrast,
        expressionScore: report.imageMetrics.compositionScore,
        symmetryScore: report.imageMetrics.symmetryScore,
        backgroundScore: report.imageMetrics.backgroundBrightness,
      });
      setCelebMatches(matches);

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
          score: {
            overall: report.auraScore,
            categories: {
              visual: report.imageMetrics.lightingScore,
              presentation: report.imageMetrics.clarityScore,
              signals: Math.round(
                (report.imageMetrics.contrast + report.imageMetrics.saturation) / 2
              ),
              cohesion: report.imageMetrics.compositionScore,
            },
          },
          leaks: report.statusLeaks,
          suggestions: report.quickFixes.map((q) => ({
            id: "qf-" + q.title.toLowerCase().replace(/\s+/g, "-"),
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
    } catch {
      setError("Something went wrong during analysis. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  const canGenerate = audit?.reportStatus === "draft" && audit?.imageDataUrl;

  useEffect(() => {
    if (canGenerate && !generating) {
      handleGenerate();
    }
  }, [canGenerate]);
  const hasResult = audit?.reportStatus === "free_generated" && audit?.fullReport?.freeResult;
  const displayResult = result || (hasResult ? (audit!.fullReport!.freeResult as FreeAuraResult) : null);
  const isUnlocked = audit?.reportStatus === "unlocked" && audit?.fullReport?.fullContent;
  const displayFull = fullContent || (isUnlocked ? (audit!.fullReport!.fullContent as FullAuraReportContent) : null);
  const personalization = audit?.personalization;

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
        if (city) setUserLocation({ city, lat, lng });
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
      fetchPlaces("beauty_salon"),
      fetchPlaces("photographer"),
      fetchPlaces("gym"),
    ]).then(([salons, photographers, gyms]) => {
      setNearbyPlaces({ salons, photographers, gyms });
    });
  }, [userLocation]);

  return (
    <>
      <div className="aurora-mesh" />
    <Container className="relative py-12">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-300"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      {audit === undefined && (
        <Card className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="mb-2 text-lg text-gray-300">Loading...</p>
        </Card>
      )}

      {audit === null && (
        <Card className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="mb-2 text-lg text-gray-300">Audit not found</p>
          <p className="mb-6 text-sm text-gray-500">
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
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="mb-2 text-lg text-gray-300">No image to analyze</p>
          <p className="mb-6 text-sm text-gray-500">
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
                <h1 className="text-xl font-bold text-white">
                  {auditTypeLabels[audit.auditType] || audit.auditType}
                </h1>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>Created: {formatDate(audit.createdAt)}</span>
                  <span>Updated: {formatDate(audit.updatedAt)}</span>
                </div>
              </div>
              <Badge variant={statusBadge[audit.reportStatus] || "default"}>
                {audit.reportStatus.replace("_", " ")}
              </Badge>
            </div>

            {audit.imageDataUrl && (
              <div className="mb-6 overflow-hidden rounded-xl border border-white/[0.04]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={audit.imageDataUrl}
                  alt="Audit image"
                  className="max-h-[400px] w-full object-contain"
                />
              </div>
            )}

            {audit.imageMeta && (
              <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-white/[0.04] bg-white/[0.03] p-4 sm:grid-cols-4">
                <div>
                  <div className="text-xs text-gray-500">Width</div>
                  <div className="text-sm text-white">{audit.imageMeta.width || "ΓÇö"} px</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Height</div>
                  <div className="text-sm text-white">{audit.imageMeta.height || "ΓÇö"} px</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Original Size</div>
                  <div className="text-sm text-white">{formatBytes(audit.imageMeta.fileSize)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Compressed</div>
                  <div className="text-sm text-white">
                    {audit.imageMeta.compressedSize ? formatBytes(audit.imageMeta.compressedSize) : "ΓÇö"}
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/[0.04] bg-white/[0.03] p-4">
                <div className="text-xs text-gray-500">Goal</div>
                <div className="mt-1 text-sm font-medium capitalize text-white">{audit.goal}</div>
              </div>
              <div className="rounded-xl border border-white/[0.04] bg-white/[0.03] p-4">
                <div className="text-xs text-gray-500">Budget Range</div>
                <div className="mt-1 text-sm font-medium text-amber-400">
                  &#8377;{audit.budgetRange.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.04] bg-white/[0.03] p-4">
                <div className="text-xs text-gray-500">Unlock Status</div>
                <div className="mt-1 text-sm font-medium capitalize text-white">{audit.unlockStatus}</div>
              </div>
            </div>
          </Card>

          {/* Score generation area */}
          {canGenerate && (
            <div className="mb-6">
              {generating ? (
                <Card className="relative overflow-hidden p-8 text-center">
                  <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-purple-500/10 blur-3xl" />
                  <div className="pointer-events-none absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-pink-500/10 blur-3xl" />
                  <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10">
                    <svg className="h-7 w-7 animate-spin text-purple-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                  <h2 className="mb-2 text-lg font-semibold text-white">Analyzing your photo</h2>
                  <p className="mb-6 text-xs text-gray-500">Running 12+ visual signal checks in your browser...</p>
                  <div className="mx-auto max-w-xs space-y-2">
                    {[
                      "Reading image signals...",
                      "Detecting status leaks...",
                      "Building your score...",
                    ].map((text, i) => (
                      <div key={text} className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" style={{ animationDelay: `${i * 400}ms` }} />
                        {text}
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <div className="text-center">
                  <Button size="lg" onClick={handleGenerate}>
                    Generate Free Aura Score
                  </Button>
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
          {displayFull && (
            <>
              <FadeInView>
                <Card className="relative mb-6 overflow-hidden text-center">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-600/10 blur-3xl" />
                  <Badge variant="premium" className="mb-2">Premium Report</Badge>
                  <Badge variant="success" className="mb-4">{displayFull.category}</Badge>
                  <div className="text-6xl font-bold text-white">
                    <CountUp target={displayFull.fullScore} duration={1400} />
                  </div>
                  <div className="mt-1 text-sm text-gray-500">/ 100</div>
                  <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-1000 ease-out" style={{ width: `${displayFull.fullScore}%` }} />
                  </div>
                  <p className="mx-auto mt-4 max-w-md text-sm text-gray-300">{displayFull.detailedVerdict}</p>
                </Card>
              </FadeInView>

              {/* ─── What We Found — Analysis Summary ─── */}
              {displayResult && (
                <FadeInView delay={50}>
                  <Card className="mb-6">
                    <h3 className="mb-4 text-sm font-semibold text-white">What We Found</h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {[
                        {
                          label: "Face Detected",
                          value: displayResult.imageMetrics.faceDetected ? "Yes" : "Not detected",
                          detail: displayResult.imageMetrics.faceDetected
                            ? `Face brightness: ${displayResult.imageMetrics.faceBrightness}%`
                            : "Subject may be too far or obscured",
                          good: displayResult.imageMetrics.faceDetected && displayResult.imageMetrics.faceBrightness > 45,
                        },
                        {
                          label: "Lighting Direction",
                          value: displayResult.imageMetrics.lightingDirection === "flat"
                            ? "Flat / Even"
                            : displayResult.imageMetrics.lightingDirection === "top"
                              ? "Overhead"
                              : displayResult.imageMetrics.lightingDirection === "left"
                                ? "From left"
                                : displayResult.imageMetrics.lightingDirection === "right"
                                  ? "From right"
                                  : "Directional",
                          detail: displayResult.imageMetrics.lightingDirection === "flat"
                            ? "No strong shadows — needs more direction"
                            : displayResult.imageMetrics.lightingDirection === "top"
                              ? "Creates under-eye shadows"
                              : "Natural contour on face",
                          good: displayResult.imageMetrics.lightingDirection !== "flat" && displayResult.imageMetrics.lightingDirection !== "top",
                        },
                        {
                          label: "Color Tone",
                          value: displayResult.imageMetrics.dominantHue === "warm"
                            ? "Warm"
                            : displayResult.imageMetrics.dominantHue === "cool"
                              ? "Cool"
                              : displayResult.imageMetrics.dominantHue === "greenish"
                                ? "Greenish"
                                : "Neutral",
                          detail: `Saturation: ${displayResult.imageMetrics.saturation}%`,
                          good: displayResult.imageMetrics.saturation > 30 && displayResult.imageMetrics.saturation < 65,
                        },
                        {
                          label: "Symmetry",
                          value: `${displayResult.imageMetrics.symmetryScore}%`,
                          detail: displayResult.imageMetrics.symmetryScore > 65
                            ? "Well-balanced composition"
                            : "Some asymmetry detected",
                          good: displayResult.imageMetrics.symmetryScore > 60,
                        },
                        {
                          label: "Subject Separation",
                          value: `${displayResult.imageMetrics.subjectBgContrast}%`,
                          detail: displayResult.imageMetrics.subjectBgContrast > 20
                            ? "Good contrast with background"
                            : "Subject blends into background",
                          good: displayResult.imageMetrics.subjectBgContrast > 15,
                        },
                        {
                          label: "Color Harmony",
                          value: `${displayResult.imageMetrics.colorHarmony}%`,
                          detail: displayResult.imageMetrics.colorHarmony > 55
                            ? "Colors work well together"
                            : "Color palette feels inconsistent",
                          good: displayResult.imageMetrics.colorHarmony > 50,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={`rounded-lg border p-3 ${
                            item.good
                              ? "border-emerald-500/20 bg-emerald-500/5"
                              : "border-amber-500/20 bg-amber-500/5"
                          }`}
                        >
                          <div className="text-[10px] text-gray-500">{item.label}</div>
                          <div className={`mt-1 text-sm font-medium ${item.good ? "text-emerald-400" : "text-amber-400"}`}>
                            {item.value}
                          </div>
                          <div className="mt-0.5 text-[10px] text-gray-500">{item.detail}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </FadeInView>
              )}

              {/* Visual Breakdown */}
              <FadeInView delay={100}>
                <Card className="mb-6">
                  <h3 className="mb-4 text-sm font-semibold text-white">Visual Breakdown</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: "Lighting", value: displayFull.visualBreakdown.lighting },
                      { label: "Clarity", value: displayFull.visualBreakdown.clarity },
                      { label: "Composition", value: displayFull.visualBreakdown.composition },
                      { label: "Background Control", value: displayFull.visualBreakdown.backgroundControl },
                      { label: "Color Signal", value: displayFull.visualBreakdown.colorSignal },
                      { label: "Premium Signal", value: displayFull.visualBreakdown.premiumSignal },
                      { label: "Overall Consistency", value: displayFull.visualBreakdown.overallConsistency, span: true },
                    ].map((m) => (
                      <div key={m.label} className={`rounded-lg border border-white/[0.04] bg-white/[0.03] p-3 ${m.span ? "col-span-2 sm:col-span-4" : ""}`}>
                        <div className="text-xs text-gray-500">{m.label}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                            <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-1000 ease-out" style={{ width: `${m.value}%` }} />
                          </div>
                          <span className="text-xs text-white">
                            <CountUp target={m.value} duration={1000} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </FadeInView>

              {/* Strongest Signals */}
              <FadeInView delay={200}>
                <Card className="mb-6">
                  <h3 className="mb-3 text-sm font-semibold text-white">Strongest Signals</h3>
                  <div className="flex flex-wrap gap-2">
                    {displayFull.strongestSignals.map((s) => (
                      <Badge key={s} variant="success">{s}</Badge>
                    ))}
                  </div>
                </Card>
              </FadeInView>

              {/* Biggest Status Leaks */}
              <FadeInView delay={250}>
                <Card className="mb-6">
                  <h3 className="mb-4 text-sm font-semibold text-white">Biggest Status Leaks</h3>
                  <div className="space-y-4">
                    {displayFull.biggestStatusLeaks.map((leak) => (
                      <div key={leak.title} className="rounded-xl border border-white/[0.04] bg-white/[0.03] p-4">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium text-white">{leak.title}</h4>
                          <Badge variant={leak.severity === "high" ? "danger" : leak.severity === "medium" ? "warning" : "default"}>
                            {leak.severity}
                          </Badge>
                        </div>
                        <p className="mb-2 text-xs text-gray-400">{leak.explanation}</p>
                        <p className="text-xs text-gray-500">
                          <span className="text-purple-300">Fix:</span> {leak.fix}
                        </p>
                        {leak.estimatedCost && (
                          <p className="mt-1 text-xs text-gray-500">
                            <span className="text-purple-300">Estimated cost:</span> {leak.estimatedCost}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </FadeInView>

              {/* Priority Upgrade Map */}
              <FadeInView delay={300}>
                <Card className="mb-6">
                  <h3 className="mb-4 text-sm font-semibold text-white">Priority Upgrade Map</h3>
                  <div className="space-y-3">
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                      <div className="text-xs text-emerald-400">First Priority</div>
                      <div className="text-sm text-white">{displayFull.priorityUpgradeMap.firstPriority}</div>
                    </div>
                    <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
                      <div className="text-xs text-purple-400">Second Priority</div>
                      <div className="text-sm text-white">{displayFull.priorityUpgradeMap.secondPriority}</div>
                    </div>
                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                      <div className="text-xs text-red-400">Avoid For Now</div>
                      <div className="text-sm text-white">{displayFull.priorityUpgradeMap.avoidForNow}</div>
                    </div>
                  </div>
                </Card>
              </FadeInView>

              {/* Budget Upgrade Plan */}
              <FadeInView delay={350}>
                <Card className="mb-6">
                  <h3 className="mb-4 text-sm font-semibold text-white">Budget Upgrade Plan</h3>
                  {[
                    { label: "Free ΓÇö Do Now", items: displayFull.budgetUpgradePlan.immediateFree, color: "emerald" },
                    { label: "Under Γé╣2,000", items: displayFull.budgetUpgradePlan.under2000, color: "purple" },
                    { label: "Under Γé╣5,000", items: displayFull.budgetUpgradePlan.under5000, color: "amber" },
                    { label: "Under Γé╣10,000", items: displayFull.budgetUpgradePlan.under10000, color: "blue" },
                    { label: "Under Γé╣25,000+", items: displayFull.budgetUpgradePlan.under25000, color: "pink" },
                  ].map((tier) => (
                    <details key={tier.label} className="group mb-2">
                      <summary className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.03] px-4 py-3 text-sm font-medium text-white hover:bg-white/[0.05]">
                        <svg className={`h-4 w-4 text-${tier.color}-400 transition-transform group-open:rotate-90`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {tier.label}
                      </summary>
                      <ul className="mt-2 space-y-1.5 px-4">
                        {tier.items.map((action: string) => (
                          <li key={action} className="flex items-start gap-2 text-xs text-gray-400">
                            <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-${tier.color}-400`} />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </Card>
              </FadeInView>

              {/* Photo Guidance */}
              <FadeInView delay={400}>
                <Card className="mb-6">
                  <h3 className="mb-4 text-sm font-semibold text-white">Photo Guidance</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { label: "Lighting", value: displayFull.photoGuidance.lighting },
                      { label: "Framing", value: displayFull.photoGuidance.framing },
                      { label: "Background", value: displayFull.photoGuidance.background },
                      { label: "Posing / Presentation", value: displayFull.photoGuidance.posingOrPresentation },
                      { label: "Editing", value: displayFull.photoGuidance.editing, span: true },
                    ].map((g) => (
                      <div key={g.label} className={`rounded-lg border border-white/[0.04] bg-white/[0.03] p-3 ${g.span ? "sm:col-span-2" : ""}`}>
                        <div className="mb-1 text-xs text-purple-400">{g.label}</div>
                        <p className="text-xs text-gray-300">{g.value}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </FadeInView>

              {/* Goal-Specific Advice */}
              <FadeInView delay={450}>
                <Card className="mb-6">
                  <h3 className="mb-4 text-sm font-semibold text-white">Goal-Specific Strategy</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="mb-1 text-xs text-purple-400">{displayFull.goalSpecificAdvice.goal}</div>
                      <div className="text-xs text-gray-500">Strategy</div>
                      <p className="text-sm text-gray-300">{displayFull.goalSpecificAdvice.strategy}</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                        <div className="mb-1 text-xs text-emerald-400">Do This</div>
                        <p className="text-xs text-gray-300">{displayFull.goalSpecificAdvice.doThis}</p>
                      </div>
                      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                        <div className="mb-1 text-xs text-red-400">Avoid This</div>
                        <p className="text-xs text-gray-300">{displayFull.goalSpecificAdvice.avoidThis}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </FadeInView>

              {/* --- Outfit Color Analysis --- */}
              {displayFull && displayResult && displayResult.imageMetrics?.clothingRegion && (
                <FadeInView delay={478}>
                  <Card className="mb-6">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-lg">🎨</span>
                      <h3 className="text-sm font-semibold text-white">Outfit Color Analysis</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
                        <div className="text-[10px] text-gray-500">Dominant Color</div>
                        <div className="mt-1 text-sm font-medium text-white capitalize">{displayResult.imageMetrics.clothingRegion.dominantColor}</div>
                      </div>
                      <div className={`rounded-lg border p-3 ${displayResult.imageMetrics.clothingRegion.styleSignal === "solid" ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/20 bg-amber-500/5"}`}>
                        <div className="text-[10px] text-gray-500">Color Pattern</div>
                        <div className={`mt-1 text-sm font-medium capitalize ${displayResult.imageMetrics.clothingRegion.styleSignal === "solid" ? "text-emerald-400" : "text-amber-400"}`}>{displayResult.imageMetrics.clothingRegion.styleSignal}</div>
                      </div>
                      <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
                        <div className="text-[10px] text-gray-500">Skin Contrast</div>
                        <div className="mt-1 text-sm font-medium text-white">{displayResult.imageMetrics.clothingRegion.contrastWithSkin}%</div>
                      </div>
                    </div>
                    <div className="mt-4 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                      <div className="mb-2 text-xs font-medium text-purple-300">👔 Wardrobe Suggestions</div>
                      <div className="space-y-1.5 text-xs text-gray-300">
                        {displayResult.imageMetrics.clothingRegion.styleSignal === "solid" ? (
                          <>
                            <p>✅ Solid color reads clean. Keep this approach.</p>
                            <p>Best colors: <span className="text-white font-medium">Navy, white, grey, black</span></p>
                            <p>For dating/Instagram: add <span className="text-white font-medium">one bold accent</span> (maroon, teal, mustard)</p>
                          </>
                        ) : (
                          <>
                            <p>⚠️ Color variety detected — patterns split focus.</p>
                            <p>Switch to: <span className="text-white font-medium">1-2 solid colors max</span>.</p>
                            <p>Best combo: <span className="text-white font-medium">Dark bottom + light top</span></p>
                          </>
                        )}
                        {displayResult.imageMetrics.clothingRegion.contrastWithSkin < 15 && (
                          <p>⚠️ Outfit blends with skin. Try a <span className="text-white font-medium">{(displayResult.imageMetrics.faceBrightness || 50) > 50 ? "darker" : "lighter"}</span> top.</p>
                        )}
                      </div>
                    </div>
                  </Card>
                </FadeInView>
              )}

              {/* --- Room / Background Score --- */}
              {displayFull && displayResult && displayResult.imageMetrics?.backgroundObjects && (
                <FadeInView delay={482}>
                  <Card className="mb-6">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-lg">🏠</span>
                      <h3 className="text-sm font-semibold text-white">Background & Environment</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
                        <div className="text-[10px] text-gray-500">Setting</div>
                        <div className="mt-1 text-sm font-medium text-white">{displayResult.imageMetrics.backgroundObjects.isIndoor ? "Indoor" : "Outdoor"}</div>
                      </div>
                      <div className={`rounded-lg border p-3 ${displayResult.imageMetrics.backgroundObjects.clutterLevel < 40 ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/20 bg-amber-500/5"}`}>
                        <div className="text-[10px] text-gray-500">Clutter</div>
                        <div className={`mt-1 text-sm font-medium ${displayResult.imageMetrics.backgroundObjects.clutterLevel < 40 ? "text-emerald-400" : "text-amber-400"}`}>{displayResult.imageMetrics.backgroundObjects.clutterLevel < 40 ? "Clean" : "Busy"}</div>
                      </div>
                      <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
                        <div className="text-[10px] text-gray-500">Elements</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {displayResult.imageMetrics.backgroundObjects.hasPlants && <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] text-emerald-400">🌿 Plants</span>}
                          {displayResult.imageMetrics.backgroundObjects.hasFurniture && <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[9px] text-blue-400">🪑 Furniture</span>}
                          {displayResult.imageMetrics.backgroundObjects.hasArtwork && <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[9px] text-purple-400">🖼️ Art</span>}
                          {!displayResult.imageMetrics.backgroundObjects.hasPlants && !displayResult.imageMetrics.backgroundObjects.hasFurniture && !displayResult.imageMetrics.backgroundObjects.hasArtwork && <span className="text-[10px] text-gray-500">Minimal</span>}
                        </div>
                      </div>
                      <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
                        <div className="text-[10px] text-gray-500">Bg Brightness</div>
                        <div className="mt-1 text-sm font-medium text-white">{displayResult.imageMetrics.backgroundBrightness}%</div>
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg bg-white/[0.03] px-3 py-2 text-[11px] text-gray-400">
                      {displayResult.imageMetrics.backgroundObjects.clutterLevel > 55
                        ? "\u{1F4A1} Background is busy. A plain wall or open doorway behind you reads cleaner."
                        : displayResult.imageMetrics.backgroundBrightness > (displayResult.imageMetrics.faceBrightness || 0) + 15
                          ? "\u{1F4A1} Background is brighter than your face \u2014 move to a darker backdrop."
                          : "\u2705 Background is clean and well-balanced."}
                    </div>
                  </Card>
                </FadeInView>
              )}

              {/* --- Detailed Observations --- */}
              {displayFull && displayFull.observations && displayFull.observations.length > 0 && (
                <FadeInView delay={485}>
                  <Card className="mb-6">
                    <h3 className="mb-4 text-sm font-semibold text-white">Detailed Observations</h3>
                    <div className="space-y-3">
                      {displayFull.observations.map((obs, i) => (
                        <div key={`${obs.category}-${i}`} className={`rounded-xl border p-4 ${obs.severity === "positive" ? "border-emerald-500/20 bg-emerald-500/5" : obs.severity === "needs-work" ? "border-amber-500/20 bg-amber-500/5" : "border-white/[0.04] bg-white/[0.03]"}`}>
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-sm">{obs.category === "hair" ? "\u{1F487}" : obs.category === "clothing" ? "\u{1F454}" : obs.category === "skin" ? "\u2728" : obs.category === "grooming" ? "\u{1FA92}" : obs.category === "accessories" ? "\u231A" : obs.category === "background" ? "\u{1F3E0}" : "\u{1F4F8}"}</span>
                            <h4 className="text-sm font-medium text-white">{obs.title}</h4>
                            <Badge variant={obs.severity === "positive" ? "success" : obs.severity === "needs-work" ? "warning" : "default"} className="text-[10px]">{obs.category}</Badge>
                          </div>
                          <p className="mb-2 text-xs text-gray-400">{obs.detail}</p>
                          <div className="rounded-lg bg-white/[0.03] px-3 py-2"><p className="text-[11px] text-purple-300"><span className="font-medium">Tip:</span> {obs.suggestion}</p></div>
                          <ObsLinks obs={obs} />
                        </div>
                      ))}
                    </div>
                  </Card>
                </FadeInView>
              )}

              {/* --- Nearby Services (Google Maps) --- */}
              {userLocation && (nearbyPlaces.salons.length > 0 || nearbyPlaces.photographers.length > 0 || nearbyPlaces.gyms.length > 0) && (
                <FadeInView delay={490}>
                  <Card className="mb-6">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-lg">📍</span>
                      <h3 className="text-sm font-semibold text-white">Nearby Services in {userLocation.city}</h3>
                    </div>
                    <p className="mb-4 text-xs text-gray-400">Real places from Google Maps. Act on the tips above.</p>
                    {nearbyPlaces.salons.length > 0 && (
                      <div className="mb-4">
                        <div className="mb-2 text-xs font-medium text-purple-300">💈 Salons & Grooming</div>
                        <div className="space-y-2">{nearbyPlaces.salons.slice(0, 3).map((p) => (
                          <div key={p.name + p.area} className="flex items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.03] p-3">
                            <div className="flex-1"><div className="text-sm font-medium text-white">{p.name}</div><div className="text-[11px] text-gray-400">{p.type} \u00b7 {p.area}</div>{p.rating > 0 && <div className="mt-0.5 text-[10px] text-amber-400">\u2b50 {p.rating}</div>}</div>
                            <a href={p.mapUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-[11px] text-purple-300 hover:bg-purple-500/20">Directions</a>
                          </div>
                        ))}</div>
                      </div>
                    )}
                    {nearbyPlaces.photographers.length > 0 && (
                      <div className="mb-4">
                        <div className="mb-2 text-xs font-medium text-blue-300">📸 Photographers</div>
                        <div className="space-y-2">{nearbyPlaces.photographers.slice(0, 3).map((p) => (
                          <div key={p.name + p.area} className="flex items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.03] p-3">
                            <div className="flex-1"><div className="text-sm font-medium text-white">{p.name}</div><div className="text-[11px] text-gray-400">{p.type} \u00b7 {p.area}</div>{p.rating > 0 && <div className="mt-0.5 text-[10px] text-amber-400">\u2b50 {p.rating}</div>}</div>
                            <a href={p.mapUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[11px] text-blue-300 hover:bg-blue-500/20">Directions</a>
                          </div>
                        ))}</div>
                      </div>
                    )}
                    {nearbyPlaces.gyms.length > 0 && (
                      <div>
                        <div className="mb-2 text-xs font-medium text-emerald-300">💪 Gyms & Fitness</div>
                        <div className="space-y-2">{nearbyPlaces.gyms.slice(0, 3).map((p) => (
                          <div key={p.name + p.area} className="flex items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.03] p-3">
                            <div className="flex-1"><div className="text-sm font-medium text-white">{p.name}</div><div className="text-[11px] text-gray-400">{p.type} \u00b7 {p.area}</div>{p.rating > 0 && <div className="mt-0.5 text-[10px] text-amber-400">\u2b50 {p.rating}</div>}</div>
                            <a href={p.mapUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] text-emerald-300 hover:bg-emerald-500/20">Directions</a>
                          </div>
                        ))}</div>
                      </div>
                    )}
                  </Card>
                </FadeInView>
              )}


              {/* --- Improvement Score --- */}
              {displayFull && displayFull.improvementScore && displayFull.improvementScore.delta > 0 && (
                <FadeInView delay={495}>
                  <Card className="mb-6">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-lg">📈</span>
                      <h3 className="text-sm font-semibold text-white">Your Improvement Potential</h3>
                    </div>
                    <div className="mb-4 flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-[10px] text-gray-500">Current Score</div>
                        <div className="text-2xl font-bold text-white">{displayFull.improvementScore.currentScore}</div>
                      </div>
                      <div className="text-2xl text-purple-400">→</div>
                      <div className="flex-1">
                        <div className="text-[10px] text-gray-500">Potential Score</div>
                        <div className="text-2xl font-bold text-emerald-400">{displayFull.improvementScore.potentialScore}</div>
                      </div>
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-center">
                        <div className="text-xs text-emerald-400">+{displayFull.improvementScore.delta}</div>
                        <div className="text-[10px] text-emerald-300">points</div>
                      </div>
                    </div>
                    <p className="mb-3 text-xs text-gray-400">{displayFull.improvementScore.message}</p>
                    <div className="space-y-1.5">
                      {displayFull.improvementScore.topImpactItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-1.5">
                          <span className={`text-[10px] ${item.fixable ? "text-emerald-400" : "text-amber-400"}`}>
                            {item.fixable ? "✅" : "💰"}
                          </span>
                          <span className="flex-1 text-[11px] text-gray-300">{item.label}</span>
                          <span className="text-[10px] text-purple-400">+{item.impact}pts</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </FadeInView>
              )}

              {/* --- Before / After Comparison --- */}
              {displayFull && displayFull.beforeAfter && (
                <FadeInView delay={497}>
                  <Card className="mb-6">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-lg">🔄</span>
                      <h3 className="text-sm font-semibold text-white">Before vs After</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                        <div className="mb-3 text-xs font-medium text-red-300">{displayFull.beforeAfter.currentLabel}</div>
                        <div className="space-y-1.5">
                          {displayFull.beforeAfter.currentTraits.map((t, i) => (
                            <div key={i} className="flex items-center gap-2 text-[11px] text-gray-400">
                              <span className="text-red-400">✗</span> {t}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                        <div className="mb-3 text-xs font-medium text-emerald-300">{displayFull.beforeAfter.potentialLabel}</div>
                        <div className="space-y-1.5">
                          {displayFull.beforeAfter.potentialTraits.map((t, i) => (
                            <div key={i} className="flex items-center gap-2 text-[11px] text-gray-300">
                              <span className="text-emerald-400">✓</span> {t}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </FadeInView>
              )}

              {/* --- Premium Product Bundles --- */}
              {displayFull && displayFull.observations && displayResult && (
                <FadeInView delay={499}>
                  <PremiumBundles metrics={displayResult.imageMetrics} observations={displayFull.observations} />
                </FadeInView>
              )}

{/* Final Verdict */}
              <FadeInView delay={500}>
                <Card className="mb-6">
                  <h3 className="mb-3 text-sm font-semibold text-white">Final Verdict</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{displayFull.finalVerdict}</p>
                </Card>
              </FadeInView>

              {/* Print / PDF */}
              <div className="mb-6 flex flex-wrap gap-3">
                <Button variant="secondary" size="sm" onClick={handlePrint}>
                  Print Report
                </Button>
                <span className="text-xs text-gray-500 self-center">
                  Save as PDF from the print dialog (browser print-to-PDF).
                </span>
              </div>

              {/* Share section */}
              <div className="mb-6">
                <ShareCardBuilder audit={audit!} type="full_report" />
              </div>

              {/* Personalized shopping looks */}
              {personalization && displayResult && (
                <PersonalizedShop
                  looks={getPersonalizedLooks({
                    styleArchetypes: [personalization.archetype === "Corporate Sharp" ? "professional" : personalization.archetype === "Creator Vibe" ? "creator" : personalization.archetype === "College Casual" ? "college" : personalization.archetype === "Premium Minimalist" ? "premium" : personalization.archetype === "Urban Aspirational" ? "confident" : personalization.archetype === "Loud Flex" ? "bold" : personalization.archetype === "Soft Luxury" ? "understated" : "clean"],
                    statusLeakTags: displayResult.statusLeaks.map((l) => l.category as any).filter(Boolean),
                    goalTags: audit!.goal ? [audit!.goal as any] : undefined,
                    budgetMax: audit!.budgetRange as any,
                  })}
                  userScore={displayResult.auraScore}
                  archetype={personalization.archetype}
                  leakTags={displayResult.statusLeaks.map((l) => l.category)}
                />
              )}

              {/* Disclaimers */}
              <div className="space-y-2 text-center text-xs text-gray-600">
                <p>AuraCheck analyzes presentation signals, not human worth.</p>
                <p>Scores are guidance, not objective truth.</p>
                <p>Archetypes describe presentation style, not your identity or worth.</p>
                <p>No external AI service is used in this MVP.</p>
              </div>
            </>
          )}

          {/* Free Result + Locked Teaser */}
          {!displayFull && displayResult && (
            <>
              {/* ΓöÇΓöÇΓöÇ HERO: The Leak ΓöÇΓöÇΓöÇ */}
              {(() => {
                const sortedLeaks = [...displayResult.statusLeaks].sort(
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
                            <div className="pointer-events-none absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
                            <Badge variant="danger" className="mb-4">
                              {heroLeak.severity === "high" ? "Critical" : "Major"} Status Leak
                            </Badge>
                            <h2 className="mb-3 bg-gradient-to-r from-red-300 via-pink-300 to-red-200 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                              {heroLeak.title}
                            </h2>
                            <p className="mx-auto mb-4 max-w-md text-sm text-gray-300">
                              {heroLeak.description}
                            </p>
                            <div className="mx-auto max-w-md rounded-xl border border-white/[0.04] bg-white/[0.03] p-4">
                              <div className="mb-1 text-xs text-purple-400">Fix this first</div>
                              <p className="text-sm text-gray-300">{heroLeak.fix}</p>
                            </div>
                          </div>
                          {otherLeaks.length > 0 && (
                            <p className="mt-4 text-center text-xs text-gray-500">
                              +{otherLeaks.length} more {otherLeaks.length === 1 ? "leak" : "leaks"} found ΓÇö see below
                            </p>
                          )}
                        </div>
                      </FadeInView>
                    )}

                    {/* ΓöÇΓöÇΓöÇ Score Card ΓöÇΓöÇΓöÇ */}
                    <FadeInView delay={100}>
                      <Card className="relative mb-6 overflow-hidden text-center">
                        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-600/10 blur-3xl" />
                        <Badge variant="premium" className="mb-4">
                          {displayResult.category}
                        </Badge>
                        <div className="text-6xl font-bold text-white">
                          <CountUp target={displayResult.auraScore} duration={1400} />
                        </div>
                        <div className="mt-1 text-sm text-gray-500">/ 100</div>
                        <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-1000 ease-out"
                            style={{ width: `${displayResult.auraScore}%` }}
                          />
                        </div>
                        <p className="mx-auto mt-4 max-w-md text-sm text-gray-300">
                          {displayResult.oneLineVerdict}
                        </p>
                        <div className="mx-auto mt-4 max-w-md">
                          <PercentileBadge score={displayResult.auraScore} />
                        </div>
                      </Card>
                    </FadeInView>

                    {/* Conversion funnel — prominent, right after score */}
                    {!isUnlocked && displayResult && (
                      <ConversionFunnel
                        auditId={audit.id}
                        score={displayResult.auraScore}
                        leakCount={displayResult.statusLeaks.length}
                        topLeakTitle={displayResult.statusLeaks[0]?.title || "Unknown"}
                      />
                    )}

                    {/* Celebrity match — aspirational */}
                    {!isUnlocked && celebMatches.length > 0 && (
                      <CelebrityMatch matches={celebMatches} />
                    )}

                    {isUnlocked && (
                    <>
                    <FadeInView delay={150}>
                      <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.08] to-transparent p-5 sm:p-6">
                        <div className="mb-4 text-center">
                          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
                            <span className="text-xs">⚡</span>
                            <span className="text-xs font-medium text-emerald-300">Quick Wins — Fix Now, Free</span>
                          </div>
                          <h3 className="text-lg font-bold text-white">3 things you can fix before leaving</h3>
                        </div>
                        <div className="space-y-3">
                          {displayResult.quickFixes.slice(0, 3).map((fix, i) => (
                            <div key={fix.title} className="flex items-start gap-3 rounded-xl bg-white/[0.03] p-3">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400">
                                {i + 1}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{fix.title}</p>
                                <p className="text-xs text-gray-400">{fix.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </FadeInView>

                                            <FadeInView delay={200}>
                        <DynamicGoalAdvice
                          goal={audit.goal || "glowup"}
                          metrics={{
                            lightingScore: displayResult.imageMetrics.lightingScore,
                            clarityScore: displayResult.imageMetrics.clarityScore,
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
                    <FadeInView delay={200}>
                      <Card className="mb-6">
                        <h3 className="mb-3 text-sm font-semibold text-white">
                          Strongest Signals
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {displayResult.strongestSignals.map((s) => (
                            <Badge key={s} variant="success">{s}</Badge>
                          ))}
                        </div>
                      </Card>
                    </FadeInView>

                    {/* ΓöÇΓöÇΓöÇ Remaining Leaks (Blurred Previews) ΓöÇΓöÇΓöÇ */}
                    {otherLeaks.length > 0 && (
                      <FadeInView delay={250}>
                        <div className="mb-6">
                        <Card className="relative overflow-hidden">
                          <h3 className="mb-4 text-sm font-semibold text-white">
                            {otherLeaks.length} more {otherLeaks.length === 1 ? "leak" : "leaks"} found
                          </h3>
                          <div className="space-y-3">
                            {otherLeaks.map((leak) => (
                              <div key={leak.id} className="relative rounded-xl border border-white/[0.04] bg-white/[0.03] p-4">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-sm font-medium text-white">{leak.title}</h4>
                                  <Badge
                                    variant={leak.severity === "high" ? "danger" : leak.severity === "medium" ? "warning" : "default"}
                                  >
                                    {leak.severity}
                                  </Badge>
                                </div>
                                {/* Blurred content ΓÇö visible shape, unreadable text */}
                                <div className="pointer-events-none mt-2 select-none blur-sm">
                                  <p className="text-xs text-gray-400">{leak.description}</p>
                                  <p className="mt-1 text-xs text-gray-500">
                                    <span className="text-purple-300">Fix:</span> {leak.fix}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          {/* Gradient overlay for extraΘöü feel */}
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050508]/90" />
                        </Card>
                        <p className="mt-2 text-center text-xs text-gray-600">
                          Unlock to see all leaks and how to fix them
                        </p>
                      </div>
                      </FadeInView>
                    )}

                    <FadeInView delay={300}>
                      <Card className="mb-6">
                        <h3 className="mb-4 text-sm font-semibold text-white">
                          Quick Fixes
                        </h3>
                        <div className="space-y-3">
                          {displayResult.quickFixes.map((fix) => (
                            <div key={fix.title} className="flex items-start gap-3">
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs text-emerald-400">
                                &#10003;
                              </div>
                              <div>
                                <p className="text-sm text-white">{fix.title}</p>
                                <p className="text-xs text-gray-500">{fix.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </FadeInView>

                    <FadeInView delay={350}>
                      <Card className="mb-6">
                        <h3 className="mb-1 text-sm font-semibold text-white">
                          Budget Upgrade Plan
                        </h3>
                      <p className="mb-4 text-xs text-gray-500">
                        {displayResult.budgetUpgradePlan.priority}
                      </p>
                      <ul className="space-y-2">
                        {displayResult.budgetUpgradePlan.actions.map((action) => (
                          <li key={action} className="flex items-start gap-3 text-xs text-gray-300">
                            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                            {action}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 rounded-lg bg-white/[0.03] p-3 text-xs text-gray-500">
                        Estimated impact: {displayResult.budgetUpgradePlan.estimatedImpact}
                      </p>
                    </Card>
                    </FadeInView>

                    <FadeInView delay={370}>
                      <ImprovementRoadmap
                        metrics={{
                          lightingScore: displayResult.imageMetrics.lightingScore,
                          clarityScore: displayResult.imageMetrics.clarityScore,
                          compositionScore: displayResult.imageMetrics.compositionScore,
                          groomingScore: Math.round((displayResult.imageMetrics.hairRegion?.neatnessScore || 50) + (displayResult.imageMetrics.skinRegion?.evenness || 50)) / 2,
                          expressionScore: displayResult.imageMetrics.symmetryScore || 50,
                          backgroundComplexityEstimate: displayResult.imageMetrics.backgroundComplexityEstimate || 50,
                          symmetryScore: displayResult.imageMetrics.symmetryScore || 50,
                        }}
                      />
                    </FadeInView>

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
                  </>
                );
              })()}

              {/* ─── Challenge CTA ─── */}
              <Card className="mb-6">
                <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-lg font-bold text-white">!</div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">Compete in a Challenge</h4>
                    <p className="text-xs text-gray-400">Submit this audit to a challenge and see how you rank on the local leaderboard.</p>
                  </div>
                  <Link href="/challenges"><Button size="sm" variant="outline">View Challenges</Button></Link>
                </div>
              </Card>

              {/* ─── Shop For Looks ─── */}
              {personalization && displayResult && (
                <PersonalizedShop
                  looks={getPersonalizedLooks({
                    styleArchetypes: [personalization.archetype === "Corporate Sharp" ? "professional" : personalization.archetype === "Creator Vibe" ? "creator" : personalization.archetype === "College Casual" ? "college" : personalization.archetype === "Premium Minimalist" ? "premium" : personalization.archetype === "Urban Aspirational" ? "confident" : personalization.archetype === "Loud Flex" ? "bold" : personalization.archetype === "Soft Luxury" ? "understated" : "clean"],
                    statusLeakTags: displayResult.statusLeaks.map((l) => l.category as any).filter(Boolean),
                    goalTags: audit!.goal ? [audit!.goal as any] : undefined,
                    budgetMax: audit!.budgetRange as any,
                  })}
                  userScore={displayResult.auraScore}
                  archetype={personalization.archetype}
                  leakTags={displayResult.statusLeaks.map((l) => l.category)}
                />
              )}

              {/* ─── Conversion CTA ─── */}
              {!isUnlocked && displayResult && (
                <FadeInView delay={450}>
                  <div className="mb-6 rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-500/[0.06] to-transparent p-6 text-center">
                    <p className="mb-2 text-sm text-gray-300">
                      Your score is <span className="font-bold text-white">{displayResult.auraScore}</span>.
                      Users who fixed their top leaks improved by <span className="font-bold text-emerald-400">+18 points</span> on average.
                    </p>
                    <p className="mb-4 text-xs text-gray-500">Your full report includes {displayResult.statusLeaks.length} personalized fixes, nearby salons & gyms, and buy links for every recommendation.</p>
                    <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
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
                    <h3 className="mb-4 text-sm font-semibold text-white">Profile Text Analysis</h3>
                    <div className="mb-4 text-center">
                      <div className="text-4xl font-bold text-white">
                        <CountUp target={audit.datingProfileReport.textScore} duration={1200} />
                      </div>
                      <div className="text-xs text-gray-500">Text Score / 100</div>
                    </div>
                  <div className="mb-4 rounded-lg border border-white/[0.04] bg-white/[0.03] p-4">
                    <p className="text-xs text-gray-300">{audit.datingProfileReport.overallAdvice}</p>
                  </div>
                  {audit.datingProfileReport.bioAnalysis && (
                    <div className="mb-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
                        <div className="text-xs text-gray-500">Bio Length</div>
                        <div className="text-sm text-white capitalize">{audit.datingProfileReport.bioAnalysis.length.replace(/_/g, " ")}</div>
                      </div>
                      <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
                        <div className="text-xs text-gray-500">Effort</div>
                        <div className="text-sm text-white capitalize">{audit.datingProfileReport.bioAnalysis.effort}</div>
                      </div>
                      <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3 sm:col-span-2">
                        <div className="text-xs text-purple-400">Feedback</div>
                        <p className="mt-1 text-xs text-gray-300">{audit.datingProfileReport.bioAnalysis.feedback}</p>
                      </div>
                    </div>
                  )}
                  {audit.datingProfileReport.redFlags.length > 0 && (
                    <div className="mb-4">
                      <h4 className="mb-2 text-xs font-semibold text-white">Detected Issues</h4>
                      <div className="space-y-2">
                        {audit.datingProfileReport.redFlags.map((rf, i) => (
                          <div key={i} className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                            <div className="mb-1 flex items-center gap-2">
                              <Badge variant={rf.severity === "high" ? "danger" : rf.severity === "medium" ? "warning" : "default"}>{rf.type}</Badge>
                            </div>
                            <p className="text-xs text-gray-300">{rf.explanation}</p>
                            <p className="mt-1 text-xs text-gray-500"><span className="text-purple-300">Fix:</span> {rf.fixSuggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {audit.datingProfileReport.suggestedBios.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-xs font-semibold text-white">Suggested Bio Versions</h4>
                      <div className="space-y-3">
                        {audit.datingProfileReport.suggestedBios.map((sb, i) => (
                          <div key={i} className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
                            <div className="mb-1 text-xs text-purple-300">{sb.version}</div>
                            <p className="mb-1 text-xs text-gray-200">{sb.text}</p>
                            <p className="text-[10px] text-gray-500">{sb.whyItWorks}</p>
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
                  <h3 className="mb-4 text-sm font-semibold text-white">Your 4-Week Roadmap</h3>
                  <div className="mb-4 grid gap-4 sm:grid-cols-2">
                    {[audit.glowupPlan.week1, audit.glowupPlan.week2, audit.glowupPlan.week3, audit.glowupPlan.week4].map((week, wi) => (
                      <details key={wi} className="group rounded-lg border border-white/[0.04] bg-white/[0.03]">
                        <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium text-white hover:bg-white/[0.05]">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-[10px] text-purple-300">W{wi + 1}</span>
                          {week.title}
                        </summary>
                        <div className="px-4 pb-3">
                          <p className="mb-2 text-xs text-purple-300">{week.focus}</p>
                          <div className="space-y-1">
                            {week.dailyMissions.map((m) => (
                              <div key={m.day} className="flex items-start gap-2 text-xs">
                                <span className="shrink-0 text-gray-500">D{m.day}</span>
                                <span className="text-gray-300">{m.title}</span>
                                <Badge variant={m.effort === "hard" ? "danger" : m.effort === "medium" ? "warning" : "default"}>{m.effort}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                  <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-4">
                    <h4 className="mb-2 text-xs font-semibold text-white">Budget Roadmap</h4>
                    <div className="space-y-2 text-xs">
                      {audit.glowupPlan.budgetRoadmap.free.length > 0 && (
                        <div>
                          <div className="text-emerald-400">Free Actions</div>
                          <ul className="ml-3 list-disc text-gray-400">{audit.glowupPlan.budgetRoadmap.free.map((a) => <li key={a}>{a}</li>)}</ul>
                        </div>
                      )}
                      {audit.glowupPlan.budgetRoadmap.under2000.length > 0 && (
                        <div>
                          <div className="text-amber-400">Under Γé╣2,000</div>
                          <ul className="ml-3 list-disc text-gray-400">{audit.glowupPlan.budgetRoadmap.under2000.map((a) => <li key={a}>{a}</li>)}</ul>
                        </div>
                      )}
                      {audit.glowupPlan.budgetRoadmap.under5000.length > 0 && (
                        <div>
                          <div className="text-purple-400">Under Γé╣5,000</div>
                          <ul className="ml-3 list-disc text-gray-400">{audit.glowupPlan.budgetRoadmap.under5000.map((a) => <li key={a}>{a}</li>)}</ul>
                        </div>
                      )}
                      {audit.glowupPlan.budgetRoadmap.under10000.length > 0 && (
                        <div>
                          <div className="text-blue-400">Under Γé╣10,000</div>
                          <ul className="ml-3 list-disc text-gray-400">{audit.glowupPlan.budgetRoadmap.under10000.map((a) => <li key={a}>{a}</li>)}</ul>
                        </div>
                      )}
                      <div className="mt-2 border-t border-white/[0.04] pt-2">
                        <span className="text-gray-500">Estimated total: </span>
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

              {/* Personalized shopping looks (free result) */}
              {personalization && displayResult && (
                <PersonalizedShop
                  looks={getPersonalizedLooks({
                    styleArchetypes: [personalization.archetype === "Corporate Sharp" ? "professional" : personalization.archetype === "Creator Vibe" ? "creator" : personalization.archetype === "College Casual" ? "college" : personalization.archetype === "Premium Minimalist" ? "premium" : personalization.archetype === "Urban Aspirational" ? "confident" : personalization.archetype === "Loud Flex" ? "bold" : personalization.archetype === "Soft Luxury" ? "understated" : "clean"],
                    statusLeakTags: displayResult.statusLeaks.map((l) => l.category as any).filter(Boolean),
                    goalTags: audit!.goal ? [audit!.goal as any] : undefined,
                    budgetMax: audit!.budgetRange as any,
                  })}
                  userScore={displayResult.auraScore}
                  archetype={personalization.archetype}
                  leakTags={displayResult.statusLeaks.map((l) => l.category)}
                />
              )}

              <div className="space-y-2 text-center text-xs text-gray-600">
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
          <Card className="mt-10 border-white/[0.04]">
            <h3 className="mb-4 text-sm font-semibold text-white">Report Management</h3>
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
            <p className="mt-3 text-[10px] text-gray-600">
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
    </Container>
    </>
  );
}
