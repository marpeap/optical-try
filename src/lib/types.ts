export type Forme = "ronde" | "carrée" | "aviateur" | "papillon" | "rectangulaire";
export type Genre = "homme" | "femme" | "mixte";
export type ClasseSante = "A" | "B";

export type Frame = {
  id: string;
  slug: string;
  marque: string;
  nom: string;
  forme: Forme;
  couleur: string;
  genre: Genre;
  prix: number;
  images: string[];
  modele3dUrl?: string;
  classeSante: ClasseSante;
};
