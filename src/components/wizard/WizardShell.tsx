"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState } from "@/lib/wizardState";
import styles from "./WizardShell.module.css";

export const WIZARD_STEPS = [
  "ordonnance",
  "verification",
  "infos-perso",
  "mutuelle",
  "tiers-payant",
  "devis",
  "reste-a-charge",
  "paiement",
  "confirmation",
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number];

export function WizardShell({
  currentStep,
  children,
}: {
  currentStep: WizardStepId;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const state = loadWizardState();
    if (!state) {
      router.push("/catalogue");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  const stepIndex = WIZARD_STEPS.indexOf(currentStep);

  return (
    <div className={styles.shell}>
      <p className={styles.progress}>
        Étape {stepIndex + 1} / {WIZARD_STEPS.length}
      </p>
      {children}
    </div>
  );
}
