"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getAuditById, updateAudit } from "@/lib/storage/auditStore";
import { recordUnlock } from "@/lib/storage/unlockStore";
import { validateUnlockCode, getDemoCode, getUpiiId, generateAuditSpecificCode } from "@/lib/payments/manualUnlock";
import { generateFullAuraReport } from "@/lib/aura-engine/generateFullAuraReport";
import { generateStatusArchetype } from "@/lib/aura-engine/archetypes";
import { generateDatingProfileAudit } from "@/lib/aura-engine/generateDatingProfileAudit";
import { generateGlowUpPlan } from "@/lib/aura-engine/generateGlowUpPlan";
import type { ProductType } from "@/types";

const PRODUCT_INFO: Record<ProductType, { name: string; price: number; desc: string }> = {
  aura_report: { name: "Full Aura Report", price: 99, desc: "Deep visual analysis with upgrade roadmap." },
  dating_audit: { name: "Dating/Profile Audit", price: 299, desc: "Profile presentation score, bio feedback, and photo order strategy." },
  glowup_plan: { name: "30-Day Glow-Up Plan", price: 499, desc: "Structured 30-day roadmap with daily missions and budget roadmap." },
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
  const product = (productParam === "dating_audit" || productParam === "glowup_plan" ? productParam : "aura_report") as ProductType;

  const [transactionRef, setTransactionRef] = useState("");
  const [unlockCode, setUnlockCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  const audit = auditId ? getAuditById(auditId) : undefined;
  const upiId = getUpiiId();
  const demoCode = getDemoCode();

  const productInfo = PRODUCT_INFO[product];
  const auditCode = auditId ? generateAuditSpecificCode(auditId, product) : "";

  async function handleUnlock() {
    if (!auditId || !audit) {
      setError("Audit not found.");
      return;
    }
    if (!unlockCode.trim()) {
      setError("Please enter an unlock code.");
      return;
    }
    if (!validateUnlockCode(unlockCode, auditId, product)) {
      setError("Invalid unlock code. Please check and try again.");
      return;
    }
    setUnlocking(true);
    setError(null);
    try {
      const existingProduct = (audit.unlockedProducts || []) as ProductType[];
      if (existingProduct.includes(product)) {
        setError("This product is already unlocked.");
        setUnlocking(false);
        return;
      }
      const newUnlocked = [...new Set([...existingProduct, product])];

      const updateData: Record<string, unknown> = {
        unlockedProducts: newUnlocked,
      };

      if (product === "aura_report") {
        const report = await generateFullAuraReport(audit.imageDataUrl, audit.freeResult, audit);
        let personalization = audit.personalization;
        if (!personalization && audit.freeResult) {
          personalization = generateStatusArchetype(audit, audit.freeResult.imageMetrics);
        }
        updateData.fullReport = report;
        updateData.fullScore = report.fullScore;
        updateData.personalization = personalization;
        updateData.reportStatus = "full_report";
      } else if (product === "dating_audit" && audit.freeResult) {
        const datingReport = generateDatingProfileAudit(audit);
        updateData.datingProfileReport = datingReport;
      } else if (product === "glowup_plan" && audit.freeResult) {
        const glowupPlan = generateGlowUpPlan(audit, audit.freeResult.imageMetrics);
        updateData.glowupPlan = glowupPlan;
      }

      recordUnlock(auditId, product, unlockCode.trim(), transactionRef.trim() || undefined);
      updateAudit(auditId, updateData);
      setSuccess(`${productInfo.name} unlocked successfully!`);
      setTimeout(() => {
        router.push(`/audit/${auditId}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unlock failed. Please try again.");
      setUnlocking(false);
    }
  }

  if (!auditId || !audit) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Unlock Report</h1>
          <p className="mb-6 text-sm text-gray-400">
            No audit specified or audit not found. Create an audit and generate a free score first.
          </p>
          <Link href="/audit/new">
            <Button>Start Aura Check</Button>
          </Link>
        </div>
      </Container>
    );
  }

  if (!audit.freeResult) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Unlock {productInfo.name}</h1>
          <p className="mb-6 text-sm text-gray-400">
            Generate a free Aura Score first before unlocking products.
          </p>
          <Link href={`/audit/${auditId}`}>
            <Button>Back to Audit</Button>
          </Link>
        </div>
      </Container>
    );
  }

  const alreadyUnlockedProduct = (audit.unlockedProducts || []).includes(product);
  if (alreadyUnlockedProduct) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Already Unlocked</h1>
          <p className="mb-6 text-sm text-gray-400">
            This product is already unlocked.
          </p>
          <Link href={`/audit/${auditId}`}>
            <Button>View Audit</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 text-center text-3xl font-bold text-white">Unlock {productInfo.name}</h1>
        <p className="mb-8 text-center text-sm text-gray-400">
          Manual UPI payment — MVP demo flow
        </p>

        {/* ─── Product Info ─── */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">{productInfo.name}</h2>
              <p className="text-xs text-gray-500">
                Audit: {audit.id.slice(0, 8)}...
              </p>
            </div>
            <span className="text-2xl font-bold text-amber-400">₹{productInfo.price}</span>
          </div>
          <p className="mt-2 text-xs text-gray-400">{productInfo.desc}</p>
        </Card>

        {/* ─── Steps ─── */}
        <Card className="mb-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Steps to unlock</h3>
          <ol className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-xs text-purple-300">1</span>
              <span>Pay <strong className="text-white">₹{productInfo.price}</strong> via UPI to <strong className="text-purple-300">{upiId}</strong></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-xs text-purple-300">2</span>
              <span>Send payment reference to the owner (optional but recommended)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-xs text-purple-300">3</span>
              <span>Enter the unlock code you received after payment, or use demo code <strong className="text-purple-300">{demoCode}</strong></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-xs text-purple-300">4</span>
              <span>Your specific code for this product: <strong className="text-purple-300">{auditCode}</strong></span>
            </li>
          </ol>
        </Card>

        {/* ─── UPI ID Display ─── */}
        <Card className="mb-6">
          <div className="text-center">
            <div className="mb-2 text-xs text-gray-500">Pay to this UPI ID</div>
            <div className="rounded-xl bg-white/5 px-4 py-3 text-lg font-bold text-purple-300">
              {upiId}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(upiId)}
              className="mt-2 text-xs text-gray-500 hover:text-gray-300"
            >
              Copy UPI ID
            </button>
          </div>
        </Card>

        {/* ─── Inputs ─── */}
        <Card className="mb-6">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">UPI Transaction Reference (optional)</label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. UPI123456789"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Unlock Code *</label>
              <input
                type="text"
                value={unlockCode}
                onChange={(e) => setUnlockCode(e.target.value)}
                placeholder={`Enter code (e.g. ${demoCode})`}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {/* ─── Error / Success ─── */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        )}

        {/* ─── Submit ─── */}
        <Button
          onClick={handleUnlock}
          disabled={unlocking || success !== null}
          className="w-full"
          size="lg"
        >
          {unlocking ? "Generating..." : success ? "Redirecting..." : `Unlock ${productInfo.name} — ₹${productInfo.price}`}
        </Button>

        {/* ─── Footer ─── */}
        <div className="mt-6 space-y-2 text-center text-xs text-gray-600">
          <p>This is a manual MVP unlock flow. It is not production-grade payment.</p>
          <p>No automatic payment verification. Reports unlock via code entry.</p>
          <p>All data stays local in your browser.</p>
          <p className="text-gray-500">Profile guidance is for presentation clarity, not dating guarantees. Glow-up plan is self-improvement guidance, not a guarantee of social outcomes.</p>
          <Link href={`/audit/${auditId}`} className="block text-purple-400 hover:underline">
            &larr; Back to audit
          </Link>
        </div>
      </div>
    </Container>
  );
}
