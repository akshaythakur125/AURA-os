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
        "rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 backdrop-blur-sm",
        hover && "transition-all duration-300 hover:border-purple-500/30 hover:from-white/[0.1] hover:to-white/[0.04] hover:shadow-lg hover:shadow-purple-500/5",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
