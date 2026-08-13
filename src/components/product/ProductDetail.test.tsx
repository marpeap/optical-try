import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProductDetail } from "./ProductDetail";
import { frames } from "@/data/frames";
import * as engine from "@/components/tryon/engine/webarRocksEngine";

vi.spyOn(engine, "startEngine").mockResolvedValue({
  status: "ok",
  handle: { stop: vi.fn() },
});

describe("ProductDetail", () => {
  const frame = frames[0];

  it("affiche le nom, la marque et le prix", () => {
    render(<ProductDetail frame={frame} />);
    expect(screen.getByText(frame.nom)).toBeInTheDocument();
    expect(screen.getByText(frame.marque)).toBeInTheDocument();
    expect(screen.getByText(`${frame.prix} €`)).toBeInTheDocument();
  });

  it("affiche le bouton Choisir cette monture avec le bon lien", () => {
    render(<ProductDetail frame={frame} />);
    const link = screen.getByRole("link", { name: /choisir cette monture/i });
    expect(link).toHaveAttribute("href", `/commande/ordonnance/init?frame=${frame.slug}`);
  });

  it("affiche le TryOnTrigger", () => {
    render(<ProductDetail frame={frame} />);
    expect(screen.getByRole("button", { name: /essayer virtuellement/i })).toBeInTheDocument();
  });

  it("ouvre TryOnOverlay au clic sur Essayer virtuellement", () => {
    render(<ProductDetail frame={frame} />);

    fireEvent.click(screen.getByRole("button", { name: /essayer virtuellement/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("ferme TryOnOverlay au clic sur Fermer", async () => {
    render(<ProductDetail frame={frame} />);

    fireEvent.click(screen.getByRole("button", { name: /essayer virtuellement/i }));
    fireEvent.click(await screen.findByRole("button", { name: /fermer/i }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
