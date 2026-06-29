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
import { createOrder, updateOrder } from "@/lib/storage/orderStore";
import { validateUnlockCode, getProductName, getProductPrice, getProductPriceLabel } from "@/lib/payments/manualUnlock";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { generateFullAuraReport } from "@/lib/aura-engine/generateFullAuraReport";
import { generateDatingProfileReport } from "@/lib/aura-engine/datingAudit";
import { generateGlowupPlan } from "@/lib/aura-engine/glowupPlan";
import type { ProductType } from "@/types/payment";
import type { Audit } from "@/types/audit";

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

  const audit = typeof window !== "undefined" && auditId ? getAuditById(auditId) : undefined;
  const productName = getProductName(defaultProduct);
  const productPrice = getProductPrice(defaultProduct);
  const productPriceLabel = getProductPriceLabel(defaultProduct);
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
    params.set("am", String(productPrice));
    params.set("cu", "INR");
    params.set("tn", `AuraCheck ${productName} ${auditId.slice(0, 8)}`);
    return `${base}?${params.toString()}`;
  }

  function buildPaymentNote(): string {
    return `AuraCheck ${productName}\nAmount: ${productPriceLabel}\nAudit: ${auditId.slice(0, 8)}...\nUPI: ${upiId}`;
  }

  function buildPaymentSummary(): string {
    const lines = [
      `Product: ${productName}`,
      `Amount: ${productPriceLabel}`,
      `Audit ID: ${auditId}`,
      `UPI ID: ${upiId}`,
    ];
    if (customerName) lines.push(`Name: ${customerName}`);
    if (customerContact) lines.push(`Contact: ${customerContact}`);
    if (upiTxRef) lines.push(`UPI Ref: ${upiTxRef}`);
    if (userNote) lines.push(`Note: ${userNote}`);
    lines.push(`Status: Payment Submitted`);
    return lines.join("\n");
  }

  function buildWhatsAppSummary(): string {
    return encodeURIComponent(
      `AuraCheck Payment Request\n\nProduct: ${productName}\nAmount: ${productPriceLabel}\nAudit ID: ${auditId}\n${customerName ? `Name: ${customerName}\n` : ""}${customerContact ? `Contact: ${customerContact}\n` : ""}${upiTxRef ? `UPI Ref: ${upiTxRef}\n` : ""}${userNote ? `Note: ${userNote}\n` : ""}\nStatus: Payment Submitted`
    );
  }

  function handleCopy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleSavePaymentRequest() {
    if (!audit || !auditId) return;
    const order = createOrder({
      auditId,
      productType: defaultProduct,
      customerName: customerName.trim() || undefined,
      customerContact: customerContact.trim() || undefined,
      userNote: userNote.trim() || undefined,
    });
    const withRef = order.upiTransactionRef !== upiTxRef.trim() ? { ...order, upiTransactionRef: upiTxRef.trim() || undefined } : order;
    if (withRef.upiTransactionRef !== order.upiTransactionRef) {
      updateOrder(order.id, withRef);
    }
    setOrderId(order.id);
    trackEvent({ eventName: "payment_request_saved", auditId, productType: defaultProduct });
    setStage("summary");
  }

  async function handleUnlock() {
    if (!audit || !auditId) return;
    setError(null);
    if (!unlockCode.trim()) { setError("Please enter your unlock code."); return; }
    setUnlocking(true);
    try {
      const valid = validateUnlockCode({ code: unlockCode, auditId, productType: defaultProduct });
      if (!valid) {
        setError("Invalid unlock code. Please check your code and try again.");
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
          <p className="mb-2 text-lg text-gray-300">No audit selected</p>
          <p className="mb-6 text-sm text-gray-500">Please create an audit first and generate a free score before unlocking.</p>
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
          <p className="mb-2 text-lg text-gray-300">Audit not found</p>
          <p className="mb-6 text-sm text-gray-500">This audit does not exist or may have been deleted.</p>
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
          <p className="mb-2 text-lg text-white">Already Unlocked</p>
          <p className="mb-6 text-sm text-gray-500">This product has already been unlocked for this audit.</p>
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
          <p className="mb-2 text-lg text-gray-300">Cannot Generate {productName}</p>
          <p className="mb-6 text-sm text-gray-500">{msg}</p>
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
          <p className="mb-2 text-lg text-white">Report Unlocked!</p>
          <p className="text-sm text-gray-500">Redirecting to your report...</p>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="mb-6">
        <Link href={`/audit/${auditId}`} className="text-sm text-gray-500 hover:text-gray-300">&larr; Back to Report</Link>
      </div>

      <div className="mx-auto max-w-2xl">
        {/* Product Info Card */}
        <Card className="mb-6">
          <Badge variant="premium" className="mb-3">{productName}</Badge>
          <h1 className="mb-2 text-2xl font-bold text-white">Unlock {productName}</h1>
          <p className="mb-6 text-sm text-gray-400">One-time payment of <span className="text-amber-400">{productPriceLabel}</span></p>
          <ul className="mb-6 space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-gray-300">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {f}
              </li>
            ))}
          </ul>
        </Card>

        {/* Stage progress indicator */}
        <div className="mb-6 flex items-center justify-center gap-2 text-xs">
          {["request", "submit", "unlock"].map((s, i) => {
            const stageNames = ["request", "submit", "unlock"];
            const mapped: string = stage;
            const activeStage = mapped === "summary" ? "submit" : mapped === "done" ? "unlock" : mapped;
            const currentIdx = stageNames.indexOf(activeStage);
            const isDone = i < currentIdx;
            const isActive = i === currentIdx;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium ${isDone ? "bg-emerald-500/30 text-emerald-300" : isActive ? "bg-purple-600 text-white" : "bg-white/5 text-gray-600"}`}>
                  {isDone ? "✓" : i + 1}
                </div>
                <span className={`${isActive ? "text-white" : isDone ? "text-emerald-400" : "text-gray-600"}`}>
                  {s === "request" ? "Pay" : s === "submit" ? "Submit" : "Unlock"}
                </span>
                {i < 2 && <div className={`mx-1 h-px w-6 ${isDone || (isActive && i === 0) ? "bg-emerald-500/40" : "bg-white/5"}`} />}
              </div>
            );
          })}
        </div>

        {/* ─── STAGE 1: Payment Request ─── */}
        {stage === "request" && (
          <>
            <Card className="mb-6">
              <h3 className="mb-4 text-sm font-semibold text-white">Step 1: Pay via UPI</h3>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <p className="mb-2 text-xs text-gray-500">Send <span className="text-amber-400">{productPriceLabel}</span> to:</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-lg text-purple-300">{upiId}</p>
                  <button onClick={() => handleCopy(upiId, "upi")} className="shrink-0 rounded-lg border border-white/10 px-2.5 py-1 text-xs text-gray-400 hover:border-purple-500/30 hover:text-purple-300">
                    {copied === "upi" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
                  <div className="text-xs text-gray-500">Amount</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-lg font-bold text-amber-400">{productPriceLabel}</span>
                    <button onClick={() => handleCopy(productPriceLabel, "amount")} className="text-xs text-gray-500 hover:text-purple-300">
                      {copied === "amount" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
                <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
                  <div className="text-xs text-gray-500">Audit ID</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm text-white truncate">{auditId.slice(0, 12)}...</span>
                    <button onClick={() => handleCopy(auditId, "audit")} className="text-xs text-gray-500 hover:text-purple-300">
                      {copied === "audit" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <a href={buildUpiDeepLink()} target="_blank" rel="noopener noreferrer">
                  <Button size="sm">Open UPI App</Button>
                </a>
                <Button variant="secondary" size="sm" onClick={() => handleCopy(buildPaymentNote(), "note")}>
                  {copied === "note" ? "Copied!" : "Copy Payment Note"}
                </Button>
              </div>

              <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-center">
                <p className="text-xs text-gray-500">QR code can be added later. For now, copy UPI ID or use the UPI app button above.</p>
              </div>
            </Card>

            <Card className="mb-6">
              <h3 className="mb-4 text-sm font-semibold text-white">Step 2: After Payment</h3>
              <p className="text-sm text-gray-400">After you have sent the payment, click below to submit your payment details and request an unlock code.</p>
            </Card>

            <div className="flex justify-center">
              <Button size="lg" onClick={() => setStage("submit")}>
                I Have Paid — Submit Details
              </Button>
            </div>

            <div className="mt-6 rounded-xl border border-amber-500/10 bg-amber-500/5 p-4 text-center text-xs text-gray-400">
              <p className="mb-1 font-medium text-amber-300">Manual MVP Payment Flow</p>
              <p>AuraCheck does not automatically verify UPI payments yet. After payment, send your payment summary to the owner/admin and enter the unlock code you receive.</p>
            </div>
          </>
        )}

        {/* ─── STAGE 2: Submit Payment Details ─── */}
        {stage === "submit" && (
          <Card className="mb-6">
            <h3 className="mb-4 text-sm font-semibold text-white">Submit Payment Details</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Your Name <span className="text-gray-600">(optional)</span></label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Rahul" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">WhatsApp / Contact <span className="text-gray-600">(optional)</span></label>
                <input type="text" value={customerContact} onChange={(e) => setCustomerContact(e.target.value)} placeholder="e.g. +91 98765 43210" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">UPI Transaction Reference <span className="text-gray-600">(optional)</span></label>
                <input type="text" value={upiTxRef} onChange={(e) => setUpiTxRef(e.target.value)} placeholder="e.g. UPI123456789" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Note <span className="text-gray-600">(optional)</span></label>
                <textarea value={userNote} onChange={(e) => setUserNote(e.target.value)} placeholder="Any additional information for the owner..." className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none" rows={2} />
              </div>

              {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}

              <Button className="w-full" size="lg" onClick={handleSavePaymentRequest}>
                Save Payment Request
              </Button>

              <div className="flex justify-center">
                <button onClick={() => setStage("request")} className="text-xs text-gray-500 hover:text-gray-300">Back to payment details</button>
              </div>
            </div>
          </Card>
        )}

        {/* ─── STAGE: Payment Summary (after submit) ─── */}
        {stage === "summary" && (
          <>
            <Card className="mb-6 border-emerald-500/20">
              <Badge variant="success" className="mb-3">Payment Submitted</Badge>
              <h3 className="mb-4 text-sm font-semibold text-white">Payment Request Summary</h3>
              <div className="space-y-3 rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Product</span><span className="text-white">{productName}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Amount</span><span className="text-amber-400">{productPriceLabel}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Audit ID</span><span className="text-white text-xs truncate max-w-[200px]">{auditId}</span></div>
                {customerName && <div className="flex justify-between text-sm"><span className="text-gray-500">Name</span><span className="text-white">{customerName}</span></div>}
                {customerContact && <div className="flex justify-between text-sm"><span className="text-gray-500">Contact</span><span className="text-white">{customerContact}</span></div>}
                {upiTxRef && <div className="flex justify-between text-sm"><span className="text-gray-500">UPI Ref</span><span className="text-white">{upiTxRef}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><Badge variant="success">Payment Submitted</Badge></div>
              </div>
              <p className="mt-4 text-xs text-gray-500">Send this summary to the owner/admin to receive your unlock code.</p>
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
              <h3 className="mb-4 text-sm font-semibold text-white">Step 3: Enter Unlock Code</h3>
              <p className="mb-4 text-xs text-gray-500">Once the owner/admin sends you an unlock code, enter it below.</p>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Unlock Code <span className="text-red-400">*</span></label>
                  <input type="text" value={unlockCode} onChange={(e) => setUnlockCode(e.target.value)} placeholder="e.g. AURA-XXXXXX" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none" />
                  <p className="mt-1 text-xs text-gray-600">Demo code: <span className="font-mono text-purple-300">AURADEMO</span></p>
                </div>
                {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
                <Button className="w-full" size="lg" onClick={handleUnlock} disabled={unlocking}>
                  {unlocking ? "Generating Report..." : `Unlock ${productName} — ${productPriceLabel}`}
                </Button>
              </div>
            </Card>
          </>
        )}

        {/* ─── STAGE 3: Unlock (standalone when user already has code) ─── */}
        {stage === "unlock" && (
          <Card className="mb-6">
            <h3 className="mb-4 text-sm font-semibold text-white">Enter Unlock Code</h3>
            <p className="mb-4 text-xs text-gray-500">If you already have an unlock code from the owner/admin, enter it here.</p>
            <div className="space-y-4">
              <div>
                <input type="text" value={unlockCode} onChange={(e) => setUnlockCode(e.target.value)} placeholder="e.g. AURA-XXXXXX" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none" />
                <p className="mt-1 text-xs text-gray-600">Demo code: <span className="font-mono text-purple-300">AURADEMO</span></p>
              </div>
              {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
              <Button className="w-full" size="lg" onClick={handleUnlock} disabled={unlocking}>
                {unlocking ? "Generating Report..." : `Unlock ${productName} — ${productPriceLabel}`}
              </Button>
            </div>
          </Card>
        )}

        {/* Copy + trust */}
        <div className="space-y-2 text-center text-xs text-gray-600">
          <p>Manual MVP payment flow: AuraCheck does not automatically verify UPI payments yet. After payment, send your payment summary to the owner/admin and enter the unlock code you receive.</p>
          <p>Your audit remains stored locally in this browser. No image or report is uploaded to a server in this MVP.</p>
          <p>For support or code issues, contact: <a href={`mailto:${supportEmail}`} className="text-purple-300 hover:underline">{supportEmail}</a></p>
          <p>AuraCheck analyzes presentation signals, not human worth. Scores are guidance, not objective truth.</p>
        </div>
      </div>
    </Container>
  );
}

export default function UnlockPage() {
  return (
    <Suspense fallback={<Container className="py-16 text-center"><p className="text-gray-500">Loading...</p></Container>}>
      <UnlockForm />
    </Suspense>
  );
}
