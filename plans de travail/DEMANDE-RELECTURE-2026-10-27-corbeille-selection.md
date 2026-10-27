# Demande de relecture – Mettre à la corbeille toutes les copies sélectionnées (#1174)

> Claude Code, mardi 27 octobre 2026, sur `main` : `28009e4d` (docs du § 0, item #1174), puis le commit du lot. Rien de poussé. Consigne : `CONSIGNE-LOT-2026-10-27-corbeille-selection.md`. Le lot 4b était commité sur `main` (`174806a8`) au départ ; aucune autre session n'écrivait dans `js/` (aucun worktree). Vitest 9 895 / 9 895 ; Playwright WebKit : la spec du lot (4 tests et les captures), plus #934 et #606, 8 verts. Le verdict complet de la suite n'est pas pris (au signal de Grégoire, avec le push).

## 1. Ce qui a été fait

- **Un seul chemin d'écriture** (`js/travaux-stockage.js`). `deplacerEnCorbeilleLot(ids)` lit puis écrit une seule fois chacune des deux listes (`corbeilleFichiers` d'abord, `fichiersTravaux` ensuite, l'ordre d'avant). Tout le lot porte la même `dateSuppression`. Un id absent est ignoré et la fonction rend le nombre de copies déplacées. Si rien n'est à déplacer, elle n'écrit rien. `deplacerEnCorbeille(id)` se réduit à `deplacerEnCorbeilleLot([id]) > 0` ; ses six appelants restent inchangés et reçoivent toujours un booléen.
- **Le bouton** « Mettre à la corbeille (N) » (`index.html`, barre `#eval-barre-selection`, `btn-danger btn-petit`) s'insère entre « Réassigner » et « Tout décocher ». `mettreAJourSelectionEval` tient son compte à jour, comme celui de « Réassigner ».
- **La question** (`mettreSelectionALaCorbeille`, `js/liste-evaluations.js`) reprend les mots de la consigne : le titre (au singulier, « une copie »), la phrase des 30 jours, le bloc des copies déjà évaluées avec leurs noms, le bloc des reprises avec leurs noms, puis les boutons « Mettre N copies à la corbeille » (danger) et « Annuler ». Après l'écriture vient la notification « N copies mises à la corbeille. », puis `_rafraichirApresCorbeille` : la liste, la vue Archivage si elle est ouverte, le compteur « Corbeille (n) ». Le rendu de la liste remet la sélection à zéro (#934).
- **Le récapitulatif est pur** : `composerRecapCorbeille(ids, { fichiers, evaluations, etudiants })` rend `aDeplacer`, `evaluees` et `reprises`. Son HTML (`genererRecapCorbeilleHTML`) échappe chaque nom.
- **Deux règles mises en commun, pas recopiées.** La détection « lié à une reprise » devient `_travailLieAUneReprise`, lue par la suppression d'une copie et par celle de la sélection. Le rafraîchissement d'après corbeille devient `_rafraichirApresCorbeille`, lu par les deux aussi. L'évaluation d'une copie se trouve par `evaluationId`, sinon par `estDuCoupleDuFichier` (le prédicat unique de #560) sur une évaluation non remplacée.

## 2. Ce que la mesure a dit

1. **Copie verrouillée** (§ 2 de la consigne) : elle se comporte comme une copie non verrouillée. Dans le banc, Léa (70 %, verrouillée) et Camille (48,8 %, non verrouillée) gardent leur note et leur verrou une fois leur fichier parti. Les évaluations sont identiques octet pour octet avant et après le geste.
2. **Cibles tactiles** : à la souris, les trois boutons de la barre mesurent 28 px. Au doigt (WebKit avec `hasTouch` et `isMobile`, où `pointer: coarse` est vrai), ils mesurent 44 px grâce à la règle globale T-A10 (`.btn`, `styles.css`). J'avais d'abord ajouté une règle propre à la barre ; le break-test l'a montrée redondante (le banc restait vert sans elle), je l'ai donc retirée. `styles.css` n'est pas touché.
3. **La barre à 820 px** ne déborde pas, avec ses trois boutons. Le compte « 3 copies sélectionnées » passe sur deux lignes (capture `barre-820-*`).

## 3. Les suppositions que j'ai faites seul

- **« Déjà évaluée »** désigne une évaluation liée qui porte au moins un critère, ce que la liste appelle `evaluationNotee`. Une évaluation qui ne porte qu'un jeton de délai, sans critère, ne compte pas.
- **Les noms** viennent de `obtenirDonneesSelonMode('groupeEtudiants')`, comme dans `confirmerSuppressionFichier`. En anonymisation, ce sont donc les noms « Élève N ». Pour une copie dont l'élève est introuvable, j'affiche « Copie sans élève » et non le DA, alors que la suppression d'une copie unique affiche le DA. Je l'ai fait pour qu'aucun DA réel ne paraisse en anonymisation.
- **Les styles du récapitulatif** reprennent les classes `reassigner-recap*` de #934 (bloc, liste) : aucune règle CSS neuve. Le bloc des reprises prend la teinte d'attention (`reassigner-recap-conflit`).
- **L'ordre des noms** suit celui des lignes cochées, donc le tri affiché.

## 4. Preuves

- **Vitest**, `tests/unit/sentinelle-1174-corbeille-selection.test.js`, 12 tests. Pour `composerRecapCorbeille` : sélection vide, aucune copie évaluée, une copie évaluée, un jeton seul, une reprise et un doublon réconcilié, un id absent ou répété, aucun DA en repli, un nom échappé. Pour `deplacerEnCorbeilleLot` : une écriture par liste, la même date, un id absent ignoré, rien d'écrit à vide, et le chemin unique.
- **Break-test, huit défenses cassées une à une, huit rouges** : évaluée jamais vue, reprise jamais vue, DA en repli, nom non échappé, une écriture par copie, une date par copie, le compte des ids voulus, l'écriture à vide.
- **Deux rouges de ma propre première version**, relevés par l'audit de début de session et corrigés : un prédicat du couple écrit en dur (#560) et une découpe par `indexOf` (#858), qui passe maintenant par `tranche()`.
- **Playwright WebKit**, `tests/integration/liste-1174-corbeille-selection.spec.js`. Trois copies cochées, dont deux évaluées : « Annuler » laisse le stockage identique ; la confirmation donne une corbeille de 3, une seule date, des notes intactes, « Corbeille (3) » et une barre repliée ; « Restaurer » ramène une copie. Les autres tests couvrent l'anonymisation (aucun des six noms réels, aucun DA), la barre à 1 440 px, et la barre à 820 px au doigt, avec 44 px par bouton.
- **Captures** (`CAPTURES_1174=<dossier>`) : la barre et la fenêtre, à 1 440 et 820 px, en clair et en sombre.

## 5. Trouvailles hors lot

Aucune.

## 6. Portes terrain

**Aucune.** Première règle de tête : une machine répond. WebKit au doigt couvre l'iPad, et le geste n'est que du DOM et du stockage, sans rien de propre à Chrome. Deuxième règle : le geste est réversible pendant 30 jours, donc aucun préalable n'est dû. Le premier vrai usage de Grégoire, ses 22 copies d'« Artefact 5 », fait office de vérification.

## 7. Source ou stock

Il s'agit d'un geste neuf, qui n'écrit que sur un clic. Il n'y a aucun stock à réparer.
