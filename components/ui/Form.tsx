"use client";

import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
  className,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  hint?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

const fieldBase =
  "h-11 w-full rounded-xl border border-hairline/15 bg-ink/[0.03] px-3.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-brand/50 focus:bg-ink/[0.05]";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldBase, props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(fieldBase, "appearance-none bg-surface", props.className)}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        fieldBase,
        "h-auto min-h-[88px] resize-y py-2.5",
        props.className,
      )}
    />
  );
}
