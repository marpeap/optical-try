import { describe, it, expect, vi } from "vitest";
import { messageForError, enfilerOperation } from "./jeelizWidget";

describe("messageForError", () => {
  it("distingue une caméra absente d'une caméra refusée", () => {
    const refus = messageForError("WEBCAM_UNAVAILABLE");
    const absente = messageForError("NO_VALID_MEDIASTREAM_FALLBACK_CONSTRAINTS");

    expect(refus.texte).toMatch(/autorisez/i);
    expect(absente.texte).toMatch(/aucune caméra/i);
    expect(absente.texte).not.toBe(refus.texte);
  });

  it("marque comme non rattrapables les erreurs qui ne se résolvent pas seules", () => {
    expect(messageForError("GL_INCOMPATIBLE").reessayable).toBe(false);
    expect(messageForError("INVALID_SKU").reessayable).toBe(false);
  });

  it("marque comme rattrapables les erreurs liées à la caméra", () => {
    expect(messageForError("WEBCAM_UNAVAILABLE").reessayable).toBe(true);
    expect(messageForError("VIDEO_NOTSTARTED").reessayable).toBe(true);
  });

  it("retombe sur un message générique pour un libellé inconnu", () => {
    const message = messageForError("FATAL");
    expect(message.texte.length).toBeGreaterThan(10);
    expect(message.reessayable).toBe(true);
  });
});

describe("enfilerOperation", () => {
  it("exécute les opérations l'une après l'autre, jamais en parallèle", async () => {
    const ordre: string[] = [];

    const lente = enfilerOperation(async () => {
      ordre.push("début lente");
      await new Promise((r) => setTimeout(r, 30));
      ordre.push("fin lente");
    });

    const rapide = enfilerOperation(async () => {
      ordre.push("rapide");
    });

    await Promise.all([lente, rapide]);

    /* La rapide doit attendre la fin de la lente : c'est ce qui empêche un
       démarrage du widget de chevaucher une destruction. */
    expect(ordre).toEqual(["début lente", "fin lente", "rapide"]);
  });

  it("continue la file même si une opération échoue", async () => {
    const echec = enfilerOperation(async () => {
      throw new Error("panne");
    });
    await expect(echec).rejects.toThrow("panne");

    const suivante = vi.fn().mockResolvedValue("ok");
    await expect(enfilerOperation(suivante)).resolves.toBe("ok");
    expect(suivante).toHaveBeenCalled();
  });
});
