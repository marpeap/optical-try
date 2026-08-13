"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Doivent rester en phase avec scripts/generate-video-frames.sh. */
const DESKTOP_FRAME_COUNT = 180;
const MOBILE_FRAME_COUNT = 120;
const MOBILE_BREAKPOINT = 768;

/*
  Motivation du mouvement : la séquence conduit le regard du sous-bois au
  moment où quelqu'un chausse une paire de lunettes. Le scroll raconte ce
  passage, il ne décore pas. Le texte se relaie par-dessus au fil des paliers.
*/
const BEATS = [
  {
    at: 0,
    title: "Voir le monde net",
    body: "Des montures choisies une par une, montées à votre correction.",
  },
  {
    at: 0.42,
    title: "Essayez avant de choisir",
    body: "La monture se pose sur votre visage, en temps réel, depuis votre navigateur.",
  },
  {
    at: 0.76,
    title: "Vous savez ce que vous payez",
    body: "Votre reste à charge est calculé avant la commande, pas après.",
  },
];

function frameUrl(isMobile: boolean, index: number): string {
  const dir = isMobile ? "mobile" : "desktop";
  return `/video-frames/${dir}/frame-${String(index + 1).padStart(4, "0")}.jpg`;
}

export function ScrollVideoHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [beatIndex, setBeatIndex] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const frameCount = isMobile ? MOBILE_FRAME_COUNT : DESKTOP_FRAME_COUNT;
    const images: HTMLImageElement[] = new Array(frameCount);

    /* Chargement progressif : la première image part seule pour que le hero
       s'affiche tout de suite, les suivantes arrivent en file derrière. Tout
       demander d'un coup imposerait une quinzaine de mégaoctets au premier
       rendu et retarderait le LCP. */
    let annule = false;

    function chargerImage(i: number): Promise<void> {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
          images[i] = img;
          /* Redessine si la frame attendue vient d'arriver. */
          if (i === currentFrame) drawFrame(i);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = frameUrl(isMobile, i);
      });
    }

    async function chargerSequence() {
      await chargerImage(0);
      const PARALLELE = 6;
      for (let debut = 1; debut < frameCount; debut += PARALLELE) {
        if (annule) return;
        await Promise.all(
          Array.from({ length: Math.min(PARALLELE, frameCount - debut) }, (_, k) =>
            chargerImage(debut + k)
          )
        );
      }
    }

    /* Recouvre le canvas sans déformer l'image, quel que soit le ratio.
       Si la frame visée n'est pas encore arrivée, on affiche la plus proche
       déjà chargée : le canvas ne se vide jamais pendant le chargement. */
    function drawFrame(index: number) {
      const cible = Math.min(Math.max(index, 0), frameCount - 1);
      let img: HTMLImageElement | undefined;
      for (let i = cible; i >= 0; i--) {
        if (images[i]?.complete) {
          img = images[i];
          break;
        }
      }
      if (!img?.naturalWidth || !canvas || !ctx2d) return;

      const scale = Math.max(
        canvas.width / img.naturalWidth,
        canvas.height / img.naturalHeight
      );
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;

      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      ctx2d.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    }

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      drawFrame(currentFrame);
    }

    let currentFrame = 0;
    resize();
    window.addEventListener("resize", resize);
    chargerSequence();

    let trigger: ScrollTrigger | undefined;

    if (prefersReduced) {
      /* Sans mouvement : la première image suffit, les paliers de texte
         restent tous lisibles puisqu'ils ne dépendent plus du scroll. */
      setBeatIndex(0);
    } else {
      const gsapCtx = gsap.context(() => {
        trigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => {
            currentFrame = Math.round(self.progress * (frameCount - 1));
            drawFrame(currentFrame);

            let next = 0;
            for (let i = 0; i < BEATS.length; i++) {
              if (self.progress >= BEATS[i].at) next = i;
            }
            setBeatIndex(next);
          },
        });
      }, section);

      return () => {
        annule = true;
        window.removeEventListener("resize", resize);
        gsapCtx.revert();
      };
    }

    return () => {
      annule = true;
      window.removeEventListener("resize", resize);
      trigger?.kill();
    };
  }, []);

  return (
    /* -mt-16 : la vidéo remonte sous le bandeau, qui est transparent ici. */
    <section ref={sectionRef} className="relative -mt-16 h-[320vh]">
      {/* Repère lu par le bandeau : tant qu'il est à l'écran, la vidéo occupe
          le cadre et le bandeau reste transparent. */}
      <div
        id="hero-sentinelle"
        aria-hidden
        className="pointer-events-none absolute inset-0"
      />

      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />

        {/* Voile porteur de contraste : garantit la lisibilité AA du texte
            quelle que soit la frame affichée derrière. Vertical sur mobile
            (le texte occupe toute la largeur), latéral à partir de md. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/25 md:bg-gradient-to-r md:from-black/80 md:via-black/45 md:to-transparent"
        />

        <div className="relative mx-auto flex h-full max-w-[1400px] items-center px-6">
          <div className="max-w-xl">
            {BEATS.map((beat, i) => (
              <div
                key={beat.title}
                aria-hidden={i !== beatIndex}
                className={`transition-opacity duration-500 ${
                  i === beatIndex
                    ? "opacity-100"
                    : "pointer-events-none absolute opacity-0"
                }`}
              >
                <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-white md:text-6xl">
                  {beat.title}
                </h1>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-white/80">
                  {beat.body}
                </p>
              </div>
            ))}

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="/catalogue"
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-[0.9375rem] font-medium text-[#0b1a14] transition-transform duration-200 active:translate-y-[1px]"
              >
                Voir les montures
              </a>
              <a
                href="/prise-en-charge"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/35 px-7 text-[0.9375rem] font-medium text-white transition-colors duration-200 hover:border-white/70"
              >
                Comment ça marche
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
