import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OrdonnanceStep } from "./OrdonnanceStep";
import { initWizardState, saveWizardState } from "@/lib/wizardState";
import { frames } from "@/data/frames";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("OrdonnanceStep", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    saveWizardState(initWizardState(frames[0]));
  });

  it("simule le traitement OCR après upload puis redirige vers la vérification", async () => {
    render(<OrdonnanceStep />);

    const fileInput = screen.getByLabelText(/photo de l'ordonnance/i);
    const file = new File(["contenu"], "ordonnance.jpg", { type: "image/jpeg" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText(/traitement en cours/i)).toBeInTheDocument();

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/commande/verification"), {
      timeout: 3000,
    });
  });
});
