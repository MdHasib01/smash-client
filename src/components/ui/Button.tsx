import * as React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { cn } from "@/src/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'icon' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    
    const baseStyles = "relative inline-flex items-center justify-center font-black tracking-tight transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D946EF] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] rounded-xl";
    
    const variants = {
      primary: "bg-gradient-primary text-white shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:shadow-[0_0_30px_rgba(217,70,239,0.6)] hover:brightness-110 border-0",
      secondary: "glass-2 hover:glass-3 text-smash-text-primary hover:text-white",
      tertiary: "bg-transparent border border-smash-border hover:border-smash-border-highlight text-smash-text-secondary hover:text-smash-text-primary hover:bg-smash-surface",
      ghost: "bg-transparent text-smash-text-secondary hover:text-smash-text-primary hover:bg-smash-surface-hover/50",
      icon: "glass-2 hover:glass-3 text-smash-text-secondary hover:text-white rounded-md",
      danger: "bg-smash-status-error/10 text-smash-status-error border border-smash-status-error/20 hover:bg-smash-status-error/20 hover:border-smash-status-error/30",
      success: "bg-smash-status-connected/10 text-smash-status-connected border border-smash-status-connected/20 hover:bg-smash-status-connected/20 hover:border-smash-status-connected/30",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-8 text-base",
      icon: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {/* Shimmer Effect for Primary */}
        {variant === 'primary' && !isLoading && (
          <span className="absolute inset-0 overflow-hidden rounded-md pointer-events-none">
            <span className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-[shimmer_3s_infinite]" />
          </span>
        )}
        
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </button>
    );
  }
);
Button.displayName = "Button";
