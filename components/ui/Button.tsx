import { cloneElement, isValidElement } from "react";
import { cn } from "@/lib/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  asChild?: boolean;
}

const variants = {
  primary:
      "border border-white/20 bg-[linear-gradient(135deg,rgba(125,211,252,0.95),rgba(59,130,246,0.92)_45%,rgba(249,115,22,0.84))] text-slate-950 shadow-[0_18px_48px_rgba(56,189,248,0.3)] hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(249,115,22,0.3)] cta-shine",
  secondary:
    "border border-white/15 bg-white/10 text-white shadow-[0_14px_32px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 hover:bg-white/14",
  ghost:
    "border border-transparent text-white/72 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/6 hover:text-white",
  outline:
      "border border-sky-300/30 bg-sky-300/8 text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:-translate-y-0.5 hover:border-sky-200/50 hover:bg-sky-300/12 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]",
};

const sizes = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-13 px-7 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  asChild = false,
  ...props
}: ButtonProps) {
  const buttonClassName = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.02em] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-300/45 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

  if (asChild && isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown> & { className?: string }>;

    return cloneElement(child, {
      ...props,
      className: cn(child.props.className, buttonClassName),
    });
  }

  return (
    <button
      className={buttonClassName}
      {...props}
    >
      {children}
    </button>
  );
}
