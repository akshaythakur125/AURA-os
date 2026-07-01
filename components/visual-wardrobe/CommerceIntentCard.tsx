"use client";

import type { CommerceSearchIntent } from "@/types/visualWardrobe";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Props {
  intents: CommerceSearchIntent[];
}

export function CommerceIntentCard({ intents }: Props) {
  if (intents.length === 0) return null;

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-white">Clothes That Match This Diagnosis</h3>
      <div className="space-y-2">
        {intents.slice(0, 5).map((intent, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{intent.query}</span>
                <span className="text-[9px] text-gray-500">{intent.styleDirection.replace(/_/g, " ")}</span>
              </div>
              <div className="mt-0.5 flex flex-wrap gap-1">
                {intent.categories.map((c) => (
                  <span key={c} className="text-[9px] text-gray-500">{c}</span>
                ))}
                {intent.colorTags.map((c) => (
                  <span key={c} className="text-[9px] text-gray-600">{c}</span>
                ))}
              </div>
              <p className="mt-0.5 text-[9px] text-gray-500">{intent.reason}</p>
            </div>
            <Link
              href={`/wardrobe/search?query=${encodeURIComponent(intent.query)}&style=${intent.styleDirection}`}
            >
              <Button size="sm">Search</Button>
            </Link>
          </div>
        ))}
      </div>
    </Card>
  );
}
