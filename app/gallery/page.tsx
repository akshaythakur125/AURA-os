"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getGalleryEntries, getHallOfFame, getGalleryStats, addReaction, incrementViewCount } from "@/lib/storage/galleryStore";
import { trackEvent } from "@/lib/storage/analyticsStore";
import type { GalleryEntry } from "@/types/gallery";

type SortMode = "recent" | "highest" | "most_viewed" | "most_improved";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "highest", label: "Highest Aura" },
  { value: "most_improved", label: "Most Improved" },
  { value: "most_viewed", label: "Most Viewed" },
];

function AuraCard({ entry }: { entry: GalleryEntry }) {
  const [reactions, setReactions] = useState(entry.reactions);
  const [justReacted, setJustReacted] = useState<string | null>(null);

  const handleReaction = (type: "fire" | "hundred" | "crown" | "shock") => {
    const success = addReaction(entry.id, type);
    if (success) {
      setReactions(prev => ({ ...prev, [type]: (prev[type] || 0) + 1 }));
      setJustReacted(type);
      setTimeout(() => setJustReacted(null), 800);
      trackEvent("challenge_viewed", { source: "gallery_reaction", type });
    }
  };

  const handleView = () => {
    incrementViewCount(entry.id);
    trackEvent("proof_card_viewed", { source: "gallery", score: String(entry.score) });
  };

  const scoreColor = entry.score >= 85 ? "text-amber-400" : entry.score >= 70 ? "text-purple-400" : entry.score >= 50 ? "text-sky-400" : "text-gray-400";

  return (
    <div className="prism-panel float-card group rounded-[22px] p-4 transition-all duration-300 hover:shadow-[0_0_30px_rgba(147,51,234,0.1)]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${entry.score >= 80 ? 'from-purple-600 to-pink-500' : entry.score >= 60 ? 'from-sky-600 to-purple-500' : 'from-gray-600 to-sky-500'} text-xs font-bold text-white`}>
            {entry.nickname.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{entry.nickname}</div>
            {entry.city && <div className="text-[10px] text-gray-500">{entry.city}</div>}
          </div>
        </div>
        <div className={`text-2xl font-bold ${scoreColor}`}>{entry.score}</div>
      </div>

      <div className="mt-3">
        <p className="text-xs text-gray-400 italic">"{entry.oneLineVerdict}"</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">{entry.strongestSignal}</span>
        <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-400">{entry.biggestLeak}</span>
        <Badge variant="default">{entry.category}</Badge>
      </div>

      {entry.improvement && entry.improvement > 0 && (
        <div className="mt-2 text-[10px] text-emerald-400">
          +{entry.improvement} pts improved
        </div>
      )}

      {/* Reactions */}
      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex gap-2">
          {(["fire", "hundred", "crown", "shock"] as const).map(r => {
            const icons: Record<string, string> = { fire: "🔥", hundred: "💯", crown: "👑", shock: "😱" };
            return (
              <button
                key={r}
                onClick={() => handleReaction(r)}
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-all ${
                  justReacted === r ? "scale-125 bg-purple-500/20" : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <span>{icons[r]}</span>
                <span className="text-gray-500">{reactions[r] || 0}</span>
              </button>
            );
          })}
        </div>
        <Link
          href={`/audit/${entry.auditId}`}
          onClick={handleView}
          className="text-[10px] text-gray-500 hover:text-purple-400 transition-colors"
        >
          {entry.viewCount > 0 ? `${entry.viewCount} views` : "View"}
        </Link>
      </div>

      <div className="mt-2 text-center">
        <Link
          href="/audit/new"
          className="text-[10px] text-purple-400 hover:text-purple-300"
        >
          Check your score →
        </Link>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const [sort, setSort] = useState<SortMode>("recent");
  const [entries] = useState(() => getGalleryEntries(sort, 50));
  const [hallOfFame] = useState(() => getHallOfFame());
  const [stats] = useState(() => getGalleryStats());

  const sortedEntries = getGalleryEntries(sort, 50);

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <Badge variant="premium" className="mb-3">Aura Gallery</Badge>
          <h1 className="text-4xl font-bold text-white">Everyone here was sure they looked fine. See what they actually scored.</h1>
          <p className="mt-2 text-sm text-gray-400">
            {stats.totalEntries} entries · Highest: {stats.highestScore} · Average: {stats.averageScore} — most people score lower than they expect. Where do you fall?
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-4 gap-3">
          <div className="rounded-xl bg-white/5 p-3 text-center">
            <div className="text-lg font-bold text-white">{stats.totalEntries}</div>
            <div className="text-[10px] text-gray-500">Entries</div>
          </div>
          <div className="rounded-xl bg-white/5 p-3 text-center">
            <div className="text-lg font-bold text-amber-400">{stats.highestScore}</div>
            <div className="text-[10px] text-gray-500">Highest</div>
          </div>
          <div className="rounded-xl bg-white/5 p-3 text-center">
            <div className="text-lg font-bold text-purple-400">{stats.averageScore}</div>
            <div className="text-[10px] text-gray-500">Average</div>
          </div>
          <div className="rounded-xl bg-white/5 p-3 text-center">
            <div className="text-lg font-bold text-white">{stats.totalViews}</div>
            <div className="text-[10px] text-gray-500">Views</div>
          </div>
        </div>

        {/* Hall of Fame */}
        {hallOfFame.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-white">🏆 Aura Hall of Fame (85+)</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {hallOfFame.slice(0, 6).map(entry => (
                <AuraCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        )}

        {/* Sort Controls */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">All Entries</h2>
          <div className="flex gap-1.5">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`rounded-full px-3 py-1 text-[11px] transition-all ${
                  sort === opt.value
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "bg-white/5 text-gray-400 border border-transparent hover:text-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedEntries.map(entry => (
            <AuraCard key={entry.id} entry={entry} />
          ))}
        </div>

        {sortedEntries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No entries yet. Be the first!</p>
            <div className="mt-4">
              <Button asChild><Link href="/audit/new">Get your Aura Score</Link></Button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="mb-3 text-sm text-white/55">You just spent time judging other people&apos;s scores. Right now, someone is doing the same thing to your photo — and you have no idea what they&apos;re thinking.</p>
          <Button asChild><Link href="/audit/new">Find out what they see — free</Link></Button>
        </div>

        {/* ─── Shoppable CTA ─── */}
        <div className="mt-12 rounded-[22px] border border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-transparent p-6 text-center">
          <h3 className="text-lg font-bold text-white">The people at the top all had one thing in common.</h3>
          <p className="mt-2 text-sm text-white/50">They all had a leak they couldn&apos;t see — until they checked. They fixed it for under Rs 500. Now they&apos;re in the Hall of Fame. You&apos;re still scrolling.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button asChild size="sm"><Link href="/audit/new">Get your score</Link></Button>
            <Button asChild size="sm" variant="outline"><Link href="/shop">Shop top fixes →</Link></Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
