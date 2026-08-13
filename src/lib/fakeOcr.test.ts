import { describe, it, expect } from "vitest";
import { simulateOcr } from "./fakeOcr";

describe("simulateOcr", () => {
  it("retourne des valeurs SPH/CYL/AXE/ADD plausibles pour OD et OG, non vérifiées", async () => {
    const result = await simulateOcr();

    for (const oeil of [result.od, result.og]) {
      expect(oeil.sph).toBeGreaterThanOrEqual(-10);
      expect(oeil.sph).toBeLessThanOrEqual(10);
      expect(oeil.cyl).toBeGreaterThanOrEqual(-6);
      expect(oeil.cyl).toBeLessThanOrEqual(6);
      expect(oeil.axe).toBeGreaterThanOrEqual(0);
      expect(oeil.axe).toBeLessThanOrEqual(180);
    }
    expect(result.verifie).toBe(false);
  });

  it("simule un délai d'au moins 1000ms", async () => {
    const start = Date.now();
    await simulateOcr();
    expect(Date.now() - start).toBeGreaterThanOrEqual(1000);
  }, 5000);
});
