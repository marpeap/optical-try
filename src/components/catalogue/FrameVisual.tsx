import Image from "next/image";
import type { Frame } from "@/lib/types";

/*
  Visuel d'une monture, partagé par la carte et la fiche.

  Les photos produit arrivent détourées sur fond blanc : la tuile reste donc
  blanche dans les deux thèmes, comme chez la plupart des opticiens. Le blanc
  de la photo se fond dans celui de la tuile, et en mode sombre la tuile
  claire fait ressortir la monture au lieu de la noyer.

  Sans photo, repli sur un panneau à la teinte de la monture.
*/
export function FrameVisual({
  frame,
  priority = false,
  taille = "carte",
}: {
  frame: Frame;
  priority?: boolean;
  taille?: "carte" | "fiche";
}) {
  const photo = frame.photos[0];
  const grandFormat = taille === "fiche";

  if (!photo) {
    return (
      <div
        className={`relative flex items-end overflow-hidden rounded-[var(--radius-card)] p-6 ${
          grandFormat ? "aspect-[4/5] lg:aspect-auto lg:min-h-[560px]" : "aspect-[4/3]"
        }`}
        style={{ backgroundColor: frame.couleurHex }}
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/10"
        />
        <p
          className={`font-display relative font-semibold leading-none tracking-[-0.03em] text-white/95 ${
            grandFormat ? "text-[2.75rem]" : "text-[2rem]"
          }`}
        >
          {frame.nom}
        </p>
      </div>
    );
  }

  return (
    <div
      /* Les photos produit sont panoramiques : un cadre 4/5 sur mobile
         laisserait de larges bandes vides au-dessus et en dessous. */
      className={`group/visual relative overflow-hidden rounded-[var(--radius-card)] bg-white ${
        grandFormat
          ? "aspect-[4/3] sm:aspect-[4/5] lg:aspect-auto lg:min-h-[560px]"
          : "aspect-[4/3]"
      }`}
    >
      {/* Halo à la teinte de la monture : réchauffe le fond blanc et relie la
          vignette au coloris annoncé sous la carte. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          background: `radial-gradient(120% 90% at 50% 110%, ${frame.couleurHex} 0%, transparent 70%)`,
        }}
      />

      {/* Au survol : la monture se soulève et pivote légèrement, comme un
          objet qu'on prend en main. Une vraie rotation sur 360° demanderait
          une prise de vue multi-angles, impossible avec une photo unique. */}
      {/* Marge intérieure resserrée sur petit écran : la même que sur desktop
          laisserait la monture flotter au milieu d'un cadre presque vide. */}
      <div
        className={`absolute inset-0 transition-transform duration-500 ease-out motion-reduce:transition-none ${
          grandFormat
            ? "p-5 sm:p-10 md:p-14"
            : "p-4 sm:p-7 group-hover:-translate-y-1.5 group-hover:rotate-[-2.5deg] group-hover:scale-[1.06]"
        }`}
      >
        <div className="relative h-full w-full">
          <Image
            src={photo}
            alt={`${frame.marque} ${frame.nom}, coloris ${frame.couleur}`}
            fill
            priority={priority}
            sizes={
              grandFormat
                ? "(max-width: 1024px) 100vw, 45vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            /* multiply efface le fond blanc de la photo dans le blanc de la
               tuile : plus de rectangle visible, seule la monture subsiste.
               Une ombre portée est inutile ici, elle suivrait le cadre de
               l'image et non le contour du produit. */
            className="object-contain mix-blend-multiply"
          />
        </div>
      </div>
    </div>
  );
}
