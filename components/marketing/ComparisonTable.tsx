const COMPARISON_ROWS: { label: string; free: string | boolean; aura: string | boolean; dating: string | boolean; glowup: string | boolean }[] = [
  { label: "Aura Score", free: true, aura: true, dating: false, glowup: false },
  { label: "Basic status leak", free: true, aura: true, dating: false, glowup: false },
  { label: "Full visual breakdown", free: false, aura: true, dating: false, glowup: false },
  { label: "Status archetype", free: "Optional", aura: true, dating: false, glowup: false },
  { label: "Signal mismatch map", free: false, aura: true, dating: false, glowup: false },
  { label: "Profile text review", free: false, aura: false, dating: true, glowup: false },
  { label: "Bio/prompt suggestions", free: false, aura: false, dating: true, glowup: false },
  { label: "30-day missions", free: false, aura: false, dating: false, glowup: true },
  { label: "Budget upgrade roadmap", free: true, aura: true, dating: false, glowup: true },
  { label: "Marketplace bundle", free: false, aura: true, dating: true, glowup: false },
  { label: "Shareable card", free: false, aura: true, dating: false, glowup: false },
  { label: "Print/save report", free: false, aura: true, dating: true, glowup: true },
];

function Cell({ val }: { val: string | boolean }) {
  if (val === true) return <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
  if (val === false) return <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
  return <span className="text-xs text-amber-400">{val}</span>;
}

interface ComparisonTableProps {
  className?: string;
}

export function ComparisonTable({ className }: ComparisonTableProps) {
  return (
    <div className={`overflow-x-auto ${className || ""}`}>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-white/5">
            <th className="pb-3 pr-4 text-gray-500 font-medium">Feature</th>
            <th className="pb-3 pr-4 text-white font-medium">Free</th>
            <th className="pb-3 pr-4 text-purple-300 font-medium">₹99 Report</th>
            <th className="pb-3 pr-4 text-rose-300 font-medium">₹299 Dating</th>
            <th className="pb-3 text-amber-300 font-medium">₹499 30-Day Reset</th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map((row) => (
            <tr key={row.label} className="border-b border-white/5">
              <td className="py-2.5 pr-4 text-gray-300">{row.label}</td>
              <td className="py-2.5 pr-4"><Cell val={row.free} /></td>
              <td className="py-2.5 pr-4"><Cell val={row.aura} /></td>
              <td className="py-2.5 pr-4"><Cell val={row.dating} /></td>
              <td className="py-2.5"><Cell val={row.glowup} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
