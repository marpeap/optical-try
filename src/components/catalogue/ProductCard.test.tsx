import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "./ProductCard";
import { frames } from "@/data/frames";

describe("ProductCard", () => {
  const frame = frames[0];

  it("affiche le nom et le prix de la monture", () => {
    render(<ProductCard frame={frame} />);
    expect(screen.getByText(frame.nom)).toBeInTheDocument();
    expect(screen.getByText(`${frame.prix} €`)).toBeInTheDocument();
  });

  it("le lien pointe vers la fiche produit correspondante", () => {
    render(<ProductCard frame={frame} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", `/catalogue/${frame.slug}`);
  });
});
