"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState, saveWizardState } from "@/lib/wizardState";
import { computeDevis } from "@/lib/fakeCalculations";
import type { Devis } from "@/lib/wizardState";

export function DevisStep() {
  const router = useRouter();
  const [devis, setDevis] = useState<Devis | null>(null);

  useEffect(() => {
    const state = loadWizardState();
    if (!state) return;
    setDevis(computeDevis(state.frame));
  }, []);

  function handleContinuer() {
    const state = loadWizardState();
    if (state && devis) {
      saveWizardState({ ...state, devis });
    }
    router.push("/commande/reste-a-charge");
  }

  if (!devis) return <p>Chargement…</p>;

  return (
    <div>
      <h1>Votre devis</h1>
      <p>Monture : {devis.prixMonture} €</p>
      <p>Verres : {devis.prixVerres} €</p>
      <p>Total : {devis.total} €</p>

      <button type="button" onClick={handleContinuer}>
        Continuer
      </button>
    </div>
  );
}
