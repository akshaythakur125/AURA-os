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

      {audit && (
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

            {/* Image preview */}
            {audit.imageDataUrl && (
              <div className="mb-6 overflow-hidden rounded-xl border border-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={audit.imageDataUrl}
                  alt="Audit image"
                  className="max-h-[400px] w-full object-contain"
                />
              </div>
            )}

            {/* Image metadata */}
            {audit.imageMeta && (
              <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4 sm:grid-cols-4">
                <div>
                  <div className="text-xs text-gray-500">Width</div>
                  <div className="text-sm text-white">{audit.imageMeta.width || "—"} px</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Height</div>
                  <div className="text-sm text-white">{audit.imageMeta.height || "—"} px</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Original Size</div>
                  <div className="text-sm text-white">{formatBytes(audit.imageMeta.fileSize)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Compressed</div>
                  <div className="text-sm text-white">
                    {audit.imageMeta.compressedSize ? formatBytes(audit.imageMeta.compressedSize) : "—"}
                  </div>
                </div>
              </div>
            )}

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
                <div className="mb-2 text-xs text-gray-500">Free Aura Score</div>
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
                <p className="mt-1 text-sm text-gray-300">{audit.freeSummary}</p>
              </div>
            )}
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button variant="primary" disabled>
              Generate Free Aura Score — Coming in next step
            </Button>
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
