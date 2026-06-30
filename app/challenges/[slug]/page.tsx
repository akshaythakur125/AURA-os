"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CHALLENGES } from "@/config/challenges";
import { getAudits } from "@/lib/storage/auditStore";
import { getEntriesByChallengeId, createChallengeEntry } from "@/lib/storage/challengeStore";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { updateOnboarding } from "@/lib/storage/onboardingStore";

export default function ChallengeDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const challenge = CHALLENGES.find((c) => c.slug === slug);
  const [entries, setEntries] = useState(() => getEntriesByChallengeId(challenge?.id ?? ""));
  const [saved, setSaved] = useState(false);

  if (!challenge) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Challenge Not Found</h1>
          <p className="mb-6 text-sm text-gray-400">This challenge does not exist or has ended.</p>
          <Link href="/challenges"><Button>Back to Challenges</Button></Link>
        </div>
      </Container>
    );
  }

  const audits = getAudits();
  const latestWithScore = audits.find((a) => a.freeScore !== undefined);
  const latestDating = audits.find((a) => a.datingProfileReport);
  const latestGlowup = audits.find((a) => a.glowupPlan);

  function handleEnterChallenge() {
    if (!challenge || !latestWithScore) return;
    createChallengeEntry({
      challengeId: challenge.id,
      auditId: latestWithScore.id,
      auraScore: latestWithScore.freeScore ?? latestWithScore.fullScore,
      archetype: latestWithScore.personalization?.archetype ?? latestWithScore.fullReport?.category,
      biggestStatusLeak: latestWithScore.freeResult?.statusLeaks?.[0]?.title,
    });
    trackEvent("challenge_entered", { challengeId: challenge.id, slug: challenge.slug });
    updateOnboarding({ hasEnteredChallenge: true });
    setSaved(true);
    setEntries(getEntriesByChallengeId(challenge.id));
  }

  const canEnter = challenge.type === "dating_profile_fix"
    ? !!latestDating
    : challenge.type === "glowup_before_after" || challenge.type === "budget_upgrade"
      ? !!latestGlowup || !!latestWithScore
      : !!latestWithScore;

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/challenges" className="mb-6 block text-xs text-purple-400 hover:underline">&larr; Back to challenges</Link>

        <div className="mb-8">
          <div className="mb-4">
            <Badge variant="premium">{challenge.type.replace(/_/g, " ")}</Badge>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-white">{challenge.title}</h1>
          <p className="mb-6 text-gray-400">{challenge.description}</p>
          <Card className="mb-6">
            <div className="text-xs text-gray-500">Requirement</div>
            <p className="mt-1 text-sm text-gray-300">{challenge.entryRequirement}</p>
            <div className="mt-3 text-xs text-gray-500">Reward</div>
            <p className="mt-1 text-sm text-amber-400">{challenge.rewardText}</p>
          </Card>
        </div>

        {saved ? (
          <Card className="mb-8 border-emerald-500/20">
            <div className="text-sm font-semibold text-emerald-400">You entered this challenge!</div>
            <p className="mt-2 text-xs text-gray-400">Your entry is saved locally. Check the leaderboard to see your rank.</p>
            <div className="mt-4 flex gap-2">
              <Link href="/challenges"><Button variant="outline" size="sm">View Leaderboard</Button></Link>
              <Link href="/audit/new"><Button size="sm">Create New Audit</Button></Link>
            </div>
          </Card>
        ) : (
          <div className="mb-8 space-y-3">
            {canEnter ? (
              <Button onClick={handleEnterChallenge} size="lg" className="w-full">
                Enter with Latest Audit
              </Button>
            ) : (
              <div className="rounded-xl bg-amber-500/10 p-4 text-sm text-amber-300">
                You need a compatible audit to enter this challenge.
              </div>
            )}
            <Link href="/audit/new">
              <Button variant="outline" size="sm" className="w-full">Start New Audit</Button>
            </Link>
          </div>
        )}

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-white">Local Entries ({entries.length})</h2>
          {entries.length === 0 ? (
            <div className="rounded-xl bg-white/5 p-4 text-center text-sm text-gray-500">
              No entries yet. Be the first!
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, i) => (
                <Card key={entry.id}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">{i + 1}</div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-white">Score: {entry.auraScore ?? "—"}</span>
                      {entry.archetype && <span className="ml-2 text-xs text-purple-300">{entry.archetype}</span>}
                      {entry.biggestStatusLeak && <div className="text-xs text-gray-500">{entry.biggestStatusLeak}</div>}
                    </div>
                    <div className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleDateString("en-IN")}</div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs text-gray-600">
          <p>AuraCheck challenges are for self-improvement and entertainment. Local leaderboards are stored only in your browser. No public posting happens automatically. Your image is not included in share cards unless you choose it.</p>
        </div>
      </div>
    </Container>
  );
}
