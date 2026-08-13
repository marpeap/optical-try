import { describe, it, expect, beforeEach } from "vitest";
import {
  initWizardState,
  loadWizardState,
  saveWizardState,
  clearWizardState,
} from "./wizardState";
import { frames } from "@/data/frames";

describe("wizardState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initWizardState crée un état avec la monture choisie et les étapes suivantes vides", () => {
    const state = initWizardState(frames[0]);
    expect(state.frame.slug).toBe(frames[0].slug);
    expect(state.ordonnance).toBeNull();
    expect(state.infosPerso).toBeNull();
  });

  it("saveWizardState puis loadWizardState retourne le même état", () => {
    const state = initWizardState(frames[0]);
    saveWizardState(state);

    const loaded = loadWizardState();
    expect(loaded).toEqual(state);
  });

  it("loadWizardState retourne null si rien n'est stocké", () => {
    expect(loadWizardState()).toBeNull();
  });

  it("clearWizardState supprime l'état stocké", () => {
    saveWizardState(initWizardState(frames[0]));
    clearWizardState();
    expect(loadWizardState()).toBeNull();
  });
});
