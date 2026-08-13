"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState, saveWizardState } from "@/lib/wizardState";
import { computeResteACharge } from "@/lib/fakeCalculations";
import type { ResteACharge } from "@/lib/wizardState";

export function ResteAChargeStep() {
  const router = useRouter();
  const [resteACharge, setResteACharge] = useState<ResteACharge | null>(null);

  useEffect(() => {
    const state = loadWizardState();
    if (!state?.devis || !state.mutuelle) return;
    setResteACharge(computeResteACharge(state.devis, state.frame, state.mutuelle));
  }, []);

  function handleContinuer() {
    const state = loadWizardState();
    if (state && resteACharge) {
      saveWizardState({ ...state, resteACharge });
    }
    router.push("/commande/paiement");
  }

  if (!resteACharge) return <p>Chargement…</p>;

  return (
    <div>
      <h1>Reste à charge</h1>
      <p>
        Reste à charge estimé : <strong>{resteACharge.montant} €</strong>
      </p>
      {resteACharge.detailClasse === "A" && (
        <p>Cette monture fait partie de l&apos;offre 100% Santé : reste à charge nul.</p>
      )}

      <button type="button" onClick={handleContinuer}>
        Continuer
      </button>
    </div>
  );
}
