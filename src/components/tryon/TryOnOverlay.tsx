"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "@phosphor-icons/react/dist/ssr/X";
import { ArrowsOutCardinal } from "@phosphor-icons/react/dist/ssr/ArrowsOutCardinal";
import type { Frame } from "@/lib/types";
import {
  loadJeelizWidget,
  messageForError,
  type JeelizErrorLabel,
} from "./engine/jeelizWidget";

type Phase =
  | { name: "chargement" }
  | { name: "actif" }
  | { name: "erreur"; message: string };

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
  const startedRef = useRef(false);

  /* Le widget se démarre une seule fois. Les changements de monture passent
     ensuite par load(), sans réinitialiser la caméra. */
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;

    loadJeelizWidget()
      .then((widget) => {
        if (cancelled) return;
        widget.start({
          sku: frame.sku,
          isShadow: true,
          callbackReady: () => {
            if (!cancelled) setPhase({ name: "actif" });
          },
          onError: (label: JeelizErrorLabel) => {
            if (!cancelled)
              setPhase({ name: "erreur", message: messageForError(label) });
          },
        });
      })
      .catch(() => {
        if (!cancelled)
          setPhase({ name: "erreur", message: messageForError("LOAD_FAILED") });
      });

    return () => {
      cancelled = true;
    };
  }, [frame.sku]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function changerMonture(next: Frame) {
    onSelectFrame(next);
    loadJeelizWidget()
      .then((widget) => widget.load(next.sku))
      .catch(() => {
        setPhase({ name: "erreur", message: messageForError("LOAD_FAILED") });
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
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 h-11 rounded-full bg-white px-6 text-[0.9375rem] font-medium text-[var(--color-forest-950)]"
                >
                  Revenir à la fiche
                </button>
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
