import { cn } from "@/lib/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "solid" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variants = {
  // Darkroom-editorial theme: solid vermilion accent
  primary:
    "bg-[#E14434] text-white shadow-[0_2px_14px_rgba(225,68,52,0.28)] hover:bg-[#c73922] hover:shadow-[0_6px_22px_rgba(225,68,52,0.4)] btn-aurora",
  solid:
    "bg-[#E14434] text-white shadow-[0_2px_14px_rgba(225,68,52,0.28)] hover:bg-[#c73922] hover:shadow-[0_6px_22px_rgba(225,68,52,0.4)] btn-aurora",
  secondary:
    "bg-[#1C1917] text-[#F2ECE1] hover:bg-[#2c2723] btn-aurora",
  ghost: "text-[#6F675E] hover:text-[#1C1917] hover:bg-[#1c1917]/[0.05]",
  outline:
    "border border-[#1c1917]/25 text-[#1C1917] hover:bg-[#1c1917]/[0.05] hover:border-[#1c1917]/40 btn-aurora",
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
        "inline-flex items-center justify-center font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E14434]/50 disabled:opacity-40 disabled:pointer-events-none",
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
