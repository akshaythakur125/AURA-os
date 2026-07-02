"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { LocalLeaderboard } from "@/components/challenges/LocalLeaderboard";
import { CHALLENGES } from "@/config/challenges";
import { getChallengeEntries } from "@/lib/storage/challengeStore";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { useEffectOnce } from "@/lib/utils/effectOnce";

export default function ChallengesPage() {
  const [entries] = useState(() => getChallengeEntries());
  const activeChallenges = CHALLENGES.filter((c) => c.isActive);

  useEffectOnce(() => {
    trackEvent("challenge_viewed");
  });

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">Turn Your Aura Score Into a Challenge</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            Pick a challenge, upload a photo, and see where you stand. All local — no data leaves your browser.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="mb-6 text-2xl font-bold text-white">Active Challenges</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
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
