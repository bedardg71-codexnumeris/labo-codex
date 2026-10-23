# Consigne du jour – le critère algorithmique, étape 2b : la palette (jeudi 22 octobre 2026)

> Écrite par Cowork le jeudi 22 octobre 2026 à 20 h 51 (Toronto, mesuré par `date`), sur `main` à `6cac9b1d`, version **1.215.0** en ligne. Elle remplace l'état neutre de 20 h 26. Source : l'étape 2 de `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md` (« Devient : une palette unique… ») ; le souhait de Grégoire du 21 oct. (une palette latérale de blocs décrits, qu'on insère dans un champ libre, sur le modèle d'« Apporter mon matériel ») ; l'étape 2a, en ligne. **Feu vert de Grégoire à 20 h 49.** Aucune décision ne lui revient dans ce lot : tout ce qui suit est tranché par Cowork.

## 1. Ce qui existe (cartographié par Cowork, à remesurer)

- Au-dessus de chaque zone d'écriture du gabarit d'un critère algorithmique, une rangée « Poser : » de pastilles qui portent un **nom de code** sans accolades (`erreurs`, `nomMots`…) : `rendreBoutonsReperes` et `rendreChampEnonceAlgo` (`grilles.js`), pour les quatre énoncés (`enoncesAlgo.reperesDeCle`) et pour les deux zones de chaque palier (`projectionAlgo.listerReperes`).
- La pose au curseur : `insererRepereEnonce` (`grilles.js`), `enoncesAlgo.insererRepere`, la vue `composeur-badges.js` et ses chips, `pointerdown` annulé pour garder le curseur, `data-curseur-vu`.
- Le modèle à suivre : la palette de la dissection (`materiel-dissection-lecture.js`, étiquettes `nom` / `aide` / `precision` / `groupe` ; `styles.css`, `.dissection-atelier` et `.dissection-palette` : colonne collante, défilement propre, requêtes de conteneur qui la rétrécissent puis la passent au-dessus).

## 2. Ce que le lot fait (tranché par Cowork)

1. **Une seule palette par critère algorithmique**, collante, sur le côté de son gabarit, comme celle de la dissection ; au-dessus quand la largeur manque. Elle sert **toutes** les zones d'écriture du critère : les quatre énoncés et les deux zones de chaque palier. **Les rangées « Poser : » partent partout** (zéro dette : rien ne reste à côté).
2. **Deux groupes**, dont les titres remplacent le paragraphe qui expliquait les deux couleurs : « Ce que tu écris dans la grille » (famille `posee`), « Ce qui se remplit à la correction » (famille `remplie`). Les deux couleurs restent.
3. **Chaque bloc est nommé en mots et décrit** (nom, aide, et une précision là où elle aide), jamais par son nom de code. Les blocs qui parlent de ce qu'on compte portent **les noms du critère** (`enoncesAlgo.noms`), échappés. ⚠ L'élision : jamais « de » devant un nom de l'enseignant ; « des » ne s'élide jamais (« Compte des unités manquantes », « Compte des calculs »). Les blocs propres aux paliers (service, erreurs tolérées, longueur de référence, mots par erreur, erreurs projetées, palier atteint) **gardent leurs libellés** : l'étape 3 les reprend. `{erreurs}` et `{mots}`, partagés, prennent les noms du critère partout.
4. **La cible** : la zone où est le curseur, sinon la dernière visitée depuis le rendu. La palette nomme sa cible (« Dans : « Défi prioritaire » », par ex.). Sans zone visitée, ses blocs ne posent rien et une ligne invite à placer le curseur dans un texte. Un bloc que la zone cible n'offre pas (`reperesDeCle`, `listerReperes`) est **inactif et le dit** ; la règle du 3 sept. ne change pas : une zone n'offre que ce qu'un appel remplit.
5. **Le curseur survit** au toucher d'un bloc, sur le Mac comme sur l'iPad, palette loin de la zone comprise ; le mécanisme d'aujourd'hui (`pointerdown` annulé, pas de re-rendu à la pose) se garde.
6. **Les chips de la phrase** (`composeur-badges.js`) montrent le nom du bloc en mots, pas le nom de code ; la croix reste.
7. **Ce que ça ne touche pas** : les jetons enregistrés (`{erreurs}`, `{nomMots}`…, le format que le moteur lit), le texte des énoncés et des paliers déjà écrits, ce que lit l'élève. **Rien n'est écrit dans le stock.**

## 3. Les textes

Les noms, aides et précisions des blocs, les titres de groupes, la ligne d'invitation et la mention d'un bloc inactif sont des textes de l'enseignant : provisoires de toi, réunis dans `plans de travail/TEXTES-2026-10-22-palette-critere-algorithmique.md`, avec leur site. Cowork les tranche à la relecture. Aucun exemple propre à une discipline (principe de Grégoire du 21 oct.).

## 4. Les tests

- **Sentinelle** : chaque zone n'offre, actifs, que les blocs de `reperesDeCle` ou de `listerReperes` ; plus aucune rangée « Poser : » dans le gabarit.
- **Le garde-fou du plan** : un critère de rédaction (« erreur / mot ») et un critère de chimie (« unité manquante / calcul ») ; aucun « erreur » ni « mot » dans la palette du second.
- **Un nom piégé** (`<img src=x onerror=…>`) reste du texte dans la palette et dans les chips.
- **L'invariant du stock** : un critère d'avant ce lot rend, à l'élève, les mêmes phrases ; rien n'est écrit au rendu.
- **WebKit** : poser un bloc dans un énoncé et dans un palier, la palette loin de la zone ; le curseur reste après le bloc ; à une largeur d'iPad portrait, la palette passe où la règle le dit et reste utilisable au doigt (44 px).
- Break-tests nommés dans la demande. Vitest depuis `tests/`, puis les specs WebKit du critère algorithmique et du texte troué. **Ni verdict complet ni release** : au signal de Grégoire.
- **Captures** dans `plans de travail/captures-2026-10-22-palette-critere-algorithmique/` : le gabarit d'un critère de rédaction avec projection, et d'un critère de chimie sans noms, à la largeur du Mac et à celle de l'iPad portrait, Chrome et WebKit. Cowork les regarde avant Grégoire.

## 5. Clôture

- Commit sur `main`, non poussé, fichiers nommés un par un ; demande de relecture `DEMANDE-RELECTURE-2026-10-22-critere-algorithmique-palette.md`.
- Le tableau du plan, ligne 2 : « 2b codé, en relecture ».
- Toute trouvaille hors du lot : les trois issues de `CLAUDE.md`, « inscrire et continuer » par défaut.
- L'item des Nouvelles proposé dans ton rapport, pas écrit.
- Termine par **le geste à vérifier à l'écran**, en une phrase d'utilisateur.
