import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-lg border border-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/50 transition-colors focus:outline-none focus:ring-2 focus:ring-sage-500/40 focus:border-sage-500",
            error && "border-coral-500 focus:ring-coral-500/30 focus:border-coral-500",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-ink-soft">{hint}</p>}
        {error && <p className="text-xs text-coral-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
