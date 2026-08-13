import type { Frame } from "./types";
import type { Devis, Mutuelle, ResteACharge } from "./wizardState";

const PRIX_VERRES_FORFAITAIRE = 80;

const TAUX_REMBOURSEMENT_MUTUELLE: Record<Mutuelle["niveauCouverture"], number> = {
  basique: 0.3,
  responsable: 0.6,
  premium: 0.9,
};

export function computeDevis(frame: Frame): Devis {
  const prixMonture = frame.prix;
  const prixVerres = PRIX_VERRES_FORFAITAIRE;
  return {
    prixMonture,
    prixVerres,
    total: prixMonture + prixVerres,
  };
}

export function computeResteACharge(
  devis: Devis,
  frame: Frame,
  mutuelle: Mutuelle
): ResteACharge {
  if (frame.classeSante === "A") {
    return { montant: 0, detailClasse: "A" };
  }

  const taux = TAUX_REMBOURSEMENT_MUTUELLE[mutuelle.niveauCouverture];
  const rembourse = devis.total * taux;
  const montant = Math.round((devis.total - rembourse) * 100) / 100;

  return { montant, detailClasse: "B" };
}
