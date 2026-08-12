import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TryOnTrigger } from "./TryOnTrigger";
import { frames } from "@/data/frames";

describe("TryOnTrigger", () => {
  it("est cliquable et déclenche onOpen si modele3dUrl est défini", () => {
    const onOpen = vi.fn();
    const frame = { ...frames[0], modele3dUrl: "/models/frames/test.glb" };
    render(<TryOnTrigger frame={frame} onOpen={onOpen} />);

    fireEvent.click(screen.getByRole("button"));
    expect(onOpen).toHaveBeenCalled();
  });

  it("est désactivé et affiche un message si modele3dUrl est absent", () => {
    const onOpen = vi.fn();
    const frame = { ...frames[0], modele3dUrl: undefined };
    render(<TryOnTrigger frame={frame} onOpen={onOpen} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByText(/bientôt disponible/i)).toBeInTheDocument();

    fireEvent.click(button);
    expect(onOpen).not.toHaveBeenCalled();
  });
});
