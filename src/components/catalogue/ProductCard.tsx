import Link from "next/link";
import type { Frame } from "@/lib/types";
import { FrameVisual } from "./FrameVisual";

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
      <FrameVisual frame={frame} priority={priority} />

      {/* Le nom du modèle doit rester lisible sur la carte : avec une photo,
          il n'apparaît plus dans le visuel, seulement dans son texte de
          remplacement. */}
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--ink-muted)]">{frame.marque}</p>
          <h3 className="mt-0.5 text-[1.0625rem] font-medium tracking-[-0.01em]">
            {frame.nom}
          </h3>
          {/* Les espaces encadrant le séparateur sont explicites : sans eux,
              les lecteurs d'écran annoncent "Noir·carrée" d'un seul tenant. */}
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            {frame.couleur} <span className="text-[var(--ink-subtle)]">·</span>{" "}
            {frame.forme}
          </p>
        </div>
        <p className="font-medium tabular-nums">{`${frame.prix} €`}</p>
      </div>
    </Link>
  );
}
