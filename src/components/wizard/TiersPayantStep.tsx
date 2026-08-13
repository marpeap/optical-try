"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState, saveWizardState } from "@/lib/wizardState";

export function TiersPayantStep() {
  const router = useRouter();
  const [simule, setSimule] = useState(false);

  function handleContinuer() {
    const state = loadWizardState();
    if (state) {
      saveWizardState({
        ...state,
        tiersPayant: { simule, organisme: simule ? state.mutuelle?.nom ?? null : null },
      });
    }
    router.push("/commande/devis");
  }

  return (
    <div>
      <h1>Tiers payant</h1>
      <p>
        Cette démo simule une demande de tiers payant — aucune donnée n&apos;est transmise à un
        organisme réel.
      </p>
      <label>
        <input
          type="checkbox"
          checked={simule}
          onChange={(e) => setSimule(e.target.checked)}
        />
        Simuler une prise en charge par ma mutuelle
      </label>

      <button type="button" onClick={handleContinuer}>
        Continuer
      </button>
    </div>
  );
}
