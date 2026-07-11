"use client";

import { FadeInView } from "@/components/ui/FadeInView";
import { Badge } from "@/components/ui/Badge";
import { CountUp } from "@/components/ui/CountUp";
import type { MatchResult } from "@/lib/aura-engine/celebrityMatch";
import { getAspirationalMessage } from "@/lib/aura-engine/celebrityMatch";

export function CelebrityMatch({ matches }: { matches: MatchResult[] }) {
  if (!matches || matches.length === 0) return null;

  const top = matches[0];

  return (
    <div className="mb-8 space-y-6">
      {/* Hero: Your Celebrity Match */}
      <FadeInView>
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.08] via-purple-500/[0.04] to-transparent p-6 sm:p-8 text-center">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />

          <Badge variant="premium" className="mb-4">
            ✨ Celebrity Match
          </Badge>

          <div className="mb-4 text-5xl">{top.celebrity.photo}</div>

          <h2 className="mb-1 bg-gradient-to-r from-amber-200 via-white to-amber-200 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
            {top.celebrity.name}
          </h2>
          <p className="mb-4 text-sm text-amber-300/80">{top.celebrity.title}</p>

          {/* Match percentage */}
          <div className="mx-auto mb-4 max-w-xs">
            <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
              <span>Style Match</span>
              <span className="font-bold text-amber-400">
                <CountUp target={top.matchScore} duration={1200} />%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-purple-500 transition-all duration-1200 ease-out"
                style={{ width: `${top.matchScore}%` }}
              />
            </div>
          </div>

          {/* Why this match */}
          <div className="mx-auto max-w-md space-y-1.5">
            {top.matchReasons.map((reason) => (
              <div key={reason} className="flex items-center gap-2 text-xs text-gray-300">
                <span className="text-amber-400">✓</span> {reason}
              </div>
            ))}
          </div>

          {/* Aspirational message */}
          <p className="mx-auto mt-5 max-w-md text-sm font-medium text-white/90">
            {getAspirationalMessage(top)}
          </p>
        </div>
      </FadeInView>

      {/* Other matches */}
      {matches.length > 1 && (
        <FadeInView delay={100}>
          <div className="grid gap-3 sm:grid-cols-2">
            {matches.slice(1).map((match) => (
              <div
                key={match.celebrity.name}
                className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"
              >
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-2xl">{match.celebrity.photo}</span>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {match.celebrity.name}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {match.celebrity.title}
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-lg font-bold text-amber-400">
                      {match.matchScore}%
                    </div>
                    <div className="text-[9px] text-gray-600">match</div>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 line-clamp-2">
                  {match.celebrity.style}
                </p>
                {match.gapReasons[0] && (
                  <p className="mt-2 text-[10px] text-purple-300">
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
        <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-b from-purple-500/[0.06] to-transparent p-5">
          <h3 className="mb-1 text-center text-sm font-bold text-white">
            🛍️ Shop the Look — {top.celebrity.name}
          </h3>
          <p className="mb-4 text-center text-[11px] text-gray-500">
            {top.celebrity.improvementNote}
          </p>

          {top.celebrity.shopLinks.map((section) => (
            <div key={section.category} className="mb-4">
              <div className="mb-2 text-xs font-semibold text-purple-300">
                {section.category}
              </div>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 transition-colors hover:bg-white/[0.06]"
                  >
                    <div>
                      <div className="text-xs font-medium text-white">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-gray-500">
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
              <summary className="cursor-pointer text-center text-[11px] text-purple-300 hover:text-purple-200">
                See styles from {matches[1]?.celebrity.name} and{" "}
                {matches[2]?.celebrity.name} →
              </summary>
              <div className="mt-3 space-y-3">
                {matches.slice(1).map((match) =>
                  match.celebrity.shopLinks.map((section) => (
                    <div key={`${match.celebrity.name}-${section.category}`}>
                      <div className="mb-1.5 text-[10px] font-semibold text-gray-400">
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
                            className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 transition-colors hover:bg-white/[0.05]"
                          >
                            <span className="text-[11px] text-gray-300">
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
