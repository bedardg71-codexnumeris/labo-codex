# RELAIS — Grilles h2026 désappariées des évaluations (récupération)

**Date** : 28 juin 2026 (nuit)
**Nature** : dossier de diagnostic autoportant, produit par lecture seule de l'export codex `…2026-06-28-18h00.zip` (= `donnees.json`, état post-migration #358). **AUCUNE écriture de données.**
**Destinataire** : la session Claude Code qui exécutera la récupération (séance dédiée, à froid, sur backup).
**Statut des données** : **notes saines** (stockées par éval, L0 vert). Le problème est la **définition** des grilles, pas les notes.

---

## 0. TL;DR

Les 408 évaluations de h2026 référencent **3 grilles dont la définition est introuvable** dans le jeu de travail. Le dropdown h2026 montre **3 autres grilles** (copies « …A25 » créées en juin) que **zéro éval n'utilise**. La préférence de dépistage est **vide**. Conséquence : les notes s'affichent (stockées), mais **dépistage SOLO, critères, ré-évaluation** sont cassés (warning « Pas de grille de référence », ×23 ; menu « Grille d'évaluation » vide à l'ouverture d'une éval).

**Bonne nouvelle — récupération simple et sûre** : les `critereId` des copies « A25 » sont **identiques** à ceux que les évals attendent. Il suffit de **recréer les 3 grilles sous les ids attendus par les évals**, avec le contenu des copies « A25 ». Les notes recalculeront à l'identique.

**Origine** : artefact de la **reconstruction de juin** (de nouvelles grilles « A25 » ont reçu de nouveaux ids de grille, mais les évals — *grade-bearing*, jamais réécrites, invariant #350 — gardent les anciens ids). **Ni #358 ni le correctif de boot du 28 juin n'en sont la cause.** C'est le **même pattern que #346** (coursId périmé), mais sur `evaluation.grilleId`. Visible dès le dry-run du 26 juin (cf. [[namespacing-par-trimestre]] lignes 77-82 : « prod porte GRILLE1759243306842, ses 38 évals utilisent grille_1772187755149 ») mais non identifié alors comme « définition manquante » (L2 ne vérifie que le PARTAGE d'id, pas l'EXISTENCE ; L0 agrège les notes stockées).

---

## 1. Le fait, vérifié au code (export 18h00)

**grilleId utilisés par les évals h2026 actives (`!remplaceeParId`)** :

| grilleId (référencé par les évals) | nb évals | famille |
|---|---|---|
| `grille_1770742838756_23q82vbsk` | 205 | Grille-4 (4 critères) |
| `grille_1772187755149_uq1oiiafa` | 92 | FR-HOLIS (5 critères) — **référence dépistage attendue** |
| `GRILLE1759529438501` | 86 | FR-ALGO (5 critères) |

→ **Aucun** de ces 3 ids n'existe dans un `*_grillesTemplates` (recherche exhaustive : h2026, a2025, demo, global, bibliothèque). Mais leurs **cartouches existent** (`cartouches_grille_1770742838756…`, `cartouches_grille_1772187755149…`, `cartouches_GRILLE1759529438501`).

**`h2026_grillesTemplates` (le dropdown actuel)** contient 3 grilles orphelines (créées juin, 0 éval) :

| id (orphelin, dans le dropdown) | nom | critères |
|---|---|---|
| `GRILLE_1782504228322_1_6398d555452d` | Grille-5 FR-HOLIS-30 A25 | 5 |
| `GRILLE_1782504228330_a_4b469c6b7b5e` | Grille-4 A25 | 4 |
| `GRILLE_1782504228333_f_db90dd7b3554` | Grille-5 FR-ALGO-30 A25 | 5 |

**Préférence** `preferencesUtilisateur.grilleReferenceDepistage` = `""` (vide ; le « restauré » du 28 juin a reverté avec la durabilité, comme les productions #346).

---

## 2. La récupération est faisable et sûre — les `critereId` s'alignent EXACTEMENT

| Grille attendue par les évals | `critereId` attendus (stockés dans l'éval) | Source de contenu (mêmes `critereId`) |
|---|---|---|
| `grille_1772187755149` (FR-HOLIS) | CR1759243306842 / 331050 / 365467 / 379949 / 428715 | **`GRILLE_1782504228322`** (copie A25) **ou** a2025 `GRILLE1759243306842` |
| `GRILLE1759529438501` (FR-ALGO) | CR1759529438502 / 458633 / 476784 / 494819 / 555936 | **`GRILLE_1782504228333`** (copie A25) **ou** a2025 `GRILLE_A2025_FR_ALGO` |
| `grille_1770742838756` (Grille-4) | CR17592642064900.618… / .914… / .068… / .213… | **`GRILLE_1782504228330`** (copie A25) **ou** `partage_grilles[PARTAGE_…_grille_1770742838756]` (même id, contient `criteres`) |

Comme les `critereId` correspondent, les `criteres` déjà stockés dans chaque éval (avec `niveauSelectionne`, `retroaction`) s'apparieront à la définition recréée → **recalcul identique**, dépistage et progression des critères opérationnels.

Pondérations observées dans les copies A25 (à confirmer par Grégoire) : FR-HOLIS/FR-ALGO = Structure 15 / Rigueur 20 / Plausibilité 10 / Nuance 25 / Français écrit 30 ; Grille-4 = Structure 20 / Rigueur 30 / Plausibilité 15 / Nuance 35.

---

## 3. Plan de récupération proposé (à exécuter en séance dédiée, sur backup)

1. **Backup Codex frais** + export `donnees-AVANT.json`. Capturer L0 h2026 (46 notes Moteur) AVANT.
2. **Recréer les 3 grilles dans `h2026_grillesTemplates`** sous les ids **attendus par les évals** (`grille_1772187755149`, `GRILLE1759529438501`, `grille_1770742838756`), en copiant `criteres` (+ `echelleId`, `dansBibliotheque`) depuis la copie « A25 » correspondante, avec un **nom propre** (sans « A25 » — résout le renommage). Idéalement via une fonction console conservatrice + dry-run (modèle `reparerCoursIdProductions` : n'écrire que `h2026_grillesTemplates`, dry-run par défaut, `await db.flush()`).
3. **Régler #354** : `preferencesUtilisateur.grilleReferenceDepistage = "grille_1772187755149_uq1oiiafa"` (FR-HOLIS), OU re-sélectionner la grille FR-HOLIS dans le menu dépistage une fois (2) fait (le menu écrira l'id correct). + `db.flush()`.
4. **Retirer les 3 copies orphelines** « A25 » (`GRILLE_1782504228322/330/333`) de `h2026_grillesTemplates` (zéro éval ne les utilise) — APRÈS avoir vérifié que rien d'autre n'y pointe (productions h2026 : leur `grilleId` a été réaligné sur l'id des évals au BLOC 2 / #346, donc déjà sur les ids attendus — à RE-vérifier car les productions ont aussi reverté ce soir, voir [[coursid-productions-h26-repare]]). Gérer leurs cartouches `cartouches_GRILLE_1782504228322…` (orphelines après retrait).
5. **Vérifier** : L0 h2026 APRÈS = 46 notes Moteur **identiques** ; ouvrir une éval → grille + critères chargent ; dépistage SOLO → plus de warning ; recompte d'une éval rouverte = même note. Mac + iPad si écran touché.

---

## 4. Décisions pour Grégoire (séance dédiée)

- **Quelle source de contenu** par grille : copie « A25 » (présente dans h2026) vs jumelle a2025 vs partage. Elles ont les mêmes `critereId` ; **vérifier que les pondérations/échelle sont celles voulues pour h2026** (les copies A25 peuvent différer de l'a2025 sur la pondération).
- **Noms propres** des 3 grilles (sans « A25 »).
- **Référence de dépistage** = FR-HOLIS `grille_1772187755149` (à confirmer ; la mémoire le dit, mais valider).
- **Sort des copies orphelines** « A25 » : supprimer (recommandé, zéro-dette) vs garder.
- **Échelles** : ⚠ à VÉRIFIER — `h2026_echellesTemplates` ne contient que `ECHELLE_GENERIQUE`, alors qu'a2025 en a 2. Les `echelleId` des évals h2026 sont peut-être désappariés AUSSI (même enquête à mener avant/pendant la récup). Et les **cartouches** (`cartoucheId` des évals) : vérifier qu'elles résolvent.

---

## 5. Filet / invariants

- **NE JAMAIS réécrire les évaluations** (`evaluation.grilleId`/`criteres`) — grade-bearing, invariant #350. On recrée la **définition de grille**, pas l'éval.
- **Durabilité en place** (Option A/B/C, 1.24.2+) → toute écriture + `db.flush()` tient au hard refresh (le revert du 28 juin est fermé à la racine).
- **Oracle** : L0 h2026 self-compare (46 notes Moteur AVANT == APRÈS) ; les notes ne doivent PAS bouger (on ne fait que rendre résoluble une définition déjà reflétée dans les notes stockées).
- Backup 18h00 = filet de rollback.

---

## 6. Pointeurs

- **Export analysé** : `…/Monitorage_v6/codex-Écriture-et-littérature-H2026-A25-2026-06-28-18h00.zip` → `donnees.json` (= état post-migration).
- **Préférence** : `preferencesUtilisateur.grilleReferenceDepistage` ; résolution `obtenirGrilleReferenceDepistage` (`js/profil-etudiant-helpers.js`) ; warning émis `js/profil-etudiant-calculs.js:263`.
- **Grilles** : `js/grilles.js` (CRUD, `assurerGrilleGenerique`), résolution `resoudreModeleParId` / pool `toutesGrillesTravail` (`js/trimestres.js`). Outil de réparation modèle : `js/migration-diagnostic.js` (`reparerCoursIdProductions` = patron à imiter).
- **Mémoire** : [[coursid-productions-h26-repare]] (#346, même pattern, productions), [[namespacing-par-trimestre]] (#358 + dry-run 26 juin qui montrait déjà les ids isolés), [[db-durabilite-revert-localstorage-sature]] (durabilité), [[verifier-avant-ecrire-donnees-reelles]] (discipline).
- **Trackers** : à inscrire dans `BACKLOG.md` / `Retours des testeurs/SUIVI-BUGS.md` (rattacher à #354 dépistage ; nouveau : « grilles h2026 désappariées des évals »).
