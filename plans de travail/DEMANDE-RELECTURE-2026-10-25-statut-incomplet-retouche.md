# Demande de relecture – Retouche du statut « Incomplet ; travail en cours »

> Claude Code, dimanche 25 octobre 2026, 11 h 50 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-25-statut-incomplet-retouche.md`, commitée seule avec le verdict (`bee922f0`). La retouche : un commit sur `main`, après celui-ci. Pas de release, pas de verdict, pas de push.

## En bref

Le PDF d'une copie cochée après des niveaux n'en montre aucun : ce que reçoit la page de synthèse est identique (comparé en JSON) à ce qu'elle reçoit pour la même copie cochée avant tout niveau. Les niveaux restent en base, masqués. Décochée, la pastille reprend l'état réel de la copie (« Annoté », « Évalué ») en appelant le calcul de sa sélection. Le C des spécifications est fixé par un test : la copie incomplète y est mise de côté, le code n'a pas changé. #1162 est inscrite.

## 1. Le PDF (§ 1 de la consigne)

La garde est à l'entrée de `construireFeedback` (`synthese-retroaction-data.js`), la seule porte du PDF de l'élève. `sansNiveauxSiTravailEnCours(evaluation)` rend une vue de l'évaluation avec `criteres: []` quand le statut est posé. Tout ce qui suit lit cette vue : les critères, « Présentement », « Ta force », les points récurrents et la portée. La règle du statut est celle du registre (`evaluationTravailEnCours`), pas une recopie. Rien n'est écrit en base. Aucun mot nouveau pour l'élève.

**Une décision de plus, prise seul.** La même vue s'applique aux copies de l'historique (`historiqueAnterieur`). Sans elle, une copie **suivante** de l'élève comparait ses niveaux à ceux du brouillon masqué, dans « Points récurrents » et « Tu as progressé ». C'est la même fuite par une autre porte. Je l'ai fermée, parce que c'est mon lot qui garde les niveaux en base. `historiqueAnterieur` sert aussi le bilan de l'écran (`evaluation-retroaction.js`) : il lit donc la même vue.

## 2. La pastille après décochage (§ 2)

`_poserPastilleTravailEnCours` ne remet plus « Importé » d'office. Décochée, elle prend l'évaluation en base, sans le statut (c'est ce que l'auto-save écrira 1,5 s plus tard). Elle la passe à `travauxUI.statutPastilleFichier`, le calcul de la sélection, maintenant exporté. L'affichage de la copie ouverte (ÉVALUÉ, Incomplet ou EN COURS) est extrait de la sélection dans `travauxUI.afficherPastilleActive`, et les deux le lisent. Rien n'est recopié.

## 3. Les spécifications (§ 3) : la phrase corrigée

Ma demande disait : « Aujourd'hui, une copie incomplète vaut “non acceptable” dans le C des spécifications ». **C'était faux.** La copie incomplète y est **mise de côté** : `calculerDetailsCompletion` et `detecterDefis` écartent toute évaluation sans note, et le dénominateur est fixe (les travaux exigés du palier le plus haut). Elle a le même effet qu'aucune copie. C'est ce que Grégoire a choisi à 11 h 30. Le code n'a pas changé.

Deux tests Vitest le fixent :

- avec la copie incomplète, le C est identique à « pas de copie » (1/2), et `detecterDefis` aussi. Ça tient même si la copie porte une note acceptable et un verrou (cas d'un fichier importé) ;
- le témoin : sans le statut, la même copie, notée et verrouillée, est acceptable (2/2). C'est donc bien le statut qui la met de côté, par `evaluationEntreDansLaNote`.

## 4. Les bancs

| Banc | Résultat |
|---|---|
| Vitest `statut-incomplet-travail-en-cours.test.js` | 14 sur 14 (+ 2 pour les spécifications) |
| WebKit `statut-incomplet-travail-en-cours.spec.js` | 3 sur 3. Le nouvel essai coche la case **après** deux niveaux (D, D) : niveaux en base `['D','D']`, PDF sans critère, `overall.code` vide, identique au PDF sans niveaux, brouillon sans critère dans l'historique ; pastille « Annoté » puis « Évalué » après décochage |
| Break-tests WebKit, une garde retirée à la fois | sans la garde du PDF, rouge (2 critères au lieu de 0) ; sans la vue de l'historique, rouge (les niveaux du brouillon) ; avec « Importé » d'office, rouge |
| Vitest complet | 9 709 sur 9 710. Seul rouge : `sentinelle-anticache-fichiers-modifies`, attendu (jetons du 25, build du 24), qui passe au vert avec la version du soir |
| 11 specs voisines (pastilles, PDF, bilan, synthèse), WebKit | 62 sur 63. Le rouge est hors de ce lot (voir trouvaille ci-dessous) |

Jetons : `synthese-retroaction-data.js`, `travaux-ui.js` et `evaluation-sauvegarde.js` passent à `?v=20261025j`.

## 5. Dispositions du verdict

- Trouvaille 2 (`mettreAJourPillStatut` écrit dans une pastille disparue) : **commentée sur place** (`evaluation-sauvegarde.js`).
- Trouvaille 3 (contraste de la famille « un geste attendu ») : **inscrite, #1162**. ⚠ Le numéro suit #1161, celui de la branche `bibliotheques-deux-colonnes`, non fusionnée. L'en-tête « Dernier ID » de `main` le dit, et la fusion devra garder les deux.

## 6. Trouvaille en chemin (inscrire et continuer, à Cowork)

`critere-algorithmique-dit-vrai.spec.js` › « #1131 · un critère algorithmique en création reçoit ses sous-critères » est **rouge sous WebKit**, et la retouche n'y est pour rien. Il est rouge sans elle, et rouge aussi sur `b4e0fd08`, avant le lot de ce matin. Le bouton « Partir de la liste d… » (`initialiserSousCriteresParDefaut`) est « not visible ». Il était vert le 21 oct.

Mon **hypothèse, que je n'ai pas mesurée** : `9b70e1b1` (#1150, lot 4, « une seule étape ouverte ») replie l'étape des sous-critères, et le banc ne l'ouvre pas. Ce serait un banc périmé, pas une régression, mais je ne l'ai pas vérifié. Je n'y ai pas touché.

## 7. Le geste à vérifier à l'écran

C'est celui du lot, inchangé. Rien de plus à voir pour Grégoire.
