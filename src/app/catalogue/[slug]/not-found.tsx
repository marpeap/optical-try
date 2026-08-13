import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-start px-6 py-32">
      <h1 className="text-3xl font-semibold tracking-[-0.03em]">
        Cette monture n&apos;existe pas
      </h1>
      <p className="mt-4 leading-relaxed text-[var(--ink-muted)]">
        Le lien est peut-être ancien. Notre sélection compte sept modèles.
      </p>
      <div className="mt-8">
        <ButtonLink href="/catalogue">Voir les montures</ButtonLink>
      </div>
    </main>
  );
}
