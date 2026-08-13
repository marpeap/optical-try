"use client";

import { useEffect, useRef, useState } from "react";
import type { Frame } from "@/lib/types";
import { detectDeviceTier } from "./engine/deviceTier";
import { startEngine, type EngineHandle } from "./engine/webarRocksEngine";
import styles from "./TryOnOverlay.module.css";

type OverlayState =
  | { phase: "chargement" }
  | { phase: "actif" }
  | { phase: "erreur"; message: string };

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  "permission-refusee": "Autorisez l'accès à votre caméra pour essayer cette monture.",
  "webgl-absent": "Votre appareil ne permet pas l'essayage virtuel pour le moment.",
  "echec-initialisation": "L'essayage virtuel n'a pas pu démarrer. Réessayez plus tard.",
};

export function TryOnOverlay({ frame, onClose }: { frame: Frame; onClose: () => void }) {
  const canvasFaceRef = useRef<HTMLCanvasElement>(null);
  const canvasThreeRef = useRef<HTMLCanvasElement>(null);
  const engineHandleRef = useRef<EngineHandle | null>(null);
  const [state, setState] = useState<OverlayState>({ phase: "chargement" });

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!frame.modele3dUrl) {
        setState({ phase: "erreur", message: "Essayage indisponible pour cette monture." });
        return;
      }

      const canvasFace = canvasFaceRef.current;
      const canvasThree = canvasThreeRef.current;
      if (!canvasFace || !canvasThree) return;

      const tier = detectDeviceTier(navigator, hasWebGL());

      const result = await startEngine({
        canvasFace,
        canvasThree,
        modele3dUrl: frame.modele3dUrl,
        tier,
      });

      if (cancelled) return;

      if (result.status === "erreur") {
        setState({ phase: "erreur", message: ERROR_MESSAGES[result.raison] });
        return;
      }

      engineHandleRef.current = result.handle;
      setState({ phase: "actif" });
    }

    init();

    return () => {
      cancelled = true;
      engineHandleRef.current?.stop();
    };
  }, [frame]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <button type="button" onClick={onClose} className={styles.closeButton}>
        Fermer
      </button>

      {state.phase === "chargement" && <p className={styles.message}>Chargement de l&apos;essayage…</p>}
      {state.phase === "erreur" && <p className={styles.message}>{state.message}</p>}

      <canvas ref={canvasFaceRef} className={styles.canvasFace} />
      <canvas ref={canvasThreeRef} className={styles.canvasThree} />
    </div>
  );
}
