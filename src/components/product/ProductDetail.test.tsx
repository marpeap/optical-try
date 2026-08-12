import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductDetail } from "./ProductDetail";
import { frames } from "@/data/frames";

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
});
