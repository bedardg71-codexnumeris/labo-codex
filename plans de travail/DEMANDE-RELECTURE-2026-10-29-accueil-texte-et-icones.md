# Demande de relecture – Le texte de l'accueil et les deux icônes

> Claude Code, jeudi 29 octobre 2026, vers 6 h. Consigne : `CONSIGNE-LOT-2026-10-29-accueil-texte-et-icones.md`.

## Ce qui a été fait

- **Le texte de Grégoire** (`js/accueil.js`, `styles.css`, sentinelle #846) entre tel qu'il était dans l'arbre : aucun mot n'a été touché. « Tu es orthopédagogue ? » reste sur la porte du milieu (`js/accueil.js:83, 181`).
- **`js/main.js:1110`** : le commentaire cite « les trois portes de l'accueil » au lieu de « Par où commencer ? ». C'est la seule ligne modifiée du fichier.
- **Break-test** : la mutation « sobre en carbone ! » → « sobre en carbone. » dans `js/accueil.js` donne 2 rouges (B3). Après restauration, l'empreinte sha256 est identique (`b40bf465…`). C'est le cas E1 du 28 au soir, rejoué. La sentinelle le consigne en une ligne.
- **Les deux icônes** entrent seules, telles quelles. Aucun écran ne les emploie.

## Un écart à la consigne : les jetons

La consigne demandait le **jeton du jour** (`20261029a`). Deux gardes l'ont refusé :

- la sentinelle `sentinelle-anticache-fichiers-modifies` exige un `?v=` daté du **jour du build** (`version.json` : `1028-1724`) ;
- le hook pre-commit (#547) exige aussi que `js/main.js`, modifié, change d'URL.

Résultat : `styles.css`, `js/accueil.js` et `js/main.js` sont à **`?v=20261028b`**. Aucun de ces fichiers n'avait jamais été servi avec cette lettre (vérifié dans l'historique de `index.html`). `version.json` n'est pas touché, et aucun `--build-only` n'a été lancé. Le jeton de `main.js` est un ajout hors de la lettre de la consigne : sans lui, le commit est refusé.

## Mesures

- Vitest depuis `tests/` : **846/846 fichiers, 10 222/10 222 essais verts.**
- Playwright : non lancé (consigne : le verdict du soir le couvre).
- Rien de poussé. Pas de release.

## À relire

1. Le jeton `b` plutôt que `20261029a` : il tient jusqu'à la release du soir, qui rebâtira le build.
2. Le commentaire ajouté aux trois jetons dans `index.html`.
