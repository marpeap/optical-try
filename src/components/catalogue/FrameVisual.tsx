import Image from "next/image";
import type { Frame } from "@/lib/types";

/*
  Visuel d'une monture, à un seul endroit pour la carte et la fiche.

  Avec photo : elle occupe le cadre, sur un fond teinté qui prolonge la
  couleur de la monture (utile pour les détourés à fond transparent).
  Sans photo : panneau teinté portant le nom en gros. Le repli est volontaire,
  pas un accident, et disparaît dès qu'un fichier est déposé dans
  public/images/frames/.
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

  return (
    <div
      className={`relative flex overflow-hidden rounded-[var(--radius-card)] ${
        grandFormat
          ? "aspect-[4/5] items-end p-8 lg:aspect-auto lg:min-h-[560px]"
          : "aspect-[4/3] items-end p-6"
      }`}
      style={{ backgroundColor: frame.couleurHex }}
    >
      {photo ? (
        <>
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
            className="object-cover"
          />
          {grandFormat && (
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent"
            />
          )}
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
