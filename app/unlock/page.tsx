"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getAuditById, updateAudit } from "@/lib/storage/auditStore";
import { recordUnlock } from "@/lib/storage/unlockStore";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { generateFullAuraReport } from "@/lib/aura-engine/generateFullAuraReport";
import { generateStatusArchetype } from "@/lib/aura-engine/archetypes";
import { generateDatingProfileAudit } from "@/lib/aura-engine/generateDatingProfileAudit";
import { generateGlowUpPlan } from "@/lib/aura-engine/generateGlowUpPlan";
import { generateQuickAuraFix } from "@/lib/aura-engine/generateQuickAuraFix";
import type { ProductType } from "@/types";
import { applyOffer } from "@/lib/offers/applyOffer";
import type { OfferApplyResult } from "@/types/offer";
import { BeforeAfterCard } from "@/components/proof/BeforeAfterCard";
import { PROOF_EXAMPLES } from "@/config/proofExamples";
import { RazorpayCheckoutButton } from "@/components/payments/RazorpayCheckoutButton";
import { getPublicRazorpayKeyId } from "@/lib/razorpay/env";

const PRODUCT_INFO: Record<ProductType, { name: string; price: number; desc: string }> = {
  quick_fix: { name: "Fast Fix", price: 25, desc: "Your biggest status leak and the fastest fix path." },
  aura_report: { name: "Full Read", price: 50, desc: "Deep visual analysis with upgrade roadmap." },
  dating_audit: { name: "Dating/Profile Audit", price: 299, desc: "Profile presentation score, bio feedback, and photo order strategy." },
  glowup_plan: { name: "30-Day Reset", price: 499, desc: "Structured 30-day roadmap with daily missions and budget roadmap." },
};

export default function UnlockPage() {
  return (
    <Suspense fallback={
      <Container className="py-12">
        <div className="mx-auto max-w-md text-center">
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      </Container>
    }>
      <UnlockContent />
    </Suspense>
  );
}

function UnlockContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auditId = searchParams.get("auditId") || "";
  const productParam = searchParams.get("product") || "aura_report";
  const validProducts: ProductType[] = ["quick_fix", "aura_report", "dating_audit", "glowup_plan"];
  const product = (validProducts.includes(productParam as ProductType) ? productParam : "aura_report") as ProductType;

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [offerCodeInput, setOfferCodeInput] = useState("");
  const [offerResult, setOfferResult] = useState<OfferApplyResult | null>(null);
  const [offerError, setOfferError] = useState<string | null>(null);
  const [checkingPaymentStatus, setCheckingPaymentStatus] = useState(false);
  const [paymentStatusResult, setPaymentStatusResult] = useState<string | null>(null);
  const [recovering, setRecovering] = useState(false);
  const [recoveryResult, setRecoveryResult] = useState<string | null>(null);

  useEffect(() => {
    if (product === "quick_fix") trackEvent("quick_fix_unlock_started", { auditId });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const audit = auditId ? getAuditById(auditId) : undefined;
  const productInfo = PRODUCT_INFO[product];
  const razorpayAvailable = !!getPublicRazorpayKeyId();

  const finalAmount = (offerResult?.valid && offerResult.finalAmount >= 0) ? offerResult.finalAmount : productInfo.price;

  const checkPaymentStatus = useCallback(async () => {
    if (!auditId || !audit) return;
    setCheckingPaymentStatus(true);
    setPaymentStatusResult(null);
    try {
      const res = await fetch("/api/payments/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId, productType: product }),
      });
      const data = await res.json();
      if (data.unlocked) {
        setPaymentStatusResult("Payment verified and product unlocked! Redirecting...");
        setTimeout(() => router.push(`/audit/${auditId}`), 1500);
      } else if (data.status === "payment_failed") {
        setPaymentStatusResult("Payment failed. Please try again or contact support.");
      } else if (data.status === "amount_mismatch") {
        setPaymentStatusResult("Payment amount mismatch detected. Contact support.");
      } else if (data.status === "paid_pending_recovery") {
        setPaymentStatusResult("Payment needs recovery. Click 'Recover payment' below.");
      } else {
        setPaymentStatusResult("Payment not yet verified. If money was deducted, use the recovery option below.");
      }
    } catch {
      setPaymentStatusResult("Could not check payment status.");
    } finally {
      setCheckingPaymentStatus(false);
    }
  }, [auditId, product, audit, router]);

  const handleRecoverPayment = useCallback(async () => {
    if (!auditId || !audit) return;
    setRecovering(true);
    setRecoveryResult(null);
    try {
      const res = await fetch("/api/payments/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId, productType: product }),
      });
      const data = await res.json();
      if (data.success) {
        setRecoveryResult("Payment recovered and product unlocked! Redirecting...");
        setTimeout(() => router.push(`/audit/${auditId}`), 1500);
      } else {
        setRecoveryResult(data.message || "Could not recover payment. Contact support with your payment ID.");
      }
    } catch {
      setRecoveryResult("Recovery failed. Contact support with your payment ID.");
    } finally {
      setRecovering(false);
    }
  }, [auditId, product, audit, router]);

  if (!auditId || !audit) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Unlock Report</h1>
          <p className="mb-6 text-sm text-gray-400">No audit specified or audit not found. Create an audit and generate a free score first.</p>
          <Button asChild><Link href="/audit/new">Start Aura Check</Link></Button>
        </div>
      </Container>
    );
  }

  if (!audit.freeResult) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Unlock {productInfo.name}</h1>
          <p className="mb-6 text-sm text-gray-400">Generate a free Aura Score first before unlocking products.</p>
          <Button asChild><Link href={`/audit/${auditId}`}>Back to Audit</Link></Button>
        </div>
      </Container>
    );
  }

  const alreadyUnlocked = (audit.unlockedProducts || []).includes(product);
  if (alreadyUnlocked) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Already Unlocked</h1>
          <p className="mb-6 text-sm text-gray-400">This product is already unlocked.</p>
          <Button asChild><Link href={`/audit/${auditId}`}>View Audit</Link></Button>
        </div>
      </Container>
    );
  }

  function handleApplyOffer() {
    setOfferError(null);
    const result = applyOffer(offerCodeInput, product);
    if (result.valid) {
      setOfferResult(result);
      trackEvent("offer_applied", { code: offerCodeInput.toUpperCase(), product, discountAmount: String(result.discountAmount), finalAmount: String(result.finalAmount) });
    } else {
      setOfferError(result.message);
      setOfferResult(null);
    }
  }

  async function handleRazorpaySuccess() {
    if (!auditId || !audit) return;
    setUnlocking(true);
    try {
      const existingProducts = (audit.unlockedProducts || []) as ProductType[];
      if (existingProducts.includes(product)) { return; }

      const newUnlocked = [...new Set([...existingProducts, product])];
      const updateData: Record<string, unknown> = { unlockedProducts: newUnlocked };

      if (product === "aura_report") {
        const report = await generateFullAuraReport(audit.imageDataUrl, audit.freeResult, audit);
        let personalization = audit.personalization;
        if (!personalization && audit.freeResult) personalization = generateStatusArchetype(audit, audit.freeResult.imageMetrics);
        updateData.fullReport = report;
        updateData.fullScore = report.fullScore;
        updateData.personalization = personalization;
        updateData.reportStatus = "full_report";
      } else if (product === "dating_audit" && audit.freeResult) {
        updateData.datingProfileReport = generateDatingProfileAudit(audit);
      } else if (product === "glowup_plan" && audit.freeResult) {
        updateData.glowupPlan = generateGlowUpPlan(audit, audit.freeResult.imageMetrics);
      } else if (product === "quick_fix" && audit.freeResult) {
        updateData.quickFixReport = generateQuickAuraFix(auditId, audit.freeResult, audit.fullReport, audit.freeResult.imageMetrics);
      }

      recordUnlock(auditId, product, "razorpay_auto");
      updateAudit(auditId, updateData);
      trackEvent("product_unlocked", { product, auditId, method: "razorpay" });
      if (product === "quick_fix") trackEvent("quick_fix_unlocked", { auditId });
      setSuccess(`${productInfo.name} unlocked successfully!`);
      setTimeout(() => router.push(`/audit/${auditId}`), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auto-unlock failed. Go to audit page to check.");
    } finally {
      setUnlocking(false);
    }
  }

  const proofExample = product === "quick_fix" ? PROOF_EXAMPLES[0]
    : product === "aura_report" ? PROOF_EXAMPLES[3]
    : product === "dating_audit" ? PROOF_EXAMPLES[4]
    : PROOF_EXAMPLES[6];

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 text-center text-3xl font-bold text-white">
          Unlock {productInfo.name}
        </h1>
        <p className="mb-8 text-center text-sm text-gray-400">
          Secure payment via Razorpay. Instant unlock after payment.
        </p>

        {/* ─── Product Info ─── */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">{productInfo.name}</h2>
              <p className="text-xs text-gray-500">Audit: {audit.id.slice(0, 8)}...</p>
            </div>
            <div className="text-right">
              {offerResult?.valid && finalAmount !== productInfo.price ? (
                <>
                  <span className="block text-sm text-gray-500 line-through">₹{productInfo.price}</span>
                  <span className="text-2xl font-bold text-emerald-400">₹{finalAmount}</span>
                </>
              ) : (
                <span className="text-2xl font-bold text-amber-400">₹{productInfo.price}</span>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400">{productInfo.desc}</p>
          {product === "quick_fix" && (
            <div className="mt-4 border-t border-white/5 pt-4">
              <div className="mb-2 text-xs font-semibold text-gray-400">What you get:</div>
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="text-emerald-400">✓</span> Biggest status leak</span>
                <span className="flex items-center gap-1"><span className="text-emerald-400">✓</span> Fastest free fix</span>
                <span className="flex items-center gap-1"><span className="text-emerald-400">✓</span> Under ₹500 fix</span>
                <span className="flex items-center gap-1"><span className="text-emerald-400">✓</span> Under ₹2,000 fix</span>
                <span className="flex items-center gap-1"><span className="text-emerald-400">✓</span> Avoid-for-now advice</span>
                <span className="flex items-center gap-1"><span className="text-emerald-400">✓</span> 3-step action plan</span>
              </div>
            </div>
          )}
        </Card>

        {/* ─── Proof Card ─── */}
        <div className="mb-6">
          <p className="mb-2 text-xs text-gray-500">See what this product is designed to solve.</p>
          <BeforeAfterCard example={proofExample} compact />
          </div>

          {/* ─── Razorpay Payment ─── */}
        {razorpayAvailable ? (
          <Card className="mb-6 border-purple-500/20">
            <h3 className="mb-4 text-sm font-semibold text-purple-400">Pay Securely</h3>
            <RazorpayCheckoutButton
              auditId={auditId}
              productType={product}
              productName={productInfo.name}
              amount={finalAmount}
              offerCode={offerResult?.valid ? offerResult.offer?.code : undefined}
              customerName=""
              customerContact=""
              onSuccess={handleRazorpaySuccess}
              onError={(msg) => setError(msg)}
            />
            <p className="mt-3 text-xs text-gray-500">UPI, cards, net banking, and wallets accepted via Razorpay.</p>
          </Card>
        ) : (
          <Card className="mb-6 border-amber-500/20">
            <h3 className="mb-3 text-sm font-semibold text-amber-400">Payment Coming Soon</h3>
            <p className="text-xs text-gray-400">
              Online payments are being set up. Check back shortly — Razorpay integration is in progress.
            </p>
          </Card>
        )}

        {error && <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
        {success && <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{success}</div>}

        {/* ─── Post-Purchase Upsell ─── */}
        {success && (() => {
          const nextTier = product === "quick_fix"
            ? { product: "aura_report" as const, name: "Full Read", price: 50, desc: "Deep dive — every leak, every fix, priority order." }
            : product === "aura_report"
            ? { product: "dating_audit" as const, name: "Dating/Profile Audit", price: 299, desc: "Bio feedback, photo order strategy, profile score." }
            : product === "dating_audit"
            ? { product: "glowup_plan" as const, name: "30-Day Reset", price: 499, desc: "Structured daily missions + budget roadmap." }
            : null;
          if (!nextTier) return null;
          return (
            <Card className="mb-6 border-purple-500/20 bg-purple-500/5">
              <div className="mb-2 text-xs font-semibold text-purple-300">Level up your glow-up ✨</div>
              <p className="text-sm text-white font-semibold">{nextTier.name} — ₹{nextTier.price}</p>
              <p className="mt-1 text-xs text-gray-400">{nextTier.desc}</p>
              <div className="mt-3">
                <Button asChild size="sm">
                  <Link href={`/unlock?auditId=${auditId}&product=${nextTier.product}`}>
                    Unlock {nextTier.name} →
                  </Link>
                </Button>
              </div>
            </Card>
          );
        })()}

        {unlocking && (
          <div className="mb-6 text-center text-sm text-purple-300">Generating your report...</div>
        )}

        {/* ─── Payment Recovery ─── */}
        {razorpayAvailable && (
          <Card className="mb-6 border-amber-500/20">
            <h3 className="mb-3 text-sm font-semibold text-amber-400">Payment Recovery</h3>
            <p className="mb-3 text-xs text-gray-400">
              If you paid but the product didn&rsquo;t unlock (e.g., browser closed before redirect), check payment status or recover your payment.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={checkPaymentStatus}
                disabled={checkingPaymentStatus}
              >
                {checkingPaymentStatus ? "Checking..." : "Check Payment Status"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-500/50 text-emerald-400"
                onClick={handleRecoverPayment}
                disabled={recovering}
              >
                {recovering ? "Recovering..." : "Recover Payment"}
              </Button>
            </div>
            {paymentStatusResult && (
              <div className={`mt-2 rounded-lg px-3 py-2 text-xs ${
                paymentStatusResult.includes("unlocked") || paymentStatusResult.includes("verified")
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "bg-amber-500/10 text-amber-300"
              }`}>
                {paymentStatusResult}
              </div>
            )}
            {recoveryResult && (
              <div className={`mt-2 rounded-lg px-3 py-2 text-xs ${
                recoveryResult.includes("unlocked")
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "bg-amber-500/10 text-amber-300"
              }`}>
                {recoveryResult}
              </div>
            )}
            <p className="mt-3 text-xs text-gray-500">
              If money was deducted and recovery doesn&rsquo;t work, send your Razorpay payment ID and order ID to support.
            </p>
          </Card>
        )}

        {/* ─── Footer ─── */}
        <div className="mt-6 space-y-2 text-center text-xs text-gray-600">
          <p>Payments are processed securely via Razorpay. Products unlock instantly after successful payment.</p>
          <p>Your image stays in this browser.</p>
          <p>No external AI service is used.</p>
          <p className="text-gray-500">AuraCheck analyzes presentation signals, not human worth. Scores are guidance, not objective truth. No guaranteed dating, social, career, or financial outcomes.</p>
          <Link href={`/audit/${auditId}`} className="block text-purple-400 hover:underline">&larr; Back to audit</Link>
        </div>
      </div>
    </Container>
  );
}
