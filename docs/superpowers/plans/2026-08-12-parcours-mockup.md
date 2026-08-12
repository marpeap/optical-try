# Parcours Mockup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire le wizard de 9 étapes (ordonnance → vérification → infos perso → mutuelle → tiers payant → devis → reste à charge → paiement → confirmation), 100% frontend, avec logique de calcul fake mais cohérente et persistance en `localStorage`.

**Architecture:** Un état de wizard typé et centralisé (`wizardState.ts`), une route Next.js par étape (`app/commande/[step]/page.tsx`), un composant par étape, deux modules de logique pure testables (`fakeCalculations.ts`, `fakeOcr.ts`).

**Tech Stack:** Next.js (App Router), TypeScript, React (`"use client"` pour tout ce qui touche `localStorage`), Vitest + @testing-library/react.

## Global Constraints

- Aucune donnée envoyée à un serveur — tout est simulé et local (spec sous-projet 3).
- Persistance en `localStorage` (spec sous-projet 3).
- Les 9 étapes complètes, pas de version réduite (spec sous-projet 3).
- Faux OCR : délai simulé (1-2s) + valeurs factices ; édition par l'utilisateur souhaitable mais non bloquante pour le MVP (spec sous-projet 3).
- Accès direct à une étape sans état préalable → redirection vers le début avec message explicatif (spec sous-projet 3).
- Validation obligatoire avant tout commit : `npx tsc --noEmit` sans erreur.
- Dépend du plan Catalogue déjà implémenté : `Frame` (`src/lib/types.ts`, avec `classeSante`), `frames` (`src/data/frames.ts`), lien `/commande/ordonnance?frame={slug}` déjà posé dans `ProductDetail`.

---

### Task 1: État du wizard (`wizardState`)

**Files:**
- Create: `src/lib/wizardState.ts`
- Test: `src/lib/wizardState.test.ts`

**Interfaces:**
- Consumes: `Frame` (plan Catalogue).
- Produces: `type WizardState` (voir ci-dessous), `function loadWizardState(): WizardState | null`, `function saveWizardState(state: WizardState): void`, `function clearWizardState(): void`, `function initWizardState(frame: Frame): WizardState` — consommés par toutes les tâches suivantes de ce plan.

- [ ] **Step 1: Écrire le test (échoue — module inexistant)**

`src/lib/wizardState.test.ts` :

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import {
  initWizardState,
  loadWizardState,
  saveWizardState,
  clearWizardState,
} from "./wizardState";
import { frames } from "@/data/frames";

describe("wizardState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initWizardState crée un état avec la monture choisie et les étapes suivantes vides", () => {
    const state = initWizardState(frames[0]);
    expect(state.frame.slug).toBe(frames[0].slug);
    expect(state.ordonnance).toBeNull();
    expect(state.infosPerso).toBeNull();
  });

  it("saveWizardState puis loadWizardState retourne le même état", () => {
    const state = initWizardState(frames[0]);
    saveWizardState(state);

    const loaded = loadWizardState();
    expect(loaded).toEqual(state);
  });

  it("loadWizardState retourne null si rien n'est stocké", () => {
    expect(loadWizardState()).toBeNull();
  });

  it("clearWizardState supprime l'état stocké", () => {
    saveWizardState(initWizardState(frames[0]));
    clearWizardState();
    expect(loadWizardState()).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- wizardState.test.ts
```

Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter**

`src/lib/wizardState.ts` :

```typescript
import type { Frame } from "./types";

export type Ordonnance = {
  od: { sph: number; cyl: number; axe: number; add: number };
  og: { sph: number; cyl: number; axe: number; add: number };
  verifie: boolean;
};

export type InfosPerso = {
  nom: string;
  prenom: string;
  email: string;
};

export type Mutuelle = {
  nom: string;
  niveauCouverture: "basique" | "responsable" | "premium";
};

export type TiersPayant = {
  simule: boolean;
  organisme: string | null;
};

export type Devis = {
  prixMonture: number;
  prixVerres: number;
  total: number;
};

export type ResteACharge = {
  montant: number;
  detailClasse: "A" | "B";
};

export type Paiement = {
  statut: "en_attente" | "valide";
};

export type WizardState = {
  frame: Frame;
  ordonnance: Ordonnance | null;
  infosPerso: InfosPerso | null;
  mutuelle: Mutuelle | null;
  tiersPayant: TiersPayant | null;
  devis: Devis | null;
  resteACharge: ResteACharge | null;
  paiement: Paiement | null;
};

const STORAGE_KEY = "lunettes-wizard-state";

export function initWizardState(frame: Frame): WizardState {
  return {
    frame,
    ordonnance: null,
    infosPerso: null,
    mutuelle: null,
    tiersPayant: null,
    devis: null,
    resteACharge: null,
    paiement: null,
  };
}

export function saveWizardState(state: WizardState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadWizardState(): WizardState | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WizardState;
  } catch {
    return null;
  }
}

export function clearWizardState(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- wizardState.test.ts
npm run typecheck
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/wizardState.ts src/lib/wizardState.test.ts
git commit -m "feat: état du wizard typé avec persistance localStorage"
```

---

### Task 2: `fakeOcr` — simulation de l'extraction d'ordonnance

**Files:**
- Create: `src/lib/fakeOcr.ts`
- Test: `src/lib/fakeOcr.test.ts`

**Interfaces:**
- Produces: `function simulateOcr(): Promise<Ordonnance>` (délai 1-2s inclus) — consommé par Task 5 (`OrdonnanceStep`).

- [ ] **Step 1: Écrire le test**

`src/lib/fakeOcr.test.ts` :

```typescript
import { describe, it, expect } from "vitest";
import { simulateOcr } from "./fakeOcr";

describe("simulateOcr", () => {
  it("retourne des valeurs SPH/CYL/AXE/ADD plausibles pour OD et OG, non vérifiées", async () => {
    const result = await simulateOcr();

    for (const oeil of [result.od, result.og]) {
      expect(oeil.sph).toBeGreaterThanOrEqual(-10);
      expect(oeil.sph).toBeLessThanOrEqual(10);
      expect(oeil.cyl).toBeGreaterThanOrEqual(-6);
      expect(oeil.cyl).toBeLessThanOrEqual(6);
      expect(oeil.axe).toBeGreaterThanOrEqual(0);
      expect(oeil.axe).toBeLessThanOrEqual(180);
    }
    expect(result.verifie).toBe(false);
  });

  it("simule un délai d'au moins 1000ms", async () => {
    const start = Date.now();
    await simulateOcr();
    expect(Date.now() - start).toBeGreaterThanOrEqual(1000);
  }, 5000);
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- fakeOcr.test.ts
```

Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter**

`src/lib/fakeOcr.ts` :

```typescript
import type { Ordonnance } from "./wizardState";

function randomInRange(min: number, max: number, decimals = 2): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

function randomOeil() {
  return {
    sph: randomInRange(-4, 4),
    cyl: randomInRange(-2, 0),
    axe: Math.round(randomInRange(0, 180, 0)),
    add: randomInRange(0, 3),
  };
}

export function simulateOcr(): Promise<Ordonnance> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        od: randomOeil(),
        og: randomOeil(),
        verifie: false,
      });
    }, 1200);
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- fakeOcr.test.ts
npm run typecheck
```

Expected: 2 tests PASS (le second prend ~1.2s, normal).

- [ ] **Step 5: Commit**

```bash
git add src/lib/fakeOcr.ts src/lib/fakeOcr.test.ts
git commit -m "feat: simulation OCR ordonnance avec délai et valeurs factices"
```

---

### Task 3: `fakeCalculations` — devis et reste à charge

**Files:**
- Create: `src/lib/fakeCalculations.ts`
- Test: `src/lib/fakeCalculations.test.ts`

**Interfaces:**
- Consumes: `Frame` (plan Catalogue, champ `classeSante`), `Mutuelle`, `TiersPayant` (Task 1).
- Produces: `function computeDevis(frame: Frame): Devis`, `function computeResteACharge(devis: Devis, frame: Frame, mutuelle: Mutuelle): ResteACharge` — consommés par Task 8 (`DevisStep`) et Task 9 (`ResteAChargeStep`).

- [ ] **Step 1: Écrire le test**

`src/lib/fakeCalculations.test.ts` :

```typescript
import { describe, it, expect } from "vitest";
import { computeDevis, computeResteACharge } from "./fakeCalculations";
import { frames } from "@/data/frames";
import type { Mutuelle } from "./wizardState";

describe("computeDevis", () => {
  it("calcule un devis avec prix monture + prix verres forfaitaire", () => {
    const frame = frames[0];
    const devis = computeDevis(frame);
    expect(devis.prixMonture).toBe(frame.prix);
    expect(devis.prixVerres).toBeGreaterThan(0);
    expect(devis.total).toBe(devis.prixMonture + devis.prixVerres);
  });
});

describe("computeResteACharge", () => {
  it("classe A avec mutuelle responsable : reste à charge nul", () => {
    const frameClasseA = frames.find((f) => f.classeSante === "A")!;
    const devis = computeDevis(frameClasseA);
    const mutuelle: Mutuelle = { nom: "Test Mutuelle", niveauCouverture: "responsable" };

    const resteACharge = computeResteACharge(devis, frameClasseA, mutuelle);

    expect(resteACharge.montant).toBe(0);
    expect(resteACharge.detailClasse).toBe("A");
  });

  it("classe B : reste à charge strictement positif même avec mutuelle responsable", () => {
    const frameClasseB = frames.find((f) => f.classeSante === "B")!;
    const devis = computeDevis(frameClasseB);
    const mutuelle: Mutuelle = { nom: "Test Mutuelle", niveauCouverture: "responsable" };

    const resteACharge = computeResteACharge(devis, frameClasseB, mutuelle);

    expect(resteACharge.montant).toBeGreaterThan(0);
    expect(resteACharge.detailClasse).toBe("B");
  });

  it("classe B avec mutuelle basique : reste à charge plus élevé qu'avec mutuelle premium", () => {
    const frameClasseB = frames.find((f) => f.classeSante === "B")!;
    const devis = computeDevis(frameClasseB);

    const avecBasique = computeResteACharge(devis, frameClasseB, {
      nom: "Test",
      niveauCouverture: "basique",
    });
    const avecPremium = computeResteACharge(devis, frameClasseB, {
      nom: "Test",
      niveauCouverture: "premium",
    });

    expect(avecBasique.montant).toBeGreaterThan(avecPremium.montant);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- fakeCalculations.test.ts
```

Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter**

`src/lib/fakeCalculations.ts` :

```typescript
import type { Frame } from "./types";
import type { Devis, Mutuelle, ResteACharge } from "./wizardState";

const PRIX_VERRES_FORFAITAIRE = 80;

const TAUX_REMBOURSEMENT_MUTUELLE: Record<Mutuelle["niveauCouverture"], number> = {
  basique: 0.3,
  responsable: 0.6,
  premium: 0.9,
};

export function computeDevis(frame: Frame): Devis {
  const prixMonture = frame.prix;
  const prixVerres = PRIX_VERRES_FORFAITAIRE;
  return {
    prixMonture,
    prixVerres,
    total: prixMonture + prixVerres,
  };
}

export function computeResteACharge(
  devis: Devis,
  frame: Frame,
  mutuelle: Mutuelle
): ResteACharge {
  if (frame.classeSante === "A") {
    return { montant: 0, detailClasse: "A" };
  }

  const taux = TAUX_REMBOURSEMENT_MUTUELLE[mutuelle.niveauCouverture];
  const rembourse = devis.total * taux;
  const montant = Math.round((devis.total - rembourse) * 100) / 100;

  return { montant, detailClasse: "B" };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- fakeCalculations.test.ts
npm run typecheck
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/fakeCalculations.ts src/lib/fakeCalculations.test.ts
git commit -m "feat: calcul devis et reste à charge (classe A/B) avec tests"
```

---

### Task 4: `WizardShell` — navigation et garde-fou d'état

**Files:**
- Create: `src/components/wizard/WizardShell.tsx`
- Test: `src/components/wizard/WizardShell.test.tsx`

**Interfaces:**
- Consumes: `loadWizardState` (Task 1).
- Produces: `const WIZARD_STEPS: readonly string[]` (ordre canonique des 9 étapes, réutilisé par Task 12 pour générer les routes), `function WizardShell({ currentStep, children }: { currentStep: string; children: React.ReactNode }): JSX.Element` — consommé par chaque composant d'étape (Tasks 5-11) via composition dans les pages (Task 12).

- [ ] **Step 1: Écrire le test**

`src/components/wizard/WizardShell.test.tsx` :

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { WizardShell, WIZARD_STEPS } from "./WizardShell";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("WizardShell", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
  });

  it("affiche les enfants et un indicateur de progression si un état existe", () => {
    localStorage.setItem(
      "lunettes-wizard-state",
      JSON.stringify({ frame: { slug: "test" }, ordonnance: null })
    );

    render(
      <WizardShell currentStep="ordonnance">
        <p>Contenu étape</p>
      </WizardShell>
    );

    expect(screen.getByText("Contenu étape")).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`1\\s*/\\s*${WIZARD_STEPS.length}`))).toBeInTheDocument();
  });

  it("redirige vers le début du parcours si aucun état n'existe", () => {
    render(
      <WizardShell currentStep="devis">
        <p>Contenu étape</p>
      </WizardShell>
    );

    expect(mockPush).toHaveBeenCalledWith("/catalogue");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- WizardShell.test.tsx
```

Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter**

`src/components/wizard/WizardShell.tsx` :

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState } from "@/lib/wizardState";
import styles from "./WizardShell.module.css";

export const WIZARD_STEPS = [
  "ordonnance",
  "verification",
  "infos-perso",
  "mutuelle",
  "tiers-payant",
  "devis",
  "reste-a-charge",
  "paiement",
  "confirmation",
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number];

export function WizardShell({
  currentStep,
  children,
}: {
  currentStep: WizardStepId;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const state = loadWizardState();
    if (!state) {
      router.push("/catalogue");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  const stepIndex = WIZARD_STEPS.indexOf(currentStep);

  return (
    <div className={styles.shell}>
      <p className={styles.progress}>
        Étape {stepIndex + 1} / {WIZARD_STEPS.length}
      </p>
      {children}
    </div>
  );
}
```

`src/components/wizard/WizardShell.module.css` :

```css
.shell {
  max-width: 640px;
  margin: 0 auto;
  padding: 32px 24px;
}

.progress {
  font-size: 0.85rem;
  opacity: 0.6;
  margin-bottom: 24px;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- WizardShell.test.tsx
npm run typecheck
```

Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/wizard/WizardShell.tsx src/components/wizard/WizardShell.module.css src/components/wizard/WizardShell.test.tsx
git commit -m "feat: WizardShell avec garde-fou d'état et progression"
```

---

### Task 5: `OrdonnanceStep` et `VerificationStep`

**Files:**
- Create: `src/components/wizard/OrdonnanceStep.tsx`
- Create: `src/components/wizard/VerificationStep.tsx`
- Test: `src/components/wizard/OrdonnanceStep.test.tsx`
- Test: `src/components/wizard/VerificationStep.test.tsx`

**Interfaces:**
- Consumes: `simulateOcr` (Task 2), `loadWizardState`/`saveWizardState` (Task 1).
- Produces: deux composants sans props (lisent/écrivent directement l'état via `wizardState.ts`), montés respectivement par les routes `commande/ordonnance` et `commande/verification` (Task 12).

- [ ] **Step 1: Écrire le test `OrdonnanceStep`**

`src/components/wizard/OrdonnanceStep.test.tsx` :

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OrdonnanceStep } from "./OrdonnanceStep";
import { initWizardState, saveWizardState } from "@/lib/wizardState";
import { frames } from "@/data/frames";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("OrdonnanceStep", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    saveWizardState(initWizardState(frames[0]));
  });

  it("simule le traitement OCR après upload puis redirige vers la vérification", async () => {
    render(<OrdonnanceStep />);

    const fileInput = screen.getByLabelText(/photo de l'ordonnance/i);
    const file = new File(["contenu"], "ordonnance.jpg", { type: "image/jpeg" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText(/traitement en cours/i)).toBeInTheDocument();

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/commande/verification"), {
      timeout: 3000,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- OrdonnanceStep.test.tsx
```

Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter `OrdonnanceStep`**

`src/components/wizard/OrdonnanceStep.tsx` :

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { simulateOcr } from "@/lib/fakeOcr";
import { loadWizardState, saveWizardState } from "@/lib/wizardState";

export function OrdonnanceStep() {
  const router = useRouter();
  const [traitementEnCours, setTraitementEnCours] = useState(false);

  async function handleFile(file: File | null) {
    if (!file) return;
    setTraitementEnCours(true);

    const ordonnance = await simulateOcr();
    const state = loadWizardState();
    if (state) {
      saveWizardState({ ...state, ordonnance });
    }

    router.push("/commande/verification");
  }

  return (
    <div>
      <h1>Votre ordonnance</h1>
      <label htmlFor="ordonnance-file">Photo de l&apos;ordonnance</label>
      <input
        id="ordonnance-file"
        type="file"
        accept="image/*"
        disabled={traitementEnCours}
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
      {traitementEnCours && <p>Traitement en cours…</p>}
    </div>
  );
}
```

- [ ] **Step 4: Run test `OrdonnanceStep` to verify it passes**

```bash
npm test -- OrdonnanceStep.test.tsx
```

Expected: 1 test PASS (peut prendre ~1.2s à cause du délai simulé).

- [ ] **Step 5: Écrire le test `VerificationStep`**

`src/components/wizard/VerificationStep.test.tsx` :

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VerificationStep } from "./VerificationStep";
import { initWizardState, saveWizardState } from "@/lib/wizardState";
import { frames } from "@/data/frames";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("VerificationStep", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    const state = initWizardState(frames[0]);
    state.ordonnance = {
      od: { sph: -1.5, cyl: -0.5, axe: 90, add: 0 },
      og: { sph: -1.25, cyl: -0.25, axe: 85, add: 0 },
      verifie: false,
    };
    saveWizardState(state);
  });

  it("affiche les valeurs extraites et valide au clic", () => {
    render(<VerificationStep />);

    expect(screen.getByDisplayValue("-1.5")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /valider/i }));

    expect(mockPush).toHaveBeenCalledWith("/commande/infos-perso");
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

```bash
npm test -- VerificationStep.test.tsx
```

Expected: FAIL — module introuvable.

- [ ] **Step 7: Implémenter `VerificationStep`**

`src/components/wizard/VerificationStep.tsx` :

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState, saveWizardState, type Ordonnance } from "@/lib/wizardState";

export function VerificationStep() {
  const router = useRouter();
  const [ordonnance, setOrdonnance] = useState<Ordonnance | null>(null);

  useEffect(() => {
    const state = loadWizardState();
    if (state?.ordonnance) setOrdonnance(state.ordonnance);
  }, []);

  function updateField(oeil: "od" | "og", champ: keyof Ordonnance["od"], valeur: number) {
    if (!ordonnance) return;
    setOrdonnance({ ...ordonnance, [oeil]: { ...ordonnance[oeil], [champ]: valeur } });
  }

  function handleValider() {
    if (!ordonnance) return;
    const state = loadWizardState();
    if (state) {
      saveWizardState({ ...state, ordonnance: { ...ordonnance, verifie: true } });
    }
    router.push("/commande/infos-perso");
  }

  if (!ordonnance) return <p>Chargement…</p>;

  return (
    <div>
      <h1>Vérifiez vos valeurs</h1>
      <p>Ces valeurs ont été détectées automatiquement. Vérifiez-les avant de continuer.</p>

      {(["od", "og"] as const).map((oeil) => (
        <fieldset key={oeil}>
          <legend>{oeil === "od" ? "Œil droit" : "Œil gauche"}</legend>
          {(["sph", "cyl", "axe", "add"] as const).map((champ) => (
            <label key={champ}>
              {champ.toUpperCase()}
              <input
                type="number"
                step="0.25"
                value={ordonnance[oeil][champ]}
                onChange={(e) => updateField(oeil, champ, Number(e.target.value))}
              />
            </label>
          ))}
        </fieldset>
      ))}

      <button type="button" onClick={handleValider}>
        Valider
      </button>
    </div>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

```bash
npm test -- VerificationStep.test.tsx OrdonnanceStep.test.tsx
npm run typecheck
```

Expected: tous PASS.

- [ ] **Step 9: Commit**

```bash
git add src/components/wizard/OrdonnanceStep.tsx src/components/wizard/VerificationStep.tsx src/components/wizard/OrdonnanceStep.test.tsx src/components/wizard/VerificationStep.test.tsx
git commit -m "feat: étapes Ordonnance et Vérification (faux OCR)"
```

---

### Task 6: `InfosPersoStep`

**Files:**
- Create: `src/components/wizard/InfosPersoStep.tsx`
- Test: `src/components/wizard/InfosPersoStep.test.tsx`

**Interfaces:**
- Consumes: `loadWizardState`/`saveWizardState` (Task 1).
- Produces: composant monté par `commande/infos-perso` (Task 12).

- [ ] **Step 1: Écrire le test**

`src/components/wizard/InfosPersoStep.test.tsx` :

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InfosPersoStep } from "./InfosPersoStep";
import { initWizardState, saveWizardState, loadWizardState } from "@/lib/wizardState";
import { frames } from "@/data/frames";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("InfosPersoStep", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    saveWizardState(initWizardState(frames[0]));
  });

  it("enregistre les infos perso et redirige vers mutuelle", () => {
    render(<InfosPersoStep />);

    fireEvent.change(screen.getByLabelText(/nom/i), { target: { value: "Dupont" } });
    fireEvent.change(screen.getByLabelText(/prénom/i), { target: { value: "Jean" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "jean@test.fr" } });
    fireEvent.click(screen.getByRole("button", { name: /continuer/i }));

    expect(mockPush).toHaveBeenCalledWith("/commande/mutuelle");
    expect(loadWizardState()?.infosPerso).toEqual({
      nom: "Dupont",
      prenom: "Jean",
      email: "jean@test.fr",
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- InfosPersoStep.test.tsx
```

Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter**

`src/components/wizard/InfosPersoStep.tsx` :

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState, saveWizardState } from "@/lib/wizardState";

export function InfosPersoStep() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");

  function handleContinuer() {
    const state = loadWizardState();
    if (state) {
      saveWizardState({ ...state, infosPerso: { nom, prenom, email } });
    }
    router.push("/commande/mutuelle");
  }

  return (
    <div>
      <h1>Vos informations</h1>
      <label htmlFor="nom">Nom</label>
      <input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} />

      <label htmlFor="prenom">Prénom</label>
      <input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />

      <label htmlFor="email">Email</label>
      <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

      <button type="button" onClick={handleContinuer}>
        Continuer
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- InfosPersoStep.test.tsx
npm run typecheck
```

Expected: 1 test PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/wizard/InfosPersoStep.tsx src/components/wizard/InfosPersoStep.test.tsx
git commit -m "feat: étape InfosPerso"
```

---

### Task 7: `MutuelleStep` et `TiersPayantStep`

**Files:**
- Create: `src/components/wizard/MutuelleStep.tsx`
- Create: `src/components/wizard/TiersPayantStep.tsx`
- Test: `src/components/wizard/MutuelleStep.test.tsx`
- Test: `src/components/wizard/TiersPayantStep.test.tsx`

**Interfaces:**
- Consumes: `loadWizardState`/`saveWizardState`, `Mutuelle`, `TiersPayant` (Task 1).
- Produces: composants montés par `commande/mutuelle` et `commande/tiers-payant` (Task 12).

- [ ] **Step 1: Écrire le test `MutuelleStep`**

`src/components/wizard/MutuelleStep.test.tsx` :

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MutuelleStep } from "./MutuelleStep";
import { initWizardState, saveWizardState, loadWizardState } from "@/lib/wizardState";
import { frames } from "@/data/frames";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("MutuelleStep", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    saveWizardState(initWizardState(frames[0]));
  });

  it("enregistre la mutuelle choisie et redirige vers tiers-payant", () => {
    render(<MutuelleStep />);

    fireEvent.change(screen.getByLabelText(/nom de votre mutuelle/i), {
      target: { value: "MGEN" },
    });
    fireEvent.change(screen.getByLabelText(/niveau de couverture/i), {
      target: { value: "premium" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continuer/i }));

    expect(mockPush).toHaveBeenCalledWith("/commande/tiers-payant");
    expect(loadWizardState()?.mutuelle).toEqual({ nom: "MGEN", niveauCouverture: "premium" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- MutuelleStep.test.tsx
```

Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter `MutuelleStep`**

`src/components/wizard/MutuelleStep.tsx` :

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState, saveWizardState, type Mutuelle } from "@/lib/wizardState";

export function MutuelleStep() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [niveauCouverture, setNiveauCouverture] =
    useState<Mutuelle["niveauCouverture"]>("responsable");

  function handleContinuer() {
    const state = loadWizardState();
    if (state) {
      saveWizardState({ ...state, mutuelle: { nom, niveauCouverture } });
    }
    router.push("/commande/tiers-payant");
  }

  return (
    <div>
      <h1>Votre mutuelle</h1>
      <label htmlFor="mutuelle-nom">Nom de votre mutuelle</label>
      <input id="mutuelle-nom" value={nom} onChange={(e) => setNom(e.target.value)} />

      <label htmlFor="mutuelle-niveau">Niveau de couverture</label>
      <select
        id="mutuelle-niveau"
        aria-label="Niveau de couverture"
        value={niveauCouverture}
        onChange={(e) => setNiveauCouverture(e.target.value as Mutuelle["niveauCouverture"])}
      >
        <option value="basique">Basique</option>
        <option value="responsable">Responsable</option>
        <option value="premium">Premium</option>
      </select>

      <button type="button" onClick={handleContinuer}>
        Continuer
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run test `MutuelleStep` to verify it passes**

```bash
npm test -- MutuelleStep.test.tsx
```

Expected: 1 test PASS.

- [ ] **Step 5: Écrire le test `TiersPayantStep`**

`src/components/wizard/TiersPayantStep.test.tsx` :

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TiersPayantStep } from "./TiersPayantStep";
import { initWizardState, saveWizardState, loadWizardState } from "@/lib/wizardState";
import { frames } from "@/data/frames";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("TiersPayantStep", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    saveWizardState(initWizardState(frames[0]));
  });

  it("enregistre le choix de simulation tiers payant et redirige vers devis", () => {
    render(<TiersPayantStep />);

    fireEvent.click(screen.getByLabelText(/simuler une prise en charge/i));
    fireEvent.click(screen.getByRole("button", { name: /continuer/i }));

    expect(mockPush).toHaveBeenCalledWith("/commande/devis");
    expect(loadWizardState()?.tiersPayant?.simule).toBe(true);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

```bash
npm test -- TiersPayantStep.test.tsx
```

Expected: FAIL — module introuvable.

- [ ] **Step 7: Implémenter `TiersPayantStep`**

`src/components/wizard/TiersPayantStep.tsx` :

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState, saveWizardState } from "@/lib/wizardState";

export function TiersPayantStep() {
  const router = useRouter();
  const [simule, setSimule] = useState(false);

  function handleContinuer() {
    const state = loadWizardState();
    if (state) {
      saveWizardState({
        ...state,
        tiersPayant: { simule, organisme: simule ? state.mutuelle?.nom ?? null : null },
      });
    }
    router.push("/commande/devis");
  }

  return (
    <div>
      <h1>Tiers payant</h1>
      <p>
        Cette démo simule une demande de tiers payant — aucune donnée n&apos;est transmise à un
        organisme réel.
      </p>
      <label>
        <input
          type="checkbox"
          checked={simule}
          onChange={(e) => setSimule(e.target.checked)}
        />
        Simuler une prise en charge par ma mutuelle
      </label>

      <button type="button" onClick={handleContinuer}>
        Continuer
      </button>
    </div>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

```bash
npm test -- MutuelleStep.test.tsx TiersPayantStep.test.tsx
npm run typecheck
```

Expected: tous PASS.

- [ ] **Step 9: Commit**

```bash
git add src/components/wizard/MutuelleStep.tsx src/components/wizard/TiersPayantStep.tsx src/components/wizard/MutuelleStep.test.tsx src/components/wizard/TiersPayantStep.test.tsx
git commit -m "feat: étapes Mutuelle et Tiers payant (simulation)"
```

---

### Task 8: `DevisStep` et `ResteAChargeStep`

**Files:**
- Create: `src/components/wizard/DevisStep.tsx`
- Create: `src/components/wizard/ResteAChargeStep.tsx`
- Test: `src/components/wizard/DevisStep.test.tsx`
- Test: `src/components/wizard/ResteAChargeStep.test.tsx`

**Interfaces:**
- Consumes: `computeDevis`/`computeResteACharge` (Task 3), `loadWizardState`/`saveWizardState` (Task 1).
- Produces: composants montés par `commande/devis` et `commande/reste-a-charge` (Task 12).

- [ ] **Step 1: Écrire le test `DevisStep`**

`src/components/wizard/DevisStep.test.tsx` :

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DevisStep } from "./DevisStep";
import { initWizardState, saveWizardState, loadWizardState } from "@/lib/wizardState";
import { frames } from "@/data/frames";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("DevisStep", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    saveWizardState(initWizardState(frames[0]));
  });

  it("affiche le devis calculé et redirige vers reste-a-charge au clic", () => {
    render(<DevisStep />);

    expect(screen.getByText(new RegExp(`${frames[0].prix}\\s*€`))).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /continuer/i }));

    expect(mockPush).toHaveBeenCalledWith("/commande/reste-a-charge");
    expect(loadWizardState()?.devis).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- DevisStep.test.tsx
```

Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter `DevisStep`**

`src/components/wizard/DevisStep.tsx` :

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState, saveWizardState } from "@/lib/wizardState";
import { computeDevis } from "@/lib/fakeCalculations";
import type { Devis } from "@/lib/wizardState";

export function DevisStep() {
  const router = useRouter();
  const [devis, setDevis] = useState<Devis | null>(null);

  useEffect(() => {
    const state = loadWizardState();
    if (!state) return;
    setDevis(computeDevis(state.frame));
  }, []);

  function handleContinuer() {
    const state = loadWizardState();
    if (state && devis) {
      saveWizardState({ ...state, devis });
    }
    router.push("/commande/reste-a-charge");
  }

  if (!devis) return <p>Chargement…</p>;

  return (
    <div>
      <h1>Votre devis</h1>
      <p>Monture : {devis.prixMonture} €</p>
      <p>Verres : {devis.prixVerres} €</p>
      <p>Total : {devis.total} €</p>

      <button type="button" onClick={handleContinuer}>
        Continuer
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run test `DevisStep` to verify it passes**

```bash
npm test -- DevisStep.test.tsx
```

Expected: 1 test PASS.

- [ ] **Step 5: Écrire le test `ResteAChargeStep`**

`src/components/wizard/ResteAChargeStep.test.tsx` :

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResteAChargeStep } from "./ResteAChargeStep";
import { initWizardState, saveWizardState, loadWizardState } from "@/lib/wizardState";
import { computeDevis } from "@/lib/fakeCalculations";
import { frames } from "@/data/frames";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("ResteAChargeStep", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    const frameClasseB = frames.find((f) => f.classeSante === "B")!;
    const state = initWizardState(frameClasseB);
    state.devis = computeDevis(frameClasseB);
    state.mutuelle = { nom: "Test", niveauCouverture: "responsable" };
    saveWizardState(state);
  });

  it("affiche le reste à charge calculé et redirige vers paiement au clic", () => {
    render(<ResteAChargeStep />);

    expect(screen.getByText(/reste à charge/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /continuer/i }));

    expect(mockPush).toHaveBeenCalledWith("/commande/paiement");
    expect(loadWizardState()?.resteACharge).not.toBeNull();
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

```bash
npm test -- ResteAChargeStep.test.tsx
```

Expected: FAIL — module introuvable.

- [ ] **Step 7: Implémenter `ResteAChargeStep`**

`src/components/wizard/ResteAChargeStep.tsx` :

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState, saveWizardState } from "@/lib/wizardState";
import { computeResteACharge } from "@/lib/fakeCalculations";
import type { ResteACharge } from "@/lib/wizardState";

export function ResteAChargeStep() {
  const router = useRouter();
  const [resteACharge, setResteACharge] = useState<ResteACharge | null>(null);

  useEffect(() => {
    const state = loadWizardState();
    if (!state?.devis || !state.mutuelle) return;
    setResteACharge(computeResteACharge(state.devis, state.frame, state.mutuelle));
  }, []);

  function handleContinuer() {
    const state = loadWizardState();
    if (state && resteACharge) {
      saveWizardState({ ...state, resteACharge });
    }
    router.push("/commande/paiement");
  }

  if (!resteACharge) return <p>Chargement…</p>;

  return (
    <div>
      <h1>Reste à charge</h1>
      <p>
        Reste à charge estimé : <strong>{resteACharge.montant} €</strong>
      </p>
      {resteACharge.detailClasse === "A" && (
        <p>Cette monture fait partie de l&apos;offre 100% Santé : reste à charge nul.</p>
      )}

      <button type="button" onClick={handleContinuer}>
        Continuer
      </button>
    </div>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

```bash
npm test -- DevisStep.test.tsx ResteAChargeStep.test.tsx
npm run typecheck
```

Expected: tous PASS.

- [ ] **Step 9: Commit**

```bash
git add src/components/wizard/DevisStep.tsx src/components/wizard/ResteAChargeStep.tsx src/components/wizard/DevisStep.test.tsx src/components/wizard/ResteAChargeStep.test.tsx
git commit -m "feat: étapes Devis et Reste à charge"
```

---

### Task 9: `PaiementStep` et `ConfirmationStep`

**Files:**
- Create: `src/components/wizard/PaiementStep.tsx`
- Create: `src/components/wizard/ConfirmationStep.tsx`
- Test: `src/components/wizard/PaiementStep.test.tsx`
- Test: `src/components/wizard/ConfirmationStep.test.tsx`

**Interfaces:**
- Consumes: `loadWizardState`/`saveWizardState`/`clearWizardState` (Task 1).
- Produces: composants montés par `commande/paiement` et `commande/confirmation` (Task 12).

- [ ] **Step 1: Écrire le test `PaiementStep`**

`src/components/wizard/PaiementStep.test.tsx` :

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PaiementStep } from "./PaiementStep";
import { initWizardState, saveWizardState, loadWizardState } from "@/lib/wizardState";
import { frames } from "@/data/frames";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("PaiementStep", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    saveWizardState(initWizardState(frames[0]));
  });

  it("valide le paiement fake et redirige vers confirmation", () => {
    render(<PaiementStep />);

    fireEvent.change(screen.getByLabelText(/numéro de carte/i), {
      target: { value: "4242 4242 4242 4242" },
    });
    fireEvent.click(screen.getByRole("button", { name: /payer/i }));

    expect(mockPush).toHaveBeenCalledWith("/commande/confirmation");
    expect(loadWizardState()?.paiement?.statut).toBe("valide");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- PaiementStep.test.tsx
```

Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter `PaiementStep`**

`src/components/wizard/PaiementStep.tsx` :

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadWizardState, saveWizardState } from "@/lib/wizardState";

export function PaiementStep() {
  const router = useRouter();
  const [numeroCarte, setNumeroCarte] = useState("");

  function handlePayer() {
    const state = loadWizardState();
    if (state) {
      saveWizardState({ ...state, paiement: { statut: "valide" } });
    }
    router.push("/commande/confirmation");
  }

  return (
    <div>
      <h1>Paiement</h1>
      <p>Démo — aucune vraie transaction n&apos;est effectuée.</p>
      <label htmlFor="carte">Numéro de carte</label>
      <input
        id="carte"
        value={numeroCarte}
        onChange={(e) => setNumeroCarte(e.target.value)}
        placeholder="4242 4242 4242 4242"
      />

      <button type="button" onClick={handlePayer}>
        Payer
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run test `PaiementStep` to verify it passes**

```bash
npm test -- PaiementStep.test.tsx
```

Expected: 1 test PASS.

- [ ] **Step 5: Écrire le test `ConfirmationStep`**

`src/components/wizard/ConfirmationStep.test.tsx` :

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmationStep } from "./ConfirmationStep";
import { initWizardState, saveWizardState, loadWizardState } from "@/lib/wizardState";
import { frames } from "@/data/frames";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("ConfirmationStep", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    saveWizardState(initWizardState(frames[0]));
  });

  it("affiche la confirmation et vide l'état au clic sur recommencer", () => {
    render(<ConfirmationStep />);

    expect(screen.getByText(/commande confirmée/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /recommencer une démo/i }));

    expect(loadWizardState()).toBeNull();
    expect(mockPush).toHaveBeenCalledWith("/catalogue");
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

```bash
npm test -- ConfirmationStep.test.tsx
```

Expected: FAIL — module introuvable.

- [ ] **Step 7: Implémenter `ConfirmationStep`**

`src/components/wizard/ConfirmationStep.tsx` :

```typescript
"use client";

import { useRouter } from "next/navigation";
import { clearWizardState } from "@/lib/wizardState";

export function ConfirmationStep() {
  const router = useRouter();

  function handleRecommencer() {
    clearWizardState();
    router.push("/catalogue");
  }

  return (
    <div>
      <h1>Commande confirmée</h1>
      <p>Votre commande, facture et suivi de commande sont disponibles dans votre espace client.</p>
      <p>Ceci est une démonstration — aucune commande réelle n&apos;a été passée.</p>

      <button type="button" onClick={handleRecommencer}>
        Recommencer une démo
      </button>
    </div>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

```bash
npm test -- PaiementStep.test.tsx ConfirmationStep.test.tsx
npm run typecheck
```

Expected: tous PASS.

- [ ] **Step 9: Commit**

```bash
git add src/components/wizard/PaiementStep.tsx src/components/wizard/ConfirmationStep.tsx src/components/wizard/PaiementStep.test.tsx src/components/wizard/ConfirmationStep.test.tsx
git commit -m "feat: étapes Paiement et Confirmation, reset de la démo"
```

---

### Task 10: Initialisation du wizard depuis la fiche produit

**Files:**
- Create: `src/app/commande/ordonnance/init/page.tsx` — page intermédiaire qui lit le paramètre `frame` et initialise l'état avant de rediriger
- Test: `src/app/commande/ordonnance/init/page.test.tsx`

**Interfaces:**
- Consumes: `frames` (plan Catalogue), `initWizardState`/`saveWizardState` (Task 1).
- Produces: route qui transforme `/commande/ordonnance?frame={slug}` (lien posé par `ProductDetail` dans le plan Catalogue) en un état de wizard initialisé, avant redirection vers la vraie étape ordonnance.

Le lien existant dans `ProductDetail` (plan Catalogue, Task 8) pointe vers `/commande/ordonnance?frame={slug}` — cette tâche fait de cette URL une route d'initialisation dédiée, puis redirige vers `/commande/ordonnance` (sans query string) qui est la vraie première étape gérée par `WizardShell`/`OrdonnanceStep`. Pour éviter toute confusion de route entre "URL d'entrée avec paramètre" et "étape 1 du wizard", cette tâche déplace la logique d'initialisation vers `/commande/ordonnance/init`, et Task 12 devra ajuster le lien de `ProductDetail` en conséquence (modification croisée avec le plan Catalogue, documentée ici).

- [ ] **Step 1: Écrire le test**

`src/app/commande/ordonnance/init/page.test.tsx` :

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import InitPage from "./page";
import { loadWizardState } from "@/lib/wizardState";
import { frames } from "@/data/frames";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(`frame=${frames[0].slug}`),
}));

describe("InitPage", () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
  });

  it("initialise l'état du wizard avec la monture du paramètre puis redirige", () => {
    render(<InitPage />);

    expect(loadWizardState()?.frame.slug).toBe(frames[0].slug);
    expect(mockPush).toHaveBeenCalledWith("/commande/ordonnance");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- "src/app/commande/ordonnance/init/page.test.tsx"
```

Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter**

`src/app/commande/ordonnance/init/page.tsx` :

```typescript
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { frames } from "@/data/frames";
import { initWizardState, saveWizardState } from "@/lib/wizardState";

export default function InitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const slug = searchParams.get("frame");
    const frame = frames.find((f) => f.slug === slug);

    if (!frame) {
      router.push("/catalogue");
      return;
    }

    saveWizardState(initWizardState(frame));
    router.push("/commande/ordonnance");
  }, [router, searchParams]);

  return <p>Préparation de votre parcours…</p>;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- "src/app/commande/ordonnance/init/page.test.tsx"
npm run typecheck
```

Expected: 1 test PASS.

- [ ] **Step 5: Ajuster le lien dans `ProductDetail` (modification croisée avec le plan Catalogue)**

Dans `src/components/product/ProductDetail.tsx` (créé par le plan Catalogue), remplacer :

```typescript
// AVANT :
<Link href={`/commande/ordonnance?frame=${frame.slug}`}>Choisir cette monture</Link>

// APRÈS :
<Link href={`/commande/ordonnance/init?frame=${frame.slug}`}>Choisir cette monture</Link>
```

Mettre à jour le test correspondant dans `src/components/product/ProductDetail.test.tsx` :

```typescript
// Dans le test "affiche le bouton Choisir cette monture avec le bon lien" :
expect(link).toHaveAttribute("href", `/commande/ordonnance/init?frame=${frame.slug}`);
```

```bash
npm test -- ProductDetail.test.tsx
```

Expected: PASS avec le nouveau chemin.

- [ ] **Step 6: Commit**

```bash
git add src/app/commande/ordonnance/init/page.tsx "src/app/commande/ordonnance/init/page.test.tsx" src/components/product/ProductDetail.tsx src/components/product/ProductDetail.test.tsx
git commit -m "feat: page d'initialisation du wizard depuis la fiche produit"
```

---

### Task 11: Routes des 9 étapes du wizard

**Files:**
- Create: `src/app/commande/ordonnance/page.tsx`
- Create: `src/app/commande/verification/page.tsx`
- Create: `src/app/commande/infos-perso/page.tsx`
- Create: `src/app/commande/mutuelle/page.tsx`
- Create: `src/app/commande/tiers-payant/page.tsx`
- Create: `src/app/commande/devis/page.tsx`
- Create: `src/app/commande/reste-a-charge/page.tsx`
- Create: `src/app/commande/paiement/page.tsx`
- Create: `src/app/commande/confirmation/page.tsx`

**Interfaces:**
- Consumes: `WizardShell` (Task 4), chaque composant d'étape (Tasks 5-9).
- Produces: 9 routes navigables formant le wizard complet.

Ces 9 fichiers suivent tous le même patron trivial (composition `WizardShell` + composant d'étape) — pas de logique propre à tester unitairement au niveau de la route elle-même (déjà couvert par les tests de composants des tâches précédentes et par la vérification manuelle de bout en bout).

- [ ] **Step 1: Créer les 9 fichiers de route**

`src/app/commande/ordonnance/page.tsx` :

```typescript
import { WizardShell } from "@/components/wizard/WizardShell";
import { OrdonnanceStep } from "@/components/wizard/OrdonnanceStep";

export default function Page() {
  return (
    <WizardShell currentStep="ordonnance">
      <OrdonnanceStep />
    </WizardShell>
  );
}
```

`src/app/commande/verification/page.tsx` :

```typescript
import { WizardShell } from "@/components/wizard/WizardShell";
import { VerificationStep } from "@/components/wizard/VerificationStep";

export default function Page() {
  return (
    <WizardShell currentStep="verification">
      <VerificationStep />
    </WizardShell>
  );
}
```

`src/app/commande/infos-perso/page.tsx` :

```typescript
import { WizardShell } from "@/components/wizard/WizardShell";
import { InfosPersoStep } from "@/components/wizard/InfosPersoStep";

export default function Page() {
  return (
    <WizardShell currentStep="infos-perso">
      <InfosPersoStep />
    </WizardShell>
  );
}
```

`src/app/commande/mutuelle/page.tsx` :

```typescript
import { WizardShell } from "@/components/wizard/WizardShell";
import { MutuelleStep } from "@/components/wizard/MutuelleStep";

export default function Page() {
  return (
    <WizardShell currentStep="mutuelle">
      <MutuelleStep />
    </WizardShell>
  );
}
```

`src/app/commande/tiers-payant/page.tsx` :

```typescript
import { WizardShell } from "@/components/wizard/WizardShell";
import { TiersPayantStep } from "@/components/wizard/TiersPayantStep";

export default function Page() {
  return (
    <WizardShell currentStep="tiers-payant">
      <TiersPayantStep />
    </WizardShell>
  );
}
```

`src/app/commande/devis/page.tsx` :

```typescript
import { WizardShell } from "@/components/wizard/WizardShell";
import { DevisStep } from "@/components/wizard/DevisStep";

export default function Page() {
  return (
    <WizardShell currentStep="devis">
      <DevisStep />
    </WizardShell>
  );
}
```

`src/app/commande/reste-a-charge/page.tsx` :

```typescript
import { WizardShell } from "@/components/wizard/WizardShell";
import { ResteAChargeStep } from "@/components/wizard/ResteAChargeStep";

export default function Page() {
  return (
    <WizardShell currentStep="reste-a-charge">
      <ResteAChargeStep />
    </WizardShell>
  );
}
```

`src/app/commande/paiement/page.tsx` :

```typescript
import { WizardShell } from "@/components/wizard/WizardShell";
import { PaiementStep } from "@/components/wizard/PaiementStep";

export default function Page() {
  return (
    <WizardShell currentStep="paiement">
      <PaiementStep />
    </WizardShell>
  );
}
```

`src/app/commande/confirmation/page.tsx` :

```typescript
import { WizardShell } from "@/components/wizard/WizardShell";
import { ConfirmationStep } from "@/components/wizard/ConfirmationStep";

export default function Page() {
  return (
    <WizardShell currentStep="confirmation">
      <ConfirmationStep />
    </WizardShell>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: sans erreur.

- [ ] **Step 3: Vérification manuelle du parcours complet**

```bash
npm run dev &
sleep 3
```

Dans un navigateur : partir d'une fiche produit (`/catalogue/orea-noire`), cliquer "Choisir cette monture", dérouler les 9 étapes jusqu'à confirmation, vérifier que le reste à charge affiché est bien nul pour une monture classe A et positif pour une classe B (tester les deux cas avec deux montures différentes). Vérifier aussi le garde-fou : ouvrir directement `/commande/devis` dans un nouvel onglet en navigation privée (localStorage vide) → doit rediriger vers `/catalogue`.

```bash
kill %1
```

- [ ] **Step 4: Commit**

```bash
git add src/app/commande
git commit -m "feat: routes des 9 étapes du wizard de commande"
```

---

## Self-Review (fait par l'auteur du plan avant remise)

**Couverture de la spec** : les 9 étapes complètes (Tasks 5-9, routées en Task 11) ; persistance localStorage (Task 1) ; faux OCR avec délai + valeurs factices modifiables (Task 2, Task 5) ; logique de calcul devis/reste à charge classe A/B (Task 3) ; garde-fou de redirection si état manquant (Task 4) ; aucune donnée envoyée à un serveur (toute la logique reste côté client, `"use client"` partout où `localStorage` est touché) ; point de couture avec le plan Catalogue explicitement documenté et implémenté (Task 10, modification croisée de `ProductDetail`).

**Cohérence des types** : `WizardState` et ses sous-types (`Ordonnance`, `InfosPerso`, `Mutuelle`, `TiersPayant`, `Devis`, `ResteACharge`, `Paiement`) définis une seule fois en Task 1, réutilisés à l'identique dans toutes les tâches suivantes sans redéfinition ni divergence de nom de champ.

**Incohérence de route corrigée pendant l'auto-review** : la première rédaction de ce plan réutilisait `/commande/ordonnance` à la fois comme URL d'entrée avec paramètre (`?frame=slug`, posée par le plan Catalogue) et comme première étape du wizard gérée par `WizardShell` — ces deux responsabilités entraient en conflit (la première a besoin de s'exécuter une seule fois à l'arrivée, la seconde est une étape normale du wizard revisitable). Corrigé en séparant explicitement `/commande/ordonnance/init` (Task 10, initialisation) de `/commande/ordonnance` (Task 11, vraie étape 1) — avec la modification correspondante du lien dans `ProductDetail` documentée et testée dans Task 10, Step 5.
