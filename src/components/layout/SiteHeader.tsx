import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

const NAV = [
  { href: "/catalogue", label: "Montures" },
  { href: "/catalogue?tri=essayage", label: "Essayage" },
  { href: "/prise-en-charge", label: "Prise en charge" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1400px] items-center gap-8 px-6">
        <Link
          href="/"
          className="text-[1.0625rem] font-semibold tracking-[-0.02em]"
        >
          Alves
        </Link>

        <nav className="hidden flex-1 items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto md:ml-0">
          <ButtonLink href="/catalogue" size="md">
            Voir les montures
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
