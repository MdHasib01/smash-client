import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-smash-text-tertiary">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-smash-surface border border-smash-border rounded-md h-10 px-3 text-sm transition-all duration-300",
            "focus:outline-none focus:ring-1 focus:ring-smash-accent-violet focus:border-smash-accent-violet/50 focus:bg-smash-surface-hover",
            "placeholder:text-smash-text-tertiary text-smash-text-primary",
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

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-smash-surface border border-smash-border rounded-lg p-3 text-sm transition-all duration-300 resize-none min-h-[100px]",
          "focus:outline-none focus:ring-1 focus:ring-smash-accent-violet focus:border-smash-accent-violet/50 focus:bg-smash-surface-hover",
          "placeholder:text-smash-text-tertiary text-smash-text-primary",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
