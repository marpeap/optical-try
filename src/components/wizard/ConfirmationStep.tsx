"use client";

import { useRouter } from "next/navigation";
import { clearWizardState } from "@/lib/wizardState";

export function ConfirmationStep() {
  const router = useRouter();

  function handleRecommencer() {
    clearWizardState();
    router.push("/catalogue");
  }

  return (
    <div>
      <h1>Commande confirmée</h1>
      <p>Votre commande, facture et suivi de commande sont disponibles dans votre espace client.</p>
      <p>Ceci est une démonstration — aucune commande réelle n&apos;a été passée.</p>

      <button type="button" onClick={handleRecommencer}>
        Recommencer une démo
      </button>
    </div>
  );
}
