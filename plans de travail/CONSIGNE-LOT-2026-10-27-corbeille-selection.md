# Consigne – Mettre à la corbeille toutes les copies sélectionnées

> Écrite par Cowork le mardi 27 octobre 2026 à 9 h 01 (Toronto, mesuré par `date`), sur `main` = `15c10b7e`, pendant que le lot 4b (`CONSIGNE-LOT-2026-10-27-critere-algorithmique-calculs-4b.md`) est en cours dans une autre session.
> **Source** : symptôme vécu par Grégoire le 27 oct. vers 8 h 40 (Chrome, capture vue par Cowork) : Liste des évaluations, production « Artefact 5 », 22 copies cochées. Il veut les mettre à la corbeille en un geste ; aujourd'hui, c'est « Actions… → Supprimer » ligne par ligne, 22 fois.
> **Décision de Grégoire le 27 oct. à 9 h 01** : toutes les copies cochées partent, **y compris celles déjà évaluées** (dans sa sélection, une copie non verrouillée notée 48,8 %).

## 0. Avant tout

- **Ce lot attend que le lot 4b soit fusionné sur `main`.** Une seule session écrit dans `js/` (les deux touchent `index.html`).
- Un seul lot à la fois, sur un `main` à jour, aucune suite qui tourne. Rituel de début de session.
- Un commit de docs seul, fichiers nommés : ce fichier et un item du BACKLOG (donne-lui un numéro). Il entre parce que Grégoire a vécu le symptôme.

## 1. Ce que Grégoire voit à l'écran

1. Dans la barre de sélection (`#eval-barre-selection`, `index.html` l. ~8271), à côté de « Réassigner la sélection (N) » : un bouton **« Mettre à la corbeille (N) »**. Son compte suit les cases cochées, comme celui de « Réassigner » (`mettreAJourSelectionEval`).
2. Un clic ouvre **une seule** fenêtre de confirmation :
   - titre : « Mettre N copies à la corbeille ? » (singulier pour une) ;
   - « Tu pourras les restaurer depuis la corbeille pendant 30 jours. » ;
   - s'il y en a : « K copies déjà évaluées : leur évaluation et leur note restent dans la liste, sans copie liée. », suivi de la liste de leurs noms (selon le mode d'anonymisation, comme `confirmerSuppressionFichier`) ;
   - s'il y en a : « R copies liées à une reprise. Mettre le fichier à la corbeille ne retire ni la reprise ni le statut « remplacée » de l'évaluation d'origine. » (même détection que `confirmerSuppressionFichier`, `liste-evaluations.js` l. ~2035-2050) ;
   - boutons : « Mettre N copies à la corbeille » (danger) et « Annuler ».
3. Après confirmation : notification « N copies mises à la corbeille. » ; la liste se redessine, le compteur « Corbeille (n) » monte de N, la sélection repart vide. Les lignes déjà évaluées restent, sans copie (leur menu offre alors « Supprimer l'évaluation », comme aujourd'hui).

Les mots ci-dessus sont des choix de Cowork (l'enseignant·e les lit, pas l'élève). Si l'interface existante les contredit, aligne-toi sur elle et dis-le.

## 2. Ce qui est décidé côté technique (par Cowork)

- **Le geste est exactement celui de « Supprimer » ligne par ligne, répété** : le fichier va à la corbeille (`dateSuppression`), son blob reste intact, aucune évaluation n'est touchée. Aucune suppression définitive dans ce lot (règle de Grégoire du 20 sept.).
- **Un seul chemin d'écriture** : `travauxStockage.deplacerEnCorbeilleLot(ids)` lit une fois et écrit une fois chacune des deux listes (`fichiersTravaux`, `corbeilleFichiers`), avec la même `dateSuppression` pour tout le lot, et rend le nombre de copies déplacées (un id absent est ignoré). `deplacerEnCorbeille(id)` devient un appel de `deplacerEnCorbeilleLot([id])` : pas deux chemins (zéro-dette).
- **Le récapitulatif est une fonction pure** (`composerRecapCorbeille`, sur le modèle de `composerRecapReassignation`, l. ~757) : copies à déplacer, copies évaluées, copies liées à une reprise. Le HTML passe par `echapperHtml` (règle 1).
- **Source ou stock** : nouveau geste, écrit seulement sur un clic de l'utilisateur. Aucun stock à réparer.
- Ce que je n'ai pas tranché par une mesure, mesure-le et dis-le : si une copie verrouillée se comporte autrement qu'une non verrouillée quand son fichier part (elle ne devrait pas : la note remise reste dans l'évaluation).

## 3. Pièges connus

1. **« Tout sélectionner » suit le filtre** : le N de la confirmation doit égaler celui de la barre, pas le nombre de lignes de la production.
2. **Après l'écriture** : `appliquerFiltres()`, `mettreAJourBoutonCorbeille()`, et la vue Archivage si elle est ouverte (comme `confirmerSuppressionFichier`, l. ~2083-2098).
3. **Le mode anonymisation** : aucun nom réel dans la fenêtre quand il est actif.
4. **iPad** : cibles tactiles de 44 px, la barre ne déborde pas à 820 px avec deux boutons. Skill `design-interface`.
5. Règles 1, 2 et 4 de `CLAUDE.md` (`echapperHtml`, `data-action`, aucun `console.log`) ; règle 6 : aucun nom d'élève réel dans les tests ni les captures.
6. Tout changement dans `js/` oblige à bumper le bloc de jetons d'`index.html`.

## 4. Preuve exigée

- **Vitest** : `composerRecapCorbeille` (aucune évaluée, une évaluée, une liée à une reprise, sélection vide) ; `deplacerEnCorbeilleLot` (N copies : une écriture par liste, N lignes dans la corbeille avec la même date, id absent ignoré, valeur rendue). Break-test sur chacune.
- **Playwright (WebKit)**, sur le modèle de `tests/integration/liste-934-reassigner-la-selection.spec.js` : trois copies cochées dont une évaluée ; confirmer ; la corbeille en compte trois, l'évaluation garde sa note ; « Restaurer » en ramène une. « Annuler » : stockage identique avant et après. Mode anonymisation : aucun nom réel dans la fenêtre. 1 440 et 820 px.
- **Captures** : la barre avec ses deux boutons et la fenêtre de confirmation (avec une copie évaluée), 1 440 et 820 px, clair et sombre.
- Portes terrain : skill `portes-terrain`, ses deux règles de tête d'abord.

## 5. Ce qui n'entre pas

Restaurer en lot depuis la corbeille (on restaure une copie à la fois, comme aujourd'hui ; n'entre que si Grégoire en vit le manque) ; supprimer des évaluations ; renommer l'option « Supprimer » du menu Actions ; toute suppression définitive.

## 6. Clôture

- Demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-27-corbeille-selection.md`.
- Pas de release, de verdict ni de push sans le signal de Grégoire.
