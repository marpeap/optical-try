"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Camera } from "@phosphor-icons/react/dist/ssr/Camera";
import type { Frame } from "@/lib/types";
import { TryOnOverlay } from "@/components/tryon/TryOnOverlay";
import { FrameVisual } from "@/components/catalogue/FrameVisual";
import { ButtonLink } from "@/components/ui/Button";

export function ProductDetail({
  frame: initialFrame,
  frames,
}: {
  frame: Frame;
  frames: Frame[];
}) {
  const [tryOnOpen, setTryOnOpen] = useState(false);
  /* L'essayage permet de changer de monture sans quitter la caméra ;
     la fiche suit cette sélection. */
  const [frame, setFrame] = useState(initialFrame);

  const caracteristiques = [
    { label: "Forme", valeur: frame.forme },
    { label: "Matière", valeur: frame.matiere },
    { label: "Coloris", valeur: frame.couleur },
    { label: "Genre", valeur: frame.genre },
  ];

  return (
    <>
      <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        <div className="grid gap-4">
          <FrameVisual frame={frame} taille="fiche" priority />

          {/* Vues secondaires dès qu'elles sont fournies. */}
          {frame.photos.length > 1 && (
            <div className="grid grid-cols-3 gap-4">
              {frame.photos.slice(1, 4).map((photo) => (
                <div
                  key={photo}
                  className="relative aspect-square overflow-hidden rounded-[var(--radius-card)]"
                  style={{ backgroundColor: frame.couleurHex }}
                >
                  <Image
                    src={photo}
                    alt={`${frame.marque} ${frame.nom}, autre vue`}
                    fill
                    sizes="(max-width: 1024px) 30vw, 15vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:pt-6">
          <nav className="text-sm text-[var(--ink-muted)]">
            <Link href="/catalogue" className="hover:text-[var(--ink)]">
              Montures
            </Link>
            <span className="px-2 text-[var(--ink-subtle)]">/</span>
            <span>{frame.marque}</span>
          </nav>

          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.03em] md:text-5xl">
            {frame.nom}
          </h1>
          <p className="mt-4 text-2xl font-medium tabular-nums">
            {`${frame.prix} €`}
          </p>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Monture seule. Verres à votre correction configurés à l&apos;étape
            suivante.
          </p>

          <p className="mt-8 max-w-md text-lg leading-relaxed text-[var(--ink-muted)]">
            {frame.description}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setTryOnOpen(true)}
              className="inline-flex h-13 items-center justify-center gap-2.5 rounded-full bg-[var(--accent)] px-8 text-base font-medium text-[var(--accent-ink)] transition-[background-color,transform] duration-200 hover:bg-[var(--accent-hover)] active:translate-y-[1px]"
            >
              <Camera size={20} weight="fill" />
              Essayer cette monture
            </button>
            <ButtonLink
              href={`/commande/ordonnance/init?frame=${frame.slug}`}
              variant="secondary"
              size="lg"
            >
              Choisir cette monture
            </ButtonLink>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-[var(--line)] pt-8">
            {caracteristiques.map((c) => (
              <div key={c.label}>
                <dt className="text-xs text-[var(--ink-subtle)]">{c.label}</dt>
                <dd className="mt-1 font-medium capitalize">{c.valeur}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {tryOnOpen && (
        <TryOnOverlay
          frame={frame}
          frames={frames}
          onSelectFrame={setFrame}
          onClose={() => setTryOnOpen(false)}
        />
      )}
    </>
  );
}
