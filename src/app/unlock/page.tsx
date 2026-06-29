"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getAuditById, updateAudit } from "@/lib/storage/auditStore";
import { createUnlockRecord } from "@/lib/storage/unlockStore";
import { validateUnlockCode, getProductName, getProductPriceLabel } from "@/lib/payments/manualUnlock";
import { generateFullAuraReport } from "@/lib/aura-engine/generateFullAuraReport";
import { generateDatingProfileReport } from "@/lib/aura-engine/datingAudit";
import { generateGlowupPlan } from "@/lib/aura-engine/glowupPlan";
import type { ProductType } from "@/types/payment";

const PRODUCT_FEATURES: Record<string, string[]> = {
  aura_report: [
    "Full visual breakdown across 7 dimensions",
    "Detailed status leaks with personalized fixes",
    "Budget upgrade plan at every price tier",
    "Goal-specific profile strategy",
    "Photo guidance — lighting, framing, background, editing",
    "Priority upgrade map — what to do first, second, and what to avoid",
    "Share-ready report view",
  ],
  dating_audit: [
    "Profile bio & prompt text analysis",
    "Red-flag detection for negativity, clichés, and low effort",
    "3 alternative bio versions tailored to your style",
    "Prompt answer quality scoring per response",
    "Conversation hook & personality presence check",
  ],
  glowup_plan: [
    "4-week structured glow-up roadmap",
    "30 daily missions — one for every day of the month",
    "Covers photo, grooming, outfit, background, and mindset",
    "Budget roadmap from free to ₹10,000+",
    "Week-by-week focus areas with measurable progress",
  ],
};

function UnlockForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const auditId = searchParams.get("auditId") || "";
  const productParam = (searchParams.get("product") || "aura_report") as ProductType;

  const defaultProduct: ProductType =
    productParam === "dating_audit" || productParam === "glowup_plan"
      ? productParam
      : "aura_report";

  const [unlockCode, setUnlockCode] = useState("");
  const [txRef, setTxRef] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [success, setSuccess] = useState(false);

  const audit =
    typeof window !== "undefined" && auditId
      ? getAuditById(auditId)
      : undefined;

  const productName = getProductName(defaultProduct);
  const productPriceLabel = getProductPriceLabel(defaultProduct);
  const features =
    PRODUCT_FEATURES[defaultProduct] || PRODUCT_FEATURES.aura_report;
  const missingDatingText = defaultProduct === "dating_audit" && (!audit?.profileTexts?.bio || audit.profileTexts.bio.trim() === "");
  const missingGlowupData = defaultProduct === "glowup_plan" && (!audit?.imageDataUrl && !audit?.fullReport?.freeResult?.imageMetrics);
  const cannotGenerate = (defaultProduct === "dating_audit" && missingDatingText) || (defaultProduct === "glowup_plan" && missingGlowupData);

  const upiId =
    typeof process !== "undefined" &&
    process.env &&
    (process.env as Record<string, string | undefined>)
      .NEXT_PUBLIC_MANUAL_UPI_ID
      ? ((process.env as Record<string, string | undefined>)
          .NEXT_PUBLIC_MANUAL_UPI_ID as string)
      : "your-upi-id@upi";

  async function handleUnlock() {
    if (!audit || !auditId) return;
    setError(null);

    if (!unlockCode.trim()) {
      setError("Please enter your unlock code.");
      return;
    }

    setUnlocking(true);

    try {
      const valid = validateUnlockCode({
        code: unlockCode,
        auditId,
        productType: defaultProduct,
      });

      if (!valid) {
        setError(
          "Invalid unlock code. Please check your code and try again."
        );
        setUnlocking(false);
        return;
      }

      createUnlockRecord({
        auditId,
        productType: defaultProduct,
        transactionReference: txRef.trim() || undefined,
        unlockCode: unlockCode.trim(),
      });

      const updates: Record<string, unknown> = {};
      updates.unlockedProducts = [...(audit.unlockedProducts || []), defaultProduct];

      if (defaultProduct === "aura_report") {
        const fullContent = await generateFullAuraReport(audit);
        updates.fullScore = fullContent.fullScore;
        updates.reportStatus = "unlocked";
        updates.unlockStatus = "unlocked";
        updates.fullReport = audit.fullReport
          ? {
              ...audit.fullReport,
              score: {
                ...audit.fullReport.score,
                overall: fullContent.fullScore,
              },
              isPremium: true,
              fullContent,
            }
          : {
              id: `${auditId}-report`,
              auditId,
              score: {
                overall: fullContent.fullScore,
                categories: {
                  visual: fullContent.visualBreakdown.lighting,
                  presentation: fullContent.visualBreakdown.clarity,
                  signals: fullContent.visualBreakdown.colorSignal,
                  cohesion: fullContent.visualBreakdown.overallConsistency,
                },
              },
              leaks: [],
              suggestions: [],
              summary: fullContent.detailedVerdict,
              createdAt: fullContent.generatedAt,
              isPremium: true,
              fullContent,
            };
      } else if (defaultProduct === "dating_audit") {
        const datingReport = generateDatingProfileReport(audit);
        updates.datingProfileReport = datingReport;
        updates.reportStatus = "free_generated";
      } else if (defaultProduct === "glowup_plan") {
        const glowupReport = generateGlowupPlan(audit);
        updates.glowupPlan = glowupReport;
        updates.reportStatus = "free_generated";
      }

      if (audit.reportStatus === "locked" || audit.reportStatus === "free_generated") {
        if (defaultProduct !== "aura_report") {
          updates.reportStatus = "free_generated";
        }
      }

      updateAudit(auditId, updates as Partial<import("@/types/audit").Audit>);

      setSuccess(true);
      setTimeout(() => {
        router.push(`/audit/${auditId}`);
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setUnlocking(false);
    }
  }

  if (!auditId) {
    return (
      <Container className="py-16 text-center">
        <Card className="mx-auto max-w-md py-12">
          <p className="mb-2 text-lg text-gray-300">No audit selected</p>
          <p className="mb-6 text-sm text-gray-500">
            Please create an audit first and generate a free score before
            unlocking.
          </p>
          <Link href="/audit/new">
            <Button>Create New Audit</Button>
          </Link>
        </Card>
      </Container>
    );
  }

  if (audit === null || audit === undefined) {
    return (
      <Container className="py-16 text-center">
        <Card className="mx-auto max-w-md py-12">
          <p className="mb-2 text-lg text-gray-300">Audit not found</p>
          <p className="mb-6 text-sm text-gray-500">
            This audit does not exist or may have been deleted.
          </p>
          <Link href="/dashboard">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </Card>
      </Container>
    );
  }

  if (success) {
    return (
      <Container className="py-16 text-center">
        <Card className="mx-auto max-w-md py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <svg
              className="h-8 w-8 text-emerald-400"
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
          </div>
          <p className="mb-2 text-lg text-white">Report Unlocked!</p>
          <p className="text-sm text-gray-500">
            Redirecting to your full report...
          </p>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="mb-6">
        <Link
          href={`/audit/${auditId}`}
          className="text-sm text-gray-500 hover:text-gray-300"
        >
          &larr; Back to Report
        </Link>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card className="mb-6">
          <Badge variant="premium" className="mb-3">
            {productName}
          </Badge>
          <h1 className="mb-2 text-2xl font-bold text-white">
            Unlock {productName}
          </h1>
          <p className="mb-6 text-sm text-gray-400">
            One-time payment of{" "}
            <span className="text-amber-400">{productPriceLabel}</span>
          </p>

          <ul className="mb-6 space-y-3">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-sm text-gray-300"
              >
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
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
                {feature}
              </li>
            ))}
          </ul>
        </Card>

        {cannotGenerate ? (
          <Card className="text-center">
            <p className="mb-2 text-lg text-gray-300">
              Profile text required for Dating Audit
            </p>
            <p className="mb-6 text-sm text-gray-500">
              Please create a new audit with the Dating type and enter your profile bio/text first.
            </p>
            <Link href="/audit/new">
              <Button>Create New Audit</Button>
            </Link>
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-white">
                Step 1: Pay via UPI
              </h3>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <p className="mb-2 text-xs text-gray-500">
                  Send{" "}
                  <span className="text-amber-400">{productPriceLabel}</span>{" "}
                  to:
                </p>
                <p className="font-mono text-lg text-purple-300">{upiId}</p>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                After payment, enter the unlock code provided by the owner or
                admin below.
              </p>
            </Card>

            <Card className="mb-6">
              <h3 className="mb-4 text-sm font-semibold text-white">
                Step 2: Enter Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    UPI Transaction Reference (optional)
                  </label>
                  <input
                    type="text"
                    value={txRef}
                    onChange={(e) => setTxRef(e.target.value)}
                    placeholder="e.g. UPI123456789"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">
                    Unlock Code <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={unlockCode}
                    onChange={(e) => setUnlockCode(e.target.value)}
                    placeholder="Enter unlock code"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-600">
                    Demo code:{" "}
                    <span className="font-mono text-purple-300">
                      AURADEMO
                    </span>
                  </p>
                </div>
              </div>

              {error && (
                <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </p>
              )}

              <Button
                className="mt-4 w-full"
                size="lg"
                onClick={handleUnlock}
                disabled={unlocking || cannotGenerate}
              >
                {unlocking
                  ? "Generating Report..."
                  : `Unlock ${productName} — ${productPriceLabel}`}
              </Button>
            </Card>
          </>
        )}

        <div className="space-y-2 text-center text-xs text-gray-600">
          <p>
            AuraCheck analyzes presentation signals using local browser-based
            rules. This is guidance, not objective truth.
          </p>
          <p>
            Local-only MVP: unlocks are stored in this browser. If you clear
            browser data, reports may be removed.
          </p>
        </div>
      </div>
    </Container>
  );
}

export default function UnlockPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-16 text-center">
          <p className="text-gray-500">Loading...</p>
        </Container>
      }
    >
      <UnlockForm />
    </Suspense>
  );
}
