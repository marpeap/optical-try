"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState, saveWizardState } from "@/lib/wizardState";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, StepHeading } from "./WizardField";

export function InfosPersoStep() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");

  const complet = nom.trim() && prenom.trim() && email.trim();

  function handleContinuer() {
    const state = loadWizardState();
    if (state) saveWizardState({ ...state, infosPerso: { nom, prenom, email } });
    router.push("/commande/mutuelle");
  }

  return (
    <div>
      <StepHeading
        title="Vos coordonnées"
        intro="Elles servent au suivi de commande et à l'envoi de votre devis."
      />

      <div className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="prenom" label="Prénom">
            <TextInput
              id="prenom"
              autoComplete="given-name"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
            />
          </Field>

          <Field id="nom" label="Nom">
            <TextInput
              id="nom"
              autoComplete="family-name"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </Field>
        </div>

        <Field
          id="email"
          label="Email"
          hint="Votre devis normalisé y sera envoyé."
        >
          <TextInput
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-8">
        <Button size="lg" onClick={handleContinuer} disabled={!complet}>
          Continuer
        </Button>
      </div>
    </div>
  );
}
