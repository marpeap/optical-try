"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Frame } from "@/lib/types";
import { TryOnTrigger } from "./TryOnTrigger";
import { TryOnOverlay } from "@/components/tryon/TryOnOverlay";

export function ProductDetail({ frame }: { frame: Frame }) {
  const [tryOnOpen, setTryOnOpen] = useState(false);

  return (
    <article>
      <Image src={frame.images[0]} alt={frame.nom} width={480} height={320} />
      <p>{frame.marque}</p>
      <h1>{frame.nom}</h1>
      <p>{frame.prix} €</p>
      <p>Forme : {frame.forme}</p>
      <p>Couleur : {frame.couleur}</p>

      <TryOnTrigger frame={frame} onOpen={() => setTryOnOpen(true)} />
      {tryOnOpen && <TryOnOverlay frame={frame} onClose={() => setTryOnOpen(false)} />}

      <Link href={`/commande/ordonnance/init?frame=${frame.slug}`}>Choisir cette monture</Link>
    </article>
  );
}
