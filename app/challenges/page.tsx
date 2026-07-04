"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LocalLeaderboard } from "@/components/challenges/LocalLeaderboard";
import { StreakRing } from "@/components/challenges/StreakRing";
import { LeaderboardStrip } from "@/components/challenges/LeaderboardStrip";
import { CHALLENGES } from "@/config/challenges";
import { getChallengeEntries, createChallengeEntry, getChallengeStreak, markChallengeComplete } from "@/lib/storage/challengeStore";
import type { ChallengeStreak } from "@/lib/storage/challengeStore";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { useEffectOnce } from "@/lib/utils/effectOnce";
import type { Challenge, ChallengeEntry } from "@/types/challenge";

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

export default function ChallengesPage() {
  // SSR-safe defaults. getChallengeEntries/getChallengeStreak read
  // localStorage, which is unavailable on the server; seeding state from them
  // in a lazy initializer makes the server-rendered HTML differ from the
  // client's first paint (React hydration error #418). Start empty, then load
  // real values on mount.
  const [entries, setEntries] = useState<ChallengeEntry[]>([]);
  const [streak, setStreak] = useState<ChallengeStreak>({ currentStreak: 0, lastCheckinDate: "" });
  const [loggedToday, setLoggedToday] = useState<Set<string>>(new Set());
  const [streakMessage, setStreakMessage] = useState<string | null>(null);

  const activeChallenges = CHALLENGES.filter((c) => c.isActive);

  useEffectOnce(() => {
    setEntries(getChallengeEntries());
    setStreak(getChallengeStreak());
    trackEvent("challenge_viewed");
  });

  const handleLogToday = useCallback((challengeId: string) => {
    if (loggedToday.has(challengeId)) return;
    const result = markChallengeComplete();
    createChallengeEntry({ challengeId });
    setStreak({ currentStreak: result.newStreak, lastCheckinDate: new Date().toISOString().split("T")[0] });
    setLoggedToday((prev) => new Set(prev).add(challengeId));
    setEntries(getChallengeEntries());
    if (result.incremented) {
      setStreakMessage(result.newStreak > 1 ? `${result.newStreak}-day streak!` : "First day done!");
    } else {
      setStreakMessage("Already logged today");
    }
    trackEvent("challenge_logged", { challengeId });
    setTimeout(() => setStreakMessage(null), 3000);
  }, [loggedToday]);

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">Most people quit after 3 days because they can&apos;t handle the truth about their gaps.</h1>
          <div className="flex flex-col items-center gap-4">
            <StreakRing streak={streak.currentStreak} />
            <p className="text-sm text-gray-400">
              {streak.currentStreak > 0
                ? `${streak.currentStreak} day streak`
                : "Start your streak today"}
            </p>
            <LeaderboardStrip />
          </div>
        </div>

        {streakMessage && (
          <div className="mb-6 text-center text-sm text-emerald-400 animate-pulse">
            {streakMessage}
          </div>
        )}

        <div className="mb-16">
          <h2 className="mb-6 text-2xl font-bold text-white">Active Challenges</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeChallenges.map((challenge) => {
              const badge = TYPE_BADGES[challenge.type] ?? { label: challenge.type, variant: "default" as const };
              return (
                <Card key={challenge.id} hover className="flex flex-col">
                  <Link href={`/challenges/${challenge.slug}`} className="flex-1 p-4 pb-2">
                    <div className="mb-3 flex items-center gap-2">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-white">{challenge.title}</h3>
                    <p className="mb-4 text-sm text-gray-400">{challenge.description}</p>
                    <div className="rounded-lg bg-white/5 p-3 text-xs">
                      <span className="text-gray-500">Reward:</span>
                      <p className="mt-0.5 text-gray-300">{challenge.rewardText}</p>
                    </div>
                  </Link>
                  <div className="border-t border-white/5 px-4 pb-4 pt-3">
                    <Button
                      size="sm"
                      className="w-full"
                      variant={loggedToday.has(challenge.id) ? "ghost" : "secondary"}
                      disabled={loggedToday.has(challenge.id)}
                      onClick={() => handleLogToday(challenge.id)}
                    >
                      {loggedToday.has(challenge.id) ? "Done ✓" : "Log today"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-bold text-white">Local Leaderboard</h2>
          <LocalLeaderboard entries={entries} challenges={CHALLENGES} />
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link href="/audit/new">Start Free Aura Check</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
