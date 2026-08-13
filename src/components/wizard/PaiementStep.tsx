"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockSimple } from "@phosphor-icons/react";
import { loadWizardState, saveWizardState } from "@/lib/wizardState";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, StepHeading } from "./WizardField";

export function PaiementStep() {
  const router = useRouter();
  const [numeroCarte, setNumeroCarte] = useState("");
  const [expiration, setExpiration] = useState("");
  const [cvc, setCvc] = useState("");

  function handlePayer() {
    const state = loadWizardState();
    if (state) saveWizardState({ ...state, paiement: { statut: "valide" } });
    router.push("/commande/confirmation");
  }

  return (
    <div>
      <StepHeading title="Paiement" />

      <div className="mb-6 flex items-start gap-2.5 rounded-[var(--radius-card)] bg-[var(--surface-sunken)] p-4">
        <LockSimple size={18} className="mt-0.5 shrink-0 text-[var(--ink-muted)]" />
        <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
          Démonstration. Aucun numéro n&apos;est transmis ni enregistré, aucun
          montant n&apos;est débité. N&apos;utilisez pas une vraie carte.
        </p>
      </div>

      <div className="grid gap-5">
        <Field id="carte" label="Numéro de carte">
          <TextInput
            id="carte"
            inputMode="numeric"
            autoComplete="off"
            value={numeroCarte}
            onChange={(e) => setNumeroCarte(e.target.value)}
            placeholder="4242 4242 4242 4242"
            className="tabular-nums"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="expiration" label="Expiration">
            <TextInput
              id="expiration"
              inputMode="numeric"
              autoComplete="off"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
              placeholder="09 / 29"
              className="tabular-nums"
            />
          </Field>

          <Field id="cvc" label="Cryptogramme">
            <TextInput
              id="cvc"
              inputMode="numeric"
              autoComplete="off"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              placeholder="123"
              className="tabular-nums"
            />
          </Field>
        </div>
      </div>

      <div className="mt-8">
        <Button size="lg" onClick={handlePayer}>
          Payer
        </Button>
      </div>
    </div>
  );
}
