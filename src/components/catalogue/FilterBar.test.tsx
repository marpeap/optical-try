import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterBar } from "./FilterBar";

describe("FilterBar", () => {
  it("appelle onChange avec le nouveau genre sélectionné", () => {
    const onChange = vi.fn();
    render(<FilterBar filters={{}} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Genre"), {
      target: { value: "homme" },
    });

    expect(onChange).toHaveBeenCalledWith({ genre: "homme" });
  });

  it("appelle onChange avec prixMax en nombre", () => {
    const onChange = vi.fn();
    render(<FilterBar filters={{}} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Prix maximum"), {
      target: { value: "50" },
    });

    expect(onChange).toHaveBeenCalledWith({ prixMax: 50 });
  });
});
