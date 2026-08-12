# Design — Sous-projet 2 : Essayage virtuel

**Statut** : approuvé
**Date** : 12 août 2026
**Contexte** : deuxième des 3 sous-projets du MVP « Plateforme de vente de lunettes & parcours optique ». Dépend du sous-projet 1 (Catalogue) pour le point d'entrée (`TryOnTrigger`) et le modèle `Frame`. Voir aussi la recherche complète `[[02-Projets-Marpeap/Lunettes-Optique]]` (sections 6, 23, 24) dans le vault Obsidian.

## Périmètre

Composant d'essayage virtuel 3D en webcam, déclenché depuis la fiche produit du sous-projet 1. Couvre : tracking facial, positionnement/rendu 3D de la monture, gestion caméra, adaptation qualité selon le device. Ne couvre pas : mesure IPD certifiée (reportée), pipeline complet d'acquisition de tous les assets futurs (juste les 5-8 démo du MVP), parcours de commande (sous-projet 3).

## Décisions

- **Moteur** : **WebAR.rocks.face** (licence MIT confirmée par lecture directe du fichier LICENSE, dépôt actif). Fork du dossier `/demos/VTOGlasses/` de leur repo comme point de départ (positionnement, PBR, flexion des branches déjà fonctionnels).
- **Jeeliz explicitement écarté** : sa licence gratuite interdit tout déploiement public (limite <10 modèles + non déployable publiquement) ; le MVP prévoyant un déploiement public rapide, cette contrainte l'exclut d'office malgré une éventuelle qualité de rendu supérieure en dev.
- **Qualité MVP** : itérative. On adapte la démo existante à notre catalogue plutôt que de viser d'emblée un rendu proche du photoréalisme (réfraction verres, occlusion cheveux, éclairage d'environnement dynamique — identifiés comme un chantier de plusieurs mois dans la recherche). Ces améliorations deviennent des itérations post-MVP, pas un blocage au lancement.
- **Assets 3D** : budget zéro. Modèles CC0/CC-BY triés manuellement sur Sketchfab, retravaillés en interne si nécessaire (nettoyage topologie/UV, conversion glTF/GLB, calibration d'échelle). Pas d'achat marketplace, pas de commande freelance pour ce MVP.
- **Mobile obligatoire dès le MVP** : contrainte forte car c'est le point le moins documenté de toute la recherche (aucun benchmark FPS public trouvé pour tracking + rendu PBR simultanés sur mobile milieu de gamme). Implique une détection de palier device et des presets de qualité dégradés plutôt qu'une seule configuration desktop.
- **IPD hors périmètre MVP** : le parcours de commande réel étant en mockup sans backend (sous-projet 3), une mesure certifiée n'a pas d'utilité immédiate. L'essayage sert à visualiser le rendu de la monture, pas à produire une donnée exploitable pour une commande de verres correcteurs réelle.

## Architecture

```
src/
  components/
    tryon/
      TryOnOverlay.tsx         → modal plein écran, orchestre caméra + moteur, reçoit une Frame en prop
      engine/
        webarRocksEngine.ts    → wrapper init/teardown autour de WebAR.rocks.face
        deviceTier.ts          → heuristique device → preset qualité (desktop / mobile haut de gamme / mobile bas de gamme)
public/
  models/
    frames/
      <slug>.glb               → un modèle 3D par monture du catalogue (5-8 fichiers pour le MVP)
```

## Contrat d'intégration avec le sous-projet 1

`TryOnTrigger` (défini dans la spec du sous-projet 1, `catalogue/[slug]/page.tsx`) monte `TryOnOverlay` en lui passant la `Frame` complète (type défini dans `src/lib/types.ts`, incluant `modele3dUrl`). `TryOnOverlay` gère l'intégralité du cycle de vie caméra + rendu en interne et expose une fonction de fermeture (`onClose`) qui redonne la main à la fiche produit — pas de changement d'URL, cohérent avec la décision « overlay plein écran » actée dans la spec du sous-projet 1.

## Flux

1. Utilisateur clique « Essayer virtuellement » sur la fiche produit.
2. `TryOnOverlay` s'ouvre, demande la permission caméra (`getUserMedia`).
3. Si permission accordée et device compatible : `deviceTier.ts` détermine le preset qualité, `webarRocksEngine.ts` initialise le moteur avec le flux vidéo + le `modele3dUrl` de la `Frame`.
4. Rendu en temps réel : tracking facial + positionnement/rendu de la monture 3D par-dessus le flux webcam.
5. Fermeture (bouton ou touche Échap) → arrêt propre du flux caméra + du moteur, retour à la fiche produit.

## Gestion d'erreur

- `modele3dUrl` absent sur la `Frame` : déjà géré en amont par le sous-projet 1 (`TryOnTrigger` désactivé, message « essayage bientôt disponible »). `TryOnOverlay` ne devrait donc jamais être monté sans `modele3dUrl` valide, mais garde un garde-fou défensif au montage.
- Permission caméra refusée : message explicite à l'utilisateur, fermeture propre de l'overlay (pas de retry automatique intrusif).
- WebGL non supporté ou device jugé trop faible par `deviceTier.ts` : dégradation gracieuse — message informatif plutôt qu'un crash ou un rendu cassé.
- Échec d'initialisation du moteur (erreur WebAR.rocks.face) : capturé, log console (dev), message utilisateur générique + fermeture de l'overlay.

## Tests / validation

Le rendu dépend directement du hardware (webcam, GPU) — pas de suite de tests automatisés significative sur la qualité du rendu lui-même. Validation :
- `tsc --noEmit` systématique.
- Test manuel réel sur au moins 3 profils : desktop (navigateur standard), un Android milieu de gamme, un iPhone récent — le budget de perf mobile étant un angle mort identifié par la recherche, ce test manuel n'est pas optionnel.
- Vérification manuelle des 3 cas d'erreur (permission refusée, WebGL absent, device faible) avant toute mise en avant du MVP.
