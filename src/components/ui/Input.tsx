import * as React from "react";
import { cn } from "@/src/lib/utils";

const fieldBase =
  "w-full min-w-0 rounded-lg border border-input bg-smash-surface/80 text-sm text-foreground shadow-xs transition-[color,box-shadow,background-color,border-color] duration-200 outline-none placeholder:text-smash-text-tertiary selection:bg-primary/30 hover:border-white/15 focus:border-primary/60 focus:bg-smash-surface-hover focus:ring-[3px] focus:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

/** shadcn/ui input with an optional leading icon. */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, type, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {icon && (
          <div className="pointer-events-none absolute left-3 flex items-center text-smash-text-tertiary">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          data-slot="input"
          className={cn(
            fieldBase,
            "h-10 px-3 py-1 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
            icon && "pl-9",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

/** shadcn/ui textarea. */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(fieldBase, "min-h-[100px] resize-none p-3", className)}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
