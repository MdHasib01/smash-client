import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/src/lib/utils";

/**
 * shadcn/ui card with the SMASH glass levels:
 * 1 = large panels, 2 = cards/items, 3 = floating/nested surfaces.
 */
const cardVariants = cva(
  "relative overflow-hidden text-card-foreground transition-all duration-300",
  {
    variants: {
      level: {
        1: "glass-1 rounded-3xl",
        2: "glass-2 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        3: "glass-3 rounded-xl",
      },
      interactive: {
        true: "cursor-pointer hover:-translate-y-0.5 hover:border-smash-border-highlight hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)]",
        false: "",
      },
    },
    defaultVariants: { level: 2, interactive: false },
  }
);

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2 | 3;
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, level = 2, interactive = false, ...props }: CardProps, ref) => (
    <div ref={ref} data-slot="card" className={cn(cardVariants({ level, interactive }), className)} {...props} />
  )
);
Card.displayName = "Card";

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-header" className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-title" className={cn("font-semibold leading-none tracking-tight text-foreground", className)} {...props} />
  );
}

export function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-description" className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("flex items-center p-6 pt-0", className)} {...props} />;
}

export { cardVariants };
