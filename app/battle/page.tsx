"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BattleUploader } from "@/components/battle/BattleUploader";
import { BattleResult } from "@/components/battle/BattleResult";
import { generateFreeAuraReport } from "@/lib/aura-engine/generateFreeAuraReport";
import { saveBattle, getBattleCount } from "@/lib/storage/battleStore";
import { trackEvent } from "@/lib/storage/analyticsStore";
import type { StatusLeak } from "@/types";

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
  // Start at 0 (SSR-safe) and read the real count on mount; reading
  // localStorage in the initializer would mismatch the server HTML for
  // returning users (React hydration #418).
  const [battleCount, setBattleCount] = useState(0);
  useEffect(() => {
    setBattleCount(getBattleCount());
  }, []);

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

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <Badge variant="default" className="mb-3">Aura Battle</Badge>
          <h1 className="mb-3 text-4xl font-bold text-white">Who has the higher aura?</h1>
          <p className="text-sm text-gray-400">
            Upload two photos. See who scores higher. {battleCount > 0 && `${battleCount} battles so far.`}
          </p>
        </div>

        {phase === "upload" && (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <BattleUploader side="left" label="You" onImage={setLeftImage} />
              <BattleUploader side="right" label="Them" onImage={setRightImage} />
            </div>

            {error && (
              <p className="mb-4 text-center text-sm text-red-400">{error}</p>
            )}

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
            <BattleResult
              leftScore={leftScore}
              rightScore={rightScore}
              leftLeaks={leftLeaks}
              rightLeaks={rightLeaks}
              leftLabel={leftLabel}
              rightLabel={rightLabel}
              onShare={handleShare}
            />
            <div className="mt-8 flex justify-center gap-4">
              <Button variant="outline" onClick={handleReset}>New battle</Button>
              <Button asChild variant="ghost"><Link href="/audit/new">Check your own aura</Link></Button>
            </div>
          </>
        )}
      </div>
    </Container>
  );
}
