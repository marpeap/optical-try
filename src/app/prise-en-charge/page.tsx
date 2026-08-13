import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Prise en charge — Alves",
  description:
    "Comment votre mutuelle, le 100% Santé et le tiers payant déterminent ce que vous payez réellement.",
};

const QUESTIONS = [
  {
    id: "ordonnance",
    question: "Quelle ordonnance faut-il ?",
    reponse:
      "Une ordonnance en cours de validité : 5 ans entre 16 et 42 ans, 3 ans au-delà, 1 an avant 16 ans. Nous la contrôlons avant de monter vos verres.",
  },
  {
    id: "cent-pour-cent-sante",
    question: "Qu'est-ce que le 100% Santé ?",
    reponse:
      "Un panier d'équipements de classe A intégralement remboursé par l'Assurance Maladie et votre complémentaire responsable. Nous devons vous le proposer sur chaque devis, à côté de la monture que vous avez choisie.",
  },
  {
    question: "Pourquoi ma monture de marque coûte-t-elle plus cher ?",
    reponse:
      "Les contrats responsables plafonnent la prise en charge de la monture à 100 €. Au-delà, la différence reste à votre charge, quel que soit votre niveau de couverture.",
  },
  {
    question: "Le tiers payant, comment ça marche ?",
    reponse:
      "Votre mutuelle règle sa part directement à l'opticien. Vous n'avancez que votre reste à charge. Il suppose une convention entre l'opticien et votre organisme.",
  },
];

export default function PriseEnChargePage() {
  return (
    <main>
      <section className="mx-auto max-w-[1400px] px-6 py-16 md:py-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.03em] md:text-6xl">
            Ce que vous payez, et pourquoi
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[var(--ink-muted)]">
            Le montant final dépend de trois choses : la classe de
            l&apos;équipement, votre contrat de mutuelle et le plafond légal sur
            les montures.
          </p>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--surface-sunken)]">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-16 md:grid-cols-3 md:py-20">
          {[
            {
              chiffre: "0 €",
              titre: "Classe A",
              texte:
                "L'équipement 100% Santé ne vous laisse aucun reste à charge.",
            },
            {
              chiffre: "100 €",
              titre: "Plafond monture",
              texte:
                "Prise en charge maximale d'une monture par un contrat responsable.",
            },
            {
              chiffre: "5 ans",
              titre: "Validité",
              texte:
                "Durée d'une ordonnance pour un adulte de 16 à 42 ans, sauf mention du médecin.",
            },
          ].map((item) => (
            <div key={item.titre}>
              <p className="text-[3.5rem] font-semibold leading-none tracking-[-0.04em] tabular-nums">
                {item.chiffre}
              </p>
              <p className="mt-4 font-medium">{item.titre}</p>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-[var(--ink-muted)]">
                {item.texte}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <h2 className="text-3xl font-semibold leading-[1.1] tracking-[-0.03em] md:text-4xl">
            Les questions qui reviennent
          </h2>

          <div className="grid gap-8">
            {QUESTIONS.map((item) => (
              <div
                key={item.question}
                id={item.id}
                className="scroll-mt-24 border-t border-[var(--line)] pt-6"
              >
                <h3 className="text-lg font-medium">{item.question}</h3>
                <p className="mt-3 max-w-[65ch] leading-relaxed text-[var(--ink-muted)]">
                  {item.reponse}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <ButtonLink href="/catalogue" size="lg">
            Voir les montures
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
