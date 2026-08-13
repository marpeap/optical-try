import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DevisStep } from "./DevisStep";
import { initWizardState, saveWizardState, loadWizardState } from "@/lib/wizardState";
import { frames } from "@/data/frames";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("DevisStep", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    saveWizardState(initWizardState(frames[0]));
  });

  it("affiche le devis calculé et redirige vers reste-a-charge au clic", () => {
    render(<DevisStep />);

    expect(screen.getByText(new RegExp(`${frames[0].prix}\\s*€`))).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /continuer/i }));

    expect(mockPush).toHaveBeenCalledWith("/commande/reste-a-charge");
    expect(loadWizardState()?.devis).not.toBeNull();
  });
});
