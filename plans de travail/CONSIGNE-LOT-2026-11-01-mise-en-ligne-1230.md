# Consigne – Mettre en ligne la 1.230 : des palettes compactes pour annoter et évaluer (1er novembre 2026)

> Écrite par Cowork le dimanche 1er novembre 2026 à 19 h 27 (Toronto, mesuré par `date`), sur `main` = `a29bd19f`, mise à jour à 20 h 33 sur `main` = `7a6aa5b1` (le correctif des tampons compris). **Au signal de Grégoire, le soir, quand sa journée est finie : le coller est son signal** (cadence du 11 oct.). Le texte du § 1 est **validé par Grégoire** (points 1 à 5 à 19 h 32, point 6 à 20 h 36), mot pour mot.
> Relectures, toutes **acceptées** : `VERDICT-RELECTURE-2026-11-01-palette-relit-la-grille.md`, `-palette-evaluation-un-defilement.md`, `-evaluer-relit-la-grille.md`, `-barre-outils-et-codes-compacts.md`, `-palette-evaluation-compacte.md`, `-palette-retroaction-compacte.md`, `-tampons-masques-et-bibliotheque.md` (#1216).

## 0. Avant tout

- Aucune autre session ne tourne ; `main` à jour ; pas de `git stash`. Les fichiers non commités d'autres chantiers restent hors des commits : mets-les de côté le temps du verdict s'il le faut, sans les supprimer, puis remets-les.
- **Commit de docs seul d'abord** : ce fichier, `VERDICT-RELECTURE-2026-11-01-palette-retroaction-compacte.md` et `VERDICT-RELECTURE-2026-11-01-tampons-masques-et-bibliotheque.md`.
- Le rituel `/fin-de-session`, dont `OU-EN-EST-ON.md`.

## 0 bis. Une retouche d'une ligne (décision de Cowork, verdict de la Rétroaction)

Dans `mettreAJourResumeOptionsRetroaction` (`js/evaluation-retroaction.js`), quand il manque plusieurs cases, « ni » se pose devant le dernier nom : « sans objectif ni contexte », « sans objectif, tâche ni contexte ». Une seule case : « sans objectif ». « Rien d'inclus » et « tout inclus » ne changent pas. Un essai couvre deux et trois cases décochées. Commit à part, avant la release.

## 0 ter. `RELAIS.md` (trouvaille 3 du lot de la palette Évaluation)

Mets-le à jour : les commits du 1er nov., et les trois branches `lot/` ouvertes. `lot/verification-plus-rapide` puis `lot/pauses-apres-ouverture` : faites et relues, à fusionner dans cet ordre au prochain lot, après cette mise en ligne. `lot/pauses-les-plus-lourdes` : interrompue par le redémarrage du midi, rien de commité, ses specs modifiées attendent dans `.claude/worktrees/pauses-les-plus-lourdes` ; elle reprend après les deux fusions.

## 1. Les Nouvelles : une entrée, 1.230

Texte validé par Grégoire le 1er nov. (points 1 à 5 à 19 h 32, point 6 à 20 h 36), mot pour mot. Insécables en `&nbsp;`, apostrophes typographiques, comme les entrées voisines ; note la validation dans le commentaire de l'entrée. Couleur : `vert` (des versions compactes, au choix).

- Titre : « Annoter et évaluer sur l'iPad : des palettes compactes, plus de place pour la copie »
1. « Annoter : la barre d'outils est plus compacte. Le carrousel montre plus de noms, et l'état de chaque copie s'y lit en symbole. »
2. « Les palettes Codes et Évaluation ont une version compacte, au choix : un bouton aux quatre carrés la bascule, et les descriptions restent l'affichage par défaut. En compacte, chaque critère tient sur une ligne ; toucher son nom montre sa description. »
3. « La palette Rétroaction laisse plus de place au texte : Générale, Spécifique et Bilan sur une seule bande, les options repliées sous une ligne qui les résume, « Copier tout » en bas. »
4. « Hors plein écran, la page ne défile plus sous les palettes, et chaque palette d'Évaluer n'a qu'une barre de défilement. »
5. « Quand tu modifies ta grille pendant qu'une copie est ouverte, la palette Codes montre le nouveau texte dès ton retour. Dans Évaluer, ta saisie reste et la note suit la nouvelle pondération ; une copie verrouillée garde sa note remise. »
6. « Tampons : tes noms et tes images ne reviennent plus au défaut après un rechargement, et les tampons que tu retires restent retirés. « Garder dans ma bibliothèque » garde l'image de ton tampon, SVG compris. »

Si un mot se révèle faux à la mesure, **ne le change pas** : arrête-toi et dis-le.

## 2. La version

`node scripts/release.mjs minor` (1.230.0), skill `release-et-changelog`. Les jetons `?v=` suivent.

## 3. La vérification complète, sur le commit de release

`node scripts/verdict-en-morceaux.mjs` (skill `fin-de-session`, § 4.5). **Avant de lancer**, dis à Grégoire : « ferme Cowork, Chrome et Safari sur le Mac, je lance la vérification » ; Mac sur secteur (vérifie-le), sans veille.

- **Vert** : `git push`.
- **Rouge** : ne pousse pas ; nomme le lot fautif par ses commits ; le rapport va à Cowork.

## 4. Après le push

Les gestes à vérifier, à dire à Grégoire tels quels :

1. Sur l'iPad (rechargé jusqu'à 1.230.0) : la porte terrain des trois palettes compactes, que Cowork publie (une seule page, réunissant `PORTES-TERRAIN-2026-11-01-barre-outils-et-codes-compacts.md`, `-palette-evaluation-compacte.md` et `-palette-retroaction-compacte.md`).
2. Les tampons (`PORTES-TERRAIN-2026-11-01-tampons-masques-et-bibliotheque.md`, sur la même page) : retirer de nouveau ses tampons par défaut ; retaper ses noms s'ils sont revenus au défaut ; une entrée de la bibliothèque au mauvais nom ou à la mauvaise image : « Supprimer de ma bibliothèque », puis « Garder ».
