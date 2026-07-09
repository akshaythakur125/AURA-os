import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "premium";
  className?: string;
}

const variants = {
  default: "bg-white/10 text-gray-300 badge-embossed",
  success: "bg-emerald-500/15 text-emerald-400 badge-embossed",
  warning: "bg-amber-500/15 text-amber-400 badge-embossed",
  danger: "bg-red-500/15 text-red-400 badge-embossed",
  premium: "bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 text-purple-300 badge-embossed aurora-border",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
