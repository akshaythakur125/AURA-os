"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getAuditById, updateAudit } from "@/lib/storage/auditStore";
import { getUnlocks, recordUnlock } from "@/lib/storage/unlockStore";
import { validateUnlockCode, getDemoCode, getUpiiId } from "@/lib/payments/manualUnlock";
import { generateFullAuraReport } from "@/lib/aura-engine/generateFullAuraReport";

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
  const product = searchParams.get("product") || "aura_report";

  const [transactionRef, setTransactionRef] = useState("");
  const [unlockCode, setUnlockCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  const audit = auditId ? getAuditById(auditId) : undefined;
  const upiId = getUpiiId();
  const demoCode = getDemoCode();

  async function handleUnlock() {
    if (!auditId || !audit) {
      setError("Audit not found.");
      return;
    }
    if (!unlockCode.trim()) {
      setError("Please enter an unlock code.");
      return;
    }
    const existingUnlock = getUnlocks().find((u) => u.auditId === auditId && u.status === "unlocked");
    if (existingUnlock) {
      setError("This audit is already unlocked.");
      return;
    }
    if (!validateUnlockCode(unlockCode, auditId)) {
      setError("Invalid unlock code. Please check and try again.");
      return;
    }
    setUnlocking(true);
    setError(null);
    try {
      const report = await generateFullAuraReport(audit.imageDataUrl, audit.freeResult);
      recordUnlock(auditId, product, unlockCode.trim(), transactionRef.trim() || undefined);
      updateAudit(auditId, {
        reportStatus: "full_report",
        fullScore: report.fullScore,
        fullReport: report,
      });
      setSuccess("Report unlocked successfully!");
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

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 text-center text-3xl font-bold text-white">Unlock Full Report</h1>
        <p className="mb-8 text-center text-sm text-gray-400">
          Manual UPI payment — MVP demo flow
        </p>

        {/* ─── Product Info ─── */}
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Full Aura Report</h2>
              <p className="text-xs text-gray-500">
                Audit: {audit.id.slice(0, 8)}...
              </p>
            </div>
            <span className="text-2xl font-bold text-amber-400">₹99</span>
          </div>
        </Card>

        {/* ─── Steps ─── */}
        <Card className="mb-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Steps to unlock</h3>
          <ol className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-xs text-purple-300">1</span>
              <span>Pay <strong className="text-white">₹99</strong> via UPI to <strong className="text-purple-300">{upiId}</strong></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-xs text-purple-300">2</span>
              <span>Send payment reference to the owner (optional but recommended)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-xs text-purple-300">3</span>
              <span>Enter the unlock code you received after payment, or use demo code <strong className="text-purple-300">{demoCode}</strong> for testing</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-xs text-purple-300">4</span>
              <span>Your full report unlocks locally — no data leaves your browser</span>
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
          {unlocking ? "Generating report..." : success ? "Redirecting..." : "Unlock Full Report — ₹99"}
        </Button>

        {/* ─── Footer ─── */}
        <div className="mt-6 space-y-2 text-center text-xs text-gray-600">
          <p>This is a manual MVP unlock flow. It is not production-grade payment.</p>
          <p>No automatic payment verification. Reports unlock via code entry.</p>
          <p>All data stays local in your browser.</p>
          <Link href={`/audit/${auditId}`} className="block text-purple-400 hover:underline">
            &larr; Back to audit
          </Link>
        </div>
      </div>
    </Container>
  );
}
