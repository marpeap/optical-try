import type { Metadata } from "next";
import { frames } from "@/data/frames";
import { ProductGrid } from "@/components/catalogue/ProductGrid";

export const metadata: Metadata = {
  title: "Montures — Alves",
  description:
    "Sept montures Ray-Ban, Persol, Mykita et Gucci, essayables en ligne et montées à votre correction.",
};

export default function CataloguePage() {
  return (
    <main className="mx-auto max-w-[1400px] px-6 py-16 md:py-24">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.03em] md:text-6xl">
          Les montures
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[var(--ink-muted)]">
          Essayez-les depuis votre caméra, puis configurez vos verres à votre
          correction.
        </p>
      </div>

      <div className="mt-14">
        <ProductGrid frames={frames} />
      </div>
    </main>
  );
}
