import { describe, it, expect } from "vitest";
import {
  computeDevis,
  computeResteACharge,
  equipement100Sante,
} from "./fakeCalculations";
import { frames } from "@/data/frames";
import type { Mutuelle } from "./wizardState";

const responsable: Mutuelle = {
  nom: "Test Mutuelle",
  niveauCouverture: "responsable",
};

describe("computeDevis", () => {
  it("additionne la monture et les verres", () => {
    const frame = frames[0];
    const devis = computeDevis(frame);
    expect(devis.prixMonture).toBe(frame.prix);
    expect(devis.prixVerres).toBeGreaterThan(0);
    expect(devis.total).toBe(devis.prixMonture + devis.prixVerres);
  });
});

describe("computeResteACharge", () => {
  it("laisse un reste à charge positif sur un équipement classe B", () => {
    const frame = frames.find((f) => f.classeSante === "B")!;
    const resteACharge = computeResteACharge(
      computeDevis(frame),
      frame,
      responsable
    );

    expect(resteACharge.montant).toBeGreaterThan(0);
    expect(resteACharge.detailClasse).toBe("B");
  });

  it("laisse un reste à charge plus faible avec une meilleure couverture", () => {
    const frame = frames.find((f) => f.classeSante === "B")!;
    const devis = computeDevis(frame);

    const basique = computeResteACharge(devis, frame, {
      nom: "Test",
      niveauCouverture: "basique",
    });
    const premium = computeResteACharge(devis, frame, {
      nom: "Test",
      niveauCouverture: "premium",
    });

    expect(basique.montant).toBeGreaterThan(premium.montant);
  });

  it("plafonne la prise en charge de la monture à 100 € (contrat responsable)", () => {
    const chere = frames.find((f) => f.prix > 300)!;
    const abordable = { ...chere, prix: 100 };

    const resteChere = computeResteACharge(
      computeDevis(chere),
      chere,
      responsable
    );
    const resteAbordable = computeResteACharge(
      computeDevis(abordable),
      abordable,
      responsable
    );

    /* Au-delà du plafond, chaque euro supplémentaire de monture reste
       intégralement à la charge du client. */
    const ecartPrix = chere.prix - abordable.prix;
    expect(resteChere.montant - resteAbordable.montant).toBeCloseTo(ecartPrix, 2);
  });

  it("annule le reste à charge sur un équipement classe A", () => {
    const frame = { ...frames[0], classeSante: "A" as const };
    const resteACharge = computeResteACharge(
      computeDevis(frame),
      frame,
      responsable
    );

    expect(resteACharge.montant).toBe(0);
    expect(resteACharge.detailClasse).toBe("A");
  });
});

describe("equipement100Sante", () => {
  it("est toujours à reste à charge nul", () => {
    expect(equipement100Sante().resteACharge).toBe(0);
  });
});
