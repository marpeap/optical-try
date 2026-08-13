import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { frames } from "@/data/frames";
import { ProductDetail } from "@/components/product/ProductDetail";

export function generateStaticParams() {
  return frames.map((frame) => ({ slug: frame.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const frame = frames.find((f) => f.slug === slug);
  if (!frame) return { title: "Monture introuvable — Alves" };

  return {
    title: `${frame.marque} ${frame.nom} — Alves`,
    description: frame.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const frame = frames.find((f) => f.slug === slug);

  if (!frame) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-12 md:py-20">
      <ProductDetail frame={frame} frames={frames} />
    </main>
  );
}
