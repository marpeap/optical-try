# Fork WebAR.rocks.face

- Source : https://github.com/WebAR-rocks/WebAR.rocks.face
- Commit de référence : `819cdbad4e87a43635d5f9724e30f277a7e7964d`
- Licence : MIT confirmée par lecture complète du fichier LICENSE (le bloc "LICENSED PROPERTY" en tête liste seulement les dossiers couverts — `/dist`, `/helpers`, `/neuralNets`, etc. — la licence effective en dessous est le texte MIT standard).

## Contenu vendorisé

- `dist/` : build de la librairie principale (WebARRocksFace.js — détection/tracking facial).
- `helpers/WebARRocksMirror.js` : wrapper haut niveau spécialisé virtual try-on (lunettes/casques/chapeaux/colliers) — **c'est l'API réellement utilisée**, pas `WEBARROCKSFACE.init` directement comme estimé initialement dans le plan écrit.
- `helpers/WebARRocksFaceThreeHelper.js` : pont entre le tracking et le rendu Three.js.
- `helpers/landmarksStabilizers/OneEuroLMStabilizer.js` : implémentation du **1€ Filter** déjà fournie par la librairie — pas besoin de l'implémenter soi-même comme envisagé dans la recherche initiale (section 23.1 du doc vault).
- `libs/three/v136/` : Three.js r136 + loaders (GLTFLoader, RGBELoader) + postprocessing (bloom, TAA) — version figée compatible avec le code de la librairie, à charger via `<script>` classique, **pas** via le package npm `three` du projet (versions incompatibles, API globale attendue).
- `neuralNets/NN_GLASSES_9.json` : réseau de neurones spécialisé lunettes (1.8 Mo).
- `VTOGlasses-reference/` : démo officielle complète (HTML + JS + assets), conservée en lecture seule comme référence.

## Nuance de licence sur VTOGlasses-reference/

Le dossier `demos/VTOGlasses` n'est **pas** explicitement listé dans la section "LICENSED PROPERTY" du fichier LICENSE (qui liste `/dist`, `/helpers`, `/neuralNets`, `/blenderPluginFlexibleMaskExporter`, `/reactThreeFiberDemos/...`, `/VTO4Sketchfab`). Une clause de repli couvre le code source "non identifiable comme tiers, sans licence propre, avec un fichier LICENSE dans un dossier parent" — plausiblement applicable ici, mais **pas une certitude absolue**. Décision prise : garder `VTOGlasses-reference/` en lecture seule, uniquement comme référence technique (lire le code, comprendre l'API) — ne pas embarquer tel quel `assets/models3D/occluder.glb` ou `assets/envmaps/*.hdr` dans le produit final sans revérifier explicitement ce point, ou en recréant un occluder/envmap équivalent par une source non ambiguë.

## Découverte clé : API réelle

`WebARRocksMirror.init({...}).then().catch()`, pas un simple `startEngine()` custom. Options notables déjà gérées nativement par la librairie (à exploiter plutôt que réinventer) :
- `occluderURL` : modèle d'occlusion de tête (résout le problème d'occlusion nez/oreilles identifié en recherche, section 23.1).
- `envmapURL` : environment map HDR pour l'éclairage/reflets (résout partiellement le problème d'IBL identifié — pas dynamique depuis la webcam réelle, mais HDRI statique de bonne qualité, cohérent avec le compromis MVP recommandé).
- `branchBendingAngle` / `branchFadingZ` : flexion et fondu des branches selon l'angle de vue.
- `bloom`, `taaLevel` : post-processing pour un rendu plus premium.
- `solvePnPImgPointsLabels` : points de repère faciaux utilisés pour le calcul de pose (oreilles, nez, yeux).

## Conséquence sur l'architecture prévue (Task 6 du plan)

Le wrapper `webarRocksEngine.ts` doit charger dynamiquement les scripts vendorisés (pas d'import ES module — la librairie expose des globals `window.WEBARROCKSFACE`, `window.WebARRocksMirror`, `window.THREE`) et appeler `WebARRocksMirror.init()` avec deux canvas (un pour le tracking, un pour le rendu Three.js), pas un seul canvas comme supposé initialement. La signature `RawEngineInit`/`startEngine` du plan reste valable en tant qu'abstraction côté application ; c'est l'implémentation de `defaultEngineInit` qui change.
