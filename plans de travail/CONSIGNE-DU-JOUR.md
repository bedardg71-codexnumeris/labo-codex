# Consigne du jour – « Apporter mon matériel », prêt pour lundi

> Écrite par Cowork le samedi 17 octobre 2026 à 9 h 51 (Toronto, mesuré par `date`). **Remplace la version de 9 h 40, jamais exécutée.** L'ancienne consigne du jour (lot 3a) est déjà archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-17-apporter-mon-materiel-3a.md`.
> **Commite avec ton premier commit** ce fichier, le déplacement de l'ancienne, et les fichiers de Cowork : `PLAN-2026-10-17-pret-pour-lundi.md`, `VERDICT-RELECTURE-2026-10-17-apporter-mon-materiel-3a.md`, `CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-3b1-visible.md`, `CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-5-points.md`, `MESURE-2026-10-17-grilles-en-points.md`, `A-INCLURE-3b-apporter-mon-materiel.md`, et le cadrage modifié (`CADRAGE-2026-10-15-apporter-mon-materiel.md`).

## Où on en est (mesuré par Cowork à 9 h 51)

- `main` local à `751d1eed` (lots 2 et 3a, relus), rien de poussé depuis `84d1b3d6`. **En ligne : le lot 1**, que les utilisateurs peuvent ouvrir dès maintenant.
- **Il y a un plan de match** : `plans de travail/PLAN-2026-10-17-pret-pour-lundi.md`. Lis-le d'abord. Son ordre a changé à 9 h 51 : voir ci-dessous.
- `CONSIGNE-DEMARRAGE-COWORK.md` est modifié par Cowork, non commité : laisse-le.

## Le mandat, dans l'ordre

### A. L'onglet dit qu'il est en construction (demande de Grégoire, 9 h 50)

L'onglet est en production ; un utilisateur qui l'ouvre pourrait être déçu. Un **bandeau** en tête de l'onglet « Apporter mon matériel », visible à **toutes** ses étapes (accueil, assistant, vérification, confirmation), pas seulement à l'accueil (`#materiel-accueil` disparaît quand l'assistant s'ouvre : mesure où le placer). Style d'avertissement existant de l'application, variables seulement, lisible en clair et en sombre. Texte, proposé par Cowork et soumis à Grégoire à 9 h 51 (s'il le corrige, il te le dira) :

> **En construction.** Cet outil est en cours de développement : il pourrait ne pas reconnaître toutes les grilles, et certaines étapes manquent encore. Tu peux l'essayer : rien n'est créé avant que tu aies tout vérifié.

Ne touche pas au libellé de l'onglet dans `config.js` (zone protégée). Un essai Vitest ou Playwright qui fige la présence du bandeau aux étapes, avec sa mutation. Le bandeau reste jusqu'à ce que Grégoire décide de le retirer.

### B. Étape 1 du plan

Applique `plans de travail/VERDICT-RELECTURE-2026-10-17-apporter-mon-materiel-3a.md`.

### C. Arrête-toi, et attends le signal de Grégoire pour l'étape 3

Vitest complet, commit(s), rapport court à Grégoire. **Puis attends son signal** : l'étape 3 vient maintenant **avant** l'étape 2, pour que le bandeau atteigne les utilisateurs. Au signal (Cowork, Chrome et Safari fermés) : vérification complète par `scripts/pousser.sh`, puis push **sans release** (le numéro affiché ne change pas ; la release et les Nouvelles sont à l'étape 8), comme pour le lot 1. Rapporte le déploiement Netlify.

### D. Ensuite seulement, l'étape 2

`plans de travail/CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-3b1-visible.md`, jusqu'à sa demande de relecture.
