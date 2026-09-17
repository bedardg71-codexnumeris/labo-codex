# Consigne du jour – le pourcentage suit la fraction : assiduité et complétion du profil (#871)

> Écrite le 17 septembre 2026, 3 h 04 (Toronto), sur `25691c82` (`1.142.21` en ligne).
> Elle REMPLACE la précédente, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-16-lot-F-ecrans-du-groupe.md`.

Mandat : #871, tranché par Grégoire le 15 sept. au soir (lis la ligne « ✅ TRANCHÉ » sous la fiche). Choisi par Cowork parce qu'il ne demande à Grégoire ni mot ni vérification à l'écran : **les mots sont déjà les siens** (« 90 % (22,5 / 25) »). Sa règle : **le pourcentage suit la fraction**, comme l'assiduité se calcule à partir des présences, et non l'inverse.

## 1 · Volet assiduité : la fraction montre les présences telles que saisies

- `obtenirDetailsAssiduite` (`js/profil-etudiant-sections-affichage.js`, vers 1662-1663) arrondit les périodes (`Math.round`), alors que l'indice est calculé sur les valeurs non arrondies (`indices.js`, vers 139) et que la saisie accepte les demi-périodes (`saisie-presences.js`, `step="0.5"`). Sur 22,5 / 25, l'écran écrit « 90% (23 / 25 périodes) », or 23 / 25 = 92 %.
- Cesser d'arrondir, et afficher la demi-période avec une virgule décimale (« 22,5 »), aux sites qui affichent ce couple. La fiche en compte quatre, dont `profil-etudiant-rapport.js` (vers 100) : **remesure-les** (`grep` sur `periodesPresentes` et sur les lecteurs d'`obtenirDetailsAssiduite`), nomme-les, et dis si `etudiants.js` (vers 250, un second calcul du taux) est un lecteur de ce couple ou un autre écran.
- Le formatage du nombre vit à UN endroit que les sites partagent. Un entier reste un entier (« 23 / 25 », jamais « 23,0 »).

## 2 · Volet complétion : mesurer d'abord (DEMO015)

- Mesuré le 15 sept. sur le pack démo : `DEMO015` affiche C = 80 % et la fraction « 7 / 9 » (78 %). La fraction est recomptée par le rapport, le pourcentage vient de `calculerCompletion` de la pratique.
- ⚠ **1.142.19 et 1.142.20 ont changé les deux comptages** (règle unique « la copie compte », dénominateur du rapport aligné sur la sommative). **Remesure DEMO015 sur 1.142.21 avant tout.** Si l'écart a disparu, écris comment tu l'as établi et ajoute une assertion qui le garde. S'il reste, nomme sa cause.
- **Si la cause est technique** (deux lecteurs d'une même règle), aligne la fraction sur le calcul de la pratique, pour toutes les familles.
- ⛔ **Si la cause est une règle de famille** (par exemple STD compte les travaux DUS, la sommative les travaux ÉVALUÉS pour au moins un élève — constat de Cowork du 16 à 20 h 37), **arrête ce volet et rapporte à Cowork** : choisir ce qu'une complétion compte est une question de didactique, qui remonte à Grégoire. Le volet assiduité part seul.

## Preuve

- Une sentinelle qui exécute les calculs réels : 22,5 / 25 → « 90% (22,5 / 25 périodes) » à chaque site ; 23 / 25 → « 92% (23 / 25 périodes) » ; 0 / 0 et l'élève sans présence gardent leur affichage actuel. Pour la complétion, DEMO015 (ou son équivalent au banc) : pourcentage et fraction concordent.
- Break-test : chaque assertion neuve rougit sous sa mutation (arrondi remis, à chaque site ; point décimal au lieu de la virgule ; « 23,0 » pour un entier ; fraction recomptée hors de la règle de la pratique). Cowork en posera d'autres à la relecture.
- Au passage, **sans release si c'est seul** : les deux trous de preuve de la relecture du lot F, si tu passes par ces fichiers (sinon, ne les ouvre pas pour ça) — un élève dont le nom contredit l'ordre d'urgence dans `sentinelle-lot-F-860-828-les-ecrans-du-groupe`, et `'C'` dans la boucle des courbes du groupe.
- Vitest depuis `tests/`, puis le verdict Playwright sur le commit final, Cowork fermé. **Porte terrain : aucune attendue** – le texte affiché se juge à la machine.
- **Stock** : rien n'est écrit dans les données ; les présences saisies restent telles quelles. Le texte du rapport déjà copié par Grégoire ne se réécrit pas.

## Livraison

Patch `1.142.22` par `scripts/release.mjs`. Phrase de « Nouvelles » : propose-la à Grégoire avant de la figer (un seul message). Puis `OU-EN-EST-ON.md` (phrase « vérifié comment »), `RELAIS.md`, #871 cochée avec sa disposition (ou le volet complétion laissé ouvert, écrit), le markdown du tri. Toute trouvaille reçoit l'une des trois issues ; « inscrire et continuer » est le défaut. Commite aussi les fichiers de Cowork : `RELAIS.md` (ajouts du 17 sept.), `plans de travail/CONSIGNE-DU-JOUR.md`, `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-16-lot-F-ecrans-du-groupe.md`, `CONSIGNE-DEMARRAGE-COWORK.md` (réécrite le 17 sept. vers 3 h 05) et son archive `plans de travail/_ancienne-CONSIGNE-DEMARRAGE-COWORK-2026-09-16-19h15.md`. Push par `scripts/pousser.sh`, puis signale à Cowork que c'est poussé.
