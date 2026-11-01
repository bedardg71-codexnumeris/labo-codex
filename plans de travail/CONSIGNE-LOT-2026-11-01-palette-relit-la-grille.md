# Consigne – La palette d'Annoter relit la grille quand elle change (1er novembre 2026)

> Écrite par Cowork le dimanche 1er novembre 2026 à 5 h 20 (Toronto, mesuré par `date`), sur `main` = `origin/main` = `0fd0427f` (1.229.0 en ligne, verdict vert).
> **Retour de Grégoire** (iPad, Safari 27.2, 1.229.0 ; rapport `Retours des testeurs/gregoire/BUG_"grégoire"_2026-11-01_21-51-22.txt`, du 31 oct. à 21 h 51, déposé par Cowork) : il a précisé le texte de quelques codes de sa grille algorithmique (des catégories grammaticales) ; dans Annoter, la palette des codes montrait encore l'ancien texte. Le 1er nov. à 5 h 16, après un rechargement de l'application, les modifications s'affichent : **elles étaient écrites**. Le champ touché (nom ou observation) n'est pas précisé : le correctif ne doit pas en dépendre.
> Le nom du fichier porte le 1er nov., le corps le 31 oct. : c'est #812 (date UTC dans le nom). Rien à faire ici.

## 0. Avant tout

- Aucune autre session ne tourne ; pas de `git stash`.
- **Commit de docs seul d'abord** : cette consigne et le rapport de bug. Le reste de l'arbre non commité (`CONSIGNE-DEMARRAGE-COWORK.md`, `REFLEXION-2026-10-30-…`, `captures/fenetre-de-fusion-*.png`) reste hors commit.
- Inscris le retour au `SUIVI-BUGS.md`, aux ouverts, au prochain numéro libre.

## 1. La cause, lue par Cowork dans le code (non mesurée : remesure-la, règle 1 du protocole)

- `js/travaux-outils.js`, `_poserGrilleCourante` (l. ~668) : la palette garde la grille de la copie dans `_grilleCourante`, posée **une seule fois**, à `travaux-fichier-ouvert` (`js/travaux-visionneuse.js`, l. 188 et 229), par `codesAnnotation.grilleDeCopie(fichier)`.
- Rien ne la relit ensuite : aucun écouteur de `grillesTemplates` dans `travaux-outils.js`, `travaux-visionneuse.js` ni `travaux-ui.js` (grep vide).
- Le parcours : une copie ouverte dans Annoter ; un détour par Conception › Grilles pour modifier le texte d'un code (`modifierSousCritere`, `js/grilles.js` l. ~5991, écrit par `modifierEtAnnoncer`) ; retour à Annoter. La copie n'a pas été rouverte, la palette montre la grille d'avant.
- Inconnu : `_grilleCourante` est-il une copie, ou le même objet que le cache de lecture ? Mesure-le et dis-le ; le correctif ne doit pas en dépendre.

## 2. Le correctif (décision technique de Cowork)

- **Bâtir sur l'existant** : l'événement `donnees-enregistrees` (`{ cle }`, `js/temoin-enregistrement.js` l. 147), émis à chaque écriture réussie de l'usager, déjà écouté par `codex.js`.
- Dans `travaux-outils.js` : quand `cle` est la clé effective de `grillesTemplates` (même résolution que `codesAnnotation`, mode démo compris) et qu'une copie est ouverte, relire sa grille (`grilleDeCopie` sur la copie ouverte) et la reposer par `_poserGrilleCourante` : outils, curseurs, palette, compteurs.
- Vérifie que les codes **déjà dessinés** sur la page suivent (couleur, numéro). S'il faut un rendu de page, fais-le.
- Aucune copie ouverte : rien.
- Ne doit pas changer : l'outil actif reste le même si son code existe toujours ; une annotation en cours n'est pas perdue.
- Source ou stock : affichage seulement, rien n'est écrit chez personne. **Pas de stock.** Écris-le au rapport.

## 3. Le test

- Playwright, projet `webkit` : copie de démo ouverte dans Annoter, détour par la grille de cette copie, un code renommé, retour à Annoter : la palette montre le nouveau nom, **sans recharger ni rouvrir la copie**.
- Contre-épreuve : sans l'écouteur, le test rougit (skill `verification-adverse`).
- Noms fictifs uniquement (règle 6 de `CLAUDE.md`).

## 4. À mesurer, sans corriger (inscrire est le défaut)

- **La même grappe ailleurs** : d'autres écrans qui gardent une grille lue une fois pendant qu'une copie reste ouverte. En premier, le formulaire d'Évaluer (`js/evaluation-retroaction.js` l. ~229, `listeCodes(grilleDef)` : d'où vient `grilleDef`, quand est-il relu ?). Si l'un d'eux casse **le même parcours** (ajuster la grille en pleine correction, puis revenir), dis-le en tête du rapport : Cowork décide s'il entre dans ce lot.
- Les écritures de `grillesTemplates` qui n'émettent pas `donnees-enregistrees` (fusion du codex, passage depuis la bibliothèque, autres ?) : liste-les, inscris, ne corrige pas.
- **Hors lot** : la pastille « Enregistré » que Grégoire n'a pas vue. Les données étaient écrites ; la cause n'est pas établie. Ne la cherche pas.

## 5. Fin du lot

- Commit sur `main`, rapport `plans de travail/RAPPORT-2026-11-01-palette-relit-la-grille.md`, à Cowork pour relecture. **Pas de push** : la mise en ligne suit la cadence du soir (verdict complet au signal de Grégoire).
- Le geste qu'il vérifiera après la mise en ligne, en une phrase au rapport : sur l'iPad, une copie ouverte dans Annoter, il modifie le texte d'un code dans la grille, revient, et la palette montre le nouveau texte sans recharger.
- `SUIVI-BUGS.md` : aux corrigés, « codé, pas en ligne ».
