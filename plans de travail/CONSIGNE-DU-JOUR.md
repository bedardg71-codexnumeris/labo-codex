# Consigne du jour – Lot N3 : le panneau « Développement des habiletés » lit la note, et n'écrit rien (#714)

> Écrite le 22 septembre 2026, 17 h 50 (Toronto), par Cowork, sur `origin/main` = `0026e95b` (application en 1.155.0). **Proposée** tant que Grégoire ne l'a pas relayée.
> La précédente (#695, la date dans l'Inspecteur, livrée en 1.155.0 et vérifiée à l'écran par Grégoire) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-22-date-inspecteur.md` (déplacée par Cowork, à commiter avec ce lot).
> **La fiche fait foi** : `BACKLOG.md`, #714 (≈ l. 787). Le lot est le premier de l'ordre recommandé dans `plans de travail/FILE-DES-LOTS.md` (N3, N2, N4, N5, N6). Isolé, **aucune question à Grégoire**, sauf l'arrêt prévu au §3.

## 0 · Conditions de départ

- `origin/main` porte `0026e95b` ou un commit de journal après. Aucune autre session n'écrit dans `js/`.
- Branche `lot-n3-habiletes` partie de `main`. Rien ne se fusionne ni ne se pousse avant la relecture de Cowork (PROTOCOLE, règle 2).
- Skills `pratiques-notation` (le moteur), `labo-codex`, `design-interface` si un mot change à l'écran.
- **Au passage, sans release** : coche au `BACKLOG.md` les quatre fiches livrées en 1.153.0 et restées ouvertes (#710, #711, #712, #719 ; #713 garde son volet plancher, lot N4). Remesure chacune avant de cocher (règle 1 : aucune ancre sans preuve). Et commite `DEPLOY.md` et `CONSIGNE-DEMARRAGE-COWORK.md` avec le relais, comme dit par Cowork le 21.

## 1 · Ce que Cowork a remesuré (lecture seule, 17 h 45) – la fiche est vraie, ses numéros de ligne ont bougé

- **Le panneau** : `genererSectionPerformance` est à `js/profil-etudiant-sections-affichage.js:4053` (la fiche dit 4130).
- **« 3 meilleurs »** : `const nombreARetenir = portfolio.regles.nombreARetenir || 3;` (≈ l. 4119) lit les `regles` de la PRODUCTION Portfolio, pas la pratique. `selectionComplete` (≈ l. 4138) compare aussi à `portfolio.regles.nombreARetenir`.
- **« Calcul impossible : aucune évaluation disponible »** (≈ l. 4210) : `_lireDetailsRapportPerformance` (l. 3988) lit `indicesCP.details.*`. Plus rien n'écrit `details` : `grep -rn "details\.\(artefactsRetenus\|notes\|methodeSelection\)\s*=" js/` → **0**. La branche qui remplit la liste est donc morte, et le message s'affiche sous un P juste.
- **L'écriture au rendu** : `_appliquerSelectionAutoArtefacts` (l. 3837), appelée à ≈ l. 4121, fait `db.setSync(cle('portfoliosEleves'), …)` puis `calculerEtStockerIndicesCP()` **à chaque affichage** d'un élève sans sélection. Elle trie toujours par « meilleurs », coupe à `regles.nombreARetenir`, et écrit `{ artefactsRetenus, dateSelection, auto: true }` **sans `modalite`**.
- **La bonne source existe** : `calculerDetailsNoteFinale(da)` (`js/profil-etudiant-actions.js:369`) rend, pour une Standards, `portfolio.{ nombreARetenir, nombreEvalues, nombreRetenus, minimumRequis, methodeSelection, moyenne, artefactsRetenus[{ productionId, note, niveau }] }` (≈ l. 617-640), et `null` hors Standards.
- **Ce qui rend le lot sans risque pour les notes, à confirmer par toi** : Cowork ne trouve **aucune lecture** de `portfoliosEleves` dans le calcul de la note (`grep -n "portfoliosEleves" js/profil-etudiant-actions.js js/pratiques/*.js` → 0). La sélection écrite au rendu ne servirait donc qu'à l'affichage (les coches « retenu »).

## 2 · Ce que fait le lot

**2a. Le panneau lit `calculerDetailsNoteFinale(da)`, et rien d'autre, pour ce qu'il dit de la note** : combien d'évaluations sont retenues, lesquelles, sur combien, par quelle méthode, et leur moyenne. Plus de `portfolio.regles.nombreARetenir`, plus de `indicesCP.details`. `_lireDetailsRapportPerformance` perd sa branche morte ; si elle n'a plus d'objet, elle part (zéro-dette : pas de repli « au cas où »).

**2b. Le panneau n'écrit rien.** `_appliquerSelectionAutoArtefacts` quitte le chemin du rendu. Plus de `db.setSync`, plus de `calculerEtStockerIndicesCP()` quand on affiche un profil. Les coches « retenu » viennent de `artefactsRetenus` de `calculerDetailsNoteFinale`. **Rien n'est effacé** des `portfoliosEleves` déjà écrits (limite de Grégoire du 20 sept.) : on cesse d'écrire, on ne nettoie pas.

**2c. Hors Standards** (`calculerDetailsNoteFinale` rend `null`) : le panneau ne dit **aucune** phrase sur des évaluations « retenues » et n'affiche pas « Calcul impossible ». Il garde ce qu'il sait vraiment (critères, forces et défis, gestes cognitifs). **Décidé par Cowork (technique)**.

**2d. Les mots.** Là où une phrase change à l'écran, reprends la forme du profil (carte de la note, `_phraseEvaluationsEcartees`, #883 : « 1 retenue sur 4 possibles »), pour que le panneau et la carte disent la même chose. Si un mot neuf est inévitable, propose-le dans le rapport : Grégoire le lira à la porte.

## 3 · L'arrêt prévu – une seule condition

Avant de coder, **mesure** si quelque chose lit `portfoliosEleves` pour calculer une note, un indice ou un export (pas seulement pour afficher des coches). Sers-toi de `reserve.js`, `registre-longitudinal.js`, `trimestres.js` et `portfolio.js`, en plus du calcul.
- **Si rien ne le lit pour calculer** : continue. Dis-le dans le rapport, commande à l'appui.
- **Si quelque chose le lit pour calculer** : **arrête-toi et dis-le.** Alors les sélections déjà écrites par le panneau (« meilleurs », coupées à 3, reconnaissables à l'absence de `modalite`) ont pu fausser une note chez Grégoire, et la suite lui revient.

## 4 · Trouvaille probable, à inscrire, pas à corriger

`chargerPortfolioEleveDetail` (`js/portfolio.js:143`) fait lui aussi une sélection automatique **et l'écrit au rendu** (≈ l. 265-280, avec `modalite`). Mesure si elle est encore appelée. Si oui : fiche au BACKLOG (issue 2 de `CLAUDE.md`, prochain numéro de la ligne « Dernier ID »), même défaut que #714, hors de ce lot.

## 5 · Tests

- Vitest sur le panneau rendu pour : une Standards « 4 meilleurs » (le panneau dit 4, pas 3) ; « récents » ; hybride par catégories ; une sommative (aucune phrase de retenue, pas de « Calcul impossible ») ; un élève sans évaluation.
- **Témoin d'écriture** : rendre le panneau ne change ni `portfoliosEleves` ni `indicesCP` (compare l'état du stockage avant et après). Garde de non-vide (règle 10).
- Sentinelle : aucun `db.setSync` ni `calculerEtStockerIndicesCP(` dans `genererSectionPerformance` et ce qu'elle appelle au rendu.
- Break-test sur chaque assertion (skill `verification-adverse`) ; suite complète verte avant le commit.

## 6 · Livraison

- Commits : le cochage des quatre fiches de 1.153.0 (sans release) ; le lot (code, tests) ; `BACKLOG.md` (#714 cochée, trouvaille du §4 si elle existe) et le déplacement de l'ancienne consigne.
- Version **patch** par `scripts/release.mjs` (skill `release-et-changelog`) : l'écran dit le vrai, sans geste neuf. Item de « Nouvelles » **proposé, à valider par Grégoire avant le push**.
- Commit → relecture de Cowork → corrections → verdict → push.

## 7 · Le geste que Grégoire vérifiera à l'écran

Il ouvre le profil d'un de ses élèves, section « Développement des habiletés » : le nombre d'évaluations retenues est celui de sa pratique, les évaluations cochées « retenues » sont celles de la carte de la note, et « Calcul impossible » n'apparaît plus sous une note calculée.
