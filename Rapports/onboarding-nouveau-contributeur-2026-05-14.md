# Rapport d'onboarding — Monitorage Pédagogique (Labo Codex)

**Auteur** : nouveau contributeur • **Repo** : `Monitorage_v6` • **Version vue** : Beta 0.93 (README) / 99.11 (CLAUDE.md)
**Date** : 14 mai 2026
**Sources lues** : `README.md`, `CLAUDE.md`, `docs/00-START-HERE.md`, `docs/02-ARCHITECTURE-OVERVIEW.md`

---

## (a) Architecture — vue 1 page

**Nature du projet.** SPA web 100 % client-side, **vanilla JS ES6+** (HTML5 / CSS3), sans bundler, sans framework, sans npm en production. Seule dépendance externe : Chart.js. Fonctionne hors-ligne après téléchargement. Cible : enseignants du collégial pour le suivi formatif des apprentissages (indices A-C-P, taxonomie SOLO, modèle Réponse à l'Intervention).

**Stack et exécution.** L'utilisateur ouvre `index.html` (ou sert le dossier via `python -m http.server`). Ce fichier charge ~54 modules JS via balises `<script>` séquentielles. La CSP est stricte : `script-src 'self'`, donc **aucun `eval()`, aucun handler `onclick=` inline** — les interactions passent par un dispatcher `data-action` centralisé dans `main.js`.

**Stockage hybride.** Deux couches orchestrées par `js/db.js` :
- **localStorage** pour les petites clés (< 200 Ko), source de vérité synchrone.
- **IndexedDB + memoryCache** pour les grosses clés (thumbnails, évaluations), source de vérité asynchrone.
- Les clés sont **namespacées par trimestre** : `h2026_groupeEtudiants`, `a2025_calendrierComplet`, etc., via `window.cle('nomCle')`. Garantit l'isolation entre cohortes.

**Principe architectural cardinal — Single Source of Truth.** Chaque donnée a UNE source qui la génère et la stocke. Les autres modules **lisent** via localStorage/IndexedDB et ne **recalculent jamais**. Conséquence : les modules ne se parlent jamais directement. Ex. : `trimestre.js` génère `calendrierComplet` → `calendrier-vue.js` ne fait que le lire.

**Hiérarchie conceptuelle (sacrée).** `Trimestre → Cours → Groupe → Étudiants + Productions + Évaluations`. Tout l'UX et le modèle de données descendent de cette pyramide.

**Système de pratiques de notation (IPratique).** Le calcul de l'indice P est délégué à une *pratique* implémentant l'interface `IPratique` (PAN-Maîtrise, PAN-Standards, Sommative traditionnelle…). L'orchestrateur est `indices-cp.js`, le routeur est `pratique-registre.js`. C'est ce qui permet à l'app de servir au-delà de l'auteur.

**Zones protégées.** `js/config.js`, `js/navigation.js`, `noms_stables.json` constituent la colonne vertébrale : on ne les touche pas sans validation explicite. Une erreur ici casse l'app entière.

**Sécurité (non négociable).** Tout `innerHTML` avec données utilisateur passe par `echapperHtml()`. Tout import ZIP par `validerZipSecurite()`. Tout import image/PDF par `validerMagicBytes()`. Suite Vitest + Playwright WebKit dans `tests/` (29 tests, hook pré-push optionnel).

**Versioning.** Source unique : `version.json` (`{build, beta}`), à bumper en fin de session avec fallback synchronisé dans `index.html`. Pas de cache busters `?v=` sur Safari `file://` — l'app embarque un snapshot `BUILD_ID` dans `js/init-inline.js`.

**Design system.** Le fichier `design-system.html` à la racine est la référence visuelle de vérité (palette, surfaces, modes sombre/clair). Toute couleur en dur est interdite — uniquement les variables CSS de `styles.css`.

---

## (b) Diagramme des modules principaux

```
                        ┌─────────────────────────────┐
                        │         index.html          │
                        │  (entrée SPA, charge ~54 JS)│
                        │  CSP stricte, dispatcher    │
                        │  data-action global         │
                        └──────────────┬──────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
     ┌────────▼────────┐    ┌──────────▼──────────┐    ┌────────▼────────┐
     │  COLONNE        │    │   COUCHE DONNÉES    │    │  PRIMO /        │
     │  VERTÉBRALE     │    │                     │    │  ACCUEIL        │
     │  (protégée)     │    │  db.js              │    │                 │
     │                 │    │  ├─ localStorage    │    │  primo-         │
     │  config.js      │    │  └─ IndexedDB +     │    │  accueil.js     │
     │  navigation.js  │    │     memoryCache     │    │  (onboarding)   │
     │  noms_stables   │    │                     │    │                 │
     │  main.js        │    │  cle('clef')        │    │                 │
     │  (dispatcher)   │    │  → namespace        │    │                 │
     └─────────────────┘    │     {trimestre}_*   │    └─────────────────┘
                            └──────────┬──────────┘
                                       │ (single source of truth)
              ┌────────────────────────┼────────────────────────────┐
              │                        │                            │
     ┌────────▼─────────┐   ┌──────────▼──────────┐    ┌────────────▼──────────┐
     │  DOMAINE         │   │   PRATIQUES         │    │  IMPORT / EXPORT      │
     │  PÉDAGOGIQUE     │   │   (modulaires)      │    │  / CODEX              │
     │                  │   │                     │    │                       │
     │  trimestre.js    │   │  indices-cp.js      │    │  codex.js             │
     │  cours / groupes │   │  (orchestrateur)    │    │  import-export.js     │
     │  étudiants       │   │  pratique-registre  │    │  cc-license.js (CC)   │
     │  productions     │   │  pratique-pan-...   │    │  reserve.js (archive) │
     │  évaluations     │   │  pratique-sommative │    │  travaux-stockage     │
     │                  │   │  ...IPratique       │    │                       │
     └────────┬─────────┘   └──────────┬──────────┘    └───────────────────────┘
              │                        │
              └────────────┬───────────┘
                           │
              ┌────────────▼──────────────────┐    ┌──────────────────────────┐
              │  VUES / DIAGNOSTIC            │    │  TRANSVERSES             │
              │                               │    │                          │
              │  tableau-bord-apercu.js       │    │  bibliotheque-ui.js      │
              │  profil-etudiant.js (RàI)     │    │  (cartes biblios)        │
              │  planification.js (carte      │    │  couleurs.js / styles    │
              │   mentale + organisateur)     │    │  changelog-data.js       │
              │  travaux-ui.js                │    │  init-inline.js          │
              └───────────────────────────────┘    └──────────────────────────┘
```

**Flux type d'une donnée** : `trimestre.js` GÉNÈRE → `db.setSync('h2026_calendrierComplet', …)` → `calendrier-vue.js` LIT → affichage. Aucun appel direct module-à-module.

---

## (c) Les 3 fichiers à comprendre en premier

| # | Fichier | Pourquoi en premier |
|---|---------|---------------------|
| 1 | **`docs/02-ARCHITECTURE-OVERVIEW.md`** | Donne le modèle mental complet en 3 min : hiérarchie sacrée Trimestre→Cours→Groupe→Étudiants, Single Source of Truth, namespacing par trimestre, délégation aux pratiques. Sans ces 4 concepts, le code ressemble à du chaos ; avec, tout devient lisible. Pointe ensuite vers les bons modules selon le contexte de travail. |
| 2 | **`index.html`** | Seul point d'entrée de la SPA. L'ordre des `<script>` y matérialise les dépendances (pas de bundler pour les expliciter), la CSP y est définie, le DOM initial y vit, et la zone du dispatcher `data-action` y est ancrée. Connaître ce fichier = connaître la séquence de boot et savoir où brancher un nouveau module. |
| 3 | **`js/db.js`** | Couche de stockage hybride utilisée par **tous** les autres modules. Sans comprendre `db.getSync` / `db.setSync` / la frontière sync vs async, la règle des 200 Ko, et `window.cle()` pour le namespacing, on ne peut ni lire ni écrire correctement. C'est le pivot du « Single Source of Truth ». |

> **Lectures suivantes naturelles** (8 min cumulés, par `docs/00-START-HERE.md`) : `docs/01-MEMORY-PINS.md` (décisions immuables) puis `docs/architecture/ECOSYSTEME-DONNEES.md` (Codex / Réserve / Voûte / Codex data). À ne PAS toucher sans validation : `js/config.js`, `js/navigation.js`, `noms_stables.json`.
