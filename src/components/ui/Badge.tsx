import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'image' | 'video' | 'text' | 'audio' | 'connection' | 'outline' | 'status';
  statusColor?: 'connected' | 'generating' | 'error' | 'warning' | 'paused' | 'offline';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'outline', statusColor, children, ...props }, ref) => {
    
    const variants = {
      image: "glass-3",
      video: "glass-3",
      text: "glass-3",
      audio: "glass-3",
      connection: "bg-[#7C3AED]/15 text-[#C4B5FD] border-[#7C3AED]/30", // Matches badge-api
      outline: "glass-3",
      status: "", // Handled by statusColor
    };
    
    const statusColors = {
      connected: "bg-violet-500/15 text-[#C4B5FD] border-violet-500/30", // Matches badge-local
      generating: "bg-rose-500/15 text-rose-300 border-rose-500/30",
      error: "bg-red-500/15 text-red-300 border-red-500/30",
      warning: "bg-rose-500/15 text-orange-300 border-rose-500/30",
      paused: "bg-[#D946EF]/15 text-[#D946EF] border-[#D946EF]/30",
      offline: "bg-gray-500/15 text-gray-300 border-gray-500/30",
    };

    const appliedVariant = variant === 'status' && statusColor ? statusColors[statusColor] : variants[variant];

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-sm text-[8px] font-black tracking-tighter uppercase border",
          appliedVariant,
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = "Badge";
