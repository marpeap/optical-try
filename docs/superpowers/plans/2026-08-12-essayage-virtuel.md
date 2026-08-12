# Essayage Virtuel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire l'overlay d'essayage virtuel 3D en webcam, branché sur `WebAR.rocks.face` (MIT), avec adaptation de qualité selon le device et intégration au point d'entrée défini dans le plan Catalogue.

**Architecture:** Composant `TryOnOverlay` isolé, wrapper `webarRocksEngine.ts` autour de la librairie WebAR.rocks.face forkée, heuristique `deviceTier.ts` pour choisir un preset de qualité, dégradation gracieuse sur toutes les erreurs matérielles (permission caméra, WebGL absent, device faible).

**Tech Stack:** WebAR.rocks.face (fork de leur dépôt, licence MIT), Three.js (rendu 3D, déjà requis par WebAR.rocks.face), TypeScript, Vitest + @testing-library/react pour la logique testable.

## Global Constraints

- Moteur = WebAR.rocks.face uniquement. Jeeliz explicitement écarté (licence incompatible avec le déploiement public prévu) (spec sous-projet 2).
- Assets 3D : budget zéro, modèles CC0/CC-BY Sketchfab uniquement (spec sous-projet 2).
- Mobile obligatoire dès le MVP — pas de version desktop-only (spec sous-projet 2).
- IPD (mesure écart pupillaire) hors périmètre — essayage visuel uniquement (spec sous-projet 2).
- Pas de changement d'URL à l'ouverture/fermeture de l'overlay (spec sous-projet 1, décision "overlay plein écran").
- Validation obligatoire avant tout commit : `npx tsc --noEmit` sans erreur.
- Dépend du plan Catalogue déjà implémenté : `Frame` (`src/lib/types.ts`), `TryOnTrigger` (`src/components/product/TryOnTrigger.tsx`), `ProductDetail` (`src/components/product/ProductDetail.tsx`).

---

### Task 1: Acquisition et préparation des modèles 3D (assets)

**Files:**
- Create: `public/models/frames/*.glb` (5-8 fichiers, un par monture du catalogue)
- Create: `docs/superpowers/assets/modeles-3d-sources.md` (traçabilité des licences)

**Interfaces:**
- Produces: fichiers `.glb` référencés depuis `src/data/frames.ts` (modifié par Task 2) via le champ `modele3dUrl`.

Cette tâche est manuelle (recherche et curation d'assets), pas du code — elle ne suit donc pas le cycle TDD des autres tâches. Chaque étape reste néanmoins vérifiable.

- [ ] **Step 1: Rechercher des modèles CC0/CC-BY sur Sketchfab**

Aller sur `https://sketchfab.com/search?q=glasses&type=models`, filtrer par licence "CC Attribution" ou "CC0" (colonne de filtres à gauche), et par téléchargeable ("Downloadable"). Chercher 5 à 8 modèles de montures visuellement distincts (formes différentes : ronde, carrée, aviateur, papillon, rectangulaire — cohérent avec les 6 montures de `src/data/frames.ts` du plan Catalogue) et de qualité suffisante (texture PBR si possible, topologie propre visible dans le viewer 3D intégré).

- [ ] **Step 2: Télécharger et convertir au format glTF/GLB**

Pour chaque modèle retenu, télécharger au format glTF/GLB directement si Sketchfab le propose (la plupart des modèles CC0 récents l'offrent). Si le format natif est différent (OBJ/FBX), convertir avec Blender :

```bash
blender --background --python-expr "
import bpy
bpy.ops.import_scene.obj(filepath='chemin/vers/modele.obj')
bpy.ops.export_scene.gltf(filepath='public/models/frames/nom-monture.glb', export_format='GLB')
"
```

- [ ] **Step 3: Nommer et placer les fichiers**

Nommer chaque fichier selon le slug de la monture correspondante dans `src/data/frames.ts` (ex: `orea-noire.glb`), placer dans `public/models/frames/`.

- [ ] **Step 4: Documenter la traçabilité des licences**

Créer `docs/superpowers/assets/modeles-3d-sources.md` :

```markdown
# Sources des modèles 3D — catalogue démo

| Fichier | Slug monture | Source Sketchfab (URL) | Auteur | Licence |
|---|---|---|---|---|
| orea-noire.glb | orea-noire | [URL] | [Nom auteur] | CC0 / CC-BY (préciser) |
| ... | ... | ... | ... | ... |

Note : les modèles sous CC-BY nécessitent une attribution visible sur le site (page "Crédits" ou mentions légales) — à répercuter dans le plan Parcours mockup si une page de crédits est ajoutée.
```

Remplir une ligne par modèle réellement téléchargé.

- [ ] **Step 5: Vérifier le poids des fichiers**

```bash
du -h public/models/frames/*.glb
```

Expected: chaque fichier < 5 Mo (au-delà, envisager une compression Draco via `gltf-transform` avant de continuer — `npx @gltf-transform/cli optimize input.glb output.glb`).

- [ ] **Step 6: Commit**

```bash
git add public/models/frames/*.glb docs/superpowers/assets/modeles-3d-sources.md
git commit -m "feat: modèles 3D CC0/CC-BY des montures du catalogue démo"
```

---

### Task 2: Brancher `modele3dUrl` sur les données du catalogue

**Files:**
- Modify: `src/data/frames.ts:1-60` (ajouter `modele3dUrl` sur chaque objet `Frame`)
- Modify: `src/data/frames.test.ts` (nouveau test)

**Interfaces:**
- Consumes: `public/models/frames/*.glb` (Task 1).
- Produces: chaque `Frame` de `frames` a désormais un `modele3dUrl` non vide.

- [ ] **Step 1: Écrire le test (échoue — champ absent)**

Ajouter à `src/data/frames.test.ts` :

```typescript
it("chaque monture a un modele3dUrl défini", () => {
  for (const frame of frames) {
    expect(frame.modele3dUrl).toBeTruthy();
    expect(frame.modele3dUrl).toMatch(/^\/models\/frames\/.+\.glb$/);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- frames.test.ts
```

Expected: FAIL — `modele3dUrl` est `undefined` pour toutes les montures.

- [ ] **Step 3: Ajouter les URLs**

Modifier chaque objet dans `src/data/frames.ts` pour ajouter la ligne (exemple pour la première monture) :

```typescript
modele3dUrl: "/models/frames/orea-noire.glb",
```

Répéter pour les 5-8 montures avec le nom de fichier exact déposé à l'étape 1.

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- frames.test.ts
npm run typecheck
```

Expected: tous les tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/frames.ts src/data/frames.test.ts
git commit -m "feat: brancher les modele3dUrl sur les données du catalogue"
```

---

### Task 3: Fork et intégration de WebAR.rocks.face

**Files:**
- Create: `vendor/webarrocksface/` (fichiers forkés)
- Create: `docs/superpowers/assets/webarrocksface-fork-notes.md`

**Interfaces:**
- Produces: bibliothèque `WebAR.rocks.face` disponible localement, importable par Task 4 (`webarRocksEngine.ts`).

Tâche d'intégration de dépôt tiers, pas de code applicatif — pas de cycle TDD.

- [ ] **Step 1: Cloner le dépôt source**

```bash
git clone https://github.com/WebAR-rocks/WebAR.rocks.face.git /tmp/webarrocksface-src
```

- [ ] **Step 2: Vérifier la licence avant tout usage**

```bash
cat /tmp/webarrocksface-src/LICENSE | head -20
```

Expected: licence MIT visible (déjà confirmé par la recherche préalable, section 24 de `[[02-Projets-Marpeap/Lunettes-Optique]]` dans le vault) — revérifier ici car les licences peuvent changer entre deux commits.

- [ ] **Step 3: Copier les fichiers nécessaires**

```bash
mkdir -p "vendor/webarrocksface"
cp -r /tmp/webarrocksface-src/dist vendor/webarrocksface/dist
cp -r /tmp/webarrocksface-src/demos/VTOGlasses vendor/webarrocksface/VTOGlasses-reference
cp /tmp/webarrocksface-src/LICENSE vendor/webarrocksface/LICENSE
```

- [ ] **Step 4: Documenter la provenance**

`docs/superpowers/assets/webarrocksface-fork-notes.md` :

```markdown
# Fork WebAR.rocks.face

- Source : https://github.com/WebAR-rocks/WebAR.rocks.face
- Commit de référence : [remplacer par le hash exact obtenu via `git -C /tmp/webarrocksface-src rev-parse HEAD`]
- Licence : MIT (voir vendor/webarrocksface/LICENSE)
- `dist/` : build de la librairie, utilisé tel quel par `webarRocksEngine.ts`.
- `VTOGlasses-reference/` : démo officielle conservée en lecture seule comme référence — ne pas modifier directement, s'en inspirer dans `webarRocksEngine.ts`.
```

Remplacer le hash de commit par la vraie valeur obtenue à l'étape.

- [ ] **Step 5: Commit**

```bash
git add vendor/webarrocksface docs/superpowers/assets/webarrocksface-fork-notes.md
git commit -m "chore: fork WebAR.rocks.face (MIT) comme base moteur essayage virtuel"
```

---

### Task 4: `deviceTier` — heuristique de qualité selon le device

**Files:**
- Create: `src/components/tryon/engine/deviceTier.ts`
- Test: `src/components/tryon/engine/deviceTier.test.ts`

**Interfaces:**
- Produces: `type DeviceTier = "desktop" | "mobile-haut-de-gamme" | "mobile-bas-de-gamme" | "incompatible"`, `function detectDeviceTier(nav: { userAgent: string; hardwareConcurrency?: number }, hasWebGL: boolean): DeviceTier` — consommé par Task 6 (`webarRocksEngine.ts`) et Task 7 (`TryOnOverlay.tsx`).

- [ ] **Step 1: Écrire le test (échoue — fonction inexistante)**

`src/components/tryon/engine/deviceTier.test.ts` :

```typescript
import { describe, it, expect } from "vitest";
import { detectDeviceTier } from "./deviceTier";

describe("detectDeviceTier", () => {
  it("retourne incompatible si WebGL est absent", () => {
    const nav = { userAgent: "desktop-chrome", hardwareConcurrency: 8 };
    expect(detectDeviceTier(nav, false)).toBe("incompatible");
  });

  it("retourne desktop pour un user-agent non mobile", () => {
    const nav = {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120",
      hardwareConcurrency: 8,
    };
    expect(detectDeviceTier(nav, true)).toBe("desktop");
  });

  it("retourne mobile-haut-de-gamme pour un mobile avec beaucoup de coeurs CPU", () => {
    const nav = {
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
      hardwareConcurrency: 6,
    };
    expect(detectDeviceTier(nav, true)).toBe("mobile-haut-de-gamme");
  });

  it("retourne mobile-bas-de-gamme pour un mobile avec peu de coeurs CPU", () => {
    const nav = {
      userAgent: "Mozilla/5.0 (Linux; Android 12; SM-A125F)",
      hardwareConcurrency: 4,
    };
    expect(detectDeviceTier(nav, true)).toBe("mobile-bas-de-gamme");
  });

  it("retourne mobile-bas-de-gamme si hardwareConcurrency est indisponible", () => {
    const nav = { userAgent: "Mozilla/5.0 (Linux; Android 10)" };
    expect(detectDeviceTier(nav, true)).toBe("mobile-bas-de-gamme");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- deviceTier.test.ts
```

Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter**

`src/components/tryon/engine/deviceTier.ts` :

```typescript
export type DeviceTier =
  | "desktop"
  | "mobile-haut-de-gamme"
  | "mobile-bas-de-gamme"
  | "incompatible";

const MOBILE_UA_REGEX = /Mobi|Android|iPhone|iPad/i;
const HIGH_END_CPU_THRESHOLD = 6;

export function detectDeviceTier(
  nav: { userAgent: string; hardwareConcurrency?: number },
  hasWebGL: boolean
): DeviceTier {
  if (!hasWebGL) return "incompatible";

  const isMobile = MOBILE_UA_REGEX.test(nav.userAgent);
  if (!isMobile) return "desktop";

  const cores = nav.hardwareConcurrency ?? 0;
  return cores >= HIGH_END_CPU_THRESHOLD ? "mobile-haut-de-gamme" : "mobile-bas-de-gamme";
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- deviceTier.test.ts
```

Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/tryon/engine/deviceTier.ts src/components/tryon/engine/deviceTier.test.ts
git commit -m "feat: heuristique detectDeviceTier avec tests"
```

---

### Task 5: `qualityPresets` — configuration de rendu par palier

**Files:**
- Create: `src/components/tryon/engine/qualityPresets.ts`
- Test: `src/components/tryon/engine/qualityPresets.test.ts`

**Interfaces:**
- Consumes: `DeviceTier` (Task 4).
- Produces: `type QualityPreset = { renderScale: number; materialComplexity: "full" | "simplifie"; trackingFps: number }`, `function getQualityPreset(tier: DeviceTier): QualityPreset` — consommé par Task 6 (`webarRocksEngine.ts`).

- [ ] **Step 1: Écrire le test**

`src/components/tryon/engine/qualityPresets.test.ts` :

```typescript
import { describe, it, expect } from "vitest";
import { getQualityPreset } from "./qualityPresets";

describe("getQualityPreset", () => {
  it("desktop : résolution pleine, matériaux complets", () => {
    const preset = getQualityPreset("desktop");
    expect(preset.renderScale).toBe(1);
    expect(preset.materialComplexity).toBe("full");
    expect(preset.trackingFps).toBe(30);
  });

  it("mobile-haut-de-gamme : résolution légèrement réduite, matériaux complets", () => {
    const preset = getQualityPreset("mobile-haut-de-gamme");
    expect(preset.renderScale).toBe(0.75);
    expect(preset.materialComplexity).toBe("full");
    expect(preset.trackingFps).toBe(24);
  });

  it("mobile-bas-de-gamme : résolution réduite, matériaux simplifiés, tracking allégé", () => {
    const preset = getQualityPreset("mobile-bas-de-gamme");
    expect(preset.renderScale).toBe(0.5);
    expect(preset.materialComplexity).toBe("simplifie");
    expect(preset.trackingFps).toBe(15);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- qualityPresets.test.ts
```

Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter**

`src/components/tryon/engine/qualityPresets.ts` :

```typescript
import type { DeviceTier } from "./deviceTier";

export type QualityPreset = {
  renderScale: number;
  materialComplexity: "full" | "simplifie";
  trackingFps: number;
};

const PRESETS: Record<Exclude<DeviceTier, "incompatible">, QualityPreset> = {
  desktop: { renderScale: 1, materialComplexity: "full", trackingFps: 30 },
  "mobile-haut-de-gamme": { renderScale: 0.75, materialComplexity: "full", trackingFps: 24 },
  "mobile-bas-de-gamme": { renderScale: 0.5, materialComplexity: "simplifie", trackingFps: 15 },
};

export function getQualityPreset(tier: Exclude<DeviceTier, "incompatible">): QualityPreset {
  return PRESETS[tier];
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- qualityPresets.test.ts
```

Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/tryon/engine/qualityPresets.ts src/components/tryon/engine/qualityPresets.test.ts
git commit -m "feat: presets de qualité par palier device"
```

---

### Task 6: `webarRocksEngine` — wrapper d'initialisation/arrêt

**Files:**
- Create: `src/components/tryon/engine/webarRocksEngine.ts`
- Test: `src/components/tryon/engine/webarRocksEngine.test.ts`

**Interfaces:**
- Consumes: `vendor/webarrocksface/dist` (Task 3), `DeviceTier`/`detectDeviceTier` (Task 4), `QualityPreset`/`getQualityPreset` (Task 5).
- Produces: `type EngineHandle = { stop: () => void }`, `type EngineInitResult = { status: "ok"; handle: EngineHandle } | { status: "erreur"; raison: "permission-refusee" | "webgl-absent" | "echec-initialisation" }`, `async function startEngine(params: { canvas: HTMLCanvasElement; videoStream: MediaStream; modele3dUrl: string; tier: DeviceTier }): Promise<EngineInitResult>` — consommé par Task 7 (`TryOnOverlay.tsx`).

Ce wrapper isole toute la logique testable (sélection de preset, construction de la config passée au moteur, gestion des erreurs) de l'appel réel à la librairie WebAR.rocks.face (non testable en jsdom, qui ne simule ni WebGL ni caméra réelle). La fonction d'appel au moteur réel est injectée en paramètre pour permettre le test.

- [ ] **Step 1: Écrire le test**

`src/components/tryon/engine/webarRocksEngine.test.ts` :

```typescript
import { describe, it, expect, vi } from "vitest";
import { startEngine } from "./webarRocksEngine";

function fakeCanvas() {
  return {} as HTMLCanvasElement;
}

function fakeStream() {
  return {} as MediaStream;
}

describe("startEngine", () => {
  it("retourne une erreur webgl-absent si le device est incompatible", async () => {
    const result = await startEngine({
      canvas: fakeCanvas(),
      videoStream: fakeStream(),
      modele3dUrl: "/models/frames/test.glb",
      tier: "incompatible",
    });
    expect(result.status).toBe("erreur");
    if (result.status === "erreur") {
      expect(result.raison).toBe("webgl-absent");
    }
  });

  it("appelle le moteur injecté avec la config dérivée du preset et retourne un handle", async () => {
    const engineInit = vi.fn().mockResolvedValue({ ok: true, stop: vi.fn() });

    const result = await startEngine(
      {
        canvas: fakeCanvas(),
        videoStream: fakeStream(),
        modele3dUrl: "/models/frames/test.glb",
        tier: "desktop",
      },
      engineInit
    );

    expect(engineInit).toHaveBeenCalledWith(
      expect.objectContaining({
        modele3dUrl: "/models/frames/test.glb",
        renderScale: 1,
        materialComplexity: "full",
      })
    );
    expect(result.status).toBe("ok");
  });

  it("retourne echec-initialisation si le moteur injecté rejette", async () => {
    const engineInit = vi.fn().mockRejectedValue(new Error("boom"));

    const result = await startEngine(
      {
        canvas: fakeCanvas(),
        videoStream: fakeStream(),
        modele3dUrl: "/models/frames/test.glb",
        tier: "desktop",
      },
      engineInit
    );

    expect(result.status).toBe("erreur");
    if (result.status === "erreur") {
      expect(result.raison).toBe("echec-initialisation");
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- webarRocksEngine.test.ts
```

Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter**

`src/components/tryon/engine/webarRocksEngine.ts` :

```typescript
import type { DeviceTier } from "./deviceTier";
import { getQualityPreset } from "./qualityPresets";

export type EngineHandle = { stop: () => void };

export type EngineInitResult =
  | { status: "ok"; handle: EngineHandle }
  | { status: "erreur"; raison: "permission-refusee" | "webgl-absent" | "echec-initialisation" };

export type EngineInitParams = {
  canvas: HTMLCanvasElement;
  videoStream: MediaStream;
  modele3dUrl: string;
  tier: DeviceTier;
};

type RawEngineInit = (config: {
  canvas: HTMLCanvasElement;
  videoStream: MediaStream;
  modele3dUrl: string;
  renderScale: number;
  materialComplexity: "full" | "simplifie";
  trackingFps: number;
}) => Promise<{ ok: boolean; stop: () => void }>;

// Implémentation par défaut, branchée sur la librairie forkée en Task 3.
// Import réel : `import { WEBARROCKSFACE } from "@/../vendor/webarrocksface/dist/WebARRocksFace.js"`
// La forme exacte de l'appel dépend de l'API du fork — à ajuster ici une fois
// le fichier vendor/webarrocksface/VTOGlasses-reference consulté, sans changer
// la signature de RawEngineInit consommée par startEngine.
const defaultEngineInit: RawEngineInit = async (config) => {
  const { WEBARROCKSFACE } = await import(
    /* webpackIgnore: true */ "../../../../vendor/webarrocksface/dist/WebARRocksFace.js"
  );
  return WEBARROCKSFACE.init(config);
};

export async function startEngine(
  params: EngineInitParams,
  engineInit: RawEngineInit = defaultEngineInit
): Promise<EngineInitResult> {
  if (params.tier === "incompatible") {
    return { status: "erreur", raison: "webgl-absent" };
  }

  const preset = getQualityPreset(params.tier);

  try {
    const raw = await engineInit({
      canvas: params.canvas,
      videoStream: params.videoStream,
      modele3dUrl: params.modele3dUrl,
      renderScale: preset.renderScale,
      materialComplexity: preset.materialComplexity,
      trackingFps: preset.trackingFps,
    });

    if (!raw.ok) {
      return { status: "erreur", raison: "echec-initialisation" };
    }

    return { status: "ok", handle: { stop: raw.stop } };
  } catch {
    return { status: "erreur", raison: "echec-initialisation" };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- webarRocksEngine.test.ts
npm run typecheck
```

Expected: 3 tests PASS. Note : `defaultEngineInit` importe dynamiquement le fichier du fork — ce chemin d'import doit être ajusté après consultation réelle de `vendor/webarrocksface/dist/` (Task 3), l'API exacte exposée par le build WebAR.rocks.face pouvant différer du nom `WEBARROCKSFACE.init` utilisé ici à titre de meilleure estimation avant consultation directe du code source forké. Documenter tout ajustement dans `docs/superpowers/assets/webarrocksface-fork-notes.md`.

- [ ] **Step 5: Commit**

```bash
git add src/components/tryon/engine/webarRocksEngine.ts src/components/tryon/engine/webarRocksEngine.test.ts
git commit -m "feat: wrapper webarRocksEngine avec injection testable"
```

---

### Task 7: Composant `TryOnOverlay`

**Files:**
- Create: `src/components/tryon/TryOnOverlay.tsx`
- Test: `src/components/tryon/TryOnOverlay.test.tsx`

**Interfaces:**
- Consumes: `Frame` (plan Catalogue, `src/lib/types.ts`), `detectDeviceTier` (Task 4), `startEngine`/`EngineInitResult` (Task 6).
- Produces: `function TryOnOverlay({ frame, onClose }: { frame: Frame; onClose: () => void }): JSX.Element` — monté par `ProductDetail` (modifié dans Task 8 de ce plan).

- [ ] **Step 1: Écrire le test**

`src/components/tryon/TryOnOverlay.test.tsx` :

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TryOnOverlay } from "./TryOnOverlay";
import { frames } from "@/data/frames";

const frame = { ...frames[0], modele3dUrl: "/models/frames/test.glb" };

describe("TryOnOverlay", () => {
  beforeEach(() => {
    Object.defineProperty(global.navigator, "mediaDevices", {
      value: {
        getUserMedia: vi.fn().mockResolvedValue({} as MediaStream),
      },
      configurable: true,
    });
  });

  it("appelle onClose quand on clique sur le bouton de fermeture", async () => {
    const onClose = vi.fn();
    render(<TryOnOverlay frame={frame} onClose={onClose} />);

    await waitFor(() => screen.getByRole("button", { name: /fermer/i }));
    fireEvent.click(screen.getByRole("button", { name: /fermer/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it("affiche un message si la permission caméra est refusée", async () => {
    (global.navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Permission denied")
    );

    render(<TryOnOverlay frame={frame} onClose={vi.fn()} />);

    await waitFor(() =>
      expect(screen.getByText(/autorisez l'accès à votre caméra/i)).toBeInTheDocument()
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- TryOnOverlay.test.tsx
```

Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter**

`src/components/tryon/TryOnOverlay.tsx` :

```typescript
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

export function TryOnOverlay({ frame, onClose }: { frame: Frame; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineHandleRef = useRef<EngineHandle | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<OverlayState>({ phase: "chargement" });

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!frame.modele3dUrl) {
        setState({ phase: "erreur", message: "Essayage indisponible pour cette monture." });
        return;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      } catch {
        setState({
          phase: "erreur",
          message: "Autorisez l'accès à votre caméra pour essayer cette monture.",
        });
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;

      const tier = detectDeviceTier(navigator, hasWebGL());
      const canvas = canvasRef.current;
      if (!canvas) return;

      const result = await startEngine({
        canvas,
        videoStream: stream,
        modele3dUrl: frame.modele3dUrl,
        tier,
      });

      if (cancelled) return;

      if (result.status === "erreur") {
        const messages: Record<string, string> = {
          "permission-refusee": "Autorisez l'accès à votre caméra pour essayer cette monture.",
          "webgl-absent": "Votre appareil ne permet pas l'essayage virtuel pour le moment.",
          "echec-initialisation": "L'essayage virtuel n'a pas pu démarrer. Réessayez plus tard.",
        };
        setState({ phase: "erreur", message: messages[result.raison] });
        return;
      }

      engineHandleRef.current = result.handle;
      setState({ phase: "actif" });
    }

    init();

    return () => {
      cancelled = true;
      engineHandleRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [frame]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <button type="button" onClick={onClose} className={styles.closeButton}>
        Fermer
      </button>

      {state.phase === "chargement" && <p className={styles.message}>Chargement de l'essayage…</p>}
      {state.phase === "erreur" && <p className={styles.message}>{state.message}</p>}

      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
```

`src/components/tryon/TryOnOverlay.module.css` :

```css
.overlay {
  position: fixed;
  inset: 0;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.canvas {
  width: 100%;
  height: 100%;
}

.closeButton {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1001;
  padding: 8px 16px;
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
}

.message {
  color: #fff;
  text-align: center;
  padding: 24px;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- TryOnOverlay.test.tsx
npm run typecheck
```

Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/tryon/TryOnOverlay.tsx src/components/tryon/TryOnOverlay.module.css src/components/tryon/TryOnOverlay.test.tsx
git commit -m "feat: composant TryOnOverlay avec gestion caméra/erreurs"
```

---

### Task 8: Brancher `TryOnOverlay` dans `ProductDetail`

**Files:**
- Modify: `src/components/product/ProductDetail.tsx` (créé par le plan Catalogue, Task 8)
- Modify: `src/components/product/ProductDetail.test.tsx`

**Interfaces:**
- Consumes: `TryOnOverlay` (Task 7 de ce plan).
- Produces: `ProductDetail` monte réellement `TryOnOverlay` quand `tryOnOpen` est vrai — referme la boucle laissée ouverte par le plan Catalogue.

- [ ] **Step 1: Écrire le test (échoue — overlay pas encore monté)**

Ajouter à `src/components/product/ProductDetail.test.tsx` :

```typescript
it("ouvre TryOnOverlay au clic sur Essayer virtuellement, si modele3dUrl est défini", () => {
  const frameAvecModele = { ...frame, modele3dUrl: "/models/frames/test.glb" };
  render(<ProductDetail frame={frameAvecModele} />);

  fireEvent.click(screen.getByRole("button", { name: /essayer virtuellement/i }));

  expect(screen.getByRole("dialog")).toBeInTheDocument();
});

it("ferme TryOnOverlay au clic sur Fermer", async () => {
  const frameAvecModele = { ...frame, modele3dUrl: "/models/frames/test.glb" };
  render(<ProductDetail frame={frameAvecModele} />);

  fireEvent.click(screen.getByRole("button", { name: /essayer virtuellement/i }));
  fireEvent.click(await screen.findByRole("button", { name: /fermer/i }));

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
```

Ajouter l'import nécessaire en tête de fichier : `import { fireEvent } from "@testing-library/react";` (déjà présent normalement, sinon l'ajouter).

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- ProductDetail.test.tsx
```

Expected: FAIL — aucun élément avec `role="dialog"` trouvé.

- [ ] **Step 3: Modifier `ProductDetail`**

Dans `src/components/product/ProductDetail.tsx`, remplacer le commentaire laissé par le plan Catalogue :

```typescript
// AVANT (laissé par le plan Catalogue) :
// <TryOnTrigger frame={frame} onOpen={() => setTryOnOpen(true)} />
// {/* TryOnOverlay sera monté ici quand tryOnOpen est vrai — branché par le plan "Essayage virtuel" */}

// APRÈS :
```

```typescript
import { TryOnOverlay } from "@/components/tryon/TryOnOverlay";
```

```typescript
<TryOnTrigger frame={frame} onOpen={() => setTryOnOpen(true)} />
{tryOnOpen && <TryOnOverlay frame={frame} onClose={() => setTryOnOpen(false)} />}
```

Retirer également le `void tryOnOpen;` temporaire ajouté en Task 8 du plan Catalogue si présent, puisque `tryOnOpen` est maintenant réellement utilisé.

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- ProductDetail.test.tsx
npm run typecheck
```

Expected: tous les tests PASS (les anciens du plan Catalogue + les 2 nouveaux).

- [ ] **Step 5: Vérification manuelle multi-device**

```bash
npm run dev &
sleep 3
```

Tester manuellement dans un navigateur desktop : ouvrir une fiche produit, cliquer "Essayer virtuellement", autoriser la caméra, vérifier que la monture 3D s'affiche et suit le visage. Refuser la permission une fois pour vérifier le message d'erreur. Répéter le test sur un Android milieu de gamme et un iPhone réels (accès via l'IP locale du serveur dev, ex: `http://192.168.x.x:3000`), conformément à la spec sous-projet 2 qui exige ce test manuel sur 3 profils avant toute mise en avant du MVP.

```bash
kill %1
```

- [ ] **Step 6: Commit**

```bash
git add src/components/product/ProductDetail.tsx src/components/product/ProductDetail.test.tsx
git commit -m "feat: brancher TryOnOverlay dans ProductDetail"
```

---

## Self-Review (fait par l'auteur du plan avant remise)

**Couverture de la spec** : moteur WebAR.rocks.face forké (Task 3), Jeeliz explicitement absent de tout le plan ; assets CC0/CC-BY budget zéro avec traçabilité de licence (Task 1) ; mobile obligatoire via `deviceTier`/`qualityPresets` (Tasks 4-5) ; IPD absente du périmètre (aucune tâche ne l'implémente, conforme) ; overlay plein écran sans changement d'URL (Task 7) ; gestion d'erreur permission/WebGL/échec init (Tasks 6-7) ; contrat d'intégration avec le plan Catalogue honoré et refermé (Task 8).

**Cohérence des types** : `EngineInitResult`/`EngineHandle` définis en Task 6, réutilisés tels quels en Task 7. `DeviceTier` défini en Task 4, réutilisé en Tasks 5, 6, 7 sans divergence de nom. `Frame` réutilisé depuis le plan Catalogue sans modification de forme (seul son contenu de données change, Task 2).

**Point d'incertitude documenté explicitement** (pas un placeholder interdit, mais un risque technique réel signalé comme tel) : Task 6 note que le nom exact de l'API exposée par le build `vendor/webarrocksface/dist/` (`WEBARROCKSFACE.init`) est une estimation à confirmer en lisant le code forké en Task 3 — la signature `RawEngineInit` consommée par `startEngine` reste stable même si ce détail d'implémentation doit être ajusté, donc aucune tâche en aval n'est affectée par un ajustement à cet endroit précis.
