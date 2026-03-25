# SESSION ACTIVE - BETA 98.9

**Date** : 25 mars 2026
**Version** : Beta 98.9 (Build 0324-1520)
**Statut** : Assainissement sécurité — Phases 0-4 complétées, Phase 5 à démarrer

## Chantier en cours : Élimination de la dette technique inline

### Contexte
Le sprint sécurité du 22-23 mars a tenté de migrer ~500 handlers inline d'un coup, ce qui a cassé l'application (Object.freeze + validation schéma + migration massive). Rollback complet vers `85e2f9c`. L'audit du 25 mars a confirmé que le code source est propre mais que ~1083 handlers inline persistent (état historique de l'app).

### Plan de travail
**Plan détaillé Phases 5-6** : `plans de travail/Plan - Assainissement sécurité (Phases 5-6).md`

### Travail réalisé (25 mars 2026)

#### Phase 0 — Nettoyage artefacts sprint (commit `d9b6662`)
- Supprimé 3 fichiers test XSS dans `plans de travail/`
- Supprimé 2 plans de sécurité obsolètes
- Supprimé branches mortes : `sauvegarde-securite-23mars`, `refonte-import-mars23`

#### Phase 1 — Correction de 2 vulnérabilités innerHTML (commit `d9b6662`)
- `js/boite-outils.js:261` — echapperHtml() sur noms étudiants (tirage au sort)
- `js/trimestres.js:1116` — echapperHtml() sur nom trimestre (bandeau archive)

#### Phase 2 — Migration 29 onmouseover/onfocus → CSS :hover/:focus (commit `e0c5d47`)
- 14 classes utilitaires hover/focus dans `styles.css` (section Phase 2, ~ligne 688)
- 10 fichiers JS migrés
- Reste : 1 conditionnel (primo-modal radio) + 1 fonctionnel (travaux-ui autocomplete)

#### Phase 3 — Délégation 82 toggleAccordeonV2 (commit `654b7c6`)
- Listener délégué `.accordeon-header` dans `main.js`
- 78 onclick retirés de `index.html`, 2 de `accueil.js`, 2 de `parcours-apprentissage.js`

#### Phase 4, Lot 1 — Dispatcher central + 25 onclick (commit `780a03b`)
- **Dispatcher** : `data-action` dans `main.js` (dot notation, data-param, data-confirm, data-stop, data-prevent)
- **8 fonctions wrapper** dans main.js
- 25 onclick migrés : menu Codex (12), bandeaux (6), accueil (1), diagnostics (4), planification zoom (2)

#### Phase 4, Lots 2-8 — 203 onclick index.html (commit `c7f4643`)
- **Lot 2** (19) : tri tableaux étudiants + évaluations
- **Lot 3** (18) : séances + évaluations formulaire + modal réparation
- **Lot 4** (35) : productions + grilles + échelles + pratiques
- **Lot 5** (20) : matériel + cartouches + aide + modal suppression
- **Lot 6** (60) : réglages V2 complet + préférences + données
- **Lot 7** (36) : wizards + organisateur + bibliothèque cours
- **Lot 8** (15) : modales globales (export/import, wizard V2, PDF, confidentiel)
- **Exports window ajoutés** dans 8 fichiers JS (fonctions IIFE non exposées)
- **2 wrappers** ajoutés : `appliquerPratiqueAuCoursActive`, `demarrerCreationMaterielSafe`

### Ce qui reste à faire

#### Phase 5 — ~602 handlers dans 56 fichiers JS (template literals)
- 487 onclick + 95 onchange + 18 oninput + 2 onsubmit
- Top 5 fichiers : travaux-ui (88), echelles (50), grilles (48), travaux-outils (47), profil-etudiant (39)
- Découpé en 15 lots (5.1 à 5.15), 1-2 fichiers par lot
- **Prérequis** : étendre le dispatcher dans main.js pour `change`, `input`, `keyup`

#### Phase 5b — 212 handlers dans index.html (onchange/oninput/onkeyup)
- 199 onchange + 10 oninput + 1 onkeyup + 2 onclick (en JS inline)
- Découpé en 12 lots par section (TDB, liste, séances, évaluations, MAT, etc.)
- Certaines fonctions devront être adaptées (`this.value` → `el.value`)

#### Phase 6 — Politique CSP
- Déplacer le `<script>` inline d'index.html vers fichier externe
- Ajouter meta CSP : `script-src 'self'; style-src 'self' 'unsafe-inline'`
- Test intégral

### Estimation : 7-10 sessions restantes

### Architecture de délégation (référence rapide)

```
Niveau 1 — data-action (click) : EN PLACE dans main.js
  onclick="func()"           → data-action="func"
  onclick="func('param')"    → data-action="func" data-param="param"
  onclick="Obj.method()"     → data-action="Obj.method"

Niveau 2 — data-on-change/input/keyup : À CRÉER dans main.js
  onchange="func()"          → data-on-change="func"
  onchange="func(this.value)"→ data-on-change="func" (fn reçoit el)
  oninput="func('p', this.value)" → data-on-input="func" data-param="p"

Niveau 3 — délégation conteneur : DANS CHAQUE MODULE JS
  Les éléments dynamiques (template literals) utilisent les mêmes
  attributs data-action / data-on-change. Le bubbling remonte
  jusqu'aux dispatchers document-level.
```

### Risques et vigilance

- **Ne pas reproduire l'erreur du sprint** : 1 lot à la fois, commit + test entre chaque
- **Ne pas modifier la logique métier** : seulement déplacer le câblage handler → délégation
- **Adapter les fonctions `this.value`/`this.checked`** : changement de signature minimal
- Les wrappers sont dans `main.js` (lignes ~169-219), le dispatcher suit (~lignes 700-730)
