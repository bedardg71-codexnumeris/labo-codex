# Demande de relecture – #1125, geste 2 du barème : les points d'une grille à niveaux nommés

> Claude Code, jeudi 22 octobre 2026, sur `main`, un commit non poussé après `fdaa13e0`. Consigne :
> `CONSIGNE-LOT-2026-10-22-bareme-geste-2-dissection.md`. Pas de verdict complet, pas de version.

## Ce qui est fait

Une grille créée **en points** qui **nomme ses niveaux** écrit un `bareme` sur chaque critère
(`construireGrilleEnPoints`, `js/materiel-assistant.js`) : une tranche par niveau qui porte un texte ou des
points, le nom du niveau pour nom, ses points en nombres, son texte sans la ligne des points. La dissection
passe les points par case dans le modèle (`pointsParCase`, `js/materiel-dissection-lecture.js`) ; la ligne
des points ne reste dans le texte qu'en niveaux (`texteDuNiveau(cell, avecPoints)`). `resumer`
(`js/materiel-creation.js`) compte un barème comme des descripteurs dans « Aller plus loin ».

## Mes suppositions

1. **Plusieurs morceaux « Points » dans une case** se réunissent en une plage (de la plus petite à la plus
   grande valeur) ; « 11-12-13 » devient 11 à 13.
2. **Une case qui n'a que des points** garde sa tranche, texte vide ; une case vide n'en donne aucune.
3. **Sans niveaux** (`parCle`) : inchangé, les clés de points se lisent déjà juste. Écrire là aussi un
   barème ne répond à aucun symptôme : commentaire dans le code, aucune fiche.
4. **En niveaux** (« les deux », choix « niveaux ») : inchangé, la ligne des points reste dans le texte
   de l'échelle.
5. **Aucun texte neuf** : l'écran de confirmation ne dit pas « barème » (pièce 6 du plan, à valider).

## À regarder

- Le **stock** n'est pas touché : la grille « Journal de lecture » de Grégoire garde ses points dans le
  texte. `bareme-1.spec.js` fabrique désormais ce stock au banc, puisque la dissection n'en écrit plus.
- La sentinelle I.a (`bareme-1-editeur.test.js`) admet deux fichiers de plus qui nomment `bareme` :
  `materiel-assistant.js` (il l'écrit) et `materiel-creation.js` (il le compte). Aucun calcul.
- Les modèles figés de l'assistant retiré (étape 5b) n'ont pas de `pointsParCase` : leurs tranches sont
  « à compléter », le texte tel quel (C.b).

## Preuves

- Vitest complet : 9 414 essais, 799 fichiers, vert. Neuf : `tests/unit/bareme-geste-2-dissection-1125.test.js`
  (6 essais). Break-tests faits : la ligne des points remise dans le texte → J.a, J.b, M.a, M.c rouges ; une
  seule plage non réunie → P.a rouge ; `descr` sans le barème → 5b C.a rouge.
- WebKit, vertes : `bareme-1`, `materiel-dissection-1`, `-2a`, `-2b`, `materiel-etape6-plus-loin`,
  `materiel-aide-accompagnement`, `materiel-bandeau-construction`, `materiel-lot1-onglet`, `icones-i-catalogue-c3`.
- Non éprouvés : Safari réel, l'iPad au doigt.
