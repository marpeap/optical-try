import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MutuelleStep } from "./MutuelleStep";
import { initWizardState, saveWizardState, loadWizardState } from "@/lib/wizardState";
import { frames } from "@/data/frames";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("MutuelleStep", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    saveWizardState(initWizardState(frames[0]));
  });

  it("enregistre la mutuelle choisie et redirige vers tiers-payant", () => {
    render(<MutuelleStep />);

    fireEvent.change(screen.getByLabelText(/nom de votre mutuelle/i), {
      target: { value: "MGEN" },
    });
    fireEvent.change(screen.getByLabelText(/niveau de couverture/i), {
      target: { value: "premium" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continuer/i }));

    expect(mockPush).toHaveBeenCalledWith("/commande/tiers-payant");
    expect(loadWizardState()?.mutuelle).toEqual({ nom: "MGEN", niveauCouverture: "premium" });
  });
});
