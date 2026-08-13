"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { simulateOcr } from "@/lib/fakeOcr";
import { loadWizardState, saveWizardState } from "@/lib/wizardState";

export function OrdonnanceStep() {
  const router = useRouter();
  const [traitementEnCours, setTraitementEnCours] = useState(false);

  async function handleFile(file: File | null) {
    if (!file) return;
    setTraitementEnCours(true);

    const ordonnance = await simulateOcr();
    const state = loadWizardState();
    if (state) {
      saveWizardState({ ...state, ordonnance });
    }

    router.push("/commande/verification");
  }

  return (
    <div>
      <h1>Votre ordonnance</h1>
      <label htmlFor="ordonnance-file">Photo de l&apos;ordonnance</label>
      <input
        id="ordonnance-file"
        type="file"
        accept="image/*"
        disabled={traitementEnCours}
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
      {traitementEnCours && <p>Traitement en cours…</p>}
    </div>
  );
}
