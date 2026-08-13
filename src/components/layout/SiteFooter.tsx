import Link from "next/link";

const COLUMNS = [
  {
    title: "Boutique",
    links: [
      { href: "/catalogue", label: "Toutes les montures" },
      { href: "/catalogue?forme=ronde", label: "Formes rondes" },
      { href: "/catalogue?genre=femme", label: "Femme" },
      { href: "/catalogue?genre=homme", label: "Homme" },
    ],
  },
  {
    title: "Votre vue",
    links: [
      { href: "/prise-en-charge", label: "Mutuelle et remboursement" },
      { href: "/prise-en-charge#cent-pour-cent-sante", label: "100% Santé" },
      { href: "/prise-en-charge#ordonnance", label: "Transmettre une ordonnance" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--surface-sunken)]">
      <div className="mx-auto max-w-[1400px] px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="max-w-sm">
            <p className="text-[1.0625rem] font-semibold tracking-[-0.02em]">
              Alves
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">
              Opticien en ligne. Vos montures sont montées à votre correction
              par un opticien diplômé avant expédition.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-medium">{column.title}</p>
              <ul className="mt-4 grid gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-14 border-t border-[var(--line)] pt-6 text-xs leading-relaxed text-[var(--ink-subtle)]">
          Démonstration. Aucune commande n&apos;est traitée, aucun paiement
          n&apos;est encaissé et aucune donnée n&apos;est transmise à un
          organisme de santé.
        </p>
      </div>
    </footer>
  );
}
