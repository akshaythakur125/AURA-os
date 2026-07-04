"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BattleUploader } from "@/components/battle/BattleUploader";
import { BattleResult } from "@/components/battle/BattleResult";
import { generateFreeAuraReport } from "@/lib/aura-engine/generateFreeAuraReport";
import { saveBattle, getBattleCount } from "@/lib/storage/battleStore";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { createBattleInvite, getInviteShareUrl, getInviteShareText } from "@/lib/battles/battleInvites";
import type { StatusLeak, Category } from "@/types";

type Phase = "upload" | "analyzing" | "result";

export default function BattlePage() {
  const [leftImage, setLeftImage] = useState<string | null>(null);
  const [rightImage, setRightImage] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("upload");
  const [error, setError] = useState<string | null>(null);
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [leftLeaks, setLeftLeaks] = useState<StatusLeak[]>([]);
  const [rightLeaks, setRightLeaks] = useState<StatusLeak[]>([]);
  const [leftLabel] = useState("You");
  const [rightLabel] = useState("Them");
  const [battleCount] = useState(() => getBattleCount());
  const [mode, setMode] = useState<"local" | "challenge">("local");
  const [challengeImage, setChallengeImage] = useState<string | null>(null);
  const [challengeInviteUrl, setChallengeInviteUrl] = useState<string | null>(null);
  const [challengeInviteText, setChallengeInviteText] = useState<string | null>(null);
  const [challengeError, setChallengeError] = useState<string | null>(null);

  const ready = leftImage && rightImage && phase === "upload";

  const handleBattle = useCallback(async () => {
    if (!leftImage || !rightImage) return;
    setPhase("analyzing");
    setError(null);
    try {
      const [leftResult, rightResult] = await Promise.all([
        generateFreeAuraReport(leftImage, "0"),
        generateFreeAuraReport(rightImage, "0"),
      ]);
      setLeftScore(leftResult.auraScore);
      setRightScore(rightResult.auraScore);
      setLeftLeaks(leftResult.statusLeaks);
      setRightLeaks(rightResult.statusLeaks);

      const winner = leftResult.auraScore > rightResult.auraScore ? "left" as const
        : rightResult.auraScore > leftResult.auraScore ? "right" as const
        : "tie" as const;

      saveBattle({
        leftLabel,
        rightLabel,
        leftScore: leftResult.auraScore,
        rightScore: rightResult.auraScore,
        leftLeaks: leftResult.statusLeaks.map((l) => l.title),
        rightLeaks: rightResult.statusLeaks.map((l) => l.title),
        winner,
      });

      trackEvent("battle_completed", { leftScore: String(leftResult.auraScore), rightScore: String(rightResult.auraScore) });
      setPhase("result");
    } catch {
      setError("Analysis failed. Try different photos.");
      setPhase("upload");
    }
  }, [leftImage, rightImage, leftLabel, rightLabel]);

  const handleReset = useCallback(() => {
    setLeftImage(null);
    setRightImage(null);
    setPhase("upload");
    setLeftScore(0);
    setRightScore(0);
    setLeftLeaks([]);
    setRightLeaks([]);
    setError(null);
  }, []);

  const handleShare = useCallback(() => {
    const url = `/api/share-card?mode=battle&leftScore=${leftScore}&rightScore=${rightScore}&leftLabel=${encodeURIComponent(leftLabel)}&rightLabel=${encodeURIComponent(rightLabel)}&url=${encodeURIComponent(location.origin)}`;
    window.open(url, "_blank");
    trackEvent("battle_share_card_viewed");
  }, [leftScore, rightScore, leftLabel, rightLabel]);

  const handleCreateChallenge = useCallback(async () => {
    if (!challengeImage) return;
    setChallengeError(null);
    try {
      const result = await generateFreeAuraReport(challengeImage, "0");
      const invite = createBattleInvite({
        challengerName: "Someone",
        challengerScore: result.auraScore,
        challengerCategory: result.category as string,
        challengerSignal: result.strongestSignals[0] || "Presentation",
        challengerImage: challengeImage,
      });
      setChallengeInviteUrl(getInviteShareUrl(invite.inviteCode));
      setChallengeInviteText(getInviteShareText(invite.inviteCode));

      saveBattle({
        leftLabel: "You",
        rightLabel: "Friend",
        leftScore: result.auraScore,
        rightScore: 0,
        leftLeaks: result.statusLeaks.map((l) => l.title),
        rightLeaks: [],
        winner: "tie",
        inviteCode: invite.inviteCode,
        status: "invited",
        leftImage: challengeImage,
        leftSignal: result.strongestSignals[0] || "",
        leftCategory: result.category as string,
      });

      trackEvent("referral_created", { source: "battle_challenge" });
    } catch {
      setChallengeError("Analysis failed. Try a different photo.");
    }
  }, [challengeImage]);

  const handleCopyInvite = useCallback(async () => {
    if (challengeInviteText) {
      await navigator.clipboard.writeText(challengeInviteText);
      trackEvent("referral_link_copied");
    }
  }, [challengeInviteText]);

  const handleNativeShare = useCallback(async () => {
    if (!challengeInviteUrl) return;
    try {
      await navigator.share({
        title: "Aura Battle Challenge!",
        text: challengeInviteText || "Can you beat my Aura Score?",
        url: challengeInviteUrl,
      });
      trackEvent("referral_shared");
    } catch { /* cancelled */ }
  }, [challengeInviteUrl, challengeInviteText]);

  const switchToMode = (m: "local" | "challenge") => {
    setMode(m);
    setPhase("upload");
    setLeftImage(null);
    setRightImage(null);
    setChallengeImage(null);
    setChallengeInviteUrl(null);
    setChallengeInviteText(null);
    setChallengeError(null);
    setError(null);
  };

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <Badge variant="default" className="mb-3">Aura Battle</Badge>
          <h1 className="mb-3 text-4xl font-bold text-white">Who has the higher aura?</h1>
          <p className="text-sm text-gray-400">
            {battleCount > 0 && `${battleCount} battles so far.`}
          </p>

          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => switchToMode("local")}
              className={`rounded-full px-4 py-1.5 text-xs transition-all ${mode === "local" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-white/5 text-gray-400 border border-transparent hover:text-gray-300"}`}
            >
              ⚔️ Side-by-Side
            </button>
            <button
              onClick={() => switchToMode("challenge")}
              className={`rounded-full px-4 py-1.5 text-xs transition-all ${mode === "challenge" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-white/5 text-gray-400 border border-transparent hover:text-gray-300"}`}
            >
              📨 Challenge a Friend
            </button>
          </div>
        </div>

        {/* Challenge Mode */}
        {mode === "challenge" && (
          <div className="space-y-6">
            {!challengeInviteUrl ? (
              <>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-center">
                  <h2 className="mb-2 text-lg font-bold text-white">Challenge a Friend</h2>
                  <p className="mb-4 text-sm text-gray-400">
                    Upload your photo, get your score, then send a challenge link. They upload theirs — we compare.
                  </p>
                  <BattleUploader side="left" label="Your Photo" onImage={setChallengeImage} />
                  {challengeError && <p className="mt-3 text-sm text-red-400">{challengeError}</p>}
                  <div className="mt-4">
                    <Button size="lg" disabled={!challengeImage} onClick={handleCreateChallenge}>
                      {challengeImage ? "Generate Challenge Link" : "Upload your photo first"}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 space-y-4">
                <div className="text-center">
                  <span className="text-3xl">👑</span>
                  <h3 className="mt-2 text-lg font-bold text-white">Challenge Created!</h3>
                  <p className="text-sm text-gray-400">Share this link with a friend to see who has the higher aura.</p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3">
                  <input readOnly value={challengeInviteUrl || ""} className="flex-1 bg-transparent text-xs text-gray-400 outline-none" onFocus={(e) => e.target.select()} />
                  <Button size="sm" variant="ghost" onClick={handleCopyInvite}>Copy</Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(challengeInviteText || "")}`, "_blank")}
                    className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-xs text-emerald-300 hover:bg-emerald-500/20"
                  >💬 WhatsApp</button>
                  <button
                    onClick={handleNativeShare}
                    className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-3 text-xs text-purple-300 hover:bg-purple-500/20"
                  >📱 Share</button>
                  <button
                    onClick={handleCopyInvite}
                    className="rounded-xl border border-gray-500/30 bg-gray-500/10 px-3 py-3 text-xs text-gray-300 hover:bg-gray-500/20"
                  >🔗 Copy</button>
                </div>
                <div className="text-center">
                  <Button variant="ghost" onClick={() => { setChallengeImage(null); setChallengeInviteUrl(null); setChallengeInviteText(null); }} size="sm">Create another challenge</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Local Mode */}
        {mode === "local" && (
          <>
            {phase === "upload" && (
              <>
                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                  <BattleUploader side="left" label="You" onImage={setLeftImage} />
                  <BattleUploader side="right" label="Them" onImage={setRightImage} />
                </div>
                {error && <p className="mb-4 text-center text-sm text-red-400">{error}</p>}
                <div className="text-center">
                  <Button size="lg" disabled={!ready} onClick={handleBattle}>
                    {ready ? "⚔️ Battle" : "Upload both photos"}
                  </Button>
                </div>
              </>
            )}

            {phase === "analyzing" && (
              <div className="flex flex-col items-center gap-4 py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
                <p className="text-sm text-gray-400">Analyzing both photos...</p>
              </div>
            )}

            {phase === "result" && (
              <>
                <BattleResult leftScore={leftScore} rightScore={rightScore} leftLeaks={leftLeaks} rightLeaks={rightLeaks} leftLabel={leftLabel} rightLabel={rightLabel} onShare={handleShare} />
                <div className="mt-8 flex justify-center gap-4">
                  <Button variant="outline" onClick={handleReset}>New battle</Button>
                  <Button asChild variant="ghost"><Link href="/audit/new">Check your own aura</Link></Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
