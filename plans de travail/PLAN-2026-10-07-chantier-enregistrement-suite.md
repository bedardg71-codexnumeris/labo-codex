# Plan – chantier de l'enregistrement, jusqu'au chantier clos (lots 3 à 7)

> Écrit par Cowork le 7 octobre 2026 vers 6 h 15 (Toronto). À ouvrir **après la mise en ligne de 1.187.0** (dernier lot du démo) : une seule session écrit dans `js/` à la fois.
> Lots 1 et 2 en ligne (1.186.1, #962, #986, #1029 ; 1.186.2, #982, #984). Les fiches ci-dessous sont lues au backlog le 7 oct. et sondées au code pour #1030, #1031, #981 (vivantes à `2060d42f`) ; les autres se remesurent à l'ouverture de leur lot.

## L'ordre, et pourquoi

Les lots sans arbitrage d'abord, dans l'ordre du risque pour des données déjà écrites ; les deux lots qui attendent Grégoire ensuite, leur décision prise au moment où elle se pose.

| Lot | Ce que Grégoire verra | Fiches | Arbitrage | Fichiers | Palier |
|---|---|---|---|---|---|
| 3 | Rien de neuf à l'écran : une suppression qui échoue le dit (au lieu de revenir au rechargement) ; une copie importée au retour d'une mise en arrière-plan sur l'iPad ne se perd plus | #1030, #1031 | aucun | `js/db.js`, `js/modes.js` | petit |
| 4 | Rien à l'écran : l'application n'écrit plus rien à l'ouverture sans geste (la liste des cours, la sélection automatique du portfolio) | #981, #983 | aucun, sauf si la mesure montre qu'une écriture sert (alors : inscrire et remonter) | à mesurer (`cours` : 5 écrivains lus, `contexte.js:164`, `cours.js`, `demo-activation.js` ; `portfolio.js:~277`) | intermédiaire |
| 5 | Créer un trimestre par la bibliothèque passe par le même formulaire que le Cadre (plus de fenêtre `prompt`, plus d'`alert`) | #975 | aucun si les mots du chemin E2 sont repris tels quels ; vérifier d'abord que le moratoire #622 ne couvre plus ce fichier (les archives sont closes depuis 1.186.0) | `js/trimestre-v2-liste.js` | intermédiaire |
| 6 | « Écraser » une échelle, une grille ou une cartouche du même nom ne laisse plus d'évaluations pointer vers un modèle disparu | #967 | **Tranché par Grégoire le 7 oct. (par Cowork)** : un homonyme **employé** n'est pas écrasé ; refus avec la phrase validée, même forme pour les trois éditeurs, compte réel par `decrirePorteurs…` : « Une échelle porte déjà ce nom, et 12 évaluations et 2 productions l'emploient : l'écraser changerait leurs notes. Donne un autre nom à la nouvelle. » (« Une grille », « Une cartouche » ; « l'emploie » au singulier). Un homonyme que rien n'emploie s'écrase comme avant, sans laisser de référence. Remplacer un modèle employé reste le rôle de « Supprimer » (#648). | `js/echelles.js`, `js/grilles.js`, `js/cartouches.js` | laborieux |
| 7 | Un geste « Corriger le DA » sur la fiche d'un·e étudiant·e : la coquille corrigée garde ses évaluations, présences, indices et copies | #976 | **Grégoire** : le geste, ses mots, et ce qu'il déplace (ses données réelles) | `js/trimestre-v2-etudiants.js` + écrivains de chaque clé qui porte un DA | intermédiaire à laborieux |

## Règles communes

- Lots 3 à 5 : une consigne chacun ou deux par release si leurs fichiers ne se croisent pas (3 et 5 peuvent partager une release ; 4 seul, sa mesure peut changer son contenu).
- Lot 6 et 7 : aucune suppression irréversible (limite de Grégoire, 20 sept.) ; #976 déplace, ne copie pas puis efface : passe à blanc qui compte, puis écriture, puis vérification, et un codex à jour exigé avant le geste si la mesure le justifie.
- Chaque lot finit par un geste à vérifier à l'écran, ou dit pourquoi il n'y en a pas (lots 3 et 4 : bancs seulement).
- Verdict complet : Chrome et Safari fermés.

## Chantier clos quand

Les cinq lots sont en ligne, ou une fiche est explicitement renvoyée hors chantier par Grégoire. Restent alors inscrites à part, sans lot : rien de prévu.
