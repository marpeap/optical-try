"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/catalogue", label: "Montures" },
  { href: "/prise-en-charge", label: "Prise en charge" },
];

/*
  Sur la landing, le hero est une vidéo plein cadre : le bandeau se fond
  dedans en blanc, puis reprend le fond du site dès qu'on quitte le hero.
  La bascule passe par un observateur d'intersection, pas par un écouteur
  de scroll (qui se déclencherait à chaque frame).
*/
export function SiteHeader() {
  const pathname = usePathname();
  const surHero = pathname === "/";
  const [enHaut, setEnHaut] = useState(true);

  useEffect(() => {
    if (!surHero) {
      setEnHaut(false);
      return;
    }
    setEnHaut(true);

    /* Le hero expose une zone repère couvrant toute sa hauteur. Tant qu'une
       partie reste visible, la vidéo est à l'écran et le bandeau doit rester
       transparent. Pas d'écouteur de scroll : un observateur suffit. */
    const cible = document.getElementById("hero-sentinelle");
    if (!cible) return;

    const observer = new IntersectionObserver(([entry]) =>
      setEnHaut(entry.isIntersecting)
    );
    observer.observe(cible);
    return () => observer.disconnect();
  }, [surHero]);

  const transparent = surHero && enHaut;

  return (
    <>
      <header
        className={`sticky top-0 z-40 h-16 transition-colors duration-300 ${
          transparent
            ? "border-b border-transparent text-white"
            : "border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] text-[var(--ink)] backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-full max-w-[1400px] items-center gap-8 px-6">
          <Link
            href="/"
            className="inline-flex h-11 items-center text-[1.0625rem] font-semibold tracking-[-0.02em]"
          >
            Alves
          </Link>

          {/* Deux entrées seulement : elles tiennent sur une ligne dès 390px,
              inutile de les cacher derrière un menu sur mobile. */}
          {/* Les liens occupent toute la hauteur du bandeau : la zone tactile
              atteint 44px sans changer la taille du texte. */}
          <nav className="flex flex-1 items-center gap-2 md:gap-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex h-11 items-center rounded-full px-2.5 text-sm transition-colors md:px-3 ${
                  transparent
                    ? "text-white/75 hover:text-white"
                    : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Sur la landing, le hero porte déjà l'appel à l'action principal :
              le bandeau n'en ajoute pas un second au libellé identique. */}
          {!surHero && (
            <Link
              href="/catalogue"
              className="ml-auto hidden h-10 items-center rounded-full bg-[var(--accent)] px-5 text-sm font-medium text-[var(--accent-ink)] transition-colors hover:bg-[var(--accent-hover)] sm:inline-flex md:ml-0"
            >
              Voir les montures
            </Link>
          )}
        </div>
      </header>
    </>
  );
}
