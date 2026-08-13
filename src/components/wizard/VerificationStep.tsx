"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState, saveWizardState, type Ordonnance } from "@/lib/wizardState";
import { Button } from "@/components/ui/Button";
import { StepHeading } from "./WizardField";

const CHAMPS = [
  { cle: "sph", label: "SPH", aide: "Sphère" },
  { cle: "cyl", label: "CYL", aide: "Cylindre" },
  { cle: "axe", label: "AXE", aide: "0 à 180°" },
  { cle: "add", label: "ADD", aide: "Addition" },
] as const;

export function VerificationStep() {
  const router = useRouter();
  const [ordonnance, setOrdonnance] = useState<Ordonnance | null>(null);

  useEffect(() => {
    const state = loadWizardState();
    if (state?.ordonnance) setOrdonnance(state.ordonnance);
  }, []);

  function updateField(
    oeil: "od" | "og",
    champ: keyof Ordonnance["od"],
    valeur: number
  ) {
    if (!ordonnance) return;
    setOrdonnance({
      ...ordonnance,
      [oeil]: { ...ordonnance[oeil], [champ]: valeur },
    });
  }

  function handleValider() {
    if (!ordonnance) return;
    const state = loadWizardState();
    if (state) {
      saveWizardState({
        ...state,
        ordonnance: { ...ordonnance, verifie: true },
      });
    }
    router.push("/commande/infos-perso");
  }

  if (!ordonnance) {
    return <p className="text-[var(--ink-muted)]">Chargement des valeurs…</p>;
  }

  return (
    <div>
      <StepHeading
        title="Vérifiez vos valeurs"
        intro="Ces valeurs ont été détectées automatiquement. Corrigez-les si elles diffèrent de votre ordonnance : elles déterminent vos verres."
      />

      <div className="grid gap-6 sm:grid-cols-2">
        {(["od", "og"] as const).map((oeil) => (
          <fieldset
            key={oeil}
            className="rounded-[var(--radius-card)] border border-[var(--line)] p-5"
          >
            <legend className="px-1.5 text-sm font-medium">
              {oeil === "od" ? "Œil droit" : "Œil gauche"}
            </legend>

            <div className="mt-2 grid gap-4">
              {CHAMPS.map((champ) => {
                const id = `${oeil}-${champ.cle}`;
                return (
                  <div key={champ.cle} className="grid gap-1.5">
                    <label
                      htmlFor={id}
                      className="flex items-baseline justify-between gap-2 text-sm"
                    >
                      <span className="font-medium">{champ.label}</span>
                      <span className="text-xs text-[var(--ink-subtle)]">
                        {champ.aide}
                      </span>
                    </label>
                    <input
                      id={id}
                      type="number"
                      step="0.25"
                      value={ordonnance[oeil][champ.cle]}
                      onChange={(e) =>
                        updateField(oeil, champ.cle, Number(e.target.value))
                      }
                      className="h-11 w-full rounded-[var(--radius-field)] border border-[var(--line)] bg-[var(--surface-raised)] px-3 text-[0.9375rem] tabular-nums transition-colors hover:border-[var(--ink-subtle)]"
                    />
                  </div>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-8">
        <Button size="lg" onClick={handleValider}>
          Ces valeurs sont exactes
        </Button>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-[var(--ink-subtle)]">
        Un opticien diplômé contrôle la conformité de votre ordonnance avant
        montage des verres.
      </p>
    </div>
  );
}
