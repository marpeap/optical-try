import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductDetail } from "./ProductDetail";
import { frames } from "@/data/frames";

/* Le widget Jeeliz exige une vraie caméra et un contexte WebGL : on le
   remplace par un double pour tester l'intégration de l'overlay. */
vi.mock("@/components/tryon/engine/jeelizWidget", () => ({
  loadJeelizWidget: vi.fn().mockResolvedValue({
    start: vi.fn(),
    load: vi.fn(),
    destroy: vi.fn().mockResolvedValue(undefined),
  }),
  enfilerOperation: (operation: () => Promise<unknown>) => operation(),
  messageForError: () => ({ texte: "Erreur", reessayable: true }),
}));

describe("ProductDetail", () => {
  const frame = frames[0];

  it("affiche la marque, le nom et le prix", () => {
    render(<ProductDetail frame={frame} frames={frames} />);
    expect(
      screen.getByRole("heading", { level: 1, name: frame.nom })
    ).toBeInTheDocument();
    expect(screen.getByText(`${frame.prix} €`)).toBeInTheDocument();
  });

  it("précise que le prix concerne la monture seule", () => {
    render(<ProductDetail frame={frame} frames={frames} />);
    expect(screen.getByText(/monture seule/i)).toBeInTheDocument();
  });

  it("lie vers le parcours de commande avec le slug de la monture", () => {
    render(<ProductDetail frame={frame} frames={frames} />);
    const link = screen.getByRole("link", { name: /choisir cette monture/i });
    expect(link).toHaveAttribute(
      "href",
      `/commande/ordonnance/init?frame=${frame.slug}`
    );
  });

  it("ouvre l'essayage au clic et le referme", async () => {
    render(<ProductDetail frame={frame} frames={frames} />);

    fireEvent.click(screen.getByRole("button", { name: /essayer cette monture/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(await screen.findByRole("button", { name: /fermer/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
