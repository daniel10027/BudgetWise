import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const selectId = id || props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full rounded-lg border border-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-sage-500/40 focus:border-sage-500",
            error && "border-coral-500",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-coral-600">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
