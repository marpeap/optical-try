import type { Frame } from "./types";
import type { Devis, Mutuelle, ResteACharge } from "./wizardState";

/*
  Simulation de devis. Les montants ne proviennent d'aucun organisme réel.

  Deux règles calquées sur le cadre français sont respectées, parce qu'elles
  changent la forme du devis :
    - un contrat responsable plafonne la prise en charge de la monture à 100 €,
    - l'équipement 100% Santé (classe A) est à reste à charge nul et doit être
      présenté à côté de l'équipement choisi.
*/

const PRIX_VERRES_UNIFOCAUX = 80;
const PLAFOND_MONTURE_CONTRAT_RESPONSABLE = 100;

/** Part prise en charge par la mutuelle selon le niveau de contrat. */
const TAUX_AMC: Record<Mutuelle["niveauCouverture"], number> = {
  basique: 0.3,
  responsable: 0.6,
  premium: 0.9,
};

export function computeDevis(frame: Frame): Devis {
  const prixMonture = frame.prix;
  const prixVerres = PRIX_VERRES_UNIFOCAUX;
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

  const taux = TAUX_AMC[mutuelle.niveauCouverture];

  /* La monture est remboursée dans la limite du plafond, les verres non. */
  const baseMonture = Math.min(devis.prixMonture, PLAFOND_MONTURE_CONTRAT_RESPONSABLE);
  const rembourse = baseMonture * taux + devis.prixVerres * taux;
  const montant = Math.max(0, Math.round((devis.total - rembourse) * 100) / 100);

  return { montant, detailClasse: "B" };
}

/**
 * Équipement 100% Santé proposé en regard de l'équipement choisi, comme
 * l'impose le devis normalisé. Toujours à reste à charge nul.
 */
export function equipement100Sante(): { total: number; resteACharge: number } {
  return { total: 125, resteACharge: 0 };
}
