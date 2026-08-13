"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "@phosphor-icons/react";
import { clearWizardState, loadWizardState, type WizardState } from "@/lib/wizardState";
import { Button } from "@/components/ui/Button";

const SUITE = [
  {
    titre: "Contrôle par un opticien",
    detail: "Votre ordonnance et votre commande sont vérifiées sous 24 h ouvrées.",
  },
  {
    titre: "Montage des verres",
    detail: "Vos verres sont taillés à votre correction puis montés sur la monture.",
  },
  {
    titre: "Expédition",
    detail: "Livraison sous 8 à 10 jours ouvrés, suivi envoyé par email.",
  },
];

export function ConfirmationStep() {
  const router = useRouter();
  const [state, setState] = useState<WizardState | null>(null);

  useEffect(() => setState(loadWizardState()), []);

  function handleRecommencer() {
    clearWizardState();
    router.push("/catalogue");
  }

  return (
    <div>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)]">
        <Check size={26} weight="bold" />
      </div>

      <h1 className="mt-6 text-3xl font-semibold leading-[1.12] tracking-[-0.03em]">
        Commande confirmée
      </h1>
      <p className="mt-3 leading-relaxed text-[var(--ink-muted)]">
        {state
          ? `Votre ${state.frame.marque} ${state.frame.nom} est en préparation.`
          : "Votre commande est en préparation."}{" "}
        Le devis et la facture sont disponibles dans votre espace client.
      </p>

      <ol className="mt-10 grid gap-6">
        {SUITE.map((etape, i) => (
          <li key={etape.titre} className="flex gap-4">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-sunken)] text-sm font-medium tabular-nums">
              {i + 1}
            </span>
            <span>
              <span className="block font-medium">{etape.titre}</span>
              <span className="mt-1 block text-sm leading-relaxed text-[var(--ink-muted)]">
                {etape.detail}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-10 border-t border-[var(--line)] pt-8">
        <p className="text-sm text-[var(--ink-muted)]">
          Cette démonstration n&apos;a généré aucune commande réelle.
        </p>
        <div className="mt-4">
          <Button variant="secondary" onClick={handleRecommencer}>
            Recommencer une démo
          </Button>
        </div>
      </div>
    </div>
  );
}
