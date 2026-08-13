import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VerificationStep } from "./VerificationStep";
import { initWizardState, saveWizardState } from "@/lib/wizardState";
import { frames } from "@/data/frames";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("VerificationStep", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    const state = initWizardState(frames[0]);
    state.ordonnance = {
      od: { sph: -1.5, cyl: -0.5, axe: 90, add: 0 },
      og: { sph: -1.25, cyl: -0.25, axe: 85, add: 0 },
      verifie: false,
    };
    saveWizardState(state);
  });

  it("affiche les valeurs extraites et valide au clic", () => {
    render(<VerificationStep />);

    expect(screen.getByDisplayValue("-1.5")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /ces valeurs sont exactes/i })
    );

    expect(mockPush).toHaveBeenCalledWith("/commande/infos-perso");
  });
});
