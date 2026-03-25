# SESSION ACTIVE - BETA 98.9

**Date** : 25 mars 2026
**Version** : Beta 98.9 (Build 0324-1520)
**Statut** : Assainissement sécurité — migration onclick inline vers délégation

## Chantier en cours : Élimination de la dette technique inline

### Contexte
Le sprint sécurité du 22-23 mars a tenté de migrer ~500 handlers inline d'un coup, ce qui a cassé l'application (Object.freeze + validation schéma + migration massive). Rollback complet vers `85e2f9c`. L'audit du 25 mars a confirmé que le code source est propre mais que ~1083 handlers inline persistent (état historique de l'app).

### Plan de travail
**Fichier de plan détaillé** : `.claude/plans/keen-growing-ullman.md`

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
- 10 fichiers JS migrés : primo-accueil, primo-modal, tutoriel-interactif, guidage, gabarits-utils, import-export, pratiques-materiel, cours, trimestre-v2, profil-etudiant
- Reste : 1 conditionnel (primo-modal radio) + 1 fonctionnel (travaux-ui autocomplete)

#### Phase 3 — Délégation 82 toggleAccordeonV2 (commit `654b7c6`)
- Listener délégué `.accordeon-header` dans `main.js`
- 78 onclick retirés de `index.html`, 2 de `accueil.js`, 2 de `parcours-apprentissage.js`

#### Phase 4, Lot 1 — Dispatcher central + 25 onclick (commit `780a03b`)
- **Dispatcher** : `data-action` dans `main.js` (dot notation, data-param, data-confirm, data-stop)
- **8 fonctions wrapper** : naviguerVersReglagesTrimestre, rechargerPage, ouvrirImportEchellesLocal, ouvrirImportTxtCartouche, reinitialiserParcoursAvecConfirm, dupliquer/supprimerPratiqueMaterielActive
- 25 onclick migrés : menu Codex (12), bandeaux (6), accueil (1), diagnostics (4), planification zoom (2)

### Ce qui reste à faire

**Phase 4, Lots 2-8** — 205 onclick restants dans index.html :

| Lot | Handlers | Section | Risque |
|---|---|---|---|
| 2 | 21 | Tri tableaux (étudiants + évaluations) | Faible |
| 3 | 15 | Séances + Évaluations formulaire | Modéré |
| 4 | 35 | Travaux : Productions + Grilles + Échelles + Pratiques | Modéré |
| 5 | 22 | Travaux : Matériel + Cartouches + Aide + Modales | Modéré |
| 6 | 65 | Réglages V2 complet + Préférences | Modéré |
| 7 | 37 | Wizards + Organisateur + Bibliothèque cours | Élevé |
| 8 | 5 | Modales import/export + reload | Faible |

**Phase 5** — ~620 onclick dans les fichiers JS (template literals) — multi-sessions
**Phase 6** — Politique CSP (après phases 2-5 complétées)

### Architecture de délégation (référence rapide)

```javascript
// Dispatcher dans main.js (DOMContentLoaded)
// Attributs : data-action, data-param, data-confirm, data-stop
// Supporte dot notation : data-action="Codex.actionOuvrir"
```

Conversion :
- `onclick="func()"` → `data-action="func"`
- `onclick="func('param')"` → `data-action="func" data-param="param"`
- `onclick="Codex.action()"` → `data-action="Codex.action"`

### Risques et vigilance

- **Ne pas reproduire l'erreur du sprint** : 1 lot à la fois, commit + test entre chaque
- **Ne pas modifier la logique métier** : seulement déplacer le câblage onclick → data-action
- Les wrappers sont dans `main.js` (lignes ~169-207), le dispatcher suit (~lignes 670-695)
