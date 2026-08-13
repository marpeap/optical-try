"use client";

import { useState } from "react";
import type { Frame } from "@/lib/types";
import { filterFrames, type FrameFilters } from "@/lib/filterFrames";
import { FilterBar } from "./FilterBar";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ frames }: { frames: Frame[] }) {
  const [filters, setFilters] = useState<FrameFilters>({});
  const visibleFrames = filterFrames(frames, filters);

  return (
    <div>
      <FilterBar filters={filters} onChange={setFilters} />

      <p
        className="mt-8 text-sm text-[var(--ink-muted)]"
        role="status"
        aria-live="polite"
      >
        {visibleFrames.length === frames.length
          ? `${frames.length} montures`
          : `${visibleFrames.length} sur ${frames.length} montures`}
      </p>

      {visibleFrames.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-card)] border border-dashed border-[var(--line)] px-8 py-16 text-center">
          <p className="font-medium">Aucune monture ne correspond</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--ink-muted)]">
            Notre sélection compte sept modèles. Élargissez le prix ou changez
            de forme pour les revoir.
          </p>
          <button
            type="button"
            onClick={() => setFilters({})}
            className="mt-6 h-11 rounded-full bg-[var(--accent)] px-6 text-[0.9375rem] font-medium text-[var(--accent-ink)]"
          >
            Tout afficher
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {visibleFrames.map((frame, i) => (
            <ProductCard key={frame.id} frame={frame} priority={i < 3} />
          ))}
        </div>
      )}
    </div>
  );
}
