import { cn } from "@/lib/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "solid" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variants = {
  primary:
    "bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white shadow-[0_2px_12px_rgba(147,51,234,0.3)] hover:shadow-[0_6px_24px_rgba(147,51,234,0.45)] hover:from-purple-500 hover:via-purple-400 hover:to-pink-400 btn-aurora",
  // Darkroom-editorial theme: solid vermilion on ink/cream
  solid:
    "bg-[#E14434] text-white shadow-[0_2px_14px_rgba(225,68,52,0.28)] hover:bg-[#c73922] hover:shadow-[0_6px_22px_rgba(225,68,52,0.4)] btn-aurora",
  secondary:
    "glass-card text-white hover:bg-white/[0.08] hover:border-white/[0.08] btn-aurora",
  ghost: "text-gray-400 hover:text-white hover:bg-white/[0.05]",
  outline:
    "border border-white/[0.12] text-gray-300 hover:bg-white/[0.05] hover:border-white/[0.2] hover:text-white btn-aurora",
};

const sizes = {
  sm: "px-3.5 py-1.5 text-[13px] rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-7 py-3.5 text-[15px] rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 disabled:opacity-40 disabled:pointer-events-none",
        "btn-spring",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
