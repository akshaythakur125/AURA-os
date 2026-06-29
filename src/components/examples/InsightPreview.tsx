import { Card } from "@/components/ui/Card";

interface InsightPreviewProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  value?: string;
}

export function InsightPreview({
  icon,
  title,
  description,
  value,
}: InsightPreviewProps) {
  return (
    <Card className="flex items-start gap-4">
      {icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-500/10">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-medium text-white">{title}</h4>
          {value && (
            <span className="shrink-0 text-xs text-amber-400">{value}</span>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-gray-400">
          {description}
        </p>
      </div>
    </Card>
  );
}
