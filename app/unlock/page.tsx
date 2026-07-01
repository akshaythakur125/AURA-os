"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getAuditById, updateAudit } from "@/lib/storage/auditStore";
import { recordUnlock } from "@/lib/storage/unlockStore";
import { createOrder, updateOrder, getOrdersByAuditId } from "@/lib/storage/orderStore";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { validateUnlockCode, getDemoCode, getUpiiId } from "@/lib/payments/manualUnlock";
import { generateUnlockCode } from "@/lib/payments/unlockCodeGenerator";
import { generateFullAuraReport } from "@/lib/aura-engine/generateFullAuraReport";
import { generateStatusArchetype } from "@/lib/aura-engine/archetypes";
import { generateDatingProfileAudit } from "@/lib/aura-engine/generateDatingProfileAudit";
import { generateGlowUpPlan } from "@/lib/aura-engine/generateGlowUpPlan";
import { generateQuickAuraFix } from "@/lib/aura-engine/generateQuickAuraFix";
import type { ProductType } from "@/types";
import type { ManualOrder } from "@/types/order";
import { applyOffer } from "@/lib/offers/applyOffer";
import type { OfferApplyResult } from "@/types/offer";

const PRODUCT_INFO: Record<ProductType, { name: string; price: number; desc: string }> = {
  quick_fix: { name: "Quick Aura Fix", price: 49, desc: "Your biggest status leak and the fastest fix path." },
  aura_report: { name: "Full Aura Report", price: 99, desc: "Deep visual analysis with upgrade roadmap." },
  dating_audit: { name: "Dating/Profile Audit", price: 299, desc: "Profile presentation score, bio feedback, and photo order strategy." },
  glowup_plan: { name: "30-Day Glow-Up Plan", price: 499, desc: "Structured 30-day roadmap with daily missions and budget roadmap." },
};

type Stage = "payment" | "submit" | "unlock";

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

  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [upiTransactionRef, setUpiTransactionRef] = useState("");
  const [userNote, setUserNote] = useState("");
  const [unlockCode, setUnlockCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [offerCodeInput, setOfferCodeInput] = useState("");
  const [offerResult, setOfferResult] = useState<OfferApplyResult | null>(null);
  const [offerError, setOfferError] = useState<string | null>(null);

  useEffect(() => {
    if (product === "quick_fix") trackEvent("quick_fix_unlock_started", { auditId });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const audit = auditId ? getAuditById(auditId) : undefined;
  const upiId = getUpiiId();
  const demoCode = getDemoCode();
  const productInfo = PRODUCT_INFO[product];
  const auditCode = generateUnlockCode(auditId, product);

  const finalAmount = (offerResult?.valid && offerResult.finalAmount >= 0) ? offerResult.finalAmount : productInfo.price;

  const existingOrders = auditId ? getOrdersByAuditId(auditId) : [];
  const foundExisting = existingOrders.find((o) => o.productType === product);
  const initialStage: Stage = foundExisting
    ? (foundExisting.status === "unlocked" || foundExisting.status === "payment_submitted" || foundExisting.status === "code_sent" ? "unlock" : "payment")
    : "payment";
  const [stage, setStage] = useState<Stage>(initialStage);
  const [existingOrder, setExistingOrder] = useState<ManualOrder | undefined>(foundExisting);

  if (!auditId || !audit) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Unlock Report</h1>
          <p className="mb-6 text-sm text-gray-400">No audit specified or audit not found. Create an audit and generate a free score first.</p>
          <Link href="/audit/new"><Button>Start Aura Check</Button></Link>
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
          <Link href={`/audit/${auditId}`}><Button>Back to Audit</Button></Link>
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
          <Link href={`/audit/${auditId}`}><Button>View Audit</Button></Link>
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

  async function handleSavePayment() {
    setSaving(true);
    setError(null);
    try {
      const order = createOrder({
        auditId,
        productType: product,
        productName: productInfo.name,
        amount: productInfo.price,
        originalAmount: productInfo.price,
        discountCode: offerResult?.valid ? offerResult.offer?.code : undefined,
        discountAmount: offerResult?.valid ? offerResult.discountAmount : undefined,
        finalAmount: offerResult?.valid ? offerResult.finalAmount : productInfo.price,
        upiId,
        customerName: customerName.trim() || undefined,
        customerContact: customerContact.trim() || undefined,
        upiTransactionRef: upiTransactionRef.trim() || undefined,
        userNote: userNote.trim() || undefined,
      });
      setExistingOrder(order);
      trackEvent("payment_request_saved", { product, auditId });
      if (product === "quick_fix") trackEvent("quick_fix_payment_request_saved", { auditId });
      setStage("unlock");
    } catch {
      setError("Failed to save payment request.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUnlock() {
    if (!auditId || !audit) return;
    if (!unlockCode.trim()) { setError("Please enter an unlock code."); return; }
    if (!validateUnlockCode(unlockCode, auditId, product)) { setError("Invalid unlock code."); return; }
    setUnlocking(true);
    setError(null);
    try {
      const existingProducts = (audit.unlockedProducts || []) as ProductType[];
      if (existingProducts.includes(product)) { setError("Already unlocked."); setUnlocking(false); return; }

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

      recordUnlock(auditId, product, unlockCode.trim());
      updateAudit(auditId, updateData);
      if (existingOrder) updateOrder(existingOrder.id, { status: "unlocked", unlockedAt: new Date().toISOString() });
      trackEvent("product_unlocked", { product, auditId });
      if (product === "quick_fix") trackEvent("quick_fix_unlocked", { auditId });
      setSuccess(`${productInfo.name} unlocked successfully!`);
      setTimeout(() => router.push(`/audit/${auditId}`), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unlock failed.");
      setUnlocking(false);
    }
  }

  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=AuraCheck&am=${finalAmount}&cu=INR&tn=AuraCheck%20${encodeURIComponent(productInfo.name)}%20${encodeURIComponent(auditId.slice(0, 8))}`;
  const paymentSummary = [
    `I have paid ₹${finalAmount} for ${productInfo.name}.`,
    `Audit ID: ${auditId}`,
    `${customerName ? `Name: ${customerName}` : ""}`,
    `${customerContact ? `Contact: ${customerContact}` : ""}`,
    `${upiTransactionRef ? `UPI Ref: ${upiTransactionRef}` : ""}`,
    `${userNote ? `Note: ${userNote}` : ""}`,
    "Please send my unlock code.",
  ].filter(Boolean).join("\n");
  const copySummary = [
    `AuraCheck Payment Request`,
    `Product: ${productInfo.name}`,
    `Amount: ₹${finalAmount}${offerResult?.valid ? ` (original ₹${productInfo.price}, saved ₹${offerResult.discountAmount})` : ""}`,
    `Audit: ${auditId}`,
    `Customer: ${customerName || "—"}`,
    `Contact: ${customerContact || "—"}`,
    `UPI Ref: ${upiTransactionRef || "—"}`,
    `Status: Payment Submitted`,
  ].join("\n");
  const ownerWhatsApp = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_OWNER_WHATSAPP : "";
  const waUrl = ownerWhatsApp ? `https://wa.me/${ownerWhatsApp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(paymentSummary)}` : "";

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 text-center text-3xl font-bold text-white">
          {product === "quick_fix" ? "Unlock your fastest Aura fix." : `Unlock ${productInfo.name}`}
        </h1>
        <p className="mb-8 text-center text-sm text-gray-400">
          {product === "quick_fix"
            ? "Pay ₹49 manually via UPI and enter your unlock code to reveal the exact fix path."
            : "Manual UPI payment — MVP demo flow"}
        </p>

        {/* ─── Stage Indicator ─── */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {(["payment", "submit", "unlock"] as Stage[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                stage === s ? "bg-purple-500/20 text-purple-300" : stage === "payment" && i <= 1 ? "bg-white/10 text-gray-400" : i === 0 ? "bg-white/10 text-gray-400" : "bg-white/5 text-gray-600"
              }`}>{i + 1}</div>
              <span className={`text-xs ${stage === s ? "text-purple-300" : "text-gray-600"}`}>
                {s === "payment" ? "Pay" : s === "submit" ? "Submit" : "Unlock"}
              </span>
              {i < 2 && <div className="h-px w-6 bg-white/10" />}
            </div>
          ))}
        </div>

        {/* ─── Always: Product Info ─── */}
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

        {/* ─── Stage 1: Payment ─── */}
        {stage === "payment" && (
          <>
            <Card className="mb-6">
              <h3 className="mb-4 text-sm font-semibold text-white">1. Pay via UPI</h3>
              <div className="mb-4 rounded-xl bg-white/5 p-4 text-center">
                <div className="mb-1 text-xs text-gray-500">Pay to this UPI ID</div>
                <div className="text-lg font-bold text-purple-300">{upiId}</div>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(upiId)}>Copy UPI ID</Button>
                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(`₹${finalAmount}`)}>Copy Amount</Button>
                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(`AuraCheck ${productInfo.name} ${auditId.slice(0, 8)}`)}>Copy Payment Note</Button>
                <a href={upiDeepLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="w-full">Open UPI App</Button>
                </a>
              </div>
              <p className="text-xs text-gray-500">Manual MVP payment flow: AuraCheck does not automatically verify UPI payments yet. After payment, submit your details below and send the summary to the owner/admin.</p>
            </Card>

            {/* ─── Offer Code ─── */}
            <Card className="mb-6">
              <h3 className="mb-4 text-sm font-semibold text-white">Have an Offer Code?</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={offerCodeInput}
                  onChange={(e) => setOfferCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none"
                />
                <Button variant="outline" size="sm" onClick={handleApplyOffer}>Apply</Button>
              </div>
              {offerResult?.valid && (
                <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs">
                  <div className="text-emerald-400">{offerResult.message}</div>
                  <div className="mt-1 flex justify-between text-gray-300">
                    <span>Original</span>
                    <span className="line-through text-gray-500">₹{offerResult.originalAmount}</span>
                  </div>
                  <div className="flex justify-between text-emerald-300">
                    <span>You pay</span>
                    <span className="font-bold">₹{offerResult.finalAmount}</span>
                  </div>
                </div>
              )}
              {offerError && (
                <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">{offerError}</div>
              )}
            </Card>

            <Card className="mb-6">
              <h3 className="mb-4 text-sm font-semibold text-white">2. Submit Payment Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Your Name (optional)</label>
                  <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. Ravi" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">WhatsApp / Contact (optional)</label>
                  <input type="text" value={customerContact} onChange={(e) => setCustomerContact(e.target.value)} placeholder="e.g. +91 98765 43210" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">UPI Transaction Ref (optional)</label>
                  <input type="text" value={upiTransactionRef} onChange={(e) => setUpiTransactionRef(e.target.value)} placeholder="e.g. UPI123456789" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Note (optional)</label>
                  <textarea value={userNote} onChange={(e) => setUserNote(e.target.value)} placeholder="Any message for the owner..." className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none" rows={2} />
                </div>
              </div>
            </Card>

            {error && <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

            <Button onClick={handleSavePayment} disabled={saving} className="w-full" size="lg">
              {saving ? "Saving..." : "Save Payment Request"}
            </Button>
          </>
        )}

        {/* ─── Stage 2: Submit & Summary ─── */}
        {stage === "submit" && (
          <>
            <Card className="mb-6 border-emerald-500/20">
              <h3 className="mb-3 text-sm font-semibold text-emerald-400">Payment Details Saved</h3>
              <div className="space-y-2 text-xs text-gray-300">
                <div className="flex justify-between"><span className="text-gray-500">Product</span><span>{productInfo.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Amount</span><span>₹{productInfo.price}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Audit</span><span className="text-purple-300">{auditId}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Customer</span><span>{customerName || "—"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Contact</span><span>{customerContact || "—"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">UPI Ref</span><span>{upiTransactionRef || "—"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status</span><Badge variant="success">Payment Submitted</Badge></div>
              </div>
              <p className="mt-4 text-xs text-gray-500">Send this summary to the owner/admin to receive your unlock code.</p>
            </Card>

            <div className="mb-6 grid grid-cols-2 gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(copySummary)}>Copy Payment Summary</Button>
              <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(auditId)}>Copy Audit ID</Button>
              <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(auditCode)}>Copy Product Code</Button>
              {waUrl ? (
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="col-span-2 sm:col-span-1">
                  <Button variant="outline" size="sm" className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">Send Payment Request on WhatsApp</Button>
                </a>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(paymentSummary)}>Copy Payment Summary</Button>
              )}
            </div>

            <Button onClick={() => setStage("unlock")} variant="outline" className="mb-4 w-full">I Have an Unlock Code — Continue</Button>
          </>
        )}

        {/* ─── Stage 3: Unlock ─── */}
        {stage === "unlock" && (
          <>
            <Card className="mb-6">
              <h3 className="mb-4 text-sm font-semibold text-white">Enter Unlock Code</h3>
              <p className="mb-3 text-xs text-gray-400">Use the demo code <strong className="text-purple-300">{demoCode}</strong> or the code sent by the owner.</p>
              <input
                type="text"
                value={unlockCode}
                onChange={(e) => setUnlockCode(e.target.value)}
                placeholder={`Enter code (e.g. ${demoCode})`}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none"
              />
              {existingOrder && existingOrder.status !== "unlocked" && (
                <p className="mt-2 text-xs text-gray-500">Your payment request is saved. Once the owner sends the code, enter it above.</p>
              )}
            </Card>

            {error && <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
            {success && <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{success}</div>}

            <Button onClick={handleUnlock} disabled={unlocking || success !== null} className="w-full" size="lg">
              {unlocking ? "Generating..." : success ? "Redirecting..." : `Unlock ${productInfo.name} — ₹${productInfo.price}`}
            </Button>

            {!existingOrder && (
              <Button onClick={() => setStage("payment")} variant="ghost" className="mt-3 w-full text-xs">
                &larr; Back to payment details
              </Button>
            )}
          </>
        )}

        {/* ─── Footer ─── */}
        <div className="mt-6 space-y-2 text-center text-xs text-gray-600">
          <p>Manual MVP payment. Payment is not automatically verified.</p>
          <p>Your image stays in this browser.</p>
          <p>No external AI service is used.</p>
          <p className="text-gray-500">AuraCheck analyzes presentation signals, not human worth. Scores are guidance, not objective truth. No guaranteed dating, social, career, or financial outcomes.</p>
          <Link href={`/audit/${auditId}`} className="block text-purple-400 hover:underline">&larr; Back to audit</Link>
        </div>
      </div>
    </Container>
  );
}
