"use client";

import { Card } from "@/components/ui/Card";
import type { LaunchChecklistItem } from "@/types/launch";

interface Props {
  items: LaunchChecklistItem[];
  onToggle: (id: string) => void;
  onReset: () => void;
  progress: { checked: number; total: number; percent: number };
}

export function LaunchChecklist({ items, onToggle, onReset, progress }: Props) {
  const categories = [...new Set(items.map((i) => i.category))];

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Manual Launch Checklist</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{progress.checked}/{progress.total}</span>
          <button onClick={onReset} className="text-[10px] text-purple-400 hover:underline">Reset</button>
        </div>
      </div>
      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress.percent}%` }} />
      </div>
      <div className="space-y-3 max-h-96 overflow-auto">
        {categories.map((cat) => (
          <div key={cat}>
            <div className="mb-1 text-[10px] font-medium text-gray-500 uppercase">{cat}</div>
            {items.filter((i) => i.category === cat).map((item) => (
              <label key={item.id} className="flex items-start gap-2 rounded px-2 py-1 hover:bg-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => onToggle(item.id)}
                  className="mt-0.5 h-3 w-3 rounded border-white/20 bg-white/5 accent-purple-500"
                />
                <span className={`text-[10px] ${item.checked ? "text-gray-500 line-through" : "text-gray-300"}`}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
