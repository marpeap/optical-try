"use client";

import { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react/dist/ssr/X";
import { ArrowsOutCardinal } from "@phosphor-icons/react/dist/ssr/ArrowsOutCardinal";
import type { Frame } from "@/lib/types";
import {
  loadJeelizWidget,
  enfilerOperation,
  messageForError,
  type JeelizErrorLabel,
} from "./engine/jeelizWidget";

type Phase =
  | { name: "chargement" }
  | { name: "actif" }
  | { name: "erreur"; message: string; reessayable: boolean };

export function TryOnOverlay({
  frame,
  frames,
  onSelectFrame,
  onClose,
}: {
  frame: Frame;
  frames: Frame[];
  onSelectFrame: (frame: Frame) => void;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>({ name: "chargement" });
  /* Incrémenté par « Réessayer » : relance l'effet après que l'utilisateur a
     accordé la caméra, sans lui faire rouvrir l'essayage. */
  const [essai, setEssai] = useState(0);

  /*
    Le démarrage est mis en file (voir enfilerOperation) plutôt que gardé par
    une ref : une ref survivrait au démontage de StrictMode et empêcherait
    définitivement le second montage d'appeler start().

    Le nettoyage détruit le widget, ce qui coupe le flux caméra. Sans cela,
    la caméra resterait active après la fermeture de l'essayage.
  */
  useEffect(() => {
    let annule = false;
    let demarre = false;
    setPhase({ name: "chargement" });

    enfilerOperation(async () => {
      const widget = await loadJeelizWidget();
      if (annule) return;

      demarre = true;
      widget.start({
        sku: frame.sku,
        isShadow: true,
        callbackReady: () => {
          if (!annule) setPhase({ name: "actif" });
        },
        onError: (label: JeelizErrorLabel) => {
          if (annule) return;
          const { texte, reessayable } = messageForError(label);
          setPhase({ name: "erreur", message: texte, reessayable });
        },
      });
    }).catch(() => {
      if (annule) return;
      const { texte, reessayable } = messageForError("LOAD_FAILED");
      setPhase({ name: "erreur", message: texte, reessayable });
    });

    return () => {
      annule = true;
      if (!demarre) return;

      enfilerOperation(async () => {
        const widget = await loadJeelizWidget();
        await widget.destroy();
      }).catch(() => undefined);
    };
  }, [frame.sku, essai]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  /*
    Le widget signale certaines pannes caméra par une promesse rejetée non
    interceptée, en plus de son callback onError. Sans ce filet, la rejection
    remonte au navigateur (et à l'écran d'erreur de Next.js en développement)
    alors que l'overlay affiche déjà un message propre.

    L'écouteur ne vit que le temps de l'essayage et ne neutralise que les
    libellés du widget, pour ne pas masquer les erreurs du reste du site.
  */
  useEffect(() => {
    function onRejet(e: PromiseRejectionEvent) {
      const raison = e.reason;
      const libelle = typeof raison === "string" ? raison : raison?.message;
      if (typeof libelle !== "string" || !/^[A-Z][A-Z_]{5,}$/.test(libelle)) {
        return;
      }

      e.preventDefault();
      const { texte, reessayable } = messageForError(
        libelle as JeelizErrorLabel
      );
      setPhase({ name: "erreur", message: texte, reessayable });
    }

    window.addEventListener("unhandledrejection", onRejet);
    return () => window.removeEventListener("unhandledrejection", onRejet);
  }, []);

  function changerMonture(next: Frame) {
    onSelectFrame(next);
    loadJeelizWidget()
      .then((widget) => widget.load(next.sku))
      .catch(() => {
        const { texte, reessayable } = messageForError("LOAD_FAILED");
        setPhase({ name: "erreur", message: texte, reessayable });
      });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Essayage virtuel : ${frame.marque} ${frame.nom}`}
      className="fixed inset-0 z-50 bg-[var(--color-forest-950)]"
    >
      {/* Les identifiants sont imposés par le widget Jeeliz, ne pas renommer. */}
      <div id="JeelizVTOWidget" className="absolute inset-0">
        <canvas id="JeelizVTOWidgetCanvas" className="absolute inset-0" />

        <div id="JeelizVTOWidgetAdjustNotice" className="hidden">
          Déplacez la monture pour l&apos;ajuster.
          <button id="JeelizVTOWidgetAdjustExit" type="button">
            Terminer
          </button>
        </div>

        <div id="JeelizVTOWidgetLoading" className="hidden">
          <div className="JeelizVTOWidgetLoadingText">Chargement</div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer l'essayage"
        className="absolute right-5 top-5 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur-md transition-colors hover:bg-white/22"
      >
        <X size={20} weight="bold" />
      </button>

      {phase.name !== "actif" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
          <div className="max-w-sm text-center">
            {phase.name === "chargement" ? (
              <>
                <div
                  aria-hidden
                  className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/25 border-t-white/90"
                />
                <p className="mt-5 text-white/80">Préparation de l&apos;essayage</p>
              </>
            ) : (
              <>
                <p className="text-lg text-white">{phase.message}</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {phase.reessayable && (
                    <button
                      type="button"
                      onClick={() => setEssai((n) => n + 1)}
                      className="h-11 rounded-full bg-white px-6 text-[0.9375rem] font-medium text-[var(--color-forest-950)] transition-transform active:translate-y-[1px]"
                    >
                      Réessayer
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className={`h-11 rounded-full px-6 text-[0.9375rem] font-medium transition-colors ${
                      phase.reessayable
                        ? "border border-white/35 text-white hover:border-white/70"
                        : "bg-white text-[var(--color-forest-950)]"
                    }`}
                  >
                    Revenir à la fiche
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {phase.name === "actif" && (
        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 to-transparent px-5 pb-6 pt-14">
          <div className="mx-auto max-w-[1400px]">
            <div className="flex items-center gap-2 text-white/60">
              <ArrowsOutCardinal size={16} />
              <p className="text-xs">
                Glissez la monture pour l&apos;ajuster à votre visage
              </p>
            </div>

            <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
              {frames.map((f) => {
                const actif = f.id === frame.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => changerMonture(f)}
                    aria-pressed={actif}
                    className={`flex shrink-0 items-center gap-2.5 rounded-full py-2 pl-2 pr-4 text-sm transition-colors ${
                      actif
                        ? "bg-white text-[var(--color-forest-950)]"
                        : "bg-white/12 text-white hover:bg-white/22"
                    }`}
                  >
                    <span
                      aria-hidden
                      className="h-6 w-6 rounded-full ring-1 ring-white/30"
                      style={{ backgroundColor: f.couleurHex }}
                    />
                    <span className="whitespace-nowrap font-medium">{f.nom}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
