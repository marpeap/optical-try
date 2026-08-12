import type { Frame, Forme, Genre } from "./types";

export type FrameFilters = {
  forme?: Forme;
  couleur?: string;
  genre?: Genre;
  prixMax?: number;
};

export function filterFrames(frames: Frame[], filters: FrameFilters): Frame[] {
  return frames.filter((frame) => {
    if (filters.forme && frame.forme !== filters.forme) return false;
    if (filters.couleur && frame.couleur !== filters.couleur) return false;
    if (filters.genre && frame.genre !== filters.genre) return false;
    if (filters.prixMax !== undefined && frame.prix > filters.prixMax) return false;
    return true;
  });
}
