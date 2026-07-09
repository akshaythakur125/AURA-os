"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function EmptyDashboard() {
  return (
    <Card className="py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
        <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="mb-2 text-lg text-gray-300">No audits yet</p>
      <p className="mb-6 text-sm text-gray-500">
        Start your first Aura Check to see your results here.
      </p>
      <Link href="/audit/new">
        <Button>Start Your First Audit</Button>
      </Link>

      {/* Preview of what's coming */}
      <div className="mt-8 mx-auto max-w-sm opacity-40">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-3">
            <div className="text-[10px] text-gray-600">Score Trend</div>
            <div className="mt-2 h-12 rounded bg-white/[0.03]">
              <svg viewBox="0 0 200 50" className="h-full w-full">
                <path d="M0 40 Q50 35 100 25 T200 15" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-3">
            <div className="text-[10px] text-gray-600">Days Since Check</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white/20">--</span>
              <span className="text-[10px] text-gray-600">days</span>
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3">
          <div className="text-[10px] text-gray-600">Total Checks</div>
          <div className="mt-1 text-xl font-bold text-white/20">0</div>
        </div>
      </div>
    </Card>
  );
}
