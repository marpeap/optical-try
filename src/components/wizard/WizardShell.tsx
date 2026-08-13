"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState, type WizardState } from "@/lib/wizardState";

export const WIZARD_STEPS = [
  { id: "ordonnance", label: "Ordonnance" },
  { id: "verification", label: "Vérification" },
  { id: "infos-perso", label: "Coordonnées" },
  { id: "mutuelle", label: "Mutuelle" },
  { id: "tiers-payant", label: "Tiers payant" },
  { id: "devis", label: "Devis" },
  { id: "reste-a-charge", label: "Reste à charge" },
  { id: "paiement", label: "Paiement" },
  { id: "confirmation", label: "Confirmation" },
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number]["id"];

export function WizardShell({
  currentStep,
  children,
}: {
  currentStep: WizardStepId;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [state, setState] = useState<WizardState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loaded = loadWizardState();
    if (!loaded) {
      router.push("/catalogue");
      return;
    }
    setState(loaded);
    setReady(true);
  }, [router]);

  if (!ready) return null;

  const index = WIZARD_STEPS.findIndex((s) => s.id === currentStep);
  const progression = ((index + 1) / WIZARD_STEPS.length) * 100;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 md:py-16">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-medium">
          {WIZARD_STEPS[index].label}
        </p>
        <p className="text-sm tabular-nums text-[var(--ink-subtle)]">
          {index + 1} / {WIZARD_STEPS.length}
        </p>
      </div>

      <div
        className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--surface-sunken)]"
        role="progressbar"
        aria-valuenow={index + 1}
        aria-valuemin={1}
        aria-valuemax={WIZARD_STEPS.length}
        aria-label="Progression de la commande"
      >
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500 ease-out"
          style={{ width: `${progression}%` }}
        />
      </div>

      {state && (
        <p className="mt-6 text-sm text-[var(--ink-muted)]">
          {state.frame.marque} {state.frame.nom}
          <span className="px-2 text-[var(--ink-subtle)]">·</span>
          {`${state.frame.prix} €`}
        </p>
      )}

      <div className="mt-10">{children}</div>
    </div>
  );
}
