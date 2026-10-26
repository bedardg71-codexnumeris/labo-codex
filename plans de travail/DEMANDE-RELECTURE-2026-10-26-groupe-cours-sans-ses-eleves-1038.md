# Demande de relecture – Le groupe-cours qui naît sans ses élèves (#1038, la source, 26 oct. 2026)

> Claude Code, lundi 26 oct. 2026, 16 h, sur `main` (parti de `12dc3d9b` : les lots 3a et 3b de la table de cas commités, non poussés). Consigne : `CONSIGNE-LOT-2026-10-26-groupe-cours-sans-ses-eleves-1038.md` (Cowork, 14 h 59) ; mots validés par Grégoire à 15 h 01. **Ni release, ni verdict, ni push** (consigne § 5) : le lot part avec les autres, au signal de Grégoire.

## Vue d'ensemble

Deux endroits, rien d'autre. **(A)** Enregistrer un groupe-cours dont le numéro n'a aucun·e élève dans le cours choisi, et en a dans un ou plusieurs autres cours, pose une question native (`confirm`, comme CT-15) avec les mots du § 3 A ; « Annuler » n'écrit rien et la fiche reste ouverte. **(B)** Le sélecteur « Production » de l'import, quand le cours actif n'a aucune production et que le trimestre en a sous un autre cours, porte une ligne avec les mots du § 3 B. Aucune écriture dans les données, aucune migration.

## Ce qui est mesuré

| Preuve | Résultat |
|---|---|
| Vitest entier, depuis `tests/` | **9 768 verts / 823 fichiers** (avant : 9 756 / 822 ; + 12 du banc neuf) |
| Banc neuf `unit/groupe-cours-sans-ses-eleves-1038.test.js` | 12 cas : le compte (A) sur les vrais `trimestre-v2-etudiants.js` et la condition (B) sur le vrai `modes.js` |
| Spec neuve `integration/groupe-cours-sans-ses-eleves-1038.spec.js` (WebKit) | 4 essais, **les mots lus mot pour mot** : la séquence de Mathieu (import collé par l'écran, question, « Annuler » n'écrit rien, la fiche gardée, « Créer » à nouveau et « OK », activé, la ligne sous « Production ») ; la modification (le cours change : « Modifier quand même », « Annuler » remet la fiche ; un autre champ change : aucune question) ; plusieurs autres cours (A et B) ; ni question ni ligne (groupe vide partout, aucune production nulle part, fiches sans `coursId`, deux cours bien rangés) |
| Break-tests | **12 mutations, chacune rouge** sur au moins un banc, faites une à une et restaurées : chaque condition de (A) (`duCours`, `sansCours`, `ailleurs` vide, le changement en modification, la création, « Annuler » qui écrit, « Annuler » qui ne remet pas la fiche, la règle du Cadre), chaque condition de (B) (le filtre, la production sans cours, `ailleurs` vide, la ligne non rendue) |
| Specs WebKit qui touchent le Cadre ou l'import (18 fichiers : `v2-gc-`, `sauvegarderGroupeCoursV2`, `travauxImport`, `pipeline-`, l'import collé…) | **50 verts** en 4,5 min, sur l'état final du code ; la spec neuve relancée deux fois après le retrait de ses `waitForTimeout` (§ 4.1 bis du rituel) : 8/8. La suite complète du navigateur n'a pas tourné (verdict au signal). |
| Chromium | non lancé : le banc local n'a que le projet WebKit (`playwright.config`) ; la consigne dit « Chromium suffit », WebKit le couvre |

## Les points à relire en priorité

1. **La règle du compte.** `repartitionGroupeParCoursV2` (`trimestre-v2-etudiants.js`, à côté de `_ficheEstDuGroupeV2`) appelle le jugement de la liste du Cadre pour le cours choisi ; une fiche sans `coursId` est comptée à part (`sansCours`) et suffit à taire la question, comme `duCours` de l'étape 3. Le numéro se compare par `normaliserNumeroGroupe` ; une fiche sans numéro ne compte pas (comme `_couplesDesFichesV2`).
2. **La condition de (B) suit le filtre.** `productionsRangeesAilleurs` (`modes.js`) : une production sans `coursId` passe le filtre de tout cours, une du cours actif aussi ; si une seule passe, rien. Le cours actif lu est l'id d'`infoCours`, celui que compare `obtenirContexteCoursActif` (non exposé hors de `modes.js` : ma première écriture le cherchait sur `window` et taisait la ligne, la spec l'a attrapé). La garde `productions.length > 0` en tête de `phraseProductionsRangeesAilleurs` est redondante avec la fonction pure (le break-test ne la voit pas) : elle évite de relire le stock dans le cas courant.
3. **Le cliquet.** `sauvegarderGroupeCoursV2` 33 → 34 : la garde est sortie dans `_groupeSansSesElevesAccepteV2`, l'écrivain n'y gagne qu'un `if` ; écrit dans la fixture et dans `HAUSSES_ASSUMEES`.
4. **Échappement.** (B) passe la phrase entière par `echapperHtml` (les libellés de cours viennent d'une saisie). (A) est un `confirm` natif : texte, pas de HTML.

## Suppositions et décisions (dites si vous les défaites)

| | Ce que j'ai fait | Motif |
|---|---|---|
| D1 | **Le singulier** : « Son étudiant·e est rattaché·e à … » (sans le chiffre 1). | La consigne dit « accords au singulier » sans donner la phrase ; calqué sur `_sesEtudiantsV2` (« son étudiant·e » / « ses N étudiant·es »). Mot que l'enseignant·e lit, pas l'élève. |
| D2 | **Le libellé des cours**, en (A) **et en (B)** : `_libelleCoursRattachementV2`, donc code ET nom (« 203-GM6-DM Cours fictif A »), via `libelleCoursParIdV2` (neuf, exposé) ; un cours introuvable : « Cours ‹id› », comme la zone d'import. | (A) nomme la fonction ; (B) disait « codes de cours » : j'ai pris le même libellé pour que les deux phrases nomment les cours de la même façon. |
| D3 | Plusieurs autres cours : libellés **triés** dans la parenthèse. | Ordre stable, indépendant de l'ordre des fiches. |
| D4 | Espace insécable avant le deux-points de (B) (` :`). | Typographie française ; la spec normalise les espaces. |
| D5 | En modification, « le groupe change » se compare en chaîne (`String(avant.groupeNum) !== String(groupeNum)`), sans normaliser. | Le menu donne toujours un numéro sur cinq chiffres ; un ancien « 1 » rouvrirait seulement le calcul (la question ne se pose que si la condition tient). |
| D6 | Les élèves comptés sont ceux du trimestre actif (`cle('groupeEtudiants')`), comme le compte de l'étape 3. | Le champ « Trimestre » du formulaire pourrait en nommer un autre ; l'étape 3 fait déjà ce choix. |
| D7 | **Le stock** : un groupe-cours déjà créé vide ne pose aucune question (elle ne vient qu'à l'enregistrement) ; la ligne (B) le dit à l'import. | Tarir n'est pas réparer : assumé et écrit à la ligne #1038. |

## Hors lot (issue 2, inscrits)

- **#1170** – Aucun geste ne change le cours d'un·e élève ou d'un groupe d'élèves (la réparation de Mathieu a dû passer par la console) : c'est ce qui empêche la question (A) de proposer un remède.
- **#1171** – Conception › Productions montre les productions de tous les cours sans nommer le leur (mesuré : `afficherTableauProductions` lit le stock brut, n'affiche pas `coursId`).

## Ce qui a changé, fichier par fichier

| Fichier | Quoi |
|---|---|
| `js/trimestre-v2-etudiants.js` | `repartitionGroupeParCoursV2`, `libelleCoursParIdV2`, exposés |
| `js/trimestre-v2-groupes-cours.js` | `_questionGroupeSansSesElevesV2` (les mots), `_groupeSansSesElevesAccepteV2` (la garde), son appel dans `sauvegarderGroupeCoursV2`, avant CT-15 |
| `js/modes.js` | `productionsRangeesAilleurs`, exposée |
| `js/travaux-ui.js` | `phraseProductionsRangeesAilleurs`, rendue sous le sélecteur de `genererEtape2Colonnes` (`#pipeline-productions-ailleurs`) |
| `index.html` | les quatre `?v=` |
| `tests/unit/groupe-cours-sans-ses-eleves-1038.test.js`, `tests/integration/groupe-cours-sans-ses-eleves-1038.spec.js` | neufs |
| `tests/unit/sentinelle-contenir-complexite.test.js`, `tests/fixtures/cliquets/complexite-fonctions-30.json` | la hausse 33 → 34 |
| `BACKLOG.md`, `Retours des testeurs/SUIVI-BUGS.md` | #1170, #1171 ; la ligne #1038 (la source, ce qui est tari, le stock, ce qui reste) |
