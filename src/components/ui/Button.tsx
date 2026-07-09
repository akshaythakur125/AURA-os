import { cn } from "@/lib/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variants = {
  primary:
    "bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-[length:200%_100%] text-white hover:from-purple-500 hover:via-pink-400 hover:to-purple-500 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 btn-aurora",
  secondary:
    "glass-card text-white hover:bg-white/10 btn-aurora",
  ghost: "text-gray-400 hover:text-white hover:bg-white/5",
  outline:
    "border border-purple-500/40 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400/60 btn-aurora",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
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
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:pointer-events-none",
        "active:scale-[0.97]",
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
