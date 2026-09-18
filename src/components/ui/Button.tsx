import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

/**
 * shadcn/ui button, themed with the SMASH palette. Keeps the app's original
 * variant names (primary/secondary/tertiary/icon/danger/success) alongside the
 * standard shadcn ones (default/outline/destructive/link).
 */
const buttonVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-tight transition-all duration-200 outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-primary text-white border-0 shadow-[0_0_20px_rgba(217,70,239,0.35)] hover:shadow-[0_0_28px_rgba(217,70,239,0.55)] hover:brightness-110",
        default:
          "bg-gradient-primary text-white border-0 shadow-[0_0_20px_rgba(217,70,239,0.35)] hover:shadow-[0_0_28px_rgba(217,70,239,0.55)] hover:brightness-110",
        secondary:
          "border border-white/10 bg-white/[0.06] text-foreground backdrop-blur-md hover:bg-white/10 hover:border-white/15",
        tertiary:
          "border border-border bg-transparent text-muted-foreground hover:border-white/15 hover:bg-smash-surface hover:text-foreground",
        outline:
          "border border-border bg-transparent text-foreground hover:border-white/15 hover:bg-accent",
        ghost:
          "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
        icon:
          "rounded-lg border border-white/10 bg-white/[0.06] text-muted-foreground backdrop-blur-md hover:bg-white/10 hover:text-foreground",
        danger:
          "border border-smash-status-error/20 bg-smash-status-error/10 text-smash-status-error hover:border-smash-status-error/30 hover:bg-smash-status-error/20",
        destructive:
          "border border-smash-status-error/20 bg-smash-status-error/10 text-smash-status-error hover:border-smash-status-error/30 hover:bg-smash-status-error/20",
        success:
          "border border-smash-status-connected/20 bg-smash-status-connected/10 text-smash-status-connected hover:border-smash-status-connected/30 hover:bg-smash-status-connected/20",
        link: "h-auto px-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 gap-1 rounded-lg px-2.5 text-xs",
        sm: "h-8 gap-1.5 rounded-lg px-3 text-xs",
        md: "h-10 px-4",
        default: "h-10 px-4",
        lg: "h-12 px-8 text-base",
        icon: "size-10",
        "icon-sm": "size-8 rounded-lg",
        "icon-xs": "size-6 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, isLoading, children, ...props }: ButtonProps, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);

    if (asChild) {
      return (
        <Slot.Root ref={ref} data-slot="button" className={classes} {...props}>
          {children}
        </Slot.Root>
      );
    }

    const isGradient = variant === "primary" || variant === "default";

    return (
      <button
        ref={ref}
        data-slot="button"
        data-variant={variant}
        className={classes}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isGradient && !isLoading && (
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
            <span className="absolute top-0 left-[-100%] h-full w-[50%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_3s_infinite]" />
          </span>
        )}
        {isLoading && <Loader2 size={16} className="animate-spin" />}
        {isGradient ? (
          <span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
