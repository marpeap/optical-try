import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResteAChargeStep } from "./ResteAChargeStep";
import { initWizardState, saveWizardState, loadWizardState } from "@/lib/wizardState";
import { computeDevis } from "@/lib/fakeCalculations";
import { frames } from "@/data/frames";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("ResteAChargeStep", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    const frameClasseB = frames.find((f) => f.classeSante === "B")!;
    const state = initWizardState(frameClasseB);
    state.devis = computeDevis(frameClasseB);
    state.mutuelle = { nom: "Test", niveauCouverture: "responsable" };
    saveWizardState(state);
  });

  it("affiche le reste à charge calculé et redirige vers paiement au clic", () => {
    render(<ResteAChargeStep />);

    expect(screen.getByRole("heading", { name: /reste à charge/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /continuer/i }));

    expect(mockPush).toHaveBeenCalledWith("/commande/paiement");
    expect(loadWizardState()?.resteACharge).not.toBeNull();
  });
});
