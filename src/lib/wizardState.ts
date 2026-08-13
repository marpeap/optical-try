import type { Frame } from "./types";

export type Ordonnance = {
  od: { sph: number; cyl: number; axe: number; add: number };
  og: { sph: number; cyl: number; axe: number; add: number };
  verifie: boolean;
};

export type InfosPerso = {
  nom: string;
  prenom: string;
  email: string;
};

export type Mutuelle = {
  nom: string;
  niveauCouverture: "basique" | "responsable" | "premium";
};

export type TiersPayant = {
  simule: boolean;
  organisme: string | null;
};

export type Devis = {
  prixMonture: number;
  prixVerres: number;
  total: number;
};

export type ResteACharge = {
  montant: number;
  detailClasse: "A" | "B";
};

export type Paiement = {
  statut: "en_attente" | "valide";
};

export type WizardState = {
  frame: Frame;
  ordonnance: Ordonnance | null;
  infosPerso: InfosPerso | null;
  mutuelle: Mutuelle | null;
  tiersPayant: TiersPayant | null;
  devis: Devis | null;
  resteACharge: ResteACharge | null;
  paiement: Paiement | null;
};

const STORAGE_KEY = "lunettes-wizard-state";

export function initWizardState(frame: Frame): WizardState {
  return {
    frame,
    ordonnance: null,
    infosPerso: null,
    mutuelle: null,
    tiersPayant: null,
    devis: null,
    resteACharge: null,
    paiement: null,
  };
}

export function saveWizardState(state: WizardState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadWizardState(): WizardState | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WizardState;
  } catch {
    return null;
  }
}

export function clearWizardState(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
