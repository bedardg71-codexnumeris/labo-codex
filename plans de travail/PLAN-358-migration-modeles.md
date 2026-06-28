# PLAN #358 — Migration des modèles (grilles / échelles) — Option A

> **Statut** : préparation **lecture seule** faite le 28 juin 2026 (post-1.24.0, HEAD `35b939cd`).
> Audit des lecteurs (workflow 8 agents, 119 sites classés) + dry-run d'observation sur le
> codex réel du 28 juin + vérification adverse de la prémisse. **AUCUN code, AUCUNE écriture
> de données.** La migration réelle reste une **session dédiée (risque max)**.
>
> Mémoire liée : [[namespacing-par-trimestre]], [[objectif-reconstruction-multi-trimestres]],
> [[verifier-avant-ecrire-donnees-reelles]], [[audit-integrite-reconstruction-2026-06-27]].
> Cadrage parent : `plans de travail/CADRAGE-briques-C-D-namespacing.md` (§3.3/§3.4 — voir
> correction de prémisse ci-dessous).

---

## 0. Correction de prémisse (VÉRIFIÉE AU CODE — bloquante)

Le cadrage §3.4 et la mémoire du 28 juin affirmaient que les catalogues globaux
`bibliothequeGrilles` / `bibliothequeEchelles` « existent en données mais ne sont lus
NULLE PART ». **C'est FAUX.** Vérifié au code :

- `js/grilles-bibliotheque.js` (279 l.) et `js/echelles-bibliotheque.js` (270 l.) existent
  (depuis le 11 juin), sont **chargés** (`index.html:14678/14680`), et **lisent/écrivent**
  `bibliothequeGrilles`/`bibliothequeEchelles` en db (`CLE_BIBLIOTHEQUE_GRILLES`/`_ECHELLES`).
- `obtenirToutesLesGrillesBibliothequeSync()` / `...Echelles...Sync()` sont exportées et
  **appelées** (`donnees-v2.js:160-162,361-362,523-524`). Gabarits par défaut injectés au
  boot (`gabarits-utils.js:512-513`).

**Conséquence** : l'app a DÉJÀ deux niveaux distincts —
1. **Catalogue-bibliothèque** (`bibliothequeGrilles`, modèle « collègue/partage », alimenté
   par « Ajouter mes grilles à la bibliothèque ») ;
2. **Templates « barre latérale »** (`grillesTemplates`, ce que le moteur lit via `cle()`).

Option A **ne crée donc PAS** les catalogues. Elle (a) **déplace** `grillesTemplates`/
`echellesTemplates` de `CLES_GLOBALES`→`CLES_NAMESPACEES`, et (b) **re-pointe** les lecteurs
de clé nue soit vers les fonctions catalogue existantes, soit vers `cle()`.

> ⚠ **À corriger avant de coder** : `CADRAGE-briques-C-D-namespacing.md` §3.4 repose sur la
> prémisse fausse. Note de correction ajoutée le 28 juin.

---

## 1. Scope confirmé (dry-run du 28 juin, codex réel)

Trimestres réels = **a2025 + h2026** uniquement. **a2024 = trimestre de test → à supprimer**
(voir §6). Dry-run sur l'export `codex-…2026-06-28-09h03` :

- **Plan de copie** (utilisés ET présents) : a2025 = 3 grilles / 2 échelles / 9 cartouches ;
  h2026 = 5 / 2 / 8 ; a2024 = 0 (caduc).
- **Partagés a2025↔h2026** (2 grilles, cause L2 rouge à isoler) : `GRILLE1759243306842`
  (usage a2025:123 / h2026:5), `GRILLE1759264206489` (a2025:122 / h2026:3). À vérifier : les
  usages H26 sont-ils des évals (grade-bearing) ou des `production.grilleId` encore périmés.
- **Orphelin** (1, inerte) : `cartouche_1770743136309_jl11zpy74` (34 évals h2026, absent du
  catalogue, rétroaction en clair, évals verrouillées → zéro perte).
- **En réserve** (43, dont beaucoup d'a2024 → caducs après §6) : modèles au catalogue utilisés
  par aucun trimestre → décision C1 (migrer tous les attribuables).
- **Divergences** (4) : même id, contenu différent selon la collection (D-D6).

---

## 2. État vérifié des call-sites

- **189 sites via `cle('grillesTemplates'/'echellesTemplates')`** → s'auto-namespacent après
  le déplacement registre. `js/grilles.js` (37+ sites) et `js/echelles.js` lisent/écrivent
  **déjà** tout via `cle()` → **namespace-ready, NE PAS toucher**.
- **~119 sites en clé nue** à reclasser : **61 CATALOGUE_GLOBAL**, **24 NAMESPACE_CLE**,
  **15 SPECIAL_ARCHIVE**, **19 A_DECIDER**. Liste détaillée site par site dans le rapport
  d'audit (workflow `audit-358-lecteurs-modeles`).

---

## 3. Décisions en attente (à trancher AVANT de coder — Grégoire)

| # | Site / sujet | Question | Recommandation |
|---|---|---|---|
| D1 | **Prémisse globale** | Garder catalogue + templates séparés, ou fusionner ? | **Garder séparés** (cohérent avec `bibliothequePratiques` ; fusionner = refactoring hors #358). |
| D2 | `consolidation.js:180`, `pratique-registre.js:249` | Résoudre une échelle PAR ID depuis le catalogue global ou le trimestre actif ? | **Catalogue global** (une résolution par id doit retrouver l'échelle même inter-trimestre ; garder le fallback échelle-par-défaut). |
| D3 | `export-pdf.js` dropdowns/lookups | PDF : grilles du trimestre actif ou catalogue complet ? | **Catalogue** (PDF = présentation, pas grade-bearing ; cohérence dropdown↔lookup par paire). |
| D4 | Migration boot — amorçage catalogue | Re-verser `grillesTemplates` dans `bibliothequeGrilles` si vide ? | **Non sur-amorcer** (catalogue déjà peuplé ; risque doublons). La copie locale `<trim>_*` suffit (C1). |

---

## 4. Étapes de migration (session dédiée, sur backup) — 4 blocs

**Bloc 1 — fondations (trimestres.js + corollaires + dry-run)**
1. **Pré-vol** : trancher D1-D4 ; backup Codex horodaté ; baseline L0 (golden master/trimestre)
   + L2 (sentinelle isolation) AVANT toute modif.
2. **Étendre L2** aux échelles (et idéalement pratiques/cartouches) — `sentinelle-isolation-grilles-trimestre.mjs`
   ne scanne que les grilles (~l.89) ; **break-tester** (fuite injectée → ROUGE) avant de s'y fier.
3. **Déplacer** `grillesTemplates`+`echellesTemplates` `CLES_GLOBALES`(l.102-103)→`CLES_NAMESPACEES`
   (bloc l.51-96) dans `trimestres.js`. NE PAS toucher `CLES_TEMPLATES_ARCHIVES` (l.112-116) ni
   `cleSource()` (son routage 4-étages reste correct).
4. **C1** (migrer tous les attribuables) : script boot copie l'**intégralité** de la globale vers
   `<trim>_grillesTemplates` pour chaque trimestre vivant — PAS le filtrage `.filter(grilleIds.has)`
   de `creerSnapshotRessources:655` (qui reste correct pour l'archivage figé seulement).
5. **C2** (réconcilier les ÉVALUATIONS) : `identifierTemplatesUtilises` (`trimestres.js:587-629`)
   ne lit que les productions (`p.grilleId` souvent périmé) → ajouter
   `db.getSync(\`${trimestreId}_evaluationsSauvegardees\`,[])` et collecter `e.grilleId/e.echelleId`
   AVANT le calcul des échelles dérivées. `creerSnapshotRessources` hérite (l.647).

**Bloc 2 — re-pointer NAMESPACE_CLE** (24 sites) : `db.getSync('grillesTemplates')` →
`db.getSync(cle('grillesTemplates'))`. Sites « trimestre actif » : `pratiques.js`,
`accompagnement.js` (onboarding), `rapport-bug.js`, `pratique-pan-standards.js`,
`productions.js` (UI), `import-export.js:2083-2137` (import vers le trimestre actif), parts
nues de `donnees-v2.js:161-163`, lookups locaux `cartouches.js`.

**Bloc 3 — re-pointer CATALOGUE_GLOBAL** (61 sites) : `db.getSync('grillesTemplates')` →
`obtenirToutesLesGrillesBibliothequeSync()` (fonctions existantes, PAS de clé nue inline).
Sites « bibliothèque partagée » : `statistiques.js`, `cc-license.js`, `comparateur-pratiques.js`,
`reserve-ouvrir.js`, `preferences-v2.js`, `pratiques-gestion.js`, `export-pdf.js` (exports
complets), listings/imports `cartouches.js`, `import-export.js` (vers biblio), `trimestres.js`
(source snapshot). Writes vers catalogue → `ajouterGrilleALaBibliotheque()`.

**Bloc 4 — SPECIAL_ARCHIVE + retrait clé + validation** (15 sites + clôture) :
- Auditer `demo-activation.js` (snapshot/fusion/nettoyage démo), `donnees-v2.js:1583-1631`
  (suppression dual-storage → nettoyer aussi `<trim>_grillesTemplates`), `cartouches.js:3672`,
  `trimestres.js:650-663` (snapshot, hérite C2).
- **Retirer/vider la clé nue globale** `grillesTemplates`/`echellesTemplates` (zéro-dette, pas
  d'alias mort) — **TOUTE DERNIÈRE action**, après validation L0.
- **Flag idempotent EN DERNIER** (`migration_modeles_namespacees_done`).

---

## 5. Filet de sécurité §3.4 (obligatoire)

- **Backup** Codex horodaté AVANT écriture ; migration sur copie ; suppression de la clé nue en dernier.
- **Dry-run** `scripts/dry-run-migration-modeles.mjs` (déjà lancé le 28 juin — §1) ; l'étendre pour
  écrire dans des clés `_dryrun_` et y faire tourner L0 si besoin.
- **L0 golden master** recalculé AVANT/APRÈS, MAE Omnivox **< 0,5** sur a2025 + h2026.
- **Break-test L0** `--prouver-rougit` (injecter +15 sur un artefact DOIT rougir) — sinon l'oracle
  est mort et son VERT ne prouve rien.
- **L2** étendu + break-testé (fuite injectée → ROUGE).
- **Tests** `cd tests && npm test` ; ≥ 1 test couvrant la migration (zone sensible `trimestres.js`
  + module sécurité `import-export.js`).

---

## 6. Préalable : supprimer a2024 (trimestre de test) — ✅ FAIT le 28 juin

**SUPPRIMÉ le 28 juin 2026** (Grégoire, live, sur backup). 27 clés (`a2024_*` + `seancesCompletes_a2024-601-101`
+ `seancesCompletes_gc_a2024-gc-00002`) + entrée registre supprimées. Registre restant : a2025 (archivé)
+ h2026 (actif) ; diagnostic post = 0 clé a2024. Les réserves/divergences a2024 du dry-run §1 sont donc
**caduques**. La garde anti-trimestre-actif a prouvé sa valeur : sélectionner a2024 dans le menu l'avait
rendu actif (archivé+actif) → le snippet a abandonné (données protégées) ; récup = sélectionner Hiver 2026
d'abord. Besoin d'une vraie fonction de suppression in-app tracé en **BACKLOG #361**.

---

## 7. Risques majeurs

- **Perte de note** : `grillesTemplates`/`echellesTemplates` sont grade-bearing (lues par le
  moteur via `cle()`). Ordre STRICT : peupler `<trim>_*` (C1) → re-pointer → vider la globale.
- **`production.grilleId` périmé** (→ C2) : sans réconcilier les évals, des modèles réellement
  utilisés seraient ratés au snapshot (archives amputées, notes non reproductibles).
- **Démo** : `demo-activation.js` capture/restaure la globale, qui change de rôle après migration.
- **Désarchivage (D-D5, #359)** : `desarchiverTrimestre` ne purge pas les copies `<id>_*` → après
  généralisation Option A, vérifier cohérence + fix + break-test.
- **Cartouches couplées** (`cartouches_<grilleId>`, 25+ sites) : auditer les paires
  NAMESPACE_CLE/CATALOGUE_GLOBAL site par site (confiance moyenne).
- **Périmètre/fatigue** : ~119 sites + script + 2 corollaires + sentinelle = la session « risque
  max ». Découper en 4 blocs ci-dessus ; une décision principale par session.
- **CI** : CodeQL rouge à chaque PR (faux échec connu, repo privé) — ne pas confondre avec une régression.
