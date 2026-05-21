# Plan Catégorie B post-merge — Dette résiduelle des 5 refactors

> Document de planification consolidant la dette technique et méthodologique issue du cycle des 5 god modules (bilan-reflexif, productions, trimestre-v2, profil-etudiant, evaluation), tous mergés sur `main` entre le 15 et le 21 mai 2026.

**Date de création** : 21 mai 2026
**Statut** : à démarrer
**Ordre acté** : Track 1 → 2 → 3 → 4 (quick wins d'abord)
**Effort total estimé** : ~22-37 h cumulées sur 4 tracks

**Articulation** :
- `audit/refactoring-prep/MODULES-MAP.md` §2.1-2.5 — cartographie des modules + écarts post-refactoring
- `audit/refactoring-prep/METHODE-REFACTORING.md` §7 — rétrospectives par module (sources de la dette)
- `Retours des testeurs/SUIVI-BUGS.md` — bugs latents #96-108 inscrits pendant les refactors
- `BACKLOG.md` — item parapluie à créer (proposition #281 ou suivant)

---

## 1. Contexte

Les 5 refactors PLAN-MOYEN-TERME §4 ont été livrés et mergés sur `main` :

| Module | Date merge | Tag | LOC avant → résidu | Cyc max → après |
|---|---|---|---:|---:|
| bilan-reflexif.js | 2026-05-15 | (sans tag) | 4 716 → 955 | 63 → 27 |
| productions.js | 2026-05-17 | refactor-productions-2026-05-17 | 3 995 → ~2 211 | 80 → ≤30 |
| trimestre-v2.js | 2026-05-17 | refactor-trimestre-v2-2026-05-17 | 6 584 → 599 | 94 → ≤30 |
| profil-etudiant.js | 2026-05-18 | refactor-profil-etudiant-2026-05-18 | 8 818 → 4 654 (renommé) | 58 → ≤30 |
| evaluation.js | 2026-05-21 | refactor-evaluation-2026-05-21 | 7 321 → 3 984 | 78 → 42 (Cat-B) |

Pendant ces refactors, la **préservation comportementale stricte** (cf. METHODE §6.3, §5.6) a impliqué la mise en attente d'éléments de dette identifiés mais non traités dans le scope refactor. Le présent plan organise cette dette en 4 tracks pour clôture progressive.

---

## 2. Inventaire Niveau 1 — Dette code (10 chantiers)

### Chantier A — Bugs latents #96-108 (13 bugs, tous sévérité Basse)

Inscrits SUIVI-BUGS pendant les refactors (préservation comportementale stricte). Tous identifiés, localisés, avec correctif proposé dans la description SUIVI-BUGS.

| # | Module | Type | Effort fix |
|---|---|---|---:|
| #96 | productions | `eventOuEl` shadow `window.event` | ~5 min |
| #97 | productions | `productionEnCoursEdition` ≠ `productionEnEdition` (dead code fonctionnel) | ~15 min |
| #98 | productions | Notification "ajoutée" vs "modifiée" (capture pré-annulation) | ~10 min |
| #99 | trimestre-v2 | XSS innerHTML `prog` non échappé (cours.js:677) | ~5 min |
| #100 | trimestre-v2 | XSS innerHTML `message`/`groupeFiltre` (etudiants.js:90) | ~5 min |
| #101 | trimestre-v2 | XSS innerHTML clé de groupe (etudiants.js:188) | ~5 min |
| #102 | trimestre-v2 | Dead code `afficherFormHoraireV2` + `modifierHoraireSelectionneV2` | ~30 min |
| #103 | trimestre-v2 | ReferenceError latent `afficherSeancesHoraireV2()` (lié #102) | ~5 min |
| #104 | trimestre-v2 | ReferenceError latent `rafraichirListeGroupeCoursV2()` | ~15 min |
| #105 | profil-etudiant | Dead code `chargerProfilEtudiant` dans `sauvegarderConfidentiel` | ~10 min |
| #106 | profil-etudiant | Branche `progression && progressionVisible` manquante dans `_resoudreSectionContenu` | ~10 min |
| #107 | evaluation | Dead code silencieux `initialiserModuleEvaluation` (export `window.X` manquant) | ~20 min |
| #108 | evaluation | Doublon cross-module `chargerEchellePerformance` sync vs async | ~30 min |

**Effort total chantier A : ~2 h 45.** Risque : Faible (chaque fix est ciblé et testé par les sentinelles existantes). Tests Vitest + Playwright doivent rester verts à chaque commit.

### Chantier B — Héritages cyc > 30 (14 fonctions)

Cible : ramener toutes les fonctions cyc > 30 sous la barre des 30, par éclatement en helpers privés (méthode mûre productions/profil-etudiant/evaluation).

| Module | Fonction | Cyc | LOC approx | Stratégie |
|---|---|---:|---:|---|
| profil-etudiant-sections-affichage.js | `genererSectionMobilisationEngagement` | 52 | ~730 | Sous-helpers DOM par section |
| profil-etudiant-sections-affichage.js | `genererSectionPerformance` | 47 | ~615 | Idem |
| profil-etudiant-actions.js | `calculerDetailsNoteFinale` | 57 | ~287 | Sous-helpers calcul + format |
| profil-etudiant-calculs.js | `determinerCibleIntervention` | 58 | ~200 | Sous-helpers règles métier |
| profil-etudiant-calculs.js | `calculerIPB` | 36 | ~150 | Sous-helpers fenêtre + agrégation |
| trimestre-v2-cours.js | `sauvegarderCoursV2` | 56 | ~280 | Sous-helpers DOM + validation |
| trimestre-v2-groupes-cours.js | `mettreAJourCarteResumeGroupeCoursV2` | 34 | ~140 | Sous-helpers render |
| trimestre-v2-cours.js | `remplirFormCoursV2` | 31 | ~120 | Sous-helpers DOM peuplement |
| trimestre-v2-groupes-cours.js | `genererNomGroupeCoursV2` | 31 | ~100 | Sous-helpers règles nommage |
| productions (à confirmer) | `productions-X` | ? | ? | À cartographier au démarrage |
| productions (à confirmer) | `productions-Y` | ? | ? | À cartographier au démarrage |
| evaluation-calcul.js | `calculerNoteAlgorithmiqueAvecCategories` | 42 | ~140 | Sous-helpers par catégorie + agrégation |
| evaluation-chargement.js | `chargerEchellePerformance` | 36 | ~90 | Sous-helpers cascade DB + fallback (lié #108) |
| evaluation-sauvegarde.js | `peuplementOptJetons` | 33 | ~110 | Sous-helpers par type de jeton |

**Effort total chantier B : ~6-10 h.** 5 mini-sessions (1 par module) ~1-2 h chacune. Risque : Moyen (modifications fonctionnelles, sentinelles à élargir au besoin).

Cible ESLint baseline : 0 fonction cyc > 30 dans le codebase (record historique).

### Chantier C — 3 doublons evaluation

Inscrits préservation stricte étape 1 evaluation. À résoudre comparison-by-comparison.

| Fonction | Lignes (résidu) | Action |
|---|---|---|
| `restaurerPreferenceTri` | 4295 + 4309 | Comparer corps, conserver la bonne |
| `obtenirClasseNote` | 3681 + 4390 | Signatures probablement différentes, vérifier callers |
| `filtrerListeEvaluations` | 4178 + 6851 | Conserver la version utilisée par le HTML |

**Effort total chantier C : ~30 min.** Risque : Faible (audit callers + suppression d'une définition).

### Chantier D — 2 codes morts « alarmistes » evaluation

Liés au T-L audit annuel 1.3 cohérence lexicale (vocabulaire alarmiste/prédictif). À retirer pur et simple.

| Fonction | Ligne (résidu) | Pourquoi alarmiste |
|---|---:|---|
| `calculerRisqueEchec` | 3634 | Vocabulaire « risque d'échec » contredit la posture descriptive du projet |
| `obtenirClasseRisque` | 3644 | Idem (jamais appelée + résultat jamais consommé dans le DOM) |

**Effort total chantier D : ~15 min.** Risque : Faible (zéro appelant identifié). Cohérence avec chantier J.

### Chantier E — Consolidation `utils-notifications.js`

73 sites d'appel cross-projet vers `afficherNotificationSucces` / `afficherNotificationErreur`. Wrappers défensifs dupliqués dans chaque sous-module (7+ duplications post-refactor). Décision répétée depuis session A trimestre-v2 : **reportée** par crainte de régression silencieuse.

**Action recommandée** :
1. Audit complet des 73 sites (variations de signature, gardes `typeof`, fallbacks).
2. Créer `js/utils-notifications.js` avec API stable.
3. Migration progressive module par module (1 commit par module, hook Vitest vert à chaque étape).
4. Retrait des wrappers dupliqués une fois tous les callers migrés.

**Effort total chantier E : ~3-5 h.** Risque : Moyen (régression silencieuse possible si une signature diverge). Tests visuels Grégoire recommandés en fin de chantier.

### Chantier F — Couplage `travaux-ui.js:4639` → `window.evaluationEnCours`

Premier cas observé sur les 5 refactors où un module externe **réassigne** un état pivot critique d'un autre module. Préservé tel quel pendant le refactor evaluation (préservation comportementale stricte).

**Question ouverte** : couplage légitime (annotation d'un travail déclenche une éval) ou à découpler ?

**Action recommandée** :
1. Investigation : lire les ~50 LOC autour de `travaux-ui.js:4639`, identifier le scénario qui réassigne le pivot.
2. Décision : (a) légitime → documenter en commentaire dans `travaux-ui.js` + `evaluation.js` ; (b) à découpler → introduire une API `Evaluation.demarrerEvaluation(...)` qui encapsule le set.
3. Si (b) : refactor ciblé + sentinelle Vitest pour empêcher toute réassignation future.

**Effort total chantier F : ~1-2 h** (option a) ou ~2-3 h (option b). Risque : Faible (audit seulement) à Moyen (refactor).

### Chantier G — 3 accès `localStorage` direct profil-etudiant

Clé `profilOngletDeveloppementActif` accédée 3× via `localStorage` direct au lieu de `db.*`. Préservation comportementale stricte au refactor.

**Action recommandée** : migrer vers `db.getSync('profilOngletDeveloppementActif', ...)` + `db.setSync(...)`. Aligner avec la convention du projet (cf. CLAUDE.md « Principe architectural — Single Source of Truth »).

**Effort total chantier G : ~30 min.** Risque : Faible (3 sites localisés, signature équivalente).

### Chantier H — Sous-découpage résidus (optionnel)

Deux résidus gros restent après les 5 refactors :
- `profil-etudiant-sections-affichage.js` : 4 654 LOC (38 fonctions `genererSection*`).
- `evaluation.js` (résidu) : 3 984 LOC (zone Modification + Verrouillage + Liste + Banque + Recherche imbriquées avec pivot `evaluationEnCours`).

**Décision Grégoire 18 mai** (profil-etudiant) et **18 mai** (evaluation) : reporter le sous-découpage. À évaluer si la dette devient gênante au quotidien.

**Action recommandée** :
- Profil-etudiant : sous-découper en `-sections-rendu.js` (~2 700 LOC, fonctions `genererSection*` pures) + `-sections-orchestre.js` (~1 950 LOC, `afficherProfilComplet` + `_resoudreSectionContenu` + dispatcher).
- Evaluation : extraire `evaluation-modification.js` (~1 360 LOC, zone Modification stricte) après refactor du couplage pivot (chantier F).

**Effort total chantier H : ~4-6 h** (optionnel — ne traiter que si gain ressenti). Risque : Moyen (modifications fonctionnelles, dépendances avec F).

### Chantier I — Tests Playwright rendus DOM

Couverture actuelle : 2 tests par module refactoré (chargement + sentinelle exports), 10 tests cumulés. **Pas le rendu effectif** des sections, palettes, badges. Dette §6.5 capitalisée à chaque rétrospective.

**Action recommandée** : 1-2 tests Playwright par module ciblant le rendu DOM minimal :
- bilan-reflexif : rendu questionnaire éditeur (1 test)
- productions : rendu modale métadonnées CC (1 test)
- trimestre-v2 : rendu calendrier horaires (1 test)
- profil-etudiant : rendu section Productions par défaut (1 test)
- evaluation : rendu palette critères + rendu rétroaction Bilan (2 tests)

**Effort total chantier I : ~3-5 h** (6 tests Playwright). Risque : Faible.

### Chantier J — Chantier vocabulaire alarmiste (audit annuel 1.3)

Source : `audit/reports/01-3-lexicon.md` — statut Jaune. 6 strings UI-VIVES + 2 UI-DOC alarmistes/prédictives + ~30 hits CSS `--risque-*` à arbitrer.

Trouvailles à traiter (résumé) :
- `profil-etudiant.js:5379` et `:5391` — strings « Alerte : Contexte fragile » / « Alerte critique »
- `index.html:11471, 11478, 10645, 10024` — 4 strings « intelligence prédictive » / « Détection précoce »
- `index.html:15355-15401` — FAQ entière « L'indice R prédit le risque d'échec » + tableau (formule obsolète)
- `index.html:15611, 15647` — glossaire « Indice R » + « Dépistage » (formules obsolètes)
- Tokens CSS `--risque-*` (480 hits, palette historique) — décision Grégoire pendante (renommer ou conserver ?)
- Label `v2-seuil-fragile` — décision Grégoire pendante

**Action recommandée** :
1. Reformuler les 8 strings UI vers vocabulaire descriptif (réfs. SKILL_RaI).
2. Retirer la FAQ « Indice R prédit » + tableau (lien chantier D — `calculerRisqueEchec` retiré).
3. Glossaire `index.html:15611, 15647` aligné sur la nouvelle posture.
4. Décision Grégoire sur tokens CSS `--risque-*` (renommage `--niveau-attention-*` ou conservation legacy ?).
5. Décision Grégoire sur label `v2-seuil-fragile` (conservation, atténuation, ou alignement ?).

**Effort total chantier J : ~2-3 h** (priorité haute audit 1.3) — visibilité externe AQPC. Risque : Faible.

---

## 3. Inventaire Niveau 2 — Cat-B méthode (~20 propositions)

Récap rapide (détails dans METHODE-REFACTORING §7 par module) :

| Module | Propositions | Statut |
|---|---:|---|
| bilan-reflexif (15 mai) | 6 | **ACTÉES** — intégrées dans METHODE-REFACTORING § historique révisions le 15 mai (§3 étape 0/1/4, §4 check-list étape 3, §5 anti-patterns §5.6/§5.7, §6.5 gabarit) |
| productions (16 mai) | 4 | **EN ATTENTE** — déposées dans memoir `feedback-refactor-*` (5 mémoires sessions productions) |
| trimestre-v2 (17 mai) | 5 | **EN ATTENTE** — déposées dans 5 mémoires feedback (cf. MEMORY.md session 17 mai) |
| profil-etudiant (18 mai) | 6 | **EN ATTENTE** — déposées dans METHODE §7 entrée profil-etudiant.js (sous-section « Améliorations de la méthode à proposer ») |
| evaluation (21 mai) | 5 | **EN ATTENTE** — déposées dans METHODE §7 entrée evaluation.js (sous-section « Améliorations de la méthode à proposer ») |
| **Total propositions en attente** | **20** | **À ARBITRER avec Grégoire** |

**Effort arbitrage + intégration : ~1-2 h** (session dédiée parcours décisionnel + Edit METHODE-REFACTORING §3/§4/§5/§6).

Une fois actées, METHODE-REFACTORING est **gelée jusqu'au prochain cycle de refactors** (Q3 2026 si nouveau cycle).

---

## 4. Tracks et ordre d'exécution

### Track 1 — Quick wins (~3 h)

**Items couverts** : A (13 bugs) + C (3 doublons) + D (2 codes morts).
**Cible** : 18 items fermés en 1 session. État codebase propre rapidement.
**Recommandation** : 1 session dédiée, 1 commit par chantier (A=1, C=1, D=1) ou par bug si gros (#102 par exemple).
**Branche** : `cat-b/track-1-quickwins` (FF mergeable sur main quand terminée).
**Tests** : 89/89 verts à chaque commit (hook pré-push).

### Track 2 — Méthode (~1-2 h)

**Items couverts** : Niveau 2 — 20 propositions Cat-B méthode.
**Cible** : arbitrage + intégration METHODE-REFACTORING.md §3/§4/§5/§6 + ligne historique révisions.
**Recommandation** : 1 session courte parcours décisionnel avec Grégoire (oui/non/reformulation pour chaque proposition), puis Edit METHODE-REFACTORING.
**Branche** : commit direct sur `main` ou `cat-b/track-2-methode` selon préférence.

### Track 3 — Héritages cyc > 30 (~6-10 h)

**Items couverts** : B (14 fonctions, 5 modules concernés).
**Cible** : ESLint baseline 0 fonction cyc > 30 dans le codebase.
**Recommandation** : 5 sessions ~1-2 h chacune (1 par module). Pattern productions/profil-etudiant/evaluation mature : audit ESLint complexity avant + après éclatement, sentinelles élargies si besoin.
**Branche** : `cat-b/track-3-heritages-<module>` par module (5 branches successives ou 1 unique).
**Préalable** : confirmer les 2 héritages productions manquants (`audit ESLint --rule complexity:30 js/productions*.js`).

### Track 4 — Transversaux (~8-15 h)

**Items couverts** : E (consolidation utils-notifications) + F (couplage travaux-ui→evaluationEnCours) + G (3 accès localStorage profil-etudiant) + H (sous-découpage résidus, optionnel) + I (tests Playwright rendus DOM) + J (vocabulaire alarmiste audit 1.3).
**Cible** : zéro dette transversale identifiée + tests rendus DOM en place.
**Recommandation** : sessions thématiques au fil de l'eau. Ordre suggéré intra-Track 4 : G (30 min) → F (1-3 h) → E (3-5 h) → J (2-3 h, **pré-AQPC**) → I (3-5 h) → H (4-6 h, optionnel).
**Branche** : `cat-b/track-4-<chantier>` par chantier ou groupage thématique.

---

## 5. Critères de clôture du cycle Cat-B

Le cycle Cat-B est considéré clos quand :

- **A1.** 13 bugs latents #96-108 fermés dans SUIVI-BUGS section « Corrigés ».
- **A2.** 0 fonction cyc > 30 dans le codebase (`npx eslint --rule complexity:30 js/*.js`).
- **A3.** 0 doublon de fonction dans evaluation.js (3 doublons résolus).
- **A4.** 2 codes morts alarmistes retirés (`calculerRisqueEchec`, `obtenirClasseRisque`).
- **A5.** `utils-notifications.js` créé + 73 callers migrés (chantier E).
- **A6.** Couplage `travaux-ui.js:4639` documenté ou découplé (chantier F).
- **A7.** 3 accès localStorage profil-etudiant migrés vers `db.*` (chantier G).
- **A8.** 6 tests Playwright rendus DOM ajoutés (chantier I).
- **A9.** Strings UI alarmistes reformulées + FAQ « Indice R » retirée + glossaire aligné (chantier J).
- **A10.** 20 propositions Cat-B méthode actées + METHODE-REFACTORING §3/§4/§5/§6 intégrées.

**H (sous-découpage résidus) est optionnel** — n'entre pas dans les critères de clôture sauf décision Grégoire.

---

## 6. Articulation avec AQPC 3 juin (pré-AQPC = J+13)

**Pré-AQPC souhaitable** : Track 1 (quick wins ~3 h) + Track 2 (méthode ~1-2 h) + J (vocabulaire alarmiste ~2-3 h, lien audit 1.3).

**Effort pré-AQPC ciblé : ~6-8 h** sur 13 jours. Faisable en 3-4 sessions courtes.

**Bénéfice AQPC** : statut audit 1.3 passé Jaune → Vert (chantier J) + codebase propre côté bugs + méthode gelée et publiable. Cohérent avec le rapport `audit/reports/SUMMARY-aqpc.md`.

Track 3 (héritages cyc) et reste de Track 4 sont post-AQPC sans contrainte de date.

---

## 7. Statut courant

| Track | Statut | Démarré | Terminé |
|---|---|---|---|
| Track 1 — Quick wins | À démarrer | — | — |
| Track 2 — Méthode | À démarrer | — | — |
| Track 3 — Héritages cyc > 30 | À démarrer | — | — |
| Track 4 — Transversaux | À démarrer | — | — |

Ce document est mis à jour à chaque clôture de chantier.

---

## 8. Historique des révisions du plan

| Date | Modification | Auteur |
|---|---|---|
| 2026-05-21 | Création — consolidation post-merge evaluation (5e refactor). Ordre 1→2→3→4 acté avec Grégoire. | Cowork (Claude) + Grégoire |
