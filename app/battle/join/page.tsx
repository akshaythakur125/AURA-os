"use client";

import { useState, useCallback, useEffect, use } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BattleUploader } from "@/components/battle/BattleUploader";
import { BattleResult } from "@/components/battle/BattleResult";
import { generateFreeAuraReport } from "@/lib/aura-engine/generateFreeAuraReport";
import { saveBattle, getBattleByInviteCode } from "@/lib/storage/battleStore";
import { getBattleInvite, acceptBattleInvite, completeBattleInvite } from "@/lib/battles/battleInvites";
import { trackEvent } from "@/lib/storage/analyticsStore";
import type { StatusLeak } from "@/types";

export default function BattleJoinPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = use(searchParams);
  const [friendImage, setFriendImage] = useState<string | null>(null);
  const [phase, setPhase] = useState<"loading" | "upload" | "analyzing" | "result" | "invalid">("loading");
  const [error, setError] = useState<string | null>(null);
  const [challengerScore, setChallengerScore] = useState(0);
  const [friendScore, setFriendScore] = useState(0);
  const [challengerLeaks, setChallengerLeaks] = useState<StatusLeak[]>([]);
  const [friendLeaks, setFriendLeaks] = useState<StatusLeak[]>([]);

  useEffect(() => {
    if (!code) {
      setPhase("invalid");
      return;
    }
    const invite = getBattleInvite(code);
    if (!invite) {
      setPhase("invalid");
      return;
    }
    const existing = getBattleByInviteCode(code);
    if (existing && existing.status === "completed") {
      setPhase("invalid");
      setError("This battle challenge has already been completed.");
      return;
    }
    setChallengerScore(invite.challengerScore);
    setPhase("upload");
  }, [code]);

  const handleAccept = useCallback(async () => {
    if (!friendImage || !code) return;
    setPhase("analyzing");
    setError(null);
    try {
      const result = await generateFreeAuraReport(friendImage, "0");
      setFriendScore(result.auraScore);
      setFriendLeaks(result.statusLeaks);

      const winner = challengerScore > result.auraScore ? "left" as const
        : result.auraScore > challengerScore ? "right" as const
        : "tie" as const;

      const record = saveBattle({
        leftLabel: "Them",
        rightLabel: "You",
        leftScore: challengerScore,
        rightScore: result.auraScore,
        leftLeaks: [],
        rightLeaks: result.statusLeaks.map((l) => l.title),
        winner,
        inviteCode: code,
        status: "completed",
        leftSignal: "",
        leftCategory: "",
      });

      acceptBattleInvite(code, record.id);
      completeBattleInvite(code);
      trackEvent("battle_completed", { leftScore: challengerScore, rightScore: result.auraScore, source: "invite" });
      trackEvent("referral_claimed", { source: "battle_invite", code });
      setPhase("result");
    } catch {
      setError("Analysis failed. Try a different photo.");
      setPhase("upload");
    }
  }, [friendImage, code, challengerScore]);

  if (phase === "invalid" || !code) {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Invalid Challenge</h1>
          <p className="mb-6 text-sm text-gray-400">
            {error || "This battle link is invalid or has expired."}
          </p>
          <Button asChild><Link href="/battle">Start a new battle</Link></Button>
        </div>
      </Container>
    );
  }

  if (phase === "loading") {
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-md text-center text-sm text-gray-500">Loading challenge...</div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <Badge variant="default" className="mb-3">Battle Challenge</Badge>
          <h1 className="mb-3 text-4xl font-bold text-white">Someone challenged you!</h1>
          <p className="text-sm text-gray-400">
            They scored <span className="font-bold text-white">{challengerScore}/100</span>. Upload your photo to see who wins.
          </p>
        </div>

        {phase === "upload" && (
          <>
            <div className="mb-6 flex justify-center">
              <BattleUploader side="right" label="Your Photo" onImage={setFriendImage} />
            </div>
            {error && <p className="mb-4 text-center text-sm text-red-400">{error}</p>}
            <div className="text-center">
              <Button size="lg" disabled={!friendImage} onClick={handleAccept}>
                {friendImage ? "⚔️ Accept Battle" : "Upload your photo"}
              </Button>
            </div>
          </>
        )}

        {phase === "analyzing" && (
          <div className="flex flex-col items-center gap-4 py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
            <p className="text-sm text-gray-400">Analyzing your photo...</p>
          </div>
        )}

        {phase === "result" && (
          <>
            <BattleResult
              leftScore={challengerScore}
              rightScore={friendScore}
              leftLeaks={challengerLeaks}
              rightLeaks={friendLeaks}
              leftLabel="Them"
              rightLabel="You"
            />
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild variant="outline"><Link href="/battle">Challenge someone back</Link></Button>
              <Button asChild><Link href="/audit/new">Get your full Aura Score</Link></Button>
            </div>
          </>
        )}
      </div>
    </Container>
  );
}
