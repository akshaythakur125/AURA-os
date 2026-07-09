import Link from "next/link";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-gray-600">{icon}</div>}
      <h3 className="mb-2 text-sm font-semibold text-gray-300">{title}</h3>
      {description && <p className="mb-6 max-w-xs text-xs text-gray-500">{description}</p>}
      {actionLabel && (actionHref ? (
        <Link href={actionHref} className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:from-purple-500 hover:to-pink-400">{actionLabel}</Link>
      ) : onAction ? (
        <button onClick={onAction} className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:from-purple-500 hover:to-pink-400">{actionLabel}</button>
      ) : null)}
    </div>
  );
  return content;
}
