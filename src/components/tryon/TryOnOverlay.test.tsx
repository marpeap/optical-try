import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TryOnOverlay } from "./TryOnOverlay";
import { frames } from "@/data/frames";
import * as engine from "./engine/webarRocksEngine";
import * as deviceTierModule from "./engine/deviceTier";

const frame = { ...frames[0], modele3dUrl: "/models/frames/test.glb" };

describe("TryOnOverlay", () => {
  it("appelle onClose quand on clique sur le bouton de fermeture", async () => {
    vi.spyOn(deviceTierModule, "detectDeviceTier").mockReturnValue("desktop");
    vi.spyOn(engine, "startEngine").mockResolvedValue({
      status: "ok",
      handle: { stop: vi.fn() },
    });

    const onClose = vi.fn();
    render(<TryOnOverlay frame={frame} onClose={onClose} />);

    await waitFor(() => screen.getByRole("button", { name: /fermer/i }));
    fireEvent.click(screen.getByRole("button", { name: /fermer/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it("affiche un message si la permission caméra est refusée", async () => {
    vi.spyOn(deviceTierModule, "detectDeviceTier").mockReturnValue("desktop");
    vi.spyOn(engine, "startEngine").mockResolvedValue({
      status: "erreur",
      raison: "permission-refusee",
    });

    render(<TryOnOverlay frame={frame} onClose={vi.fn()} />);

    await waitFor(() =>
      expect(screen.getByText(/autorisez l'accès à votre caméra/i)).toBeInTheDocument()
    );
  });

  it("affiche un message si le device est incompatible", async () => {
    vi.spyOn(deviceTierModule, "detectDeviceTier").mockReturnValue("incompatible");
    vi.spyOn(engine, "startEngine").mockResolvedValue({
      status: "erreur",
      raison: "webgl-absent",
    });

    render(<TryOnOverlay frame={frame} onClose={vi.fn()} />);

    await waitFor(() =>
      expect(screen.getByText(/ne permet pas l'essayage virtuel/i)).toBeInTheDocument()
    );
  });
});
