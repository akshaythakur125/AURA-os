import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { ChallengeEntry } from "@/types/challenge";
import type { Challenge } from "@/types/challenge";

export function LocalLeaderboard({
  entries,
  challenges,
}: {
  entries: ChallengeEntry[];
  challenges: Challenge[];
}) {
  const sorted = [...entries].sort((a, b) => (b.auraScore ?? 0) - (a.auraScore ?? 0));
  const topEntries = sorted.slice(0, 20);

  if (topEntries.length === 0) {
    return (
      <div className="rounded-xl bg-white/5 p-6 text-center text-sm text-gray-500">
        No entries yet. Be the first to enter a challenge!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500">
        Local leaderboard — sorted by aura score. Only visible to you. Public leaderboards require a backend later.
      </div>
      {topEntries.map((entry, i) => {
        const challenge = challenges.find((c) => c.id === entry.challengeId);
        return (
          <Card key={entry.id}>
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    Score: {entry.auraScore ?? "—"}
                  </span>
                  {entry.archetype && (
                    <Badge variant="premium">{entry.archetype}</Badge>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-gray-500">
                  {challenge?.title ?? entry.challengeId}
                  {entry.biggestStatusLeak && ` · ${entry.biggestStatusLeak}`}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(entry.createdAt).toLocaleDateString("en-IN")}
              </div>
            </div>
          </Card>
        );
      })}
      <div className="pt-2 text-[10px] text-gray-600">
        Local leaderboard only. Public leaderboards require a backend later.
      </div>
    </div>
  );
}
