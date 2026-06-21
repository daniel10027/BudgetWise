import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}

const variantClasses: Record<string, string> = {
  primary: "bg-sage-600 text-white hover:bg-sage-700 active:bg-sage-900 shadow-sm",
  secondary: "bg-paper-raised text-ink border border-line hover:bg-sage-50",
  ghost: "text-ink-soft hover:bg-sage-50 hover:text-ink",
  danger: "bg-coral-500 text-white hover:bg-coral-600 shadow-sm",
  outline: "border border-sage-600 text-sage-700 hover:bg-sage-50",
};

const sizeClasses: Record<string, string> = {
  sm: "text-xs px-3 py-1.5 rounded-md gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-lg gap-2",
  lg: "text-base px-6 py-3 rounded-lg gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-500",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
