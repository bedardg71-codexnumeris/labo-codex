# Plan moyen terme — refactoring des god modules + hygiène structurelle

**Date de rédaction** : 2026-05-15
**Échéance souple** : 2026-06-02 (la veille de l'accueil des novices) pour le gros du refactoring, avec poursuite possible en Q3 2026 pour les ajustements résiduels
**Document parent** : `audit/PLAN-PHASE-2-OVERVIEW.md`
**Documents apparentés** : `audit/PLAN-COURT-TERME.md`, `audit/refactoring-prep/MODULES-MAP.md` (annexe technique de découpage)
**Source des recommandations** : `audit/reports/SUMMARY-internal.md` Priorité moyenne + `audit/reports/02-summary.md` + `audit/reports/03-summary.md`

---

## 1. Objet et périmètre

Ce plan moyen terme couvre la **dette structurelle des axes 2 (santé du code) et 3 (architecture)** identifiée par l'audit annuel 2026. Concrètement :

- **Refactoring progressif des 5 god modules** : `evaluation.js`, `productions.js`, `profil-etudiant.js`, `trimestre-v2.js`, `bilan-reflexif.js` — cumul 31 460 LOC actuels, cibles : 32-33 sous-modules de 300 à 2 250 LOC chacun. Voir `audit/refactoring-prep/MODULES-MAP.md` pour la cartographie détaillée.
- **Consolidation des helpers globaux multi-définis** (`afficherNotificationSucces`/`Erreur`, `echapperHtml`, `cle()`).
- **Mise à jour de `docs/DATA-OWNERSHIP.md`** (5 semaines de retard sur le code, 4 owners erronés, 8 violations non listées).
- **Hygiène OpenSSF Scorecard** : `SECURITY.md`, Dependabot, Branch Protection, GitHub Actions tests Vitest+Playwright, CodeQL.
- **Hygiène licences** (suite de ce qui est en court terme) : SPDX headers ou dérogation, `libs/VERSIONS.md`, fichiers LICENSE locaux.
- **Retrait ou réécriture** de la documentation opérationnelle obsolète (`docs/operations/PROTOCOLE_MISE_A_JOUR_BETA.md`, `scripts/update-version.sh`).

**Ce qui est explicitement hors périmètre du moyen terme** :

- Plan Tier 6.5 sur `modalitesEvaluation` (14 écrivains, violation #1 CRITIQUE documentée). Sa résolution exige un audit dédié de cette clé, l'identification d'une API canonique, et la migration des 13 contourneurs sur un sprint distinct. **Reporté en long terme** sauf si Grégoire le réinscrit ici.
- Effacement par étudiant (Loi 25 droit d'effacement), ÉFVP formelle, politique de rétention détaillée — **long terme** (ou priorité moyenne axe 5).
- Refactoring de `reserve.js` en 3 couches (FSAPI / métier / UI) — **long terme** : module hors des 5 god modules ciblés ici, mais identifié par audit 3.x comme prioritaire pour casser les 4 cycles directs.
- Chantier publish/subscribe typé pour les 405 actions du dispatcher — **long terme**.

**Effort total estimé** : 27 à 39 heures pour le refactoring des 5 god modules + 8 à 12 heures pour le reste (helpers, scorecard, hygiène). **Total 35 à 51 heures**. Tient dans la fenêtre 19-23 mai (refactoring intensif) + 23 mai - 2 juin (ajustements) si Grégoire est à temps plein.

---

## 2. Calendrier proposé

Le moyen terme s'imbrique dans le calendrier global de `PLAN-COURT-TERME.md`. Trois fenêtres :

| Période | Travail moyen terme | Articulation court terme |
|---|---|---|
| **15-19 mai** (zone protégée pour les évaluations Grégoire) | Refactoring `bilan-reflexif.js` (couplage faible, module pilote pour valider la méthode) + écriture des tests de régression sur les fonctions cibles des autres modules + écriture des sous-modules de `productions.js` (modifications mineures hors évaluation directe). | Cowork rédige les plans, Claude Code corrige `eval.productionId` et démarre `PRIVACY.md`. |
| **19-23 mai** (zone open) | Refactoring intensif de `trimestre-v2.js`, `profil-etudiant.js`, puis `evaluation.js` en dernier. Consolidation des helpers globaux. Mise à jour `DATA-OWNERSHIP.md`. | Court terme tourne en parallèle : finalisation documentation publique. |
| **23 mai - 2 juin** (finalisation) | Ajustements post-refactoring, OpenSSF Scorecard (SECURITY.md, Dependabot, Branch Protection, GitHub Actions, CodeQL), licences hygiène (libs/VERSIONS.md, fichiers LICENSE locaux). | Court terme : accessibilité, vocabulaire UI, audit `rapportsBugArchives`. |

**Marges** : si un refactoring prend plus de temps que prévu, prioriser **(a)** la stabilité de l'app pour la présentation du 3 juin, **(b)** la documentation publique de court terme. Le refactoring peut déborder en Q3 2026 sans dommage critique pour les expérimentateurs (les god modules tournent — c'est de la dette interne, pas un bloqueur visible).

---

## 3. Préalable obligatoire : tests de régression

**Avant** chaque refactoring de module, Claude Code doit écrire les tests de régression listés dans `MODULES-MAP.md` §2.x, et les faire passer **sur le code actuel**. Si un test échoue sur le code actuel, c'est qu'il révèle un bug latent — à traiter avant de refactorer.

| Module | Tests de régression à écrire avant | Cf. MODULES-MAP §2.x |
|---|---:|---|
| `bilan-reflexif.js` | 7 (création, import texte, export texte, parcours, réflexion, import CSV, rapport) | 2.5 |
| `productions.js` | 6 (création, modification, suppression, import/export, bibliothèque, verrouillage) | 2.2 |
| `trimestre-v2.js` | 5 (création trimestre, CRUD cours/étudiants/horaires/groupes-cours/enseignants, changement groupe-cours actif, archivage, import étudiants CSV) | 2.4 |
| `profil-etudiant.js` | 7 dont 5 réutilisables des snippets `01-2-calculations.md` (affichage profil, IPB, moyennes critères, diagnostic, pattern, RaI, modal confidentiel) | 2.3 |
| `evaluation.js` | 7 (chargement, calcul note, sauvegarde nouvelle, modification, filtre par production, verrouillage, auto-save) | 2.1 |

Total : **32 tests** à écrire avant de toucher au code. Effort estimé : ~6 à 8 heures (1 à 1 h 30 par module). À répartir entre Cowork (rédige les spec des tests) et Claude Code (les implémente en Vitest + Playwright).

**Pour `profil-etudiant.js`** : 5 des 7 tests existent déjà comme snippets de validation dans `audit/01-fidelity/calculations-tests.md` (sous-audit 1.2 — 156/157 cas conformes). Les transformer en tests Vitest pérennes est une opération rapide (~1 h).

---

## 4. Séquencement du refactoring des 5 god modules

Ordre recommandé par `MODULES-MAP.md` §3.1, justifié par couplage croissant et risque croissant :

### 4.1 Module pilote — `bilan-reflexif.js` (15-19 mai, ~4-6 h)

| Phase | Action | Effort |
|---|---|---:|
| 4.1.a | Écrire les 7 tests de régression Vitest | 1 h |
| 4.1.b | Valider que les 7 tests passent sur le code actuel | 15 min |
| 4.1.c | Extraire `bilan-reflexif-core.js` (~370 LOC) | 30 min |
| 4.1.d | Extraire `bilan-reflexif-editeur.js` (~740 LOC) | 1 h |
| 4.1.e | Extraire `bilan-reflexif-parcours.js` + `bilan-reflexif-reflexion.js` (~965 LOC cumulés) | 1 h 30 |
| 4.1.f | Extraire `bilan-reflexif-import-export-texte.js` + `bilan-reflexif-csv.js` (~1 520 LOC cumulés) | 1 h |
| 4.1.g | Extraire `bilan-reflexif-rapport.js` (~880 LOC) | 30 min |
| 4.1.h | Valider que les 7 tests passent toujours après chaque extraction. Tester manuellement l'éditeur de bilan dans l'app. | 30 min |

**Objectif annexe** : valider la méthode de découpage (entête IIFE, exports `window.X` propres, ordre de chargement dans `index.html`) avant de la dérouler sur les modules plus risqués.

### 4.2 `productions.js` (15-19 mai en parallèle si tests verts, ~3-4 h)

| Phase | Action | Effort |
|---|---|---:|
| 4.2.a | Écrire les 6 tests de régression Vitest | 1 h |
| 4.2.b | Découper `sauvegarderProduction` (top complexité cyc 79) en sous-fonctions par section du formulaire : identité, échéances, grilles, ponderation. Tests verts requis. | 1 h 30 |
| 4.2.c | Extraire `productions-bibliotheque.js` (~960 LOC) | 30 min |
| 4.2.d | Extraire `productions-import-export.js` (~640 LOC) | 30 min |
| 4.2.e | Extraire `productions-liste.js` (~680 LOC) | 30 min |
| 4.2.f | Renommer le résidu en `productions-core.js` (~1 610 LOC) | 5 min |
| 4.2.g | Valider que les 6 tests passent. Test manuel : créer + modifier + supprimer une production. | 30 min |

**Précaution** : pendant 15-19 mai, Grégoire utilise productions.js pour ses corrections. Refactoring possible **uniquement si les 6 tests de régression sont verts**. Sinon, attendre le 19 mai.

### 4.3 `trimestre-v2.js` (19-23 mai, ~8-12 h)

| Phase | Action | Effort |
|---|---|---:|
| 4.3.a | Consolider `afficherNotificationSucces`/`Erreur` dans `js/utils-notifications.js` (préalable transverse) | 30 min |
| 4.3.b | Écrire les 5 tests de régression Vitest + 2 Playwright (changement groupe-cours actif est critique) | 1 h 30 |
| 4.3.c | Extraire `trimestre-v2-init.js` (~870 LOC : init + identification + calendrier + événements) | 1 h |
| 4.3.d | Extraire `trimestre-v2-liste.js` (~590 LOC : liste trimestres + archivage + bibliothèque) | 30 min |
| 4.3.e | Extraire `trimestre-v2-enseignants.js` (~315 LOC) | 30 min |
| 4.3.f | Extraire `trimestre-v2-horaires.js` (~830 LOC) | 1 h |
| 4.3.g | Extraire `trimestre-v2-cours.js` (~970 LOC) | 1 h |
| 4.3.h | Extraire `trimestre-v2-etudiants.js` (~895 LOC) | 1 h |
| 4.3.i | Extraire `trimestre-v2-groupes-cours.js` (~1 080 LOC) | 1 h 30 |
| 4.3.j | Refactorer `changerGroupeCoursActifV2` (cyc 86 → ≤ 30) dans `trimestre-v2-orchestre.js`. **Précaution maximale** : `window.trimestreActif` doit rester cohérent. Tests Playwright sur transition de contexte requis. | 1 h 30 |
| 4.3.k | Validation : test manuel complet du parcours de création trimestre + cours + étudiants + horaires + groupes-cours + changement de contexte. | 30 min |

### 4.4 `profil-etudiant.js` (19-23 mai, ~6-9 h)

| Phase | Action | Effort |
|---|---|---:|
| 4.4.a | Convertir les 5 snippets de `01-2-calculations.md` en tests Vitest + écrire 2 tests UI Playwright | 1 h |
| 4.4.b | Extraire `profil-etudiant-helpers.js` (~545 LOC) — inclut correction T-L3 sur `interpreterMobilisation` (cf. court terme D.3) | 1 h |
| 4.4.c | Extraire `profil-etudiant-calculs.js` (~1 215 LOC). Tests de calcul couverts par 4.4.a — risque faible. | 1 h |
| 4.4.d | Extraire `profil-etudiant-diagnostics.js` (~830 LOC) | 1 h |
| 4.4.e | Extraire `profil-etudiant-rapport.js` (~365 LOC) | 30 min |
| 4.4.f | Extraire `profil-etudiant-actions.js` (~615 LOC) | 30 min |
| 4.4.g | Extraire `profil-etudiant-confidentiel.js` (~365 LOC) | 30 min |
| 4.4.h | Le résidu (`profil-etudiant-sections-affichage.js`, ~3 700 LOC) reste gros — à éclater en sous-sections plus tard. Marquer comme dette intermédiaire dans `BACKLOG.md`. | 15 min |
| 4.4.i | Investiguer les 2 accès `localStorage` directs (contournements de `db.*`) — soit migrer vers `db.*`, soit documenter par commentaire pourquoi le contournement est nécessaire. | 30 min |

### 4.5 `evaluation.js` — en dernier, avec recul maximal (19-23 mai, ~6-8 h)

| Phase | Action | Effort |
|---|---|---:|
| 4.5.a | Écrire les 7 tests de régression Vitest + 2 Playwright (filtre par production est critique post-fix `eval.productionId`) | 1 h 30 |
| 4.5.b | Résoudre les 3 doublons de définition : `restaurerPreferenceTri` (lignes 4295/4309), `obtenirClasseNote` (3681/4390), `filtrerListeEvaluations` (4178/6851). Audit cross call-sites de chacune. | 1 h |
| 4.5.c | Retirer les 2 fonctions de code mort alarmiste : `calculerRisqueEchec`, `obtenirClasseRisque`. Audit call-sites d'abord (cf. court terme D.2). | 15 min |
| 4.5.d | Décider du devenir de `window.evaluationEnCours` : (a) garder l'état global tel quel, (b) encapsuler dans un nouvel `evaluation-state.js` qui expose une API `getEvaluationEnCours()`, `setEvaluationEnCours(...)`, `resetEvaluationEnCours()`. Recommandation Cowork : (b) — plus propre, mais effort additionnel ~1 h. | 5 min de décision + 1 h si option (b) |
| 4.5.e | Extraire `evaluation-chargement.js` (~1 000 LOC) | 45 min |
| 4.5.f | Extraire `evaluation-calcul.js` (~640 LOC) | 30 min |
| 4.5.g | Extraire `evaluation-retroaction.js` (~2 250 LOC — gros mais cohésif, à éclater plus tard) | 1 h |
| 4.5.h | Extraire `evaluation-sauvegarde.js` (~810 LOC) | 45 min |
| 4.5.i | Extraire `evaluation-modification.js` (~1 360 LOC). **Refactorer** `modifierEvaluation` et `sauvegarderEvaluationModifiee` (top complexité) en sous-fonctions. | 1 h 30 |
| 4.5.j | Extraire `evaluation-liste.js` + `evaluation-handlers.js` (résidus) | 30 min |
| 4.5.k | Validation : tester manuellement le parcours complet d'évaluation (chargement, sélection grille, sélection niveaux, sauvegarde, modification, verrouillage, banque, filtre par production). | 1 h |

---

## 5. Actions transverses (en parallèle des refactorings)

### 5.1 Consolidation des helpers globaux multi-définis (~1 h)

| Action | Effort |
|---|---:|
| Créer `js/utils-notifications.js` consolidé : `afficherNotificationSucces`, `afficherNotificationErreur`, `afficherProgression`, `majProgression`, `masquerProgression` | 30 min |
| Centraliser `echapperHtml`, `assainirObjet` dans un module sécurité (existe peut-être déjà — vérifier) | 15 min |
| Supprimer les redéfinitions de `cle()` dans les 8 fichiers consommateurs (laisser uniquement dans `trimestres.js`) | 15 min |

### 5.2 Mise à jour `docs/DATA-OWNERSHIP.md` (~1 h)

| Action | Effort |
|---|---:|
| Corriger les 4 owners erronés (`horaireHebdo`, `profilEnseignant`, `productions`, `preferencesUtilisateur`) | 15 min |
| Ajouter les 8 nouvelles violations multi-écrivains détectées par 3.1 | 15 min |
| Marquer les clés à zéro écrivain littéral (validation manuelle préalable) | 15 min |
| Idéalement : script auto-régénérant à partir du code (`scripts/regenerer-data-ownership.js`) — long terme | — |

### 5.3 OpenSSF Scorecard — 4 zéros corrigeables (~2 h)

| Action | Effort | Critère de validation |
|---|---:|---|
| Créer `SECURITY.md` à la racine | 30 min | Protocole de signalement de vulnérabilité, périmètre, délais de réponse |
| Activer Dependabot (`.github/dependabot.yml`) pour `tests/` et `audit/` | 10 min | Fichier créé, alertes activées dans tableau de bord GitHub |
| Configurer Branch Protection sur `main` | 5 min | Force-push interdit, history linéaire requis, status checks si CI activée |
| Déplacer les tests Vitest + Playwright en GitHub Actions (`.github/workflows/tests.yml`) | 30 min | Tests tournent en CI publique sur chaque push, badge visible dans le README |
| Activer CodeQL (`.github/workflows/codeql.yml`, template GitHub) | 15 min | Scans SAST automatiques activés |
| Activer le `.gitconfig` local pour corriger l'attribution `Claude` → `bedardg71-codexnumeris` | 5 min | Tous les commits futurs portent le bon nom |

### 5.4 Hygiène licences résiduelle (~1 h)

| Action | Effort |
|---|---:|
| Créer `libs/VERSIONS.md` (nom + version + licence + origine des 8 libs vendored) | 30 min |
| Créer `LICENSE-AGPL-3.0.txt` et `LICENSE-CC-BY-NC-SA-4.0.txt` en local | 15 min |
| Corriger `audit/package.json` (`license: "ISC"` → `"AGPL-3.0-only"` ou retirer) | 5 min |
| Décider et appliquer : headers SPDX dans les 129 fichiers JS, ou ADR de dérogation documentée | 1 h 30 ou 10 min selon décision |

### 5.5 Documentation opérationnelle obsolète (~1 h 30)

| Action | Effort |
|---|---:|
| Retirer ou réécrire `docs/operations/PROTOCOLE_MISE_A_JOUR_BETA.md` (références mortes, lignes d'index.html erronées) | 30 min |
| Retirer ou réécrire `scripts/update-version.sh` (ne touche pas `version.json` ni `js/init-inline.js`, hard-code « janvier 2026 » en ligne 87) | 45 min |
| Enregistrer le hash git de la version déployée : ajouter `commit` dans `version.json` au bump, ou tenir un `DEPLOY-HISTORY.md` | 30 min |

---

## 6. Précautions transverses

- **Branches** : créer une branche `refactor/2026-mai` depuis `main`. Pas de commit direct sur `main`. Chaque sous-module extrait = un commit séparé avec format `refactor(<module>): extraire <sous-module>`. Tests verts requis avant chaque commit.
- **Backups Codex** : Grégoire fait un export Codex data **avant** chaque session de refactoring qui touche `evaluation.js`, `productions.js`, `profil-etudiant.js`, `trimestre-v2.js`. Le bilan-reflexif a un couplage zéro aux clés SSOT critiques, backup non requis spécifiquement.
- **Tests verts requis avant merge sur main** : le seul critère de merge `refactor/2026-mai` → `main` est que les 32 tests de régression passent.
- **Validation Grégoire requise** avant merge : Grégoire valide manuellement le fonctionnement de chaque module refactoré avant le merge.
- **Pas de commit direct sur main pendant la zone protégée (15-19 mai)** sauf pour le fix `eval.productionId` (cf. court terme A.1).
- **En cas de régression détectée par Grégoire** : revert immédiat du commit fautif, analyse de la cause, correction sur la branche, nouveau merge après validation.

---

## 7. Critères de fin du plan moyen terme

Le plan moyen terme est considéré « substantiellement achevé » quand les conditions suivantes sont réunies, idéalement avant le 2 juin :

1. Les 5 god modules ont été découpés en sous-modules selon `MODULES-MAP.md`. Effort de déploiement effectif documenté (les écarts avec l'estimation sont consignés dans un addendum à `MODULES-MAP.md`).
2. Les 32 tests de régression sont écrits et passent sur `main`.
3. Les 3 doublons de fonctions dans `evaluation.js` sont résolus.
4. Les fonctions de code mort identifiées par l'audit (2 dans `evaluation.js`, plus celles éventuellement identifiées dans les autres modules) sont retirées.
5. Les helpers globaux (`afficherNotification*`, `cle()`) sont consolidés.
6. `docs/DATA-OWNERSHIP.md` est à jour.
7. Les 4 zéros corrigeables d'OpenSSF Scorecard sont fermés (`SECURITY.md`, Dependabot, Branch Protection, GitHub Actions tests + CodeQL).
8. La doc opérationnelle obsolète (`PROTOCOLE_MISE_A_JOUR_BETA.md`, `scripts/update-version.sh`) est retirée ou réécrite.
9. `audit/PLAN-PHASE-2-OVERVIEW.md` est mis à jour avec une section « Bilan moyen terme ».

**Si débordement après le 2 juin** : les chantiers résiduels sont reportés en Q3 2026 et inscrits dans `BACKLOG.md` avec leur état d'avancement. Pas de pression d'achèvement absolu — l'arrivée des novices ne dépend pas de la complétude du refactoring (les god modules tournent), elle dépend de la complétude du court terme.

---

## 8. Risques et points de vigilance

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Régression silencieuse sur les calculs pédagogiques | Faible | Élevé | Tests Vitest sur les snippets de 1.2 (déjà 156/157 cas validés) couvrent ce risque |
| Atomicité de `changerGroupeCoursActifV2` cassée | Moyen | Élevé | Tests Playwright sur transition de contexte, revue par Grégoire après le refactor |
| `window.evaluationEnCours` désynchronisé entre sous-modules | Moyen | Moyen | Encapsulation dans `evaluation-state.js` (option 4.5.d.b), revue de chaque écriture |
| Fenêtre de refactoring trop courte | Élevé | Moyen | Plan privilégie la décomposition propre sur l'exhaustivité ; les résidus glissent en Q3 2026 |
| Conflit entre `refactor/2026-mai` et `ds-update/2026-mai` | Moyen | Faible | Merger `ds-update` sur `main` AVANT de démarrer `refactor` (D-CT-4 du court terme) |

---

## 9. Articulation avec les autres documents

- **`audit/refactoring-prep/MODULES-MAP.md`** : annexe technique détaillée. À consulter pour chaque module avant son refactoring (zones fonctionnelles, fonctions top-complexité, états globaux, tests de régression précis).
- **`audit/PLAN-COURT-TERME.md`** : actions pour préserver le fonctionnement quotidien + accueillir les novices. Plusieurs actions courtes (fix bug, retrait code mort, audit `rapportsBugArchives`) sont des préalables ou cohabitent avec ce plan.
- **`audit/PLAN-AQPC.md`** : archive du plan pré-pivot.
- **`audit/PLAN-LONG-TERME.md`** : trajectoire v1.0 et commun pédagogique. Recevra notamment le plan Tier 6.5 sur `modalitesEvaluation`, le refactoring `reserve.js`, le système publish/subscribe.
- **`audit/PLAN-PHASE-2-OVERVIEW.md`** : à mettre à jour pour refléter la nouvelle structure à 4 plans.
- **`audit/reports/02-summary.md` et `03-summary.md`** : sources des constats et des recommandations qui motivent ce plan.

---

**Fin du plan moyen terme.** Document à mettre à jour à mesure que les refactorings sont exécutés (effort réel vs estimé, frontières effectives vs proposées, régressions détectées et corrigées).
