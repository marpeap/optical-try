import { frames } from "@/data/frames";
import { ProductGrid } from "@/components/catalogue/ProductGrid";

export default function CataloguePage() {
  return (
    <main style={{ padding: "48px 24px" }}>
      <h1>Notre catalogue</h1>
      <ProductGrid frames={frames} />
    </main>
  );
}
