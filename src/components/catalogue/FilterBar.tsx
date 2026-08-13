import type { FrameFilters } from "@/lib/filterFrames";
import type { Forme, Genre } from "@/lib/types";

const FORMES: Forme[] = ["ronde", "carrée", "aviateur", "pantos", "clubmaster"];
const GENRES: Genre[] = ["homme", "femme", "mixte"];

const fieldClass =
  "h-11 rounded-[var(--radius-field)] border border-[var(--line)] bg-[var(--surface-raised)] " +
  "px-3.5 text-[0.9375rem] text-[var(--ink)] transition-colors hover:border-[var(--ink-subtle)]";

const labelClass = "text-xs font-medium text-[var(--ink-muted)]";

export function FilterBar({
  filters,
  onChange,
}: {
  filters: FrameFilters;
  onChange: (filters: FrameFilters) => void;
}) {
  const actif =
    filters.forme || filters.genre || filters.prixMax !== undefined;

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="grid gap-1.5">
        <label htmlFor="filter-forme" className={labelClass}>
          Forme
        </label>
        <select
          id="filter-forme"
          aria-label="Forme"
          className={fieldClass}
          value={filters.forme ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              forme: (e.target.value || undefined) as Forme | undefined,
            })
          }
        >
          <option value="">Toutes</option>
          {FORMES.map((forme) => (
            <option key={forme} value={forme}>
              {forme}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="filter-genre" className={labelClass}>
          Genre
        </label>
        <select
          id="filter-genre"
          aria-label="Genre"
          className={fieldClass}
          value={filters.genre ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              genre: (e.target.value || undefined) as Genre | undefined,
            })
          }
        >
          <option value="">Tous</option>
          {GENRES.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="filter-prix" className={labelClass}>
          Prix maximum
        </label>
        <input
          id="filter-prix"
          aria-label="Prix maximum"
          type="number"
          min={0}
          step={10}
          placeholder="400"
          className={`${fieldClass} w-32 placeholder:text-[var(--ink-subtle)]`}
          value={filters.prixMax ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              prixMax: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
      </div>

      {actif && (
        <button
          type="button"
          onClick={() => onChange({})}
          className="h-11 rounded-full px-4 text-sm text-[var(--ink-muted)] underline-offset-4 transition-colors hover:text-[var(--ink)] hover:underline"
        >
          Tout afficher
        </button>
      )}
    </div>
  );
}
