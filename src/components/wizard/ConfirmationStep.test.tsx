import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmationStep } from "./ConfirmationStep";
import { initWizardState, saveWizardState, loadWizardState } from "@/lib/wizardState";
import { frames } from "@/data/frames";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("ConfirmationStep", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    saveWizardState(initWizardState(frames[0]));
  });

  it("affiche la confirmation et vide l'état au clic sur recommencer", () => {
    render(<ConfirmationStep />);

    expect(screen.getByText(/commande confirmée/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /recommencer une démo/i }));

    expect(loadWizardState()).toBeNull();
    expect(mockPush).toHaveBeenCalledWith("/catalogue");
  });
});
