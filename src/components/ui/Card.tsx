import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2 | 3;
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, level = 2, interactive = false, children, ...props }, ref) => {
    
    const levels = {
      1: "glass-1 rounded-[32px]",
      2: "glass-2 rounded-3xl",
      3: "glass-3 rounded-2xl",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          levels[level],
          interactive && "hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)] hover:border-smash-border-highlight cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";
