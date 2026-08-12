import { describe, it, expect } from "vitest";
import { frames } from "./frames";

describe("frames", () => {
  it("contient entre 5 et 8 montures", () => {
    expect(frames.length).toBeGreaterThanOrEqual(5);
    expect(frames.length).toBeLessThanOrEqual(8);
  });

  it("chaque monture a un slug unique", () => {
    const slugs = frames.map((f) => f.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("chaque monture a au moins une image", () => {
    for (const frame of frames) {
      expect(frame.images.length).toBeGreaterThan(0);
    }
  });

  it("chaque monture a un modele3dUrl défini", () => {
    for (const frame of frames) {
      expect(frame.modele3dUrl).toBeTruthy();
      expect(frame.modele3dUrl).toMatch(/^\/models\/frames\/.+\.glb$/);
    }
  });
});
