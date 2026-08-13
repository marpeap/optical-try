export type Forme = "ronde" | "carrée" | "aviateur" | "pantos" | "clubmaster";
export type Genre = "homme" | "femme" | "mixte";
export type ClasseSante = "A" | "B";
export type Matiere = "acétate" | "métal" | "titane" | "acétate et métal";

export type Frame = {
  id: string;
  slug: string;
  marque: string;
  nom: string;
  forme: Forme;
  couleur: string;
  /** Teinte de la monture, utilisée comme fond du visuel catalogue. */
  couleurHex: string;
  matiere: Matiere;
  genre: Genre;
  prix: number;
  /** SKU du modèle 3D dans la GlassesDB Jeeliz, consommé par le try-on. */
  sku: string;
  /**
   * Photos produit, dans l'ordre d'affichage. Chemins publics
   * (ex. "/images/frames/rayban-wayfarer-havane.jpg").
   * Vide tant qu'aucune photo n'est fournie : l'interface retombe alors sur
   * un panneau teinté. Voir public/images/frames/README.md.
   */
  photos: string[];
  /** Une phrase sur le caractère de la monture. Pas de remplissage marketing. */
  description: string;
  classeSante: ClasseSante;
};
