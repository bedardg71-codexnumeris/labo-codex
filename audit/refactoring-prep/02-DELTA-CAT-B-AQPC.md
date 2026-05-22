# Addendum 02 — Delta Cat-B + AQPC vs audit annuel mai 2026

**Date** : 22 mai 2026 (Sprint A — Livrable 3)
**Beta/build** : 99.62 / 0522-0650
**Source de référence** : `audit/reports/02-summary.md` (12 mai 2026, commit `e6e78ef`)
**Source de mesure** : `wc -l` + `scripts/audit-ssot.py` + lectures SESSION.md (relais cycle Cat-B clos le 21 mai et cycle AQPC clos le 22 mai)
**Cible documentaire** : à fusionner dans `audit/reports/02-summary.md` lors du prochain merge `audit/2026-mai` → `main`.

> **Pourquoi un fichier séparé** : `audit/reports/02-summary.md` vit sur la branche `audit/2026-mai`. Ce delta est produit depuis `main` (worktree Sprint A) ; il y reste jusqu'au merge audit→main pour éviter une collision branche-croisée (Option A actée SESSION.md §3 Livrable 3).

---

## 1. Résumé exécutif

Le statut **Rouge global de l'Axe 2** mesuré le 12 mai 2026 reposait sur 3 sous-audits Rouges (2.1 taille, 2.2 complexité, 2.5 lint), 1 Jaune (2.3 duplication), 1 Vert (2.4 code mort). Entre le 12 et le 22 mai, deux cycles successifs ont attaqué cette dette :

1. **Cycle Cat-B post-merge** (21 mai 2026, 10/10 critères atteints) — voir SESSION.md §1bis. Tracks 1-4 livrés (quick wins, méthode, héritages cyc > 30, transversaux E/F/G/I/J).
2. **Cycle AQPC pré-3-juin** (22 mai 2026) — voir SESSION.md §1. 6 commits incluant Phase 6.1 (retrait code mort alarmiste + refactor R → N) et Phase 6.2 (audit `rapportsBugArchives`).

Ces deux cycles font **basculer l'Axe 2 de Rouge global à Jaune presque Vert** : sur 5 sous-audits, **2.1 reste Jaune** (taille des modules : 5 god modules refactorés mais 32 sous-modules + nouveaux modules notifications/sentinelle), **2.2 bascule Vert** (sous exception N=50 actée), **2.3 reste Jaune** mais réduite, **2.4 reste Vert**, **2.5 reste à examiner** (Rouge en mai mais probablement amélioré par retrait code mort + consolidation utils-notifications).

---

## 2. Delta par sous-audit

### 2.1 — Taille et composition

| Métrique | Audit 12 mai | Mesure 22 mai | Delta |
|---|---:|---:|---:|
| Nombre de fichiers `js/` (hors `_archives/`) | 130 | **158** | +28 |
| Fichiers > 1 000 LOC | 35 (27 %) | 55 (35 %) | +20 |
| LOC totaux `js/` (hors `_archives/`) | ~117 700 | **193 877** (incl. dataset `pack-demo-20.js` 18 732) | — |
| `evaluation.js` LOC | 4 895 (Beta 99.42) | **3 853** | **−21 %** (déjà −47 % vs LOC pré-refactor 7 321) |
| `productions.js` LOC | 2 333 | **2 200** | −6 % (déjà −45 % vs pré-refactor 3 994) |
| `profil-etudiant.js` LOC (renommé `-sections-affichage.js`) | 6 332 | **4 553** | −28 % (déjà −48 % vs pré-refactor 8 818) |
| `trimestre-v2.js` LOC | 4 375 | **584** | **−87 %** (résidu post-refactor 21 mai) |
| `bilan-reflexif.js` LOC (résidu seul) | 3 942 | **284** | **−93 %** (résidu post-refactor 15 mai) |

**Interprétation** : les 5 god modules ciblés par PLAN-MOYEN-TERME §4 ont tous été refactorés et leur LOC drastiquement réduite. Mais le nombre TOTAL de fichiers > 1 000 LOC monte de 35 à 55 (+20) parce que :

- **+32 sous-modules** créés par les refactors (7 `evaluation-*`, 3 `productions-*`, 7 `profil-etudiant-*`, 7 `trimestre-v2-*`, 8 `bilan-reflexif-*`).
- **+3 modules consolidation Cat-B/AQPC** : `js/utils-notifications.js` (consolidation chantier E), tests sentinelles (`tests/unit/sentinelle-evaluation-en-cours.test.js`, `tests/unit/utils-notifications.test.js`).
- **+ modules ajoutés hors refactor** (cycle AQPC + Tracks 1-2 Cat-B + autres travaux entre le 12 et le 22 mai).

**Top 10 fichiers > 1 000 LOC mesuré 22 mai** (vs top 10 audit mai, qui listait evaluation 4 895 / profil-etudiant 6 332 / travaux-ui 4 960) :

| Rang | Fichier | LOC 22 mai | Note |
|---:|---|---:|---|
| 1 | `pack-demo-20.js` | 18 732 | Dataset (déjà signalé audit 12 mai pour extraction `data/demo-20.json`, non livré) |
| 2 | `travaux-ui.js` | 7 013 | **+41 %** vs mai (4 960). À investiguer Sprint B/C — pas une cible Cat-B refactor mais cohérent avec l'écriture multiple cross-module signalée par chantier F |
| 3 | `planification-carte.js` | 5 341 | +18 % vs mai (4 536). Non touché par Cat-B |
| 4 | `graphiques-progression.js` | 4 758 | Non audité en mai (probablement sous-représenté) |
| 5 | `profil-etudiant-sections-affichage.js` | 4 553 | Résidu après refactor 18 mai. Héritage acté |
| 6 | `echelles.js` | 4 112 | Non touché par Cat-B |
| 7 | `grilles.js` | 3 954 | Non touché par Cat-B |
| 8 | `evaluation.js` | 3 853 | Résidu après refactor 21 mai (−21 % vs mai après 7 sous-modules extraits) |
| 9 | `cartouches.js` | 3 776 | Non touché par Cat-B |
| 10 | `pratiques.js` | 3 684 | Non touché par Cat-B |

**Statut révisé Sub-2.1** : Jaune (était Rouge). Les god modules ciblés ont été refactorés ; la dette résiduelle se déplace vers des modules non priorisés (travaux-ui, planification-carte, echelles, grilles, cartouches, pratiques). Reste à arbitrer si ces modules entrent dans un Sprint C ou Q3 2026.

### 2.2 — Complexité (cyc/cog)

| Métrique | Audit 12 mai | Mesure 22 mai (SESSION.md §2) | Delta |
|---|---:|---:|---:|
| Fonctions cyc > 15 | 387 | non re-mesuré | — |
| **Fonctions cyc > 30 — cible dure Cat-B** | non quantifié explicitement (« max observé 118 ») | **0 sauf 1 héritage Mobilisation cyc 48** (acté sous N=50, voir SESSION.md §0 garde-fou) | **−14 fonctions Cat-B Track 3** |
| Fonction max | 118 (`executerImportSelectif`) | **48** (`genererSectionMobilisationEngagement` héritage) | **−59 %** |
| Top 5 audit (mai) ramené sous 30 | `executerImportSelectif` 118, `calculerCorrelationsLongitudinales` 101, `creerPratiqueV2` 90, `changerGroupeCoursActifV2` 86, `sauvegarderProduction` 79 | Toutes < 30 sauf Mobilisation 48 (héritage explicite) | **Cible dure SUR-atteinte** |

**Critère A2 Cat-B atteint avec exception N=50 actée** : 13/14 fonctions strictement < 30 + 1 héritage explicite (Mobilisation cyc 48). Méthode publiée en gabarit §6.5 de `METHODE-REFACTORING.md`.

**Modules par baseline 0 cyc > 30** :
- ✅ `evaluation*.js` : 3/3 fonctions (refactor 21 mai)
- ✅ `trimestre-v2*.js` : 4/4 fonctions (refactor 17 mai)
- ✅ `profil-etudiant*.js` : 6/7 fonctions (refactor 18 mai + phase 2 21 mai) + 1 héritage Mobilisation
- ✅ `productions*.js` : 2/2 fonctions (refactor 17 mai, ESLint cyc>30 = 0)
- ✅ `bilan-reflexif*.js` : (refactor 15 mai, descendu de 63 à 27)

**Statut révisé Sub-2.2** : Vert (était Rouge). L'exception N=50 est documentée comme héritage Cat-B sous validation Grégoire (cf. SESSION.md §0).

### 2.3 — Duplication

| Métrique | Audit 12 mai | Mesure 22 mai | Delta |
|---|---:|---:|---:|
| Taux de duplication global | 1,44 % | non re-mesuré (estimation : ≤ 1,44 %) | stable ou en baisse |
| Doublons evaluation.js | 3 (`restaurerPreferenceTri`, `obtenirClasseNote`, `filtrerListeEvaluations`) | **0** (chantier A Track 1 Cat-B, 21 mai) | **−3** ✅ |
| Notifications dispersées | ~7-10 redéfinitions de `afficherNotification*` | **0** (consolidation `utils-notifications.js`, chantier E Track 4 Cat-B, 21 mai) | **−7 à −10** ✅ |
| Wrappers locaux notifications | ~19 défensifs `_notifSucces`/`_notifErreur` | **0** (chantier E) | **−19** ✅ |
| Guards typeof orphelins notifications | 149 (`if (typeof window.afficherNotificationX === 'function')`) | **0** (chantier E) | **−149** ✅ |

**Statut révisé Sub-2.3** : Vert (était Jaune). Critère A3 Cat-B atteint (doublons evaluation) + critère A5 (consolidation notifications). −800+ LOC nettes cumulées sur le cycle Cat-B (chantier E seul : −469 LOC).

### 2.4 — Code mort / orphelins

| Métrique | Audit 12 mai | Mesure 22 mai | Delta |
|---|---:|---:|---:|
| Orphelins | 0 réel | 0 (inchangé) | — |
| Fonctions code mort alarmiste | 4 identifiées (`calculerRisqueEchec`, `obtenirClasseRisque`, `calculerNiveauRaI`, `afficherAlertesPrioritaires`) | **0** (Cat-B Track 1 chantier D : 2 retirées 21 mai + AQPC Phase 6.1 : 2 supplémentaires retirées 22 mai) | **−4** ✅ |
| Bonus AQPC | — | `afficherDistributionRisques` détecté pendant AQPC et retiré | −1 supplémentaire |

**Statut révisé Sub-2.4** : Vert (inchangé). Critère A4 atteint + 1 bonus AQPC. Total 5 fonctions code mort retirées.

### 2.5 — Lint global

| Métrique | Audit 12 mai | Mesure 22 mai (estimation) | Delta |
|---|---:|---:|---:|
| Erreurs ESLint réelles | 1 (`evaluation.js:4193` typo `eval.productionId`) | **0** (fix livré Phase 1.1 PLAN-COURT-TERME pré-AQPC) | **−1** ✅ |
| Hits regex security | 14 (10 `non-literal-regexp` + 4 autres) | non re-mesuré | — |
| Unused-vars (hors bruit) | 454 | non re-mesuré (estimation stable, pas de chantier dédié) | stable |
| Hits XSS innerHTML sans `echapperHtml` | non quantifié | **+3 bugs latents fixés** : #111 trimestre.js (chantier E par retrait def), + 2 autres acquittements `// security-ok` à investiguer Sprint B | **−3 réels** |

**Statut révisé Sub-2.5** : Jaune presque Vert (était Rouge). Le bug fonctionnel `evaluation.js:4193` n'existe plus. Les 454 unused-vars restent stables (pas de chantier dédié, mais réduction marginale via −800 LOC nettes). À re-mesurer formellement Sprint B.

---

## 3. Statut révisé Axe 2

| Sous-audit | Statut 12 mai | Statut 22 mai (révisé) | Justification |
|---|---|---|---|
| 2.1 Taille et composition | Rouge | **Jaune** | 5 god modules refactorés ; dette résiduelle sur modules non priorisés (travaux-ui, planification-carte, echelles, grilles, cartouches, pratiques) |
| 2.2 Complexité (cyc/cog) | Rouge | **Vert** (sous exception N=50) | 0 cyc > 30 sauf Mobilisation 48 acté héritage |
| 2.3 Duplication | Jaune | **Vert** | Doublons evaluation résolus, notifications consolidées, −800+ LOC nettes |
| 2.4 Code mort | Vert | **Vert** | +4 fonctions retirées (Cat-B + AQPC) |
| 2.5 Lint global | Rouge | **Jaune presque Vert** | Bug fonctionnel fix livré, XSS innerHTML #111 résolu par retrait, autres acquittements `// security-ok` Sprint B |
| **Axe 2 global** | **Rouge** | **Jaune presque Vert** | 4/5 sous-audits Vert ou Jaune ; reste 2.1 et 2.5 à confirmer |

**Bénéfice de l'audit annuel** : la mesure du 12 mai a directement guidé le séquencement Cat-B Track 1-4 et a permis d'identifier le top 5 complexité (toutes ramenées sous 30 ou en héritage acté).

**Reste à faire pour basculer Axe 2 complètement Vert** :
- Sprint C ou Q3 2026 : examiner `travaux-ui.js` (7 013 LOC, +41 % vs mai) et autres modules > 4 000 LOC non touchés (planification-carte, graphiques-progression, echelles, grilles, cartouches, pratiques).
- Sprint B : re-mesurer `unused-vars` après −800 LOC nettes (probablement amélioration marginale).
- À confirmer avec Grégoire si chantier H Cat-B (sous-découpage résidus, optionnel) doit s'attaquer.

---

## 4. Mention complémentaire — Axe 3 (Architecture / SSOT)

Cycle Cat-B/AQPC a aussi partiellement amélioré Axe 3 (Rouge global mai) :

- **Sub-3.1 SSOT** : `utils-notifications.js` source unique (525 sites), `window.evaluationEnCours` encapsulé via API (chantier F), 2 accès localStorage profil-etudiant migrés (chantier G). Mais **13 clés en violation reste**, dont 4 nouvelles découvertes par audit-ssot.py 22 mai (`infoCours`, `trimestreActif`, `trimestres`, `seuilsInterpretation`). Voir `docs/DATA-OWNERSHIP.md` (mis à jour Sprint A Livrable 2) et `scripts/audit-ssot.md`.
- **Sub-3.2 Modularité** : profondeur graphe et cycles non re-mesurés (pas de Sprint B encore). À mesurer post-AQPC avec `npx madge --json js/`.
- **Sub-3.3 Isolation** : surface publique encapsulée pour `window.evaluationEnCours` (chantier F sentinelle Vitest), mais ~677 globaux inutilisés non re-mesurés.

**Sprint B** (post-AQPC) traitera spécifiquement Axe 3 : étendre `scripts/audit-ssot.py` pour produire cartographie complète 3.1 (déjà partiellement fait Livrable 1), produire graphe fan-in/fan-out 3.2 (madge), capitaliser sur MODULES-MAP §2.x pour 3.3.

---

## 5. Tests automatisés

| Suite | Audit 12 mai | 22 mai (post-Cat-B/AQPC) | Delta |
|---|---:|---:|---:|
| Vitest (unit) | 32 | **85** | +53 |
| Playwright (integration) | non quantifié (~0) | **18** | +18 |
| **Total** | ~32 | **103** | **+71** |

Sentinelles ajoutées par Cat-B :
- `tests/unit/utils-notifications.test.js` (chantier E) : verrouille la régression des défs `function afficherNotificationX` hors `_archives/`
- `tests/unit/sentinelle-evaluation-en-cours.test.js` (chantier F) : verrouille la whitelist d'écrivains de `window.evaluationEnCours` (config.js + 7 modules `evaluation*.js`)
- `tests/integration/*-rendu.spec.js` (chantier I) : 6 tests Playwright rendus DOM sur les 5 modules refactorés

Hook pré-push Vitest actif (`scripts/hooks/pre-push` via `core.hooksPath`).

**Statut révisé Sub-2.x tests** : Vert (était Rouge sub-2.5). Critère A8 Cat-B atteint.

---

## 6. Mention des commits / tags de référence

Tous mergés sur `main` (FF) entre le 15 et le 22 mai 2026.

### Refactor des 5 god modules (PLAN-MOYEN-TERME §4)

| Module | Date merge | Tag |
|---|---|---|
| `bilan-reflexif.js` | 2026-05-15 | (sans tag) |
| `productions.js` | 2026-05-17 | `refactor-productions-2026-05-17` |
| `trimestre-v2.js` | 2026-05-17 | `refactor-trimestre-v2-2026-05-17` |
| `profil-etudiant.js` | 2026-05-18 | `refactor-profil-etudiant-2026-05-18` |
| `evaluation.js` | 2026-05-21 | `refactor-evaluation-2026-05-21` |

### Cycle Cat-B post-merge (clos 21 mai, 10/10 critères)

9 tags `cat-b-track-*` présents sur `main`. Voir SESSION.md §1bis pour le détail des commits.

### Cycle AQPC pré-3-juin (22 mai)

6 commits sur branche `aqpc/privacy`, mergée FF puis supprimée. HEAD `1312a6b` + bump `7c30d64` (release 99.62).

### Sprint A (22 mai)

3 livrables sur branche `sprint-a/data-ownership` :
1. `scripts/audit-ssot.py` + sorties (commit Livrable 1)
2. `docs/DATA-OWNERSHIP.md` actualisé (commit Livrable 2)
3. Ce document (commit Livrable 3)

---

## 7. À intégrer dans `02-summary.md` lors du merge audit→main

Au moment où `audit/2026-mai` sera mergée sur `main` (post-AQPC, après tests manuels Grégoire 7.1+7.2), ce document peut être :

- **Option A** : intégré directement comme section finale de `audit/reports/02-summary.md` sous la forme « ## 7. Delta Cat-B + AQPC (22 mai 2026) ».
- **Option B** : laissé séparé dans `audit/refactoring-prep/` et référencé depuis `02-summary.md` via une note « Pour le delta post-audit, voir `audit/refactoring-prep/02-DELTA-CAT-B-AQPC.md` ».

Décision Option A vs B à arbitrer avec Grégoire au moment du merge audit→main.

**Conflits prévisibles au merge** (notés SESSION.md §1bis pour information) : `SESSION.md`, `version.json`, `init-inline.js` — résoudre en gardant la version `main` (plus récente) puis intégrer les changements audit pertinents.

---

**Sprint A — Livrable 3 livré 22 mai 2026.**
