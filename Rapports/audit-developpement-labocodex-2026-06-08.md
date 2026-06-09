# Audit de développement — Labo Codex avec Claude (version 2026-06-08)

**Première génération** : 14 avril 2026 (période 20 octobre 2025 → 12 avril 2026, 175 jours)
**Version précédente** : 18 mai 2026 (période 20 octobre 2025 → 18 mai 2026, 211 jours)
**Version courante** : 8 juin 2026 (période 20 octobre 2025 → 8 juin 2026, **232 jours**)
**Objectif** : documenter l'intensité, la répartition et l'évolution du développement, **désormais de part et d'autre du lancement public** (présentation AQPC + bêta publique 1.0.0, 3 juin 2026).

> **Note de mise à jour (8 juin 2026)** : ce rapport prolonge celui du 18 mai en intégrant la fenêtre 19 mai → 8 juin (21 jours). Cette fenêtre couvre trois temps distincts : (a) la **clôture de la consolidation** (refactoring du dernier god module `evaluation.js`, transverse notifications/vocabulaire, hygiène GitHub, documentation de conformité, 19-25 mai) ; (b) la **préparation et le lancement public** au congrès de l'AQPC (déploiement Cloudflare/Netlify le 31 mai, release 1.0.0 le 3 juin) ; (c) la **première vague de correctifs et de fonctionnalités tirée par des retours terrain réels** (5-8 juin). Les CSV des rapports précédents sont préservés et prolongés. Le mois de mai 2026, partiel dans la version précédente (1-18 mai), est ici **complet** : 734 commits, ~184 h — **nouveau record mensuel du projet**, en commits comme en heures.
>
> **Continuité méthodologique** : les totaux sont recalculés par la même méthode que les deux rapports antérieurs (commits dédupliqués sur l'ensemble des branches, regroupement en sessions si l'écart est < 2 h, +15 min de queue par session). La réconciliation au 18 mai donne 3 048 commits / 815 h (rapport précédent : ~3 033 / ~806) — écart < 1 %, attribuable à la suppression de branches éphémères depuis lors. Voir §1.4.

---

## 1. Vue d'ensemble

### 1.1 Totaux cumulés (20 octobre 2025 → 8 juin 2026)

| Métrique | Valeur |
|---|---|
| Commits totaux | **~3 505** |
| Sessions de travail estimées | **~422** |
| Heures estimées (git-actives) | **~939 h** |
| Heures estimées (actif réel, cf. §1.3) | **~515-660 h** |
| Jours actifs | ~196 / 232 (84,5 %) |
| Moyenne commits/jour actif | ~17,9 |
| Moyenne heures/jour actif | ~4,8 h |
| Modules JS (`js/`, état actuel) | **164** (146 à la racine de `js/` + 18 en sous-dossiers ; dont 4 packs de démo) |
| Lignes de code (cloc, état actuel) | **JS ~137 000** · HTML ~13 200 · CSS ~21 000 (cf. §11.4) |
| Suite de tests (état actuel) | **~395 verts** (≈353 Vitest + ≈42 Playwright WebKit), 55 fichiers de test |
| Versions traversées | Beta 1 → Beta 99.x → **1.0.0 → 1.4.2** (bascule SemVer au lancement) |

### 1.2 Période étendue seule (19 mai → 8 juin 2026, 21 jours)

| Métrique | Valeur |
|---|---|
| Commits | 457 |
| Sessions | 52 |
| Heures estimées (git-actives) | **~124 h** |
| Heures estimées (actif réel) | **~68-87 h** |
| Jours actifs | **21 / 21 (100 %)** — aucun jour sans commit |
| Moyenne commits/jour actif | ~21,8 |
| Moyenne heures/jour actif | ~5,9 h |
| Versions traversées | Beta 99.x → 1.0.0 → 1.4.2 |

> **Fait marquant** : pour la première fois du projet, la fenêtre ne contient **aucun jour sans commit**. Les 21 jours sont actifs, à un rythme moyen (5,9 h git-actives/jour) supérieur à la moyenne générale (4,8 h). C'est le prolongement direct de la « période la plus continue » déjà notée au 18 mai — l'intensité ne retombe pas après le lancement, elle se reconfigure (cf. §11).

### 1.3 Note méthodologique sur l'estimation des heures (reconduite du 18 mai)

La méthode capture le **temps git-actif**, pas le **temps de travail effectif sur Labo Codex**. Les conditions amplifiant l'écart, déjà documentées, restent valables : multitâche pédagogique × développement parallèle (le mainteneur enseigne et évalue des copies pendant que les sessions Claude Code tournent), discussions Cowork sur d'autres sujets, pauses techniques (quota Anthropic, lenteurs réseau, approbations en attente), quasi-absence de sessions nocturnes (horaire 5 h-20 h). **Les heures git-actives sont un proxy haut** ; l'ordre de grandeur de la surestimation reste estimé à **30-45 %**. Le temps de développement actif réel cumulé au 8 juin est donc plus vraisemblablement de l'ordre de **515-660 h** que de 939 h.

Pour la fenêtre 19 mai → 8 juin, une **circonstance nouvelle accentue le biais** : la semaine du 1er juin a été en partie consacrée à la **préparation et à la tenue de la présentation AQPC** (3 juin), travail réel mais non capté par git. À l'inverse, certaines sessions de cette fenêtre sont des **séances Cowork de conception** (DEN, axe D, refonte de l'assistant) dont la trace git est mince (quelques commits de documentation) au regard de la charge cognitive. Les valeurs absolues d'heures de la fenêtre sont donc à lire avec d'autant plus de prudence. (À noter : aucun temps de coordination avec des utilisateurs externes n'entre encore en jeu — le mainteneur reste seul, cf. §11.)

Restent informatifs sans réserve : l'intensité relative entre périodes, les jours pics et leur contexte, la répartition par module, le churn, et la continuité du travail (jours actifs / jours calendaires).

### 1.4 Note sur le comptage des commits (ajoutée 8 juin 2026)

Les branches de refactoring (`refactor/<module>`) actives au 18 mai ont depuis été **mergées sur `main` puis supprimées**. Le comptage « commits dédupliqués sur l'ensemble des branches » reste la base de continuité avec les deux rapports précédents, mais il faut savoir que :

- Sur `main` seul, le cumul au 8 juin est de **3 269 commits** (mesure « ce qui est dans le produit livré »).
- Le comptage multi-branches dédupliqué donne **3 505** (inclut le travail de branches éphémères, d'essais et de revue non intégralement reflété dans l'historique linéaire de `main`, notamment à cause de squash-merges).

L'écart (~236) est la **trace des branches de travail** qui ont existé puis été consolidées ou abandonnées. Aucune des deux mesures n'est « fausse » : la première répond à « qu'est-ce qui est livré ? », la seconde à « combien de travail a été produit ? ». Ce rapport conserve la seconde pour la comparabilité historique, en signalant la première ici.

---

## 2. Heures par mois

```csv
mois,heures,sessions,commits,jours_actifs
2025-10,37.3,22,171,10
2025-11,81.9,54,357,26
2025-12,74.1,45,285,25
2026-01,104.6,56,432,23
2026-02,180.1,62,584,27
2026-03,109.5,52,313,23
2026-04,120.4,52,448,25
2026-05,183.6,63,734,29
2026-06,47.9,16,181,8
```

> Mise à jour 2026-06-08 : la ligne **2026-05 est désormais complète** (vs. partiel 1-18 mai dans la version précédente : 107 h / 463 commits → **183,6 h / 734 commits**). Mai 2026 devient le **mois record du projet** sur les deux axes, devançant février 2026 (180,1 h / 584 commits). La ligne **2026-06** couvre 1er → 8 juin (8 jours, partiel). Les légères variations sur les mois antérieurs (nov, fév, mars) par rapport au rapport du 18 mai (≤ 5 h) viennent de la suppression de branches éphémères depuis lors (cf. §1.4) ; elles ne changent aucune lecture.

### Phases de développement (actualisé)

| Phase | Période | Heures | Description |
|---|---|---|---|
| Fondation | Oct 2025 | 37 h | Architecture SPA, structure HTML, premiers modules. Marathon de 77 commits le 25 oct. |
| Construction | Nov 2025 | 82 h | Modules évaluations, travaux, productions, profils. Cœur fonctionnel. |
| Refactoring (legacy) | Déc 2025 | 74 h | 1,2 M lignes supprimées. Nettoyage legacy, modularisation. Pause Noël (22-25). |
| Accélération | Jan 2026 | 105 h | Pratiques de notation, Codex, indices A-C-P, import-export ZIP. Pause 11-18 jan. |
| Pic d'intensité | Fév 2026 | 180 h | RàI, dépistage SOLO, carte mentale, profils dynamiques. |
| Consolidation 1 | Mars 2026 | 110 h | Audit complet (Tiers 0-7), CSS, SSOT, réorganisation navigation. Relâche 6-14. |
| Enrichissement | Avr 2026 | 120 h | Carrousel séquences, import/export MD, interventions, sécurité (Défenses A à I), design system. |
| Consolidation rétrospective | 12 mai-25 mai 2026 | ~110 h | Audit annuel (6 axes, 25 sous-audits), refactoring des 5 god modules, transverse (consolidation notifications `utils-notifications.js`, nettoyage vocabulaire alarmiste), hygiène GitHub/OpenSSF, documentation publique de conformité. |
| Mise en orbite (lancement) | 26 mai-3 juin 2026 | ~75 h | Déploiement Cloudflare/Netlify (31 mai, `app.codexnumeris.org`), finalisation 1.0.0, préparation AQPC, **bascule SemVer**, **release publique 1.0.0 (3 juin)**. |
| Itération post-lancement | 4-8 juin 2026 | ~40 h | Première vague tirée par les retours terrain : guides pédagogiques (1.1), Comparateur de pratiques + refonte assistant (1.2), Dénotation (1.3), bouton Soutien (1.4), correctifs (1.2.3 → 1.4.2). |

### Note de phase — interprétation à 8 juin 2026

Le **3 juin 2026 est le point de bascule du projet**, à la fois symbolique et mesurable — mais une bascule **structurelle, pas (encore) d'audience**. Avant : un développement orienté vers la consolidation interne. Après : un produit déployé publiquement, versionné en sémantique, prêt à recevoir des tiers. L'usage, lui, reste **mono-utilisateur** : le mainteneur teste avec ses données réelles de classe et reste le seul à détecter les bugs (cf. §11.1). Les phases « Consolidation rétrospective » (avant) et « Itération post-lancement » (après) ne diffèrent donc pas par leur audience ni par leur intensité — toutes deux élevées — mais par leur **source d'impulsion** : du plan d'audit interne vers le retour terrain du mainteneur en usage de production.

---

## 3. Commits par semaine (pour courbe d'intensité)

```csv
semaine_debut,commits
2026-04-13,89
2026-04-20,84
2026-04-27,85
2026-05-04,103
2026-05-11,284
2026-05-18,147
2026-05-25,164
2026-06-01,158
2026-06-08,23
```

> La semaine du **11 mai (284 commits)** reste le pic absolu du projet (audit annuel + démarrage refactoring), suivie de trois semaines soutenues (147, 164, 158) qui couvrent la fin du refactoring, le déploiement et le lancement. La semaine du 8 juin (23 commits) est partielle (1 seul jour : le 8). Aucune décrue marquée après le lancement du 3 juin : la semaine du 1er juin (158) reste dans le tiers supérieur de l'historique.

---

## 4. Commits par jour (fenêtre 19 mai → 8 juin, pour heatmap)

```csv
date,commits
2026-05-19,1
2026-05-20,2
2026-05-21,45
2026-05-22,37
2026-05-23,7
2026-05-24,20
2026-05-25,31
2026-05-26,23
2026-05-27,26
2026-05-28,40
2026-05-29,17
2026-05-30,16
2026-05-31,11
2026-06-01,1
2026-06-02,36
2026-06-03,21
2026-06-04,49
2026-06-05,12
2026-06-06,16
2026-06-07,23
2026-06-08,23
```

> Deux creux notables coïncident avec du travail non-git : le **19-20 mai** (validation manuelle d'`evaluation.js`, peu de commits) et le **1er juin** (1 commit — préparation de la présentation AQPC). Le pic du **4 juin (49 commits)** est le lendemain du lancement : première salve de correctifs et de fonctionnalités post-retours. Le 3 juin lui-même (21 commits) inclut la release 1.0.0 (horodatée juste après minuit, clôture de la session AQPC).

---

## 5. Répartition par module

### 5.1 Vue globale (snapshot cumulatif — reconduit)

> Le tableau global cumulé par module n'est **pas recalculé** dans cette mise à jour (il l'était déjà à l'identique entre les rapports du 14 avril et du 18 mai : une cartographie fichier → catégorie complète sort du cadre d'une mise à jour incrémentale). Il reste valable comme ordre de grandeur ; se reporter au §5.1 du rapport du 18 mai. Les évolutions de la fenêtre sont capturées en §5.3 (fichiers les plus touchés) et §5.4 (nouveaux modules).

### 5.2 Nouveaux modules JavaScript apparus dans la fenêtre (19 mai → 8 juin)

```csv
fichier,role
js/utils-notifications.js,Consolidation des helpers de notification (~525 appelants migrés dans 39 modules) — transverse audit axe 3
js/chrome-unifie.js,Unification de l'en-tête/chrome de l'application
js/guides-pedagogiques.js,Guides pédagogiques intégrés (SOLO, Micro-données ACP, RàI) — fonctionnalité 1.1
js/comparateur-pratiques.js,Comparateur de pratiques de notation sur profils-types (+ export CSV) — fonctionnalité 1.2
js/pratiques/denotation-jugements.js,Modèle SSOT de la famille Dénotation (collection jugementsDenotation namespacée) — 1.3
js/pratiques/denotation-saisie-ui.js,Saisie du jugement DEN dans le profil étudiant — 1.3
js/modal-soutien.js,Modale « Soutenir Labo Codex » (communauté, blogue, abonnement, don) — 1.4
```

> Plusieurs scripts utilitaires one-shot sont aussi apparus dans `scripts/` (réparation/audit de données algorithmiques, dédoublonnage de bibliothèques) — outils de maintenance non embarqués dans l'application.

### 5.3 Top fichiers touchés sur la fenêtre (19 mai → 8 juin, branche `main`)

```csv
fichier,touches,insertions,suppressions,churn,interpretation
js/init-inline.js,204,290,332,290,Compagnon de version.json — overhead méta (1 bump/commit de release)
version.json,202,202,202,202,Bump build/version à chaque session — méta
js/main.js,167,413,214,214,Câblage des nouveaux modules + ajustements en-tête/chrome
index.html,102,2360,3848,2360,Chargement des nouveaux modules + sections (Comparateur, guides, soutien) + retraits
SESSION.md,86,3922,1738,1738,Log méta des sessions — réécritures permanentes
styles.css,77,2827,947,947,Styles des nouvelles sections + correctifs design system (#323 icônes, DEN)
BACKLOG.md,46,680,2264,680,Bascule d'items livrés vers l'archive + nouveaux items (#318-#326)
js/profil-etudiant-sections-affichage.js,24,1286,1420,1286,Section « Jugement » DEN + dette résiduelle Track 3
js/wizard-pratique-v2.js,21,942,404,404,Refonte de l'assistant de pratique (#317, #319) + inférence comportementale (#137)
js/comparateur-pratiques.js,10,925,169,169,Nouveau module — Comparateur de pratiques
js/trimestre-v2-cours.js,14,458,399,399,Correctifs contexte cours actif (#130) + assemblage
js/pratiques-gestion.js,13,263,189,189,Gestion des pratiques (résolution, familles)
js/profil-etudiant-actions.js,11,427,256,256,Actions du profil (jugement DEN, recalcul)
js/accompagnement-contenu-hover.js,11,307,304,304,Contenu d'accompagnement (guides, infobulles)
```

> Lecture : l'**overhead méta** reste dominant en nombre de touches (`init-inline.js` 204, `version.json` 202, `SESSION.md` 86) — conséquence directe du nombre de releases dans la fenêtre (12 versions publiées entre 1.0.0 et 1.4.2, chacune = 1 commit `version.json` + 1 commit `init-inline.js` via `release.mjs`). Le churn « utile » se concentre sur `index.html` (intégration des nouvelles sections), `wizard-pratique-v2.js` (deux chantiers d'assistant successifs) et les modules de pratiques (Comparateur, DEN).

### 5.4 Nouveaux dossiers et catégories apparus dans la période

| Dossier / catégorie | Description | Apparition |
|---|---|---|
| `js/pratiques/denotation-*.js` | Famille Dénotation (modèle + UI de saisie) | 8 juin 2026 |
| Sections applicatives | Comparateur de pratiques, guides pédagogiques intégrés, modale Soutien | 4-8 juin 2026 |
| Documents de conformité racine | `PRIVACY.md`, `INCIDENTS.md`, `DEPLOY.md`, `SECURITY.md`, `libs/VERSIONS.md`, `.github/` (Dependabot, CI, CodeQL) | 25 mai 2026 (hygiène GitHub/OpenSSF) |
| `plans de travail/` | Specs de conception (SPEC_DEN_couche2, SPEC_D_exploration_pratiques, PLAN_refonte_assistant) | mai-juin 2026 |
| `scripts/` (maintenance) | Réparation/audit/dédoublonnage de données — outils one-shot | juin 2026 |
| Tests | 55 fichiers de test (≈395 cas), dont sentinelles dédiées par correctif (round-trip wizard, inférence comportementale, icônes suivies par git, suppression de reprise) | continu |

---

## 6. Analyse de réécriture (churn)

### 6.1 Vue globale (reconduite)

> Le tableau cumulatif des fichiers les plus réécrits et le taux de réécriture par module n'évoluent pas significativement à l'échelle du projet sur 21 jours ; se reporter au §6.1-6.2 du rapport du 18 mai. La fenêtre est capturée ci-dessous.

### 6.2 Churn de la fenêtre 19 mai → 8 juin (top fichiers, branche `main`)

```csv
fichier,touches,insertions,suppressions,churn,interpretation
index.html,102,2360,3848,2360,Intégration des nouvelles sections + retrait de code obsolète (net négatif : -1488)
SESSION.md,86,3922,1738,1738,Log méta
js/profil-etudiant-sections-affichage.js,24,1286,1420,1420,Section Jugement DEN + résidu de refactoring (net négatif)
styles.css,77,2827,947,947,Styles nouvelles sections + correctifs (net positif : +1880)
BACKLOG.md,46,680,2264,680,Bascule vers l'archive (net négatif : -1584)
js/wizard-pratique-v2.js,21,942,404,404,Refonte assistant — additions nettes (+538)
js/trimestre-v2-cours.js,14,458,399,399,Correctifs contexte/assemblage
js/trimestre.js,4,268,1253,268,Retrait de code (net très négatif : -985)
js/cours.js,9,207,1007,207,Retrait de code legacy (net négatif : -800)
js/profil-etudiant-calculs.js,7,222,390,222,Calculs (DEN, performance)
```

> Lecture : le **net négatif** sur `index.html`, `js/trimestre.js`, `js/cours.js` et `BACKLOG.md` (suppressions > insertions) confirme que la fenêtre n'est pas purement additive — elle retire aussi du code legacy et déplace des items de backlog vers l'archive, conformément au principe « stabilité zéro-dette ». Les **additions nettes** se concentrent sur les nouveautés fonctionnelles (`styles.css` pour les nouvelles sections, `wizard-pratique-v2.js` pour la refonte de l'assistant).

---

## 7. Rythme de travail

### 7.1 Par heure du jour — cumul complet (Toronto, ET)

```csv
heure,commits
0,5
1,2
2,6
3,4
4,25
5,83
6,217
7,291
8,302
9,324
10,238
11,256
12,270
13,260
14,221
15,204
16,158
17,120
18,118
19,162
20,147
21,52
22,18
23,22
```

Pattern stable depuis le début : forte matinée (5 h-14 h), creux relatif fin d'après-midi (16 h-18 h), reprise le soir (19 h-20 h). Couvre-feu naturel 21 h-04 h.

### 7.2 Par jour de la semaine — cumul complet

```csv
jour,commits,sessions
lundi,412,53
mardi,504,57
mercredi,491,61
jeudi,529,54
vendredi,615,66
samedi,554,68
dimanche,400,63
```

Vendredi-samedi restent les jours les plus intenses sur la durée du projet. Travail distribué sur les 7 jours.

### 7.3 Par heure du jour — fenêtre 19 mai → 8 juin

```csv
heure,commits
03,1
04,12
05,28
06,38
07,40
08,38
09,29
10,31
11,33
12,43
13,31
14,39
15,19
16,17
17,17
18,20
19,10
20,5
21,3
22,3
```

Matinée toujours dominante (5 h-14 h cumule 350 commits sur 457, soit 77 %). La reprise du soir est plus discrète que sur l'ensemble du projet.

### 7.4 Par jour de la semaine — fenêtre 19 mai → 8 juin

```csv
jour,commits
lundi,55
mardi,60
mercredi,49
jeudi,134
vendredi,66
samedi,39
dimanche,54
```

> **Jeudi domine très nettement (134 commits)** — les trois plus gros jours de la fenêtre sont des jeudis (21 mai : 45, 28 mai : 40, 4 juin : 49). C'est l'effet conjugué du calendrier d'enseignement (le mainteneur enseigne lun-mar-jeu) et du rythme de livraison : les jeudis concentrent fin de refactoring (21 mai), clôture de la consolidation (28 mai) et première salve post-lancement (4 juin).

### 7.5 Distribution des durées de session — fenêtre 19 mai → 8 juin

```csv
duree,sessions
< 30 min,17
30-60 min,10
1-2h,7
2-3h,2
3-4h,3
4h+,13
```

> **Polarisation persistante** : 33 % de micro-sessions (< 30 min : releases, bumps, correctifs ponctuels, mises à jour de SESSION.md) et 25 % de marathons (4 h+ : refonte de l'assistant, Comparateur, DEN). Le creux du milieu (1-3 h : 17 %) confirme les deux modes de travail déjà identifiés au 18 mai, désormais accentués par la cadence de releases.

---

## 8. Pauses et interruptions

```csv
debut_pause,fin_pause,jours,contexte_probable
2026-03-06,2026-03-14,8,Semaine de relâche
2026-01-11,2026-01-18,7,Pause mi-janvier
2025-12-22,2025-12-25,3,Vacances de Noël
2025-12-12,2025-12-15,3,Fin de session
```

> **Fenêtre 19 mai → 8 juin : aucune pause.** Les 21 jours sont actifs (100 %). C'est la première fenêtre du projet sans la moindre journée sans commit — l'enchaînement consolidation → lancement → itération n'a pas laissé de respiration calendaire, même si certaines journées sont légères (1-2 commits le 19-20 mai et le 1er juin, correspondant à du travail hors git : validation manuelle, préparation AQPC).

---

## 9. Jalons clés

### 9.1 Top 10 jours les plus intenses — durée complète du projet (oct 2025 → juin 2026)

```csv
date,commits,contexte
2026-05-14,86,Audit annuel — clôture axe 4 soutenabilité + ADR-008
2026-05-12,85,Audit annuel — démarrage axes 1-3
2025-10-25,77,Marathon de fondation — architecture initiale
2026-05-08,55,Défense I — 29 tests Vitest + Playwright (sécurité)
2026-04-02,50,Consolidation complète (Tiers 0-7)
2026-06-04,49,Lendemain du lancement — première salve post-retours
2026-02-08,47,RàI et dépistage SOLO
2026-05-21,45,Fin du refactoring evaluation.js + transverse
2026-02-27,43,Profils dynamiques et graphiques
2026-05-13,42,Audit annuel — axes 4-5
```

> Le top 10 historique reste dominé par la séquence d'audit annuel de mai (la semaine du 11 mai, 284 commits, reste le pic hebdomadaire absolu). Deux jours de la nouvelle fenêtre s'y intercalent : le **4 juin (49)** — lendemain du lancement — et le **21 mai (45)** — clôture du refactoring.

### 9.2 Jalons spécifiques à la fenêtre 19 mai → 8 juin

```csv
date,commits,contexte
2026-06-04,49,Lendemain du lancement — guides (1.1), Comparateur + assistant (1.2 en préparation)
2026-05-21,45,Fin refactoring evaluation.js + consolidation notifications + nettoyage vocabulaire
2026-05-28,40,Clôture de la consolidation pré-lancement (chantier cours↔période, mini-guides)
2026-05-22,37,Suite refactoring + tests de régression
2026-06-02,36,Veille de lancement — finalisation 1.0.0, derniers correctifs
2026-05-25,31,Hygiène GitHub/OpenSSF + documentation de conformité (Dependabot, CI, CodeQL)
2026-05-27,26,Chantier pratiques SSOT (#303)
2026-06-07,23,Comparateur de pratiques publié (1.2.0) + assistant repensé
2026-06-08,23,Dénotation (1.3) + bouton Soutien (1.4) + correctifs icônes (1.4.2)
2026-06-03,21,LANCEMENT PUBLIC — release 1.0.0 (bêta publique), présentation AQPC
```

---

## 10. Versions et livraisons de la fenêtre

La fenêtre marque la **bascule du versionnage Beta interne (Beta 99.x) au versionnage sémantique public**. Le tableau ci-dessous recense les releases publiées du lancement au 8 juin (source : commits `release:` sur `main`, horodatés Toronto).

| Version | Date | Nature | Contenu principal |
|---|---|---|---|
| **1.0.0** | 3 juin (soir) | `major` — lancement | Bêta publique au congrès AQPC. Première version publiquement déployée (`app.codexnumeris.org`). |
| 1.1.x | 4-5 juin | `minor` + `patch` | Guides pédagogiques intégrés (SOLO, Micro-données ACP, RàI) ; lot correctifs wizard #131-#135 (1.1.3). |
| 1.2.x | 7 juin | `minor` + `patch` | Comparateur de pratiques (+ export CSV) ; assistant de pratique repensé ; reprises configurables ; correctifs (1.2.3 : suppression de reprise #136). |
| **1.3.0** | 8 juin (matin) | `minor` | Famille **Dénotation** (DEN couche 2) complète : création dans l'assistant + saisie du jugement dans le profil ; assistant « pas-certain » par inférence comportementale (#137). |
| **1.4.0** | 8 juin (après-midi) | `minor` | Bouton **« Soutenir Labo Codex »** + modale (communauté, blogue, abonnement, don) ; correctifs terrain (rappel sauvegarde, bandeau MAJ, compteur d'étapes). |
| 1.4.1-1.4.2 | 8 juin (soir) | `patch` | Contact `labo@codexnumeris.org` dans la modale ; correction d'icônes manquantes (SVG non suivis par git, #115/#138) + **sentinelle anti-récurrence**. |

> En 6 jours (3-8 juin), **6 versions mineures/majeures et plusieurs patchs** ont été livrés. Cette cadence — impensable avant un déploiement automatisé — est rendue possible par le pipeline Cloudflare/Netlify (31 mai) et le script `release.mjs` (source unique de version, écriture atomique des 4 points de vérité).

---

## 11. Bilan post-lancement (lecture qualitative)

### 11.1 Le 3 juin comme bascule structurelle

Les deux rapports précédents décrivaient un projet en **consolidation rétrospective** : un objet utilisé presque exclusivement par son auteur, dont le travail visait à le rendre maintenable et défendable *avant* un usage à grande échelle. Le **3 juin 2026 referme cette séquence** : présentation au congrès de l'AQPC, déploiement public, et bascule explicite vers le versionnage sémantique (1.0.0). Ce que les rapports antérieurs anticipaient (« l'accueil des premiers expérimentateurs est prévu après la présentation AQPC du 3 juin ») est désormais réalisé.

Trois marqueurs objectivent la bascule :

1. **Versionnage** : abandon de la nomenclature Beta interne (qui avait atteint Beta 99.x) au profit du SemVer public. Le libellé « bêta publique » subsiste comme étiquette d'affichage ; le numéro fait foi (`version.json`).
2. **Déploiement** : passage d'un usage localhost/Cloudflare Access nominatif à un hébergement public (`app.codexnumeris.org`, Cloudflare/Netlify, 31 mai), 100 % hors-ligne côté données, sans compte.
3. **Source d'impulsion du développement** : du plan d'audit interne (mai) vers le **retour terrain du mainteneur en usage de production** (juin). Voir §11.3.

> **Précision sur l'usage (8 juin)** : malgré le déploiement public, **le mainteneur reste à ce jour le seul utilisateur** ; tous les bugs de la fenêtre ont été identifiés par lui, en usage réel de classe. L'arrivée d'utilisateurs externes est attendue *à partir* de la bêta publique, pas encore constatée. La bascule du 3 juin est donc structurelle (déploiement, versionnage, base prête à recevoir des tiers) avant d'être une bascule d'audience.

### 11.2 Ce qui a été clôturé avant le lancement (19 mai-3 juin)

La consolidation entamée à la mi-mai a été menée à terme :

- **Refactoring des 5 god modules** : tous livrés et mergés. `evaluation.js` (le plus risqué, 7 321 LOC) clos le 21 mai. Bilan : `bilan-reflexif.js` 4 716 → 955 LOC, `trimestre-v2.js` 6 584 → 599, `productions.js` 3 995 → ≈2 211, `profil-etudiant.js` 8 818 → 4 654, `evaluation.js` 7 321 → 3 984. Complexité cyclomatique max divisée par 2 à 3.
- **Transverse** : consolidation des notifications (`utils-notifications.js`, ~525 appelants migrés dans 39 modules, ≈469 LOC nettes retirées, 3 bugs latents corrigés dont une XSS #111) ; nettoyage du vocabulaire alarmiste (8 chaînes UI, retrait de code mort prédictif).
- **Pérennité** : hygiène GitHub/OpenSSF (Dependabot, CI, CodeQL, `SECURITY.md`) ; documentation publique de conformité (`PRIVACY.md`, `INCIDENTS.md`, `DEPLOY.md`, `README.md`, 15 ADRs) ; correction du décalage de licence (CC BY-SA → CC BY-NC-SA).

### 11.3 Ce que le retour terrain a déclenché (4-8 juin)

Le développement de la fenêtre est tiré par l'**usage de production intensif du mainteneur** au moment du lancement (toujours le seul utilisateur — aucun retour externe à ce jour). La trace est nette dans le suivi des bugs :

- **#130** (3 juin, terrain de lancement) : « Suivi » vide malgré un groupe-cours actif — cache `infoCours` non namespacé par trimestre. Corrigé en lecture, chirurgicalement, avec test de non-régression.
- **#136** (8 juin) : suppression d'une reprise laissait l'original « remplacé » — helper de cohérence + garde-fou + sentinelle.
- **#137** (8 juin) : l'assistant « Je ne suis pas certain·e » reposait la même question — refonte par **inférence comportementale** (deux questions sur des gestes observables → famille déduite par le moteur unique), 16 cas de test.
- **#115 / #138** (8 juin) : icônes manquantes parce que des SVG existaient sur le disque du dev mais **n'étaient pas suivis par git** → absents du déploiement. Corrigé + **sentinelle générique** qui échoue si une icône référencée n'est pas suivie par git (classe de bug rendue visible *par* le déploiement public).

Le bug #138 illustre une nouveauté structurelle : **certaines classes de défauts ne deviennent observables qu'une fois déployées** (le desktop inline les icônes en base64, le mobile les charge par `<img src>` ; l'écart n'apparaît qu'en production sur appareil réel). Le projet répond par des **sentinelles** plutôt que par des correctifs ponctuels — réflexe « stabilité zéro-dette » appliqué au nouveau régime de production.

En parallèle, trois fonctionnalités substantielles ont été livrées en réponse à des besoins de fond (et non à des bugs) : les **guides pédagogiques intégrés** (1.1), le **Comparateur de pratiques** (1.2), et la famille **Dénotation** (1.3) — cette dernière aboutissant une réflexion de conception PRÉN entamée début juin (specs `SPEC_DEN_couche2.md`).

### 11.4 État de l'objet au 8 juin

- **Filet de tests** : passé de 149 verts (31 mai) à **~395 verts** (8 juin) — +165 % en 8 jours, porté par les sentinelles de correctifs et de refactoring. C'est l'indicateur le plus parlant du changement de régime : chaque correctif terrain (identifié par le mainteneur) se verrouille désormais par un test.
- **Surface de code** (mesure cloc — lignes de code, hors commentaires et lignes vides) :

| Langage | Fichiers | Code (cloc) | Lignes physiques |
|---|---:|---:|---:|
| JavaScript (`js/`, avec démo) | 164 | **136 996** | 196 067 |
| └ JS hors packs de démo | 160 | 117 525 | 176 235 |
| HTML — `index.html` (la SPA) | 1 | **13 197** | 15 616 |
| CSS — `styles.css` + 2 fichiers | 3 | **21 007** | 25 965 |

  Hors périmètre applicatif : tests (81 fichiers, ~6 100 lignes de code) et `libs/` vendored (8 fichiers, ~500). Le total CSS « rendu » dépasse les 21 007 des fichiers `.css` : `index.html` embarque aussi du CSS inline (dette #297). **Effet du refactoring visible dans ces chiffres** : l'audit du 12-14 mai mesurait 129 modules JS / 136 389 lignes de code ; au 8 juin, **164 / 136 996** — soit **+35 modules pour +607 lignes de code seulement**. Le code n'a pas gonflé, il a été redécoupé en fichiers plus petits.
- **Dette connue, assumée et tracée** : bugs de données #300/#301, dette CSS inline #297, `modalitesEvaluation` à 14 écrivains (audit dédié requis), refactoring résiduel optionnel (Track 3 ph.2, Track H). Aucun n'est masqué ; tous sont dans `ETAT-PROJET.md` / `BACKLOG.md`.
- **Conformité en attente** : révision `PRIVACY.md` au regard de la Loi 25 (#298), dépendant de l'analyse des logs Cloudflare et, à terme, de l'avis du responsable institutionnel de la protection des renseignements personnels du Cégep de Drummondville.
- **Chantiers conçus, prêts à coder** : refonte de l'assistant (#319, plan prêt), répertoires de classement (#320), axe D « Exploration des pratiques » (#326, spec validée — DEN en était le préalable).

### 11.5 Lecture d'ensemble

L'hypothèse de travail des rapports précédents — « consolider avant l'usage de masse pour offrir un objet maintenable plutôt qu'un prototype endetté » — **a tenu**. Le lancement s'est fait sur une base refactorée, testée, documentée et déployée par pipeline. Le risque résiduel n'est plus la dette technique accumulée (largement résorbée en mai) mais la **bande passante humaine d'un mainteneur unique**.

Deux observations à distinguer nettement, l'une factuelle, l'autre prospective :

- *Fait* : l'intensité ne retombe pas après le lancement. La fenêtre montre 21 jours actifs sur 21, sans pause, à un rythme supérieur à la moyenne du projet — et cela **sans aucune sollicitation externe** : le moteur est entièrement l'usage et le jugement d'une seule personne. C'est soutenable sur trois semaines de lancement ; ce n'est pas un régime de croisière.
- *Extrapolation* : si la bêta publique amène effectivement des utilisateurs (ce qui n'est **pas encore constaté**), un flux de retours externes viendra s'ajouter à cette charge déjà pleine. Le mainteneur passerait alors d'« unique producteur ET unique détecteur de bugs » à « unique producteur face à des détecteurs multiples » — un déplacement de goulot d'étranglement, pas une décharge.

Dans les deux cas, la perspective d'allocation cégep à l'automne 2026 (déjà invoquée pour justifier le refactoring) prend tout son sens : la maintenabilité construite en mai est précisément ce qui rendra le projet transmissible — et soutenable — au-delà d'une seule personne.

---

## 12. Croisement avec l'audit annuel — diagnostic → résolution

Les trois bilans de développement (ce document inclus) mesurent l'**intensité et la répartition** du travail. Ils ne disent rien de la **qualité** de l'objet produit. Cette dimension a été couverte par l'**audit annuel des 12-14 mai 2026** (6 axes, 25 sous-audits, cadres ISO 25010 / OWASP / WCAG 2.1 AA / Loi 25 / OpenSSF / CHAOSS ; rapports dans `audit/reports/`). Les deux exercices sont complémentaires : l'un dit *combien on a produit*, l'autre *ce que vaut ce qui est produit*.

### 12.1 Avertissement de lecture (temporalité)

**L'audit date d'avant le refactoring et le lancement.** Son commit de référence est sur la branche `audit/2026-mai`, figé aux 12-14 mai. Or la fenêtre couverte par ce bilan (19 mai → 8 juin) contient précisément les chantiers qui ont *répondu* à plusieurs constats de l'audit : refactoring des god modules (15-21 mai), hygiène GitHub et documentation de conformité (25 mai), déploiement versionné (31 mai). Présenter les statuts de l'audit sans les dater reviendrait à propager un état périmé. Le tableau ci-dessous distingue donc systématiquement le **constat à l'audit** de l'**état au 8 juin**.

> **Note sur la fonction « station météo »** : l'audit lui-même (annexe AQPC, sous-audit 4.2 / contexte) confirme et précise le point d'usage discuté en §11 : ~50 personnes ont obtenu un accès Cloudflare (Zero Trust, OTP, accès individuel d'une semaine) entre janvier et mai 2026 ; **aucune n'a renvoyé de retour ni n'est revenue**. L'auteur est seul utilisateur actif depuis fin février. La bêta publique du 3 juin est explicitement pensée — dans le titre même de la présentation AQPC, « *une station météo, pas un pilote automatique* » — comme l'amorce de « la première vague significative d'expérimentateurs accompagnés ». La correction apportée en §11 (mainteneur seul) est donc cohérente avec l'audit ; il y a eu une alpha, mais sans engagement.

### 12.2 Tableau de bord qualité (constaté 12-14 mai → état 8 juin)

| Axe | Statut à l'audit | Constat pivot (12-14 mai) | Traité depuis (19 mai → 8 juin) | État au 8 juin |
|---|:---:|---|---|:---:|
| 1. Conformité pédagogique | Jaune | Code fidèle au cadre théorique avec nuances (1 V + 2 J) | Nettoyage du vocabulaire alarmiste (8 chaînes UI, code mort prédictif retiré) | Jaune+ |
| 2. Santé du code | **Rouge** (le pire) | 35 fichiers > 1 000 LOC ; 387 fonctions cyc > 15 (max 118) ; bug typo `evaluation.js:4193` | **5 god modules refactorés** (complexité max ÷ 2-3) ; typo corrigé (Phase 1) ; dette résiduelle (Track 3 ph.2) tracée comme optionnelle | **Jaune** |
| 3. Architecture (SSOT) | **Rouge** | 13 clés / 32 à écrivains multiples (pic 14 sur `modalitesEvaluation`) ; 6 cycles ; `trimestre-v2.js` 134 symboles exposés | Surface de `trimestre-v2.js` effondrée (6 584 → 599 LOC) ; **mais** `modalitesEvaluation` (14 écrivains) et `reserve.js` restent ouverts | **Rouge → Jaune** (point dur restant) |
| 4. Soutenabilité | Jaune | CAF = 1 ; README obsolète ; déploiement non versionné (4.4 Rouge) ; 5 non-conformités de licence ; 4 zéros OpenSSF corrigeables | `README`/`DEPLOY.md`/`netlify.toml` livrés ; hygiène GitHub (Dependabot, CI, CodeQL, `SECURITY.md`) ; licences corrigées ; déploiement public versionné | **Vert-Jaune** |
| 5. Sécurité et données | Jaune | 0 vulnérabilité OWASP exploitable ; CSP stricte ; 568 `echapperHtml()` ; **absence de `PRIVACY.md`** (seul Rouge, documentaire) | `PRIVACY.md` créé ; substitution `value="${id}"` planifiée ; **reste** la révision Loi 25 (#298, fenêtre publique) | **Jaune+** |
| 6. Accessibilité | Rouge léger | 2 violations critical (`#btn-codex` sans nom, `selectGroupeCours` sans label) + 17 nœuds de contraste ; 22 `outline:none`, aucune `prefers-reduced-motion`, `aria-live` absent | Les 2 violations critical corrigées (15 mai) | **En cours** — tests manuels VoiceOver/iPad et correctifs structurels (#305) restent à faire |

### 12.3 L'ossature factuelle du « mainteneur unique »

L'audit donne une mesure rigoureuse au risque discuté en §11.5, et son contrepoids :

- **CAF (Contributor Absence Factor) = 1** : 2 791 commits sur 2 793 attribués à Grégoire (référence CHAOSS). Sans lui, le rythme tombe à zéro.
- **OpenSSF Scorecard ~3,3/10** : structurel pour un projet solo (4 zéros assumés : revue par pair, contributeurs multiples, fuzzing, releases signées).
- **Contrepoids — test d'onboarding tiers réussi en < 30 min** (sous-audit 4.3) : un agent « frais », sans contexte, produit une lecture exploitable de l'architecture (15/15 cases + diagramme). Verdict de l'audit : « **fork-friendly mais pas turn-key** ». Seul, oui — mais documenté au point d'être reprenable. C'est exactement ce que la maintenabilité construite en mai visait à garantir.

### 12.4 Ce qui reste réellement ouvert après remédiation

L'audit avait classé 8 sous-audits en Rouge. Après la fenêtre, le résidu se concentre sur trois points, tous tracés dans `ETAT-PROJET.md` / `BACKLOG.md` :

1. **Architecture SSOT** — `modalitesEvaluation` à 14 écrivains (Tier 6.5, audit dédié requis) ; cycles autour de `reserve.js` (refactoring 3 couches, long terme).
2. **Accessibilité** — tests manuels VoiceOver (Mac) + iPad réel (humain, axes 6.2/6.3) ; correctifs structurels `outline:none` / `prefers-reduced-motion` / `aria-live` ; modale d'aide sans nom accessible (#305).
3. **Conformité Loi 25** — révision de `PRIVACY.md` au regard de la fenêtre publique (#298), conditionnée à l'analyse des logs Cloudflare et, à terme, à l'avis du responsable institutionnel du Cégep.

> **Lecture d'ensemble** : l'audit du 12-14 mai a fonctionné comme un **diagnostic** dont les semaines suivantes ont été la **thérapie**. Le pic d'intensité de mai (cf. §2-3) n'est pas du bruit : c'est la trace de cette remédiation. Des 8 axes/sous-axes Rouge, deux blocs (santé du code, soutenabilité) sont passés au vert-jaune ; restent l'architecture SSOT (le rouge le plus tenace, par nature structurel) et l'accessibilité (en partie tributaire de tests humains). Aucun de ces résidus n'est masqué — c'est la posture « station météo » appliquée au projet lui-même.

#### Indicateur synthétique (pour visualisation)

Pour le graphe radar du rapport HTML, un score de santé 0-10 par axe est dérivé de la distribution V/J/R (Vert = 10, Jaune = 5, Rouge = 2, partiel = 4), moyennée par axe. **C'est une inférence de lecture, pas une métrique de l'audit** : l'audit ne produit pas de score chiffré, seulement des statuts qualitatifs. La colonne « 8 juin » réévalue ces scores à partir des remédiations documentées ci-dessus.

```csv
axe,score_audit_12-14mai,score_8juin
Conformité pédagogique,6.7,7.0
Santé du code,4.2,7.0
Architecture (SSOT),2.0,4.0
Soutenabilité,5.3,8.0
Sécurité et données,7.0,7.5
Accessibilité,3.3,5.0
```

---

*Document destiné à être mis en graphiques. Les blocs CSV peuvent être importés directement. Toutes les valeurs git sont sourcées de `git log` (commits dédupliqués sur l'ensemble des branches, fuseau America/Toronto) au 8 juin 2026, build 0608-1640, HEAD `main` `8453635`. Les heures sont un proxy haut (cf. §1.3) ; les commits, sessions, jours actifs et churn sont des mesures directes. Réconciliation avec le rapport du 18 mai : écart < 1 % sur les totaux cumulés.*
