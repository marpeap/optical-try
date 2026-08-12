# Catalogue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire la landing (vidéo scroll-scrub), le catalogue (grille + filtres) et la fiche produit de la plateforme de vente de lunettes, avec des données codées en dur et un point d'intégration défini pour l'essayage virtuel.

**Architecture:** Next.js App Router + TypeScript, données statiques typées (`data/frames.ts`), composants isolés par responsabilité (`components/landing`, `components/catalogue`, `components/product`), pipeline vidéo canvas + GSAP ScrollTrigger identique à marpeap.com.

**Tech Stack:** Next.js (App Router), TypeScript, Vitest + @testing-library/react pour les tests, GSAP (ScrollTrigger), ffmpeg (extraction de frames vidéo), aucune librairie CSS externe (CSS Modules natifs Next.js).

## Global Constraints

- Aucune donnée réelle envoyée à un serveur — tout est statique/local (spec sous-projet 1).
- Stack Next.js + TypeScript, App Router (spec sous-projet 1).
- Catalogue = 5 à 8 montures (spec sous-projet 1).
- Filtres : forme, couleur, genre, prix (spec sous-projet 1).
- Type `Frame` inclut `modele3dUrl?: string` et `classeSante: "A" | "B"` dès sa création, pour éviter de le retoucher plus tard (specs sous-projets 1 et 3).
- Validation obligatoire avant tout commit : `npx tsc --noEmit` sans erreur.
- Vidéo landing uniquement sur la page d'accueil (pas de scroll continu sur le reste du site).

---

### Task 1: Scaffold du projet Next.js + outillage de test

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `.gitignore`
- Create: `vitest.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

**Interfaces:**
- Produces: projet Next.js exécutable (`npm run dev`), commande de test (`npm test`), commande de typecheck (`npm run typecheck`).

- [ ] **Step 1: Scaffold Next.js**

```bash
cd "/home/marpeap/Bureau/Marpeap Digitals/lunettes-optique"
npx create-next-app@latest . --typescript --eslint --app --src-dir --no-tailwind --import-alias "@/*" --use-npm
```

Répondre "Oui" si une question demande de continuer dans un dossier non vide (le dossier contient déjà `docs/`).

- [ ] **Step 2: Ajouter Vitest et Testing Library**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Créer `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

Créer aussi `vitest.setup.ts` :

```typescript
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Ajouter les scripts npm**

Modifier `package.json`, section `scripts` :

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

- [ ] **Step 5: Vérifier que tout tourne**

```bash
npm run typecheck
npm test
npm run dev &
sleep 3 && curl -sf http://localhost:3000 > /dev/null && echo "OK: serveur répond" && kill %1
```

Expected: `typecheck` sans erreur, `test` "No test files found" (normal, aucun test écrit), serveur répond 200.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js + TypeScript + Vitest"
```

---

### Task 2: Type `Frame` et données du catalogue

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/data/frames.ts`
- Test: `src/data/frames.test.ts`

**Interfaces:**
- Produces: `type Frame` (consommé par toutes les tâches suivantes de ce plan et par les plans Essayage virtuel / Parcours mockup), `frames: Frame[]` (export nommé de `src/data/frames.ts`).

- [ ] **Step 1: Écrire le type `Frame`**

`src/lib/types.ts` :

```typescript
export type Forme = "ronde" | "carrée" | "aviateur" | "papillon" | "rectangulaire";
export type Genre = "homme" | "femme" | "mixte";
export type ClasseSante = "A" | "B";

export type Frame = {
  id: string;
  slug: string;
  marque: string;
  nom: string;
  forme: Forme;
  couleur: string;
  genre: Genre;
  prix: number;
  images: string[];
  modele3dUrl?: string;
  classeSante: ClasseSante;
};
```

- [ ] **Step 2: Écrire le test de données (échoue d'abord — le fichier n'existe pas)**

`src/data/frames.test.ts` :

```typescript
import { describe, it, expect } from "vitest";
import { frames } from "./frames";

describe("frames", () => {
  it("contient entre 5 et 8 montures", () => {
    expect(frames.length).toBeGreaterThanOrEqual(5);
    expect(frames.length).toBeLessThanOrEqual(8);
  });

  it("chaque monture a un slug unique", () => {
    const slugs = frames.map((f) => f.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("chaque monture a au moins une image", () => {
    for (const frame of frames) {
      expect(frame.images.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npm test -- frames.test.ts
```

Expected: FAIL — `Cannot find module './frames'`.

- [ ] **Step 4: Créer les données**

`src/data/frames.ts` :

```typescript
import type { Frame } from "@/lib/types";

export const frames: Frame[] = [
  {
    id: "1",
    slug: "orea-noire",
    marque: "Oréa",
    nom: "Oréa Noire",
    forme: "rectangulaire",
    couleur: "noir",
    genre: "mixte",
    prix: 29,
    images: ["/images/frames/orea-noire-1.jpg"],
    classeSante: "A",
  },
  {
    id: "2",
    slug: "orea-ecaille",
    marque: "Oréa",
    nom: "Oréa Écaille",
    forme: "ronde",
    couleur: "écaille",
    genre: "femme",
    prix: 89,
    images: ["/images/frames/orea-ecaille-1.jpg"],
    classeSante: "B",
  },
  {
    id: "3",
    slug: "vireo-titane",
    marque: "Vireo",
    nom: "Vireo Titane",
    forme: "aviateur",
    couleur: "argent",
    genre: "homme",
    prix: 129,
    images: ["/images/frames/vireo-titane-1.jpg"],
    classeSante: "B",
  },
  {
    id: "4",
    slug: "vireo-corail",
    marque: "Vireo",
    nom: "Vireo Corail",
    forme: "papillon",
    couleur: "corail",
    genre: "femme",
    prix: 25,
    images: ["/images/frames/vireo-corail-1.jpg"],
    classeSante: "A",
  },
  {
    id: "5",
    slug: "brume-bleu-nuit",
    marque: "Brume",
    nom: "Brume Bleu Nuit",
    forme: "carrée",
    couleur: "bleu nuit",
    genre: "mixte",
    prix: 69,
    images: ["/images/frames/brume-bleu-nuit-1.jpg"],
    classeSante: "B",
  },
  {
    id: "6",
    slug: "brume-verte",
    marque: "Brume",
    nom: "Brume Verte",
    forme: "ronde",
    couleur: "vert",
    genre: "mixte",
    prix: 28,
    images: ["/images/frames/brume-verte-1.jpg"],
    classeSante: "A",
  },
];
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test -- frames.test.ts
npm run typecheck
```

Expected: 3 tests PASS, typecheck sans erreur.

- [ ] **Step 6: Commit**

```bash
git add src/lib/types.ts src/data/frames.ts src/data/frames.test.ts
git commit -m "feat: type Frame et données catalogue (6 montures)"
```

---

### Task 3: Fonction pure de filtrage (`filterFrames`)

**Files:**
- Create: `src/lib/filterFrames.ts`
- Test: `src/lib/filterFrames.test.ts`

**Interfaces:**
- Consumes: `Frame` (Task 2), `frames` (Task 2, utilisé dans les tests).
- Produces: `type FrameFilters = { forme?: Forme; couleur?: string; genre?: Genre; prixMax?: number }`, `function filterFrames(frames: Frame[], filters: FrameFilters): Frame[]` — consommé par Task 6 (`FilterBar`) et Task 7 (`ProductGrid`).

- [ ] **Step 1: Écrire le test (échoue — fonction inexistante)**

`src/lib/filterFrames.test.ts` :

```typescript
import { describe, it, expect } from "vitest";
import { filterFrames } from "./filterFrames";
import { frames } from "@/data/frames";

describe("filterFrames", () => {
  it("sans filtre, retourne toutes les montures", () => {
    expect(filterFrames(frames, {})).toHaveLength(frames.length);
  });

  it("filtre par forme", () => {
    const result = filterFrames(frames, { forme: "ronde" });
    expect(result.every((f) => f.forme === "ronde")).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("filtre par genre", () => {
    const result = filterFrames(frames, { genre: "homme" });
    expect(result.every((f) => f.genre === "homme")).toBe(true);
  });

  it("filtre par prix maximum", () => {
    const result = filterFrames(frames, { prixMax: 30 });
    expect(result.every((f) => f.prix <= 30)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("combine plusieurs filtres", () => {
    const result = filterFrames(frames, { genre: "mixte", prixMax: 30 });
    expect(result.every((f) => f.genre === "mixte" && f.prix <= 30)).toBe(true);
  });

  it("retourne un tableau vide si aucune monture ne correspond", () => {
    const result = filterFrames(frames, { couleur: "violet fluo" });
    expect(result).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- filterFrames.test.ts
```

Expected: FAIL — `Cannot find module './filterFrames'`.

- [ ] **Step 3: Implémenter**

`src/lib/filterFrames.ts` :

```typescript
import type { Frame, Forme, Genre } from "./types";

export type FrameFilters = {
  forme?: Forme;
  couleur?: string;
  genre?: Genre;
  prixMax?: number;
};

export function filterFrames(frames: Frame[], filters: FrameFilters): Frame[] {
  return frames.filter((frame) => {
    if (filters.forme && frame.forme !== filters.forme) return false;
    if (filters.couleur && frame.couleur !== filters.couleur) return false;
    if (filters.genre && frame.genre !== filters.genre) return false;
    if (filters.prixMax !== undefined && frame.prix > filters.prixMax) return false;
    return true;
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- filterFrames.test.ts
```

Expected: 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/filterFrames.ts src/lib/filterFrames.test.ts
git commit -m "feat: fonction pure filterFrames avec tests"
```

---

### Task 4: Composant `ProductCard`

**Files:**
- Create: `src/components/catalogue/ProductCard.tsx`
- Test: `src/components/catalogue/ProductCard.test.tsx`

**Interfaces:**
- Consumes: `Frame` (Task 2).
- Produces: `function ProductCard({ frame }: { frame: Frame }): JSX.Element` — consommé par Task 7 (`ProductGrid`).

- [ ] **Step 1: Écrire le test (échoue — composant inexistant)**

`src/components/catalogue/ProductCard.test.tsx` :

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "./ProductCard";
import { frames } from "@/data/frames";

describe("ProductCard", () => {
  const frame = frames[0];

  it("affiche le nom et le prix de la monture", () => {
    render(<ProductCard frame={frame} />);
    expect(screen.getByText(frame.nom)).toBeInTheDocument();
    expect(screen.getByText(`${frame.prix} €`)).toBeInTheDocument();
  });

  it("le lien pointe vers la fiche produit correspondante", () => {
    render(<ProductCard frame={frame} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", `/catalogue/${frame.slug}`);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- ProductCard.test.tsx
```

Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter**

`src/components/catalogue/ProductCard.tsx` :

```typescript
import Link from "next/link";
import Image from "next/image";
import type { Frame } from "@/lib/types";
import styles from "./ProductCard.module.css";

export function ProductCard({ frame }: { frame: Frame }) {
  return (
    <Link href={`/catalogue/${frame.slug}`} className={styles.card}>
      <Image
        src={frame.images[0]}
        alt={frame.nom}
        width={320}
        height={200}
        className={styles.image}
      />
      <div className={styles.info}>
        <p className={styles.marque}>{frame.marque}</p>
        <h3 className={styles.nom}>{frame.nom}</h3>
        <p className={styles.prix}>{frame.prix} €</p>
      </div>
    </Link>
  );
}
```

`src/components/catalogue/ProductCard.module.css` :

```css
.card {
  display: block;
  text-decoration: none;
  color: inherit;
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface, #fff);
}

.image {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.info {
  padding: 12px 16px;
}

.marque {
  font-size: 0.75rem;
  text-transform: uppercase;
  opacity: 0.6;
  margin: 0;
}

.nom {
  font-size: 1rem;
  margin: 4px 0;
}

.prix {
  font-weight: 600;
  margin: 0;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- ProductCard.test.tsx
```

Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/catalogue/ProductCard.tsx src/components/catalogue/ProductCard.module.css src/components/catalogue/ProductCard.test.tsx
git commit -m "feat: composant ProductCard"
```

---

### Task 5: Composant `FilterBar`

**Files:**
- Create: `src/components/catalogue/FilterBar.tsx`
- Test: `src/components/catalogue/FilterBar.test.tsx`

**Interfaces:**
- Consumes: `FrameFilters` (Task 3).
- Produces: `function FilterBar({ filters, onChange }: { filters: FrameFilters; onChange: (filters: FrameFilters) => void }): JSX.Element` — consommé par Task 7 (`ProductGrid`).

- [ ] **Step 1: Écrire le test**

`src/components/catalogue/FilterBar.test.tsx` :

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterBar } from "./FilterBar";

describe("FilterBar", () => {
  it("appelle onChange avec le nouveau genre sélectionné", () => {
    const onChange = vi.fn();
    render(<FilterBar filters={{}} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Genre"), {
      target: { value: "homme" },
    });

    expect(onChange).toHaveBeenCalledWith({ genre: "homme" });
  });

  it("appelle onChange avec prixMax en nombre", () => {
    const onChange = vi.fn();
    render(<FilterBar filters={{}} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Prix maximum"), {
      target: { value: "50" },
    });

    expect(onChange).toHaveBeenCalledWith({ prixMax: 50 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- FilterBar.test.tsx
```

Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter**

`src/components/catalogue/FilterBar.tsx` :

```typescript
import type { FrameFilters } from "@/lib/filterFrames";
import type { Forme, Genre } from "@/lib/types";
import styles from "./FilterBar.module.css";

const FORMES: Forme[] = ["ronde", "carrée", "aviateur", "papillon", "rectangulaire"];
const GENRES: Genre[] = ["homme", "femme", "mixte"];

export function FilterBar({
  filters,
  onChange,
}: {
  filters: FrameFilters;
  onChange: (filters: FrameFilters) => void;
}) {
  return (
    <form className={styles.bar}>
      <label htmlFor="filter-forme">Forme</label>
      <select
        id="filter-forme"
        aria-label="Forme"
        value={filters.forme ?? ""}
        onChange={(e) =>
          onChange({ ...filters, forme: (e.target.value || undefined) as Forme | undefined })
        }
      >
        <option value="">Toutes</option>
        {FORMES.map((forme) => (
          <option key={forme} value={forme}>
            {forme}
          </option>
        ))}
      </select>

      <label htmlFor="filter-genre">Genre</label>
      <select
        id="filter-genre"
        aria-label="Genre"
        value={filters.genre ?? ""}
        onChange={(e) =>
          onChange({ ...filters, genre: (e.target.value || undefined) as Genre | undefined })
        }
      >
        <option value="">Tous</option>
        {GENRES.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>

      <label htmlFor="filter-prix">Prix maximum</label>
      <input
        id="filter-prix"
        aria-label="Prix maximum"
        type="number"
        min={0}
        value={filters.prixMax ?? ""}
        onChange={(e) =>
          onChange({
            ...filters,
            prixMax: e.target.value ? Number(e.target.value) : undefined,
          })
        }
      />
    </form>
  );
}
```

`src/components/catalogue/FilterBar.module.css` :

```css
.bar {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 24px;
}

.bar label {
  font-size: 0.85rem;
  margin-right: 4px;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- FilterBar.test.tsx
```

Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/catalogue/FilterBar.tsx src/components/catalogue/FilterBar.module.css src/components/catalogue/FilterBar.test.tsx
git commit -m "feat: composant FilterBar"
```

---

### Task 6: Composant `ProductGrid` et page catalogue

**Files:**
- Create: `src/components/catalogue/ProductGrid.tsx`
- Test: `src/components/catalogue/ProductGrid.test.tsx`
- Create: `src/app/catalogue/page.tsx`

**Interfaces:**
- Consumes: `filterFrames`/`FrameFilters` (Task 3), `ProductCard` (Task 4), `FilterBar` (Task 5), `frames` (Task 2).
- Produces: `function ProductGrid({ frames }: { frames: Frame[] }): JSX.Element`, route `/catalogue`.

- [ ] **Step 1: Écrire le test**

`src/components/catalogue/ProductGrid.test.tsx` :

```typescript
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductGrid } from "./ProductGrid";
import { frames } from "@/data/frames";

describe("ProductGrid", () => {
  it("affiche toutes les montures par défaut", () => {
    render(<ProductGrid frames={frames} />);
    for (const frame of frames) {
      expect(screen.getByText(frame.nom)).toBeInTheDocument();
    }
  });

  it("filtre la grille quand on change le genre", () => {
    render(<ProductGrid frames={frames} />);
    fireEvent.change(screen.getByLabelText("Genre"), {
      target: { value: "homme" },
    });

    const hommeFrames = frames.filter((f) => f.genre === "homme");
    const autresFrames = frames.filter((f) => f.genre !== "homme");

    for (const frame of hommeFrames) {
      expect(screen.getByText(frame.nom)).toBeInTheDocument();
    }
    for (const frame of autresFrames) {
      expect(screen.queryByText(frame.nom)).not.toBeInTheDocument();
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- ProductGrid.test.tsx
```

Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter**

`src/components/catalogue/ProductGrid.tsx` :

```typescript
"use client";

import { useState } from "react";
import type { Frame } from "@/lib/types";
import { filterFrames, type FrameFilters } from "@/lib/filterFrames";
import { FilterBar } from "./FilterBar";
import { ProductCard } from "./ProductCard";
import styles from "./ProductGrid.module.css";

export function ProductGrid({ frames }: { frames: Frame[] }) {
  const [filters, setFilters] = useState<FrameFilters>({});
  const visibleFrames = filterFrames(frames, filters);

  return (
    <div>
      <FilterBar filters={filters} onChange={setFilters} />
      <div className={styles.grid}>
        {visibleFrames.map((frame) => (
          <ProductCard key={frame.id} frame={frame} />
        ))}
      </div>
    </div>
  );
}
```

`src/components/catalogue/ProductGrid.module.css` :

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}
```

`src/app/catalogue/page.tsx` :

```typescript
import { frames } from "@/data/frames";
import { ProductGrid } from "@/components/catalogue/ProductGrid";

export default function CataloguePage() {
  return (
    <main style={{ padding: "48px 24px" }}>
      <h1>Notre catalogue</h1>
      <ProductGrid frames={frames} />
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- ProductGrid.test.tsx
npm run typecheck
```

Expected: 2 tests PASS, typecheck sans erreur.

- [ ] **Step 5: Commit**

```bash
git add src/components/catalogue/ProductGrid.tsx src/components/catalogue/ProductGrid.module.css src/components/catalogue/ProductGrid.test.tsx src/app/catalogue/page.tsx
git commit -m "feat: ProductGrid et page catalogue"
```

---

### Task 7: Composant `TryOnTrigger`

**Files:**
- Create: `src/components/product/TryOnTrigger.tsx`
- Test: `src/components/product/TryOnTrigger.test.tsx`

**Interfaces:**
- Consumes: `Frame` (Task 2).
- Produces: `function TryOnTrigger({ frame, onOpen }: { frame: Frame; onOpen: () => void }): JSX.Element`. Le plan Essayage virtuel montera `TryOnOverlay` via la fonction `onOpen` fournie par le consommateur (ProductDetail, Task 8) — ce composant ne connaît pas `TryOnOverlay`, il expose seulement l'état désactivé/activé.

- [ ] **Step 1: Écrire le test**

`src/components/product/TryOnTrigger.test.tsx` :

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TryOnTrigger } from "./TryOnTrigger";
import { frames } from "@/data/frames";

describe("TryOnTrigger", () => {
  it("est cliquable et déclenche onOpen si modele3dUrl est défini", () => {
    const onOpen = vi.fn();
    const frame = { ...frames[0], modele3dUrl: "/models/frames/test.glb" };
    render(<TryOnTrigger frame={frame} onOpen={onOpen} />);

    fireEvent.click(screen.getByRole("button"));
    expect(onOpen).toHaveBeenCalled();
  });

  it("est désactivé et affiche un message si modele3dUrl est absent", () => {
    const onOpen = vi.fn();
    const frame = { ...frames[0], modele3dUrl: undefined };
    render(<TryOnTrigger frame={frame} onOpen={onOpen} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByText(/bientôt disponible/i)).toBeInTheDocument();

    fireEvent.click(button);
    expect(onOpen).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- TryOnTrigger.test.tsx
```

Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter**

`src/components/product/TryOnTrigger.tsx` :

```typescript
import type { Frame } from "@/lib/types";

export function TryOnTrigger({
  frame,
  onOpen,
}: {
  frame: Frame;
  onOpen: () => void;
}) {
  const disponible = Boolean(frame.modele3dUrl);

  return (
    <div>
      <button type="button" disabled={!disponible} onClick={onOpen}>
        Essayer virtuellement
      </button>
      {!disponible && <p>Essayage bientôt disponible pour cette monture</p>}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- TryOnTrigger.test.tsx
```

Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/product/TryOnTrigger.tsx src/components/product/TryOnTrigger.test.tsx
git commit -m "feat: composant TryOnTrigger avec état désactivé"
```

---

### Task 8: Composant `ProductDetail` et page fiche produit

**Files:**
- Create: `src/components/product/ProductDetail.tsx`
- Test: `src/components/product/ProductDetail.test.tsx`
- Create: `src/app/catalogue/[slug]/page.tsx`
- Create: `src/app/catalogue/[slug]/not-found.tsx`

**Interfaces:**
- Consumes: `Frame` (Task 2), `TryOnTrigger` (Task 7), `frames` (Task 2).
- Produces: route `/catalogue/[slug]`. `ProductDetail` monte un état local `tryOnOpen` géré via `TryOnTrigger.onOpen` — c'est le point où le plan Essayage virtuel viendra brancher `TryOnOverlay` (import ajouté dans ce composant par ce plan-là, pas par celui-ci). Un bouton "Choisir cette monture" est présent avec un `href` statique vers `/commande/ordonnance?frame={slug}` — le plan Parcours mockup est responsable de créer cette route et de lire le paramètre.

- [ ] **Step 1: Écrire le test**

`src/components/product/ProductDetail.test.tsx` :

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductDetail } from "./ProductDetail";
import { frames } from "@/data/frames";

describe("ProductDetail", () => {
  const frame = frames[0];

  it("affiche le nom, la marque et le prix", () => {
    render(<ProductDetail frame={frame} />);
    expect(screen.getByText(frame.nom)).toBeInTheDocument();
    expect(screen.getByText(frame.marque)).toBeInTheDocument();
    expect(screen.getByText(`${frame.prix} €`)).toBeInTheDocument();
  });

  it("affiche le bouton Choisir cette monture avec le bon lien", () => {
    render(<ProductDetail frame={frame} />);
    const link = screen.getByRole("link", { name: /choisir cette monture/i });
    expect(link).toHaveAttribute("href", `/commande/ordonnance?frame=${frame.slug}`);
  });

  it("affiche le TryOnTrigger", () => {
    render(<ProductDetail frame={frame} />);
    expect(screen.getByRole("button", { name: /essayer virtuellement/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- ProductDetail.test.tsx
```

Expected: FAIL — module introuvable.

- [ ] **Step 3: Implémenter**

`src/components/product/ProductDetail.tsx` :

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Frame } from "@/lib/types";
import { TryOnTrigger } from "./TryOnTrigger";

export function ProductDetail({ frame }: { frame: Frame }) {
  const [tryOnOpen, setTryOnOpen] = useState(false);

  return (
    <article>
      <Image src={frame.images[0]} alt={frame.nom} width={480} height={320} />
      <p>{frame.marque}</p>
      <h1>{frame.nom}</h1>
      <p>{frame.prix} €</p>
      <p>Forme : {frame.forme}</p>
      <p>Couleur : {frame.couleur}</p>

      <TryOnTrigger frame={frame} onOpen={() => setTryOnOpen(true)} />
      {/* TryOnOverlay sera monté ici quand tryOnOpen est vrai — branché par le plan "Essayage virtuel" */}

      <Link href={`/commande/ordonnance?frame=${frame.slug}`}>Choisir cette monture</Link>
    </article>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- ProductDetail.test.tsx
```

Expected: 3 tests PASS. Note : `tryOnOpen` est déclaré mais pas encore utilisé pour du rendu conditionnel (`TryOnOverlay` n'existe pas dans ce plan) — TypeScript/ESLint peuvent signaler la variable comme non lue selon la config ; si `npm run typecheck` échoue sur ce point, préfixer temporairement par `void tryOnOpen;` en début de fonction jusqu'à ce que le plan Essayage virtuel utilise réellement l'état.

- [ ] **Step 5: Créer la page et gérer le cas 404**

`src/app/catalogue/[slug]/page.tsx` :

```typescript
import { notFound } from "next/navigation";
import { frames } from "@/data/frames";
import { ProductDetail } from "@/components/product/ProductDetail";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const frame = frames.find((f) => f.slug === slug);

  if (!frame) {
    notFound();
  }

  return (
    <main style={{ padding: "48px 24px" }}>
      <ProductDetail frame={frame} />
    </main>
  );
}
```

`src/app/catalogue/[slug]/not-found.tsx` :

```typescript
import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ padding: "48px 24px" }}>
      <h1>Monture introuvable</h1>
      <Link href="/catalogue">Retour au catalogue</Link>
    </main>
  );
}
```

- [ ] **Step 6: Run typecheck et vérification manuelle**

```bash
npm run typecheck
npm run dev &
sleep 3
curl -sf "http://localhost:3000/catalogue/${?}" # remplacer par un slug réel, ex: orea-noire
curl -s "http://localhost:3000/catalogue/slug-inexistant" | grep -q "introuvable" && echo "OK: 404 gérée"
kill %1
```

- [ ] **Step 7: Commit**

```bash
git add src/components/product/ProductDetail.tsx src/components/product/ProductDetail.test.tsx src/app/catalogue/\[slug\]/page.tsx src/app/catalogue/\[slug\]/not-found.tsx
git commit -m "feat: ProductDetail et page fiche produit avec gestion 404"
```

---

### Task 9: Pipeline d'assets vidéo (frame sequence)

**Files:**
- Create: `scripts/generate-video-frames.sh`
- Create: `public/video-frames/.gitkeep`
- Modify: `.gitignore` (exclure `public/video-frames/desktop/*.jpg` et `public/video-frames/mobile/*.jpg`, garder le `.gitkeep`)

**Interfaces:**
- Produces: séquences d'images `public/video-frames/desktop/frame-XXXX.jpg` (360 frames) et `public/video-frames/mobile/frame-XXXX.jpg` (240 frames), consommées par Task 10 (`ScrollVideo`).

- [ ] **Step 1: Écrire le script de génération**

`scripts/generate-video-frames.sh` :

```bash
#!/bin/bash
set -euo pipefail

# Séquence de clips Mixkit (licence gratuite, sans watermark) — cf. spec sous-projet 1
CLIPS=(
  "https://mixkit.co/free-stock-video/the-camera-slowly-slides-into-the-tranquil-forest-on-a-50847/"
  "https://mixkit.co/free-stock-video/lush-waterfall-cascading-over-rocks-in-a-forest-setting-100195/"
  "https://mixkit.co/free-stock-video/sunset-behind-the-skyline-on-the-beach-over-the-sea-51445/"
  "https://mixkit.co/free-stock-video/trying-on-glasses-22130/"
)

RAW_DIR="scripts/.raw-clips"
DESKTOP_DIR="public/video-frames/desktop"
MOBILE_DIR="public/video-frames/mobile"

mkdir -p "$RAW_DIR" "$DESKTOP_DIR" "$MOBILE_DIR"

echo "ATTENTION : ce script suppose que les 4 fichiers MP4 sources ont déjà été"
echo "téléchargés manuellement depuis les pages Mixkit ci-dessus (le téléchargement"
echo "direct nécessite de passer par le bouton de la page, pas une URL stable) et"
echo "placés dans $RAW_DIR sous les noms clip-1.mp4, clip-2.mp4, clip-3.mp4, clip-4.mp4."

for i in 1 2 3 4; do
  if [ ! -f "$RAW_DIR/clip-$i.mp4" ]; then
    echo "ERREUR: $RAW_DIR/clip-$i.mp4 manquant. Télécharge-le manuellement depuis Mixkit d'abord."
    exit 1
  fi
done

# Concatène les 4 clips en une seule séquence source
CONCAT_LIST="$RAW_DIR/concat-list.txt"
> "$CONCAT_LIST"
for i in 1 2 3 4; do
  echo "file 'clip-$i.mp4'" >> "$CONCAT_LIST"
done

ffmpeg -y -f concat -safe 0 -i "$CONCAT_LIST" -c copy "$RAW_DIR/full-sequence.mp4"

# 360 frames desktop, redimensionné en 1920px de large
ffmpeg -y -i "$RAW_DIR/full-sequence.mp4" -vf "scale=1920:-1" -vframes 360 \
  "$DESKTOP_DIR/frame-%04d.jpg"

# 240 frames mobile, redimensionné en 960px de large
ffmpeg -y -i "$RAW_DIR/full-sequence.mp4" -vf "scale=960:-1" -vframes 240 \
  "$MOBILE_DIR/frame-%04d.jpg"

echo "OK: $(ls "$DESKTOP_DIR" | wc -l) frames desktop, $(ls "$MOBILE_DIR" | wc -l) frames mobile."
```

```bash
chmod +x scripts/generate-video-frames.sh
```

- [ ] **Step 2: Documenter le prérequis ffmpeg**

Vérifier que ffmpeg est installé :

```bash
ffmpeg -version | head -1
```

Expected: affiche une version ffmpeg. Si absent : `sudo apt install ffmpeg` (Pop!_OS/Debian).

- [ ] **Step 3: Exclure les frames générées du suivi git**

Ajouter à `.gitignore` :

```
public/video-frames/desktop/*.jpg
public/video-frames/mobile/*.jpg
```

Créer `public/video-frames/.gitkeep` (fichier vide) pour que le dossier existe dans le repo même sans frames commitées.

- [ ] **Step 4: Télécharger manuellement les 4 clips et exécuter le script**

Étape manuelle (non automatisable — Mixkit ne fournit pas d'URL de téléchargement direct stable) : ouvrir chacune des 4 pages listées dans le script, cliquer sur "Free Download", enregistrer sous `scripts/.raw-clips/clip-1.mp4` à `clip-4.mp4` dans l'ordre indiqué. Puis :

```bash
./scripts/generate-video-frames.sh
```

Expected: "OK: 360 frames desktop, 240 frames mobile."

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-video-frames.sh public/video-frames/.gitkeep .gitignore
git commit -m "feat: script de génération de la frame sequence vidéo landing"
```

Note : les fichiers `scripts/.raw-clips/*.mp4` et les JPEG générés ne sont jamais commités (poids trop important pour git) — chaque environnement de dev doit exécuter le script une fois après clonage.

---

### Task 10: Composant `ScrollVideo`

**Files:**
- Create: `src/components/landing/ScrollVideo.tsx`
- Create: `src/components/landing/ScrollVideo.module.css`

**Interfaces:**
- Consumes: séquences d'images produites par Task 9 (`public/video-frames/desktop/*.jpg`, `public/video-frames/mobile/*.jpg`).
- Produces: `function ScrollVideo(): JSX.Element` — consommé par Task 11 (page landing).

Ce composant dépend du rendu canvas + de la position de scroll réelle du navigateur : il n'est pas raisonnablement testable en unitaire (jsdom ne simule pas de vrai rendu canvas animé par scroll). Validation = vérification manuelle uniquement, comme prévu dans la spec du sous-projet 1.

- [ ] **Step 1: Installer GSAP**

```bash
npm install gsap
```

- [ ] **Step 2: Implémenter le composant**

`src/components/landing/ScrollVideo.tsx` :

```typescript
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ScrollVideo.module.css";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_FRAME_COUNT = 360;
const MOBILE_FRAME_COUNT = 240;
const MOBILE_BREAKPOINT = 768;

function frameUrl(isMobile: boolean, index: number): string {
  const dir = isMobile ? "mobile" : "desktop";
  const padded = String(index + 1).padStart(4, "0");
  return `/video-frames/${dir}/frame-${padded}.jpg`;
}

export function ScrollVideo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const frameCount = isMobile ? MOBILE_FRAME_COUNT : DESKTOP_FRAME_COUNT;
    const images: HTMLImageElement[] = [];

    let loadedCount = 0;
    for (let i = 0; i < frameCount; i++) {
      const img = new window.Image();
      img.src = frameUrl(isMobile, i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === 1) drawFrame(0);
      };
      images.push(img);
    }

    function resizeCanvas() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function drawFrame(index: number) {
      const img = images[Math.min(index, images.length - 1)];
      if (!img || !img.complete || !ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const state = { frame: 0 };
    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        state.frame = Math.round(self.progress * (frameCount - 1));
        drawFrame(state.frame);
      },
    });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      trigger.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.scrollContainer}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
```

`src/components/landing/ScrollVideo.module.css` :

```css
.scrollContainer {
  position: relative;
  height: 400vh;
}

.canvas {
  position: sticky;
  top: 0;
  width: 100vw;
  height: 100vh;
  display: block;
}
```

- [ ] **Step 3: Vérification manuelle**

```bash
npm run dev &
sleep 3
```

Ouvrir `http://localhost:3000` dans un navigateur, scroller sur la page d'accueil (une fois branché dans Task 11), vérifier que l'image change progressivement avec le scroll, sans saccade majeure. Tester aussi en réduisant la fenêtre à une largeur mobile (<768px) pour vérifier le chargement de la séquence mobile.

```bash
kill %1
```

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/ScrollVideo.tsx src/components/landing/ScrollVideo.module.css package.json package-lock.json
git commit -m "feat: composant ScrollVideo (canvas + GSAP ScrollTrigger)"
```

---

### Task 11: Page landing complète

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/page.module.css`

**Interfaces:**
- Consumes: `ScrollVideo` (Task 10).
- Produces: page d'accueil complète et navigable vers `/catalogue`.

- [ ] **Step 1: Implémenter la landing**

`src/app/page.tsx` :

```typescript
import Link from "next/link";
import { ScrollVideo } from "@/components/landing/ScrollVideo";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main>
      <ScrollVideo />
      <section className={styles.hero}>
        <h1>Des lunettes qui vous ressemblent</h1>
        <p>Essayez-les virtuellement, en haute qualité, avant de commander.</p>
        <Link href="/catalogue" className={styles.cta}>
          Découvrir le catalogue
        </Link>
      </section>
    </main>
  );
}
```

`src/app/page.module.css` :

```css
.hero {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 16px;
  padding: 48px 24px;
}

.cta {
  padding: 12px 28px;
  border-radius: 999px;
  background: #111;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
}
```

- [ ] **Step 2: Vérification manuelle et typecheck**

```bash
npm run typecheck
npm run dev &
sleep 3
curl -sf http://localhost:3000 | grep -q "Découvrir le catalogue" && echo "OK: landing rendue"
kill %1
```

Vérifier manuellement dans le navigateur : scroll de la vidéo de fond, lisibilité du texte par-dessus, clic sur le CTA mène bien à `/catalogue`.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx src/app/page.module.css
git commit -m "feat: page landing avec vidéo scroll-scrub et CTA catalogue"
```

---

## Self-Review (fait par l'auteur du plan avant remise)

**Couverture de la spec** : structure Next.js+TS (Task 1) ; type `Frame` avec `modele3dUrl`/`classeSante` (Task 2) ; données 5-8 montures (Task 2) ; filtres forme/couleur/genre/prix (Task 3, 5) ; multi-pages landing/catalogue/fiche produit (Tasks 6, 8, 11) ; point d'entrée essayage overlay (Task 7, 8) ; pipeline vidéo scroll-scrub + séquence Mixkit retenue (Tasks 9, 10, 11) ; gestion d'erreur `modele3dUrl` absent (Task 7) et slug introuvable (Task 8). Tout couvert.

**Cohérence des types** : `Frame` (Task 2) réutilisé à l'identique dans `filterFrames` (Task 3), `ProductCard`/`FilterBar`/`ProductGrid` (Tasks 4-6), `TryOnTrigger`/`ProductDetail` (Tasks 7-8). `FrameFilters` défini une fois (Task 3) et réutilisé (Tasks 5-6). Pas de divergence de nommage détectée.

**Point de couture avec le plan Essayage virtuel** : `ProductDetail` (Task 8) déclare l'état `tryOnOpen` mais ne monte pas encore `TryOnOverlay` — c'est intentionnel, ce composant appartient au plan Essayage virtuel qui devra modifier `src/components/product/ProductDetail.tsx` pour y importer et monter `TryOnOverlay` conditionnellement. Ce point de reprise est documenté explicitement dans Task 8.

**Point de couture avec le plan Parcours mockup** : le lien "Choisir cette monture" (Task 8) pointe vers `/commande/ordonnance?frame={slug}`, route qui n'existe pas dans ce plan — elle sera créée par le plan Parcours mockup. Documenté explicitement dans Task 8.
