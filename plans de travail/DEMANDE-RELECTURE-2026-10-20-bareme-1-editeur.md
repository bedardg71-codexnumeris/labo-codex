# Demande de relecture – Le barème, lot 1 : l'éditeur (#1120, geste 1)

> Claude Code, mardi 20 octobre 2026 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-20-bareme-1-editeur.md` ; plan : `PLAN-2026-10-19-bareme.md`. Pour Cowork (`PROTOCOLE.md`, règle 2). Un commit sur `main`, **non poussé**, après `ee26c444`, avec le verdict du 20 oct. (#1119) et ses finitions F1 (notes #1119 dans `index.html`) et F2 (acquittement l. 211). Ni verdict complet, ni version. **Ce lot ne se publie pas seul** : les pièces d'aide d'abord.

## Ce qui change

- **`js/bareme.js`, module pur, neuf.** Il porte la lecture unique : `tranchesDuCritere` lit `bareme`, sinon l'ancien `parNiveau` sans `echelleId`, sans rien écrire, et `trancheDesPoints` donne la tranche de points saisis. Il porte aussi les refus, la conversion (`ecrireSurCritere`) et les gestes purs de l'éditeur. Seul un critère `analytique` a un barème.
- **Grilles de critères (`grilles.js`).** Le barème **remplace** l'éditeur des réponses du lot 13 pour les critères analytiques.
  - Sont retirés : les points, l'ajout et le retrait des réponses, avec `_sansEchelle`, `clePointsReponse` et quatre gestes. Le banc et la spec du lot 13 partent avec eux, leur couverture est reprise ici.
  - Reste : le texte par niveau d'un critère holistique, seul.
  - Retiré aussi, au rituel de fin de session : l'export `materielDissectionLecture.avecUnite`, dont l'éditeur des réponses était le seul consommateur externe (la fonction interne reste).
  - Garde-fous repris : écriture par la file, `_memeCritere` par l'identifiant du critère, et une confirmation au retrait.
- **Partage et import.** `bareme` est déclaré à `partage-schemas.js` et à `import-export.js`, en `numberOrNull` (avec `number`, `null` serait devenu 0). `partage-validation.js` (niveau 3) appelle `bareme.refusStructure`. Les styles, sans aucune couleur en dur, sont dans `styles.css`.

## Trois décisions de Claude Code, à regarder

1. **Les refus « identiques à l'éditeur et à l'import » sont en deux jeux.** `refusStructure` s'applique à l'écriture comme à l'import : types, 20 tranches, 5 000 caractères, des bornes dans l'ordre. L'éditeur y ajoute ce que l'enseignant·e saisit : des points obligatoires, de 0 à la pondération, sans chevauchement.
   - Pourquoi : la conversion écrit « tel qu'affiché » des tranches sans points (« Partiel »), d'anciennes réponses qui se chevauchent (« 3-4 » et « 4-5 ») et, après une pondération baissée, des tranches hors barème. Les refuser à l'import casserait l'aller-retour que la consigne exige, en refusant un paquet que l'application a elle-même produit.
   - L'import de fichier (`assainirObjet`) ne refuse rien, comme aujourd'hui pour tout le reste.
2. **Aucune version de format incrémentée.** Les précédents sont `descripteurs` (lot 1 du matériel), #581 et #667 : on ajoute un champ facultatif.
   - Une version plus ancienne refuse un paquet qui contient `bareme` et le dit (#583), ce qui est voulu.
   - Passer à `labo-codex-partage-v2` ferait refuser par les versions livrées même les paquets sans barème. §4.4 est respecté par l'autre bout : tout ce qui a été écrit avant ce lot se lit encore.
3. **Une tranche neuve vit dans la page jusqu'à ses points** (`_tranchesNeuves`), avec la mention « Pas encore enregistrée : donne-lui ses points ». Son nom et son texte se gardent si la liste est redessinée, mais pas au rechargement. C'est la règle « des points obligatoires pour toute tranche écrite ».

## Suppositions nommées

- « Réponse N » ne donne pas de nom : c'est un nom de remplacement, pas un mot de l'enseignant·e. « 3-4 (2) » perd son « (2) ».
- Sans pondération (`null`, « à compléter »), aucune borne haute ne s'applique.
- Un critère passé d'analytique à holistique garde son `bareme` en base, sans l'afficher : rien ne s'efface.
- Un analytique encore lié à une échelle montre son barème **et** ses textes par niveau.
- Le barème ne s'édite que sur une grille enregistrée, comme les réponses avant lui.
- Les identifiants lus `TR_lu_<rang>` sont écrits tels quels à la conversion, ce qui permet de viser la même tranche avant et après.

## Les textes provisoires

« Barème », « Nom », « Points », « Texte », « + Ajouter une tranche », « Retirer cette tranche » (titre de la corbeille), « à compléter », « hors barème », « Pas encore enregistrée : donne-lui ses points », « Es-tu sûr de vouloir retirer cette tranche ? ».

Les refus repris des réponses (validés le 19 oct.), avec « réponse » devenu « tranche » :
- « Au plus 20 tranches par critère »
- « Une tranche fait 5 000 caractères au plus »
- « Les points de la tranche sont obligatoires »

Les refus neufs, dans le témoin « Non enregistré : … » :
- « Ces points ne se lisent pas : écris un nombre (3 ou 2,5) ou deux bornes (3 à 4) »
- « Les points d'une tranche commencent à 0 : corrige-les »
- « Les points d'une tranche vont de 0 à N, la pondération du critère : corrige-les, ou change la pondération »
- « Ces points chevauchent ceux de la tranche « Nom » (3 à 4) : choisis des points qu'aucune autre tranche ne couvre »
- « Le nom d'une tranche fait 200 caractères au plus »

## Les bancs

- **Vitest**, `tests/unit/bareme-1-editeur.test.js`, 29 cas :
  - la lecture, sur toutes les clés de la mesure préalable : le zéro, la virgule, « (2) », « Réponse N », un niveau, une clé illisible, « Partiel » sans points ;
  - les refus ;
  - la conversion aller-retour, d'abord par le partage (construire, valider, `prefixerEntites`), puis par l'import de fichier ;
  - les gestes ;
  - le `<img onerror>` dans l'éditeur et au partage ;
  - l'invariant 1, vérifié de deux façons : seuls cinq fichiers nomment `bareme`, et `porteeDepuisEvaluation` donne les mêmes valeurs avec ou sans barème.
- **WebKit**, `tests/integration/bareme-1.spec.js`, 3 cas : voir la fiche #1120 au BACKLOG.
- **Bancs ajustés**, chacun avec sa raison dans le fichier :
  - 5b C.d et 2a lisent le barème ;
  - trois harnais chargent `bareme.js` ;
  - cliquet 467 : `grilles.js` passe de 65 à 69, sans désescape (même cas que #574) ;
  - cliquet 522 : `grilles.js` passe de 25 à 26 écritures par la file.
- **Break-tests**, tous rouges, code restauré :
  - une conversion qui perd un texte ;
  - « Partiel » lu 0 ;
  - `parNiveau` gardé à la conversion.
- **Résultats** : Vitest complet 9 247 / 9 247. WebKit (grilles, `materiel-*`, partage, import) : 65 / 65.

## Non éprouvé

Le toucher réel sur l'iPad et le zoom (plan, « Portes et déclarations ») : seule la mesure à 820 px avec `hasTouch` a été faite. Le §« barème » de `pratiques-notation` est prévu pour la livraison du chantier, pas pour ce lot.
