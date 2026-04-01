# SESSION ACTIVE — BETA 99

**Date** : 1er avril 2026
**Version** : Beta 99 (Build 0401-1220)
**Statut** : Palettes flottantes, raccourcis clavier, icônes — DÉPLOYÉ

---

## Bilan de la session (1er avril 2026)

### Palettes flottantes et UX annotation (12 commits)
- Séances données : source unique `obtenirSeancesCompletes()` (fix 27/30 erroné)
- Palettes Codes/Tampons : largeur libre, grille CSS auto-fill, boutons ↔/↕
- Palettes Évaluation : boutons ↔/↕, grille critères responsive (auto-fill 120px)
- Critère algorithmique (Français) : pleine largeur via `:has(.eval-badge-algo)`
- Menu Actions : affiche le mode actif, Alléger/Re-importer retirés (opérations fichier)
- Alléger : confirm() explicatif ajouté (opération destructive)
- Palette Annotation : bouton replier fonctionnel, icônes PNG (icons8)
- Palette Chrono : pause/play, reprise auto sur annotation, layout compact
- Raccourcis clavier : codes 1-9/0, tampons configurables (⌨ dans réglages)
- Fix doublons palettes eval, fix NotFoundError insertBefore, fix panneaux perdus
- Fix cartouche rétroaction : sélection immédiate (race condition éliminée)
- Fix build fallback init-inline.js

---

## Bilan de la session (27 mars 2026)

### Désaturation localStorage (4 commits)
Extraction des thumbnails base64 (~3.3 Mo) vers IDB, seuil IDB-first 200 Ko,
flush beforeunload, fusion des syncs, diagnostic storage.

**Commits** : `233fdfc`, `a329f81`, `51d7176`, `f25f12c`

**Chantiers livrés** :
- 1a : Extraction thumbnails vers IDB (fichiersTravaux 3.8 Mo → ~500 Ko)
- 2a : Seuil IDB-first 200 Ko (grosses clés sautent localStorage)
- 1b : Flush beforeunload (écritures IDB trackées, dialogue si Cmd+Q)
- 2c : Fusion _prechargerDepuisIDB dans syncToLocalStorageCache (-23 lignes)
- 1c : Audit localStorage directs (tous légitimes, RAS)
- 3b : Notification quota → retirée (comportement normal avec IDB-first)
- 2b : Documentation db.js mise à jour
- 2d : Audit evaluationsSauvegardees (géré par seuil IDB-first)
- 3a : Diagnostic storage (window._storageStats + rapport-bug)
- 3c : Test de résistance (window._testResistanceStorage() — SUCCÈS)

### Jetons de reprise — fichiers numériques (8 commits)
Fonctionnalité complète permettant d'importer des fichiers de reprise et de les associer aux évaluations. 11 reprises évaluées avec succès dans le groupe 2.

**Commits** : `86cd409`, `9b06316`, `2212076`, `d13ad4b`, `ba087f8`, `1bfea6b`, `89f1297`, `63dd1d2`

---

## Prochains chantiers

### Priorité 1 — Assainissement sécurité (migration onclick)
**État** : ~87% complété. index.html nettoyé, CSP en place, dispatcher opérationnel.
- **Reste** : ~164 références legacy dans les JS (dont ~30-40 `.onclick = fn` directs)
- **Fichiers principaux** : bibliotheque-ui.js (14), liste-evaluations.js (14), cartouches.js (12), grilles.js (11), productions.js (10)
- La plupart passent déjà par `onclickToDataAttrs()` (conversion automatique)

### Priorité 2 — Refonte page rétroaction PDF
- Plan : `plans de travail/Plan - Refonte page retroaction PDF.md`

---

## Problèmes connus

- **Annoter vs Consulter** : "Annoter" bascule brièvement en mode Évaluer avant de revenir en Annoter
- **Progression temporelle** : "Aucune donnée" — snapshots possiblement affectés par le quota
- **Post-import jetons** : liaison manuelle parfois nécessaire si IDB n'a pas persisté avant rechargement
