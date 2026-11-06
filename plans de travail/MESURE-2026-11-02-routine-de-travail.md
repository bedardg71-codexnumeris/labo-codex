# Mesure de la routine de travail, du 31 août au 2 novembre 2026

Écrit par Cowork le 2 nov. 2026 au soir (Toronto), à la demande de Grégoire : étape 1 de l'examen de la routine. Lecture seule de l'historique Git et des rapports du dépôt ; aucune commande touchant l'index.

Les numéros des sections servent seulement à s'y retrouver ; Grégoire les reçoit un à la fois dans la conversation.

## 1. Les tests croissent beaucoup plus vite que le code

| Semaine du | Fichiers spec | Essais Playwright (approché) | Fichiers Vitest | Taille de js/ |
|---|---|---|---|---|
| 31 août | 77 | 219 | 422 | 10 056 Ko |
| 7 sept. | 105 | 276 | 506 | 10 475 Ko |
| 14 sept. | 110 | 289 | 563 | 10 072 Ko |
| 21 sept. | 148 | 375 | 615 | 10 331 Ko |
| 28 sept. | 186 | 541 | 659 | 10 657 Ko |
| 5 oct. | 215 | 636 | 685 | 11 017 Ko |
| 12 oct. | 231 | 698 | 751 | 10 960 Ko |
| 19 oct. | 248 | 727 | 784 | 11 185 Ko |
| 26 oct. | 287 | 950 | 823 | 11 667 Ko |
| 2 nov. | 338 | 1 240 | 863 | 12 000 Ko |

Fait : le code (js/, index.html, styles.css) passe de 11 856 à 13 914 Ko (+17 %) ; les lignes de JS de 223 227 à 249 015 (+12 %). Les essais Playwright passent de 219 à 1 240 (×5,7).

Méthode : `git grep` des appels `test(` dans tests/integration à chaque instantané. Ce compte sous-estime un peu : 1 105 essais exécutés le 27 oct. pour environ 950 comptés la veille.

## 2. La durée du verdict suit le nombre d'essais

Mesures sur le Mac (dix morceaux, rapports de RELAIS.md et de plans de travail/) :
- 27 oct. : 1 h 33 (12 h 07 → 13 h 40), 1 105 essais ; le soir, 1 h 34, 1 109 essais
- 28 oct. : 1 h 32, 1 120 essais
- 1er nov. : 1 h 46 (20 h 52 → 22 h 38), rouge
- 2 nov. : 1 h 47 (5 h 57 → 7 h 44) et 1 h 48 (14 h 56 → 16 h 44)

Avant le 27 oct., pas de mesure comparable sur le Mac : des runs de la CI Linux (32 min 35 pour 239 essais le 2 sept. ; 35 min le 6 sept.) et des estimations écrites dans les consignes (« ≈ 43 min » le 30 sept., « ≈ 45 min » le 1er oct.).

Inférence : la suite tourne sur un seul worker, en séquence ; entre le 27 oct. et le 2 nov., +12 % d'essais pour +15 % de durée. La durée suit le nombre d'essais, pas la taille du code.

Extrapolation, à vérifier : au rythme des deux dernières semaines (environ 200 essais de plus par semaine, à environ 5 s chacun), le verdict passerait les 2 h vers le 9 novembre.

Non mesuré : ce que coûte le découpage en dix morceaux (dix lancements de WebKit) par rapport à un bloc.

## 3. La règle 7 (un seul verdict, le soir) n'est plus tenue

Règle 7 de PROTOCOLE.md, décidée le 11 oct. : les lots le jour, une seule release et un seul verdict le soir, le verdict pouvant tourner la nuit.

Mesuré : du 12 oct. au 2 nov., 38 releases sur 20 jours de travail ; 11 de ces jours en comptent deux ou plus. Les durées relevées confirment au moins deux verdicts complets en journée le 27 oct. et le 2 nov. (ce jour-là, 3 h 35 de Mac mobilisé).

Réserve : une release n'équivaut pas toujours à un verdict (deux releases peuvent partir dans un même push).

Cause non établie : mises en ligne immédiates demandées par Grégoire (exception 4 de la règle), ou glissement de la routine. À lui demander.

Réponse de Grégoire (2 nov., 20 h 45) : c'est lui qui les a demandées. Le travail porte sur l'annotation et l'évaluation, dont il se sert chaque jour ; il évalue sur iPad pendant que le Mac vérifie, constate à l'usage des problèmes d'ergonomie, revoit le fonctionnement de la grille algorithmique selon les rétroactions qu'elle produit, et on règle au fur et à mesure.

Lecture qui en découle (inférence de Cowork) : ce n'est pas une dérive, c'est un changement de mode. La règle 7 a été écrite pour un chantier ; on est en correction au fil de l'usage. Dans ce mode, le coût du verdict n'est plus le Mac immobilisé, c'est le délai, d'au moins 1 h 48, entre un correctif fini et son arrivée sur l'iPad.

## 4. La coordination a été multipliée par sept, les livraisons divisées par deux

Documents ajoutés à plans de travail/ par semaine :

| Semaine | Total | Consignes | Demandes de relecture | Verdicts de relecture | Releases |
|---|---|---|---|---|---|
| 31 août | 52 | 20 | 0 | 0 | 32 |
| 7 sept. | 74 | 41 | 0 | 0 | 30 |
| 14 sept. | 59 | 46 | 0 | 0 | 3 |
| 21 sept. | 120 | 52 | 23 | 0 | 29 |
| 28 sept. | 159 | 65 | 31 | 20 | 34 |
| 5 oct. | 90 | 29 | 24 | 3 | 30 |
| 12 oct. | 184 | 68 | 37 | 18 | 8 |
| 19 oct. | 438 | 86 | 70 | 62 | 15 |
| 26 oct. | 385 | 71 | 53 | 59 | 13 |

Du 19 oct. au 2 nov., le reste du total : 311 captures d'écran, 21 fichiers de textes, 18 ébauches, 12 portes terrain.

Inférence : la règle 2 réserve la relecture croisée à « ce qui ne se reprend pas » ; depuis la mi-octobre, on compte quatre à cinq demandes de relecture par release, souvent en plusieurs tours (retouche, retouche 2). La relecture s'applique désormais à presque chaque lot.

Vécu de Grégoire (2 nov., 20 h 49) : le travail de Claude Code lui semble plus long, notamment ce jour-là ; il est requis pour faire le relais avec Cowork et a l'impression de toujours attendre l'une des deux machines pour ne pas ralentir le rythme.

## 5. Les fichiers de lecture obligatoire ont grossi

CLAUDE.md prescrit de commencer TOUJOURS par OU-EN-EST-ON.md, puis CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md, OBJECTIF-COHORTE-1.md et PROTOCOLE.md.

| Fichier | 1er sept. | 2 nov. |
|---|---|---|
| OU-EN-EST-ON.md | 11 Ko | 528 Ko |
| CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md | 26 Ko | 73 Ko |
| PROTOCOLE.md | absent | 37 Ko |
| CLAUDE.md | 11 Ko | 12 Ko |

OU-EN-EST-ON.md était une page courte écrite pour Grégoire ; c'est devenu un journal (×48).

Inférence non mesurée : chaque session de Claude Code entame son contexte sur ces fichiers ; on ne sait pas combien il en lit réellement.

## 6. L'usage réel par d'autres que Grégoire

Source : les rapports hebdomadaires Cloudflare et lectorat, rangés hors du dépôt. Rien d'identifiant n'est recopié ici.

Fait : la semaine du 24 au 31 oct., 16 ouvertures de l'application par d'autres personnes que Grégoire, dont 3 séances de travail réel (d'une à deux heures et demie) ; les semaines précédentes, entre 14 et 27 ouvertures par d'autres, chiffres qui comptaient encore une partie du trafic de Grégoire avant la correction du 31 oct. Un seul établissement revient régulièrement (6 semaines sur 8). Au cégep de Grégoire, aucun usage autonome n'a jamais été observé.

Fait : aucun rapport de bug reçu de ces usagers ; un enseignant d'un autre cégep a écrit le 30 oct. pour demander le code source.

Limite de la source : les données de Labo Codex restent dans le navigateur de chaque usager. Cloudflare voit qui ouvre l'application, jamais ce qu'on y fait. La question « pour faire quoi ? » est hors de portée de ces rapports, quel que soit leur soin.

Inférence : la routine est dimensionnée pour parer les problèmes d'une foule d'usagers ; l'usage externe observé est de quelques séances par semaine.

## Ce qui n'a pas été mesuré

- La durée de codage d'un lot : aucun horodatage de début de lot dans le dépôt.
- Le nombre de sessions de Claude Code par jour.
- Le surcoût du découpage du verdict en morceaux.
