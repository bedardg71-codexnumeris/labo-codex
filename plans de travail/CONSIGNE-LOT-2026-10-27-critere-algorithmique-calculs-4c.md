# Consigne – Les calculs, lot 4c : un calcul pour tes phrases et tes tables (étape 4 du plan du 21 oct., dernier lot)

> Écrite par Cowork le mardi 27 octobre 2026 à 09 h 41 (Toronto, mesuré par `date`), sur `main` = `0053ce5d` (lot 4b accepté : `VERDICT-RELECTURE-2026-10-27-calculs-4b.md` ; #1174 de l'autre instance par-dessus ; rien de poussé). Plan : `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md`, étape 4. Ébauche validée par Grégoire le 26 oct. à 21 h 10 : `EBAUCHE-2026-10-26-calculs.html`.
> **L'ébauche fait foi pour ce que l'enseignant·e voit.** Relis dans son script `composeur` (« Ce calcul sert »), `persoPhrases`, `blocs` et `ordreBlocs` (le bloc d'un calcul), `offreZone` (où il s'offre), `libelleSelon`, `casParDefaut` et `valeurSelon` (le menu « Selon »), `calculer` et `valeurs` (sa valeur sur la copie), `calculLu` et `retirerCalcul`, `infoEtape` (l'étape `note`), et la liste « Tes calculs pour les phrases et les tables » du rendu de l'étape `note`.
> Ce lot clôt l'étape 4 : un calcul composé peut servir à la note (4b) **ou** aux phrases et aux tables. Il ne touche pas le calcul d'une note.

## 0. Avant tout

- Un seul lot à la fois, sur un `main` à jour, aucune suite qui tourne. Les documents non commités de Cowork ne sont pas un obstacle.
- Rituel de début de session.
- **D'abord les deux retouches du verdict de 4b** (`VERDICT-RELECTURE-2026-10-27-calculs-4b.md`, « Les retouches ») : la réparation de #1142 passe le compte brut ; les copies de référence d'un calcul dont la note ne baisse pas quand le compte monte. Un commit pour elles, avec ce verdict et ce fichier ; puis le lot.

## 1. Les principes

1. **Une note ne bouge pas.** Un calcul qui sert aux phrases n'entre jamais dans la note. Le banc d'équivalence de 4a et celui de « Retoucher » (4b) restent verts.
2. **Rien ne change sans geste.** Un critère sans calcul pour les phrases écrit exactement les phrases d'aujourd'hui : le relevé du lot 3a reste vert à l'octet.
3. **Une seule source** : la valeur d'un calcul pour les phrases sort de l'évaluateur de 4a, à l'écran comme à l'évaluation ; ni `eval`, ni `new Function`.
4. **Aucune discipline dans `js/`** ; banc dans les deux disciplines fictives. Les mots d'écran : ceux de l'ébauche ; présent pour ce que le critère fait, conditionnel pour la copie fictive ; « étudiant·e ».

## 2. Ce que l'enseignant·e voit, en gestes (l'ébauche fait foi)

- **Dans le composeur, « Ce calcul sert »** : « à la note du critère » ou « à tes phrases et à tes tables ». Pour les phrases, la zone dit « [Nom du calcul] = » (« Ton calcul = » tant qu'il n'a pas de nom) ; la ligne sur la copie fictive dit sa valeur, sans borne ; « Quand une donnée de la copie vaut 0 » offre « Calculer normalement », « Sans valeur », « La valeur 0 » (jamais « Calculer normalement » pour une donnée par laquelle on divise ; jamais « La note entière »).
- **Garder** un calcul pour les phrases : « Calcul « X » gardé : il est dans la palette et dans le menu « Selon ». » Il ne change pas la note.
- **« Tes calculs pour les phrases et les tables »**, sous le composeur : pour chacun, son nom, ses pastilles, « Sur la copie fictive, il vaudrait N. Il est dans la palette et dans le menu « Selon » des tables. » (« sans valeur » quand il n'en a pas), « Modifier » et « Retirer ».
- **La palette** : un bloc par calcul pour les phrases, dans « Ce qui se remplit quand tu évalues la copie », sous son nom, avec l'aide « Ton calcul : sa valeur sur la copie évaluée. » et sa valeur sur la copie fictive après la flèche. Il s'offre dans la phrase du décompte, dans les deux zones de chaque palier et dans le texte de chaque cas d'une table ; pas dans les phrases du bilan (`offreZone`).
- **Le menu « Selon »** d'une table : « Ton calcul « X » » s'ajoute aux valeurs ; ses cas de départ : « Sans valeur », une borne à 1, « Au-delà » (`casParDefaut`).
- **La chaîne d'étapes** : le résumé de « Note calculée » ajoute « · 2 calculs pour tes phrases » quand il y en a (`infoEtape`).

## 3. Décidé par Cowork (si la mesure le contredit, dis-le plutôt que de le suivre)

1. **La donnée** : `sert: 'phrases'` dans `critere.calculs`, à côté des calculs pour la note ; même identifiants, même compteur, mêmes bornes (10 calculs en tout par critère). L'import et le partage acceptent désormais `'phrases'`.
2. **Le jeton d'un calcul dans un texte : `{<id>}`** (par exemple `{calc3}`). Un jeton de calcul que l'appel ne remplit pas (calcul sans valeur, retiré, ou introuvable après un import) est **retiré du texte avec l'espace qui le précède**, comme tout jeton vide (`enoncesAlgo.rendre`) : jamais « {calc3} » sur le PDF d'un·e étudiant·e. Les jetons d'aujourd'hui ne changent pas.
3. **La valeur** : l'évaluateur de 4a, avec les données de la copie (pondération, compte, compte pondéré, étendue) ; **aucune borne** ; formatée par `formaterNombre` (virgule, deux décimales au plus). Ses choix « vaut 0 » : `'calcul'`, `'aucune'` (sans valeur), `'zero'` (la valeur 0) ; au départ, « Sans valeur » pour une donnée qui divise, « Calculer normalement » sinon.
4. **Les tables** : `selon` peut valoir l'identifiant d'un calcul pour les phrases du même critère ; ses cas se choisissent comme ceux d'une valeur chiffrée (`casChoisi`). À l'import, une table qui lit un calcul introuvable est écartée avec lui, jamais devinée ; au partage, la structure est refusée.
5. **Retirer, changer « Ce calcul sert »** : refusé tant qu'une table ou un texte du critère lit le calcul : « Une table ou un texte lit ce calcul : retire-l'en d'abord. » (`calculLu` : les quatre énoncés, les paliers, les cas des tables, les `selon`). Le calcul qui donne la note ne passe pas aux phrases : « Ce calcul donne la note : choisis d'abord un autre calcul. » (la règle de 4b).
6. **À l'évaluation**, les valeurs des calculs pour les phrases se calculent avec la note, et la phrase enregistrée (`donneesAlgorithmiques[c].retroaction`) les porte : le PDF lit la base et n'a rien à recalculer. Mesure les trois chemins de la phrase (le décompte, les paliers, les tables : `evaluation-calcul.js` l. ~207 et ~752, `tablesCasAlgo.ajouterALaPhrase`) et le mode Catégories.

## 4. Le transport

`calculs` voyage déjà (4b) ; ce lot élargit `sert`, et `tablesCas.selon` aux identifiants de calcul. Mesure l'ordre de l'import (les calculs assainis avant les tables qui les lisent) et l'aller-retour export → import, partage → réception, avec un texte et une table qui lisent un calcul.

## 5. Où

`js/composeur-calcul.js` ; `js/evaluation-formules.js` (la valeur d'un calcul pour les phrases) ; `js/palette-algo.js` (le bloc, les zones) ; `js/tables-cas-algo.js` (`SELONS`, `assainir`, `valeurs`) ; `js/evaluation-enonces.js` (`rendre` et ses jetons) ; `js/evaluation-projection.js` (les paliers) ; `js/evaluation-calcul.js` (les valeurs à l'évaluation) ; `js/atelier-algo.js` (la simulation, la chaîne) ; `js/miroir-algo.js` ; `js/grilles.js` ; `js/import-export.js` ; `js/partage-schemas.js`, `js/partage-validation.js` ; `styles.css` ; `index.html` (jetons).

## 6. Pièges connus

1. **Le stock** : le relevé du lot 3a vert à l'octet ; une copie verrouillée garde sa phrase enregistrée (#1173).
2. **Le jeton orphelin** : un texte importé qui lit un calcul absent ne laisse rien de littéral, ni à l'écran ni sur le PDF.
3. **Le redessin** : poser un bloc de calcul au curseur, puis taper, ne fait sauter ni le focus ni le défilement ; « Ce calcul sert » change la zone du composeur sans perdre le brouillon.
4. Deux critères algorithmiques dans une grille : chacun ses calculs ; un bloc ne s'offre que dans les zones de son critère.
5. Règles 1, 2 et 4 de `CLAUDE.md` : le nom d'un calcul est un texte de l'enseignant·e, partout où il paraît (palette, menu « Selon », liste) ; aucun gestionnaire en ligne ; aucun `console.log`. Aucun nom d'élève réel.

## 7. Preuve exigée

- **Vitest** : la valeur d'un calcul pour les phrases (sans borne, ses choix « vaut 0 ») ; le jeton rempli, vide, orphelin ; une table « Selon » un calcul ; `calculLu` et les refus ; l'import d'une table qui lit un calcul introuvable ; l'aller-retour import et partage ; un critère sans calcul pour les phrases, phrase identique. Break-test pour chacun.
- **Playwright (WebKit)** : composer « Compte pondéré des X ÷ Compte des Y × 100 » pour les phrases, le garder ; le poser dans la phrase du décompte et voir la simulation ; une table « Selon » ce calcul ; **une vraie copie évaluée** (codes posés dans Annoter) dont la phrase sous le critère et le PDF portent la valeur et le cas ; la note inchangée ; « Retirer » refusé tant qu'un texte le lit ; 1 440, 1 180, 820 et 700 px.
- **Captures** : la liste des calculs pour les phrases, la palette avec leur bloc, une table « Selon » un calcul, 1 440 et 820 px, clair et sombre, les deux disciplines.
- Portes terrain : skill `portes-terrain`, ses deux règles de tête d'abord.

## 8. Ce qui n'entre pas

Un calcul dans les phrases du bilan ; un calcul qui en lit un autre ; des fonctions ; l'Aide (sa refonte suit l'étape 4).

## 9. Clôture

- Le plan du 21 oct. : la ligne de l'étape 4 dit « fait », avec les commits de 4a, 4b et 4c.
- Demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-27-calculs-4c.md`.
- Pas de release, de verdict ni de push sans le signal de Grégoire.
