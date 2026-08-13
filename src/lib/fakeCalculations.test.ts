import { describe, it, expect } from "vitest";
import { computeDevis, computeResteACharge } from "./fakeCalculations";
import { frames } from "@/data/frames";
import type { Mutuelle } from "./wizardState";

describe("computeDevis", () => {
  it("calcule un devis avec prix monture + prix verres forfaitaire", () => {
    const frame = frames[0];
    const devis = computeDevis(frame);
    expect(devis.prixMonture).toBe(frame.prix);
    expect(devis.prixVerres).toBeGreaterThan(0);
    expect(devis.total).toBe(devis.prixMonture + devis.prixVerres);
  });
});

describe("computeResteACharge", () => {
  it("classe A avec mutuelle responsable : reste à charge nul", () => {
    const frameClasseA = frames.find((f) => f.classeSante === "A")!;
    const devis = computeDevis(frameClasseA);
    const mutuelle: Mutuelle = { nom: "Test Mutuelle", niveauCouverture: "responsable" };

    const resteACharge = computeResteACharge(devis, frameClasseA, mutuelle);

    expect(resteACharge.montant).toBe(0);
    expect(resteACharge.detailClasse).toBe("A");
  });

  it("classe B : reste à charge strictement positif même avec mutuelle responsable", () => {
    const frameClasseB = frames.find((f) => f.classeSante === "B")!;
    const devis = computeDevis(frameClasseB);
    const mutuelle: Mutuelle = { nom: "Test Mutuelle", niveauCouverture: "responsable" };

    const resteACharge = computeResteACharge(devis, frameClasseB, mutuelle);

    expect(resteACharge.montant).toBeGreaterThan(0);
    expect(resteACharge.detailClasse).toBe("B");
  });

  it("classe B avec mutuelle basique : reste à charge plus élevé qu'avec mutuelle premium", () => {
    const frameClasseB = frames.find((f) => f.classeSante === "B")!;
    const devis = computeDevis(frameClasseB);

    const avecBasique = computeResteACharge(devis, frameClasseB, {
      nom: "Test",
      niveauCouverture: "basique",
    });
    const avecPremium = computeResteACharge(devis, frameClasseB, {
      nom: "Test",
      niveauCouverture: "premium",
    });

    expect(avecBasique.montant).toBeGreaterThan(avecPremium.montant);
  });
});
