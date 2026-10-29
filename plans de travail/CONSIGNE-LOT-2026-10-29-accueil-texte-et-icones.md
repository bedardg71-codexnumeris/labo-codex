# Consigne – Commiter le texte de l'accueil et les deux icônes

> Écrite par Cowork le jeudi 29 octobre 2026 à 5 h 54 (Toronto, mesuré par `date`), sur `main` = `69d07150`. Demande de Grégoire, 29 oct. à 5 h 53 : « Je voudrais qu'on commit le travail dans l'accueil ainsi que les deux icônes. » Ce fichier ne remplace aucune autre consigne : n'y touche pas.

## 0. Avant tout

- Rituel de début de session ; aucune suite qui tourne.
- **Les mots de l'accueil sont ceux de Grégoire** (texte remplacé en entier le 28 oct. au soir, verdict « Tout remplacer ») : ils ne bougent pas. Un mot qui se révèle faux à la mesure : arrête-toi et dis-le.

## 1. Ce qui entre, mesuré par Cowork

Dans l'arbre de travail, hors des commits : `js/accueil.js`, `styles.css`, `tests/unit/sentinelle-accueil-porte-ortho-et-champ2-846.test.js` (modifiés) ; `icons/icons8-circle-80.png`, `icons/icons8-inactive-state-80.png` (non suivies).

- Le bandeau « Bienvenue » perd « Par où commencer ? », ses trois étapes et la ligne de l'orthopédagogue : les trois portes, en ligne depuis la 1.223 (`d5aef7d3`), les portent.
- **L'Aide reste vraie** : « Tu es orthopédagogue ? » est toujours sur la porte du milieu (`js/accueil.js:83, 181`), ce que dit l'entrée `rencontres` du lot 4.
- `.banniere-bienvenue-etapes`, retirée de `styles.css`, n'est employée nulle part ailleurs (`js/`, `index.html`, `styles.css` : 0).
- **Les deux icônes ne sont employées par aucun fichier de l'application** (`js/`, `styles.css`, `index.html` : 0). Grégoire les veut au dépôt : elles entrent telles quelles.

## 2. Le mandat

1. **Les jetons** : `accueil.js` et `styles.css` portent `?v=20261028a`, déjà en ligne avec les portes : passe-les au jeton du jour dans le bloc d'`index.html`, avec leur commentaire (le texte de l'accueil, 28 oct. au soir).
2. **Le commentaire de `js/main.js:1110`** cite « Par où commencer ? », qui part : remplace-le par « les trois portes de l'accueil » ; rien d'autre dans ce fichier. (Décision de Cowork : le lot retire ce qu'il cite, il n'est pas fini sans ça.)
3. **La sentinelle #846** : un break-test (une phrase de Grégoire mutée dans `js/accueil.js` → rouge), arbre restauré par sha256. Vitest depuis `tests/`. Pas de Playwright : le verdict du soir le couvre.

## 3. Les commits

1. `feat(accueil)` : le texte de Grégoire, les jetons, le commentaire de `main.js`, la sentinelle.
2. Les deux icônes, seules, le message disant qu'aucun écran ne les emploie encore.
3. Les docs : ce fichier et `VERDICT-RELECTURE-2026-10-29-aide-lot-4.md` (Cowork y a ajouté la relecture de la retouche : le lot 4 est clos).

Demande de relecture courte : `plans de travail/DEMANDE-RELECTURE-2026-10-29-accueil-texte-et-icones.md`. L'entrée du changelog s'écrit à la release du soir. Pas de release, de verdict ni de push sans le signal de Grégoire.
