import Link from "next/link";
import type { Frame } from "@/lib/types";
import { FrameVisual } from "./FrameVisual";

export function ProductCard({
  frame,
  priority = false,
}: {
  frame: Frame;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/catalogue/${frame.slug}`}
      className="group block focus-visible:outline-none"
    >
      <div className="transition-transform duration-300 ease-out group-hover:-translate-y-1">
        <FrameVisual frame={frame} priority={priority} />
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--ink-muted)]">{frame.marque}</p>
          <p className="mt-0.5 font-medium">
            {frame.couleur}
            <span className="px-1.5 text-[var(--ink-subtle)]">·</span>
            <span className="font-normal text-[var(--ink-muted)]">
              {frame.forme}
            </span>
          </p>
        </div>
        <p className="font-medium tabular-nums">{`${frame.prix} €`}</p>
      </div>
    </Link>
  );
}
