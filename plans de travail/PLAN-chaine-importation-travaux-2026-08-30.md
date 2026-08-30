# Plan de travail — chaîne d'importation des travaux (post-audit du 30 août 2026)

**Destinataire** : une session Claude Code (Opus 5), à froid, une session à la fois.
**Source unique des constats** : `Rapports/AUDIT-chaine-importation-travaux-2026-08-30.md` (sections 2.2, 2.3 et 3 à lire avant toute session). Ce plan ordonne, il ne redit pas.
**Objectif** : fermer les constats BLOQUANT et SÉRIEUX avant la cohorte de septembre 2026, sans perte de données ni empilement de code.

## Comment lire et tenir ce plan

- Le travail est découpé en **sessions numérotées** (`S1` … `S9`), à faire dans l'ordre sauf mention contraire. Une session = 90 minutes maximum = une branche courte = un merge vers `main` en fin de session.
- Chaque session contient des **tâches identifiées** (`T3.2` = session 3, tâche 2). Une tâche est une case à cocher. Une tâche cochée est une tâche **livrée, testée et mergée** — jamais « en cours ».
- Le **tableau d'état** ci-dessous est la seule vue d'ensemble. Le mettre à jour en fin de chaque session (statut + date + commit). C'est ce tableau que la session suivante lit en premier.
- Statuts autorisés : `À FAIRE` · `EN COURS (session du AAAA-MM-JJ)` · `LIVRÉ (commit abcdef0)` · `BLOQUÉ (motif)` · `ABANDONNÉ (décision Grégoire, date)`.
- Une session qui ne termine pas passe sa dernière tâche à `EN COURS`, remplit `RELAIS.md`, et note dans la colonne « Note » ce qui reste exactement.

## Tableau d'état

| Session | Constats | Statut | Date | Commit | Note |
|---|---|---|---|---|---|
| S0 — Préparation | — | LIVRÉ | 2026-08-30 | | D1=A, D2=A, D3=A · #607–#615 réservés · #606 coché (livré `c24036e7`) |
| S1 — Jetons ↔ fichiers | S5 | LIVRÉ | 2026-08-30 | `ba99f483` (1.106.9) | #607 · sentinelle 7 cas, 4 break-tests, 4 ROUGE · ⏳ test manuel Mac+iPad dû à Grégoire · T6.6 activée |
| S2 — Jeton et maximum par production | S6 | LIVRÉ | 2026-08-30 | `5752c20c` (1.106.10) | #608 · sentinelle Vitest 9 cas, 5 break-tests, 5 ROUGE · ⏳ test manuel `maxParProduction = 1` dû à Grégoire |
| S3 — Assemblage automatique | B1, M5 | LIVRÉ | 2026-08-30 | `17fb5f2a` (1.106.11) | #609 · D1 = A · sentinelle #603-604 étendue (24 cas), 4 break-tests, 4 ROUGE · ⏳ test manuel lot iPad avec deux homonymes |
| S4 — Reprise après interruption, rattachement | S1, S2 | À FAIRE | | | #610 · après S3, jamais en parallèle |
| S5 — Appariement par nom | S3 | À FAIRE | | | #611 |
| S6 — DA inconnu, groupe absent | S4, S7 | À FAIRE | | | #612 · D2 = A (refus dit) · T6.1 levée : #606 est mergé · **T6.6 activée** (même trou que S5 dans `supprimerEvaluation`) |
| S7 — Restauration ZIP | S8 | À FAIRE | | | #613 |
| S8 — Codex | S9, S10 | À FAIRE | | | #614 |
| S9 — Mineurs | M1–M4, M10 | À FAIRE | | | #615 · D3 = A (retirer) |
| S10 — Tests sur appareil | angles morts | À FAIRE | | | avec Grégoire, iPad + Mac |

Sessions indépendantes, permutables si une session bloque : S1, S2, S5, S7, S8.

### Répartition entre sessions Claude (30 août 2026, fin de journée)

Trois sessions terminal sont actives sur le dépôt. La répartition ci-dessous les
tient hors de conflit ; elle vit ICI, et pas seulement dans les messages
échangés entre sessions, parce qu'un message ne se relit pas après un
redémarrage.

| Session | Prend | Fichiers qui lui appartiennent |
|---|---|---|
| `kuekatsheu-c2` | **S4** (#610) | `js/travaux-import.js`, `js/travaux-ui.js` |
| `kuekatsheu-e6` | **S7** (#613) | `js/import-export.js` |
| `kuekatsheu-e8` | **S8** (#614) | `js/codex.js` |

**Gelées tant que S4 n'est pas livrée** : S5 (#611), S6 (#612) et S9 (#615)
touchent toutes `travaux-import.js`, `travaux-ui.js` ou `liste-evaluations.js`.

**Trois règles de non-collision**, apprises le 30 août :

1. **Une seule release à la fois.** `node scripts/release.mjs patch` réécrit
   `version.json`, `version.js`, `js/init-inline.js`, `js/main.js` et les jetons
   anti-cache d'`index.html`. Deux releases simultanées entrent en conflit à
   coup sûr : se prévenir avant de lancer la sienne.
2. **Staging chirurgical.** `git add` fichier par fichier, jamais `-A`, et
   `git diff --cached --stat` LU avant chaque commit. Le 30 août, trois fichiers
   non touchés par la session sont apparus dans son index — c'était le travail
   Cowork de Grégoire en parallèle. `git status` ne distingue pas les auteurs.
3. **`BACKLOG.md`, `SESSION.md` et `RELAIS.md` sont partagés** : on y ajoute son
   bloc, on n'écrase jamais celui d'un autre.

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
- [ ] **T0.5** — Committer l'audit et ce plan (`docs(audit): chaîne d'importation des travaux`), pousser.

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

- [ ] **T4.1** — Étendre `tests/unit/sentinelle-558-file-import-survit-reload.test.js` : la file est persistée à chaque fichier importé ; `tailleOriginale` survit au round-trip. ROUGE d'abord.
- [ ] **T4.2** — Nouvelle sentinelle : un fichier sans DA ré-importé (même `nomFichierLea`, même taille, même groupe) rend `{ doublon: true, critere: 'nom-taille' }`. ROUGE d'abord.
- [ ] **T4.3** — `importerTous` : `persisterFileDAttente()` à chaque itération.
- [ ] **T4.4** — `importerFichier` : détection `(nomFichierLea, tailleFichier)` pour les fichiers sans DA ou sans production (diff S1).
- [ ] **T4.5** — `traiterDoublonsImport` : afficher le critère `nom-taille` ; masquer « jeton » quand il n'y a pas d'élève.
- [ ] **T4.6** — `tailleOriginale` dans `preparerFichier`, persistance, restauration ; `reattacherBlobs` exige nom + `tailleOriginale` et rend `{ rattaches, ignores }` (retirer le retour numérique nu) ; `redeposerFichiers` affiche les ignorés. Rappel : ne jamais comparer `tailleFichier` (change à la conversion HEIC, `:1068`).
- [ ] **T4.7** — Break-test, suite complète, test manuel : recharger en cours d'import, re-déposer deux homonymes de tailles différentes.
- [ ] **T4.8** — Commit, release, merge, tableau, `SESSION.md`.

**Critère de fin** : un import interrompu puis rejoué ne crée aucun doublon muet ; un re-dépôt ne rattache jamais un blob à la mauvaise entrée.

---

## S5 — Appariement par nom (constat S3)

Fichier : `js/travaux-import.js` (`trouverEtudiantParNom`, `chercherParNomEtendu`). Risque : faible.

- [ ] **T5.1** — Sentinelle à table de cas : `Martin`/`Martineau`, `Roy`, `Côté` (accent dans la fiche, absent du nom), `Nguyen Tran`, nom inversé, deux homonymes → `null`, `Saint-Pierre` (deux tokens exigés, documenté). ROUGE d'abord.
- [ ] **T5.2** — Remplacer `trouverEtudiantParNom` par la version à tokens normalisés (diff S3).
- [ ] **T5.3** — Retirer la copie locale dans `chercherParNomEtendu` (`:299-311`) ; la faire appeler la même fonction sur la collection brute.
- [ ] **T5.4** — Break-test, suite complète.
- [ ] **T5.5** — Commit, release, merge, tableau, `SESSION.md`.

**Critère de fin** : aucune association par sous-chaîne ; nom ambigu → `null` ; accents neutralisés.

---

## S6 — DA inconnu, groupe absent (constats S4, S7) — après D2

Fichiers : `js/travaux-import.js` (`detecterFichiersDAInconnu`), `js/travaux-ui.js` (bandeau, message « autre GC » `:3685`, garde `groupeCoursActif`), `js/liste-evaluations.js` (lignes de rattrapage). Risque : moyen.

- [ ] **T6.1** — Vérifier l'état de `liste-evaluations.js` : #606 était non commité le 30 août. Ne rien faire tant qu'il n'est pas mergé ou explicitement abandonné.
- [ ] **T6.2** — Sentinelle : `detecterFichiersDAInconnu` rend les entrées `daDetecte && !etudiantAssocie` ; lignes de rattrapage de la liste : un fichier « DA inconnu + production valide » a une ligne `etudiantManquant: true`. ROUGE d'abord.
- [ ] **T6.3** — `travaux-import.js` : `detecterFichiersDAInconnu` + export.
- [ ] **T6.4** — `travaux-ui.js` : bandeau « DA sans élève dans ce groupe » ; corriger le message « autre GC » (diff S4) ; garde `groupeCoursActif` dans `confirmerImportPipeline` (si D2 = A). Ne PAS retirer le repli de `obtenirFichiersGroupeActif` (60 appelants non audités).
- [ ] **T6.5** — `liste-evaluations.js` : étendre la condition des lignes de rattrapage ; poser `etudiantManquant: !etudiant` (diff S4).
- [ ] **T6.6** — (réservé à T1.4 — **ACTIVÉ le 2026-08-30**.) `supprimerEvaluation` (`js/liste-evaluations.js`) porte le trou de S5 sur le chemin le plus fréquenté : supprimer une reprise depuis la liste restaure l'originale et laisse le fichier de la reprise actif, plus récent, donc gagnant au repli (DA, production). Correctif : exporter `_detacherFichiersDeEvaluation` (#607, `js/evaluation-jetons.js`) et l'appeler avant `sauvegarderDonneesSelonMode`, mode `corbeille`, quand `originaleRestauree` est vrai. Étendre la sentinelle #607 plutôt que d'en créer une seconde ; le `confirm` de suppression doit annoncer le sort du fichier, comme celui du retrait de jeton.
- [ ] **T6.7** — Break-test, suite complète, test manuel : fichier `12345678_devoir.pdf` ; supprimer le groupe actif puis tenter un import.
- [ ] **T6.8** — Commit, release, merge, tableau, `SESSION.md`.

**Critère de fin** : un DA inconnu est annoncé avant l'import et visible après ; sans groupe actif, l'import est refusé avec un message.

---

## S7 — Restauration ZIP (constat S8)

Fichier : `js/import-export.js` (`_restaurerBlobsDepuisZip` et ses deux appelants `:2644`, `:3071`). Risque : faible. Fichier sous surveillance sécurité : `cd tests && npm test` complet avant commit.

- [ ] **T7.1** — Étendre `tests/unit/sentinelle-import-export-383-384-385.test.js` : un blob refusé → `{ restaures, manquants: 1 }` et `blobStatut: 'manquant'` posé. ROUGE d'abord.
- [ ] **T7.2** — Appliquer le diff S8 : `notifier: false`, compte des manquants, marquage, retour objet ; retirer le bloc vide et le retour numérique.
- [ ] **T7.3** — Adapter les deux appelants ; message « Import partiel » quand `manquants > 0`.
- [ ] **T7.4** — Break-test, `npm test` complet, test manuel : ZIP dont un blob est corrompu.
- [ ] **T7.5** — Commit, release, merge, tableau, `SESSION.md`.

**Critère de fin** : une seule notification, compte exact, métadonnées marquées, jamais « réussi » sur un import partiel.

---

## S8 — Codex (constats S9, S10)

Fichier : `js/codex.js` (`_fusionnerTravaux`, plan de purge #336). Risque : faible.

- [ ] **T8.1** — Vérifier que les entrées de `fichiersModelisation` portent `id` (`modelisation.js:25-26, 238`) — non relu par l'audit.
- [ ] **T8.2** — Sentinelle : plan de purge avec une corbeille non vide → zéro orphelin recensé ; fusion avec un blob sans magic bytes → refusé, compté dans `erreurs`. ROUGE d'abord.
- [ ] **T8.3** — `validerMagicBytes` dans `_fusionnerTravaux` (diff S9).
- [ ] **T8.4** — Clés `corbeilleFichiers` et `fichiersModelisation` dans le recensement des références (diff S10).
- [ ] **T8.5** — Break-test, suite complète.
- [ ] **T8.6** — Commit, release, merge, tableau, `SESSION.md`.

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
