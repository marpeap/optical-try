"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState, saveWizardState } from "@/lib/wizardState";

export function PaiementStep() {
  const router = useRouter();
  const [numeroCarte, setNumeroCarte] = useState("");

  function handlePayer() {
    const state = loadWizardState();
    if (state) {
      saveWizardState({ ...state, paiement: { statut: "valide" } });
    }
    router.push("/commande/confirmation");
  }

  return (
    <div>
      <h1>Paiement</h1>
      <p>Démo — aucune vraie transaction n&apos;est effectuée.</p>
      <label htmlFor="carte">Numéro de carte</label>
      <input
        id="carte"
        value={numeroCarte}
        onChange={(e) => setNumeroCarte(e.target.value)}
        placeholder="4242 4242 4242 4242"
      />

      <button type="button" onClick={handlePayer}>
        Payer
      </button>
    </div>
  );
}
