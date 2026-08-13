import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InfosPersoStep } from "./InfosPersoStep";
import { initWizardState, saveWizardState, loadWizardState } from "@/lib/wizardState";
import { frames } from "@/data/frames";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("InfosPersoStep", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    saveWizardState(initWizardState(frames[0]));
  });

  it("enregistre les infos perso et redirige vers mutuelle", () => {
    render(<InfosPersoStep />);

    fireEvent.change(screen.getByLabelText(/^nom$/i), { target: { value: "Dupont" } });
    fireEvent.change(screen.getByLabelText(/prénom/i), { target: { value: "Jean" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "jean@test.fr" } });
    fireEvent.click(screen.getByRole("button", { name: /continuer/i }));

    expect(mockPush).toHaveBeenCalledWith("/commande/mutuelle");
    expect(loadWizardState()?.infosPerso).toEqual({
      nom: "Dupont",
      prenom: "Jean",
      email: "jean@test.fr",
    });
  });
});
