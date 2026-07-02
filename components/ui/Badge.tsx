import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "premium";
  className?: string;
}

const variants = {
  default: "border border-white/12 bg-white/8 text-white/72",
  success: "border border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
  warning: "border border-orange-300/20 bg-orange-300/10 text-orange-200",
  danger: "border border-rose-300/20 bg-rose-300/10 text-rose-200",
  premium:
    "border border-sky-200/20 bg-[linear-gradient(135deg,rgba(125,211,252,0.18),rgba(249,115,22,0.14))] text-sky-100",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
