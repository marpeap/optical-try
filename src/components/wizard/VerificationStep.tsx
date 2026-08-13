"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState, saveWizardState, type Ordonnance } from "@/lib/wizardState";

export function VerificationStep() {
  const router = useRouter();
  const [ordonnance, setOrdonnance] = useState<Ordonnance | null>(null);

  useEffect(() => {
    const state = loadWizardState();
    if (state?.ordonnance) setOrdonnance(state.ordonnance);
  }, []);

  function updateField(oeil: "od" | "og", champ: keyof Ordonnance["od"], valeur: number) {
    if (!ordonnance) return;
    setOrdonnance({ ...ordonnance, [oeil]: { ...ordonnance[oeil], [champ]: valeur } });
  }

  function handleValider() {
    if (!ordonnance) return;
    const state = loadWizardState();
    if (state) {
      saveWizardState({ ...state, ordonnance: { ...ordonnance, verifie: true } });
    }
    router.push("/commande/infos-perso");
  }

  if (!ordonnance) return <p>Chargement…</p>;

  return (
    <div>
      <h1>Vérifiez vos valeurs</h1>
      <p>Ces valeurs ont été détectées automatiquement. Vérifiez-les avant de continuer.</p>

      {(["od", "og"] as const).map((oeil) => (
        <fieldset key={oeil}>
          <legend>{oeil === "od" ? "Œil droit" : "Œil gauche"}</legend>
          {(["sph", "cyl", "axe", "add"] as const).map((champ) => (
            <label key={champ}>
              {champ.toUpperCase()}
              <input
                type="number"
                step="0.25"
                value={ordonnance[oeil][champ]}
                onChange={(e) => updateField(oeil, champ, Number(e.target.value))}
              />
            </label>
          ))}
        </fieldset>
      ))}

      <button type="button" onClick={handleValider}>
        Valider
      </button>
    </div>
  );
}
