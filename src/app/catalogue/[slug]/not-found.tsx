import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ padding: "48px 24px" }}>
      <h1>Monture introuvable</h1>
      <Link href="/catalogue">Retour au catalogue</Link>
    </main>
  );
}
