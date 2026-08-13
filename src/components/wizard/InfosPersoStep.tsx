"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState, saveWizardState } from "@/lib/wizardState";

export function InfosPersoStep() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");

  function handleContinuer() {
    const state = loadWizardState();
    if (state) {
      saveWizardState({ ...state, infosPerso: { nom, prenom, email } });
    }
    router.push("/commande/mutuelle");
  }

  return (
    <div>
      <h1>Vos informations</h1>
      <label htmlFor="nom">Nom</label>
      <input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} />

      <label htmlFor="prenom">Prénom</label>
      <input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />

      <label htmlFor="email">Email</label>
      <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

      <button type="button" onClick={handleContinuer}>
        Continuer
      </button>
    </div>
  );
}
