import type { ComponentProps, ReactNode } from "react";

const control =
  "h-12 w-full rounded-[var(--radius-field)] border border-[var(--line)] bg-[var(--surface-raised)] " +
  "px-3.5 text-[0.9375rem] text-[var(--ink)] placeholder:text-[var(--ink-subtle)] " +
  "transition-colors hover:border-[var(--ink-subtle)]";

/* Libellé au-dessus, aide en dessous. Jamais de placeholder en guise de label. */
export function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-[var(--ink-muted)]">{hint}</p>}
    </div>
  );
}

export function TextInput({ className, ...rest }: ComponentProps<"input">) {
  return <input className={`${control} ${className ?? ""}`} {...rest} />;
}

export function Select({ className, ...rest }: ComponentProps<"select">) {
  return <select className={`${control} ${className ?? ""}`} {...rest} />;
}

export function StepHeading({
  title,
  intro,
}: {
  title: string;
  intro?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-semibold leading-[1.12] tracking-[-0.03em]">
        {title}
      </h1>
      {intro && (
        <p className="mt-3 leading-relaxed text-[var(--ink-muted)]">{intro}</p>
      )}
    </div>
  );
}
