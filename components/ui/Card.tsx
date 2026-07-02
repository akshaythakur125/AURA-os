import { cn } from "@/lib/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass-card relative overflow-hidden rounded-[28px] p-6 text-white/92",
        "before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-white/28 before:content-['']",
        hover &&
          "transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-300/28 hover:shadow-[0_26px_72px_rgba(8,47,73,0.38)]",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {children}
    </div>
  );
}
