import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductGrid } from "./ProductGrid";
import { frames } from "@/data/frames";

describe("ProductGrid", () => {
  it("affiche toutes les montures par défaut", () => {
    render(<ProductGrid frames={frames} />);
    for (const frame of frames) {
      expect(screen.getByText(frame.nom)).toBeInTheDocument();
    }
  });

  it("filtre la grille quand on change le genre", () => {
    render(<ProductGrid frames={frames} />);
    fireEvent.change(screen.getByLabelText("Genre"), {
      target: { value: "homme" },
    });

    const hommeFrames = frames.filter((f) => f.genre === "homme");
    const autresFrames = frames.filter((f) => f.genre !== "homme");

    for (const frame of hommeFrames) {
      expect(screen.getByText(frame.nom)).toBeInTheDocument();
    }
    for (const frame of autresFrames) {
      expect(screen.queryByText(frame.nom)).not.toBeInTheDocument();
    }
  });
});
