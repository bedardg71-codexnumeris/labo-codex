# Plan de travail — chaîne d'importation des travaux (post-audit du 30 août 2026)

**Destinataire** : une session Claude Code (Opus 5), à froid, une session à la fois.
**Source unique des constats** : `Rapports/AUDIT-chaine-importation-travaux-2026-08-30.md` (sections 2.2, 2.3 et 3 à lire avant toute session). Ce plan ordonne, il ne redit pas.
**Objectif** : fermer les constats BLOQUANT et SÉRIEUX avant la cohorte de septembre 2026, sans perte de données ni empilement de code.

## Comment lire et tenir ce plan

- Le travail est découpé en **sessions numérotées** (`S1` … `S9`), à faire dans l'ordre sauf mention contraire. Une session = 90 minutes maximum = une branche courte = un merge vers `main` en fin de session.
- Chaque session contient des **tâches identifiées** (`T3.2` = session 3, tâche 2). Une tâche est une case à cocher. Une tâche cochée est une tâche **livrée, testée et mergée** — jamais « en cours ».
- Le **tableau d'état** ci-dessous est la seule vue d'ensemble. Le mettre à jour en fin de chaque session (statut + date + commit). C'est ce tableau que la session suivante lit en premier.
- Statuts autorisés : `À FAIRE` · `EN COURS (session du AAAA-MM-JJ)` · `LIVRÉ (commit abcdef0)` · `BLOQUÉ (motif)` · `ABANDONNÉ (décision Grégoire, date)`.
- ⚠ **Consigne de Grégoire, 30 août 2026 au soir** : **cocher les tâches au fur et à mesure**, pas en
  fin de session. Une case laissée décochée sur une tâche faite coûte plus cher qu'un oubli de
  documentation : la session suivante la relit comme du travail restant et refait le geste, ou pire,
  la contourne. Vaut pour les trois sessions actives. Vérifié le 30 août : `T0.5` était décochée
  alors qu'elle était livrée.
- Une session qui ne termine pas passe sa dernière tâche à `EN COURS`, remplit `RELAIS.md`, et note dans la colonne « Note » ce qui reste exactement.

## Tableau d'état

| Session | Constats | Statut | Date | Commit | Note |
|---|---|---|---|---|---|
| S0 — Préparation | — | LIVRÉ | 2026-08-30 | | D1=A, D2=A, D3=A · #607–#615 réservés · #606 coché (livré `c24036e7`) |
| S1 — Jetons ↔ fichiers | S5 | LIVRÉ | 2026-08-30 | `ba99f483` (1.106.9) | #607 · sentinelle 7 cas, 4 break-tests, 4 ROUGE · ⏳ test manuel Mac+iPad dû à Grégoire · T6.6 activée |
| S2 — Jeton et maximum par production | S6 | LIVRÉ | 2026-08-30 | `5752c20c` (1.106.10) | #608 · sentinelle Vitest 9 cas, 5 break-tests, 5 ROUGE · ⏳ test manuel `maxParProduction = 1` dû à Grégoire |
| S3 — Assemblage automatique | B1, M5 | LIVRÉ | 2026-08-30 | `17fb5f2a` (1.106.11) | #609 · D1 = A · sentinelle #603-604 étendue (24 cas), 4 break-tests, 4 ROUGE · ⏳ test manuel lot iPad avec deux homonymes |
| S4 — Reprise après interruption, rattachement | S1, S2 | LIVRÉ | 2026-08-30 | `9dac5f49` | #610 · sentinelle 9 cas + #558 étendue (28), 8 break-tests, 8 ROUGE · release groupée en attente · ⏳ test manuel dû |
| S5 — Appariement par nom | S3 | LIVRÉ | 2026-08-30 | `349b780d` | #611 · session `kuekatsheu-ff` · sentinelle 16 cas (3 témoins), **ROUGE d'abord 13/16, 7 break-tests, 7 ROUGE** · ⚠ **défaut mesuré DANS le diff de l'audit, corrigé en l'appliquant** : `contient()` fait un `.every()` sur les tokens de la fiche — une liste vide rend `true`, la fiche s'apparie alors à TOUS les fichiers et rend `null` tout appariement légitime du groupe ; garde ajoutée et verrouillée · fusion des deux implémentations vérifiée contrat à contrat (même prédicat, même ordre de préférence ; seules la COLLECTION et deux gardes de nullité diffèrent) · ⚠ le nouvel ordre (correspondances complètes sur toute la collection avant repli nom seul) change aussi `detecterFichiersAutreGC`, chemin NON couvert par l'audit : **verrouillé par 3 cas passant par ce chemin** · release groupée en attente · ⏳ test manuel dû |
| S6 — DA inconnu, groupe absent | S4, S7 | **EN COURS (`kuekatsheu-00`, 2026-08-30 soir)** | 2026-08-30 | `1e2fc4d0` (T6.6) | #612 · D2 = A (refus dit) · T6.1 levée : #606 est mergé · **T6.6 activée** (même trou que S5 dans `supprimerEvaluation`), et faite EN PREMIER car seule tâche entièrement dans ses fichiers · ⚠ **l'ordre du plan est corrigé** : persister D'ABORD, détacher ensuite, et sur `resultat === true` seulement — `sauvegarderDonneesSelonMode` rend `false`, `true` ou `'quota'`, et `'quota'` est TRUTHY (`modes.js:751`) · T6.3 attend le commit de S5 (`travaux-import.js`) · trouvailles inscrites #617 et #618 · **T6.6 LIVRÉE `1e2fc4d0`** : sentinelle #607 étendue à 18 cas, 6 break-tests, 6 ROUGE, Vitest 411 fichiers / 4334 tests sortie 0 ; un défaut du HARNAIS corrigé au passage (le dernier cas de #607 montait le corpus partagé sans copie) ; ⏳ test manuel dû à Grégoire · **T6.3 LIVRÉE `15ef1c45`** : sentinelle neuve 10 cas, ROUGE d'abord 10/10, 5 break-tests, 5 ROUGE, Vitest 412 fichiers / 4344 tests sortie 0 · ⚠ arrêt volontaire ici ce soir, **décision de Grégoire** (question fermée, « continuer, T6.3 seule ») · restent T6.2, T6.4, T6.5, T6.7, T6.8 |
| S7 — Restauration ZIP | S8 | **EN COURS (session du 2026-08-30)** | 2026-08-30 | `f2d661dd` | #613 · session e6 · sentinelle #383-384-385 étendue (11 cas ajoutés, 18 au total), 10 break-tests, 10 ROUGE · **deux écarts du diff S8 corrigés** (sorties anticipées non converties ; garde `blobStatut !== 'exporte'` omise, confirmés au code par c2) · trouvaille versée en #616 (bornes par distance dans 31 sentinelles) · ⏳ T7.4 test manuel ZIP à blob corrompu dû à Grégoire · ⏳ T7.5 release en attente de son go |
| S8 — Codex | S9, S10 | LIVRÉ | 2026-08-30 | `785f7887` + `4b81842f` | #614 · session e8 · sentinelle 15 cas, 8 break-tests, 8 ROUGE · T8.1 mesuré (structure `id` confirmée) · arbitrage **fail-closed** sur la fusion · **pas de release propre — décision Grégoire du 30 août : une seule release groupée à la fin des trois chantiers** · ⏳ divergence fail-open du chemin « ouvrir » à trancher |
| S9 — Mineurs | M1–M4, M10 | À FAIRE | | | #615 · D3 = A (retirer) |
| S10 — Tests sur appareil | angles morts | **ABANDONNÉ (décision Grégoire, 2026-08-30)** | 2026-08-30 | | Motif, et il vaut pour les cycles suivants : aucun des ratés visés n'est IRRÉVERSIBLE (un fichier en corbeille se restaure, des doublons se suppriment, un statut écrasé est une perte d'information, pas de travail), et la porte centrale demandait d'importer dans le corpus RÉEL puis de confirmer un re-dépôt — **le test coûtait le risque qu'il mesurait**, à trois jours de la rentrée. ⮕ Remplacé par une seule surveillance, au premier import d'un vrai lot en septembre : **l'attribution des copies**, seul défaut du lot qui soit SILENCIEUX. Le reste sera vu en usage normal et signalé. Les portes écrites restent dans `plans de travail/PORTES-TERRAIN-2026-08-30.md` — elles ne sont PAS à jouer. |

Sessions indépendantes, permutables si une session bloque : S1, S2, S5, S7, S8.

### Répartition entre sessions Claude — À JOUR AU 30 AOÛT 2026, 19 h 45

⚠ **La répartition précédente est PÉRIMÉE et ses trois sessions sont MORTES.**
`kuekatsheu-c2` (S4), `kuekatsheu-e6` (S7) et `kuekatsheu-e8` (S8) ont été tuées
par le redémarrage de 19 h 05 (incident de trousseau macOS, sans rapport avec le
dépôt). **Leur travail n'est pas perdu** : il vivait dans l'index et dans l'arbre,
et `kuekatsheu-0d` l'a commité à 19 h 20 en deux commits séparés — c'est
exactement pourquoi le découpage index / arbre ne devait pas être aplati.
⮕ Ne cherche pas à joindre c2, e6 ou e8. Si un fichier de trace les nomme au
présent, il date d'avant 19 h 05.

**Répartition en vigueur :**

| Session | Prend | Fichiers qui lui appartiennent |
|---|---|---|
| ~~`kuekatsheu-ff`~~ | ~~**S5** (#611)~~ | **TERMINÉE** — travail commité (`349b780d`, `20c67e2f`), session disparue |
| ~~`kuekatsheu-00`~~ | ~~**S6** (#612)~~ | **TERMINÉE** — T6.6 (`1e2fc4d0`) et T6.3 (`15ef1c45`) commitées, session disparue ; T6.2, T6.4, T6.5, T6.7, T6.8 REMISES par Grégoire |
| ~~`kuekatsheu-0d`~~ | ~~relais du 30 août~~ | **TERMINÉE** le 30 août vers 20 h 30 ; ne tenait plus aucun fichier |
| **`kuekatsheu-bc`** | **relais du 30 août, soirée** | `BACKLOG.md`, `SESSION.md`, `RELAIS.md`, ce plan, la release et le push |

### Répartition du 30 août 2026 (soirée) — session `kuekatsheu-bc`

**Vérifié par `ListAgents` le 30 août à 20 h 30** : `ff`, `00` et `0d` ne sont plus
joignables ; leur travail est commité et ancêtre de `main`. Ne cherche pas à les
joindre. Deux sessions supplémentaires sont annoncées par Grégoire pour la
journée — **elles doivent s'inscrire ICI, avec les fichiers `js/` qu'elles
prennent, AVANT d'y écrire.** Les fichiers partagés restent à `kuekatsheu-bc`,
qui tient aussi la release et le push : personne d'autre ne lance
`release.mjs`.

⚠ **Les commits d'avance et leur push.** `main` portait 8 commits d'avance sur
`origin/main` le 30 août au soir, dont `15ef1c45` qui est du CODE — aucune
suite navigateur ne l'avait vu, le dernier verdict Playwright étant antérieur.
**Go de Grégoire obtenu le 30 août à 20 h 25, dans la session `kuekatsheu-bc`
et par ce canal seulement** : relance de la suite WebKit sur l'arbre gelé, puis
push. ✅ **FAIT** : WebKit vert (aucune rougeur nouvelle), Vitest vert au hook,
poussé à 20 h 36 (`540531e3..4cff5b92`). Un go de push est PONCTUEL et ne s'étend pas
au suivant — celui d'hier soir avait été consommé par la release 1.106.12.

**Le gel de S5, S6 et S9 est LEVÉ** : il tenait à S4, qui est commité (`9dac5f49`).

**Une seule dépendance d'ordre subsiste** : `T6.3` (`detecterFichiersDAInconnu`)
vit dans `js/travaux-import.js`, qui appartient à S5. `kuekatsheu-00` fait donc
`T6.6` d'abord — entièrement dans ses fichiers — et garde `T6.3` pour la fin,
quand `kuekatsheu-ff` a commité. **S9 (#615) reste non assignée** et touche
`travaux-ui.js` et `travaux-import.js` : ne pas l'ouvrir tant que S5 et S6
courent.

**Trois règles de non-collision**, apprises le 30 août :

1. **Une seule release à la fois.** `node scripts/release.mjs patch` réécrit
   `version.json`, `version.js`, `js/init-inline.js`, `js/main.js` et les jetons
   anti-cache d'`index.html`. Deux releases simultanées entrent en conflit à
   coup sûr : se prévenir avant de lancer la sienne.
2. **Staging chirurgical.** `git add` fichier par fichier, jamais `-A`, et
   `git diff --cached --stat` LU avant chaque commit. Le 30 août, trois fichiers
   non touchés par la session sont apparus dans son index — c'était le travail
   Cowork de Grégoire en parallèle. `git status` ne distingue pas les auteurs.
3. **`BACKLOG.md`, `SESSION.md`, `RELAIS.md` et ce plan sont partagés** : on y ajoute
   son bloc, on n'écrase jamais celui d'un autre.
   ⚠ **Corrigé le 30 août au soir par `kuekatsheu-e8`, après un incident évité de
   justesse** : `git diff --cached --stat` repère un fichier étranger, **pas un bloc
   étranger DANS un fichier attendu**. Un `git add BACKLOG.md` avait emporté le bloc
   d'une autre session, écrit dans un hunk contigu ; le compte de lignes paraissait
   plausible. Sur ces quatre fichiers, c'est le **diff stagé ENTIER** qu'il faut lire.
   Le geste de réparation : reconstruire l'index depuis `HEAD` (`git show HEAD:<fichier>`
   → ses seules transformations → `git hash-object -w` → `git update-index --cacheinfo`),
   puis **`git commit` SANS nommer de chemin** — `--only`, ou tout chemin passé au commit,
   reprend l'ARBRE et écrase le blob qu'on vient de poser.
4. **Les lettres du `?v=` sont par FICHIER, pas globales.** Mesuré le 30 août :
   `js/init-inline.js` et `js/changelog-data.js` portent tous deux `20260830i` sans
   conséquence. Un suffixe doit différer de ce que SON fichier portait avant, rien de
   plus — inutile de se réserver des lettres entre sessions.

⚠ Les identifiants #607 à #615 sont **déjà réservés** (T0.4) : les employer tels
quels, n'en réserver aucun de plus.

---

## Cadre non négociable (relire à chaque session)

1. Début de session : subagent `audit-debut-session` (CLAUDE.md), puis lire le tableau d'état ci-dessus et `git log --oneline -20`. Ne pas croire le tableau sur parole : vérifier qu'un `LIVRÉ` est bien dans `main`.
2. Un fichier à la fois, validation fonctionnelle après chacun.
3. Zéro-dette : chaque correctif RETIRE ce qu'il remplace (nommé dans l'audit, section 3). Pas d'alias, pas de repli « au cas où ».
4. Chaque session livre au moins une sentinelle Vitest dans `tests/unit/`, avec **break-test** : muter le correctif → ROUGE obtenu → remettre → VERT. Un vert sans rouge préalable ne compte pas.
5. Vitest se lance depuis `tests/` (`cd tests && npx vitest run …`). Lire le **code de sortie**, pas « passed ».
6. Node n'a pas d'IndexedDB : `db.set` y est synchrone et masque les courses. Tout test touchant `db.setSync` sur une grosse clé force `useIndexedDB` avec une fausse connexion (patron : `tests/unit/sentinelle-522-pratiques-serialisees.test.js`).
7. Vitest ne voit pas le rendu : une modale de `travaux-ui.js` exige en plus Playwright/WebKit ou un test manuel consigné dans la colonne « Note ».
8. Ne pas toucher : `js/config.js`, `js/navigation.js`, `noms_stables.json`.
9. Inscrire un `#NNN` dans `BACKLOG.md` AVANT de l'employer dans un commit (S0 les réserve tous d'un coup).
10. Release : `node scripts/release.mjs patch` par session mergée, changelog, puis sentinelle anti-cache APRÈS le commit de release.
11. Fin de session : tableau d'état, `SESSION.md` (bloc daté : livré / restant / sentinelles avec rouge obtenu oui-non), `BACKLOG.md` coché, merge `main` ou `RELAIS.md`.

Séquence identique pour chaque tâche de code :

```
a. Lire les lignes citées par l'audit (pas le fichier entier).
b. Vérifier que le code est encore celui de l'audit (git log du fichier depuis ac1adfcb).
c. Écrire la sentinelle, la faire ROUGIR sur le code actuel.
d. Appliquer le diff de l'audit (section 3), adapté si le code a bougé.
e. Sentinelle VERTE ; suite Vitest complète ; code de sortie 0.
f. Retirer ce que le diff remplace.
g. Test manuel consigné (Mac ET iPad si modale ou stockage).
```

---

## S0 — Préparation (30 minutes, avec Grégoire)

Trois décisions fermées, une recommandation chacune. Les consigner ici, avec la date, avant de commencer S3, S6 ou S9.

- [x] **T0.1 — Décision D1 (pour S3)** : deux remises Léa d'un même élève à des dates différentes sont-elles deux documents ? Option A (recommandée) : oui, dates distinctes = documents distincts, doublon signalé à l'import. Option B : conserver la fusion actuelle. **Décision : OPTION A (date : 2026-08-30)** — la clé d'assemblage porte l'horodatage de remise ; deux remises datées différemment ne sont jamais soudées.
- [x] **T0.2 — Décision D2 (pour S6)** : sans groupe-cours actif, refuser l'import ? Option A (recommandée) : refus avec message. Option B : autoriser et marquer les fichiers pour réassociation. **Décision : OPTION A (date : 2026-08-30)** — garde dans `confirmerImportPipeline`, refus DIT. Le repli de `obtenirFichiersGroupeActif` n'est pas touché (60 appelants non audités).
- [x] **T0.3 — Décision D3 (pour S9)** : retirer « Renommer pour distinguer » de la modale de confirmation ? Option A (recommandée) : retirer. Option B : garder, reformulé. **Décision : OPTION A (date : 2026-08-30)** — le bouton part avec `renommerDoublon` et `renommerFichierDansFile`.
- [x] **T0.4** — Réserver dans `BACKLOG.md`, en une seule écriture, un `#NNN` par session S1 à S9 ; les reporter dans le tableau d'état (colonne Note). **Fait le 2026-08-30 : #607 à #615**, section « Chaîne d'importation des travaux » en tête de `## A faire`. Dernier ID utilisé auparavant : #606.
- [x] **T0.5** — Committer l'audit et ce plan (`docs(audit): chaîne d'importation des travaux`), pousser.
  **Était à moitié faite** : l'audit et le plan étaient commités (`88a2a244`) mais JAMAIS poussés — écart relevé par l'audit de début de session du 30 août. Poussés avec le commit de S0 (`8c938841`).

---

## S1 — Jetons ↔ fichiers (constat S5)

Fichier : `js/evaluation-jetons.js`. Risque de régression : faible (module isolé, appelants `evaluation-sauvegarde.js:915, 941`).

- [x] **T1.1** — Sentinelle `tests/unit/sentinelle-jeton-retire-fichier-reprise.test.js` : charger `evaluation-jetons.js` avec un stub `travauxStockage` ; deux évaluations (originale archivée, reprise) et deux fichiers (original sans `evaluationId`, reprise avec) ; `retirerJetonReprise(reprise.id)` doit passer le fichier de reprise par `deplacerEnCorbeille`. La faire ROUGIR sur le code actuel.
- [x] **T1.2** — Ajouter `_detacherFichiersDeEvaluation(evaluationId, mode)` (diff S5 de l'audit) ; l'appeler AVANT `_persisterEvaluationsJetons` dans les trois branches : originale supprimée (`archiverOriginale = false`), originale restaurée (#141), reprise retirée. Vérifier que `mettreAJourFichier` accepte `evaluationId` et `estReprise` (`travaux-stockage.js:419`).
- [x] **T1.3** — Mettre à jour le texte du `confirm` (`evaluation-jetons.js:579-583`) : annoncer la mise en corbeille du fichier de reprise.
- [x] **T1.4** — Vérifier `_restaurerOriginaleSiReprise` dans `liste-evaluations.js` (chemin « supprimer une reprise », sentinelle 2026-06-08) : a-t-il le même trou ? Si oui, l'inscrire comme **T6.6** ; sinon le noter ici comme vérifié.
  **VÉRIFIÉ le 2026-08-30 : OUI, le même trou, sur le chemin le plus fréquenté.** `supprimerEvaluation` (`liste-evaluations.js:2031-2066`) appelle `restaurerOriginaleSiReprise`, retire les quatre marqueurs d'archivage de l'originale, filtre la reprise — et ne touche à aucun fichier. Le fichier de la reprise garde son `evaluationId` mort et sa `dateModification` la plus récente ; la ligne de l'originale restaurée ouvre le travail de la reprise effacée, exactement comme dans S5. La différence est de porte, pas de mécanisme : ici on supprime l'évaluation, là on retire le jeton. ⮕ **Inscrit en T6.6.**
- [x] **T1.5** — Break-test (retirer un appel → rouge), suite complète, test manuel : appliquer puis retirer un jeton dans le formulaire ; la ligne de l'originale doit rouvrir le fichier original.
- [x] **T1.6** — Commit, release patch, merge, tableau d'état, `SESSION.md`.

**Critère de fin** : après `retirerJetonReprise`, `trouverFichierPourEvaluation(originale)` rend le fichier original ; le fichier de reprise est en corbeille.

---

## S2 — Jeton et maximum par production (constat S6)

Fichier : `js/travaux-ui.js` (`traiterDoublonsImport`, `appliquerJetonsReprisePostImport`). Risque : faible.

- [x] **T2.1** — Sentinelle sur `appliquerJetonsReprisePostImport` si la fonction est extractible au banc ; sinon test Playwright. Consigner lequel dans la Note.
  **VITEST, pas Playwright.** `js/travaux-ui.js` se charge entier dans le sandbox `chargerScript` dès qu'on lui donne un `window.addEventListener` (il en pose un au top-level) : aucun autre effet de bord ne l'en empêche. Les deux points de décision sont exposés sous un souligné — `travauxUI._jetonRepriseOffrable` et `travauxUI._appliquerJetonsReprisePostImport` — le souligné disant « pas une API », comme `window._restaurerOriginaleSiReprise` dans `liste-evaluations.js`. La modale elle-même reste hors banc : sa DÉCISION est testée, son rendu attend le test manuel.
- [x] **T2.2** — Modale : n'afficher « Appliquer comme jeton de reprise » que si `reprisesProd < maxParProduction` (diff S6).
- [x] **T2.3** — Branche `jeton` : quand `appliquerJetonReprise` rend `null`, notification d'erreur explicite (fichier importé comme reprise, aucun jeton consommé).
- [x] **T2.4** — Post-import : séparer `rattaches` de `compteur` ; deux notifications distinctes (« jetons appliqués » / « fichiers rattachés à une reprise déjà accordée »). Retirer le `compteur++` de la branche `repriseExistante`.
- [x] **T2.5** — Break-test, suite complète, test manuel avec `maxParProduction = 1` et un troisième fichier.
- [x] **T2.6** — Commit, release, merge, tableau, `SESSION.md`.

**Critère de fin** : maximum atteint → pas de bouton « jeton » ; un rattachement n'est jamais annoncé comme un jeton appliqué.

---

## S3 — Assemblage automatique (constats B1, M5) — après D1

Fichiers : `js/travaux-import.js` (`preparerFichier`, `regrouperParDocument`), `js/travaux-ui.js` (`assemblerGroupesPipeline`). Risque : moyen (#603 vient d'y passer).

- [x] **T3.1** — Étendre `tests/unit/sentinelle-603-604-import-pages-et-remplacement.test.js` (ne pas créer une seconde sentinelle) avec trois cas : deux images homonymes sans DA → deux groupes ; deux remises Léa même DA/production, dates différentes → deux groupes (si D1 = A) ; pages d'une même remise → un groupe. ROUGE sur le code actuel.
- [x] **T3.2** — `regrouperParDocument` : clé `_solo_` + index, jamais le nom de fichier. Vérifier le rendu par groupe (`travaux-ui.js:864`) qui consomme la même fonction.
  **VÉRIFIÉ : ce site ne consommait rien.** `afficherImport` appelait `regrouperParDocument()` uniquement pour passer le résultat à `genererEtape2Colonnes(queue, groupes)` — qui ne l'a JAMAIS lu : elle reconstruit son propre index à partir de `f.groupeDocumentId`. Paramètre mort et appel inutile RETIRÉS (zéro-dette), pour qu'aucun lecteur ne croie que le rendu de l'étape 2 dépend de la clé de regroupement. Seul vrai consommateur : `assemblerGroupesPipeline` (`:4316`).
- [x] **T3.3** — `preparerFichier` : `groupeDocumentId` = DA + production + horodatage de remise si présent (seulement si D1 = A).
- [x] **T3.4** — `assemblerGroupesPipeline` : persister la file après le splice ; exposer `persisterFileDAttente` sur `window.travauxImport`.
- [x] **T3.5** — Break-test, suite complète (la sentinelle #603-604 d'origine reste verte), test manuel : lot de photos iPad avec deux homonymes.
- [x] **T3.6** — Commit, release, merge, tableau, `SESSION.md`.

**Critère de fin** : aucun assemblage ne repose sur un nom de fichier ; deux remises datées différemment ne sont jamais soudées.

---

## S4 — Reprise après interruption, rattachement (constats S1, S2) — après S3, jamais en parallèle

Fichiers : `js/travaux-import.js` (`importerFichier`, `importerTous`, `persisterFileDAttente`, `restaurerFileDAttente`, `reattacherBlobs`), `js/travaux-ui.js` (`redeposerFichiers`, modale doublon). Risque : moyen.

- [x] **T4.1** — Étendre `tests/unit/sentinelle-558-file-import-survit-reload.test.js` : la file est persistée à chaque fichier importé ; `tailleOriginale` survit au round-trip. ROUGE d'abord.
- [x] **T4.2** — Nouvelle sentinelle : un fichier sans DA ré-importé (même `nomFichierLea`, même taille, même groupe) rend `{ doublon: true, critere: 'nom-taille' }`. ROUGE d'abord.
- [x] **T4.3** — `importerTous` : `persisterFileDAttente()` à chaque itération.
- [x] **T4.4** — `importerFichier` : détection `(nomFichierLea, tailleFichier)` pour les fichiers sans DA ou sans production (diff S1).
- [x] **T4.5** — `traiterDoublonsImport` : afficher le critère `nom-taille` ; masquer « jeton » quand il n'y a pas d'élève.
- [x] **T4.6** — `tailleOriginale` dans `preparerFichier`, persistance, restauration ; `reattacherBlobs` exige nom + `tailleOriginale` et rend `{ rattaches, ignores }` (retirer le retour numérique nu) ; `redeposerFichiers` affiche les ignorés. Rappel : ne jamais comparer `tailleFichier` (change à la conversion HEIC, `:1068`).
- [x] **T4.7** — Break-test, suite complète, test manuel : recharger en cours d'import, re-déposer deux homonymes de tailles différentes.
- [~] **T4.8** — Commit, release, merge, tableau, `SESSION.md`. **Commit, tableau et `SESSION.md` faits ; RELEASE EN ATTENTE** — décision de Grégoire du 30 août au soir : une seule release groupée quand S4, S7 et S8 seront tous commités (motif sous T8.6).

**Critère de fin** : un import interrompu puis rejoué ne crée aucun doublon muet ; un re-dépôt ne rattache jamais un blob à la mauvaise entrée.

---

## S5 — Appariement par nom (constat S3)

Fichier : `js/travaux-import.js` (`trouverEtudiantParNom`, `chercherParNomEtendu`). Risque : faible.

- [x] **T5.1** — Sentinelle à table de cas : `Martin`/`Martineau`, `Roy`, `Côté` (accent dans la fiche, absent du nom), `Nguyen Tran`, nom inversé, deux homonymes → `null`, `Saint-Pierre` (deux tokens exigés, documenté). ROUGE d'abord.
- [x] **T5.2** — Remplacer `trouverEtudiantParNom` par la version à tokens normalisés (diff S3).
- [x] **T5.3** — Retirer la copie locale dans `chercherParNomEtendu` (`:299-311`) ; la faire appeler la même fonction sur la collection brute.
- [x] **T5.4** — Break-test, suite complète.
- [x] **T5.5** — Commit `349b780d`, tableau, `BACKLOG.md`, `SESSION.md`. ⚠ **release et merge NON faits, à dessein** : décision de Grégoire du 30 août, une seule release GROUPÉE pour S4+S7+S8+S5, lancée par une seule session sur son go (`release.mjs` bumpe les `?v=` de tout l'arbre, y compris le travail non commité des autres sessions).

**Critère de fin** : aucune association par sous-chaîne ; nom ambigu → `null` ; accents neutralisés.

---

## S6 — DA inconnu, groupe absent (constats S4, S7) — après D2

Fichiers : `js/travaux-import.js` (`detecterFichiersDAInconnu`), `js/travaux-ui.js` (bandeau, message « autre GC » `:3685`, garde `groupeCoursActif`), `js/liste-evaluations.js` (lignes de rattrapage). Risque : moyen.

- [x] **T6.1** — Vérifier l'état de `liste-evaluations.js` : #606 était non commité le 30 août. — LEVÉE : `c24036e7` est dans `main`, vérifié au log le 30 août.
- [ ] **T6.2** — Sentinelle : `detecterFichiersDAInconnu` rend les entrées `daDetecte && !etudiantAssocie` ; lignes de rattrapage de la liste : un fichier « DA inconnu + production valide » a une ligne `etudiantManquant: true`. ROUGE d'abord.
- [x] **T6.3** — LIVRÉ `15ef1c45`. `travaux-import.js` : `detecterFichiersDAInconnu` + export.
  ⮕ Sentinelle neuve `tests/unit/sentinelle-612-da-inconnu.test.js`, 10 cas, **ROUGE d'abord (10/10)**,
  **5 break-tests, 5 ROUGE** (les DEUX côtés du `&&`, prédicat inversé, export retiré, sortie anticipée).
  Vitest 412 fichiers / 4344 tests, code de sortie 0.
  ⚠ **Mesuré, pas supposé** : le prédicat porte sur `daDetecte` SEUL, pas sur
  `(parseLea && parseLea.da) || daDetecte` comme son voisin. `parseLea.da` vaut
  `detecterDA(partieIdentite)`, un PRÉFIXE du nom dont `daDetecte` est tiré — le second ne peut pas être
  vide quand le premier ne l'est pas. La partition avec `detecterFichiersSansDA` tient, et un cas la vérifie.
  ⚠ **Rien ne consomme encore la fonction** : son bandeau est T6.4. La sentinelle en est le seul appelant.
- [ ] **T6.4** — ⮕ **À savoir avant d'ouvrir** (trouvé pendant T6.3) : le bandeau « sans DA » existant dit
  « l'association devra être faite manuellement ». Depuis #611, c'est **inexact** pour un fichier apparié
  par le NOM — il n'a pas de DA, donc il est bien recensé « sans DA », mais son élève EST trouvé. Le
  message vaut toujours pour le regroupement multi-pages, pas pour l'association. À reformuler en même
  temps que le message « autre GC ».
  `travaux-ui.js` : bandeau « DA sans élève dans ce groupe » ; corriger le message « autre GC » (diff S4) ; garde `groupeCoursActif` dans `confirmerImportPipeline` (si D2 = A). Ne PAS retirer le repli de `obtenirFichiersGroupeActif` (60 appelants non audités).
- [ ] **T6.5** — `liste-evaluations.js` : étendre la condition des lignes de rattrapage ; poser `etudiantManquant: !etudiant` (diff S4).
- [x] **T6.6** — LIVRÉ `1e2fc4d0`. (réservé à T1.4 — **ACTIVÉ le 2026-08-30**.) `supprimerEvaluation` (`js/liste-evaluations.js`) porte le trou de S5 sur le chemin le plus fréquenté : supprimer une reprise depuis la liste restaure l'originale et laisse le fichier de la reprise actif, plus récent, donc gagnant au repli (DA, production). Correctif : exporter `_detacherFichiersDeEvaluation` (#607, `js/evaluation-jetons.js`) et l'appeler avant `sauvegarderDonneesSelonMode`, mode `corbeille`, quand `originaleRestauree` est vrai. Étendre la sentinelle #607 plutôt que d'en créer une seconde ; le `confirm` de suppression doit annoncer le sort du fichier, comme celui du retrait de jeton.
  ⮕ **FAIT** : deux helpers exportés (`window._detacherFichiersDeEvaluation`, `window._compterFichiersDeEvaluation`),
  finder `trouverOriginaleRemplaceePar` extrait en lecture seule pour que le `confirm` annonce avant que la
  mutation décide, sentinelle #607 étendue à 18 cas, **6 break-tests, 6 ROUGE**, Vitest 411/4334 sortie 0.
  ⚠ **ÉCART ASSUMÉ AVEC CE PLAN, validé par `kuekatsheu-0d`** : on persiste D'ABORD et on détache APRÈS,
  et seulement sur `=== true`. `sauvegarderDonneesSelonMode` rend trois valeurs (`modes.js:751`) — `true`,
  `false`, et la chaîne `'quota'`, **truthy alors que rien n'est enregistré**. Détacher avant l'écriture, ou
  sur un `'quota'`, mettrait le fichier à la corbeille pour une suppression qui n'a pas eu lieu.
  ⏳ **Test manuel dû à Grégoire** (Vitest ne voit pas le rendu) : supprimer une reprise depuis la Liste —
  la question doit annoncer le fichier, et la ligne de l'originale rouvrir le travail ORIGINAL.
- [ ] **T6.7** — Break-test, suite complète, test manuel : fichier `12345678_devoir.pdf` ; supprimer le groupe actif puis tenter un import.
- [ ] **T6.8** — Commit, release, merge, tableau, `SESSION.md`.

**Critère de fin** : un DA inconnu est annoncé avant l'import et visible après ; sans groupe actif, l'import est refusé avec un message.

---

## S7 — Restauration ZIP (constat S8)

Fichier : `js/import-export.js` (`_restaurerBlobsDepuisZip` et ses deux appelants `:2644`, `:3071`). Risque : faible. Fichier sous surveillance sécurité : `cd tests && npm test` complet avant commit.

- [x] **T7.1** — Étendre `tests/unit/sentinelle-import-export-383-384-385.test.js` : un blob refusé → `{ restaures, manquants: 1 }` et `blobStatut: 'manquant'` posé. ROUGE d'abord. — FAIT : 11 cas ajoutés au fichier existant, ROUGE obtenu d'abord (9 échecs ciblés).
- [x] **T7.2** — Appliquer le diff S8 : `notifier: false`, compte des manquants, marquage, retour objet ; retirer le bloc vide et le retour numérique. — FAIT, avec DEUX corrections au diff de l'audit : les deux sorties anticipées rendent elles aussi `{ restaures: 0, manquants: 0 }` (le diff n'en convertissait qu'une sur trois), et la garde `blobAttendu = f.blobStatut !== 'exporte'` de `chargerCodex` est reprise — elle gouverne les TROIS portes de sortie, et le marquage n'écrase jamais un `'exporte'`.
- [x] **T7.3** — Adapter les deux appelants ; message « Import partiel » quand `manquants > 0`. — FAIT : `executerImportLocalStorageBrut` dit « Import partiel » avec le compte et la conduite à tenir ; `executerImportSelectif` ajoute un suffixe « N non restauré(s), marqué(s) manquant » dans ses deux branches. Sans « ⚠ » (zéro emoji dans l'UI).
- [~] **T7.4** — Break-test, `npm test` complet, test manuel : ZIP dont un blob est corrompu.
  **Break-test FAIT** (10 mutations, 10 ROUGE obtenus, par `e6`). **`npm test` complet FAIT le
  2026-08-30 à 19 h 40 par `kuekatsheu-0d`, sur `f419c467`, arbre propre : Vitest 410 fichiers /
  4307 tests, code de sortie 0 · Playwright WebKit 210/210, code de sortie 0, 7,1 min.**
  ⮕ Au passage, la spec que la note de 19 h 05 donnait pour ROUGE est VERTE :
  `confirmations-conception-uniformes.spec.js:151` (« résumé d'import · aucun \n littéral »). Le
  rouge observé portait sur un arbre intermédiaire, pas sur le code commité — rien à corriger.
  ⏳ **RESTE le seul test manuel** : importer un ZIP dont un blob est corrompu ; l'application doit
  dire « Import partiel » avec le compte, et la visionneuse « manquant ». Dû à Grégoire.
- [~] **T7.5** — Commit, release, merge, tableau, `SESSION.md`. **Commité `f2d661dd`** par
  `kuekatsheu-0d` le 30 août à 19 h 20 (les sessions du soir sont mortes avant d'avoir commité leur
  propre travail). Tableau et `SESSION.md` faits. **RELEASE ET PUSH EN ATTENTE du go de Grégoire**,
  groupés avec S4 et S8.

**Critère de fin** : une seule notification, compte exact, métadonnées marquées, jamais « réussi » sur un import partiel.

> ⚠ **DEUX ÉCARTS DANS LE DIFF S8 DE L'AUDIT** — relevés par la session `kuekatsheu-e6`
> le 30 août 2026, vérifiés au code par `kuekatsheu-c2`. **Ne pas appliquer le diff tel
> quel.**
>
> 1. **Le diff ne convertit que le retour final.** `_restaurerBlobsDepuisZip`
>    (`js/import-export.js:1358`) a DEUX sorties anticipées `return 0` — `!donnees._zipTravaux`
>    et `metadonnees.length === 0`. Converties nulle part par le diff : les appelants liraient
>    `resBlobs.restaures` sur un nombre, donc `undefined`, valeur qu'on lit comme un zéro sans
>    le savoir. Les convertir aussi, et poser un cas de sentinelle sur la forme stable
>    (`{ restaures: 0, manquants: 0 }`). Même défaut que celui fermé en S2 : un retour numérique
>    nu qui devient un objet ne se convertit pas à un seul endroit.
> 2. **Le diff perd la moitié du contrat qu'il prétend copier.** Il pousse `idsManquants.push(f.id)`
>    dans trois branches sans reprendre la garde que `js/codex.js:686-689` porte déjà :
>    `blobStatut !== 'exporte'` — « un statut `exporte` n'a légitimement pas de blob dans le ZIP,
>    le blob avait déjà quitté l'app au moment de l'export ». Appliqué tel quel, un import
>    **complet** s'annoncerait **partiel**, et un `'exporte'` légitime serait écrasé par un
>    `'manquant'` faux (perte d'information, pas seulement message inexact). La garde doit
>    gouverner les DEUX gestes : ni compté manquant, ni marqué.
>    ⮕ Break-test attendu : un ZIP dont tous les fichiers absents sont `blobStatut: 'exporte'`
>    rend `manquants: 0` et annonce un import COMPLET. Muter la garde doit rougir.

---

## S8 — Codex (constats S9, S10)

Fichier : `js/codex.js` (`_fusionnerTravaux`, plan de purge #336). Risque : faible.

- [x] **T8.1** — Vérifier que les entrées de `fichiersModelisation` portent `id` (`modelisation.js:25-26, 238`) — non relu par l'audit.
- [x] **T8.2** — Sentinelle : plan de purge avec une corbeille non vide → zéro orphelin recensé ; fusion avec un blob sans magic bytes → refusé, compté dans `erreurs`. ROUGE d'abord.
- [x] **T8.3** — `validerMagicBytes` dans `_fusionnerTravaux` (diff S9).
- [x] **T8.4** — Clés `corbeilleFichiers` et `fichiersModelisation` dans le recensement des références (diff S10).
- [x] **T8.5** — Break-test, suite complète.
- [x] **T8.6** — Commits `785f7887` (correctif) et `4b81842f` (suivi) · tableau, BACKLOG et `SESSION.md` FAITS.
  · **Release : AUCUNE pour S8.** Décision de Grégoire, 30 août 2026 — une seule release groupée quand les
    trois chantiers du soir (S7, S8, S4) sont commités. Motif mesuré : `release.mjs` réunit l'arbre de
    travail ET tout ce qui a changé depuis la release précédente (`scripts/release.mjs:189-214`), donc une
    release lancée par une session bumpe dans `index.html` les `?v=` de fichiers que les AUTRES n'ont pas
    encore commités. Vaut pour S7 (T7.5) et pour S4.
  · ⏳ Push en attente du vert de c2 — le hook `pre-push` teste l'arbre de travail, pas le commit.

**Critère de fin** : aucun blob n'entre par la fusion sans validation ; la purge ne recense jamais la corbeille ni la modélisation.

---

## S9 — Mineurs (constats M1, M2, M3, M4, M10) — après D3 ; une seule session

- [ ] **T9.1 (M1)** — Selon D3 : retirer « Renommer pour distinguer » (`travaux-ui.js:3764-3771`, `renommerDoublon`, `renommerFichierDansFile`) ou reformuler honnêtement.
- [ ] **T9.2 (M2)** — `_detecterPattern` lit `estReprise` (transmettre le champ depuis `diagnostiquerDoublons`) ; la branche `jeton` de la modale d'import valide le cas.
- [ ] **T9.3 (M3)** — Établir si `lancerImport` est atteignable ; sinon le retirer avec son bouton (`:2467`) et `genererHTMLFileDAttente`.
- [ ] **T9.4 (M4)** — `livrableAdditionnel` : le persister ou le retirer des métadonnées d'import ; pas d'entre-deux.
- [ ] **T9.5 (M10)** — `docs/DATA-OWNERSHIP.md` : seuil IDB-first = 25 Ki (`db.js:120`).
- [ ] **T9.6** — M7, M8, M9, M11 : commentaire dans le code concerné ; au BACKLOG seulement si symptôme vécu (règle du 24 août).
- [ ] **T9.7** — Suite complète, commit, release, merge, tableau, `SESSION.md`.

---

## S10 — Tests sur appareil (angles morts, section 4 de l'audit) — avec Grégoire

À faire après S4 au plus tôt. Une case par test, résultat noté en une ligne (date, appareil, observé).

- [ ] **T10.1** — Ordre de la `FileList` au re-dépôt de deux homonymes : Finder (Mac) · Fichiers (iPad). Observé : ______
- [ ] **T10.2** — Léa : un export peut-il contenir deux remises d'un même élève, sous quel nom ? Observé : ______
- [ ] **T10.3** — iPad : 40 photos d'iPhone, veille en cours de lot ; l'onglet survit-il, `sessionStorage` survit-il ? Observé : ______
- [ ] **T10.4** — iPad : quota IndexedDB à 100 % ; message obtenu ; `navigator.storage.persist()` en onglet Safari et en mode écran d'accueil. Observé : ______
- [ ] **T10.5** — Mac Chrome + FSAPI : un codex enregistré embarque-t-il les blobs disque ? Observé : ______
- [ ] **T10.6** — Fermer l'onglet dans la seconde qui suit un import : métadonnées présentes au retour ? Observé : ______
- [ ] **T10.7** — Liste des évaluations à 450 fichiers sur iPad : temps de rendu. Observé : ______
