# Design — Sous-projet 3 : Parcours mockup interactif (sans backend)

**Statut** : approuvé
**Date** : 12 août 2026
**Contexte** : troisième et dernier des 3 sous-projets du MVP « Plateforme de vente de lunettes & parcours optique ». Dépend du sous-projet 1 (Catalogue, type `Frame`) pour le point d'entrée. Couvre tout le parcours post-sélection de monture décrit en section 3 du cadrage (`temporaires/Projet — Plateforme de vente de lunettes & parcours optique.md`), en mockup 100% frontend. Voir aussi la recherche `[[02-Projets-Marpeap/Lunettes-Optique]]` (sections 8-10 réglementaire, non contraignantes ici puisqu'aucune donnée réelle n'est traitée, mais utiles pour la cohérence du contenu affiché).

## Périmètre

Wizard complet de 9 étapes après le choix de la monture : ordonnance → vérification → infos personnelles → mutuelle → tiers payant → devis → reste à charge → paiement → confirmation (commande + facture + suivi regroupés). Aucune donnée n'est envoyée à un serveur — tout est simulé et stocké en `localStorage`. Ne couvre pas le back-office professionnel (hors MVP).

## Décisions

- **Niveau d'interactivité** : interactions simulées avec logique fake, pas de simples écrans statiques. L'utilisateur remplit réellement les étapes et voit des résultats qui réagissent à ses choix (ex: reste à charge qui change selon la mutuelle/classe A ou B sélectionnée).
- **Persistance** : `localStorage`, pattern déjà validé sur le wizard RDV de lenettoyeur.com. Permet de recharger/revenir sans perdre sa progression, tout en restant 100% local au navigateur.
- **Périmètre** : les 9 étapes complètes, pas de version réduite — démontre la proposition de valeur complète énoncée en section 26 du cadrage (« je choisis mes lunettes → je les essaie → je renseigne mon ordonnance → je configure mes verres → j'obtiens mon devis → je connais mon reste à charge → je commande »).
- **Faux OCR** : upload photo → délai simulé (1-2s, faux « traitement en cours ») → écran de vérification avec valeurs SPH/CYL/AXE/ADD factices pré-remplies. L'édition de ces valeurs par l'utilisateur est souhaitable (cohérent avec le principe « l'IA n'est jamais autorité finale ») mais non bloquante si l'implémentation s'avère trop lourde pour le MVP — dans ce cas, un simple affichage des valeurs factices avec bouton de validation suffit en première version, l'édition pouvant être ajoutée en itération suivante.

## Point de couture avec le sous-projet 1

Ajout d'un champ `classeSante: "A" | "B"` au type `Frame` (`src/lib/types.ts`, partagé) — nécessaire pour que le calcul de reste à charge respecte la logique réglementaire 100% Santé (classe A = reste à charge nul, classe B = remboursement mutuelle variable). Le CTA « Choisir cette monture » sur la fiche produit (sous-projet 1) initialise l'état du wizard avec la `Frame` sélectionnée.

## Architecture

```
src/
  app/
    commande/[step]/page.tsx   → route wizard, un segment par étape
  components/
    wizard/
      WizardShell.tsx           → navigation, indicateur de progression, garde-fou d'état
      OrdonnanceStep.tsx
      VerificationStep.tsx
      InfosPersoStep.tsx
      MutuelleStep.tsx
      TiersPayantStep.tsx
      DevisStep.tsx
      ResteAChargeStep.tsx
      PaiementStep.tsx
      ConfirmationStep.tsx      → commande + facture + suivi regroupés (écran de confirmation, animation de validation dans l'esprit du checkmark SVG déjà utilisé sur lenettoyeur.com)
  lib/
    wizardState.ts              → lecture/écriture localStorage, état typé du parcours
    fakeCalculations.ts         → logique devis/reste à charge (classe A/B)
    fakeOcr.ts                  → délai simulé + générateur de valeurs factices SPH/CYL/AXE/ADD
```

## Flux

1. Depuis la fiche produit, CTA « Choisir cette monture » → initialise l'état wizard (`wizardState.ts`) avec la `Frame` sélectionnée, redirige vers `commande/ordonnance`.
2. Étape ordonnance : upload photo (ou saisie manuelle) → `fakeOcr.ts` simule le traitement → étape vérification affiche les valeurs.
3. Étapes infos perso / mutuelle / tiers payant : formulaires simples, état accumulé dans `wizardState.ts`.
4. Étape devis : `fakeCalculations.ts` calcule un devis normalisé fictif à partir de la `Frame` (prix, `classeSante`) et des choix mutuelle/tiers payant.
5. Étape reste à charge : dérivée du devis, cohérente avec la logique classe A (nul) / classe B (variable).
6. Paiement : formulaire fake, aucune vraie transaction.
7. Confirmation : écran récapitulatif (commande + facture + suivi), fin du parcours. Option de vider l'état localStorage pour recommencer une démo.

## Gestion d'erreur

- Accès direct à une étape sans état préalable (ex: URL `commande/devis` sans monture choisie au préalable) : `WizardShell` détecte l'état manquant/incomplet et redirige vers le début du parcours avec un message explicatif, plutôt que d'afficher un écran cassé.
- Aucune gestion d'erreur réseau nécessaire (rien n'est envoyé à un serveur).

## Tests / validation

`fakeCalculations.ts` contient une vraie logique métier (classe A/B, calcul du reste à charge) — contrairement aux sous-projets 1 et 2, ça justifie des tests unitaires ciblés sur cette fonction pure (entrées : prix monture, classe A/B, choix mutuelle/tiers payant → sortie : devis + reste à charge attendus). Le reste du sous-projet suit la même validation que les précédents : `tsc --noEmit` + parcours manuel complet des 9 étapes, y compris le cas de garde-fou (accès direct à une étape sans état).
