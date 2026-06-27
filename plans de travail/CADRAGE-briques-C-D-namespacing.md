# Cadrage d'exécution — Briques C et D (namespacing par trimestre)

> Produit le 26 juin 2026 (session Claude Code local), après livraison des Briques A
> et B. **Document d'exécution** détaillé pour des sessions ultérieures — la spec haute
> reste `PLAN-namespacing-par-trimestre.md` (§3 : 4 briques). Issu d'un cadrage
> multi-agents (5 cartographies + synthèse + critique adverse), dont les objections
> critiques ont été **revérifiées au code** (marquées « ✓ vérifié » ci-dessous).
>
> **Ne pas implémenter sans trancher d'abord la décision-pivot D-D1.**
>
> **MàJ 26 juin 2026 — D-D1 TRANCHÉE par Grégoire : option « hybride global-partagé +
> copie-locale ».** Les grilles/échelles s'alignent sur le patron déjà existant des
> pratiques (`bibliothequePratiques` catalogue global partagé + `pratiquesConfigurables`
> copie locale namespacée). Voir §3.3 (D-D1) et §2.3 (D-C1, désormais déduite).

---

## 0. État acquis (Briques A, B livrées ; C pas 1-3 livrés)

- **Brique A** (lecture des écrans d'analyse/consultation) et **Brique B** (éditeurs de
  Conception : `grilles.js`, `echelles.js`, `wizard-pratique-v2.js`) branchées sur `cle()`
  (`get`+`set`), avec garde anti-écriture en archive. Invariant H26 = no-op prouvé.
- **Brique C — pas 1-3 livrés (26 juin)** : D-D1 tranchée (hybride globale-partagée + copie-locale) ;
  `window.cleSource(nomCle, trimestreSourceId)` (lecture inter-trimestre sans swap, commit `b6ea9443`) ;
  `dupliquerGrillePartagee(grilleSource, lireCartouchesDe)` généralisée par un lecteur de cartouches
  injecté (commit `db16227f`). Reste **pas 4** (modale import grilles) + **pas 5** (modale pratiques).
- Sentinelles : `sentinelle-cle-modeles-trimestre-briqueA.test.js` (ratchet 2 fichiers /
  3 clés), `sentinelle-cle-conception-namespacee-briqueB.test.js` (B1/B2/B3, break-testées),
  `sentinelle-clesource-trimestre-briqueC.test.js` (5 cas), `sentinelle-duplication-source-briqueC.test.js`
  (11 cas, dont break-test source intacte + témoin D-C4) — break-testées.
- Oracles : `scripts/valider-golden-master-trimestre.mjs` (L0), `scripts/sentinelle-isolation-grilles-trimestre.mjs` (L2).

---

## 1. Préambule factuel — le régime réel des clés (✓ vérifié `trimestres.js` 51-116)

Trois listes gouvernent `cle()` :

| Liste | Contenu | Effet |
|---|---|---|
| `CLES_NAMESPACEES` | …, **`pratiquesConfigurables`**, **`modalitesEvaluation`** | isolées par trimestre (actif) |
| `CLES_GLOBALES` | **`grillesTemplates`**, **`echellesTemplates`**, `cours`, `listeCours`, `trimestres`, `modeApplication`, `etatsAccordeonsV2` | jamais namespacées (sauf copie d'archivage) |
| `CLES_TEMPLATES_ARCHIVES` | `grillesTemplates`, `echellesTemplates`, `pratiquesConfigurables` | copies `<trim>_X` créées à l'archivage, lues par `cle()` si trimestre actif archivé ET copie existe |

**Asymétrie centrale (cause du L2 ROUGE)** : `grillesTemplates`/`echellesTemplates` sont
**globales** (partagées entre trimestres actifs) alors que `pratiquesConfigurables` est
namespacée. C'est la décision-pivot **D-D1**.

### 1bis. Inventaire des clés globales de MODÈLES — corrigé et complété (✓ vérifié)

La synthèse initiale était incomplète. Vérifié au code, il existe **plusieurs dépôts
globaux de modèles** hors des 3 listes ci-dessus :

| Clé globale | Fichier | Nature | Statut migration (à trancher) |
|---|---|---|---|
| `grillesTemplates` | `grilles.js` | modèles grilles (actif) | **MUST** — cœur D-D1 |
| `echellesTemplates` | `echelles.js` | modèles échelles (actif) | **MUST** — cœur D-D1 |
| `cartouches_*` | `cartouches.js` | rétroactions par grille | **MUST** (suivent leur grille) |
| **`bibliothequePratiques`** | `pratiques-bibliotheque.js` | **catalogue partagé** de pratiques (global ASSUMÉ) | **reste global ?** — patron à imiter |
| **`bibliothequeProductions`** | `productions-bibliotheque.js` | catalogue partagé de productions (global assumé) | **reste global ?** |
| **`objectifsTemplates`** | `objectifs.js` (Alignement) | modèles d'objectifs curriculaires | **CAN/MUST ?** — non couvert |
| **`echellesPerformance` / `niveauxEchelle`** | `tableau-bord-apercu.js`, `portfolio.js`, `evaluation.js`… | famille d'échelle DISTINCTE de `echellesTemplates` | **angle mort L2** (cf. §4-pt3) |

> **Conséquence majeure** (✓ vérifié) : les pratiques ont **déjà** le modèle
> « bibliothèque globale partagée (`bibliothequePratiques`) + copie locale namespacée
> (`pratiquesConfigurables`) ». Ce patron existant est **le candidat naturel** pour
> grilles/échelles dans D-D1, et il fournit à la Brique C un patron à imiter, pas à inventer.

---

## 2. BRIQUE C — Import inter-trimestre (modèle COPIE)

### 2.1 Finalité
Copier un modèle (grille, échelle, pratique, production) d'un trimestre source vers le
trimestre actif : duplicata avec id neuf + trace `inspireDe`, source jamais mutée.

### 2.2 Points d'accroche (✓ lignes vérifiées par les cartographies)
- **Patron de duplication** : `partage-section.js` — `copiePropre` (112), `dupliquerGrillePartagee` (145, gère les cartouches récursives), `dupliquerVersMesDocuments` (169). À **paramétrer par une source** (lit aujourd'hui `partage_*`, écrit le trimestre actif).
- **Duplications intra-trimestre** à paramétrer : `dupliquerGrille` (grilles.js:976), `dupliquerEchelle` (echelles.js:383), `dupliquerPratiqueBibliotheque` (pratiques-gestion.js:710), `dupliquerProduction` (productions-liste.js:295), `dupliquerCartouche` (cartouches.js:1359, à exécuter **après** que la grille parente a un id neuf).
- **Lecture d'un autre trimestre — déjà partiellement fait** : `echelles-bibliotheque.js` (modale échelles inter-trimestre déjà branchée), `productions-bibliotheque-ui.js` (`importerToutTrimestreModal`, bon patron). **Manque** : la section « importer d'un autre trimestre » dans `afficherBibliothequeGrilles()` (grilles.js:2261) et une modale pour les pratiques.
- **Helper à créer** : `cleSource(nomCle, trimestreSourceId)` dans `trimestres.js` — lire le namespace d'un trimestre nommé **sans swap du trimestre actif** (le swap est un anti-pattern fragile).

### 2.3 Décisions ouvertes
| Id | Question | Reco |
|---|---|---|
| D-C1 | Destination de la copie : clé globale ou namespacée du trimestre actif ? | **TRANCHÉ via D-D1 (hybride)** : copie vers la **clé namespacée du trimestre actif** ; la bibliothèque globale reste catalogue/lecture |
| D-C2 | Types importables : (A) grilles+échelles ; (B) +pratiques ; (C) +productions | A ou B en v1 |
| D-C3 | Importer une grille copie-t-elle ses cartouches ? | oui (sinon orpheline) |
| D-C4 | Échelle référencée par une grille importée | copier+remapper (modèle COPIE) |
| D-C5 | Production avec grille du trimestre source | interdire en v1 (cf. §4-pt6) |
| D-C6 | `inspireDe` en chaîne (copie-de-copie) | conserver `idOriginal` + snapshot parent immédiat |
| D-C7 | Import depuis trimestre archivé | source permise (lecture seule), cible jamais |
| D-C8 | Point d'entrée UI | section par modale (cohérence existant) |

### 2.4 Ordre + filet
1. ✓ Trancher D-C1 ⇄ D-D1 (hybride, 26 juin). 2. ✓ `cleSource` + test de routage (commit `b6ea9443`, 5 cas, break-testée).
3. ✓ Généraliser `dupliquerGrillePartagee` — lecteur de cartouches injecté ; `copiePropre` laissée intacte (déjà source-agnostique) (commit `db16227f`, sentinelle 11 cas, break-testée). **4. ✓ Import grilles dans la modale** (commit `82fd4e9f` : `listerTrimestresAvecGrilles`/`copierGrilleDepuisTrimestre`/`afficherGrillesTrimestreModal`/`importerToutGrillesTrimestreModal` + garde D-C7 + fix preview ; sentinelle `import-grilles-inter-trimestre-briqueC`, 4 cas ; validé terrain A25→H26). **5. ✓ Import pratiques (LIVRÉ sur branche `claude/brique-C-pas5-import-pratiques`)** — voir §2.5.
- **Filet** : test « source intacte byte-à-byte après copie » (break-test : forcer une réécriture de la source doit ROUGIR) — ✓ livré dans `sentinelle-duplication-source-briqueC` ; L2 VERT (id neuf) ; L0 VERT (aucune note touchée).
- **Report assumé D-C4** (pas 4) : `echelleId` d'une copie n'est pas remappé au pas 3, verrouillé par un test-témoin qui RUGIRA au pas 4 (= signal attendu, mettre à jour le témoin). NB vérifié au code : `grille.echelleId` n'est PAS un champ racine général (1 seule occurrence, la grille générique `grilles.js:1538` ; `dupliquerGrille` ne le construit pas) — le lien grille↔échelle passe par la **production** (grilleId + echelleId séparés) et par `cartouche.echelleId` (optionnel). D-C4 plus léger que craint pour le chemin grille+cartouches ; à statuer au pas 4.

**Effort M / risque MOYEN** (patron existant ; danger = remappage incomplet des dépendances).

### 2.5 Pas 5 — Import pratiques (✓ LIVRÉ 26 juin 2026 sur branche `claude/brique-C-pas5-import-pratiques`)

> **Statut : LIVRÉ** (commit `2e2aaf95`). `js/pratiques-gestion.js` : `listerTrimestresAvecPratiques`,
> `verifierDependancesPratique`, `copierPratiqueDepuisTrimestre`, `afficherPratiquesTrimestreModal`,
> `importerUnePratiqueTrimestre`, `importerToutPratiquesTrimestreModal` + section UI. Sentinelle
> `import-pratiques-inter-trimestre-briqueC.spec.js` (6 cas, 9 break-tests rouges→verts). Revue
> adverse (3 angles) passée. **Corrections issues de la revue** : `inspireDe` = objet `forgerInspireDe`
> (et non chaîne brute, sinon carte « Inspiré de Inconnu ») ; copie PROFONDE (JSON round-trip) pour
> garantir §5.5 ; `verifierDependancesPratique` filtre `dansBibliotheque` (aligné sur les dropdowns).
> 973 Vitest + 67 Playwright verts. **Pas de bump** (patch au merge sur main, après validation terrain).
> Dette flaguée hors périmètre : même défaut `inspireDe` au pas 4 (grilles) ; `dupliquerPratiqueBibliotheque`
> à durcir (deep-clone) ; `workers: 1` manquant dans `playwright.config`.

Cadrage initial (conservé pour référence) :

**Divergence-clé avec le pas 4 (le piège du relai)** : `pratiquesConfigurables` ∈ `CLES_NAMESPACEES`
(trimestres.js:95) — chaque trimestre (actif **ou** archivé) a sa copie `<id>_pratiquesConfigurables`.
Donc `cleSource('pratiquesConfigurables', srcId)` rend **toujours** `<srcId>_pratiquesConfigurables`
(jamais la clé nue). La logique « source = trimestre archivé » du pas 4 (filtre « copie propre »)
**ne s'applique pas** : toute pratique d'un trimestre ≠ actif est une source valide.

**Décisions (déduites du régime des clés — pas de choix à reposer)** :
- **Source** = `cleSource('pratiquesConfigurables', srcId)`. **PAS** `bibliothequePratiques` (clé
  globale partagée = catalogue commun, déjà accessible → rien à importer d'elle).
- **Destination** = `cle('pratiquesConfigurables')` du trimestre actif (D-C1/D-D1 hybride).
- **Mécanique** = paramétrer `dupliquerPratiqueBibliotheque` (pratiques-gestion.js:710) par la source :
  lire `cleSource(...)` au lieu de `cle(...)`, id neuf via `genererIdUnique('pratique_')`,
  `inspireDe` + `inspireDeTrimestre`, source jamais mutée. Patron identique aux pas 3/4.
- **`listerTrimestresAvecPratiques`** = tous les trimestres ≠ actif ayant `length>0` (PAS le filtre
  « copie propre » du pas 4).
- **Garde D-C7 conservée mais RE-JUSTIFIÉE** : ici la destination `cle('pratiquesConfigurables')`
  route correctement même quand l'actif est archivé (sa copie d'archive existe) — la garde ne tient
  donc PAS par un risque de mauvais routage (contrairement aux grilles) mais par l'invariant
  **« consultation = lecture seule »** (cohérence avec la garde anti-écriture en archive de la Brique B).
- **Productions hors périmètre** : une pratique ne porte aucun `productionId` (✓ vérifié) — le lien
  production↔pratique est porté par la production. Cohérent D-C5.

**Décision Grégoire (26 juin) — dépendances `echelleId`/`grilleId` de la pratique importée** :
une pratique référence une échelle (`configuration.echelleId`) et, en mode DEN, une grille
(`configuration.grilleId`). Cas réel A25(archivé)→H26 : ces ids vivent dans `a2025_echellesTemplates`/
`a2025_grillesTemplates`, absents du catalogue global de H26 → refs non résolues.
→ **Option A retenue : « pratique seule + avertir »**. Copier la mécanique de la pratique en gardant
`echelleId`/`grilleId` tels quels ; si non résolus dans le trimestre actif, **avertir** l'enseignant
(« échelle/grille à re-sélectionner »). Pas de copie transitive ni de remappage en v1 (zéro-dette ;
une pratique = mécanique réutilisable, l'échelle est rattachée localement). Copie transitive (option B)
reportée tant que le terrain ne la réclame pas.

**Filet (à livrer avec le pas 5)** : sentinelle `import-pratiques-inter-trimestre-briqueC` —
(1) listing rend tous les trimestres ≠ actif avec pratiques ; (2) garde D-C7 (actif archivé → []
+ refus dans les importeurs) ; (3) copie = id neuf + `inspireDe`/`inspireDeTrimestre`, **source intacte
byte-à-byte** (break-test : réécrire la source doit ROUGIR) ; (4) avertissement si `echelleId`/`grilleId`
non résolu dans l'actif. Patron de test = `import-grilles-inter-trimestre-briqueC.spec.js`.

---

## 3. BRIQUE D — Migration de masse (risque maximal)

### 3.1 Finalité
Répartir les modèles globaux vers des clés namespacées **selon l'usage réel**, préserver
H2026 actif et le golden master, résoudre le L2 ROUGE. **Sur copie + backup horodaté, jamais destructif.**

### 3.2 Points d'accroche (✓ lignes vérifiées)
- `trimestres.js` : `cle()` (266-310) + les 3 constantes (51-116) — **D-D1 se matérialise par le déplacement de `grillesTemplates`/`echellesTemplates` entre `CLES_GLOBALES` et `CLES_NAMESPACEES`**.
- Patron de snapshot à généraliser : `identifierTemplatesUtilises` (535-577, SSOT d'usage), `creerSnapshotRessources` (589-656, copie + backup `snapshot_*`). C'est le mécanisme de migration appliqué à un trimestre.
- Migrations boot prototypes : `migrations.js` (`migrerProductionsVersCoursId`…), `trimestres.js` (`migrerVersMultiTrimestres`, `migrerClesVersA2025` — **ne supprime PAS les anciennes clés**, cf. §4-pt10).
- Lecteurs à auditer : `modalitesEvaluation` (~60 lectures directes hors `cle()`), `import-export.js` (`importerConfigurationComplete` écrit en global), `demo-activation.js` (préserver le push-sans-replace).

### 3.3 Décisions ouvertes
| Id | Question | Reco / statut |
|---|---|---|
| **D-D1 (PIVOT)** | Les grilles/échelles restent-elles **globales** (statu quo, isolation seulement après archivage) ou deviennent-elles **namespacées** comme les pratiques ? | **TRANCHÉ 26 juin 2026 (Grégoire) : hybride « globale-partagée + copie-locale ».** Grilles/échelles suivent le patron `bibliothequePratiques` (catalogue global partagé) + copie locale namespacée par trimestre dès édition/usage. Résout le L2 ROUGE. |
| D-D2 | Périmètre : MUST (modèles) vs CAN (données déjà résolues par `cle()`) | modèles seulement |
| D-D3 | `modalitesEvaluation` per-trimestre confirmé ? (~60 lectures à corriger) | (A) confirmer + corriger lectures |
| D-D4 | Backup : local `snapshot_*` + fichier téléchargé ? | (A)+(B) obligatoires avant écriture |
| **D-D5** | Désarchivage : ✓ **vérifié — `desarchiverTrimestre` (664-686) ne purge PAS les copies** `<id>_grillesTemplates`, qui deviennent orphelines mortes (cle() ne les lit plus hors-archive). **C'est un FIX, pas une décision** : corriger `cle()` (lire la copie même hors-archive si elle existe) **ou** purger au désarchivage. | fix + break-test |
| D-D6 | Hash de divergence post-archivage (inclure **cartouches**, copiées seulement si length>0) | hash léger `[id, nom, critères, cartouches]` |
| D-D7 | Inventaire exhaustif des clés à isoler (cf. §1bis : +objectifsTemplates, etc.) | statuer chaque clé MUST/CAN/global |

> **MàJ 26 juin 2026 PM (Claude Code local) — instrumentation + dry-run d'observation LIVRÉS** (branche
> `claude/brique-D-instrumentation-L2-ratchet`, non destructif, 1002 Vitest + 67 Playwright verts, break-testés) :
> - **L2 ÉTENDU** aux 4 modèles (grilles/échelles/pratiques/cartouches) — `scripts/sentinelle-isolation-grilles-trimestre.mjs`,
>   désormais **auto-vérifiable** (`tests/unit/sentinelle-isolation-modeles-trimestre-L2.test.js`). Le filet « L2 à étendre » du §3.4 est donc LEVÉ.
> - **Cliquet `pratiquesConfigurables`** posé (`tests/unit/sentinelle-cle-nue-pratiques-config-ratchet.test.js`, scan récursif `js/`).
>   ⚠ **CORRECTION** : le §3.4 demande de « généraliser le ratchet à `modalitesEvaluation` » — c'est DÉJÀ FAIT
>   (`sentinelle-ssot-modalites-purge-L3`, scan récursif). Le ratchet restant ne concernait QUE `pratiquesConfigurables`.
> - **Dry-run d'OBSERVATION** (read-only) — `scripts/dry-run-migration-modeles.mjs` : plan de migration + partages/orphelins/réserves/divergences,
>   réconciliant **évaluations + productions**.
> - **À TRANCHER avant la migration réelle** : (a) **mécanique D-D1** — tension entre §3.2 (« déplacer grilles/échelles
>   `CLES_GLOBALES`→`CLES_NAMESPACEES` » = pleinement namespacé) et D-D1 (« hybride comme `bibliothequePratiques` » =
>   catalogue global + copie locale) : les grilles n'ont qu'1 clé, les pratiques 2 ⇒ l'« hybride » suppose de CRÉER la
>   séparation, ce n'est pas le simple déplacement de §3.2 ; (b) **critère §4-pt7** (tous attribuables vs utilisés) ;
>   (c) `identifierTemplatesUtilises` (trimestres.js:587) ne lit que les **productions** (angle mort usage-éval).

### 3.4 Ordre + filet
1. Trancher D-D1. 2. Backup (D-D4) + baseline L0/L2 capturés AVANT. 3. **Dry-run** (`identifierTemplatesUtilises`+`creerSnapshotRessources` en mode simulation, clés `_dryrun_`). 4. L0 sur la copie dry-run = VERT. 5. Migration réelle (modèles, flag idempotent **en dernier**). 6. L0/L2 post-migration. 7. (si D-D3=A) corriger les ~60 lectures `modalitesEvaluation`.

**Filet non négociable** :
- BACKUP horodaté avant toute écriture (local + téléchargement).
- Dry-run sur copie, aucune écriture live avant validation L0.
- L0 recalculé avant ET après, MAE Omnivox < 0,5 ; **break-test `--prouver-rougit`** (injecter +15 sur un artefact doit ROUGIR — sinon l'oracle est mort).
- **L2 à ÉTENDRE** (✓ vérifié : `sentinelle-isolation-grilles-trimestre.mjs` ne scanne QUE `grillesTemplates`, ligne 89) **aux échelles + pratiques + cartouches AVANT migration** — sinon « L2 VERT » est un faux positif.
- **Ratchet à GÉNÉRALISER** (✓ vérifié : limité à 2 fichiers / 3 clés) à tous les fichiers + `pratiquesConfigurables` + `modalitesEvaluation`.
- Flag idempotent posé en dernier (survie à un crash). Démo intacte (jamais d'écriture `demo_*`).

**Effort L / risque ÉLEVÉ** — seul chantier pouvant faire bouger des notes (L0 ROUGE) ou perdre un modèle (collision, cartouche orpheline, modèle en réserve abandonné — cf. §4-pt7).

---

## 4. Trous trouvés par la critique adverse (priorisés)

| # | Sévérité | Statut | Correction intégrée |
|---|---|---|---|
| 1 | CRITIQUE | ✓ vérifié | `bibliothequePratiques` global existant → §1bis ; reformule D-D1 |
| 2 | CRITIQUE | ✓ vérifié | `objectifsTemplates`, `bibliothequeProductions`, `echellesPerformance` → §1bis / D-D7 |
| 3 | CRITIQUE | ✓ vérifié | L2 ne couvre que les grilles → étendre AVANT migration (§3.4) |
| 4 | IMPORTANT | ✓ vérifié | ratchet limité 2 fichiers/3 clés → généraliser (§3.4) |
| 5 | IMPORTANT | ✓ vérifié | désarchivage = fix, pas décision (D-D5) |
| 6 | IMPORTANT | à confirmer | `dupliquerProduction` ne remappe pas `grilleId` → garde dure « grilleId inexistant = import refusé » dès v1 |
| 7 | IMPORTANT | à confirmer | `identifierTemplatesUtilises` filtre par usage → migration risque d'abandonner les modèles « en réserve ». Décision : migrer TOUS les modèles attribuables, pas seulement les utilisés |
| 8 | MINEUR | à confirmer | invariant « changerTrimestreActif ne swap pas » tient par omission → écrire un test anti-régression |
| 9 | MINEUR | à confirmer | hash de divergence doit inclure les cartouches |
| 10 | MINEUR | ✓ partiel | `migrerClesVersA2025` ne supprime pas les anciennes clés → clés zombies, risque de lecture fantôme par un bypass de `cle()` |

---

## 5. Invariants à ne jamais casser (C et D)

1. **H2026 actif = global inchangé.** `changerTrimestreActif` ne swap jamais les globaux.
2. **Golden master par trimestre = VERT.** L0 avant/après, MAE Omnivox < 0,5. L'oracle doit pouvoir rougir.
3. **Pas de collision d'ids.** Id neuf via `genererIdUnique` ; aucune grille partagée par ≥2 trimestres évaluants (L2 VERT, **étendu**).
4. **Démo intacte.** Jamais d'écriture `demo_*` ; push-sans-replace préservé ; nettoyage par identité, pas par flag seul.
5. **Source immuable.** Import = copie, jamais de mutation de la source ; migration sur copie + backup horodaté.

---

## 6. Dépendance C ↔ D et premier pas

**D-D1 précède D-C1.** La destination d'une copie inter-trimestre (Brique C) dépend du
régime des templates (Brique D). Trancher **D-D1** d'abord — même si l'implémentation de D
vient après C — pour éviter une incohérence garantie.

**Premier pas d'une future session C/D** : poser à Grégoire la décision-pivot **D-D1**
(grilles/échelles globales-partagées + copie-locale, à l'image de `bibliothequePratiques`,
OU pleinement namespacées), puis étendre L2 + ratchet AVANT toute migration.
