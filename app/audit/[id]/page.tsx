"use client";

import { use } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getAuditById } from "@/lib/storage/auditStore";

const AUDIT_TYPE_LABELS: Record<string, string> = {
  photo: "Photo Aura Check",
  instagram: "Instagram Profile Audit",
  dating: "Dating Profile Audit",
  outfit: "Outfit Audit",
  background: "Room / Background Audit",
};

const GOAL_LABELS: Record<string, string> = {
  dating: "Dating",
  instagram: "Instagram",
  college: "College",
  office: "Office",
  glowup: "General Glow-Up",
};

const BUDGET_LABELS: Record<string, string> = {
  "0": "₹0 — Free only",
  "2000": "₹2,000",
  "5000": "₹5,000",
  "10000": "₹10,000",
  "25000": "₹25,000+",
};

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "warning" | "success" | "premium" }> = {
  draft: { label: "Draft", variant: "default" },
  free_score: { label: "Free Score Generated", variant: "success" },
  full_report: { label: "Full Report", variant: "premium" },
};

export default function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const audit = getAuditById(id);

  if (!audit) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Audit not found</h1>
          <p className="mb-6 text-sm text-gray-400">
            This audit does not exist or may have been deleted.
          </p>
          <Link href="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </Container>
    );
  }

  const statusInfo = STATUS_BADGE[audit.reportStatus] || STATUS_BADGE.draft;

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          <span className="text-xs text-gray-600">
            Created {new Date(audit.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>

        <h1 className="mb-8 text-2xl font-bold text-white sm:text-3xl">
          {AUDIT_TYPE_LABELS[audit.auditType] || audit.auditType}
        </h1>

        <div className="mb-8 grid gap-6 sm:grid-cols-2">
          {/* ─── Image Preview ─── */}
          <Card className="overflow-hidden p-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={audit.imageDataUrl}
            alt="Audit preview"
            className="w-full object-contain"
          />
          </Card>

          {/* ─── Details ─── */}
          <div className="space-y-4">
            <Card>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500">Audit Type</div>
                  <div className="text-sm text-white">{AUDIT_TYPE_LABELS[audit.auditType] || audit.auditType}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Goal</div>
                  <div className="text-sm text-white">{GOAL_LABELS[audit.goal] || audit.goal}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Budget Range</div>
                  <div className="text-sm text-white">{BUDGET_LABELS[audit.budgetRange] || audit.budgetRange}</div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>File name</span>
                  <span className="text-gray-400">{audit.imageMeta.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimensions</span>
                  <span className="text-gray-400">{audit.imageMeta.width} &times; {audit.imageMeta.height}</span>
                </div>
                <div className="flex justify-between">
                  <span>Compressed size</span>
                  <span className="text-gray-400">{(audit.imageMeta.compressedSize / 1024).toFixed(0)} KB</span>
                </div>
                <div className="flex justify-between">
                  <span>Report status</span>
                  <span className="text-gray-400">{statusInfo.label}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ─── Actions ─── */}
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-white">Generate Report</h3>
          <p className="mb-4 text-sm text-gray-400">
            Generate a free Aura Score based on this audit&apos;s image and settings.
          </p>
          <Button disabled className="opacity-50">
            Generate Free Aura Score
          </Button>
          <p className="mt-2 text-xs text-gray-600">Coming next</p>
        </Card>

        <div className="mt-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              &larr; Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
