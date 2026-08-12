# Design — Sous-projet 1 : Catalogue

**Statut** : approuvé
**Date** : 12 août 2026
**Contexte** : premier des 3 sous-projets du MVP « Plateforme de vente de lunettes & parcours optique » (voir cadrage `temporaires/Projet — Plateforme de vente de lunettes & parcours optique.md` et recherche complète `[[02-Projets-Marpeap/Lunettes-Optique]]` dans le vault Obsidian). MVP = Catalogue + Essayage virtuel (réel, haute qualité 3D) + reste du parcours en mockup interactif sans backend.

## Périmètre

Ce sous-projet couvre uniquement la partie « vitrine » : landing, navigation catalogue, fiche produit, et le point d'entrée vers l'essayage virtuel (dont l'implémentation réelle est le sous-projet 2). Il ne couvre pas le parcours ordonnance/devis/paiement (sous-projet 3).

## Décisions

- **Stack** : Next.js + TypeScript, App Router. Choix motivé par la cohérence avec les autres projets Marpeap (app.marpeap.com, rdv.marpeap.com, notes.marpeap.com) : validation `tsc --noEmit`, déploiement Vercel familier, et l'App Router permet de garder une structure statique aujourd'hui tout en pouvant brancher un vrai backend plus tard sans réécriture complète des pages.
- **Données** : codées en dur (pas de couche d'abstraction « fausse API »). Choix simple et rapide assumé pour ce MVP ; à refactorer si/quand un vrai backend arrive.
- **Taille du catalogue** : 5 à 8 montures de démonstration. Volume minimal pour valider le parcours et l'essayage virtuel sans multiplier le travail d'acquisition d'assets 3D par monture (chaque monture avec essayage virtuel demande un modèle 3D dédié, cf. section 23-24 de la recherche vault).
- **Filtres catalogue** : simples — forme, couleur, genre, prix.
- **Structure du site** : multi-pages. La vidéo scroll-scrubbée (GSAP) n'apparaît que sur la landing, en teaser/intro. Le catalogue est une page classique (grille + filtres), la fiche produit une page dédiée. Choisi plutôt qu'un scroll continu type marpeap.com/services pour rester proche d'un vrai e-commerce, plus simple à naviguer et à faire évoluer vers un vrai backend.
- **Essayage virtuel — point d'entrée** : bouton « Essayer virtuellement » sur la fiche produit, ouverture en **overlay plein écran** (pas de changement d'URL, webcam s'active dans l'overlay, fermeture retourne à la fiche produit). Standard du secteur (Afflelou, EasyLunettes fonctionnent ainsi). L'implémentation réelle de l'essayage est hors périmètre de ce sous-projet — seul le déclencheur (`TryOnTrigger`) et l'interface qu'il expose au composant du sous-projet 2 sont définis ici.

## Vidéo de fond landing (scroll-scrub GSAP)

Même pipeline technique que marpeap.com et Le Nettoyeur : frame sequence pré-rendue à partir de clips vidéo sources, canvas HTML + GSAP ScrollTrigger, séquences desktop et mobile générées séparément.

Séquence de clips retenue (licence Mixkit, gratuite, sans watermark) :
1. [The camera slowly slides into the tranquil forest](https://mixkit.co/free-stock-video/the-camera-slowly-slides-into-the-tranquil-forest-on-a-50847/) — ouverture, vert profond, lumière filtrée
2. [Lush waterfall cascading over rocks](https://mixkit.co/free-stock-video/lush-waterfall-cascading-over-rocks-in-a-forest-setting-100195/) — mouvement, fraîcheur
3. [Sunset behind the skyline on the beach](https://mixkit.co/free-stock-video/sunset-behind-the-skyline-on-the-beach-over-the-sea-51445/) — bascule vers teintes chaudes/ambrées
4. [Trying on glasses](https://mixkit.co/free-stock-video/trying-on-glasses-22130/) — transition finale vers le produit, sans dérive vers l'esthétique « écran/tech froide » déjà écartée sur marpeap.com (S126, replacement du hero pour un thème plus chaleureux)

## Architecture

```
src/
  app/
    page.tsx                   → Landing (hero vidéo scroll-scrub, teaser, CTA "Découvrir")
    catalogue/page.tsx         → Grille produits + filtres
    catalogue/[slug]/page.tsx  → Fiche produit + CTA "Essayer virtuellement" (overlay)
    layout.tsx, globals.css
  components/
    landing/ScrollVideo.tsx    → Canvas + GSAP ScrollTrigger, frame sequence
    catalogue/ProductGrid.tsx, FilterBar.tsx, ProductCard.tsx
    product/ProductDetail.tsx, TryOnTrigger.tsx
  data/
    frames.ts                  → 5-8 montures hardcodées, typées
  lib/
    types.ts                   → type Frame
```

## Modèle de données

```ts
type Frame = {
  id: string;
  slug: string;
  marque: string;
  nom: string;
  forme: "ronde" | "carrée" | "aviateur" | "papillon" | "rectangulaire";
  couleur: string;
  genre: "homme" | "femme" | "mixte";
  prix: number;
  images: string[];
  modele3dUrl?: string; // branché par le sous-projet 2, optionnel pour l'instant
};
```

Le champ `modele3dUrl` est prévu dès maintenant (optionnel) pour éviter de retoucher le type quand le sous-projet 2 branchera les assets 3D.

## Composants et flux

- `ProductGrid` consomme `data/frames.ts`, filtré par `FilterBar` (forme/couleur/genre/prix), affiche des `ProductCard`.
- `ProductCard` → lien vers `catalogue/[slug]`.
- `ProductDetail` affiche les infos de la `Frame` + `TryOnTrigger`.
- `TryOnTrigger` : composant bouton qui ouvre l'overlay d'essayage. Interface attendue côté sous-projet 2 : reçoit une `Frame` (avec `modele3dUrl`), affiche l'overlay, expose une fonction de fermeture. Le contrat exact (props) sera précisé dans la spec du sous-projet 2, mais l'existence de ce point d'intégration est actée ici.

## Gestion d'erreur

Périmètre mockup à données statiques : pas de cas d'erreur réseau/serveur à gérer. Seul cas à couvrir : `modele3dUrl` absent → `TryOnTrigger` doit dégrader proprement (ex: bouton désactivé ou message « essayage bientôt disponible ») plutôt que de planter, en attendant que le sous-projet 2 fournisse les assets.

## Tests / validation

Pas de logique métier complexe (données statiques, pas de calculs). Validation = `tsc --noEmit` systématique avant tout commit + vérification visuelle manuelle du parcours (landing → catalogue → fiche produit → déclenchement overlay) sur desktop et mobile, conformément aux instructions générales du projet. Pas de suite de tests automatisés jugée nécessaire à ce stade mockup.
