import { describe, it, expect, vi } from "vitest";
import { startEngine, buildInitConfig } from "./webarRocksEngine";

function fakeCanvas() {
  return {} as HTMLCanvasElement;
}

describe("buildInitConfig", () => {
  it("construit la config avec les bons canvas, modèle et preset qualité", () => {
    const config = buildInitConfig({
      canvasFace: fakeCanvas(),
      canvasThree: fakeCanvas(),
      modele3dUrl: "/models/frames/test.glb",
      tier: "desktop",
    });

    expect(config.modelURL).toBe("/models/frames/test.glb");
    expect(config.width).toBe(window.innerWidth);
    expect(config.taaLevel).toBe(3);
    expect(config.bloom).not.toBeNull();
    expect(config.isLightReconstructionEnabled).toBe(true);
  });

  it("désactive bloom et taa sur mobile bas de gamme", () => {
    const config = buildInitConfig({
      canvasFace: fakeCanvas(),
      canvasThree: fakeCanvas(),
      modele3dUrl: "/models/frames/test.glb",
      tier: "mobile-bas-de-gamme",
    });

    expect(config.taaLevel).toBe(0);
    expect(config.bloom).toBeNull();
    expect(config.isLightReconstructionEnabled).toBe(false);
  });
});

describe("startEngine", () => {
  it("retourne une erreur webgl-absent si le device est incompatible", async () => {
    const result = await startEngine({
      canvasFace: fakeCanvas(),
      canvasThree: fakeCanvas(),
      modele3dUrl: "/models/frames/test.glb",
      tier: "incompatible",
    });
    expect(result.status).toBe("erreur");
    if (result.status === "erreur") {
      expect(result.raison).toBe("webgl-absent");
    }
  });

  it("appelle le moteur injecté et retourne un handle en cas de succès", async () => {
    const mirrorInit = vi.fn().mockResolvedValue(undefined);

    const result = await startEngine(
      {
        canvasFace: fakeCanvas(),
        canvasThree: fakeCanvas(),
        modele3dUrl: "/models/frames/test.glb",
        tier: "desktop",
      },
      mirrorInit
    );

    expect(mirrorInit).toHaveBeenCalledWith(
      expect.objectContaining({ modelURL: "/models/frames/test.glb" })
    );
    expect(result.status).toBe("ok");
  });

  it("retourne echec-initialisation si le moteur injecté rejette", async () => {
    const mirrorInit = vi.fn().mockRejectedValue("VIDEO_NOTSTARTED");

    const result = await startEngine(
      {
        canvasFace: fakeCanvas(),
        canvasThree: fakeCanvas(),
        modele3dUrl: "/models/frames/test.glb",
        tier: "desktop",
      },
      mirrorInit
    );

    expect(result.status).toBe("erreur");
    if (result.status === "erreur") {
      expect(result.raison).toBe("echec-initialisation");
    }
  });

  it("classe une erreur de permission caméra à part", async () => {
    const mirrorInit = vi.fn().mockRejectedValue(new Error("NotAllowedError: Permission denied"));

    const result = await startEngine(
      {
        canvasFace: fakeCanvas(),
        canvasThree: fakeCanvas(),
        modele3dUrl: "/models/frames/test.glb",
        tier: "desktop",
      },
      mirrorInit
    );

    expect(result.status).toBe("erreur");
    if (result.status === "erreur") {
      expect(result.raison).toBe("permission-refusee");
    }
  });
});
