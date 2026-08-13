"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState, saveWizardState } from "@/lib/wizardState";
import { Button } from "@/components/ui/Button";
import { StepHeading } from "./WizardField";

export function TiersPayantStep() {
  const router = useRouter();
  const [simule, setSimule] = useState(false);

  function handleContinuer() {
    const state = loadWizardState();
    if (state) {
      saveWizardState({
        ...state,
        tiersPayant: {
          simule,
          organisme: simule ? state.mutuelle?.nom ?? null : null,
        },
      });
    }
    router.push("/commande/devis");
  }

  return (
    <div>
      <StepHeading
        title="Tiers payant"
        intro="Avec le tiers payant, vous ne réglez que votre reste à charge. Votre mutuelle verse sa part directement à l'opticien."
      />

      <label
        className={`flex cursor-pointer gap-3.5 rounded-[var(--radius-card)] border p-5 transition-colors ${
          simule
            ? "border-[var(--accent)] bg-[var(--surface-sunken)]"
            : "border-[var(--line)] hover:border-[var(--ink-subtle)]"
        }`}
      >
        <input
          type="checkbox"
          checked={simule}
          onChange={(e) => setSimule(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
        />
        <span>
          <span className="block font-medium">
            Simuler une prise en charge par ma mutuelle
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-[var(--ink-muted)]">
            Le devis affichera alors le montant réellement à régler, part
            mutuelle déduite.
          </span>
        </span>
      </label>

      <div className="mt-8">
        <Button size="lg" onClick={handleContinuer}>
          Continuer
        </Button>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[var(--ink-subtle)]">
        Démonstration : aucune demande n&apos;est transmise à un opérateur de
        tiers payant. Le tiers payant réel suppose une convention entre
        l&apos;opticien et votre organisme.
      </p>
    </div>
  );
}
