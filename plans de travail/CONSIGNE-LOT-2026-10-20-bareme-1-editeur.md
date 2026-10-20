# Consigne – Le barème, lot 1 : écrire un barème dans Grilles de critères (#1120, geste 1)

> Écrite par Cowork le mardi 20 octobre 2026 à 7 h 22 (Toronto, mesuré par `date`), sur `main` à `ee26c444` (non poussé). Plan : `plans de travail/PLAN-2026-10-19-bareme.md` (concept, invariants, modèle, mesures préalables, cinq décisions de Grégoire du 19 oct., 21 h 54 à 22 h 26). **Lis le plan en entier avant de commencer** : cette consigne n'en reprend que le découpage. **Aucune porte terrain** si la conversion est prouvée sans perte par un test aller-retour, partage compris (plan, « Portes et déclarations »).

## Le découpage du chantier (décision de Cowork)

1. **Ce lot** : le modèle, la fonction de lecture, la conversion, l'éditeur du barème (geste 1). Mots d'écran provisoires.
2. Ensuite : la dissection qui écrit des tranches (geste 2).
3. Les pièces d'aide (lexique, aide « i », onglet Aide, bulles, primo-aide, alignement de `grille-type-critere-detail`), avec les textes que Grégoire aura corrigés. Cowork les rédige pendant ce lot.
4. Puis l'évaluation (geste 3), puis ce que l'élève lit (geste 4).

**Aucune version ne sort avec le barème sans ses pièces d'aide** (un concept arrive avec sa définition). Ce lot se commite, il ne se publie pas seul.

## Ce que l'enseignant fait à la fin de ce lot

Dans Grilles de critères, un critère analytique montre son **barème** : des tranches, chacune avec un nom facultatif, ses points (un nombre, ou deux bornes) et son texte ; « + Ajouter une tranche » ; retirer une tranche. Un critère créé par la dissection, qui porte aujourd'hui des « réponses », montre ces réponses **lues comme un barème** ; sa première modification l'écrit tel qu'affiché, sans rien perdre. Un critère holistique ne change pas.

## Ce qu'il faut

1. **Le modèle** (plan, « Le modèle ») : `critere.bareme`, une liste de tranches `{ id, nom, pointsMin, pointsMax, texte }` ; `id` stable, indépendant des points ; des nombres, pas une chaîne relue. Seuls les critères analytiques en portent un.
2. **Une seule fonction de lecture, pure** (invariant 2), dans un module que l'éditeur, l'import et, plus tard, l'évaluation et le PDF liront : un critère donne ses tranches (`bareme`, sinon l'ancien `descripteurs.parNiveau` **sans** `echelleId`) ; des points donnent leur tranche, ou `null`. Elle lit toutes les clés de la mesure préalable : nombre avec ou sans unité, deux bornes séparées par un trait court, un demi-cadratin ou « à », virgule décimale, suffixe « (n) » ; « Réponse N » et un nom de niveau donnent une tranche sans points ; une clé illisible, une tranche sans points, texte intact. Le zéro est une valeur ; « Partiel » n'a pas de points (`null`, pas 0) (invariant 3).
3. **La conversion** (question 2) : rien ne se convertit sans geste. La première modification d'un critère écrit `bareme` tel qu'affiché et retire `parNiveau` de ce critère seulement, dans la même écriture. Jamais de réécriture de masse (invariant 5, règle de Grégoire du 20 sept.). Un critère lié à une échelle (`echelleId`) n'est pas concerné.
4. **L'éditeur** remplace celui des réponses des critères analytiques (« LES RÉPONSES D'UN CRITÈRE », `grilles.js`, l. 4578 et suivantes) : il ne s'empile pas à côté (zéro-dette). Ce qui en sert encore aux critères holistiques reste. Reprends ses garde-fous : écriture par la file, `_memeCritere`, confirmation au retrait comme `supprimerCritereGrille`.
5. **Les refus**, identiques à l'éditeur et à l'import (plan, « Le modèle ») : des points obligatoires pour toute tranche écrite ; des points hors de 0 au maximum du critère (sa pondération, #941) ; des tranches qui se chevauchent ; plus de 20 tranches ; un texte de plus de 5 000 caractères. Une tranche du stock sans points reste lisible, marquée « à compléter ». Une pondération baissée après coup : la tranche se montre « hors barème », sans être réécrite. **Reprends tels quels les refus déjà validés par Grégoire** (`REFUS_REPONSES`, validés le 19 oct. à 19 h 29) là où ils disent la même chose ; les autres sont provisoires et listés dans la demande.
6. **Le partage et l'import** : `bareme` déclaré au schéma de partage (`partage-schemas.js`) et au schéma d'import (`import-export.js`, l. 965) ; suis le skill `securite-donnees` §4.4 pour la version du format. Une version déjà livrée refuse le paquet et le dit (#583) : c'est voulu, rien ne se perd en silence.
7. **L'interface** (skill `design-interface`) : composants de `design-system.html`, aucune couleur en dur, aucune couleur par tranche ; l'éditeur s'empile entre 768 et 1 024 px ; cibles de 44 × 44 px sur l'iPad ; refus en trois temps (ce qui s'est passé, pourquoi, quoi faire), en tutoyant. Mac et iPad, séparément.
8. **Sécurité** : `echapperHtml` sur le nom et le texte d'une tranche ; `data-action` et `data-on-change`, aucun handler inline ; un test pose un `<img onerror>` dans un nom de tranche.

## Ce qui ne bouge pas

- **Aucun calcul ne lit le barème** (invariant 1) : ni la note, ni P, ni le Comparateur, ni l'export, ni le dépistage. Sentinelle : mêmes points, même note et même P, avec ou sans barème.
- L'évaluation, le PDF et le bilan de l'élève : rien dans ce lot.
- La dissection écrit encore des réponses (`parNiveau`) : l'éditeur les lit comme un barème jusqu'au lot 2.

## Les textes

Les libellés de l'éditeur (« Barème », « Tranche », « Nom », « Points », « Texte », « + Ajouter une tranche », « Retirer », « à compléter », « hors barème ») et les refus neufs : **provisoires**, listés dans la demande. Les pièces d'aide ne sont pas de ce lot.

## Les bancs

- **Vitest** : la fonction de lecture sur toutes les formes de clés de la mesure préalable, y compris le zéro, la virgule, « (2) », « Réponse N », un nom de niveau, une clé illisible ; les refus ; la conversion aller-retour sans perte, **partage compris** (exporter, importer, comparer) ; la sentinelle de l'invariant 1 ; le `<img onerror>`.
- **WebKit** : une grille créée par la dissection (la démo Journal de lecture, ou un banc équivalent en mode démo) → son critère analytique montre son barème ; modifier une tranche → `bareme` écrit, `parNiveau` retiré de ce critère seulement, la page rechargée le garde ; un critère holistique de la même grille inchangé à l'octet près.
- **Break-test** : une conversion qui perd un texte, puis une lecture qui rend 0 pour « Partiel » → rouge chaque fois. Code restauré.
- Vitest complet vert ; les specs de Grilles de critères et `materiel-*` touchées vertes en WebKit. Le verdict complet tourne ce soir.

## Ce qu'il ne faut pas

- Réécrire en masse des critères existants, ou convertir sans geste.
- Toucher un critère holistique, l'évaluation, le PDF, le dépistage.
- Le verdict complet, un numéro de version, le push.

## Livrer

Un commit sur `main`, non poussé, avec : cette consigne ; le verdict `plans de travail/VERDICT-RELECTURE-2026-10-20-retour-a-la-dissection.md` et ses deux finitions (F1, F2) ; le BACKLOG (#1120 : « lot 1 livré » et sa phrase « vérifié comment ») ; les bancs ; la demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-20-bareme-1-editeur.md`. Ajoute les fichiers par leur chemin, jamais `git add -A`. Lance `/fin-de-session` avant le commit, sans le verdict complet. **Puis arrête-toi.**
