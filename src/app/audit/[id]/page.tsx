"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getAuditById } from "@/lib/storage/auditStore";
import type { Audit } from "@/types/audit";

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

export default function AuditDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [audit] = useState<Audit | null | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    return getAuditById(id) ?? null;
  });

  return (
    <Container className="py-12">
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
          <Link href="/dashboard">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </Card>
      )}

      {audit && (
        <div className="mx-auto max-w-2xl">
          <Card className="mb-6">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-white">
                  {auditTypeLabels[audit.auditType] || audit.auditType}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Created{" "}
                  {new Date(audit.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <Badge variant={statusBadge[audit.reportStatus] || "default"}>
                {audit.reportStatus.replace("_", " ")}
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <div className="text-xs text-gray-500">Goal</div>
                <div className="mt-1 text-sm font-medium capitalize text-white">
                  {audit.goal}
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <div className="text-xs text-gray-500">Budget Range</div>
                <div className="mt-1 text-sm font-medium text-amber-400">
                  &#8377;{audit.budgetRange.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <div className="text-xs text-gray-500">Unlock Status</div>
                <div className="mt-1 text-sm font-medium capitalize text-white">
                  {audit.unlockStatus}
                </div>
              </div>
            </div>

            {audit.freeScore !== undefined && (
              <div className="mt-6">
                <div className="mb-2 text-xs text-gray-500">
                  Free Aura Score
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">
                    {audit.freeScore}
                  </span>
                  <span className="text-sm text-gray-500">/ 100</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500"
                    style={{ width: `${audit.freeScore}%` }}
                  />
                </div>
              </div>
            )}

            {audit.freeSummary && (
              <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <div className="text-xs text-gray-500">Summary</div>
                <p className="mt-1 text-sm text-gray-300">
                  {audit.freeSummary}
                </p>
              </div>
            )}

            {audit.reportStatus === "draft" && (
              <div className="mt-6 rounded-xl border border-purple-500/10 bg-purple-500/5 p-4 text-center text-sm text-gray-400">
                This audit is still in draft. The scoring engine will process it
                in a future update.
              </div>
            )}
          </Card>

          <div className="flex flex-wrap gap-3">
            <Link href="/unlock">
              <Button variant="outline">Unlock Premium Report</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      )}
    </Container>
  );
}
