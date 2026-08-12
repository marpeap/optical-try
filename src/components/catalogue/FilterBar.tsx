import type { FrameFilters } from "@/lib/filterFrames";
import type { Forme, Genre } from "@/lib/types";
import styles from "./FilterBar.module.css";

const FORMES: Forme[] = ["ronde", "carrée", "aviateur", "papillon", "rectangulaire"];
const GENRES: Genre[] = ["homme", "femme", "mixte"];

export function FilterBar({
  filters,
  onChange,
}: {
  filters: FrameFilters;
  onChange: (filters: FrameFilters) => void;
}) {
  return (
    <form className={styles.bar}>
      <label htmlFor="filter-forme">Forme</label>
      <select
        id="filter-forme"
        aria-label="Forme"
        value={filters.forme ?? ""}
        onChange={(e) =>
          onChange({ ...filters, forme: (e.target.value || undefined) as Forme | undefined })
        }
      >
        <option value="">Toutes</option>
        {FORMES.map((forme) => (
          <option key={forme} value={forme}>
            {forme}
          </option>
        ))}
      </select>

      <label htmlFor="filter-genre">Genre</label>
      <select
        id="filter-genre"
        aria-label="Genre"
        value={filters.genre ?? ""}
        onChange={(e) =>
          onChange({ ...filters, genre: (e.target.value || undefined) as Genre | undefined })
        }
      >
        <option value="">Tous</option>
        {GENRES.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>

      <label htmlFor="filter-prix">Prix maximum</label>
      <input
        id="filter-prix"
        aria-label="Prix maximum"
        type="number"
        min={0}
        value={filters.prixMax ?? ""}
        onChange={(e) =>
          onChange({
            ...filters,
            prixMax: e.target.value ? Number(e.target.value) : undefined,
          })
        }
      />
    </form>
  );
}
