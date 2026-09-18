import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/src/lib/utils";

/**
 * shadcn/ui badge, themed with the SMASH palette. Keeps the app's original
 * variant and statusColor API.
 */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/15 text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-red-500/30 bg-red-500/15 text-red-300",
        warning: "border-amber-500/30 bg-amber-500/15 text-amber-300",
        image: "border-white/10 bg-white/5 text-foreground/90",
        video: "border-white/10 bg-white/5 text-foreground/90",
        text: "border-white/10 bg-white/5 text-foreground/90",
        audio: "border-white/10 bg-white/5 text-foreground/90",
        connection: "border-[#7C3AED]/30 bg-[#7C3AED]/15 text-[#C4B5FD]",
        outline: "border-white/10 bg-white/5 text-foreground/90",
        status: "",
      },
    },
    defaultVariants: { variant: "outline" },
  }
);

const statusColors = {
  connected: "border-violet-500/30 bg-violet-500/15 text-[#C4B5FD]",
  generating: "border-rose-500/30 bg-rose-500/15 text-rose-300",
  error: "border-red-500/30 bg-red-500/15 text-red-300",
  warning: "border-rose-500/30 bg-rose-500/15 text-orange-300",
  paused: "border-[#D946EF]/30 bg-[#D946EF]/15 text-[#D946EF]",
  offline: "border-gray-500/30 bg-gray-500/15 text-gray-300",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'warning' | 'image' | 'video' | 'text' | 'audio' | 'connection' | 'outline' | 'status';
  statusColor?: keyof typeof statusColors;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'outline', statusColor, ...props }: BadgeProps, ref) => (
    <span
      ref={ref}
      data-slot="badge"
      className={cn(
        badgeVariants({ variant }),
        variant === 'status' && statusColor && statusColors[statusColor],
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { badgeVariants };
