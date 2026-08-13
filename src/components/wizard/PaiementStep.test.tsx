import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PaiementStep } from "./PaiementStep";
import { initWizardState, saveWizardState, loadWizardState } from "@/lib/wizardState";
import { frames } from "@/data/frames";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("PaiementStep", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    saveWizardState(initWizardState(frames[0]));
  });

  it("valide le paiement fake et redirige vers confirmation", () => {
    render(<PaiementStep />);

    fireEvent.change(screen.getByLabelText(/numéro de carte/i), {
      target: { value: "4242 4242 4242 4242" },
    });
    fireEvent.click(screen.getByRole("button", { name: /payer/i }));

    expect(mockPush).toHaveBeenCalledWith("/commande/confirmation");
    expect(loadWizardState()?.paiement?.statut).toBe("valide");
  });
});
