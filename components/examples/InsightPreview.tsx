import { Card } from "@/components/ui/Card";

export function InsightPreview({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Card>
      <div className="mb-2 text-xs text-purple-400">{label}</div>
      <div className="text-sm text-gray-300">{children}</div>
    </Card>
  );
}
