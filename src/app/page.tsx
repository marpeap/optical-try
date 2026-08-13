import { ScrollVideoHero } from "@/components/landing/ScrollVideoHero";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { frames } from "@/data/frames";

const ETAPES = [
  {
    verbe: "Choisir",
    texte:
      "Sept montures sélectionnées chez Ray-Ban, Persol, Mykita et Gucci. Pas de catalogue interminable.",
  },
  {
    verbe: "Essayer",
    texte:
      "La monture se pose sur votre visage via la caméra, avec ses vraies matières et ses vrais reflets.",
  },
  {
    verbe: "Transmettre",
    texte:
      "Photographiez votre ordonnance. Les valeurs détectées vous sont soumises avant validation.",
  },
  {
    verbe: "Commander",
    texte:
      "Votre devis affiche le reste à charge après mutuelle. Un opticien diplômé contrôle la commande.",
  },
];

export default function Home() {
  const selection = frames.slice(0, 3);

  return (
    <main>
      <ScrollVideoHero />

      {/* Sélection : grille asymétrique, la première monture occupe deux colonnes. */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 md:py-32">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold leading-[1.1] tracking-[-0.03em] md:text-5xl">
            Sept montures, pas sept cents
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[var(--ink-muted)]">
            Chacune tient sa place pour une raison précise, expliquée sur sa
            fiche.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <ProductCard frame={selection[0]} priority />
          </div>
          {selection.slice(1).map((frame) => (
            <ProductCard key={frame.id} frame={frame} />
          ))}
        </div>

        <div className="mt-12">
          <ButtonLink href="/catalogue" variant="secondary" size="lg">
            Voir les sept montures
          </ButtonLink>
        </div>
      </section>

      {/* Parcours : bande sombre, rythme en quatre temps, pas de cartes. */}
      <section className="bg-[var(--color-forest-950)] text-[var(--color-bone-100)]">
        <div className="mx-auto max-w-[1400px] px-6 py-24 md:py-32">
          <h2 className="max-w-2xl text-3xl font-semibold leading-[1.1] tracking-[-0.03em] md:text-5xl">
            De la monture à la commande, sans passer en magasin
          </h2>

          <ol className="mt-16 grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
            {ETAPES.map((etape) => (
              <li key={etape.verbe} className="border-t border-white/15 pt-6">
                <h3 className="text-xl font-medium">{etape.verbe}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--color-bone-100)]/70">
                  {etape.texte}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Prise en charge : split, le chiffre porte la section. */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 md:py-32">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--ink-subtle)]">
              Reste à charge
            </p>
            <p className="mt-6 text-[5rem] font-semibold leading-none tracking-[-0.04em] md:text-[7rem]">
              0 €
            </p>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--ink-muted)]">
              L&apos;équipement 100% Santé vous est proposé sur chaque devis, à
              côté de la monture que vous avez choisie. Vous comparez les deux
              avant de décider.
            </p>
          </div>

          <div className="rounded-[var(--radius-card)] bg-[var(--surface-sunken)] p-8 md:p-10">
            <h2 className="text-2xl font-semibold leading-[1.15] tracking-[-0.02em] md:text-3xl">
              Votre mutuelle, calculée avant de payer
            </h2>
            <p className="mt-4 leading-relaxed text-[var(--ink-muted)]">
              Vous renseignez votre niveau de couverture, le devis affiche la
              part remboursée et ce qui reste à votre charge. Aucun montant ne
              se découvre après la commande.
            </p>
            <div className="mt-8">
              <ButtonLink href="/prise-en-charge">
                Comprendre la prise en charge
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
