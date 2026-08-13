import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TiersPayantStep } from "./TiersPayantStep";
import { initWizardState, saveWizardState, loadWizardState } from "@/lib/wizardState";
import { frames } from "@/data/frames";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("TiersPayantStep", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    saveWizardState(initWizardState(frames[0]));
  });

  it("enregistre le choix de simulation tiers payant et redirige vers devis", () => {
    render(<TiersPayantStep />);

    fireEvent.click(screen.getByLabelText(/simuler une prise en charge/i));
    fireEvent.click(screen.getByRole("button", { name: /continuer/i }));

    expect(mockPush).toHaveBeenCalledWith("/commande/devis");
    expect(loadWizardState()?.tiersPayant?.simule).toBe(true);
  });
});
