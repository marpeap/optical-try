import type { DeviceTier } from "./deviceTier";

export type QualityPreset = {
  renderScale: number;
  taaLevel: number;
  bloomEnabled: boolean;
  lightReconstructionEnabled: boolean;
};

const PRESETS: Record<Exclude<DeviceTier, "incompatible">, QualityPreset> = {
  desktop: {
    renderScale: 1,
    taaLevel: 3,
    bloomEnabled: true,
    lightReconstructionEnabled: true,
  },
  "mobile-haut-de-gamme": {
    renderScale: 0.75,
    taaLevel: 2,
    bloomEnabled: true,
    lightReconstructionEnabled: true,
  },
  "mobile-bas-de-gamme": {
    renderScale: 0.5,
    taaLevel: 0,
    bloomEnabled: false,
    lightReconstructionEnabled: false,
  },
};

export function getQualityPreset(tier: Exclude<DeviceTier, "incompatible">): QualityPreset {
  return PRESETS[tier];
}
