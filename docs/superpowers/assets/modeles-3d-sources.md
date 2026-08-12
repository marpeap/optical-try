# Sources des modèles 3D — catalogue démo

## Statut actuel : placeholders générés (pas de vrais assets Sketchfab)

**Blocage rencontré** : Sketchfab exige un compte connecté (avec validation email) pour télécharger même les modèles CC0 — aucune URL directe exploitable comme pour les vidéos Mixkit. Aucun accès navigateur/compte disponible pour automatiser cette étape.

**Solution temporaire retenue** : génération procédurale via `scripts/generate-placeholder-frames.py` (trimesh + manifold3d, dans un venv Python dédié `scripts/.venv-3d/`). Formes géométriques simples (deux anneaux + pont + branches), une couleur par monture cohérente avec `src/data/frames.ts`, export direct en `.glb`.

| Fichier | Slug monture | Statut | Poids |
|---|---|---|---|
| orea-noire.glb | orea-noire | Placeholder généré | 11.7 Ko |
| orea-ecaille.glb | orea-ecaille | Placeholder généré | 11.7 Ko |
| vireo-titane.glb | vireo-titane | Placeholder généré | 11.7 Ko |
| vireo-corail.glb | vireo-corail | Placeholder généré | 11.7 Ko |
| brume-bleu-nuit.glb | brume-bleu-nuit | Placeholder généré | 11.7 Ko |
| brume-verte.glb | brume-verte | Placeholder généré | 11.7 Ko |

## Remplacement par de vrais modèles (à faire manuellement plus tard)

1. Se connecter à Sketchfab (compte à créer), rechercher des modèles CC0/CC-BY de lunettes (`https://sketchfab.com/tags/glasses`, filtrer par licence).
2. Télécharger au format glTF/GLB.
3. Remplacer le fichier correspondant dans `public/models/frames/<slug>.glb` — **aucun changement de code nécessaire**, `modele3dUrl` dans `src/data/frames.ts` pointe déjà vers ces chemins.
4. Mettre à jour ce tableau avec la source réelle (URL Sketchfab, auteur, licence exacte).
5. Si des modèles CC-BY sont utilisés (attribution requise), ajouter une page crédits sur le site.
6. Supprimer `scripts/generate-placeholder-frames.py` et `scripts/.venv-3d/` une fois tous les modèles remplacés (ou les garder pour resservir sur de futures références catalogue).
