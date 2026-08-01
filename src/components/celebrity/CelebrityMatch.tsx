"use client";

import Link from "next/link";
import { FadeInView } from "@/components/ui/FadeInView";
import { Badge } from "@/components/ui/Badge";
import { CountUp } from "@/components/ui/CountUp";
import type { MatchResult } from "@/lib/aura-engine/celebrityMatch";
import { getAspirationalMessage } from "@/lib/aura-engine/celebrityMatch";

export function CelebrityMatch({ matches, userImage }: { matches: MatchResult[]; userImage?: string }) {
  if (!matches || matches.length === 0) return null;

  const top = matches[0];

  return (
    <div className="mb-8 space-y-6">
      {/* Hero: Your Celebrity Match */}
      <FadeInView>
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.08] via-red-500/[0.04] to-transparent p-6 sm:p-8 text-center">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-red-500/10 blur-3xl" />

          <Badge variant="premium" className="mb-4">
            ✨ Your Aspirational Match
          </Badge>

          {/* You now → your target look — the aspirational side-by-side */}
          {userImage ? (
            <div className="mx-auto mb-4 flex max-w-sm items-center justify-center gap-2 sm:gap-3">
              <figure className="w-28 sm:w-32">
                <div className="overflow-hidden rounded-2xl border border-[#1c1917]/15 shadow">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={userImage} alt="You now" className="aspect-[4/5] w-full object-cover" />
                </div>
                <figcaption className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#857b6e]">You now</figcaption>
              </figure>
              <div className="flex flex-col items-center">
                <span className="text-xl text-amber-500">→</span>
                <span className="mt-0.5 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600">{top.matchScore}%</span>
              </div>
              <figure className="w-28 sm:w-32">
                <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={top.celebrity.lookImage} alt={`${top.celebrity.name} look`} className="aspect-[4/5] w-full object-cover" loading="lazy" />
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-black/45 px-1.5 py-0.5 text-sm">{top.celebrity.photo}</span>
                </div>
                <figcaption className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-amber-600">Your target</figcaption>
              </figure>
            </div>
          ) : (
            <div className="mx-auto mb-4 w-40 sm:w-48">
              <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={top.celebrity.lookImage} alt={`${top.celebrity.name} look`} className="aspect-[4/5] w-full object-cover" loading="lazy" />
                <span className="absolute right-1.5 top-1.5 rounded-full bg-black/45 px-1.5 py-0.5 text-sm">{top.celebrity.photo}</span>
              </div>
              <p className="mt-1 text-[10px] text-[#857b6e]">The {top.celebrity.name.split(" ")[0]} look — the aesthetic to aim for</p>
            </div>
          )}

          <h2 className="mb-1 bg-gradient-to-r from-amber-200 via-white to-amber-200 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
            {top.celebrity.name}
          </h2>
          <p className="mb-4 text-sm text-amber-300/80">{top.celebrity.title}</p>

          {/* Match percentage */}
          <div className="mx-auto mb-4 max-w-xs">
            <div className="mb-1 flex items-center justify-between text-xs text-[#6f675e]">
              <span>Style Match</span>
              <span className="font-bold text-amber-400">
                <CountUp target={top.matchScore} duration={1200} />%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#1c1917]/[0.04]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-1200 ease-out"
                style={{ width: `${top.matchScore}%` }}
              />
            </div>
          </div>

          {/* Why this match */}
          <div className="mx-auto max-w-md space-y-1.5">
            {top.matchReasons.map((reason) => (
              <div key={reason} className="flex items-center gap-2 text-xs text-[#4a443d]">
                <span className="text-amber-400">✓</span> {reason}
              </div>
            ))}
          </div>

          {/* Aspirational message */}
          <p className="mx-auto mt-5 max-w-md text-sm font-medium text-[#1c1917]/90">
            {getAspirationalMessage(top)}
          </p>

          {/* Your path to this look — the concrete gap to close */}
          {top.gapReasons.length > 0 && (
            <div className="mx-auto mt-4 max-w-md rounded-xl border border-amber-500/20 bg-white/50 p-3.5 text-left">
              <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-amber-600">
                Close the gap → look the part
              </p>
              <div className="space-y-1.5">
                {top.gapReasons.map((g) => (
                  <div key={g} className="flex items-start gap-2 text-xs text-[#4a443d]">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-[10px] text-amber-600">→</span>
                    {g}
                  </div>
                ))}
                <div className="flex items-start gap-2 text-xs text-[#4a443d]">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-[10px] text-amber-600">→</span>
                  {top.celebrity.improvementNote}
                </div>
              </div>
            </div>
          )}
        </div>
      </FadeInView>

      {/* Upsell — turn this match into a real AI photoshoot */}
      <FadeInView delay={60}>
        <Link
          href={`/photoshoot?aesthetic=${encodeURIComponent(`${top.celebrity.name} — ${top.celebrity.style}`)}`}
          className="group block overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-red-500/5 p-4 transition hover:border-amber-500/50"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-red-500 text-xl">
              📸
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#1c1917]">
                Get an AI photoshoot in the {top.celebrity.name.split(" ")[0]} look
              </p>
              <p className="mt-0.5 text-[11px] text-[#857b6e]">
                Upload a few selfies → studio portraits in this exact aesthetic, ready for Insta,
                LinkedIn &amp; dating.
              </p>
            </div>
            <span className="shrink-0 text-amber-600 transition group-hover:translate-x-0.5">→</span>
          </div>
        </Link>
      </FadeInView>

      {/* Other matches */}
      {matches.length > 1 && (
        <FadeInView delay={100}>
          <div className="grid gap-3 sm:grid-cols-2">
            {matches.slice(1).map((match) => (
              <div
                key={match.celebrity.name}
                className="rounded-xl border border-[#1c1917]/10 bg-[#1c1917]/[0.03] p-4"
              >
                <div className="mb-2 flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-amber-500/25">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={match.celebrity.lookImage} alt={`${match.celebrity.name} look`} className="h-full w-full object-cover" loading="lazy" />
                    <span className="absolute right-0.5 top-0.5 rounded-full bg-black/45 px-1 text-[11px] leading-tight">{match.celebrity.photo}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[#1C1917]">
                      {match.celebrity.name}
                    </div>
                    <div className="text-[10px] text-[#857b6e]">
                      {match.celebrity.title}
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-lg font-bold text-amber-400">
                      {match.matchScore}%
                    </div>
                    <div className="text-[9px] text-[#9c9184]">match</div>
                  </div>
                </div>
                <p className="text-[11px] text-[#6f675e] line-clamp-2">
                  {match.celebrity.style}
                </p>
                {match.gapReasons[0] && (
                  <p className="mt-2 text-[10px] text-red-300">
                    💡 {match.gapReasons[0]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </FadeInView>
      )}

      {/* Shop the Look */}
      <FadeInView delay={200}>
        <div className="rounded-2xl border border-red-500/20 bg-gradient-to-b from-red-500/[0.06] to-transparent p-5">
          <h3 className="mb-1 text-center text-sm font-bold text-[#1C1917]">
            🛍️ Shop the Look — {top.celebrity.name}
          </h3>
          <p className="mb-4 text-center text-[11px] text-[#857b6e]">
            {top.celebrity.improvementNote}
          </p>

          {top.celebrity.shopLinks.map((section) => (
            <div key={section.category} className="mb-4">
              <div className="mb-2 text-xs font-semibold text-red-300">
                {section.category}
              </div>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border border-[#1c1917]/10 bg-[#1c1917]/[0.03] px-3 py-2.5 transition-colors hover:bg-[#1c1917]/[0.04]"
                  >
                    <div>
                      <div className="text-xs font-medium text-[#1C1917]">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-[#857b6e]">
                        Tap to shop on Myntra/Amazon
                      </div>
                    </div>
                    <div className="text-sm font-bold text-amber-400">
                      {item.price}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}

          {/* Other celebrity shops */}
          {matches.length > 1 && (
            <details className="group">
              <summary className="cursor-pointer text-center text-[11px] text-red-300 hover:text-red-200">
                See styles from {matches[1]?.celebrity.name} and{" "}
                {matches[2]?.celebrity.name} →
              </summary>
              <div className="mt-3 space-y-3">
                {matches.slice(1).map((match) =>
                  match.celebrity.shopLinks.map((section) => (
                    <div key={`${match.celebrity.name}-${section.category}`}>
                      <div className="mb-1.5 text-[10px] font-semibold text-[#6f675e]">
                        {match.celebrity.photo} {match.celebrity.name} —{" "}
                        {section.category}
                      </div>
                      <div className="space-y-1.5">
                        {section.items.map((item) => (
                          <a
                            key={item.name}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between rounded-lg border border-[#1c1917]/[0.08] bg-[#1c1917]/[0.02] px-3 py-2 transition-colors hover:bg-[#1c1917]/[0.04]"
                          >
                            <span className="text-[11px] text-[#4a443d]">
                              {item.name}
                            </span>
                            <span className="text-xs font-bold text-amber-400">
                              {item.price}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </details>
          )}
        </div>
      </FadeInView>
    </div>
  );
}
