"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getChallengeBySlug } from "@/config/challenges";
import { getEntriesByChallengeId, createChallengeEntry } from "@/lib/storage/challengeStore";
import { getAudits, getAuditById } from "@/lib/storage/auditStore";
import { LocalLeaderboard } from "@/components/challenges/LocalLeaderboard";
import { trackEvent } from "@/lib/storage/analyticsStore";
import type { ChallengeEntry } from "@/types/challenge";

export default function ChallengeDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const challenge = getChallengeBySlug(slug);

  const [entries, setEntries] = useState<ChallengeEntry[]>(() => {
    if (!challenge || typeof window === "undefined") return [];
    return getEntriesByChallengeId(challenge.id);
  });
  const [hasEntered, setHasEntered] = useState(() => {
    if (!challenge || typeof window === "undefined") return false;
    const allEntries = getEntriesByChallengeId(challenge.id);
    const existingIds = allEntries.map((e) => e.auditId).filter(Boolean);
    const audits = getAudits().filter((a) => a.freeScore !== undefined);
    return audits.some((a) => existingIds.includes(a.id));
  });
  const [message, setMessage] = useState<string | null>(null);
  const [latestAuditId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const audits = getAudits().filter((a) => a.freeScore !== undefined);
    return audits.length > 0 ? audits[0].id : null;
  });

  useEffect(() => {
    if (!challenge) return;
    trackEvent({ eventName: "challenge_viewed", metadata: { slug } });
  }, [challenge, slug]);

  if (!challenge) {
    return (
      <Container className="py-16 text-center">
        <Card className="mx-auto max-w-md py-12">
          <p className="mb-2 text-lg text-gray-300">Challenge not found</p>
          <p className="mb-6 text-sm text-gray-500">This challenge may have been removed or does not exist.</p>
          <Link href="/challenges"><Button>View All Challenges</Button></Link>
        </Card>
      </Container>
    );
  }

  function handleEnterChallenge() {
    if (!challenge) return;
    if (!latestAuditId) {
      setMessage("Create an audit first and generate a free score.");
      return;
    }
    const audit = getAuditById(latestAuditId);
    if (!audit || audit.freeScore === undefined) {
      setMessage("Generate a free score first before entering this challenge.");
      return;
    }

    const existingIds = entries.map((e) => e.auditId).filter(Boolean);
    if (existingIds.includes(audit.id)) {
      setMessage("This audit has already been entered into this challenge.");
      return;
    }

    const entry = createChallengeEntry({
      challengeId: challenge.id,
      auditId: audit.id,
      auraScore: audit.freeScore,
      archetype: audit.personalization?.archetype,
      biggestStatusLeak: audit.fullReport?.freeResult?.statusLeaks?.[0]?.title,
    });
    setEntries((prev) => [entry, ...prev]);
    setHasEntered(true);
    setMessage("You have entered the challenge! Check the local leaderboard.");
    trackEvent({ eventName: "challenge_entered", auditId: audit.id, metadata: { challengeId: challenge.id } });
  }

  function handleCopyShare() {
    if (!challenge) return;
    const text = `I just entered the "${challenge.title}" challenge on AuraCheck! Check your status at ` + window.location.origin;
    navigator.clipboard.writeText(text);
    setMessage("Challenge share text copied!");
    setTimeout(() => setMessage(null), 2000);
  }

  return (
    <Container className="py-12">
      <div className="mb-6">
        <Link href="/challenges" className="text-sm text-gray-500 hover:text-gray-300">&larr; Back to Challenges</Link>
      </div>

      <div className="mx-auto max-w-3xl">
        <Card className="mb-8">
          <Badge variant="premium" className="mb-3">{challenge.type.replace(/_/g, " ")}</Badge>
          <h1 className="mb-3 text-2xl font-bold text-white sm:text-3xl">{challenge.title}</h1>
          <p className="mb-6 text-sm leading-relaxed text-gray-400">{challenge.description}</p>

          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
              <div className="text-xs text-gray-500">Requirement</div>
              <p className="mt-1 text-sm text-gray-300">{challenge.entryRequirement}</p>
            </div>
            <div className="rounded-lg border border-white/[0.04] bg-white/[0.03] p-3">
              <div className="text-xs text-gray-500">Reward</div>
              <p className="mt-1 text-sm text-amber-400">{challenge.rewardText}</p>
            </div>
          </div>

          {message && (
            <div className="mb-4 rounded-lg bg-purple-500/10 px-3 py-2 text-sm text-purple-300">
              {message}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleEnterChallenge} disabled={hasEntered}>
              {hasEntered ? "Already Entered ✓" : "Enter This Challenge"}
            </Button>
            {latestAuditId && (
              <Link href={`/audit/${latestAuditId}`}>
                <Button variant="secondary">Use Latest Audit</Button>
              </Link>
            )}
            <Link href="/audit/new">
              <Button variant="outline">New Audit</Button>
            </Link>
            <Button variant="secondary" onClick={handleCopyShare}>
              Share Challenge
            </Button>
          </div>
        </Card>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-white">How to participate</h2>
          <ol className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[10px] text-purple-300">1</span>
              Complete an Aura Check audit (upload a photo, select goal and budget).
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[10px] text-purple-300">2</span>
              Generate your free Aura Score.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[10px] text-purple-300">3</span>
              Click &quot;Enter This Challenge&quot; to submit your score to the local leaderboard.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[10px] text-purple-300">4</span>
              Share the challenge with friends to invite them to participate.
            </li>
          </ol>
        </section>

        <LocalLeaderboard entries={entries} />

        <div className="mt-8 rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 text-center text-xs text-gray-600">
          <p>Local MVP: challenge entries are stored in this browser only.</p>
          <p className="mt-1">AuraCheck does not judge human worth. Challenges are for self-improvement and entertainment.</p>
        </div>
      </div>
    </Container>
  );
}
