import { describe, it, expect } from "vitest";
import { filterFrames } from "./filterFrames";
import { frames } from "@/data/frames";

describe("filterFrames", () => {
  it("sans filtre, retourne toutes les montures", () => {
    expect(filterFrames(frames, {})).toHaveLength(frames.length);
  });

  it("filtre par forme", () => {
    const result = filterFrames(frames, { forme: "ronde" });
    expect(result.every((f) => f.forme === "ronde")).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("filtre par genre", () => {
    const result = filterFrames(frames, { genre: "homme" });
    expect(result.every((f) => f.genre === "homme")).toBe(true);
  });

  it("filtre par prix maximum", () => {
    const result = filterFrames(frames, { prixMax: 30 });
    expect(result.every((f) => f.prix <= 30)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("combine plusieurs filtres", () => {
    const result = filterFrames(frames, { genre: "mixte", prixMax: 30 });
    expect(result.every((f) => f.genre === "mixte" && f.prix <= 30)).toBe(true);
  });

  it("retourne un tableau vide si aucune monture ne correspond", () => {
    const result = filterFrames(frames, { couleur: "violet fluo" });
    expect(result).toHaveLength(0);
  });
});
