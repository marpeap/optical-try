import Link from "next/link";
import type { Frame } from "@/lib/types";

/*
  Visuel produit : aucune photographie sous licence n'est disponible pour ces
  montures. Plutôt qu'une fausse photo générique, la vignette assume un
  traitement typographique sur la teinte réelle de la monture. L'essayage
  fournit l'image véritable du produit.
*/
export function ProductCard({
  frame,
  priority = false,
}: {
  frame: Frame;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/catalogue/${frame.slug}`}
      className="group block focus-visible:outline-none"
    >
      <div
        className="relative flex aspect-[4/3] items-end overflow-hidden rounded-[var(--radius-card)] p-6 transition-transform duration-300 ease-out group-hover:-translate-y-1"
        style={{ backgroundColor: frame.couleurHex }}
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/10"
        />
        <p className="font-display relative text-[2rem] font-semibold leading-none tracking-[-0.03em] text-white/95">
          {frame.nom}
        </p>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--ink-muted)]">{frame.marque}</p>
          <p className="mt-0.5 font-medium">
            {frame.couleur}
            <span className="px-1.5 text-[var(--ink-subtle)]">·</span>
            <span className="font-normal text-[var(--ink-muted)]">
              {frame.forme}
            </span>
          </p>
        </div>
        <p className="font-medium tabular-nums">{`${frame.prix} €`}</p>
      </div>
    </Link>
  );
}
