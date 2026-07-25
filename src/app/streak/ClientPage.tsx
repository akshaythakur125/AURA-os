"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GlowOrb } from "@/components/ui/GlowOrb";
import { FadeInView } from "@/components/ui/FadeInView";
import { getAudits } from "@/lib/storage/auditStore";

const WEEK = 7 * 864e5;
const weekOf = (iso: string) => Math.floor(new Date(iso).getTime() / WEEK);

interface Stats {
  streak: number;
  doneThisWeek: boolean;
  total: number;
  best: number | null;
  latest: number | null;
  trend: "up" | "down" | "flat" | null;
  spark: number[];
}

function compute(): Stats {
  const scored = getAudits()
    .filter((a) => typeof a.freeScore === "number")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  if (scored.length === 0) return { streak: 0, doneThisWeek: false, total: 0, best: null, latest: null, trend: null, spark: [] };

  const weeks = new Set(scored.map((a) => weekOf(a.createdAt)));
  const cur = weekOf(new Date().toISOString());
  const doneThisWeek = weeks.has(cur);
  let streak = 0;
  let w = doneThisWeek ? cur : cur - 1;
  while (weeks.has(w)) { streak++; w--; }

  const scores = scored.map((a) => a.freeScore as number);
  const latest = scores[scores.length - 1];
  const prev = scores.length > 1 ? scores[scores.length - 2] : null;
  const trend = prev == null ? null : latest > prev + 1 ? "up" : latest < prev - 1 ? "down" : "flat";

  return {
    streak,
    doneThisWeek,
    total: scored.length,
    best: Math.max(...scores),
    latest,
    trend,
    spark: scores.slice(-8),
  };
}

export default function StreakPage() {
  const [s, setS] = useState<Stats | null>(null);
  useEffect(() => { setS(compute()); }, []);

  return (
    <>
      <div className="aurora-mesh" />
      <Container className="relative py-10 sm:py-14">
        <GlowOrb color="rgba(225, 68, 52, 0.10)" size={320} className="top-[8%] right-[6%]" delay={0} />
        <div className="mx-auto max-w-lg">
          <FadeInView>
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold tracking-tight text-[#1C1917] sm:text-5xl">Your Aura Streak <span className="text-[#E14434]">🔥</span></h1>
              <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[#6F675E]">Check a new photo each week to keep your streak alive and watch your score climb.</p>
            </div>
          </FadeInView>

          {s && s.total === 0 && (
            <FadeInView delay={100}>
              <Card className="py-12 text-center">
                <div className="mb-3 text-4xl">🔥</div>
                <p className="mb-2 text-lg font-semibold text-[#1C1917]">Start your streak</p>
                <p className="mx-auto mb-6 max-w-sm text-sm text-[#6f675e]">Do your first check and come back each week to build a streak and track your glow-up.</p>
                <Link href="/post-or-not"><Button>Do my first check</Button></Link>
              </Card>
            </FadeInView>
          )}

          {s && s.total > 0 && (
            <div className="space-y-5">
              <FadeInView>
                <Card className="text-center">
                  <div className="text-6xl font-bold text-[#E14434]">{s.streak}<span className="ml-1 text-2xl">🔥</span></div>
                  <p className="mt-1 text-sm font-medium text-[#4a443d]">week{s.streak === 1 ? "" : "s"} streak</p>
                  <div className={`mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${s.doneThisWeek ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-600" : "border-amber-400/30 bg-amber-500/10 text-amber-600"}`}>
                    {s.doneThisWeek ? "✓ Checked in this week" : "⏳ Check in this week to keep it alive"}
                  </div>
                </Card>
              </FadeInView>

              <FadeInView delay={80}>
                <div className="grid grid-cols-3 gap-3">
                  <Card className="text-center"><div className="text-2xl font-bold text-[#1C1917]">{s.total}</div><div className="text-[11px] text-[#857b6e]">total checks</div></Card>
                  <Card className="text-center"><div className="text-2xl font-bold text-[#1C1917]">{s.best}</div><div className="text-[11px] text-[#857b6e]">best score</div></Card>
                  <Card className="text-center"><div className="text-2xl font-bold text-[#1C1917]">{s.latest}{s.trend === "up" ? " ↑" : s.trend === "down" ? " ↓" : ""}</div><div className="text-[11px] text-[#857b6e]">latest</div></Card>
                </div>
              </FadeInView>

              {s.spark.length > 1 && (
                <FadeInView delay={140}>
                  <Card>
                    <h3 className="mb-3 text-sm font-semibold text-[#1C1917]">Your last {s.spark.length} scores</h3>
                    <div className="flex h-24 items-end gap-1.5">
                      {s.spark.map((v, i) => (
                        <div key={i} className="flex flex-1 flex-col items-center gap-1">
                          <div className="w-full rounded-t bg-gradient-to-t from-[#E14434] to-[#f59e0b]" style={{ height: `${Math.max(6, v)}%` }} />
                          <span className="text-[9px] text-[#9c9184]">{v}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </FadeInView>
              )}

              <FadeInView delay={200}>
                <div className="rounded-2xl border border-[#E14434]/20 bg-gradient-to-b from-[#E14434]/[0.06] to-transparent p-5 text-center">
                  <p className="text-sm font-semibold text-[#1C1917]">{s.doneThisWeek ? "Keep the momentum" : "Keep your streak alive"}</p>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-[#6f675e]">Run a fresh photo and see if you beat your best.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Link href="/post-or-not"><Button size="sm">Check a new photo</Button></Link>
                    <Link href="/dashboard"><Button size="sm" variant="secondary">My checks</Button></Link>
                  </div>
                </div>
              </FadeInView>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
