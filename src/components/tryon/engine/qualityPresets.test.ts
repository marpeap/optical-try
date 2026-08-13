import { describe, it, expect } from "vitest";
import { getQualityPreset } from "./qualityPresets";

describe("getQualityPreset", () => {
  it("desktop : résolution pleine, effets complets", () => {
    const preset = getQualityPreset("desktop");
    expect(preset.renderScale).toBe(1);
    expect(preset.taaLevel).toBeGreaterThan(0);
    expect(preset.bloomEnabled).toBe(true);
    expect(preset.lightReconstructionEnabled).toBe(true);
  });

  it("mobile-haut-de-gamme : résolution légèrement réduite, effets complets", () => {
    const preset = getQualityPreset("mobile-haut-de-gamme");
    expect(preset.renderScale).toBe(0.75);
    expect(preset.bloomEnabled).toBe(true);
  });

  it("mobile-bas-de-gamme : résolution réduite, effets coûteux désactivés", () => {
    const preset = getQualityPreset("mobile-bas-de-gamme");
    expect(preset.renderScale).toBe(0.5);
    expect(preset.taaLevel).toBe(0);
    expect(preset.bloomEnabled).toBe(false);
    expect(preset.lightReconstructionEnabled).toBe(false);
  });
});
