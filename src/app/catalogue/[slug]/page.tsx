import { notFound } from "next/navigation";
import { frames } from "@/data/frames";
import { ProductDetail } from "@/components/product/ProductDetail";

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
    <main style={{ padding: "48px 24px" }}>
      <ProductDetail frame={frame} />
    </main>
  );
}
