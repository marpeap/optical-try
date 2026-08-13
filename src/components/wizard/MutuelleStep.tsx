"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState, saveWizardState, type Mutuelle } from "@/lib/wizardState";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, StepHeading } from "./WizardField";

const NIVEAUX: {
  valeur: Mutuelle["niveauCouverture"];
  titre: string;
  detail: string;
}[] = [
  {
    valeur: "basique",
    titre: "Basique",
    detail: "Prise en charge partielle, reste à charge élevé sur les montures de marque.",
  },
  {
    valeur: "responsable",
    titre: "Responsable",
    detail: "Contrat le plus répandu. Monture prise en charge jusqu'à 100 €.",
  },
  {
    valeur: "premium",
    titre: "Premium",
    detail: "Couverture renforcée, reste à charge réduit sur l'ensemble de l'équipement.",
  },
];

export function MutuelleStep() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [niveauCouverture, setNiveauCouverture] =
    useState<Mutuelle["niveauCouverture"]>("responsable");

  function handleContinuer() {
    const state = loadWizardState();
    if (state) saveWizardState({ ...state, mutuelle: { nom, niveauCouverture } });
    router.push("/commande/tiers-payant");
  }

  return (
    <div>
      <StepHeading
        title="Votre mutuelle"
        intro="Le niveau de contrat détermine votre reste à charge, calculé à l'étape du devis."
      />

      <Field id="mutuelle-nom" label="Nom de votre mutuelle">
        <TextInput
          id="mutuelle-nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="MGEN, Harmonie, Malakoff Humanis…"
        />
      </Field>

      <fieldset className="mt-7">
        <legend className="text-sm font-medium">Niveau de couverture</legend>
        <div className="mt-3 grid gap-3">
          {NIVEAUX.map((niveau) => {
            const actif = niveauCouverture === niveau.valeur;
            return (
              <label
                key={niveau.valeur}
                className={`flex cursor-pointer gap-3.5 rounded-[var(--radius-card)] border p-4 transition-colors ${
                  actif
                    ? "border-[var(--accent)] bg-[var(--surface-sunken)]"
                    : "border-[var(--line)] hover:border-[var(--ink-subtle)]"
                }`}
              >
                <input
                  type="radio"
                  name="niveau-couverture"
                  value={niveau.valeur}
                  checked={actif}
                  onChange={() => setNiveauCouverture(niveau.valeur)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
                />
                <span>
                  <span className="block font-medium">{niveau.titre}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-[var(--ink-muted)]">
                    {niveau.detail}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Le select conserve un point d'entrée accessible équivalent aux radios. */}
      <label htmlFor="mutuelle-niveau" className="sr-only">
        Niveau de couverture
      </label>
      <select
        id="mutuelle-niveau"
        aria-label="Niveau de couverture"
        className="sr-only"
        value={niveauCouverture}
        onChange={(e) =>
          setNiveauCouverture(e.target.value as Mutuelle["niveauCouverture"])
        }
      >
        {NIVEAUX.map((n) => (
          <option key={n.valeur} value={n.valeur}>
            {n.titre}
          </option>
        ))}
      </select>

      <div className="mt-8">
        <Button size="lg" onClick={handleContinuer}>
          Continuer
        </Button>
      </div>
    </div>
  );
}
