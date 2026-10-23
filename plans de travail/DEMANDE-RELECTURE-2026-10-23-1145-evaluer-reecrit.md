# Demande de relecture – #1145 : « Évaluer » qui réécrit une évaluation ; ranger la cartouche du plan sous G4H

> Claude Code, vendredi 23 octobre 2026, 18 h (Toronto). Pour Cowork (`PROTOCOLE.md`, règle 2 : une écriture possible dans les données réelles, la réparation de console). Consigne exécutée : `CONSIGNE-DU-JOUR.md` de 17 h 31.
> Commits sur `main`, **non poussés** : `1024de84` (docs de Cowork, seuls), `3a14c2f2` (le lot). Pas de release, ni verdict complet, ni push (consigne § 3).

## 1. #1145 : le chemin qui écrit (consigne § 1)

**Trouvé, puis reproduit au banc avant correctif** (fait) :

`basculerMode('evaluer')` → `preRemplirEvaluation`, `tentative` à +150 ms → `chargerEvaluationsEtudiant` → `_flusherAutoSave()` → `_autoSauvegarderCriteres(window._pendingAutoSaveSnapshot)`.

Le défaut : `window._pendingAutoSaveSnapshot` n'était jamais vidé, ni par le minuteur qui venait de l'écrire (`_debouncerAutoSave`), ni par trois des quatre annulations (`nouvelleEvaluation`, `modifierEvaluation` ; les deux « Enregistrer » le vidaient déjà). Le dernier instantané pris restait donc en attente jusqu'au prochain chargement d'élève, aussi tard que ce soit, et ce chargement le réécrivait.

Ce que la réécriture emporte, au code (`_majEvaluationExistanteAutoSave`) :

| Champ | Source au moment du rejeu |
|---|---|
| `criteres` | les niveaux DE L'INSTANTANÉ, parcourus sur la grille DE L'INSTANTANÉ (d'où les quatre ids de G4H) |
| `grilleId` | jamais écrit par l'auto-sauvegarde : G5H reste (conforme à la mesure) |
| `cartoucheId` | écrit seulement si `_remplacementConfirme` (#944) vise cette copie et la cartouche affichée |
| `noteFinale`, `niveauFinal`, `retroactionFinale`, `optionsAffichage` | l'écran du moment |
| `dateModification` | l'instant du rejeu ; `heureModification` et le journal : intouchés |

**Ce qui est inféré, non prouvé** : l'instantané a été pris sur la copie de l'Artefact 5 pendant que l'écran y montrait G4H et « Carte mentale A26 » (le geste qu'il décrit à 17 h 25), et la cartouche est passée par `_remplacementConfirme` (choisie au menu sur une copie sans commentaire enregistré : remplacement sans question). Les actions de ce moment sont sorties de la fenêtre de vingt. Le second passage (17 h 28) n'a rien écrit : le premier flush avait vidé l'instantané (cohérent avec la mesure). Les mêmes niveaux (D, I, D, D) dans trois évaluations d'autres élèves : **origine non établie**, je n'ai pas d'élément pour la trancher.

**Le correctif** (`js/evaluation-chargement.js`) : le minuteur consomme l'instantané avant d'écrire ; `_annulerAutoSaveEnAttente()` vide minuteur ET instantané, et remplace les quatre annulations (`evaluation.js` ×3, `evaluation-sauvegarde.js` ×1). Un instantané réellement en attente part toujours au changement de copie (témoin du banc Vitest).

## 2. Le stock de #1145

La signature proposée (`dateModification` dont l'heure locale ≠ `heureModification`) **ne tient pas**, mesuré au code : `heureModification` n'est écrite qu'à un seul endroit, « Modifier › Enregistrer » (`_lireChampsDOMMod`, `evaluation.js`), alors que chaque auto-sauvegarde légitime (chaque niveau cliqué, `_majEvaluationExistanteAutoSave`) écrit `dateModification` seule. La signature listerait donc toute copie retouchée depuis son dernier « Enregistrer », et ne séparerait pas un rejeu d'un geste. **Aucune fonction de console livrée ; rien écrit.**

Signature plus étroite, à toi de juger si elle vaut une fonction : une évaluation dont **tous** les `criteres[].critereId` sont ceux d'une **autre** grille que son `grilleId`. Elle couvrirait le cas de 17 h 11, pas un rejeu sur la même grille. Non construite (hors consigne).

## 3. Ranger la cartouche du plan sous G4H (consigne § 2)

- **Aucun geste de l'application ne change la grille d'UNE cartouche** (mesuré par `grep` sur `grilleId =` dans `cartouches.js`, `grilles.js`, `import-export.js`, `reserve-ouvrir.js`) : seul `deplacerCartouchesVersAutreGrille` déplace TOUTES celles d'une grille retirée, en les remappant. La source du 30 sept. reste ouverte (#1144).
- **La règle** (`js/cartouches-decalees.js`) : une cartouche dont tous les critères sont ceux d'**une** autre grille existante X est **rangée** sous X telle quelle (contenu inchangé, `grilleId` = X). Sinon, le rattachement par le nom, comme avant. La mesure dit, pour chaque ligne, `action` (`ranger` / `rattacher`) et `vers`, et la console : « ranger sous « X » » ou « rattacher à « X » ».
- **Sans proposition** : X porte déjà une cartouche du même identifiant ; ou les critères sont ceux de plusieurs grilles (ni rangée, ni rattachée).
- ⚠ **Une liberté prise, à relire** : « retirée de la clé d'origine dans la même écriture ». Deux clés ne s'écrivent pas en une seule écriture (`modifierEtAnnoncer` est par clé). J'ai pris l'ordre de `deplacerCartouchesVersAutreGrille` : **ajout sous X d'abord, retrait de l'origine ensuite**, chacun refait sur ce que lit l'écriture. Si la seconde échoue, la cartouche est en double, jamais perdue, et la console le dit.
- **Attendu sur ses données** : « Plan de rédaction (refonte A26) » → ranger sous G4H ; « Rédaction (refonte A26) » → rattacher à G5M. **Non mesuré chez lui** : ce sont ses données, la mesure est à lancer sur sa console (`await CartouchesDecalees.verifier()`). Le doublon du même id sous une clé de grille absente (#1144, ouverts) reste hors périmètre, comme avant.

## 4. Les preuves

- **Banc navigateur** `tests/integration/evaluer-reecrit-evaluation-1145.spec.js` : rouge avant correctif (`c1=E` → `c1=D`, `dateModification` à l'instant du clic), vert après.
- **Sentinelle Vitest** `tests/unit/sentinelle-1145-instantane-auto-save-consomme.test.js` (3 essais) ; break-tests : minuteur rendu à sa forme d'avant → rouge ; `_annulerAutoSaveEnAttente` sans vider l'instantané → rouge.
- **`cartouche-criteres-grille-1144.test.js`** : les essais de rattachement tournent maintenant sans G4 (leur cas : critères d'aucune grille) ; bloc #1145, 5 essais. Break-tests : branche « ranger » retirée → 5 rouges ; retrait de l'origine supprimé → 2 rouges.
- **`sentinelle-572`** : le bac à sable reçoit `_annulerAutoSaveEnAttente`, comme il reçoit déjà `criteresHorsGrille` (même origine).
- **Vitest complet** depuis `tests/` : 9 569 sur 9 569, 812 fichiers.
- **WebKit du périmètre** : 12 specs (#674, #699, #944, #946, #947, #959 ×2, #961, #1034, #1142 ×2, #1145), 75 essais : 74 verts, 1 rouge, `comptes-erreurs-stock-1142` (« refusée sans codex à jour »), **vert 3 fois sur 3 rejoué seul**. Le verdict de 16 h 12 le nommait déjà instable ; il ne touche aucun fichier du lot.
- **Audit statique** des lignes ajoutées dans `js/` : aucun `console.log`, `innerHTML`, `eval`, handler inline. `mesurer-522.py cartouches_` : rien sur `cartouches-decalees.js`. Anti-cache : `evaluation-chargement.js` `20261023d`, `evaluation.js`, `evaluation-sauvegarde.js`, `cartouches-decalees.js` `20261023c`.
- **Non mesuré** : la complexité (pas d'outil lancé).

## 5. Le geste à vérifier à l'écran, puis ce que Grégoire fera après la mise en ligne

**À l'écran** (après la mise en ligne) : ouvrir une copie évaluée en Annoter, « Évaluer », poser un niveau, attendre 2 s, revenir à Annoter, aller dans les réglages d'une production et revenir, « Évaluer » de nouveau. Dans la Liste, l'heure de modification de cette copie ne bouge pas au second « Évaluer ».

**Grégoire, lui-même, dans cet ordre** :
1. Mettre l'Artefact 5 sur G4H dans les réglages de la production.
2. Mettre le codex à jour, puis lancer les deux réparations de console : `await ComptesErreurs.verifier({ reparer: true })` (#1142) et `await CartouchesDecalees.verifier({ reparer: true })`. Lire d'abord chaque mesure sans paramètre.
3. Réévaluer la copie de 17 h 11.
