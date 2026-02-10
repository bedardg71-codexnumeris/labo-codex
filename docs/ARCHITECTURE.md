# Architecture — Monitorage v6

> **Dernière mise à jour** : 7 février 2026 (Beta 97.3)

---

## Structure de fichiers

```
Monitorage_v6/
├── index.html          ← SPA monolithique (~15 500 lignes), tout le HTML
├── styles.css          ← CSS unique (~13 750 lignes), design system inclus
├── js/                 ← Modules JavaScript (93 fichiers)
├── libs/               ← Librairies tierces (Chart.js, jsPDF, PDF.js, JSZip)
├── autocollants/       ← 12 PNG (tampons de rétroaction)
├── docs/               ← Documentation technique
├── Design system - Modules/  ← Guide de référence visuel (HTML standalone)
├── BACKLOG.md          ← Tracker de tâches
├── CLAUDE.md           ← Instructions pour Claude Code
└── SESSION.md          ← Contexte de session courante
```

---

## Organisation des modules JS (`js/`)

**Un fichier = un module fonctionnel.** Pas de dossiers imbriqués (sauf `js/pratiques/`).

```
js/
├── config.js              ← Variables globales, constantes (PROTÉGÉ)
├── navigation.js          ← Routeur SPA, sous-sections (PROTÉGÉ)
├── main.js                ← Init app, helpers globaux (formaterDate, toggleDisplay, genererIdUnique)
├── db.js                  ← Abstraction stockage (IndexedDB + localStorage sync)
├── trimestres.js          ← Namespacing par semestre, cle(), CLES_NAMESPACEES
│
├── evaluation.js          ← Formulaire d'évaluation (~3400 lignes)
├── liste-evaluations.js   ← Liste filtrable/triable des évaluations
├── evaluations-apercu.js  ← Statistiques aperçu évaluations
├── portfolio.js           ← Calcul indices CP, note finale
├── profil-etudiant.js     ← Fiche individuelle étudiant
├── tableau-bord-apercu.js ← Dashboard Vue d'ensemble
│
├── travaux-ui.js          ← Coordinateur module Travaux (toolbar, layout)
├── travaux-annotation.js  ← Moteur Canvas (dessin, undo/redo, Apple Pencil)
├── travaux-visionneuse.js ← Rendu PDF/images, zoom
├── travaux-outils.js      ← Palette outils, couleurs, épaisseur
├── travaux-import.js      ← Drag-drop, jumelage DA
├── travaux-stockage.js    ← IndexedDB / File System Access API
├── travaux-archivage.js   ← Export ZIP
├── travaux-export-pdf.js  ← Export PDF annoté + dossier complet
│
├── pratiques/             ← Sous-dossier : pratiques de notation
│   ├── pratique-registre.js
│   ├── pratique-sommative.js
│   ├── pratique-pan-standards.js
│   ├── pratique-pan-specifications.js
│   └── pratique-pan-objectifs.js
│
├── grilles.js, echelles.js, cartouches.js, productions.js  ← Matériel pédagogique
├── saisie-presences.js, presences-apercu.js                ← Module présences
├── interventions.js       ← Suivi des interventions pédagogiques
├── import-export.js       ← Sauvegarde/restauration JSON
├── donnees-demo.js        ← Pack démo 20 étudiants
└── ... (~93 fichiers total)
```

---

## Conventions JS

- **Vanilla JS ES6+**, aucun bundler, aucun framework
- Tous les scripts chargés via `<script>` dans `index.html` (ordre important)
- **IIFE + `'use strict'`** sur 91/93 fichiers (encapsulation) :
  ```js
  (function() {
  'use strict';
  // ... code du module ...
  window.nomFonction = nomFonction;  // exports explicites
  })();
  ```
- Communication inter-modules via **`window.*`** (exports globaux) — pas d'import/export ES6
- Pas de classes — fonctions et objets littéraux
- Stockage : **`db.getSync()` / `db.setSync()`** (abstraction IndexedDB + localStorage)
- Namespacing données par trimestre : **`window.cle('key')`** → `h2026_key`
- Helper global : `obtenirDonneesSelonMode('key')` pour lire les données namespacées

---

## Chargement des scripts (index.html)

```html
<!-- Ordre critique -->
<script src="js/db.js"></script>
<script src="js/config.js"></script>
<script src="js/trimestres.js"></script>
<script src="js/main.js"></script>
<script src="js/navigation.js"></script>
<!-- ... puis tous les modules dans l'ordre de dépendance -->
```

---

## Navigation SPA

`navigation.js` gère un routeur maison : sections (`section-evaluations`, `section-construction`, etc.) et sous-sections (`evaluations-apercu`, `evaluations-travaux`, etc.) via `classList.add/remove('active')`. Les fonctions de chaque module sont appelées par `typeof` check :

```js
if (typeof chargerApercuEvaluations === 'function') {
    chargerApercuEvaluations();
}
```

---

## Stockage des données

### Architecture à deux niveaux

- **IndexedDB** : stockage principal (persistant, grande capacité)
- **localStorage** : cache synchrone (accès rapide, fallback)
- **`db.js`** écrit dans les deux simultanément, lit depuis localStorage en priorité

### Namespacing par trimestre

Les données sont préfixées par trimestre via `trimestres.js` :

```js
window.cle('groupeEtudiants')  // → 'h2026_groupeEtudiants'
window.cle('productions')      // → 'h2026_productions'
```

La liste des clés namespacées est dans `CLES_NAMESPACEES` (trimestres.js).

### Clés principales

| Clé | Contenu |
|-----|---------|
| `listeCours` | Liste des cours configurés |
| `groupeEtudiants` | Étudiants du trimestre actif |
| `productions` | Productions pédagogiques |
| `evaluationsSauvegardees` | Évaluations complétées |
| `presences` | Données de présences |
| `grillesTemplates` | Grilles de critères |
| `echellesTemplates` | Échelles de performance |
| `cartouches_*` | Cartouches de rétroaction (par grille) |
| `pratiquesConfigurables` | Pratiques de notation |
| `horaires` | Horaires du trimestre |

---

## Design System

### Fichiers

- **`styles.css`** : Variables CSS `:root` (174 tokens), styles de l'application
- **`Design system - Modules/`** : Guide de référence visuel (17 modules HTML standalone)
- **`Design system - Modules/guide-common.css`** : Chrome partagé des modules du guide

### Tokens CSS principaux

| Catégorie | Exemples |
|-----------|----------|
| Couleurs principales | `--bleu-principal`, `--bleu-clair`, `--bleu-pale` |
| Ombres (5 niveaux) | `--shadow-subtil`, `--shadow-normal`, `--shadow-prononce`, `--shadow-fort` |
| Rayons (4 niveaux) | `--radius-petit` (5px), `--radius-moyen` (6px), `--radius-grand` (12px), `--radius-pill` (20px) |
| Bordures | `--bordure-claire`, `--bordure-moyenne` |
| Alertes | `--alerte-fond-attention`, `--alerte-bordure-succes`, etc. |
| Boutons | `--btn-principal`, `--btn-ajouter`, `--btn-supprimer`, etc. |
| Navigation | `--nav-bg`, `--nav-actif`, `--sous-nav-bg` |

### Trois modes d'affichage

- **Normal** : Palette bleue (`--bleu-*`)
- **Simulation** (assisté) : Palette sarcelle (`--sarcelle-*`)
- **Anonymisation** : Palette gris-vert

Basculés via `data-mode` sur `<body>` avec overrides CSS `[data-mode="simulation"]`.

---

## Fichiers protégés

**Ne jamais modifier sans autorisation** :
- `js/config.js` — Configuration navigation
- `js/navigation.js` — Logique navigation
- `noms_stables.json` — Registre des noms protégés
