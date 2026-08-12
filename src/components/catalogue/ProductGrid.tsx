"use client";

import { useState } from "react";
import type { Frame } from "@/lib/types";
import { filterFrames, type FrameFilters } from "@/lib/filterFrames";
import { FilterBar } from "./FilterBar";
import { ProductCard } from "./ProductCard";
import styles from "./ProductGrid.module.css";

export function ProductGrid({ frames }: { frames: Frame[] }) {
  const [filters, setFilters] = useState<FrameFilters>({});
  const visibleFrames = filterFrames(frames, filters);

  return (
    <div>
      <FilterBar filters={filters} onChange={setFilters} />
      <div className={styles.grid}>
        {visibleFrames.map((frame) => (
          <ProductCard key={frame.id} frame={frame} />
        ))}
      </div>
    </div>
  );
}
