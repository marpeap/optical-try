import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

/*
  Rayons : pill intégral pour tout élément interactif (règle du système).
  Contrastes vérifiés sur les deux thèmes : l'accent porte toujours
  --accent-ink, jamais une couleur héritée.
*/
const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium " +
  "transition-[transform,background-color,border-color] duration-200 ease-out " +
  "active:translate-y-[1px] disabled:opacity-45 disabled:pointer-events-none";

const sizes = {
  md: "h-11 px-6 text-[0.9375rem]",
  lg: "h-13 px-8 text-base",
} as const;

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[var(--accent-hover)]",
  secondary:
    "border border-[var(--line)] bg-[var(--surface-raised)] text-[var(--ink)] hover:border-[var(--ink-subtle)]",
  ghost: "text-[var(--ink)] hover:bg-[var(--surface-sunken)]",
};

function classes(variant: Variant, size: keyof typeof sizes, extra?: string) {
  return [base, sizes[size], variants[variant], extra].filter(Boolean).join(" ");
}

type SharedProps = {
  variant?: Variant;
  size?: keyof typeof sizes;
  children: ReactNode;
  className?: string;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: SharedProps & ComponentProps<"button">) {
  return (
    <button className={classes(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: SharedProps & ComponentProps<typeof Link>) {
  return (
    <Link className={classes(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
