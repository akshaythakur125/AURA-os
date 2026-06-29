"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { getAudits, deleteAudit } from "@/lib/storage/auditStore";

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

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "warning" | "success" | "premium" }> = {
  draft: { label: "Draft", variant: "default" },
  free_score: { label: "Free Score", variant: "success" },
  full_report: { label: "Full Report", variant: "premium" },
};

export default function DashboardPage() {
  const [audits, setAudits] = useState(() => getAudits());
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  function handleDelete(id: string) {
    deleteAudit(id);
    setAudits(getAudits());
    setDeleteTarget(null);
  }

  const latestAudit = audits.length > 0 ? audits[0] : null;

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <Link href="/audit/new">
            <Button size="sm">New Audit</Button>
          </Link>
        </div>

        {/* ─── Stats ─── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <div className="text-xs text-gray-500">Total Audits</div>
            <div className="mt-1 text-3xl font-bold text-white">{audits.length}</div>
          </Card>
          <Card>
            <div className="text-xs text-gray-500">Latest Audit</div>
            <div className="mt-1 text-sm text-white">
              {latestAudit
                ? new Date(latestAudit.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                : "—"}
            </div>
          </Card>
          <Card>
            <div className="text-xs text-gray-500">Drafts</div>
            <div className="mt-1 text-3xl font-bold text-white">
              {audits.filter((a) => a.reportStatus === "draft").length}
            </div>
          </Card>
        </div>

        {/* ─── Audit History ─── */}
        <h2 className="mb-4 text-lg font-semibold text-white">Audit History</h2>

        {audits.length === 0 ? (
          <Card>
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="mb-1 text-sm font-medium text-gray-300">No audits yet</p>
              <p className="mb-4 text-xs text-gray-500">
                Create your first Aura Check to get started.
              </p>
              <Link href="/audit/new">
                <Button size="sm">Start Aura Check</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {audits.map((audit) => {
              const statusInfo = STATUS_BADGE[audit.reportStatus] || STATUS_BADGE.draft;
              return (
                <Card key={audit.id} className="flex gap-4 p-4">
                  {/* ─── Thumbnail ─── */}
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={audit.imageDataUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* ─── Info ─── */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <h3 className="truncate text-sm font-semibold text-white">
                        {AUDIT_TYPE_LABELS[audit.auditType] || audit.auditType}
                      </h3>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                        <span>{GOAL_LABELS[audit.goal] || audit.goal}</span>
                        <span className="text-gray-700">|</span>
                        <span>&#8377;{audit.budgetRange === "0" ? "0" : audit.budgetRange === "25000" ? "25,000+" : Number(audit.budgetRange).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      <div className="flex gap-2">
                        <Link href={`/audit/${audit.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(audit.id)}
                        >
                          <svg className="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* ─── Delete Confirmation ─── */}
        <ConfirmDialog
          open={!!deleteTarget}
          title="Delete Audit"
          message="This will permanently remove this audit and its image. This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          requireTypedConfirm="DELETE"
          variant="danger"
          onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </Container>
  );
}
