import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "premium";
  className?: string;
}

const variants = {
  default: "bg-white/[0.07] text-[#4a443d] badge-embossed",
  success: "bg-emerald-500/10 text-emerald-400 badge-embossed",
  warning: "bg-amber-500/10 text-amber-400 badge-embossed",
  danger: "bg-red-500/10 text-red-400 badge-embossed",
  premium: "bg-gradient-to-r from-red-500/15 via-red-500/15 to-blue-500/15 text-red-300 badge-embossed aurora-border",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
