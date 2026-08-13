import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import InitPage from "./page";
import { loadWizardState } from "@/lib/wizardState";
import { frames } from "@/data/frames";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(`frame=${frames[0].slug}`),
}));

describe("InitPage", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
  });

  it("initialise l'état du wizard avec la monture du paramètre puis redirige", () => {
    render(<InitPage />);

    expect(loadWizardState()?.frame.slug).toBe(frames[0].slug);
    expect(mockPush).toHaveBeenCalledWith("/commande/ordonnance");
  });
});
