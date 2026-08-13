"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState, saveWizardState, type Mutuelle } from "@/lib/wizardState";

export function MutuelleStep() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [niveauCouverture, setNiveauCouverture] =
    useState<Mutuelle["niveauCouverture"]>("responsable");

  function handleContinuer() {
    const state = loadWizardState();
    if (state) {
      saveWizardState({ ...state, mutuelle: { nom, niveauCouverture } });
    }
    router.push("/commande/tiers-payant");
  }

  return (
    <div>
      <h1>Votre mutuelle</h1>
      <label htmlFor="mutuelle-nom">Nom de votre mutuelle</label>
      <input id="mutuelle-nom" value={nom} onChange={(e) => setNom(e.target.value)} />

      <label htmlFor="mutuelle-niveau">Niveau de couverture</label>
      <select
        id="mutuelle-niveau"
        aria-label="Niveau de couverture"
        value={niveauCouverture}
        onChange={(e) => setNiveauCouverture(e.target.value as Mutuelle["niveauCouverture"])}
      >
        <option value="basique">Basique</option>
        <option value="responsable">Responsable</option>
        <option value="premium">Premium</option>
      </select>

      <button type="button" onClick={handleContinuer}>
        Continuer
      </button>
    </div>
  );
}
