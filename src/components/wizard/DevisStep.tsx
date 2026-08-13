"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState, saveWizardState, type WizardState } from "@/lib/wizardState";
import {
  computeDevis,
  computeResteACharge,
  equipement100Sante,
} from "@/lib/fakeCalculations";
import { Button } from "@/components/ui/Button";
import { StepHeading } from "./WizardField";

function Ligne({
  label,
  montant,
  fort = false,
}: {
  label: string;
  montant: string;
  fort?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 ${
        fort ? "text-base font-medium" : "text-[0.9375rem]"
      }`}
    >
      <span className={fort ? "" : "text-[var(--ink-muted)]"}>{label}</span>
      <span className="tabular-nums">{montant}</span>
    </div>
  );
}

export function DevisStep() {
  const router = useRouter();
  const [state, setState] = useState<WizardState | null>(null);

  useEffect(() => setState(loadWizardState()), []);

  if (!state) {
    return <p className="text-[var(--ink-muted)]">Calcul du devis…</p>;
  }

  const devis = computeDevis(state.frame);
  const panierA = equipement100Sante();
  const resteChoisi = state.mutuelle
    ? computeResteACharge(devis, state.frame, state.mutuelle).montant
    : null;

  function handleContinuer() {
    const current = loadWizardState();
    if (current) saveWizardState({ ...current, devis });
    router.push("/commande/reste-a-charge");
  }

  return (
    <div>
      <StepHeading
        title="Votre devis"
        intro="La réglementation impose de vous présenter l'offre 100% Santé à côté de l'équipement que vous avez choisi. Les deux sont ci-dessous."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border-2 border-[var(--accent)] p-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--accent)]">
            Votre choix
          </p>
          <p className="mt-3 font-medium">
            {state.frame.marque} {state.frame.nom}
          </p>

          <div className="mt-5 grid gap-2.5 border-t border-[var(--line)] pt-4">
            <Ligne label="Monture" montant={`${devis.prixMonture} €`} />
            <Ligne
              label="Verres unifocaux"
              montant={`${devis.prixVerres} €`}
            />
            <div className="mt-1 border-t border-[var(--line)] pt-3">
              <Ligne label="Total" montant={`${devis.total} €`} fort />
            </div>
            {resteChoisi !== null && (
              <p className="mt-2 text-sm text-[var(--ink-muted)]">
                Reste à charge estimé :{" "}
                <span className="font-medium tabular-nums text-[var(--ink)]">
                  {`${resteChoisi} €`}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[var(--radius-card)] border border-[var(--line)] p-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--ink-subtle)]">
            Offre 100% Santé
          </p>
          <p className="mt-3 font-medium">Équipement de classe A</p>

          <div className="mt-5 grid gap-2.5 border-t border-[var(--line)] pt-4">
            <Ligne label="Monture" montant="30 €" />
            <Ligne label="Verres unifocaux" montant="95 €" />
            <div className="mt-1 border-t border-[var(--line)] pt-3">
              <Ligne label="Total" montant={`${panierA.total} €`} fort />
            </div>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Reste à charge :{" "}
              <span className="font-medium text-[var(--ink)]">0 €</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button size="lg" onClick={handleContinuer}>
          Poursuivre avec ma monture
        </Button>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[var(--ink-subtle)]">
        Simulation. Un devis normalisé réel est établi par l&apos;opticien et
        engage des montants contractuels.
      </p>
    </div>
  );
}
