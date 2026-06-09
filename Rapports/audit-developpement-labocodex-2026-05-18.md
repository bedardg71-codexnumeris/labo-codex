# Audit de développement — Labo Codex avec Claude (version 2026-05-18)

**Première génération** : 14 avril 2026 (période 20 octobre 2025 → 12 avril 2026, 175 jours)
**Version courante** : 18 mai 2026 (période étendue : 20 octobre 2025 → 18 mai 2026, 211 jours)
**Objectif** : Documenter l'intensité, la répartition et l'évolution du développement jusqu'à l'accueil des novices (3 juin 2026)

> **Note de mise à jour (18 mai 2026)** : ce rapport est étendu pour intégrer la fenêtre 13 avril → 18 mai (36 jours), marquée par deux phases consécutives : (a) l'audit annuel complet (12-14 mai, axes 1-6), (b) le refactoring intensif des 5 god modules (15-18 mai). Les CSV originaux sont préservés et prolongés en continuité ; les totaux et phases sont actualisés. La période 1er-12 avril 2026 (qui était partielle dans la version initiale) est maintenant complète : avril 2026 totalise 449 commits sur 30 jours.

---

## 1. Vue d'ensemble

### 1.1 Totaux cumulés (20 octobre 2025 → 18 mai 2026)

| Métrique | Valeur |
|---|---|
| Commits totaux | **~3 033** |
| Sessions de travail estimées | **~371** |
| Heures estimées | **~806 h** |
| Jours actifs | ~175 / 211 (83 %) |
| Moyenne commits/jour actif | ~17,3 |
| Moyenne heures/jour actif | ~4,6 h |
| Fichiers JS distincts touchés | ~135 (sous-modules issus du refactoring inclus) |
| Versions beta traversées | Beta 1 → Beta 99.48 |

### 1.2 Période étendue seule (13 avril → 18 mai 2026, 36 jours)

| Métrique | Valeur |
|---|---|
| Commits | 686 |
| Sessions | 57 |
| Heures estimées | **~171,7 h** |
| Jours actifs | ~30 / 36 (83 %) |
| Moyenne commits/jour actif | ~22,9 |
| Moyenne heures/jour actif | ~5,7 h |
| Versions beta traversées | Beta 99.11 → Beta 99.48 |

Méthode d'estimation des heures : regroupement des commits en sessions (écart max de 2 h entre commits consécutifs), +15 min de queue par session. **Cohérente avec la méthode du rapport initial**.

### 1.3 Note méthodologique sur l'estimation des heures (ajoutée 18 mai 2026)

La méthode utilisée — groupement des commits en sessions si l'écart est inférieur à 2 h, plus 15 min de queue par session — capture le **temps git-actif**, pas le **temps de travail effectif sur Labo Codex**. Dans le contexte spécifique du projet, plusieurs conditions amplifient l'écart entre les deux.

**Multitâche pédagogique × développement parallèle.** Le mainteneur enseigne 8 h par semaine (lundi, mardi, jeudi) et évalue les productions de ses étudiants au fil du trimestre. Le compteur intégré à Labo Codex relève 341 évaluations cumulées depuis début avril 2026 (183 avec durée mesurée), à des moyennes de 4 à 11 minutes par production. Ces évaluations se font en parallèle des sessions Claude Code : pendant qu'un refactoring ou une fonctionnalité s'élabore en arrière-plan, le mainteneur évalue des copies, prépare un cours, ou rédige des contenus pédagogiques. La méthode git attribue ce temps à Labo Codex, alors que la charge cognitive est ailleurs.

**Discussions Cowork sur d'autres sujets.** Pendant que Claude Code commit, le mainteneur est fréquemment sur Cowork avec Claude pour des chroniques, des projets parallèles, ou des conversations sans rapport avec Labo Codex.

**Pauses techniques imposées.** Budget Anthropic épuisé en attente du renouvellement de quota, connexion lente aux serveurs Anthropic (parfois quelques Ko/s, particulièrement marqué depuis janvier-février 2026), approbations Claude Code en attente quand le mainteneur est absent de son poste. Toutes ces interruptions sont comptées comme du temps actif tant que l'écart entre commits reste inférieur à 2 h.

**Très peu de sessions nocturnes.** L'horaire de travail du mainteneur est 5h-20h, jamais la nuit. Les rares commits hors de cette fenêtre (environ 2 % du total) correspondent à des sessions Claude Code lancées en fin de journée et qui tournent pendant le sommeil.

Pour ces raisons, **les heures affichées dans ce rapport doivent être lues comme un proxy haut, pas comme une mesure du temps que le mainteneur a personnellement consacré**. Dans ce contexte, l'ordre de grandeur de la surestimation est probablement de **30 à 45 %**. Le temps de développement actif réel sur Labo Codex pour la période octobre 2025 → avril 2026 est plus vraisemblablement de l'ordre de **350 à 450 h** que de 634 h. Cela représente ~12-15 h par semaine en moyenne, soutenu sur 7 mois — engagement substantiel pour un enseignant à temps partiel, mais pas un temps plein déguisé.

**Ce qui reste informatif dans le rapport malgré cette imprécision** :

- L'**intensité relative entre périodes** (le pic de février 2026 reste significatif comparé à avril 2026, même après pondération).
- Les **jours pics** et leur contexte (audit annuel, refactorings ciblés, livraisons de fonctionnalités majeures).
- La **répartition par module** et le **churn** (qui ne dépendent pas de l'estimation des heures).
- La **continuité du travail** (jours actifs / jours calendaires).

**Ce qui doit être lu avec précaution** : les **valeurs absolues d'heures**, tant globales que par phase. Une mesure plus précise aurait demandé un outil de time tracking dédié (WakaTime, RescueTime ou équivalent) — choix conscient de ne pas en utiliser, le projet étant trop irrégulier dans son organisation pour qu'un tel outil soit pertinent.

---

## 2. Heures par mois

```csv
mois,heures,sessions,commits
2025-10,37.3,27,171
2025-11,79.1,57,343
2025-12,74.1,47,285
2026-01,104.6,58,432
2026-02,178.0,62,582
2026-03,104.8,40,308
2026-04,120.3,53,449
2026-05,107.0,26,463
```

> Mise à jour 2026-05-18 : la ligne 2026-04 est **recalculée pour le mois entier** (vs. partiel 12 jours dans la version initiale : 56,1 h → 120,3 h, 23 → 53 sessions, 226 → 449 commits). La ligne 2026-05 couvre 1er → 18 mai (partiel, ~58 % du mois écoulé).

### Phases de développement

| Phase | Période | Heures | Description |
|---|---|---|---|
| Fondation | Oct 2025 | 37 h | Architecture SPA, structure HTML, premiers modules. Marathon de 77 commits le 25 oct. |
| Construction | Nov 2025 | 79 h | Modules évaluations, travaux, productions, profils. Cœur fonctionnel. |
| Refactoring (legacy) | Déc 2025 | 74 h | 1,2 M lignes supprimées. Nettoyage legacy, modularisation. Pause Noël (22-25). |
| Accélération | Jan 2026 | 105 h | Pratiques de notation, Codex, indices A-C-P, import-export ZIP. Pause 11-18 jan. |
| Pic d'intensité | Fév 2026 | 178 h | RàI, dépistage SOLO, carte mentale, profils dynamiques. Record mensuel. |
| Consolidation 1 | Mars 2026 | 105 h | Audit complet (Tiers 0-7), CSS, SSOT, réorganisation navigation. Relâche 6-14. |
| Enrichissement | Avr 2026 | 120 h | Carrousel séquences, import/export MD, interventions, ajustements UI, sécurité (Défenses A à I, sandbox iframe, validation imports), chantier design system (passes 1-2). |
| Audit annuel | 12-14 mai 2026 | ~25 h | Audit technique complet sur 6 axes (conformité pédagogique, santé code, architecture, soutenabilité, sécurité, accessibilité), 25 sous-audits livrés. Identification de la dette structurelle (god modules) et confirmation des protections sécurité (CSP, échappement, sandbox). |
| Pivot Cowork + plans | 15 mai 2026 | ~6 h | Session Cowork : interprétation de l'audit, vérification factuelle des claims (bug `eval.productionId` confirmé, écarts identifiés), pivot du scope Phase 2 vers refactoring + accueil novices, rédaction des plans court terme, moyen terme, méthode de refactoring et cartographie des god modules. |
| Refactoring (god modules) | 15-18 mai 2026 | ~70 h | Refactoring des 5 god modules originels créés en oct-nov 2025 : `bilan-reflexif.js`, `productions.js`, `trimestre-v2.js`, `profil-etudiant.js`, `evaluation.js` (en cours au moment de cette mise à jour). 31 460 LOC cumulés → 32-33 sous-modules ciblés. Complexité cyclomatic max divisée par 2-3 dans les modules traités. Documenté dans `audit/refactoring-prep/METHODE-REFACTORING.md` et `MODULES-MAP.md`. |

### Note de phase — interprétation à 18 mai 2026

L'enchaînement « audit annuel → refactoring intensif » sur 7 jours (12-18 mai) marque une **phase de consolidation rétrospective** : les modules visés par le refactoring sont précisément ceux créés en octobre-novembre 2025 (`evaluation.js`, `productions.js`, `profil-etudiant.js`, `trimestre-v2.js`), donc les premiers fondations du projet. C'est une étape de réorganisation interne sans changement fonctionnel visible pour l'utilisateur, qui prépare la fenêtre d'accueil des premiers expérimentateurs (3 juin 2026). À ce stade, l'usage en production reste limité au mainteneur (Grégoire) : pas de testeurs externes actifs depuis fin février 2026, l'évaluation des fonctionnalités se fait par l'auteur avec des données réelles de classe (40 productions à évaluer en mai 2026).

---

## 3. Commits par semaine (pour courbe d'intensité)

```csv
semaine_debut,commits
2025-10-20,121
2025-10-27,68
2025-11-03,45
2025-11-10,101
2025-11-17,59
2025-11-24,120
2025-12-01,48
2025-12-08,49
2025-12-15,34
2025-12-22,83
2025-12-29,175
2026-01-05,132
2026-01-12,5
2026-01-19,102
2026-01-26,105
2026-02-02,120
2026-02-09,110
2026-02-16,175
2026-02-23,170
2026-03-02,64
2026-03-09,35
2026-03-16,75
2026-03-23,84
2026-03-30,166
2026-04-06,101
2026-04-13,90
2026-04-20,84
2026-04-27,85
2026-05-04,110
2026-05-11,282
2026-05-18,35
```

> Pic remarquable : semaine du 11 mai (282 commits) — l'audit annuel (12-14 mai, 213 commits sur 3 jours) puis le démarrage du refactoring (15 mai). C'est le **deuxième pic le plus élevé** du projet après la semaine du 29 décembre 2025 (175 commits — refactoring legacy).

---

## 4. Commits par jour (pour heatmap)

```csv
date,commits
2025-10-20,5
2025-10-21,2
2025-10-23,9
2025-10-24,24
2025-10-25,77
2025-10-26,4
2025-10-27,18
2025-10-28,6
2025-10-29,11
2025-10-30,15
2025-11-01,10
2025-11-02,8
2025-11-03,5
2025-11-04,14
2025-11-05,17
2025-11-07,1
2025-11-08,5
2025-11-09,3
2025-11-10,25
2025-11-12,16
2025-11-13,5
2025-11-14,26
2025-11-15,13
2025-11-16,16
2025-11-17,4
2025-11-18,26
2025-11-19,5
2025-11-20,8
2025-11-21,15
2025-11-23,1
2025-11-24,17
2025-11-25,14
2025-11-26,1
2025-11-27,34
2025-11-28,45
2025-11-29,9
2025-12-01,3
2025-12-02,11
2025-12-03,3
2025-12-05,1
2025-12-06,22
2025-12-07,8
2025-12-08,25
2025-12-09,10
2025-12-10,4
2025-12-11,1
2025-12-12,9
2025-12-15,4
2025-12-16,6
2025-12-17,11
2025-12-18,8
2025-12-19,4
2025-12-21,1
2025-12-22,14
2025-12-25,17
2025-12-26,9
2025-12-27,21
2025-12-28,22
2025-12-29,15
2025-12-30,28
2025-12-31,28
2026-01-01,7
2026-01-02,42
2026-01-03,41
2026-01-04,14
2026-01-05,11
2026-01-06,24
2026-01-08,24
2026-01-09,39
2026-01-10,29
2026-01-11,5
2026-01-18,5
2026-01-19,13
2026-01-20,17
2026-01-21,8
2026-01-22,5
2026-01-23,11
2026-01-24,11
2026-01-25,37
2026-01-26,2
2026-01-28,34
2026-01-29,8
2026-01-30,31
2026-01-31,14
2026-02-01,16
2026-02-03,1
2026-02-04,6
2026-02-05,3
2026-02-06,42
2026-02-07,21
2026-02-08,47
2026-02-09,9
2026-02-10,12
2026-02-11,23
2026-02-12,14
2026-02-13,10
2026-02-14,10
2026-02-15,32
2026-02-16,27
2026-02-17,26
2026-02-18,22
2026-02-19,3
2026-02-20,31
2026-02-21,38
2026-02-22,28
2026-02-23,27
2026-02-24,31
2026-02-25,12
2026-02-26,25
2026-02-27,43
2026-02-28,23
2026-03-01,9
2026-03-02,16
2026-03-03,7
2026-03-04,19
2026-03-05,19
2026-03-06,3
2026-03-14,25
2026-03-15,10
2026-03-16,13
2026-03-17,2
2026-03-18,33
2026-03-19,4
2026-03-20,5
2026-03-21,16
2026-03-22,2
2026-03-24,8
2026-03-25,23
2026-03-26,16
2026-03-27,20
2026-03-28,13
2026-03-29,4
2026-03-30,4
2026-03-31,37
2026-04-01,23
2026-04-02,50
2026-04-03,28
2026-04-04,16
2026-04-05,8
2026-04-06,23
2026-04-07,22
2026-04-08,4
2026-04-09,19
2026-04-11,24
2026-04-12,9
2026-04-14,2
2026-04-15,6
2026-04-16,15
2026-04-17,17
2026-04-18,34
2026-04-19,16
2026-04-20,17
2026-04-21,19
2026-04-22,25
2026-04-24,15
2026-04-25,1
2026-04-26,7
2026-04-28,16
2026-04-29,33
2026-05-01,10
2026-05-02,20
2026-05-03,6
2026-05-05,21
2026-05-06,22
2026-05-08,55
2026-05-09,8
2026-05-10,4
2026-05-11,20
2026-05-12,85
2026-05-13,42
2026-05-14,86
2026-05-15,16
2026-05-16,9
2026-05-17,24
2026-05-18,35
```

> Jours sans commit dans la période 13 avril → 18 mai (microcoupures, jamais > 2 jours consécutifs) : 13 avril, 23 avril, 27 avril, 30 avril, 4 mai, 7 mai. Pas de pause structurelle.

---

## 5. Répartition par module

### 5.1 Vue globale

```csv
module,commits,insertions,suppressions,net,refactor_pct
index.html (SPA),772,45128,38059,+7069,46
styles.css,487,29902,7712,+22190,21
Travaux/Productions,532,87050,59295,+27755,41
Documentation,484,140778,98545,+42233,41
Évaluations,295,178598,166764,+11834,48
Profils étudiants,229,227143,217887,+9256,49
Trimestre/Calendrier,200,54097,43935,+10162,45
Navigation/Config,152,55084,51160,+3924,48
Tableau de bord,146,92498,89066,+3432,49
Aide,126,16842,13994,+2848,45
RàI/Interventions,116,75188,70777,+4411,48
Présences,99,61530,59173,+2357,49
Codex/Import-Export,98,33126,22524,+10602,40
Graphiques,97,10324,5751,+4573,36
Planification/Carte,96,13911,7643,+6268,35
Indices (A-C-P),81,30110,26434,+3676,47
DB/Storage,36,7676,6447,+1229,46
Design System,15,2041,403,+1638,16
```

### 5.2 Par module par mois (commits)

```csv
module,2025-10,2025-11,2025-12,2026-01,2026-02,2026-03,2026-04,2026-05_partiel
index.html (SPA),0,0,125,231,286,80,50,~75
styles.css,23,65,15,75,191,62,56,~35
Travaux/Productions,16,30,18,41,238,117,72,~45
Évaluations,32,65,28,9,60,67,34,~30
Profils étudiants,32,69,33,18,27,27,23,~45
Trimestre/Calendrier,13,18,59,62,28,13,7,~40
Navigation/Config,15,32,23,14,37,21,10,~15
Tableau de bord,19,44,9,31,19,14,10,~5
Aide,6,1,3,10,68,19,19,~10
RàI/Interventions,9,37,14,13,22,8,13,~5
Présences,15,23,15,14,21,7,4,~3
Codex/Import-Export,9,15,8,25,19,18,4,~5
Graphiques,0,0,18,35,11,24,9,~3
Planification/Carte,0,1,2,2,68,6,17,~3
Indices (A-C-P),13,24,11,9,11,9,4,~3
DB/Storage,0,10,7,4,2,11,2,~2
Design System,0,0,0,3,11,0,1,~25
Documentation,19,55,58,151,123,47,31,~100
```

> **Note 2026-05** : les chiffres de mai sont **approximatifs (~)** parce que la classification des nouveaux dossiers et sous-modules issus du refactoring n'a pas été re-réalisée avec la même méthode que le rapport initial. Une cartographie précise demanderait un script de mapping fichier → catégorie qui sort du cadre de cette mise à jour. La ligne « Documentation » de mai inclut notamment `SESSION.md` (85 touches sur la période) et les documents méta de l'audit annuel (`audit/reports/*`, `audit/PLAN-*.md`, `audit/refactoring-prep/*`). La ligne « Design System » inclut le chantier `ds-update/2026-mai`.

### 5.3 Top fichiers touchés sur la période étendue (13 avril → 18 mai)

```csv
fichier,touches,commits_periode,interpretation
version.json,300,300,Bump build/version à chaque session — méta
js/init-inline.js,300,300,Compagnon de version.json — méta
index.html,243,243,Chargement des nouveaux sous-modules + ajustements UI
styles.css,99,99,Chantier design system ds-update passes 1-2-3
SESSION.md,85,85,Log des sessions audit et refactor — méta
BACKLOG.md,46,46,Mise à jour tâches reportées — méta
js/profil-etudiant.js,38,38,Module en cours de refactoring (god module 8 818 LOC)
js/trimestre-v2.js,36,36,Refactoring terminé (god module 6 584 LOC → 9 sous-modules)
js/travaux-ui.js,25,25,Ajustements UI + correction post-Défense I
js/productions.js,24,24,Refactoring terminé (god module 3 994 LOC → 4 sous-modules)
js/evaluation.js,23,23,Refactoring en cours (god module 7 348 LOC, le plus risqué)
js/bilan-reflexif.js,18,18,Refactoring terminé (god module 4 716 LOC → 8 sous-modules, pilote)
ds-update/SESSION.md,23,23,Log du chantier design system
design-system.html,19,19,Référence visuelle du chantier design system
js/cartouches.js,22,22,Ajustements et chantier cartouches
```

> Lecture : la concentration sur `version.json`/`init-inline.js`/`SESSION.md` (685 touches cumulées) reflète **l'overhead méta** d'un travail intensif en sessions courtes (chaque bump = 1 commit `version.json` + 1 commit `init-inline.js`). Les god modules en cours ou terminés de refactoring (`profil-etudiant`, `trimestre-v2`, `productions`, `evaluation`, `bilan-reflexif`) cumulent 139 touches — chacune correspond à une extraction de sous-module ou un ajustement post-extraction.

### 5.4 Nouveaux dossiers et catégories apparus dans la période

| Dossier / catégorie | Description | Apparition |
|---|---|---|
| `audit/` | Dossier de l'audit annuel 2026 (PROMPT, README, sous-dossiers par axe, reports avec 25 sous-audits, SUMMARY-internal/aqpc/institutional, PLAN-AQPC/COURT/MOYEN-TERME/PHASE-2-OVERVIEW) | mai 2026 |
| `audit/refactoring-prep/` | Cartographie + méthode de refactoring + scans structurels | 15 mai 2026 |
| `audit/reports/` | 25 sous-audits + synthèses globales | 12-14 mai 2026 |
| Sous-modules god modules | `bilan-reflexif-*.js` (8), `productions-*.js` (4), `trimestre-v2-*.js` (9), `profil-etudiant-*.js` (6+) | 15-18 mai 2026 |
| `tests/unit/refactor-*.test.js` | Tests Vitest dédiés au refactoring (10 pour bilan-reflexif, 80 cumulés pour profil-etudiant, etc.) | 15-18 mai 2026 |
| `js/utils-notifications.js` | Consolidation de helpers globaux multi-définis (axe 3 audit) | mai 2026 |
| Documents racine | `AUDIT.md` (transparence publique), bump de version régulier | mai 2026 |

---

## 6. Analyse de réécriture (churn)

Le churn mesure le code réécrit : min(insertions, suppressions). Un churn élevé indique des itérations importantes ou des refontes.

### 6.1 Fichiers les plus réécrits

```csv
fichier,touches,mois_actifs,insertions,suppressions,churn
index.html,772,5,45128,38059,38059
js/profil-etudiant.js,200,7,15985,6729,6729
styles.css,487,7,29902,7712,7712
js/travaux-ui.js,243,3,10566,3851,3851
js/evaluation.js,205,7,10848,3429,3429
js/graphiques-progression.js,87,5,7545,2999,2999
js/tableau-bord-apercu.js,122,7,5910,2478,2478
js/modes.js,64,7,3005,1824,1824
js/travaux-export-pdf.js,73,3,3833,1530,1530
js/productions.js,103,7,5387,1469,1469
js/saisie-presences.js,63,7,3424,1454,1454
js/cartouches.js,79,7,5182,1412,1412
js/echelles.js,81,7,5536,1415,1415
js/pratiques.js,71,7,6824,1406,1406
js/trimestre-v2.js,102,5,7766,1349,1349
js/grilles.js,86,7,5145,1205,1205
js/planification-carte.js,66,3,6251,1018,1018
js/import-export.js,62,7,3992,987,987
js/liste-evaluations.js,95,6,3658,932,932
js/travaux-outils.js,94,3,4173,879,879
```

### 6.2 Modules par taux de réécriture

```csv
module,refactor_pct,interpretation
Profils étudiants,49,Fortement itéré — portrait dynamique revu plusieurs fois
Tableau de bord,49,Aperçus et visualisations réajustés en continu
Présences,49,Saisie affinée au fil des retours terrain
RàI/Interventions,48,Module récent avec ajustements rapides
Navigation/Config,48,Réorganisation de la structure de navigation
Évaluations,48,Calculs et UI repris après tests utilisateurs
Indices (A-C-P),47,Formules ajustées itérativement
index.html (SPA),46,HTML remanié à chaque refonte de section
DB/Storage,46,Migration localStorage → IDB
Trimestre/Calendrier,45,Calendrier refondu (v1 → v2)
Aide,45,Contenu réorganisé avec la navigation
Travaux/Productions,41,Flux d'import de fichiers itéré
Documentation,41,Docs restructurés avec l'architecture
Codex/Import-Export,40,Fonctionnalité stabilisée assez tôt
Graphiques,36,Code majoritairement additif
Planification/Carte,35,Module récent, encore en croissance
styles.css,21,Surtout additif (+22K lignes nettes)
Design System,16,Référence stable, peu modifiée
```

### 6.3 Churn de la période 13 avril → 18 mai (top fichiers)

```csv
fichier,touches,insertions,suppressions,churn,interpretation
SESSION.md,85,8503,8277,8277,Log méta — réécritures permanentes (sessions audit + refactor)
js/profil-etudiant.js,38,9561,5987,5987,Refactoring en cours — extraction des sous-modules
index.html,243,4741,5504,4741,Ajout des balises script des nouveaux sous-modules + suppression des références obsolètes
js/evaluation.js,23,8174,4133,4133,Refactoring en cours — extraction (le plus risqué)
js/pratiques.js,14,7571,3845,3845,Chantier pratiques de notation
js/trimestre-v2.js,36,7427,6650,6650,Refactoring terminé — extraction des 9 sous-modules
styles.css,99,3521,3045,3045,Chantier design system ds-update passes 1-2-3
js/bilan-reflexif.js,18,2185,4867,2185,Refactoring terminé — code retiré (8 sous-modules extraits)
js/travaux-ui.js,25,7499,204,204,Insertions massives (chantier travaux), peu de suppressions (code additif)
js/productions.js,24,464,2149,464,Refactoring terminé — code retiré (4 sous-modules extraits)
```

> Lecture : pour les god modules en cours/terminés de refactoring, le churn élevé reflète **le déplacement de code**, pas une refonte fonctionnelle. Les insertions sont les nouveaux sous-modules, les suppressions sont l'original. Net négatif sur `bilan-reflexif.js` et `productions.js` (suppressions > insertions) = preuve que le découpage a été plus économe que la copie brute. Net positif sur `profil-etudiant.js`, `trimestre-v2.js`, `evaluation.js` = inclut les tests de régression écrits avant chaque refactoring + sous-modules en cours.

---

## 7. Rythme de travail

### 7.1 Par heure du jour (Toronto, ET)

```csv
heure,commits
0,5
1,2
2,3
3,3
4,6
5,38
6,116
7,181
8,221
9,245
10,164
11,172
12,173
13,176
14,142
15,144
16,109
17,70
18,67
19,110
20,119
21,48
22,11
23,22
```

Pattern : forte matinée (5h-14h), creux fin d'après-midi (17h-18h), reprise le soir (19h-20h).

### 7.2 Par jour de la semaine

```csv
jour,commits,sessions
lundi,280,45
mardi,304,39
mercredi,303,45
jeudi,294,45
vendredi,439,47
samedi,438,47
dimanche,289,46
```

Vendredi et samedi sont les jours les plus intenses (438-439 commits). Le travail est distribué sur 7 jours.

### 7.3 Distribution des durées de session

```csv
duree,sessions
< 30 min,105
30-60 min,36
1-2h,63
2-3h,41
3-4h,27
4h+,42
```

1/3 des sessions sont des micro-sessions (< 30 min) — corrections rapides, ajustements ciblés.
42 sessions de 4h+ — marathons de développement de fonctionnalités majeures.

### 7.4 Rythme spécifique à la période 13 avril → 18 mai

#### Par heure du jour (Toronto, ET)

```csv
heure,commits
02,3
04,7
05,18
06,62
07,70
08,44
09,50
10,40
11,53
12,51
13,52
14,38
15,43
16,29
17,24
18,32
19,42
20,23
21,1
22,4
```

Pattern proche du rapport initial : forte matinée (5h-13h cumule 460 commits sur 686, soit 67 %), reprise en soirée (18h-20h, 97 commits). Le couvre-feu naturel 21h-04h reste effectif.

#### Par jour de la semaine

```csv
jour,commits
lundi,72
mardi,143
mercredi,128
jeudi,101
vendredi,113
samedi,72
dimanche,57
```

**Inversion notable** par rapport au rapport initial où vendredi-samedi étaient les pics. Ici **mardi-mercredi-vendredi** dominent. L'audit annuel (12-14 mai, lundi-jeudi) a déplacé le centre de gravité de la semaine vers le milieu, et le refactoring des god modules (15-18 mai) a continué sur jeudi-vendredi-samedi-dimanche-lundi (week-end inclus pour `productions.js` et `trimestre-v2.js`).

#### Distribution des durées de session sur la période

```csv
duree,sessions
< 30 min,18
30-60 min,7
1-2h,5
2-3h,10
3-4h,3
4h+,14
```

**Polarisation** par rapport au rapport initial : 32 % de micro-sessions (< 30 min) et 25 % de marathons (4h+) sur la période, avec un creux relatif au milieu (1-2h : 9 %). Reflète la coexistence de deux modes de travail : (a) bumps de version, mises à jour de SESSION.md, corrections ponctuelles ; (b) longues sessions de refactoring (chaque god module = 4-8 h de session intensive).

---

## 8. Pauses et interruptions

```csv
debut_pause,fin_pause,jours,contexte_probable
2026-03-06,2026-03-14,8,Semaine de relâche
2026-01-11,2026-01-18,7,Pause mi-janvier
2025-12-22,2025-12-25,3,Vacances de Noël
2025-12-12,2025-12-15,3,Fin de session
```

**Période 13 avril → 18 mai** : aucune pause ≥ 3 jours. Six microcoupures de 1 jour (13 avril, 23 avril, 27 avril, 30 avril, 4 mai, 7 mai) — pas de pattern régulier identifiable. C'est la **période la plus continue** du projet, avec un rythme moyen de 22,9 commits/jour actif et 5,7 h/jour actif (vs. moyennes générales 17,3 et 4,6).

---

## 9. Jalons clés (top 10 jours les plus intenses)

### 9.1 Sur la durée complète du projet (oct 2025 → mai 2026)

```csv
date,commits,contexte
2026-05-14,86,Audit annuel — clôture axe 4 soutenabilité + ADR-008 corrigé
2026-05-12,85,Audit annuel — démarrage axes 1-3 (conformité + santé + architecture)
2025-10-25,77,Marathon de fondation — architecture initiale
2026-05-08,55,Défense I — 29 tests Vitest + Playwright pour la sécurité
2026-04-02,50,Consolidation complète (Tiers 0-7)
2026-02-08,47,RàI et dépistage SOLO
2026-02-27,43,Profils dynamiques et graphiques
2026-05-13,42,Audit annuel — axes 4-5 (soutenabilité + sécurité)
2026-02-06,42,Carte mentale planification
2026-01-02,42,Retour des fêtes — pratiques de notation
```

Note : la mise à jour 18 mai 2026 fait entrer 3 nouveaux pics dans le top 10 (14 mai, 12 mai, 8 mai), tous liés à la séquence audit annuel + Défense I. Ces 3 jours cumulent 226 commits, soit un tiers du volume de la période étendue.

### 9.2 Jalons spécifiques à la période 13 avril → 18 mai

```csv
date,commits,contexte
2026-05-14,86,Audit annuel — clôture axe 4 soutenabilité + ADR-008 corrigé
2026-05-12,85,Audit annuel — démarrage axes 1-3
2026-05-08,55,Défense I — tests automatisés Vitest + Playwright
2026-05-13,42,Audit annuel — axes 4-5
2026-05-18,35,Refactoring profil-etudiant.js (session D) — module 4/5 en cours
2026-04-18,34,Chantier UI / ajustements pré-audit
2026-04-29,33,Refactoring biblio + cartouches
2026-04-22,25,Sécurité — défenses A à H
2026-05-17,24,Refactoring profil-etudiant.js (sessions B-C) — modules helpers, calculs, rapport, diagnostics
2026-05-06,22,Préparation audit + tests de régression
```

---

## 10. Bilan partiel pré-AQPC (mise à jour 18 mai 2026)

### 10.1 Comparaison projection initiale vs réalisation à mi-parcours

Le rapport initial du 14 avril 2026 projetait ~250 h sur la période 13 avril → mi-juin (60 jours). Mesure à 18 mai (35 jours, ~58 % du temps écoulé) :

| Métrique | Projection initiale (avr→juin) | Réalisé 13 avr → 18 mai (35 j) | Reste pour 19 mai → 3 juin (16 j) |
|---|---|---|---|
| Heures | ~250 h | 171,7 h | ~50-70 h projeté |
| Commits | ~900 | 686 | ~200-300 projeté |
| Sessions | ~120 | 57 | ~25-40 projeté |

Lecture : **rythme tenu et même légèrement supérieur** à la projection. La projection supposait un ralentissement pré-lancement (tests, docs, polish) ; la réalité montre une intensification ponctuelle liée à l'audit annuel et au refactoring, avec un ralentissement à venir pendant la finalisation court terme (documentation publique : `README.md`, `PRIVACY.md`, `DEPLOY.md`, `INCIDENTS.md`).

### 10.2 Totaux cumulés au 18 mai 2026

| Métrique | Cumulé oct 2025 → 18 mai 2026 (211 jours) | Projeté cumulé fin juin |
|---|---|---|
| Heures (git-actives) | **~806 h** | ~860-880 h |
| Heures (actif réel estimé, cf. §1.3) | **~450-565 h** | ~480-615 h |
| Commits | **~3 033** | ~3 250-3 350 |
| Sessions | **~371** | ~400-415 |

> Rappel §1.3 : la mesure « heures git-actives » est un proxy haut. Le temps de développement effectif sur Labo Codex est plus vraisemblablement de l'ordre de 450-565 h cumulés au 18 mai 2026 (après application du discount 30-45 % identifié dans la note méthodologique). Les commits, sessions et jours actifs restent des mesures directes non biaisées.

La projection « ~885 h total » du rapport initial reste pertinente comme proxy. Ramenée en temps actif réel, elle correspondrait plutôt à ~485-620 h. On y est presque arrivé avec 16 jours d'avance par rapport au lancement supposé mi-juin — ce qui laisse de la marge pour le court terme (documentation publique, accessibilité ad hoc, vocabulaire UI, tests manuels d'accessibilité).

### 10.3 Lecture qualitative — phase de consolidation

L'enchaînement audit annuel (12-14 mai) → pivot Cowork (15 mai) → refactoring des god modules (15-18 mai) marque ce que l'on peut qualifier de **phase de consolidation rétrospective**, distincte des phases précédentes :

- Les phases « Fondation » à « Pic d'intensité » (oct 2025 → fév 2026) ont **créé** les modules fonctionnels.
- La phase « Consolidation 1 » (mars 2026) a fait un premier audit (Tiers 0-7) et une réorganisation de navigation.
- La phase « Enrichissement » (avr 2026) a complété les fonctionnalités et ajouté les défenses sécurité (A à I).
- La phase actuelle (mai 2026) **réorganise rétrospectivement les modules fondateurs** : les 5 god modules visés sont précisément ceux créés en octobre-novembre 2025, qui ont accumulé 7 mois de modifications successives. Le refactoring les redécoupe en 32-33 sous-modules de taille raisonnable (300 à 2 250 LOC chacun), sans changer leur comportement visible pour l'utilisateur.

Cette phase n'introduit pas de nouvelle fonctionnalité visible. Son utilité est entièrement structurelle :
- Préparer la maintenabilité par d'autres mainteneurs (allocation cégep automne 2026).
- Réduire le risque de régressions silencieuses comme le bug `eval.productionId` (typo de 1 caractère dans une fonction de 7 348 LOC, identifié par l'audit et corrigé).
- Documenter explicitement la dette technique pour ne pas la propager.

### 10.4 Contexte d'usage de la période

À 18 mai 2026, l'application Labo Codex reste **utilisée principalement par son auteur** :
- Pas de testeurs externes actifs depuis fin février 2026.
- Environ 50 personnes ont eu un accès Cloudflare Access entre janvier et mai 2026 ; aucune n'a renvoyé de feedback ou de rapport de bug, et aucune n'est revenue après l'expiration de leur accès d'une semaine.
- L'évaluation des fonctionnalités se fait par l'auteur avec des données réelles de classe : ~40 productions à évaluer en mai 2026, utilisées comme test de validation manuelle des refactorings.

L'accueil des premiers expérimentateurs est prévu **après la présentation AQPC du 3 juin 2026**. Cela explique l'inversion temporelle apparente — la consolidation structurelle a lieu **avant** l'usage à grande échelle, pour offrir aux premiers expérimentateurs un objet maintenable, documenté et défendable plutôt qu'un prototype accumulant 7 mois de dette technique.

### 10.5 Ce qui reste pour 19 mai → 3 juin (16 jours)

Pour atteindre la cible « app et dépôt présentables au 3 juin », il reste :

1. **Validation manuelle d'evaluation.js** (en cours au moment de cette mise à jour, ~3 h).
2. **Actions transverses moyen terme** (~8-12 h) : consolidation des helpers globaux, mise à jour `DATA-OWNERSHIP.md`, OpenSSF Scorecard (SECURITY.md, Dependabot, Branch Protection, GitHub Actions, CodeQL), hygiène licences résiduelle, retrait de doc opérationnelle obsolète.
3. **Court terme accueil novices** (~14 h) : `PRIVACY.md`, `INCIDENTS.md`, `INFO-ELEVES.md`, `DEPLOY.md`, `netlify.toml` versionné, refonte `README.md`, fixes accessibilité ad hoc (axe 6), alignement vocabulaire UI (T-L2 à T-L7), audit `rapportsBugArchives`.
4. **Tests manuels accessibilité par Grégoire** (~3,5 h) : 5 parcours clavier + VoiceOver Mac, 7 catégories iPad réel.
5. **Démarche externe** (effort ~30 min de rédaction, délai 2-6 semaines de réponse) : avis du responsable institutionnel de la protection des renseignements personnels du Cégep de Drummondville (Loi 25).

Total estimé : ~30-35 h sur 16 jours, soit ~2 h/jour. Réaliste à temps plein.

---

*Document destiné à être mis en graphiques. Les blocs CSV peuvent être importés directement. Toutes les valeurs sont sourcées de `git log` sur les branches `main`, `audit/2026-mai`, et les branches `refactor/<module>` actives au 18 mai 2026.*
