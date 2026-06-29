# Audit de développement — Labo Codex avec Claude (version 2026-06-28)

**Première génération** : 14 avril 2026 (période 20 octobre 2025 → 12 avril 2026, 175 jours)
**Versions précédentes** : 18 mai 2026 (→ 18 mai, 211 jours) · 8 juin 2026 (→ 8 juin, 232 jours)
**Version courante** : 28 juin 2026 (période 20 octobre 2025 → 28 juin 2026, **252 jours**)
**Objectif** : documenter l'intensité, la répartition et l'évolution du développement, **dans la première fenêtre pleinement post-lancement** (du lendemain des premières releases publiques au 28 juin), marquée par trois grands chantiers parallèles et l'apparition d'un régime de développement **multi-agents**.

> **Note de mise à jour (28 juin 2026)** : ce rapport prolonge celui du 8 juin en intégrant la fenêtre **9 juin → 28 juin (20 jours)**. Cette fenêtre couvre trois fronts simultanés : (a) l'**infrastructure de partage** — Voûte Phase 1 (#329 : signature ECDSA, TOFU, format `.lcz`) et durcissement de l'import de codex sur iPad (#334) ; (b) l'**architecture inter-trimestres** — namespacing des modèles par trimestre (briques A/B/C puis migration **live** #358), aboutissement de la SSOT `modalitesEvaluation` (#328), durabilité IndexedDB (#353) ; (c) le **raffinement des pratiques** — banc de décision du Comparateur (#326), Dénotation éditable, prévention des doublons d'évals (#360). Les CSV des rapports précédents sont préservés et prolongés.
>
> **Continuité méthodologique** : totaux recalculés par la même méthode que les trois rapports antérieurs (commits dédupliqués sur l'ensemble des branches, regroupement en sessions si l'écart est < 2 h, +15 min de queue par session, fuseau America/Toronto). Réconciliation au 8 juin : le cumul all-branches mesuré au 28 juin (3 910) moins la fenêtre (399) redonne 3 511 ≈ 3 505 du rapport précédent (écart < 0,2 %, dû aux branches éphémères depuis supprimées/créées). Voir §1.4.
>
> **Réserve nouvelle, importante (régime multi-agents)** : à partir de cette fenêtre, le développement n'est plus mené par une seule session Claude Code séquentielle, mais par **plusieurs agents en parallèle** (sessions Cowork de conception/cadrage + sessions Claude Code de codage autonome, parfois simultanées). Conséquence directe sur la lecture des chiffres : le **nombre de commits reflète désormais en partie le débit d'agents autonomes**, pas seulement l'effort humain ; et les heures git-actives surestiment davantage le temps de présence humaine (cf. §1.3). À prendre en compte avant toute comparaison brute avec les fenêtres antérieures.

---

## 1. Vue d'ensemble

### 1.1 Totaux cumulés (20 octobre 2025 → 28 juin 2026)

| Métrique | Valeur |
|---|---|
| Commits totaux (all-branches dédup.) | **~3 910** |
| Commits sur `main` seul (« ce qui est livré ») | **~3 485** (cf. §1.4) |
| Sessions de travail estimées | **~472** |
| Heures estimées (git-actives) | **~1 046 h** |
| Heures estimées (actif réel, cf. §1.3) | **~575-735 h** |
| Jours actifs | ~216 / 252 (**85,7 %**) |
| Moyenne commits/jour actif | ~18,1 |
| Moyenne heures/jour actif | ~4,8 h |
| Modules JS (`js/`, état actuel) | **180** (164 au 8 juin → +16) |
| Lignes (physiques, git, cf. §11.4) | **JS ~203 500** · `index.html` ~15 750 · CSS ~24 800 |
| Suite de tests (état rapporté) | **~1 210 verts** (≈1 142 Vitest + ≈68 Playwright WebKit), **189 fichiers de test** |
| Versions traversées | **1.0.0 → 1.26.0** (45 versions publiées dans la seule fenêtre) |

### 1.2 Période étendue seule (9 juin → 28 juin 2026, 20 jours)

| Métrique | Valeur |
|---|---|
| Commits (all-branches dédup.) | **399** (dont 216 sur `main`) |
| Sessions | 50 |
| Heures estimées (git-actives) | **~107 h** |
| Heures estimées (actif réel) | **~59-75 h** |
| Jours actifs | **20 / 20 (100 %)** — aucun jour sans commit |
| Moyenne commits/jour actif | ~20,0 |
| Moyenne heures/jour actif | ~5,4 h |
| Versions publiées | **45** (1.5.0 → 1.26.0) |

> **Fait marquant** : pour la **deuxième fenêtre consécutive**, aucun jour sans commit (20/20 après 21/21 au 8 juin). Soit **41 jours d'affilée d'activité git** depuis le 19 mai. Le rythme (5,4 h git-actives/jour) reste supérieur à la moyenne du projet (4,8 h). L'intensité du lancement ne retombe pas ; elle se redéploie sur trois chantiers de fond.

### 1.3 Note méthodologique sur l'estimation des heures (actualisée pour le régime multi-agents)

La méthode capture le **temps git-actif**, pas le temps humain effectif. Les facteurs d'écart déjà documentés tiennent (multitâche enseignement × développement — la fenêtre couvre une fin de session d'enseignement avec correction de copies réelles ; discussions Cowork hors-sujet ; pauses techniques quota/réseau/approbations ; couvre-feu naturel 21 h-4 h).

**Deux circonstances de cette fenêtre accentuent le biais :**

1. **Régime multi-agents** : des sessions Claude Code tournent en **codage autonome** (le mainteneur approuve et supervise par intermittence, sans présence continue), pendant que des sessions Cowork mènent la **conception** (cadrage du plan mi-août, dossiers-relais, décisions d'architecture). Ces dernières ont une trace git mince (quelques commits de documentation) pour une charge cognitive élevée. La densité commits/heure-humaine a donc **augmenté** : le proxy haut l'est davantage.
2. **Chantiers de données à validation manuelle** : les migrations live (#358) et les réparations en console (#346, #352, #362) supposent du travail de vérification (backups, golden masters L0 avant/après, lecture des écarts) peu reflété en commits.

L'ordre de grandeur de la surestimation, déjà estimé à 30-45 %, est donc **probablement plus élevé** sur cette fenêtre. Le réel cumulé est plus vraisemblablement de l'ordre de **575-735 h** que de 1 046 h. Restent informatifs sans réserve : l'intensité relative, les jours pics, la répartition par module, le churn, la continuité (jours actifs / calendaires).

### 1.4 Note sur le comptage des commits (reconduite et actualisée)

Le double comptage introduit au 8 juin reste de mise :

- Sur `main` seul, le cumul au 28 juin est de **~3 485 commits** (« ce qui est dans le produit livré » ; 216 sur la fenêtre).
- Le comptage multi-branches dédupliqué donne **~3 910** (399 sur la fenêtre) — il inclut le travail de branches éphémères, de worktrees et de revue non intégralement reflété dans l'historique linéaire de `main`, notamment à cause des **squash-merges** (la fenêtre compte 13 PR fusionnées par squash : #35-#73).

L'écart `main` ↔ all-branches (~425) est la trace des branches de travail. Particularité de la fenêtre : le **régime multi-agents multiplie les branches** (`claude/*`, worktrees `.claude/worktrees/*`), et une **collision de rebase** survenue le 28 juin (réconciliée en merge, sans perte de données — voir §11.3) illustre concrètement ce mode de travail. Ce rapport conserve le comptage multi-branches pour la comparabilité historique.

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
2026-06,153.1,66,577,28
```

> Mise à jour 2026-06-28 : la ligne **2026-06 couvre désormais 1er → 28 juin** (28 jours, **tous actifs**) : **577 commits, ~153 h, 66 sessions** (vs 8 jours / 181 commits / 47,9 h au rapport précédent). Juin 2026 se hisse au **2ᵉ rang historique en heures** (153 h, derrière mai 183,6 h et devant février 180,1 h) et au 3ᵉ en commits. Avec deux jours encore à courir (29-30 juin), juin pourrait approcher le record de mai. Les mois antérieurs sont inchangés.

### Phases de développement (actualisé)

| Phase | Période | Heures | Description |
|---|---|---|---|
| … (phases oct 2025 → mai 2026 : voir rapport du 8 juin §2) | | | |
| Mise en orbite (lancement) | 26 mai-3 juin 2026 | ~75 h | Déploiement Cloudflare/Netlify, 1.0.0, AQPC, bascule SemVer. |
| Itération post-lancement | 4-8 juin 2026 | ~40 h | Guides (1.1), Comparateur + assistant (1.2), Dénotation (1.3), Soutien (1.4). |
| **Infrastructure & partage** | **9-11 juin 2026** | **~28 h** | Répertoires de classement (#320/#327), **Voûte Phase 1** (#329 : signature ECDSA, TOFU, `.lcz`, sections « Partagés »), durcissement **import codex iPad** (#334 A-D : pré-vol quota, journalisation, snapshot haché), garde-fous inter-appareils (#335), #340/#332. Pic du **10 juin (63 commits)**. |
| **Pratiques & exploration** | **14-22 juin 2026** | **~38 h** | Ablation du vieil éditeur de pratique (#338), **Exploration des pratiques / banc de décision** (#326 D-2→R6), modales intégrées, export des résultats finaux (#333), prévention CC (#342), **Dénotation éditable inline** (1.21.0). |
| **Architecture inter-trimestres** | **23-28 juin 2026** | **~30 h** | **Namespacing par trimestre** (briques A/B/C, #357 ; restauration A25 L0/L2), **fin de #328** (SSOT `modalitesEvaluation`, 1.22.0), **durabilité IndexedDB** (#353, risque de perte fermé), **prévention des doublons** (#360), **migration live des modèles** (#358, 1.25.0), **réactivation du Comparateur** (#326, 1.26.0). |

### Note de phase — interprétation au 28 juin 2026

La fenêtre confirme la lecture du 8 juin (« l'intensité ne retombe pas après le lancement, elle se reconfigure ») et la précise : **trois chantiers structurants menés de front**, là où les fenêtres antérieures enchaînaient des phases séquentielles. Le **partage** (Voûte) ouvre le projet vers une diffusion par les pairs ; le **namespacing inter-trimestres** prépare l'analyse longitudinale ; le **raffinement des pratiques** consolide le cœur métier. La source d'impulsion reste mixte : retours terrain du mainteneur (toujours détecteur principal des bugs) **et** plan de fond (audit, architecture). La nouveauté de régime — plusieurs agents en parallèle — explique en partie la capacité à tenir trois fronts simultanés.

---

## 3. Commits par semaine (pour courbe d'intensité)

```csv
semaine_debut,commits
2026-04-27,85
2026-05-04,103
2026-05-11,284
2026-05-18,147
2026-05-25,164
2026-06-01,158
2026-06-08,186
2026-06-15,112
2026-06-22,124
```

> La semaine du **8 juin (186)** — réévaluée à la hausse (elle valait 23 en partiel au rapport précédent) — entre dans le **tiers supérieur historique** : c'est la semaine Voûte + import iPad, portée par le pic du 10 juin. Les deux semaines suivantes (112, 124) restent soutenues malgré une fin de session d'enseignement. La semaine du **11 mai (284)** demeure le pic absolu du projet.

---

## 4. Commits par jour (fenêtre 9 juin → 28 juin, pour heatmap)

```csv
date,commits
2026-06-09,24
2026-06-10,63
2026-06-11,40
2026-06-12,6
2026-06-13,10
2026-06-14,20
2026-06-15,37
2026-06-16,26
2026-06-17,10
2026-06-18,10
2026-06-19,23
2026-06-20,2
2026-06-21,4
2026-06-22,5
2026-06-23,12
2026-06-24,3
2026-06-25,18
2026-06-26,30
2026-06-27,13
2026-06-28,43
```

> Le **10 juin (63 commits)** est le **4ᵉ jour le plus intense de tout le projet** (cf. §9.1) : convergence Voûte + import iPad + classement, à la veille d'une cascade de releases (1.5.0 → 1.16.0 en deux jours). Le **28 juin (43)** clôt la fenêtre par une journée dense (migration live #358, durabilité #353, doublons #360, réactivation #326 — 5 releases). Les creux (20-22 et 24 juin : 2-4-3 commits) coïncident avec un week-end et de la fin de session d'enseignement.

---

## 5. Répartition par module

### 5.1 Vue globale (snapshot cumulatif — reconduit)

> Le tableau global cumulé par module (fichier → catégorie) n'est pas recalculé ici, conformément aux mises à jour incrémentales précédentes ; se reporter au §5.1 du rapport du 18 mai. Les évolutions de la fenêtre sont en §5.2-5.4.

### 5.2 Nouveaux modules JavaScript apparus dans la fenêtre (9 → 28 juin, `main`)

```csv
fichier,role
js/partage-schemas.js,Schémas fermés des 5 entités partageables + manifeste signé (Voûte #329 P1)
js/partage-validation.js,Validation à 6 niveaux des paquets de partage (Voûte #329)
js/partage-format.js,Construction/projection des paquets .lcz (Voûte #329)
js/partage-export.js,Export .lcz signé (Voûte #329 P2)
js/partage-import.js,Import .lcz + préfixage PARTAGE_* + prévisualisation (Voûte #329 P3)
js/partage-section.js,Section « Partagés » dans les 5 bibliothèques + duplication vers mes documents (Voûte #329 P4)
js/signature.js,Signature ECDSA P-256 des paquets (Voûte #329 lot F)
js/trust-tofu.js,Confiance à la première rencontre (TOFU) des auteurs (Voûte #329 lot T)
js/pratiques/modalites-evaluation.js,Module propriétaire SSOT de modalitesEvaluation (#328 Lot 1)
js/pratiques/construction-attributs.js,Extraction des attributs de construction de la note par famille (Comparateur #326 R3)
js/pratiques/profils-types-generateur.js,Génération de profils-types dérivés de l'échelle (Comparateur #326 R2)
js/pratiques/pratiques-exploration.js,Arbre de filiation / dérivation de maquettes (Exploration #326)
js/export-resultats-finaux.js,Export synthèse CSV des résultats finaux (#333 Lot 2)
js/repertoires-bibliotheque.js,Répertoires de classement transversaux aux bibliothèques (#320/#327)
js/productions-namespace-garde.js,Garde anti-contamination des productions inter-trimestres (#340)
js/entites/reconciliation-evaluations.js,Réconciliation reprises vs doublons d'évals note-égale (#360)
js/ui-dialogues.js,Dialogues UI unifiés (remplacement des alert()/prompt() natifs, #316)
```

> Outils one-shot apparus dans `scripts/` (maintenance, non embarqués) : `dry-run-migration-modeles.mjs`, `valider-golden-master-trimestre.mjs`, `reparer-coursid-productions.mjs`, `reparer-references-productions.mjs`, `poser-modeles-a25.mjs`, `restaurer-isoler-cartouches-A25.mjs`, `sentinelle-isolation-grilles-trimestre.mjs` — l'outillage de sûreté des chantiers de données.

### 5.3 Top fichiers touchés sur la fenêtre (9 → 28 juin, branche `main`)

```csv
fichier,touches,insertions,suppressions,interpretation
BACKLOG.md,67,426,574,Bascule d'items livrés + nouveaux (#330-#362) — log de pilotage
SESSION.md,60,2988,105,Log méta des sessions (régime multi-agents : relais fréquents)
js/main.js,53,179,69,Câblage des nouveaux modules (Voûte, namespacing, exploration)
version.json,52,52,52,Bump à chaque release — méta (45 versions)
js/init-inline.js,52,106,157,Compagnon de version.json — overhead méta
index.html,41,269,131,Chargement des nouveaux modules + sections
js/pratiques-gestion.js,16,700,329,Résolution/familles + bannière maquettes + namespacing
js/codex.js,15,925,115,Export/import codex + capture des copies namespacées (#358)
js/changelog-data.js,15,129,7,Entrées changelog des releases
styles.css,14,195,13,Styles des nouvelles sections (Voûte, exploration)
js/pratiques.js,12,295,1389,Ablation du vieil éditeur (#338) — net très négatif (-1094)
js/trimestres.js,8,449,54,Interrupteur de namespacing + peuplement C1 + vidage du global (#358)
```

> Lecture : l'**overhead méta** reste structurellement dominant (`version.json` 52, `init-inline.js` 52, `SESSION.md` 60, `BACKLOG.md` 67) — conséquence des **45 releases** de la fenêtre et du régime multi-agents (relais de session multipliés). Le churn « utile » se concentre sur `codex.js` (capture des modèles namespacés), `pratiques-gestion.js` (familles + maquettes) et `trimestres.js` (machinerie de migration #358). Le **net très négatif** de `pratiques.js` (-1094) trace l'ablation zéro-dette du vieil éditeur de pratique (#338).

### 5.4 Nouveaux dossiers et catégories apparus dans la période

| Dossier / catégorie | Description | Apparition |
|---|---|---|
| `js/partage-*.js` + `signature.js` + `trust-tofu.js` | Sous-système Voûte (partage signé par fichiers) | 9-11 juin |
| `js/pratiques/*` (élargi) | `modalites-evaluation`, `construction-attributs`, `profils-types-generateur`, `pratiques-exploration` | 11-26 juin |
| `js/entites/` | Premier module du dossier `entites/` (réconciliation d'évals) | 28 juin |
| `scripts/` (chantiers données) | Dry-run, golden masters, réparations one-shot par trimestre | juin |
| Tests | **189 fichiers** (≈1 210 cas) — explosion portée par les sentinelles de namespacing, golden masters L0/L2, durabilité IDB, comparateur | continu |

---

## 6. Analyse de réécriture (churn)

### 6.1 Vue globale (reconduite)

> Le tableau cumulatif des fichiers les plus réécrits n'évolue pas significativement à l'échelle du projet sur 20 jours ; se reporter au §6.1-6.2 du rapport du 18 mai.

### 6.2 Churn de la fenêtre 9 → 28 juin (top fichiers, branche `main`)

```csv
fichier,insertions,suppressions,net,interpretation
js/pratiques.js,295,1389,-1094,Ablation du vieil éditeur de pratique (#338) — zéro-dette
js/codex.js,925,115,+810,Capture des copies de modèles namespacées à l'export (#358)
SESSION.md,2988,105,+2883,Log méta (relais multi-agents)
js/comparateur-pratiques.js,596,224,+372,Banc de décision (R3-R6) + non constructible + dérivation
js/trimestres.js,449,54,+395,Interrupteur namespacing + C1 + vidage global (#358)
js/pratiques-gestion.js,700,329,+371,Familles + maquettes + namespacing
BACKLOG.md,426,574,-148,Bascule d'items livrés vers l'archive
js/init-inline.js,106,157,-51,Méta version (net négatif par nettoyage de fallback)
```

> Lecture : le **net négatif** sur `pratiques.js` (-1094), `BACKLOG.md` et `init-inline.js` confirme que la fenêtre n'est pas purement additive — elle retire du code mort (vieil éditeur) et déplace des items vers l'archive, conformément à « stabilité zéro-dette ». Les **additions nettes** se concentrent sur les nouveautés (`codex.js` pour la capture namespacée, `comparateur-pratiques.js` pour le banc, `trimestres.js` pour la migration).

---

## 7. Rythme de travail

### 7.1-7.2 Cumul complet (reconduit, évolution mineure)

> Les distributions cumulées par heure du jour et par jour de semaine ne sont pas recalculées intégralement (évolution < 1 % sur 20 jours) ; se reporter au §7.1-7.2 du rapport du 8 juin. Tendance stable : forte matinée (5 h-14 h), creux 15 h-17 h, reprise du soir ; vendredi-samedi les plus chargés sur la durée.

### 7.3 Par heure du jour — fenêtre 9 → 28 juin (Toronto, ET)

```csv
heure,commits
02,6
03,8
04,13
05,25
06,28
07,36
08,11
09,19
10,17
11,27
12,32
13,17
14,5
15,8
16,28
17,19
18,36
19,21
20,28
21,6
22,6
23,3
```

> **Évolution notable** : la **reprise du soir (16 h-20 h) est nettement plus marquée** que dans les fenêtres antérieures (16 h : 28, 18 h : 36, 20 h : 28 — un second pic comparable au matin). La matinée reste forte (5 h-13 h), mais le profil bascule vers une journée **bimodale**. Hypothèse plausible : le régime multi-agents permet des sessions de codage autonome en soirée (supervision intermittente) après la journée d'enseignement.

### 7.4 Par jour de la semaine — fenêtre 9 → 28 juin

```csv
jour,commits
lundi,42
mardi,62
mercredi,76
jeudi,68
vendredi,59
samedi,25
dimanche,67
```

> **Mercredi domine (76)**, suivi de jeudi (68) et dimanche (67) — profil différent du 8 juin (jeudi seul). Le **samedi creuse** nettement (25). Le dimanche élevé (67) est cohérent avec des sessions de conception Cowork en fin de semaine (les gros documents de cadrage de cette fenêtre).

### 7.5 Distribution des durées de session — fenêtre 9 → 28 juin

```csv
duree,sessions
< 30 min,14
30-60 min,8
1-2h,10
2-3h,6
3-4h,2
4h+,10
```

> **Polarisation persistante** : 28 % de micro-sessions (< 30 min : releases, bumps, relais) et 20 % de marathons (4 h+ : Voûte, namespacing, banc de décision). Les deux modes identifiés dès le 18 mai tiennent, le « ventre mou » (1-3 h) se regarnit un peu (32 %) — effet des chantiers d'architecture, plus longs que des correctifs.

---

## 8. Pauses et interruptions

```csv
debut_pause,fin_pause,jours,contexte_probable
2026-03-06,2026-03-14,8,Semaine de relâche
2026-01-11,2026-01-18,7,Pause mi-janvier
2025-12-22,2025-12-25,3,Vacances de Noël
2025-12-12,2025-12-15,3,Fin de session
```

> **Fenêtre 9 → 28 juin : aucune pause.** 20 jours actifs sur 20 — deuxième fenêtre consécutive sans respiration calendaire (41 jours d'affilée depuis le 19 mai). Certaines journées sont légères (2-4 commits les 20-22 et 24 juin, week-end + fin de session d'enseignement), mais aucune n'est vide. **Une pause est explicitement annoncée pour juillet** (congé du mainteneur, reprise visée 1er août) — elle apparaîtra dans le prochain rapport.

---

## 9. Jalons clés

### 9.1 Top 10 jours les plus intenses — durée complète du projet (oct 2025 → 28 juin 2026)

```csv
date,commits,contexte
2026-05-14,86,Audit annuel — clôture axe 4 + ADR-008
2026-05-12,85,Audit annuel — axes 1-3
2025-10-25,77,Marathon de fondation
2026-06-10,63,Voûte Phase 1 + import codex iPad + classement (cascade 1.5→1.16)
2026-05-08,55,Défense I — 29 tests sécurité
2026-04-02,50,Consolidation complète (Tiers 0-7)
2026-06-04,49,Lendemain du lancement — première salve post-retours
2026-02-08,47,RàI et dépistage SOLO
2026-05-21,45,Fin refactoring evaluation.js + transverse
2026-06-28,43,Migration live #358 + durabilité #353 + doublons #360 + réactivation #326
```

> Le **10 juin (63)** s'intercale au **4ᵉ rang historique** — le jour le plus intense hors séquence d'audit annuel de mai. Le **28 juin (43)** entre aussi dans le top 10 (ex æquo avec le 27 février). La fenêtre place ainsi deux jours dans le top 10 du projet, signe que l'intensité post-lancement rivalise avec les pics de l'audit.

### 9.2 Jalons spécifiques à la fenêtre 9 → 28 juin

```csv
date,commits,contexte
2026-06-10,63,Voûte (signature/TOFU/.lcz) + import iPad (#334) + répertoires (#327)
2026-06-28,43,Migration live des modèles (#358, 1.25.0) + durabilité (1.24.2) + #360 + comparateur réactivé (1.26.0)
2026-06-11,40,Cascade import iPad 1.13→1.16 + garde-fous inter-appareils (#335)
2026-06-15,37,Exploration des pratiques (#326 D-2/D-3) + modales (1.18.0) + #334 session D
2026-06-26,30,Namespacing par trimestre briques A/B/C + restauration A25 (1.21.1)
2026-06-16,26,Banc de décision en préparation + dérivation/duplication (1.18.1)
2026-06-09,24,Répertoires transversaux + correctifs assiduité bi-groupes (1.6.4)
2026-06-19,23,noteConstructible + prévention CC (#342) + export synthèse (1.20.0)
```

---

## 10. Versions et livraisons de la fenêtre

**45 versions distinctes publiées** entre le 9 et le 28 juin (1.5.0 → 1.26.0) — record de cadence du projet, rendu possible par le pipeline Cloudflare/Netlify et `release.mjs`. Jalons (curés ; les patchs intermédiaires sont omis) :

| Version(s) | Date | Nature | Contenu principal |
|---|---|---|---|
| 1.5.0 – 1.6.4 | 9-10 juin | `minor`/`patch` | Répertoires de classement transversaux (#320/#327) ; correctifs terrain (assiduité bi-groupes #330). |
| **1.7.0 – 1.11.3** | 10-11 juin | `minor` | **Voûte Phase 1** (#329) : signature ECDSA P-256, TOFU, format `.lcz`, sections « Partagés » dans les 5 bibliothèques. |
| 1.12.1 – 1.16.0 | 11 juin | `minor`/`patch` | **Import codex iPad** (#334 A-D : pré-vol quota, journalisation, snapshot haché) + garde-fous inter-appareils (#335). |
| 1.17.3 – 1.17.9 | 14-15 juin | `patch`/`minor` | Ablation du vieil éditeur de pratique (#338) ; #332 constat 1 ; garde-fou productions (#340) ; axe D D-0/D-1. |
| 1.18.0 – 1.19.2 | 15-17 juin | `minor` | **Exploration des pratiques** (#326 D-2/D-3) ; **banc de décision** (R4-R6) ; export résultats finaux (#333 Lot 1). |
| **1.20.0** | 19 juin | `minor` | `noteConstructible` (banc + CSV) ; prévention d'attribution CC (#342) ; export synthèse CSV (#333 Lot 2) ; a11y. |
| **1.21.0** | 22 juin | `minor` | **Dénotation éditable inline** + créable de 1er rang ; **masquage réversible du comparateur** (#345). |
| 1.21.1 – 1.21.3 | 26-27 juin | `minor`/`patch` | **Namespacing par trimestre** (briques A/B/C, #357) + restauration A25 (L0/L2) + import inter-trimestre de pratiques + `groupeNum` canonique. |
| **1.22.0** | 27 juin | `minor` | **Fin de #328** — SSOT `modalitesEvaluation` (dernière grande violation SSOT de l'audit annuel). |
| 1.23.0 | 27 juin | `minor` | Consolidation namespacing-D (Brique D + coursId + groupeNum). |
| **1.24.0 – 1.24.2** | 28 juin | `minor`/`patch` | Prévention des **doublons d'évals** note-égale (#360) ; **durabilité IndexedDB** complète (#353 Option A/B/C) — risque de perte de données **fermé**. |
| **1.25.0** | 28 juin | `minor` | **Migration LIVE** des modèles namespacés par trimestre (#358) — validée sur données réelles. |
| **1.26.0** | 28 juin | `minor` | **Réactivation du Comparateur** (#326, T1-T5 traités, Mac + iPad). |

> En 20 jours, **45 versions** — plus du double de la fenêtre précédente (12 en 6 jours). La cadence reflète à la fois le découpage en petits lots vérifiables (zéro-dette) et le débit du régime multi-agents.

---

## 11. Bilan de la fenêtre (lecture qualitative)

### 11.1 Trois chantiers de fond menés de front

Là où les fenêtres antérieures enchaînaient des phases (consolidation → lancement → itération), celle-ci tient **trois chantiers structurants en parallèle** :

1. **Diffusion (Voûte #329)** — le projet se dote d'une infrastructure de **partage de ressources signées** (ECDSA + TOFU, format `.lcz`), avant-pilote code-complet. C'est la première brique tournée vers une communauté de pairs, et non vers le seul mainteneur.
2. **Architecture inter-trimestres (#358/#357/#328/#353)** — le **namespacing des modèles par trimestre** (grilles, échelles, cartouches), aboutissement de la dernière grande violation SSOT de l'audit (#328) et durcissement de la durabilité du stockage. Chantier à **risque maximal** (il peut bouger une note réelle), mené sur backup + golden masters L0/L2, et conclu par une **migration live validée** (1.25.0).
3. **Raffinement des pratiques (#326/#360/#318)** — le Comparateur passe au **banc de décision**, la Dénotation devient éditable, et la **prévention des doublons d'évals** (#360) sécurise l'intégrité des notes.

### 11.2 L'explosion du filet de tests

L'indicateur le plus parlant du régime : la suite passe de **~395 verts (8 juin) à ~1 210 (28 juin) — ×3 en 20 jours**, et de 55 à **189 fichiers de test**. Cette croissance est tirée par la discipline « tout chantier de données ajoute au moins une sentinelle » : golden masters L0/L2 par trimestre, sentinelles de namespacing (briques A/B/C, special-archive), durabilité IDB, banc de décision. Le filet n'est plus un complément — c'est le **filet de sûreté qui rend les migrations de données réelles tolérables**.

### 11.3 Un régime de développement multi-agents (nouveauté structurelle)

La fenêtre voit émerger un **mode de travail à plusieurs agents** : sessions Cowork de conception/cadrage (plan mi-août, dossiers-relais, rafraîchissement d'`ETAT-PROJET.md`) **et** sessions Claude Code de codage autonome, parfois simultanées. Conséquences observables :

- **Multiplication des branches** et des worktrees (`claude/*`, `.claude/worktrees/*`) ;
- une **collision de rebase** le 28 juin, réconciliée en **merge sans perte** (les deux lignes — docs de cadrage et réactivation #326 — préservées) ;
- un **découplage accru entre commits et heures humaines** (cf. §1.3) : davantage de commits par heure de présence, donc des heures git-actives encore moins représentatives de l'effort humain.

C'est une évolution de méthode autant que d'outillage. Elle augmente le débit, mais introduit un **coût de coordination** (réconciliations git, désyncs de trackers entre agents — observées sur #326 et #328) que les sessions doivent désormais gérer explicitement (rituel de début de session, vérification au code plutôt qu'au tracker).

### 11.4 État de l'objet au 28 juin

- **Filet de tests** : ~1 210 verts (rapporté ; à recouper via `cd tests && npm test`). +205 % depuis le 8 juin.
- **Surface de code** (lignes **physiques** via `git ls-files | wc -l` — `cloc` indisponible dans l'environnement de mesure, d'où une **rupture de méthode** avec les rapports antérieurs qui donnaient des lignes *de code* cloc ; les valeurs ci-dessous ne sont donc **pas** directement comparables aux « Code (cloc) » du 8 juin, mais le sont aux « Lignes physiques ») :

| Langage | Fichiers | Lignes physiques |
|---|---:|---:|
| JavaScript (`js/`, avec démo) | 180 | ~203 500 |
| HTML — `index.html` | 1 | ~15 750 |
| CSS — `styles.css` | 1 | ~24 800 |

  Repère de continuité : au 8 juin, les **lignes physiques** JS valaient 196 067 pour 164 fichiers ; au 28 juin, ~203 500 pour 180 fichiers — soit **+16 fichiers pour ~+7 400 lignes physiques**. La croissance reste modérée et largement infrastructurelle (Voûte, namespacing), partiellement compensée par les ablations zéro-dette (#338 : -1094 sur `pratiques.js`).
- **Dette connue, assumée, tracée** : `ETAT-PROJET.md` rafraîchi au 28 juin (§dette). Point dur résiduel signalé : **désync de tracker sur #328** (release « fin de #328 » 1.22.0 vs case BACKLOG encore ouverte) — à recouper au code.
- **Conformité** : révision `PRIVACY.md` Loi 25 (#298) toujours en attente. **Privatisation du dépôt (23 juin)** → CodeQL et protection de branche suspendus (régression d'hygiène OpenSSF assumée, non d'architecture).

### 11.5 Lecture d'ensemble

L'hypothèse de fond des rapports précédents — « consolider pour offrir un objet maintenable et transmissible » — continue de tenir : la fenêtre **dépense le capital de maintenabilité** accumulé en mai (golden masters, sentinelles, SSOT) pour oser une **migration de données réelles en production** sans perte. Deux observations, l'une factuelle, l'autre prospective :

- *Fait* : l'intensité ne retombe pas (41 jours actifs d'affilée), mais le **moteur reste l'usage et le jugement d'une personne**, désormais **démultipliée par des agents**. Le mainteneur n'écrit plus tout le code ; il **dirige, vérifie et tranche**. C'est un déplacement du goulot d'étranglement : de la production de code vers la **supervision, la décision et la coordination**.
- *Extrapolation* : ce régime multi-agents soutient une cadence élevée (45 releases/20 j) **tant que le mainteneur peut superviser**. Le **congé de juillet annoncé** est le premier test de robustesse de l'objet sans son unique pilote : la reprise du 1er août dira si la documentation (plan mi-août, relais, `ETAT-PROJET.md`) et le filet de tests suffisent à reprendre **à froid** un projet devenu, en 20 jours, sensiblement plus vaste et plus distribué.

---

## 12. Croisement avec l'audit annuel — diagnostic → résolution

Les quatre bilans de développement mesurent l'**intensité** ; l'audit annuel des 12-14 mai mesurait la **qualité**. La fenêtre 9-28 juin a **résolu, ou fait nettement progresser, le rouge le plus tenace de l'audit** : l'architecture SSOT.

### 12.1 Avertissement de lecture (temporalité)

L'audit est figé aux 12-14 mai. Les statuts ci-dessous distinguent le **constat à l'audit** de l'**état au 28 juin** ; les scores chiffrés sont des **inférences de lecture**, pas des métriques de l'audit (qui ne produit que des statuts qualitatifs).

### 12.2 Tableau de bord qualité (constaté 12-14 mai → état 28 juin)

| Axe | Statut à l'audit | Traité depuis (jusqu'au 28 juin) | État au 28 juin |
|---|:---:|---|:---:|
| 1. Conformité pédagogique | Jaune | Stable (banc de décision = nouvel appui pédagogique au choix de pratique) | Jaune+ |
| 2. Santé du code | Rouge | Refactoring (mai) + ablations zéro-dette (#338) + filet ×3 | **Vert-Jaune** |
| 3. Architecture (SSOT) | **Rouge** (le pire) | **Fin de #328** (`modalitesEvaluation`, 1.22.0) + namespacing par trimestre (#358) — la violation pivot est traitée ; reste `reserve.js` (long terme) | **Jaune** (du rouge le plus dur au jaune) |
| 4. Soutenabilité | Jaune | Pipeline + docs (mai) ; **mais** privatisation (23 juin) → CodeQL/branch-protection suspendus | **Vert-Jaune** (léger recul OpenSSF) |
| 5. Sécurité et données | Jaune | **Durabilité IDB (#353)** + prévention doublons (#360) + migrations sur golden masters → préservation des données renforcée | **Jaune+/Vert** |
| 6. Accessibilité | Rouge léger | a11y du comparateur (clavier/focus) ; reste tests manuels VoiceOver/iPad | En cours |

### 12.3 Ce qui reste réellement ouvert

1. **Architecture SSOT** — `reserve.js` (refactoring 3 couches, long terme) ; **recouper la clôture effective de #328** (désync tracker).
2. **Accessibilité** — tests manuels VoiceOver (Mac) + iPad ; correctifs structurels résiduels.
3. **Conformité Loi 25** — révision `PRIVACY.md` (#298).
4. **Hygiène OpenSSF** — CodeQL/branch-protection à réactiver si le dépôt redevient public ou passe à GitHub Pro.

#### Indicateur synthétique (pour visualisation)

> Inférence de lecture (Vert = 10, Jaune = 5, Rouge = 2, partiel = 4), prolongeant la série 12-14 mai / 8 juin. La colonne « 28 juin » réévalue à partir des remédiations de la fenêtre.

```csv
axe,score_audit_12-14mai,score_8juin,score_28juin
Conformité pédagogique,6.7,7.0,7.0
Santé du code,4.2,7.0,7.5
Architecture (SSOT),2.0,4.0,6.0
Soutenabilité,5.3,8.0,7.5
Sécurité et données,7.0,7.5,8.0
Accessibilité,3.3,5.0,5.0
```

> Lecture d'ensemble : la fenêtre fait surtout bouger l'**architecture SSOT** (4,0 → 6,0 : la violation pivot `modalitesEvaluation` traitée, le namespacing posé) et la **sécurité/données** (7,5 → 8,0 : durabilité + prévention de perte). La **soutenabilité recule légèrement** (8,0 → 7,5) du fait de la privatisation (CodeQL/branch-protection suspendus) — un recul d'hygiène d'outillage, non d'architecture, explicitement tracé. Aucun résidu n'est masqué.

---

*Document destiné à être mis en graphiques (blocs CSV importables directement). Valeurs git sourcées de `git log` (commits dédupliqués sur l'ensemble des branches, fuseau America/Toronto) au 28 juin 2026, build `0628-2126`, `origin/main` `495cd99a` (`main` local en avance, non poussé). Les heures sont un proxy haut, **davantage encore sous le régime multi-agents** (cf. §1.3) ; commits, sessions, jours actifs et churn sont des mesures directes. Lignes de code : **physiques** (`cloc` indisponible dans l'environnement de mesure — rupture de méthode signalée au §11.4). Suite de tests (~1 210) **rapportée**, à recouper. Réconciliation des totaux cumulés avec le rapport du 8 juin : écart < 0,2 %.*
