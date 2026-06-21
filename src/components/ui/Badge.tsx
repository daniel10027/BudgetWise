import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "sage" | "coral" | "gold";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-line/60 text-ink-soft",
    sage: "bg-sage-100 text-sage-700",
    coral: "bg-coral-100 text-coral-600",
    gold: "bg-gold-100 text-gold-600",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
