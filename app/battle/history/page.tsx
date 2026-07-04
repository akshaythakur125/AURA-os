"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getBattles, getBattleStats } from "@/lib/storage/battleStore";
import type { BattleRecord } from "@/types";

export default function BattleHistoryPage() {
  const [battles] = useState(() => getBattles());
  const [stats] = useState(() => getBattleStats());

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <Badge variant="default" className="mb-3">Battle History</Badge>
          <h1 className="text-4xl font-bold text-white">Your Battles</h1>
        </div>

        {battles.length === 0 ? (
          <div className="text-center py-12">
            <p className="mb-4 text-gray-400">No battles yet. Challenge a friend!</p>
            <Button asChild><Link href="/battle">Start a battle</Link></Button>
          </div>
        ) : (
          <>
            <div className="mb-8 grid grid-cols-4 gap-4">
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-emerald-400">{stats.wins}</div>
                <div className="text-xs text-gray-500">Wins</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-red-400">{stats.losses}</div>
                <div className="text-xs text-gray-500">Losses</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-white">{stats.avgScore}</div>
                <div className="text-xs text-gray-500">Avg Score</div>
              </Card>
            </div>

            <div className="space-y-3">
              {battles.map((battle) => (
                <Card key={battle.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className={`text-xl ${battle.winner === "left" ? "" : battle.winner === "right" ? "" : ""}`}>
                      {battle.winner === "left" ? "👑" : battle.winner === "right" ? "😢" : "🤝"}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {battle.leftLabel} ({battle.leftScore}) vs {battle.rightLabel} ({battle.rightScore})
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {new Date(battle.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {battle.status === "invited" ? "Awaiting friend" : battle.status === "completed" ? "Completed" : "Local"}
                      </div>
                    </div>
                  </div>
                  <Badge variant={battle.winner === "left" ? "premium" : battle.winner === "right" ? "default" : "default"}>
                    {battle.winner === "left" ? "You Won" : battle.winner === "right" ? "You Lost" : "Tie"}
                  </Badge>
                </Card>
              ))}
            </div>
          </>
        )}

        <div className="mt-8 text-center">
          <Button asChild variant="outline"><Link href="/battle">New Battle</Link></Button>
        </div>
      </div>
    </Container>
  );
}
