"use client";

import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const auditTypes = [
  {
    id: "photo" as const,
    title: "Photo Aura Check",
    desc: "Analyze a single photo for expression, lighting, background, and overall visual signal.",
    icon: "camera",
    gradient: "from-purple-600 to-pink-500",
    status: "coming-soon" as const,
  },
  {
    id: "instagram" as const,
    title: "Instagram Profile Audit",
    desc: "Review your Instagram profile for coherence, photo quality, bio signals, and grid presentation.",
    icon: "instagram",
    gradient: "from-pink-500 to-rose-500",
    status: "coming-soon" as const,
  },
  {
    id: "dating" as const,
    title: "Dating Profile Audit",
    desc: "Optimize your dating app profile — photo order, bio alignment, and platform-specific signals.",
    icon: "heart",
    gradient: "from-rose-500 to-red-500",
    status: "coming-soon" as const,
  },
  {
    id: "outfit" as const,
    title: "Outfit Audit",
    desc: "Evaluate outfit choices for fit, color coordination, occasion alignment, and overall style signal.",
    icon: "tag",
    gradient: "from-amber-500 to-orange-500",
    status: "coming-soon" as const,
  },
  {
    id: "room" as const,
    title: "Room / Background Audit",
    desc: "Check your background and environment for visual noise, lighting, and lifestyle signals.",
    icon: "home",
    gradient: "from-emerald-500 to-teal-500",
    status: "coming-soon" as const,
  },
];

function AuditIcon({ icon }: { icon: string }) {
  const paths: Record<string, string> = {
    camera: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    instagram: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    heart: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    tag: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z",
    home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  };
  return (
    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={paths[icon]} />
    </svg>
  );
}

export default function NewAuditPage() {
  return (
    <Container className="py-12">
      <div className="mb-10 text-center">
        <h1 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
          New Aura Check
        </h1>
        <p className="mt-3 text-gray-400">
          Select the type of audit you want to run. The full audit flow will be
          available in the next update.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {auditTypes.map((item) => (
          <Card key={item.id} hover className="relative flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient}`}
              >
                <AuditIcon icon={item.icon} />
              </div>
              <Badge variant="default">{item.status.replace("-", " ")}</Badge>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              {item.title}
            </h3>
            <p className="flex-1 text-sm leading-relaxed text-gray-400">
              {item.desc}
            </p>
            <div className="mt-4">
              <Button variant="outline" size="sm" disabled className="w-full">
                Select
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-purple-500/10 bg-purple-500/5 p-6 text-center">
        <p className="text-sm text-gray-400">
          The audit creation and scoring flow will be built in the next update.
          <br />
          <span className="text-xs text-gray-600">
            Local-only MVP: all audit data stays in your browser.
          </span>
        </p>
      </div>
    </Container>
  );
}
