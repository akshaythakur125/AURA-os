import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Challenge } from "@/types/challenge";

const TYPE_BADGES: Record<string, { label: string; variant: "premium" | "success" | "warning" | "danger" | "default" }> = {
  status_leak: { label: "Status Leak", variant: "danger" },
  glowup_before_after: { label: "30-Day Reset", variant: "warning" },
  budget_upgrade: { label: "Budget", variant: "success" },
  clean_profile: { label: "Clean", variant: "premium" },
  best_background: { label: "Background", variant: "default" },
  no_iphone_premium: { label: "No iPhone", variant: "premium" },
  college_aura: { label: "College", variant: "default" },
  dating_profile_fix: { label: "Dating", variant: "success" },
};

export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const badge = TYPE_BADGES[challenge.type] ?? { label: challenge.type, variant: "default" };

  return (
    <Link href={`/challenges/${challenge.slug}`}>
      <Card hover className="h-full cursor-pointer">
        <div className="mb-3 flex items-center gap-2">
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-white">{challenge.title}</h3>
        <p className="mb-4 text-sm text-gray-400">{challenge.description}</p>
        <div className="rounded-lg bg-white/5 p-3 text-xs">
          <span className="text-gray-500">Reward:</span>
          <p className="mt-0.5 text-gray-300">{challenge.rewardText}</p>
        </div>
      </Card>
    </Link>
  );
}
