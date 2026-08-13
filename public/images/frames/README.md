# Photos produit

Déposez les fichiers ici, puis renseignez leur chemin dans `photos` de la
monture correspondante dans `src/data/frames.ts`.

Tant que `photos` est vide, l'interface affiche un panneau teinté portant le
nom du modèle. Rien ne casse : les visuels apparaissent au fur et à mesure.

## Nommage attendu

Un fichier par vue, préfixé par le slug de la monture :

```
rayban-wayfarer-havane.jpg        vue principale
rayban-wayfarer-havane-2.jpg      vue secondaire (profil, détail branche…)
rayban-wayfarer-havane-3.jpg
```

Slugs des sept montures :

| Slug | Monture |
|---|---|
| `rayban-wayfarer-havane` | Ray-Ban Original Wayfarer, havane |
| `rayban-clubmaster` | Ray-Ban Clubmaster, noir et or |
| `rayban-round` | Ray-Ban Round Metal, or |
| `rayban-aviator` | Ray-Ban Aviator, or |
| `persol-649-havane` | Persol 649, havane |
| `mykita-doug` | Mykita Doug, noir mat |
| `gucci-havane-verte` | Gucci, havane vert |

## Format

- **Ratio** : 4/3 pour la vue principale (la fiche produit recadre en 4/5,
  prévoir de la marge en haut et en bas), carré pour les vues secondaires.
- **Largeur** : 1600 px minimum. Next.js génère les tailles inférieures.
- **Format de fichier** : JPG pour une photo sur fond réel, PNG si le produit
  est détouré sur fond transparent (le fond prend alors la teinte de la
  monture, ce qui reste cohérent).
- **Poids** : viser moins de 400 Ko par image après compression.

## Une fois les fichiers déposés

Dans `src/data/frames.ts`, remplacer :

```ts
photos: [],
```

par :

```ts
photos: [
  "/images/frames/rayban-wayfarer-havane.jpg",
  "/images/frames/rayban-wayfarer-havane-2.jpg",
],
```

## Droits

Ces montures sont des produits de marques déposées. Utiliser uniquement des
visuels dont l'usage est autorisé : catalogue fournisseur avec accord de
distribution, photographies réalisées par vos soins, ou banque d'images sous
licence commerciale. Ne pas reprendre les photos des sites des marques.
