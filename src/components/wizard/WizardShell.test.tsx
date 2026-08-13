import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { WizardShell, WIZARD_STEPS } from "./WizardShell";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("WizardShell", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
  });

  it("affiche les enfants et un indicateur de progression si un état existe", () => {
    localStorage.setItem(
      "lunettes-wizard-state",
      JSON.stringify({ frame: { slug: "test" }, ordonnance: null })
    );

    render(
      <WizardShell currentStep="ordonnance">
        <p>Contenu étape</p>
      </WizardShell>
    );

    expect(screen.getByText("Contenu étape")).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`1\\s*/\\s*${WIZARD_STEPS.length}`))).toBeInTheDocument();
  });

  it("redirige vers le début du parcours si aucun état n'existe", () => {
    render(
      <WizardShell currentStep="devis">
        <p>Contenu étape</p>
      </WizardShell>
    );

    expect(mockPush).toHaveBeenCalledWith("/catalogue");
  });
});
