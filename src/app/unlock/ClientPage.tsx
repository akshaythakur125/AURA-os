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
import { generateFullAuraReport } from "@/lib/aura-engine/generateFullAuraReport";
import { generateDatingProfileReport } from "@/lib/aura-engine/datingAudit";
import { generateGlowupPlan } from "@/lib/aura-engine/glowupPlan";
import type { ProductType } from "@/types/payment";
import type { Audit } from "@/types/audit";
import type { OfferApplication } from "@/types/offer";

type UnlockStage = "request" | "submit" | "summary" | "unlock" | "done";

function getUpiId(): string {
  if (typeof process !== "undefined" && process.env && (process.env as Record<string, string | undefined>).NEXT_PUBLIC_MANUAL_UPI_ID) {
    return (process.env as Record<string, string | undefined>).NEXT_PUBLIC_MANUAL_UPI_ID as string;
  }
  return "your-upi-id@upi";
}

function getSupportEmail(): string {
  if (typeof process !== "undefined" && process.env && (process.env as Record<string, string | undefined>).NEXT_PUBLIC_SUPPORT_EMAIL) {
    return (process.env as Record<string, string | undefined>).NEXT_PUBLIC_SUPPORT_EMAIL as string;
  }
  return "support@auracheck.app";
}

function getOwnerWhatsApp(): string | null {
  if (typeof process !== "undefined" && process.env && (process.env as Record<string, string | undefined>).NEXT_PUBLIC_OWNER_WHATSAPP) {
    return (process.env as Record<string, string | undefined>).NEXT_PUBLIC_OWNER_WHATSAPP as string;
  }
  return null;
}

const PRODUCT_FEATURES: Record<string, string[]> = {
  aura_report: [
    "Full visual breakdown across 7 dimensions",
    "Detailed photo-quality issues with personalized fixes",
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
    productParam === "dating_audit" || productParam === "glowup_plan" ? productParam : "aura_report";

  const [stage, setStage] = useState<UnlockStage>("request");
  const [unlockCode, setUnlockCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [userNote, setUserNote] = useState("");
  const [upiTxRef, setUpiTxRef] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [offerCode, setOfferCode] = useState("");
  const [offerResult, setOfferResult] = useState<OfferApplication | null>(null);

  const audit = typeof window !== "undefined" && auditId ? getAuditById(auditId) : undefined;
  const productName = getProductName(defaultProduct);
  const productPrice = getProductPrice(defaultProduct);
  const productPriceLabel = getProductPriceLabel(defaultProduct);
  const finalPrice = offerResult?.isValid ? offerResult.finalAmount : productPrice;
  const finalPriceLabel = offerResult?.isValid && offerResult.finalAmount !== productPrice ? `₹${offerResult.finalAmount}` : productPriceLabel;
  const features = PRODUCT_FEATURES[defaultProduct] || PRODUCT_FEATURES.aura_report;
  const upiId = getUpiId();
  const supportEmail = getSupportEmail();
  const ownerWhatsApp = getOwnerWhatsApp();

  const isAlreadyUnlocked = audit?.unlockedProducts?.includes(defaultProduct);

  const missingDatingText = defaultProduct === "dating_audit" && (!audit?.profileTexts?.bio || audit.profileTexts.bio.trim() === "");
  const missingGlowupData = defaultProduct === "glowup_plan" && (!audit?.imageDataUrl && !audit?.fullReport?.freeResult?.imageMetrics);
  const cannotGenerate = (defaultProduct === "dating_audit" && missingDatingText) || (defaultProduct === "glowup_plan" && missingGlowupData);

  function buildUpiDeepLink(): string {
    const base = "upi://pay";
    const params = new URLSearchParams();
    params.set("pa", upiId);
    params.set("pn", "AuraCheck");
    params.set("am", String(finalPrice));
    params.set("cu", "INR");
    params.set("tn", `AuraCheck ${productName} ${auditId.slice(0, 8)}`);
    return `${base}?${params.toString()}`;
  }

  function buildPaymentNote(): string {
    return `AuraCheck ${productName}\nAmount: ${finalPriceLabel}\nAudit: ${auditId.slice(0, 8)}...\nUPI: ${upiId}`;
  }

  function buildPaymentSummary(): string {
    const lines = [
      `Product: ${productName}`,
      `Amount: ${finalPriceLabel}`,
      `Audit ID: ${auditId}`,
      `UPI ID: ${upiId}`,
    ];
    if (offerResult?.isValid && offerResult.finalAmount !== productPrice) {
      lines.push(`Discount: ${offerResult.code} — You pay ₹${offerResult.finalAmount} (was ₹${productPrice})`);
    }
    if (customerName) lines.push(`Name: ${customerName}`);
    if (customerContact) lines.push(`Contact: ${customerContact}`);
    if (upiTxRef) lines.push(`UPI Ref: ${upiTxRef}`);
    if (userNote) lines.push(`Note: ${userNote}`);
    lines.push(`Status: Payment Submitted`);
    return lines.join("\n");
  }

  function buildWhatsAppSummary(): string {
    return encodeURIComponent(
      `AuraCheck Payment Request\n\nProduct: ${productName}\nAmount: ${finalPriceLabel}\nAudit ID: ${auditId}\n${offerResult?.isValid && offerResult.finalAmount !== productPrice ? `Discount: ${offerResult.code} — Pay ₹${offerResult.finalAmount}\n` : ""}${customerName ? `Name: ${customerName}\n` : ""}${customerContact ? `Contact: ${customerContact}\n` : ""}${upiTxRef ? `UPI Ref: ${upiTxRef}\n` : ""}${userNote ? `Note: ${userNote}\n` : ""}\nStatus: Payment Submitted`
    );
  }

  function handleCopy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

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

  async function handleSavePaymentRequest() {
    if (!audit || !auditId) return;
    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType: defaultProduct,
          offerCode: offerResult?.isValid ? offerResult.code : undefined,
          customerName,
          customerContact,
          userNote,
          auditId,
        }),
      });
      const orderData = await orderRes.json();
      const order = createOrder({
        auditId,
        productType: defaultProduct,
        customerName: customerName.trim() || undefined,
        customerContact: customerContact.trim() || undefined,
        userNote: userNote.trim() || undefined,
        offerCode: orderData.appliedOffer || undefined,
        originalAmount: orderData.originalAmount,
        discountAmount: orderData.discountAmount,
        finalAmount: orderData.finalAmount,
      });
      const withRef = order.upiTransactionRef !== upiTxRef.trim() ? { ...order, upiTransactionRef: upiTxRef.trim() || undefined } : order;
      if (withRef.upiTransactionRef !== order.upiTransactionRef) {
        updateOrder(order.id, withRef);
      }
      setOrderId(order.id);
      trackEvent({ eventName: "payment_request_saved", auditId, productType: defaultProduct });
      setStage("summary");
    } catch {
      setError("Failed to create order. Please try again.");
    }
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
      if (orderId) updateOrder(orderId, { status: "unlocked", generatedUnlockCode: unlockCode.trim(), unlockedAt: new Date().toISOString() });

      const updates: Record<string, unknown> = {};
      updates.unlockedProducts = [...(audit.unlockedProducts || []), defaultProduct];

      if (defaultProduct === "aura_report") {
        const fullContent = await generateFullAuraReport(audit);
        updates.fullScore = fullContent.fullScore;
        updates.reportStatus = "unlocked";
        updates.unlockStatus = "unlocked";
        updates.fullReport = audit.fullReport
          ? { ...audit.fullReport, score: { ...audit.fullReport.score, overall: fullContent.fullScore }, isPremium: true, fullContent }
          : { id: `${auditId}-report`, auditId, score: { overall: fullContent.fullScore, categories: { visual: fullContent.visualBreakdown.lighting, presentation: fullContent.visualBreakdown.clarity, signals: fullContent.visualBreakdown.colorSignal, cohesion: fullContent.visualBreakdown.overallConsistency } }, leaks: [], suggestions: [], summary: fullContent.detailedVerdict, createdAt: fullContent.generatedAt, isPremium: true, fullContent };
      } else if (defaultProduct === "dating_audit") {
        updates.datingProfileReport = generateDatingProfileReport(audit);
        updates.reportStatus = audit.reportStatus === "draft" ? "free_generated" : audit.reportStatus;
      } else if (defaultProduct === "glowup_plan") {
        updates.glowupPlan = generateGlowupPlan(audit);
        updates.reportStatus = audit.reportStatus === "draft" ? "free_generated" : audit.reportStatus;
      }
      updateAudit(auditId, updates as Partial<Audit>);
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
                        const updates: Record<string, unknown> = {};
                        updates.unlockedProducts = [...(audit?.unlockedProducts || []), defaultProduct];
                        if (defaultProduct === "aura_report") {
                          const fullContent = await generateFullAuraReport(audit!);
                          updates.fullScore = fullContent.fullScore;
                          updates.reportStatus = "unlocked";
                          updates.unlockStatus = "unlocked";
                          updates.fullReport = audit!.fullReport
                            ? { ...audit!.fullReport, score: { ...audit!.fullReport.score, overall: fullContent.fullScore }, isPremium: true, fullContent }
                            : { id: `${auditId}-report`, auditId, score: { overall: fullContent.fullScore, categories: { visual: fullContent.visualBreakdown.lighting, presentation: fullContent.visualBreakdown.clarity, signals: fullContent.visualBreakdown.colorSignal, cohesion: fullContent.visualBreakdown.overallConsistency } }, leaks: [], suggestions: [], summary: fullContent.detailedVerdict, createdAt: fullContent.generatedAt, isPremium: true, fullContent };
                        } else if (defaultProduct === "dating_audit") {
                          updates.datingProfileReport = generateDatingProfileReport(audit!);
                        } else if (defaultProduct === "glowup_plan") {
                          updates.glowupPlan = generateGlowupPlan(audit!);
                        }
                        updateAudit(auditId, updates as Partial<Audit>);
                        trackEvent({ eventName: "product_unlocked", auditId, productType: defaultProduct });
                        setStage("done");
                        setTimeout(() => router.push(`/audit/${auditId}`), 1500);
                      },
                      prefill: { name: customerName, contact: customerContact },
                      theme: { color: "#e11d48" },
                    });
                    rzp.on("payment.failed", () => setError("Payment failed. Please try again."));
                    rzp.open();
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Payment failed. Please try again.");
                  }
                }}
              >
                Pay ₹{finalPrice} with Razorpay
              </Button>
              {error && <p className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
            </Card>

            {/* Discreet unlock-code entry — lets the owner comp people with an admin code */}
            <div className="mt-5 text-center">
              <button onClick={() => setStage("unlock")} className="text-xs text-[#9c9184] underline-offset-2 hover:text-[#6f675e] hover:underline">
                Have an unlock code?
              </button>
            </div>
          </>
        )}

        {/* ─── STAGE 2: Submit Payment Details ─── */}
        {stage === "submit" && (
          <Card className="mb-6">
            <h3 className="mb-4 text-sm font-semibold text-[#1C1917]">Submit Payment Details</h3>
            {offerResult?.isValid && offerResult.finalAmount !== productPrice && (
              <div className="mb-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
                Offer {offerResult.code} applied: {productPriceLabel} → <span className="font-bold">{finalPriceLabel}</span>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-[#857b6e]">Your Name <span className="text-[#9c9184]">(optional)</span></label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Rahul" className="w-full rounded-lg border border-[#1c1917]/10 bg-[#1c1917]/[0.04] px-3 py-2 text-sm text-[#1C1917] placeholder-gray-600 focus:border-red-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#857b6e]">WhatsApp / Contact <span className="text-[#9c9184]">(optional)</span></label>
                <input type="text" value={customerContact} onChange={(e) => setCustomerContact(e.target.value)} placeholder="e.g. +91 98765 43210" className="w-full rounded-lg border border-[#1c1917]/10 bg-[#1c1917]/[0.04] px-3 py-2 text-sm text-[#1C1917] placeholder-gray-600 focus:border-red-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#857b6e]">UPI Transaction Reference <span className="text-[#9c9184]">(optional)</span></label>
                <input type="text" value={upiTxRef} onChange={(e) => setUpiTxRef(e.target.value)} placeholder="e.g. UPI123456789" className="w-full rounded-lg border border-[#1c1917]/10 bg-[#1c1917]/[0.04] px-3 py-2 text-sm text-[#1C1917] placeholder-gray-600 focus:border-red-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#857b6e]">Note <span className="text-[#9c9184]">(optional)</span></label>
                <textarea value={userNote} onChange={(e) => setUserNote(e.target.value)} placeholder="Any additional information for the owner..." className="w-full rounded-lg border border-[#1c1917]/10 bg-[#1c1917]/[0.04] px-3 py-2 text-sm text-[#1C1917] placeholder-gray-600 focus:border-red-500/50 focus:outline-none" rows={2} />
              </div>

              {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}

              <Button className="w-full" size="lg" onClick={handleSavePaymentRequest}>
                Save Payment Request
              </Button>

              <div className="flex justify-center">
                <button onClick={() => setStage("request")} className="text-xs text-[#857b6e] hover:text-[#4a443d]">Back to payment details</button>
              </div>
            </div>
          </Card>
        )}

        {/* ─── STAGE: Payment Summary (after submit) ─── */}
        {stage === "summary" && (
          <>
            <Card className="mb-6 border-emerald-500/20">
              <Badge variant="success" className="mb-3">Payment Submitted</Badge>
              <h3 className="mb-4 text-sm font-semibold text-[#1C1917]">Payment Request Summary</h3>
              <div className="space-y-3 rounded-xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.03] p-4">
                <div className="flex justify-between text-sm"><span className="text-[#857b6e]">Product</span><span className="text-[#1C1917]">{productName}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#857b6e]">Amount</span><span className="text-amber-400">{finalPriceLabel}</span></div>
              {offerResult?.isValid && offerResult.finalAmount !== productPrice && (
                <div className="flex justify-between text-sm"><span className="text-[#857b6e]">Original</span><span className="text-[#857b6e] line-through">{productPriceLabel}</span></div>
              )}
              {offerResult?.isValid && offerResult.finalAmount !== productPrice && (
                <div className="flex justify-between text-sm"><span className="text-[#857b6e]">Discount</span><span className="text-emerald-400">-₹{offerResult.discountAmount}</span></div>
              )}
                <div className="flex justify-between text-sm"><span className="text-[#857b6e]">Audit ID</span><span className="text-[#1C1917] text-xs truncate max-w-[200px]">{auditId}</span></div>
                {customerName && <div className="flex justify-between text-sm"><span className="text-[#857b6e]">Name</span><span className="text-[#1C1917]">{customerName}</span></div>}
                {customerContact && <div className="flex justify-between text-sm"><span className="text-[#857b6e]">Contact</span><span className="text-[#1C1917]">{customerContact}</span></div>}
                {upiTxRef && <div className="flex justify-between text-sm"><span className="text-[#857b6e]">UPI Ref</span><span className="text-[#1C1917]">{upiTxRef}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-[#857b6e]">Status</span><Badge variant="success">Payment Submitted</Badge></div>
              </div>
              <p className="mt-4 text-xs text-[#857b6e]">Send this summary to the owner/admin to receive your unlock code.</p>
            </Card>

            <div className="mb-6 flex flex-wrap gap-3">
              <Button size="sm" variant="secondary" onClick={() => handleCopy(buildPaymentSummary(), "summary")}>
                {copied === "summary" ? "Copied!" : "Copy Payment Summary"}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleCopy(auditId, "audit2")}>
                {copied === "audit2" ? "Copied!" : "Copy Audit ID"}
              </Button>
              {ownerWhatsApp && (
                <a href={`https://wa.me/${ownerWhatsApp.replace(/[^0-9]/g, "")}?text=${buildWhatsAppSummary()}`} target="_blank" rel="noopener noreferrer">
                  <Button size="sm">Send on WhatsApp</Button>
                </a>
              )}
            </div>

            <Card className="mb-6">
              <h3 className="mb-4 text-sm font-semibold text-[#1C1917]">Step 3: Enter Unlock Code</h3>
              <p className="mb-4 text-xs text-[#857b6e]">Once the owner/admin sends you an unlock code, enter it below.</p>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs text-[#857b6e]">Unlock Code <span className="text-red-400">*</span></label>
                  <input type="text" value={unlockCode} onChange={(e) => setUnlockCode(e.target.value)} placeholder="e.g. AURA-XXXXXX" className="w-full rounded-lg border border-[#1c1917]/10 bg-[#1c1917]/[0.04] px-3 py-2 text-sm text-[#1C1917] placeholder-gray-600 focus:border-red-500/50 focus:outline-none" />
                </div>
                {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
                <Button className="w-full" size="lg" onClick={handleUnlock} disabled={unlocking}>
                {unlocking ? "Generating Report..." : `Unlock ${productName} — ${finalPriceLabel}`}
                </Button>
              </div>
            </Card>
          </>
        )}

        {/* ─── STAGE 3: Unlock (standalone when user already has code) ─── */}
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
          <p>For support or code issues, contact: <a href={`mailto:${supportEmail}`} className="text-red-300 hover:underline">{supportEmail}</a></p>
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
