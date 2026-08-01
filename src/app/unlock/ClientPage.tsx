"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { getAuditById, updateAudit } from "@/lib/storage/auditStore";
import { createUnlockRecord } from "@/lib/storage/unlockStore";
import { createOrder, updateOrder } from "@/lib/storage/orderStore";
import { getProductName, getProductPrice, getProductPriceLabel } from "@/lib/payments/manualUnlock";
import { getFriendDiscountCode } from "@/lib/storage/referralStore";
import { PaymentTrust } from "@/components/trust/PaymentTrust";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { trackEvent as trackPH, EVENTS } from "@/lib/analytics/events";
import { generateFullAuraReport } from "@/lib/aura-engine/generateFullAuraReport";
import { generateDatingProfileReport } from "@/lib/aura-engine/datingAudit";
import { generateGlowupPlan } from "@/lib/aura-engine/glowupPlan";
import type { ProductType } from "@/types/payment";
import type { Audit } from "@/types/audit";
import type { OfferApplication } from "@/types/offer";

// Razorpay Checkout is the only way to pay. "unlock" is a discreet admin/comp
// code override (not a customer payment method); "done" is the success screen.
type UnlockStage = "request" | "unlock" | "done";

function getSupportEmail(): string | null {
  if (typeof process !== "undefined" && process.env && (process.env as Record<string, string | undefined>).NEXT_PUBLIC_SUPPORT_EMAIL) {
    return (process.env as Record<string, string | undefined>).NEXT_PUBLIC_SUPPORT_EMAIL as string;
  }
  return null;
}

const PRODUCT_FEATURES: Record<string, string[]> = {
  aura_report: [
    "Instagram Grid Check — your whole profile (grid + bio) scored the way visitors see it",
    "Ready-to-Post Pack — we auto-fix your photo & crop it for Instagram, Hinge or LinkedIn",
    "Style Passport — your colours, frames, scent & grooming in one card you keep",
    "‘Which one should I post?’ — on-device AI ranks your candidate photos",
    "Occasion Kits — what to wear & how to prep for a date, interview or shaadi",
    "Every photo issue with its exact fix, ranked by measured impact",
    "Face-shape studio + colour palette & capsule wardrobe, matched to your undertone",
    "Celebrity style match + shop the look in your budget",
    "Downloadable report + a shareable before → after glow-up card",
  ],
  dating_audit: [
    "Bio & prompt scoring with line-by-line rewrites",
    "Red-flag detection — clichés, negativity, low effort",
    "3 ready-to-paste bios written for your tone",
    "Photo strategy — your lead photo + the 5-slot order that converts",
    "Platform playbook — tailored Hinge, Bumble & Tinder tactics",
    "Opening hooks engineered to make matches message first",
  ],
  glowup_plan: [
    "30 daily missions across photo, grooming, outfit & mindset",
    "Personalized to your weakest signal — not a generic checklist",
    "A measurable milestone for each of the 4 weeks",
    "Budget roadmap from free fixes to ₹10,000+ upgrades",
    "Built-in week-by-week before/after checkpoints",
    "Yours forever — repeat the cycle any time",
  ],
};

function UnlockForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const auditId = searchParams.get("auditId") || "";
  const productParam = (searchParams.get("product") || "aura_report") as ProductType;

  const defaultProduct: ProductType =
    productParam === "dating_audit" || productParam === "glowup_plan" ? productParam : "aura_report";

  const [stage, setStage] = useState<UnlockStage>("request");
  const [unlockCode, setUnlockCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [offerCode, setOfferCode] = useState("");
  const [offerResult, setOfferResult] = useState<OfferApplication | null>(null);

  const audit = typeof window !== "undefined" && auditId ? getAuditById(auditId) : undefined;
  const productName = getProductName(defaultProduct);
  const productPrice = getProductPrice(defaultProduct);
  const productPriceLabel = getProductPriceLabel(defaultProduct);
  const finalPrice = offerResult?.isValid ? offerResult.finalAmount : productPrice;
  const finalPriceLabel = offerResult?.isValid && offerResult.finalAmount !== productPrice ? `₹${offerResult.finalAmount}` : productPriceLabel;
  const features = PRODUCT_FEATURES[defaultProduct] || PRODUCT_FEATURES.aura_report;
  const supportEmail = getSupportEmail();

  const isAlreadyUnlocked = audit?.unlockedProducts?.includes(defaultProduct);

  const missingDatingText = defaultProduct === "dating_audit" && (!audit?.profileTexts?.bio || audit.profileTexts.bio.trim() === "");
  const missingGlowupData = defaultProduct === "glowup_plan" && (!audit?.imageDataUrl && !audit?.fullReport?.freeResult?.imageMetrics);
  const cannotGenerate = (defaultProduct === "dating_audit" && missingDatingText) || (defaultProduct === "glowup_plan" && missingGlowupData);

  function handleApplyOffer() {
    if (!offerCode.trim()) {
      setOfferResult(null);
      return;
    }
    const normalized = offerCode.trim().toUpperCase();
    setOfferResult({ productType: defaultProduct, originalAmount: productPrice, code: normalized, discountAmount: 0, finalAmount: productPrice, message: "Verifying offer code...", isValid: false });

    fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productType: defaultProduct, offerCode: normalized, auditId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.appliedOffer) {
          setOfferResult({
            productType: defaultProduct,
            originalAmount: data.originalAmount,
            code: data.appliedOffer,
            discountAmount: data.discountAmount,
            finalAmount: data.finalAmount,
            message: `Offer ${data.appliedOffer} applied.`,
            isValid: true,
          });
          if (data.finalAmount < productPrice) {
            trackEvent({ eventName: "offer_applied", auditId, productType: defaultProduct, metadata: { code: data.appliedOffer, discount: String(data.discountAmount) } });
          }
        } else {
          setOfferResult({
            productType: defaultProduct,
            originalAmount: data.originalAmount,
            code: normalized,
            discountAmount: 0,
            finalAmount: data.originalAmount,
            message: "Invalid or expired offer code.",
            isValid: false,
          });
        }
      })
      .catch(() => {
        setOfferResult(null);
      });
  }

  async function handleUnlock() {
    if (!audit || !auditId) return;
    setError(null);
    if (!unlockCode.trim()) { setError("Please enter your unlock code."); return; }
    setUnlocking(true);
    try {
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: unlockCode.trim(), auditId, productType: defaultProduct }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.valid) {
        setError(verifyData.message || "Invalid unlock code. Please check your code and try again.");
        setUnlocking(false);
        return;
      }
      createUnlockRecord({ auditId, productType: defaultProduct, unlockCode: unlockCode.trim() });

      // Persist the unlock immediately so a valid code never leaves the user
      // locked if content generation below fails; the report self-heals on load.
      const baseUpdates: Record<string, unknown> = {
        unlockedProducts: [...(audit.unlockedProducts || []), defaultProduct],
      };
      if (defaultProduct === "aura_report") {
        baseUpdates.reportStatus = "unlocked";
        baseUpdates.unlockStatus = "unlocked";
      }
      updateAudit(auditId, baseUpdates as Partial<Audit>);

      try {
        const enrich: Record<string, unknown> = {};
        if (defaultProduct === "aura_report") {
          const fullContent = await generateFullAuraReport(audit);
          enrich.fullScore = fullContent.fullScore;
          enrich.fullReport = audit.fullReport
            ? { ...audit.fullReport, score: { ...audit.fullReport.score, overall: fullContent.fullScore }, isPremium: true, fullContent }
            : { id: `${auditId}-report`, auditId, score: { overall: fullContent.fullScore, categories: { visual: fullContent.visualBreakdown.lighting, presentation: fullContent.visualBreakdown.clarity, signals: fullContent.visualBreakdown.colorSignal, cohesion: fullContent.visualBreakdown.overallConsistency } }, leaks: [], suggestions: [], summary: fullContent.detailedVerdict, createdAt: fullContent.generatedAt, isPremium: true, fullContent };
        } else if (defaultProduct === "dating_audit") {
          enrich.datingProfileReport = generateDatingProfileReport(audit);
          enrich.reportStatus = audit.reportStatus === "draft" ? "free_generated" : audit.reportStatus;
        } else if (defaultProduct === "glowup_plan") {
          enrich.glowupPlan = generateGlowupPlan(audit);
          enrich.reportStatus = audit.reportStatus === "draft" ? "free_generated" : audit.reportStatus;
        }
        if (Object.keys(enrich).length) updateAudit(auditId, enrich as Partial<Audit>);
      } catch (genErr) {
        console.warn("[unlock] code-redeem content generation deferred to report page:", genErr);
      }
      trackEvent({ eventName: "product_unlocked", auditId, productType: defaultProduct });
      setStage("done");
      setTimeout(() => router.push(`/audit/${auditId}`), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setUnlocking(false);
    }
  }

  // ─── Guard: no auditId ───
  if (!auditId) {
    return (
      <Container className="py-16 text-center">
        <Card className="mx-auto max-w-md py-12">
          <p className="mb-2 text-lg text-[#4a443d]">No audit selected</p>
          <p className="mb-6 text-sm text-[#857b6e]">Please create an audit first and generate a free score before unlocking.</p>
          <Link href="/audit/new"><Button>Create New Audit</Button></Link>
        </Card>
      </Container>
    );
  }

  // ─── Guard: audit not found ───
  if (audit === null || audit === undefined) {
    return (
      <Container className="py-16 text-center">
        <Card className="mx-auto max-w-md py-12">
          <p className="mb-2 text-lg text-[#4a443d]">Audit not found</p>
          <p className="mb-6 text-sm text-[#857b6e]">This audit does not exist or may have been deleted.</p>
          <Link href="/dashboard"><Button variant="secondary">Back to Dashboard</Button></Link>
        </Card>
      </Container>
    );
  }

  // ─── Guard: already unlocked ───
  if (isAlreadyUnlocked) {
    return (
      <Container className="py-16 text-center">
        <Card className="mx-auto max-w-md py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <Badge variant="premium" className="mb-2">{productName}</Badge>
          <p className="mb-2 text-lg text-[#1C1917]">Already Unlocked</p>
          <p className="mb-6 text-sm text-[#857b6e]">This product has already been unlocked for this audit.</p>
          <Link href={`/audit/${auditId}`}><Button>View Report</Button></Link>
        </Card>
      </Container>
    );
  }

  // ─── Guard: cannot generate (missing data) ───
  if (cannotGenerate) {
    const msg = defaultProduct === "dating_audit"
      ? "Profile text required for Dating Audit. Please create a new audit with the Dating type and enter your profile bio/text."
      : "Audit data required for Glow-Up Plan. Please create an audit first with an image.";
    return (
      <Container className="py-16 text-center">
        <Card className="mx-auto max-w-md py-12">
          <p className="mb-2 text-lg text-[#4a443d]">Cannot Generate {productName}</p>
          <p className="mb-6 text-sm text-[#857b6e]">{msg}</p>
          <Link href="/audit/new"><Button>Create New Audit</Button></Link>
        </Card>
      </Container>
    );
  }

  // ─── Done ───
  if (stage === "done") {
    return (
      <Container className="py-16 text-center">
        <Card className="mx-auto max-w-md py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <Badge variant="premium" className="mb-2">{productName}</Badge>
          <p className="mb-2 text-lg text-[#1C1917]">Report Unlocked!</p>
          <p className="text-sm text-[#857b6e]">Redirecting to your report...</p>
        </Card>
      </Container>
    );
  }

  return (
    <>
      <div className="aurora-mesh" />
      <Container className="relative py-12">
        <GlowOrb color="rgba(225, 68, 52, 0.08)" size={300} className="top-[10%] right-[8%]" delay={0} />
        <GlowOrb color="rgba(245, 158, 11, 0.06)" size={200} className="bottom-[20%] left-[10%]" delay={400} />
        <div className="mb-6">
          <Link href={`/audit/${auditId}`} className="text-sm text-[#857b6e] hover:text-[#4a443d]">&larr; Back to Report</Link>
        </div>

      <div className="mx-auto max-w-2xl">
        {/* Product Info Card */}
        <Card className="mb-6">
          <Badge variant="premium" className="mb-3">{productName}</Badge>
          <h1 className="mb-2 text-2xl font-bold text-[#1C1917]">Unlock {productName}</h1>
          <p className="mb-6 text-sm text-[#6f675e]">One-time payment of <span className="text-amber-400">{finalPriceLabel}</span></p>
          <ul className="mb-6 space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-[#4a443d]">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {f}
              </li>
            ))}
          </ul>
        </Card>

        {/* Trust layer */}
        <div className="mb-6">
          <PaymentTrust variant="unlock" />
        </div>


        {/* ─── STAGE 1: Payment Request ─── */}
        {stage === "request" && (
          <>
            {/* Offer Code */}
            <Card className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-[#1C1917]">Have an offer code?</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={offerCode}
                  onChange={(e) => setOfferCode(e.target.value)}
                  placeholder="e.g. EARLY50"
                  className="flex-1 rounded-lg border border-[#1c1917]/10 bg-[#1c1917]/[0.04] px-3 py-2 text-sm text-[#1C1917] placeholder-gray-600 focus:border-red-500/50 focus:outline-none"
                />
                <Button variant="secondary" size="sm" onClick={handleApplyOffer}>
                  Apply
                </Button>
              </div>
              {offerResult && (
                <div className={`mt-3 rounded-lg px-3 py-2 text-xs ${offerResult.isValid ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                  {offerResult.message}
                </div>
              )}
              <p className="mt-3 text-[10px] text-[#9c9184]">
                Referred by a friend? Code <span className="font-mono text-[#857b6e]">{getFriendDiscountCode()}</span> gives you 20% off
              </p>
            </Card>


            {/* Razorpay Checkout — primary (and only) payment method */}
            <Card className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-[#1C1917]">Pay securely to unlock</h3>
              <p className="mb-4 text-xs text-[#6f675e]">
                One-time payment of <span className="text-amber-400">{finalPriceLabel}</span> via UPI, card, or netbanking. Your report unlocks instantly after payment — no waiting.
              </p>
              <Button
                size="lg"
                className="w-full bg-[#072654] hover:bg-[#0a3370] text-white"
                onClick={async () => {
                  try {
                    setError(null);
                    trackPH(EVENTS.PAYMENT_STARTED, { auditId, productType: defaultProduct, amount: finalPrice });
                    // Load Razorpay script
                    if (!window.Razorpay) {
                      const script = document.createElement("script");
                      script.src = "https://checkout.razorpay.com/v1/checkout.js";
                      document.body.appendChild(script);
                      await new Promise((resolve) => { script.onload = resolve; });
                    }
                    // Create order
                    const orderRes = await fetch("/api/payments/create-order", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        productType: defaultProduct,
                        offerCode: offerResult?.isValid ? offerResult.code : undefined,
                        customerName,
                        customerContact,
                        auditId,
                      }),
                    });
                    const orderData = await orderRes.json();
                    if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");
                    // Open Razorpay checkout
                    const rzp = new window.Razorpay({
                      key: orderData.razorpayKeyId,
                      amount: orderData.amount * 100,
                      currency: orderData.currency,
                      name: "AuraCheck",
                      description: orderData.productName,
                      order_id: orderData.orderId,
                      handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
                        // Verify payment
                        const verifyRes = await fetch("/api/payments/verify", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            auditId,
                            productType: defaultProduct,
                          }),
                        });
                        const verifyData = await verifyRes.json();
                        if (!verifyRes.ok || !verifyData.valid) {
                          setError("Payment verification failed. Please contact support.");
                          return;
                        }
                        // Unlock report
                        createUnlockRecord({ auditId, productType: defaultProduct, unlockCode: response.razorpay_payment_id });
                        // Record the purchase in this browser's order history so it
                        // shows on /orders (Razorpay checkout skips the manual flow).
                        try {
                          const localOrder = createOrder({
                            auditId,
                            productType: defaultProduct,
                            customerName: customerName.trim() || undefined,
                            customerContact: customerContact.trim() || undefined,
                            offerCode: offerResult?.isValid ? offerResult.code : undefined,
                            originalAmount: productPrice,
                            discountAmount: offerResult?.isValid ? offerResult.discountAmount : 0,
                            finalAmount: finalPrice,
                          });
                          updateOrder(localOrder.id, {
                            status: "unlocked",
                            generatedUnlockCode: response.razorpay_payment_id,
                            upiTransactionRef: response.razorpay_order_id,
                            unlockedAt: new Date().toISOString(),
                          });
                        } catch {}
                        // 1) Persist the unlock IMMEDIATELY. A paying customer must be
                        //    unlocked even if the heavy report generation below fails, hangs,
                        //    or the tab is closed mid-way. The report page self-heals the full
                        //    content on load whenever it is missing, so this alone guarantees
                        //    the buyer never pays and gets a locked report.
                        const baseUpdates: Record<string, unknown> = {
                          unlockedProducts: [...(audit?.unlockedProducts || []), defaultProduct],
                          // Razorpay ids let the report re-verify against Razorpay on load.
                          razorpayOrderId: response.razorpay_order_id,
                          razorpayPaymentId: response.razorpay_payment_id,
                        };
                        if (defaultProduct === "aura_report") {
                          baseUpdates.reportStatus = "unlocked";
                          baseUpdates.unlockStatus = "unlocked";
                        }
                        updateAudit(auditId, baseUpdates as Partial<Audit>);

                        // 2) Best-effort: generate the product content now for an instant
                        //    experience. A failure here no longer costs the buyer their unlock.
                        try {
                          const enrich: Record<string, unknown> = {};
                          if (defaultProduct === "aura_report") {
                            const fullContent = await generateFullAuraReport(audit!);
                            enrich.fullScore = fullContent.fullScore;
                            enrich.fullReport = audit!.fullReport
                              ? { ...audit!.fullReport, score: { ...audit!.fullReport.score, overall: fullContent.fullScore }, isPremium: true, fullContent }
                              : { id: `${auditId}-report`, auditId, score: { overall: fullContent.fullScore, categories: { visual: fullContent.visualBreakdown.lighting, presentation: fullContent.visualBreakdown.clarity, signals: fullContent.visualBreakdown.colorSignal, cohesion: fullContent.visualBreakdown.overallConsistency } }, leaks: [], suggestions: [], summary: fullContent.detailedVerdict, createdAt: fullContent.generatedAt, isPremium: true, fullContent };
                          } else if (defaultProduct === "dating_audit") {
                            enrich.datingProfileReport = generateDatingProfileReport(audit!);
                          } else if (defaultProduct === "glowup_plan") {
                            enrich.glowupPlan = generateGlowupPlan(audit!);
                          }
                          if (Object.keys(enrich).length) updateAudit(auditId, enrich as Partial<Audit>);
                        } catch (genErr) {
                          console.warn("[unlock] post-payment content generation deferred to report page:", genErr);
                        }
                        trackEvent({ eventName: "product_unlocked", auditId, productType: defaultProduct });
                        trackPH(EVENTS.PAYMENT_COMPLETED, { auditId, productType: defaultProduct, amount: finalPrice });
                        setStage("done");
                        setTimeout(() => router.push(`/audit/${auditId}`), 1500);
                      },
                      prefill: { name: customerName, contact: customerContact },
                      theme: { color: "#e11d48" },
                    });
                    rzp.on("payment.failed", () => {
                      trackPH(EVENTS.PAYMENT_FAILED, { auditId, productType: defaultProduct });
                      setError("Payment failed. Please try again.");
                    });
                    rzp.open();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Payment failed. Please try again.");
                  }
                }}
              >
                Pay ₹{finalPrice} with Razorpay
              </Button>
              {error && <p className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
              <p className="mt-3 text-center text-[10px] text-[#9c9184]">
                Instant digital delivery. All sales are final —{" "}
                <Link href="/refund" className="underline hover:text-[#6f675e]">no refunds</Link>.
              </p>
            </Card>

            {/* Discreet unlock-code entry — lets the owner comp people with an admin code */}
            <div className="mt-5 text-center">
              <button onClick={() => setStage("unlock")} className="text-xs text-[#9c9184] underline-offset-2 hover:text-[#6f675e] hover:underline">
                Have an unlock code?
              </button>
            </div>
          </>
        )}

        {/* ─── STAGE: Admin/comp unlock code (standalone) ─── */}
        {stage === "unlock" && (
          <Card className="mb-6">
            <h3 className="mb-4 text-sm font-semibold text-[#1C1917]">Enter Unlock Code</h3>
            <p className="mb-4 text-xs text-[#857b6e]">If you already have an unlock code from the owner/admin, enter it here.</p>
            <div className="space-y-4">
              <div>
                <input type="text" value={unlockCode} onChange={(e) => setUnlockCode(e.target.value)} placeholder="e.g. AURA-XXXXXX" className="w-full rounded-lg border border-[#1c1917]/10 bg-[#1c1917]/[0.04] px-3 py-2 text-sm text-[#1C1917] placeholder-gray-600 focus:border-red-500/50 focus:outline-none" />
              </div>
              {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
              <Button className="w-full" size="lg" onClick={handleUnlock} disabled={unlocking}>
                {unlocking ? "Generating Report..." : `Unlock ${productName} — ${productPriceLabel}`}
              </Button>
            </div>
          </Card>
        )}

        {/* Copy + trust */}
        <div className="space-y-2 text-center text-xs text-[#9c9184]">
          <p>Payments are processed securely by Razorpay (UPI, card, or netbanking). Your report unlocks automatically the moment payment is confirmed — no waiting for a code.</p>
          <p>Your audit stays stored locally in this browser. Your photo and report are never uploaded to a server.</p>
          {supportEmail && <p>For support or code issues, contact: <a href={`mailto:${supportEmail}`} className="text-red-300 hover:underline">{supportEmail}</a></p>}
          <p>AuraCheck analyzes presentation signals, not human worth. Scores are guidance, not objective truth.</p>
        </div>
      </div>
      </Container>
    </>
  );
}

export default function UnlockPage() {
  return (
    <Suspense fallback={<Container className="py-16 text-center"><p className="text-[#857b6e]">Loading...</p></Container>}>
      <UnlockForm />
    </Suspense>
  );
}
