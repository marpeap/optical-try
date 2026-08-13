"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadSimple } from "@phosphor-icons/react";
import { simulateOcr } from "@/lib/fakeOcr";
import { loadWizardState, saveWizardState } from "@/lib/wizardState";
import { StepHeading } from "./WizardField";

export function OrdonnanceStep() {
  const router = useRouter();
  const [traitementEnCours, setTraitementEnCours] = useState(false);

  async function handleFile(file: File | null) {
    if (!file) return;
    setTraitementEnCours(true);

    const ordonnance = await simulateOcr();
    const state = loadWizardState();
    if (state) saveWizardState({ ...state, ordonnance });

    router.push("/commande/verification");
  }

  return (
    <div>
      <StepHeading
        title="Votre ordonnance"
        intro="Photographiez-la ou déposez le fichier. Les valeurs détectées vous seront soumises avant d'aller plus loin."
      />

      <label
        htmlFor="ordonnance-file"
        className={`flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--line)] px-6 py-14 text-center transition-colors ${
          traitementEnCours
            ? "pointer-events-none opacity-60"
            : "hover:border-[var(--accent)]"
        }`}
      >
        {traitementEnCours ? (
          <>
            <div
              aria-hidden
              className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--accent)]"
            />
            <p className="mt-4 font-medium">Traitement en cours</p>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              Lecture des valeurs de correction
            </p>
          </>
        ) : (
          <>
            <UploadSimple size={28} className="text-[var(--ink-subtle)]" />
            <p className="mt-4 font-medium">Photo de l&apos;ordonnance</p>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              JPG ou PNG, ordonnance de moins de 5 ans
            </p>
          </>
        )}
      </label>
      <input
        id="ordonnance-file"
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={traitementEnCours}
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      <p className="mt-6 text-xs leading-relaxed text-[var(--ink-subtle)]">
        Démonstration : aucune image n&apos;est envoyée ni conservée. Les
        valeurs affichées ensuite sont générées, elles ne proviennent pas de
        votre document.
      </p>
    </div>
  );
}
