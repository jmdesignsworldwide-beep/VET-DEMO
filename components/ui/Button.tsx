"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "accent";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", loading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-focus";
    const styles = {
      primary:
        "bg-gradient-to-r from-brand to-brand-glow text-[#04201d] shadow-glow",
      accent:
        "bg-gradient-to-r from-accent to-accent-glow text-[#3a0d18] shadow-glow-accent",
      ghost: "glass hover:shadow-glow",
    } as const;

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, styles[variant], className)}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
