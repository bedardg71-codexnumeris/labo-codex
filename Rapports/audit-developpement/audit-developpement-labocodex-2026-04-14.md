# Audit de développement — Labo Codex avec Claude

**Généré le** : 14 avril 2026
**Période couverte** : 20 octobre 2025 → 12 avril 2026 (175 jours)
**Objectif** : Documenter l'intensité, la répartition et l'évolution du développement jusqu'au lancement (juin 2026)

---

## 1. Vue d'ensemble

| Métrique | Valeur |
|---|---|
| Commits totaux | 2 347 |
| Sessions de travail estimées | 314 |
| Heures estimées | **~634 h** |
| Jours actifs | 145 / 175 (82.9%) |
| Moyenne commits/jour actif | 16.2 |
| Moyenne heures/jour actif | 4.4 h |
| Fichiers JS distincts touchés | ~35 modules |
| Versions beta traversées | Beta 1 → Beta 99.11 |

Méthode d'estimation des heures : regroupement des commits en sessions (écart max de 2h entre commits consécutifs), +15 min de queue par session.

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
2026-04,56.1,23,226
```

### Phases de développement

| Phase | Période | Heures | Description |
|---|---|---|---|
| Fondation | Oct 2025 | 37 h | Architecture SPA, structure HTML, premiers modules. Marathon de 77 commits le 25 oct. |
| Construction | Nov 2025 | 79 h | Modules évaluations, travaux, productions, profils. Cœur fonctionnel. |
| Refactoring | Déc 2025 | 74 h | 1.2M lignes supprimées. Nettoyage legacy, modularisation. Pause Noël (22-25). |
| Accélération | Jan 2026 | 105 h | Pratiques de notation, Codex, indices A-C-P, import-export ZIP. Pause 11-18 jan. |
| Pic d'intensité | Fév 2026 | 178 h | RàI, dépistage SOLO, carte mentale, profils dynamiques. Record mensuel. |
| Consolidation | Mars 2026 | 105 h | Audit complet (Tiers 0-7), CSS, SSOT, réorganisation navigation. Relâche 6-14. |
| Enrichissement | Avr 2026 | 56 h* | Carrousel séquences, import/export MD, interventions, ajustements UI. *12 jours. |

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
```

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
```

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
module,2025-10,2025-11,2025-12,2026-01,2026-02,2026-03,2026-04
index.html (SPA),0,0,125,231,286,80,50
styles.css,23,65,15,75,191,62,56
Travaux/Productions,16,30,18,41,238,117,72
Évaluations,32,65,28,9,60,67,34
Profils étudiants,32,69,33,18,27,27,23
Trimestre/Calendrier,13,18,59,62,28,13,7
Navigation/Config,15,32,23,14,37,21,10
Tableau de bord,19,44,9,31,19,14,10
Aide,6,1,3,10,68,19,19
RàI/Interventions,9,37,14,13,22,8,13
Présences,15,23,15,14,21,7,4
Codex/Import-Export,9,15,8,25,19,18,4
Graphiques,0,0,18,35,11,24,9
Planification/Carte,0,1,2,2,68,6,17
Indices (A-C-P),13,24,11,9,11,9,4
DB/Storage,0,10,7,4,2,11,2
Design System,0,0,0,3,11,0,1
Documentation,19,55,58,151,123,47,31
```

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

---

## 8. Pauses et interruptions

```csv
debut_pause,fin_pause,jours,contexte_probable
2026-03-06,2026-03-14,8,Semaine de relâche
2026-01-11,2026-01-18,7,Pause mi-janvier
2025-12-22,2025-12-25,3,Vacances de Noël
2025-12-12,2025-12-15,3,Fin de session
```

---

## 9. Jalons clés (top 10 jours les plus intenses)

```csv
date,commits,contexte
2025-10-25,77,Marathon de fondation — architecture initiale
2026-04-02,50,Consolidation complète (Tiers 0-7)
2026-02-08,47,RàI et dépistage SOLO
2026-02-27,43,Profils dynamiques et graphiques
2026-01-02,42,Retour des fêtes — pratiques de notation
2026-02-06,42,Carte mentale planification
2026-01-03,41,Codex et indices A-C-P
2026-01-09,39,Import-export ZIP
2026-02-21,38,Graphiques progression
2026-01-25,37,Système de pratiques
```

---

## 10. Projections jusqu'au lancement (juin 2026)

| Métrique | Réalisé (oct→avr) | Projection (avr→juin) | Total estimé |
|---|---|---|---|
| Heures | 634 h | ~250 h | **~885 h** |
| Commits | 2 347 | ~900 | **~3 250** |
| Sessions | 314 | ~120 | **~435** |

Hypothèse : rythme de mars-avril (~80 h/mois) maintenu, avec ralentissement naturel pré-lancement (tests, docs, polish).

---

*Document destiné à être mis en graphiques par Cowork. Les blocs CSV peuvent être importés directement.*
