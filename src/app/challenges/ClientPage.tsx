"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FadeInView } from "@/components/ui/FadeInView";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getActiveChallenges } from "@/config/challenges";
import { getChallengeEntries } from "@/lib/storage/challengeStore";
import { getAudits } from "@/lib/storage/auditStore";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { LocalLeaderboard } from "@/components/challenges/LocalLeaderboard";

export default function ChallengesPage() {
  const challenges = getActiveChallenges();
  const [allEntries] = useState(getChallengeEntries());
  const [hasAudit] = useState(typeof window !== "undefined" && getAudits().length > 0);

  useEffect(() => {
    trackEvent({ eventName: "challenge_viewed" });
  }, []);

  return (
    <>
      <section className="relative overflow-hidden pb-24 pt-24 sm:pt-32">
        <div className="aurora-mesh" />
        <GlowOrb color="rgba(225, 68, 52, 0.12)" size={350} className="top-[20%] left-[10%]" delay={0} />
        <GlowOrb color="rgba(225, 68, 52, 0.08)" size={250} className="top-[30%] right-[15%]" delay={400} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(225, 68, 52,0.12),transparent_50%)]" />
        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="bg-gradient-to-r from-[#1c1917] via-[#E14434] to-[#c0341f] bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
              Turn your Aura Score into a challenge.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-[#6f675e]">
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

      <section className="border-t border-[#1c1917]/[0.08] py-24">
        <Container>
          <SectionHeading title="Active Challenges" subtitle="Choose a challenge that matches your goal." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {challenges.map((challenge, i) => {
              const entryCount = allEntries.filter((e) => e.challengeId === challenge.id).length;
              return (
                <FadeInView key={challenge.id} delay={Math.min(i * 100, 300)}>
                  <Link href={`/challenges/${challenge.slug}`} className="group block">
                    <Card hover className="relative flex h-full flex-col overflow-hidden">
                      <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-red-600/10 blur-2xl" />
                      <Badge variant="premium" className="mb-2 self-start">{challenge.type.replace(/_/g, " ")}</Badge>
                      <h3 className="mb-2 text-base font-semibold text-[#1C1917] group-hover:text-red-200 transition-colors">
                        {challenge.title}
                      </h3>
                      <p className="mb-4 flex-1 text-xs leading-relaxed text-[#6f675e]">
                        {challenge.description}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#857b6e]">{entryCount} local entries</span>
                        <span className="text-red-400 group-hover:text-red-300">{challenge.rewardText} →</span>
                      </div>
                    </Card>
                  </Link>
                </FadeInView>
              );
            })}
          </div>
        </Container>
      </section>

      {allEntries.length > 0 && (
        <section className="border-t border-[#1c1917]/[0.08] py-24">
          <Container>
            <SectionHeading title="All Challenge Entries" subtitle="Local leaderboard across all challenges." />
            <div className="mx-auto max-w-2xl">
              <LocalLeaderboard entries={allEntries} maxDisplay={20} />
            </div>
          </Container>
        </section>
      )}

      <section className="border-t border-[#1c1917]/[0.08] py-12">
        <Container>
          <div className="mx-auto max-w-2xl rounded-xl border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.02] p-6 text-center text-xs text-[#857b6e]">
            <p>Challenges are for self-improvement and entertainment. No public posting happens automatically.</p>
            <p className="mt-2">Local MVP: challenge entries are stored in this browser only.</p>
          </div>
        </Container>
      </section>
    </>
  );
}
