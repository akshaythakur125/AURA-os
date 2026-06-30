import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface SampleReportCardProps {
  title: string;
  score: number;
  badgeText: string;
  badgeVariant?: "premium" | "success" | "warning" | "default";
  gradient: string;
  leaks?: { title: string; severity: string }[];
  children?: React.ReactNode;
}

export function SampleReportCard({ title, score, badgeText, badgeVariant = "premium", gradient, leaks, children }: SampleReportCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className={`mb-4 flex h-20 items-end justify-end rounded-xl bg-gradient-to-br ${gradient} p-4`}>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{score}</div>
          <div className="text-xs text-white/70">sample score</div>
        </div>
      </div>
      <div className="mb-3 flex items-center gap-2">
        <Badge variant={badgeVariant}>{badgeText}</Badge>
        <span className="text-sm font-semibold text-white">{title}</span>
      </div>
      {children}
      {leaks && leaks.length > 0 && (
        <div className="mt-3 space-y-1">
          {leaks.map((l) => (
            <div key={l.title} className="flex items-start gap-2 text-xs">
              <div className={`mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full ${l.severity === "high" ? "bg-red-400" : l.severity === "medium" ? "bg-amber-400" : "bg-blue-400"}`} />
              <div>
                <span className="text-gray-300">{l.title}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
