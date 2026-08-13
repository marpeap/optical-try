import { describe, it, expect } from "vitest";
import { frames } from "./frames";

describe("frames", () => {
  it("reste sous les 10 modèles du palier gratuit de la licence Jeeliz", () => {
    expect(frames.length).toBeGreaterThanOrEqual(5);
    expect(frames.length).toBeLessThan(10);
  });

  it("chaque monture a un slug unique", () => {
    const slugs = frames.map((f) => f.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("chaque monture porte un SKU Jeeliz non vide", () => {
    for (const frame of frames) {
      expect(frame.sku).toBeTruthy();
      expect(frame.sku).not.toContain(" ");
    }
  });

  it("chaque monture a une teinte hex valide pour son visuel", () => {
    for (const frame of frames) {
      expect(frame.couleurHex).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("chaque monture a une description rédigée", () => {
    for (const frame of frames) {
      expect(frame.description.length).toBeGreaterThan(30);
    }
  });
});
