import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export default function Card({ children, className, glass = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        glass && "glass-card",
        "rounded-xl overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}