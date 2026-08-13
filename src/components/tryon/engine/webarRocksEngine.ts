import type { DeviceTier } from "./deviceTier";
import { getQualityPreset } from "./qualityPresets";
import { loadVendorScripts } from "./loadVendorScripts";

export type EngineHandle = { stop: () => void };

export type EngineInitResult =
  | { status: "ok"; handle: EngineHandle }
  | { status: "erreur"; raison: "permission-refusee" | "webgl-absent" | "echec-initialisation" };

export type EngineInitParams = {
  canvasFace: HTMLCanvasElement;
  canvasThree: HTMLCanvasElement;
  modele3dUrl: string;
  tier: DeviceTier;
};

// Config passée à window.WebARRocksMirror.init() — voir
// vendor/webarrocksface/helpers/WebARRocksMirror.js pour la liste complète
// des options par défaut (_defaultSpec).
export type MirrorInitConfig = {
  canvasFace: HTMLCanvasElement;
  canvasThree: HTMLCanvasElement;
  width: number;
  height: number;
  specWebARRocksFace: {
    NNCPath: string;
    scanSettings: { threshold: number };
  };
  isGlasses: true;
  modelURL: string;
  occluderURL: null;
  envmapURL: null;
  taaLevel: number;
  bloom: { threshold: number; strength: number; radius: number } | null;
  isLightReconstructionEnabled: boolean;
};

export function buildInitConfig(params: {
  canvasFace: HTMLCanvasElement;
  canvasThree: HTMLCanvasElement;
  modele3dUrl: string;
  tier: Exclude<DeviceTier, "incompatible">;
}): MirrorInitConfig {
  const preset = getQualityPreset(params.tier);

  return {
    canvasFace: params.canvasFace,
    canvasThree: params.canvasThree,
    width: window.innerWidth,
    height: window.innerHeight,
    specWebARRocksFace: {
      NNCPath: "/vendor/webarrocksface/neuralNets/NN_GLASSES_9.json",
      scanSettings: { threshold: 0.8 },
    },
    isGlasses: true,
    modelURL: params.modele3dUrl,
    // occluderURL/envmapURL laissés à null : les assets de la démo officielle
    // (vendor/webarrocksface/VTOGlasses-reference/assets/) ne sont pas
    // certains d'être couverts par la licence MIT du dépôt (voir
    // docs/superpowers/assets/webarrocksface-fork-notes.md, section "Nuance
    // de licence") — à remplacer par des assets maison si besoin.
    occluderURL: null,
    envmapURL: null,
    taaLevel: preset.taaLevel,
    bloom: preset.bloomEnabled ? { threshold: 0.8, strength: 10, radius: 1 } : null,
    isLightReconstructionEnabled: preset.lightReconstructionEnabled,
  };
}

type MirrorInit = (config: MirrorInitConfig) => Promise<unknown>;

async function defaultMirrorInit(config: MirrorInitConfig): Promise<unknown> {
  await loadVendorScripts();
  const WebARRocksMirror = (window as unknown as { WebARRocksMirror: { init: MirrorInit } })
    .WebARRocksMirror;
  return WebARRocksMirror.init(config);
}

export async function startEngine(
  params: EngineInitParams,
  mirrorInit: MirrorInit = defaultMirrorInit
): Promise<EngineInitResult> {
  if (params.tier === "incompatible") {
    return { status: "erreur", raison: "webgl-absent" };
  }

  const config = buildInitConfig({
    canvasFace: params.canvasFace,
    canvasThree: params.canvasThree,
    modele3dUrl: params.modele3dUrl,
    tier: params.tier,
  });

  try {
    await mirrorInit(config);
    return {
      status: "ok",
      handle: {
        stop: () => {
          const canvas = params.canvasFace;
          const track = (canvas as unknown as { videoStream?: MediaStream }).videoStream;
          track?.getTracks().forEach((t) => t.stop());
        },
      },
    };
  } catch (err) {
    const message = typeof err === "string" ? err : String(err);
    const raison = /permission|NotAllowedError/i.test(message)
      ? "permission-refusee"
      : "echec-initialisation";
    return { status: "erreur", raison };
  }
}
