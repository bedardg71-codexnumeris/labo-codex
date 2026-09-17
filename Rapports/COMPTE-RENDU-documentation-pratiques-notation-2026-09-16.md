# COMPTE-RENDU — la documentation des pratiques de notation, telle qu'elle est le 16 septembre 2026

**Date** : 16 septembre 2026, ≈ 16 h – 17 h.
**Base mesurée** : `main` = `origin/main`, HEAD `26d4347f`, `version.json` 1.142.15 (build `0916-1529`). Vitest depuis `tests/` : 576 fichiers / 6 448 tests verts. L'arbre porte un lot #652/#890 non commité (consigne du jour de Cowork, 15 h 52) que ce compte-rendu ne touche pas.
**Pourquoi** : Grégoire prépare un labo « comment ça marche, comment l'utiliser » sur les pratiques de notation. Avant d'écrire le labo, il faut savoir ce que la documentation dit, ce qui est faux, et ce qui n'a pas été audité. Ce document est le premier des deux livrables demandés ; le second est le cadrage `Rapports/prompts-audit/PROMPT-AUDIT-pratiques-notation-configuration-et-discours-2026-09-16.md`.
**Mode** : lecture seule. `grep`, `wc`, `sed` ciblés ; aucun fichier de `js/` modifié. Les gros fichiers (`SESSION.md`, `BACKLOG.md`, `RELAIS.md`) n'ont été lus que par grep.
**Verdicts** : `[mesuré]` = compte ou lecture reproductible par la commande citée ; `[inscrit]` = déjà une fiche au BACKLOG ; `[inférence]` = ma lecture, à confirmer.

---

## 1. Vue d'ensemble

**Trois faits commandent tout le reste.**

1. **Le calcul de la note a déjà été audité, il y a onze jours, et l'audit est fermé.** `Rapports/AUDIT-pratique-de-notation-2026-09-05.md` (386 l., 46 mesures exécutées en bac à sable, quatre élèves de banc SOM/STD/SPE/DEN, chaque nombre calculé à la main avant le code). Dispositions arbitrées par Grégoire le soir même, trois correctifs livrés en 1.122.0 (#706, #708, #709), dix-neuf fiches inscrites (#710 à #729). Refaire cet audit serait refaire le 5 septembre. `[mesuré]`
2. **La seule documentation technique juste est le skill `pratiques-notation`** (`.claude/skills/pratiques-notation/SKILL.md`, à jour au 3 juillet 2026 pour le corps, 26 août pour le §7 bis). La doc de module `docs/modules/pratiques.md` est **fausse** : datée du 1er janvier 2026, elle décrit trois familles, un fichier supprimé et un assistant retiré. Fiche #804 ouverte, non traitée. `[inscrit]`
3. **Ce que l'audit du 5 septembre n'a pas regardé, il le dit lui-même** : aucun navigateur (pas de WebKit), pas les données réelles de Grégoire, ni l'assistant ni le formulaire de configuration (« tu vérifies ce qu'ils écrivent et lisent, pas leur ergonomie »), ni les textes de l'Aide. Or un labo « how to » vit exactement là : dans ce que l'utilisateur configure, ce que l'écran lui dit, et ce qu'il obtient. **C'est le périmètre qui reste à auditer.** `[inférence]`

---

## 2. Ce qui existe, par couche

### 2.1 Le code (pour situer le poids de chaque couche)

| Couche | Fichiers | Lignes | `[mesuré]` par |
|---|---|---|---|
| Moteur (`js/pratiques/`) | 15 fichiers | 8 760 | `wc -l js/pratiques/*.js` |
| Configuration par l'utilisateur | `wizard-pratique-v2.js` 3 168 · `pratiques-gestion.js` 2 973 · `pratique-notation-v2.js` 1 135 | 7 276 | `wc -l` |
| Bibliothèque et cycle de vie | `pratiques.js` 2 397 · `pratiques-bibliotheque.js` ≈ 860 | ≈ 3 260 | `wc -l` |
| Consommateurs de la note | `portfolio.js` 1 177 · `profil-etudiant-actions.js` 716 · `comparateur-pratiques.js` 1 161 · `export-resultats-finaux.js` 204 | 3 258 | `wc -l` |

Lecture : **la surface de configuration pèse autant que le moteur**, et elle a **trois** écrivains d'une même donnée (l'assistant, le formulaire de gestion, l'ancien éditeur `pratique-notation-v2.js` dont #592 dit qu'une partie est morte). Le moteur, lui, n'a qu'un lecteur (`construireConfigComplete` → `obtenirConfigPratiqueActive`). #854 (13 sept.) est le symptôme mesuré de cette asymétrie : l'assistant écrit `configuration.jetons`, le formulaire écrit `pratique.jetons`, le moteur ne lit que le premier. `[inscrit]`

### 2.2 La documentation technique interne

| Document | État | Disposition proposée |
|---|---|---|
| `.claude/skills/pratiques-notation/SKILL.md` | **Juste et complet** sur le moteur : familles, trois niveaux de « pratique » (§3), résolution (§4), schéma exécutable (§5), les deux systèmes de calcul (§6), `simulerIndices` (§7), l'échelle et ses deux conversions (§7 bis), pièges (§10). Le §2 bis (ancrage recherche) est ancré Talbert/Clark/Blum, pas PAREA (#805). Le §12 (Comparateur) est un journal de chantier de 150 lignes dont l'état final tient en trois lignes. | Garder comme source. Deux retouches : #805 ; compacter le §12 en renvoyant l'historique au fichier d'archives. |
| `.claude/skills/labo-codex/SKILL.md` §5 | Aperçu correct sur DEN ; **deux écarts** : « 14 modules » (il y en a 15) ; « Identifiant : `pan-standards` / `pan-specifications` » avec un avertissement que ce sont les libellés legacy — mais #711 mesure que ces ids legacy résolvent encore vers l'instance registre avec ses défauts, donc les donner comme « identifiant » est un piège. Décrit encore STD par « 4 modes de calcul » dont Seuils critiques, retiré (#435). `[mesuré]` : `grep _calculerModeSeuilsCritiques js/` ne rend qu'un commentaire. | Corriger (10 lignes). |
| `docs/modules/pratiques.md` | **Faux** (#804) : Beta 95, 1er janv. 2026 ; `pratique-pan-maitrise.js` inexistant ; `modalitesEvaluation.pratique: 'pan-maitrise'` alors que la SSOT est `groupesCours[].pratiqueId` depuis #328 ; renvoie à `GUIDE_AJOUT_PRATIQUE.md` absent du dépôt ; « wizard Primo » retiré. | **Retirer et remplacer par un renvoi** de 15 lignes vers le skill (zéro-dette : un doc de module faux vaut moins qu'un renvoi juste). |
| `docs/DATA-OWNERSHIP.md` | Juste sur `pratiquesConfigurables`, `modalitesEvaluation`, `jugementsDenotation`, `indicesCP`. Note encore 4 contourneurs de `pratiquesConfigurables` (violation #5). | Tenir. |
| `docs/decisions/2025-11-systeme-pratiques.md` | ADR historique cohérent (pourquoi un registre). | Tenir, c'est une décision datée. |
| `docs/archive/Plans-utilisateur/SPEC_PAN_SPECIFICATIONS_V2.md` | Spec fondatrice SPE (938 l.). Décrit `tableBundles {noteFixe, requis}` ; l'application écrit `forfaits {lettre, note, travaux}` — divergence corrigée au moteur par #708, spec non amendée. | Tenir en archive ; un encart « schéma réel : voir skill §5 » suffit. |
| `docs/Rapport - Flux de configuration (0207).md`, `docs/utilisateur/GUIDE_TESTEURS.md`, `docs/aide-contextuelle-contenu-*.md` | Marqués obsolètes ou datés Beta 91, décrivent un choix de pratique et un Mode Assisté qui n'existent plus. | Archiver sous `docs/archive/` (déplacement, pas réécriture). |
| `docs/refonte-textes/glossaire-bloc6.md`, `infobulles-T4-construction-note.md` | Textes d'avril 2026, livrés ou brouillons. Utiles au labo pour le vocabulaire (PAN, sommative, standards, spécifications). | Tenir ; vérifier au flux C de l'audit que ce qui est à l'écran est bien ce texte. |

### 2.3 Les spécifications et notes de conception (`plans de travail/`)

Quinze documents de juin 2026 (SPEC_307, SPEC_comparateur, SPEC_D, SPEC_DEN_couche2, RELAIS-326, NOTE-CONCEPTION C0/C1/C2/D, NOTE-COWORK-modele-DEN, PLAN_refonte_assistant, PLAN-refonte-note-finale-portfolio, PLAN-339, PLAN_sessionB/C). Tous **clos ou supersédés**, et ils le disent en en-tête, à lire dans l'ordre (SPEC_D → RELAIS-326 → archives/RELAIS-326-réactivation) sinon ils se contredisent en apparence. Deux restent ouverts : `PLAN-339-config-portfolio-explicite.md` (décisions en attente, trois verrous) et `MESURE-STOCK-816-portfolios-2026-09-10.md`. Pour le labo, ces documents sont du matériau de conception, pas de la documentation utilisateur. `[mesuré]`

### 2.4 Ce que l'application dit à l'utilisateur (la doc que les élèves et les collègues lisent)

| Surface | Contenu | Fraîcheur |
|---|---|---|
| Aide (`guides-pedagogiques.js`, `accompagnement-contenu-{popup,terme,hover}.js`) | Refondue en 1.126.0 (9 sept.) : quatre familles côte à côte, DEN plus « à venir », six questions pour situer une pratique ; 1.127.0 : le Comparateur parle en six paramètres (grille PAREA, Cormier et al. 2026). | **La plus fraîche du corpus.** Auditée pour sa conformité le 10 sept. (`plans de travail/AUDIT-AIDE-CONFORMITE-2026-09-10.md`). |
| Récapitulatif de l'assistant, lignes « Construction de la note » du Comparateur (`construction-attributs.js`) | Décrivent le calcul par famille en mots. | Non confrontées ligne à ligne au code depuis leur écriture (juin). |
| Diagnostic « note non calculable » (`_diagnostiquerNoteNonCalculable`, skill §9) | Cinq causes nommées. | Recoupé par #762 et l'audit du 5 sept. (flux F). |
| Aucune entrée d'aide contextuelle pour le Comparateur | `[mesuré]` : « comparateur » absent des six fichiers d'aide, présent seulement dans `changelog-data.js`. | Trou. |

### 2.5 Les tests

35 fichiers Vitest et 9 specs Playwright dont le nom touche le périmètre (liste dans l'annexe A). Le banc d'audit du 5 sept. (46 cas) et les sentinelles #706/#708/#709 couvrent **le calcul**. Le tour complet d'une configuration n'est couvert que par `sentinelle-522-pratiques-serialisees` (8), `sentinelle-816-modalites-de-selection-portfolio` (9), `sentinelle-wizard-denotation-319` (5) et une spec Playwright `pratique-edition-preserve-enveloppe.spec.js` (2). **SOM et STD n'ont aucun test de round-trip assistant → moteur → formulaire → assistant.** `[mesuré]` sur les noms, à confirmer sur le contenu (flux G du cadrage).

---

## 3. Ce qui est déjà su et ouvert — à recouper, pas à redécouvrir

Fiches ouvertes du BACKLOG dans le périmètre, groupées par ce qu'elles touchent :

- **Documentation** : #804 (doc de module fausse), #805 (skill §2 bis sans PAREA).
- **Configuration → moteur** : #854 (jetons de l'assistant non lus), #712 (forme `.config` non lue), #663/#664 (remap d'import), #465 (« configuré ≠ calculé »), #579 (échelle embarquée sans repères), #339 (config portfolio explicite, bloqué).
- **Résolution et replis** : #710 (groupe sans pratique : deux replis), #711 (id legacy → registre), #713 (pointeur `specifications` non configuré → 50 %), #719 (DEN absente du registre → lue « M »), #839 (service sans pratique), #634 (repli bibliothèque partagée).
- **Écrans** : #714 (panneau Portfolio du profil : 3 vs 4, écrit au rendu), #716 (P historique), #718 (niveau global exige un texte), #722 (écran Portfolio mort), #592 (mode « par objectifs » mort), #469 (îlots morts : `pratique-test`, `pratique-notation-v2`).
- **Modèles offerts** : #690 (`pratiques-predefines.js` fictif et vivant).
- **Terrain, banc de décision** : #326-T1, T3, T4, T5 ; #343-T5.
- **Changement de modèle** : **#810 ⚠️ — construire la note STD sur les cibles, non sur le portfolio, cadré le 9 sept.** C'est la fiche qui pèse sur le labo (voir §5).

Deux signaux mesurés aujourd'hui qui ne sont dans aucune fiche, et que je **ne propose pas d'inscrire** (aucun symptôme vécu) : le gabarit `pan-objectifs-ponderes` de `pratiques-predefines.js:475` porte encore un id préfixé `pan-` que la table de normalisation ne connaît pas (couvert par #690 si les gabarits sont retirés) ; `pratique-test.js` est chargé par `index.html:14408` en production et enregistre une pratique `test` (couvert par #469). Le cadrage les cite pour que l'audit les mesure, pas pour qu'on les traite. `[mesuré]`

---

## 4. Contradictions entre documents

| # | Contradiction | Où | Ce que le code fait aujourd'hui |
|---|---|---|---|
| 1 | STD = « N meilleurs artefacts » (skills, doc de module, Comparateur « Artefacts ») **contre** « niveau atteint sur des cibles d'apprentissage » (Aide 1.126.0, #810). | `labo-codex` §5.2, `pratiques-notation` §8, Aide | Portfolio : `nombreARetenir` + `methodeSelection`. #810 dit de **ne pas** corriger le libellé du Comparateur, qui décrit le code. |
| 2 | Reprise « sans pénalité » = meilleure tentative (recherche, skill §2 bis) **contre** « dernier essai non remplacé » (code STD). | skill §2 bis vs §8 | Récence. Le skill le nomme comme décision pédagogique ; l'Aide ? (à mesurer, flux C). |
| 3 | Repli quand aucune pratique n'est assignée : `sommative` (indices) **et** `standards` (profil, `PRATIQUE_DEFAUT`). | #710, #839 | Deux replis. |
| 4 | Schéma SPE : `tableBundles` (spec, skill §5) **contre** `forfaits` (ce que l'assistant écrit). | SPEC_PAN_SPECIFICATIONS_V2, skill | Le moteur traduit à la lecture depuis #708. Le skill §5 ne dit pas que la forme écrite est `forfaits`. |
| 5 | « 14 modules » (labo-codex) **contre** 15 (`ls`). | labo-codex §5 | 15. |
| 6 | Doc de module : 3 familles, `pan-maitrise`, wizard Primo **contre** tout le reste. | `docs/modules/pratiques.md` | #804. |

---

## 5. Ce que ça change pour le labo

**Fait** : la question standards/cibles est **réglée** depuis le 9 septembre (#810 : la cible prime, portée par le critère, seuil M ou E ; vocabulaire livré en 1.127.3). **Fait** : le code construit encore la note STD sur un portfolio (N artefacts retenus + terminale) ; le chemin qui agrège par critère n'est pas bâti, et le chantier attendait la CoP du 14 septembre, dont l'issue n'est consignée nulle part dans le dépôt au 16. **Conséquence** : le labo décrit l'application telle qu'elle calcule, et l'audit juge chaque phrase « artefacts / cibles » à l'aune de la décision du 9, sans la rouvrir. Ce que le labo dira de la direction prise (cibles à venir) relève de Grégoire.

**Ce que l'audit à venir doit produire pour le labo**, au-delà des constats : un tableau « geste de l'utilisateur → écran → ce que l'app écrit → ce que le moteur lit → test qui le couvre », par famille. C'est la colonne vertébrale d'un « how to » qui ne ment pas, et c'est ce qui manque aujourd'hui entre le skill (moteur) et l'Aide (discours).

---

## Annexe A — tests du périmètre (noms, nombre de cas)

**Vitest (`tests/unit/`)** : `audit-pratique-de-notation-2026-09-05` 46 · `comparateur-banc-r4b-326` 19 · `denotation-modele-DEN0` 17 · `denotation-moteur-DEN1` 16 · `sentinelle-542-echelle-note-globale-pratique` 13 · `sentinelle-denotation-materiel-343` 13 · `exploration-hygiene-326` 13 · `exploration-pratiques-diff-326` 11 · `sentinelle-note-finale-portfolio-BC` 11 · `representation-pratiques` 11 · `sentinelle-ssot-pratique-type-L2b1` 9 · `sentinelle-816-modalites-de-selection-portfolio` 9 · `sentinelle-cle-nue-pratiques-config-ratchet` 9 · `sentinelle-pratiques-compatibles-retirees` 9 · `sentinelle-522-pratiques-serialisees` 8 · `decrire-calcul-denotation-333` 8 · `simulation-injection-326` 8 · `comparateur-source-fictive-326` 8 · `exploration-diff-souche-326` 7 · `sentinelle-ablation-vieil-editeur-pratique-338` 6 · `sentinelle-cablage-pratiqueid-307-sessionC` 6 · `sentinelle-bug-resolution-pratique-2026-05-31` 6 · `exploration-arbre-securite-326` 6 · `pratique-normalisation` 6 · `sentinelle-wizard-denotation-319` 5 · `sentinelle-descriptions-denotation-343` 5 · `exploration-pratiques-arbre-326` 5 · `exploration-maquette-filtre-326` 5 · `sentinelle-542-repli-pratique-actuelle` 4 · `sentinelle-762-diagnostic-aucune-pratique-assignee` 4 · `sentinelle-pratique-config-namespacee-341` 4 · `sentinelle-pratique-manager-canonique` 4 · `diagnostic-denotation-DEN4` 3 · `sentinelle-note-finale-nom-pratique-2026-05-31` 3 · `denotation-creation-DEN3` 2. Plus les sentinelles #706, #708, #709, #853 et les golden masters `golden-master-calcul-sessionC`, `golden-master-hybride-indiceP-339`.

**Playwright (`tests/integration/`)** : `import-pratiques-inter-trimestre-briqueC` 7 · `comparateur-pratiques-rendu` 6 · `depistage-542-niveau-global-selon-pratique` 3 · `denotation-saisie-DEN2` 2 · `pratique-edition-preserve-enveloppe` 2 · `pratiques-compatibles-retirees` 2 · `denotation-creation-DEN3` 1 · `cadre-763-pratique-appliquee-visible` 1 · `pratiques-762-appliquer-au-cours-actif` 1.

## Annexe B — commandes de mesure

```
wc -l js/pratiques/*.js
grep -n "_calculerMode" js/pratiques/pratique-pan-standards.js
grep -n "pratique-test\|pratiques/pratique-" index.html
grep -rn "pan-objectifs" js --include='*.js'
grep -rln "simulerIndices" js/ ; grep -rln "calculerDetailsNoteFinale" js/
grep -n "calcul_note" js/wizard-pratique-v2.js
grep -c -i "comparateur" js/guides-pedagogiques.js js/accompagnement*.js
```
