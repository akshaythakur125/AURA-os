"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getActiveChallenges } from "@/config/challenges";
import { getChallengeEntries } from "@/lib/storage/challengeStore";
import { getAudits } from "@/lib/storage/auditStore";
import { getOrCreateReferralProfile } from "@/lib/storage/referralStore";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { LocalLeaderboard } from "@/components/challenges/LocalLeaderboard";
import type { Challenge } from "@/types/challenge";

export default function ChallengesPage() {
  const challenges = getActiveChallenges();
  const [allEntries, setAllEntries] = useState<ReturnType<typeof getChallengeEntries>>([]);
  const [hasAudit, setHasAudit] = useState(false);

  useEffect(() => {
    trackEvent({ eventName: "challenge_viewed" });
    setAllEntries(getChallengeEntries());
    const audits = getAudits();
    setHasAudit(audits.length > 0);
    getOrCreateReferralProfile();
  }, []);

  return (
    <>
      <section className="relative overflow-hidden pb-24 pt-24 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.12),transparent_50%)]" />
        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
              Turn your Aura Score into a challenge.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
              Pick a challenge, use your latest audit, and see where you stand on the local leaderboard.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {hasAudit ? (
                <Link href={challenges.length > 0 ? `/challenges/${challenges[0].slug}` : "/audit/new"}>
                  <Button size="lg">Enter a Challenge</Button>
                </Link>
              ) : (
                <Link href="/audit/new">
                  <Button size="lg">Start Free Aura Check</Button>
                </Link>
              )}
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-white/5 py-20">
        <Container>
          <SectionHeading title="Active Challenges" subtitle="Choose a challenge that matches your goal." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {challenges.map((challenge) => {
              const entryCount = allEntries.filter((e) => e.challengeId === challenge.id).length;
              return (
                <Link key={challenge.id} href={`/challenges/${challenge.slug}`} className="group">
                  <Card hover className="relative flex h-full flex-col overflow-hidden">
                    <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-purple-600/10 blur-2xl" />
                    <Badge variant="premium" className="mb-2 self-start">{challenge.type.replace(/_/g, " ")}</Badge>
                    <h3 className="mb-2 text-base font-semibold text-white group-hover:text-purple-200 transition-colors">
                      {challenge.title}
                    </h3>
                    <p className="mb-4 flex-1 text-xs leading-relaxed text-gray-400">
                      {challenge.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{entryCount} local entries</span>
                      <span className="text-purple-400 group-hover:text-purple-300">{challenge.rewardText} →</span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {allEntries.length > 0 && (
        <section className="border-t border-white/5 py-20">
          <Container>
            <SectionHeading title="All Challenge Entries" subtitle="Local leaderboard across all challenges." />
            <div className="mx-auto max-w-2xl">
              <LocalLeaderboard entries={allEntries} maxDisplay={20} />
            </div>
          </Container>
        </section>
      )}

      <section className="border-t border-white/5 py-12">
        <Container>
          <div className="mx-auto max-w-2xl rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center text-xs text-gray-500">
            <p>Challenges are for self-improvement and entertainment. No public posting happens automatically.</p>
            <p className="mt-2">Local MVP: challenge entries are stored in this browser only.</p>
          </div>
        </Container>
      </section>
    </>
  );
}
