"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState, saveWizardState, type ResteACharge } from "@/lib/wizardState";
import { computeResteACharge } from "@/lib/fakeCalculations";
import { Button } from "@/components/ui/Button";
import { StepHeading } from "./WizardField";

export function ResteAChargeStep() {
  const router = useRouter();
  const [resteACharge, setResteACharge] = useState<ResteACharge | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const state = loadWizardState();
    if (!state?.devis || !state.mutuelle) return;
    setTotal(state.devis.total);
    setResteACharge(
      computeResteACharge(state.devis, state.frame, state.mutuelle)
    );
  }, []);

  function handleContinuer() {
    const state = loadWizardState();
    if (state && resteACharge) saveWizardState({ ...state, resteACharge });
    router.push("/commande/paiement");
  }

  if (!resteACharge) {
    return <p className="text-[var(--ink-muted)]">Calcul en cours…</p>;
  }

  const partMutuelle = Math.round((total - resteACharge.montant) * 100) / 100;

  return (
    <div>
      <StepHeading title="Ce qui reste à votre charge" />

      <div className="rounded-[var(--radius-card)] bg-[var(--surface-sunken)] p-8">
        <p className="text-[4rem] font-semibold leading-none tracking-[-0.04em] tabular-nums">
          {`${resteACharge.montant} €`}
        </p>
        <p className="mt-4 leading-relaxed text-[var(--ink-muted)]">
          {resteACharge.detailClasse === "A"
            ? "Équipement 100% Santé : intégralement pris en charge."
            : "Montant à régler après intervention de votre mutuelle."}
        </p>
      </div>

      <dl className="mt-6 grid gap-3">
        <div className="flex items-baseline justify-between gap-4 text-[0.9375rem]">
          <dt className="text-[var(--ink-muted)]">Total de l&apos;équipement</dt>
          <dd className="tabular-nums">{`${total} €`}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 text-[0.9375rem]">
          <dt className="text-[var(--ink-muted)]">Pris en charge</dt>
          <dd className="tabular-nums">{`− ${partMutuelle} €`}</dd>
        </div>
      </dl>

      <div className="mt-8">
        <Button size="lg" onClick={handleContinuer}>
          Payer {`${resteACharge.montant} €`}
        </Button>
      </div>
    </div>
  );
}
