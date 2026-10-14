# Observation, temps 4 : préparation de la lecture

*14 octobre 2026. Session de préparation (la même qu'au temps 2). Elle prépare ; elle n'analyse rien. Cadrage : `plans de travail/CADRAGE-2026-10-12-observer-ce-que-fait-l-application.md`, section « Temps 4 : déduire la finalité ».*

## 1. Version retenue

**`observation.md` au commit `eac065e`** du dépôt `programme-a-observer` (branche `claude/exciting-cerf-7kv2om`, 14 octobre 2026, 13 h 37 UTC), empreinte git du fichier `e63b8e7`.

Ce qui l'établit (mesuré) :

1. **C'est la dernière version de son auteur.** Les 20 commits de la branche (de `f3c52da`, 13 octobre 20 h 49 UTC, à `eac065e`) portent tous la même session Claude Code. Aucun commit ne suit `eac065e`, sur aucune branche du dépôt. `main` ne contient pas `observation.md`.
2. **C'est elle qui a été copiée, sans retouche.** `plans de travail/observation/2-observation-aveugle.md` (commit `95f857e0`, 13 h 38 UTC) a la même empreinte `e63b8e7`, donc un contenu identique octet pour octet. Le fichier n'a qu'un commit dans son historique ; il est inchangé dans `main` (`8cea5da9`).
3. **Elle précède la comparaison et les correctifs.** Le temps 3 (`9caefeb4`, 14 h 51 UTC) et les dispositions (`8cea5da9`, 15 h 44 UTC) viennent après, et aucun des deux ne touche ce fichier.

Ce que je ne peux pas établir : que la session qui a écrit `eac065e` était bien l'analyste aveugle. Mesure : cette session est introuvable depuis le compte claude.ai de Grégoire (`get_session` : « not found »). C'est compatible avec un compte séparé, comme le recommandait `0-preparation.md` §6, mais ce n'est pas une preuve. Grégoire seul sait sur quel compte il l'a ouverte.

## 2. Nettoyage

**Retraits : aucun.** `lecture/observation.md` est identique octet pour octet à la version retenue (empreinte `e63b8e7`).

Indices cherchés, et ce que chaque occurrence s'est révélée être :

| Indice | Occurrences | Verdict |
|---|---|---|
| renvoi aux intentions ou à la comparaison (« intention », « scellé », « temps 1 », « temps 3 », noms des fichiers `1-…`, `3-…`, BACKLOG, RELAIS, CLAUDE, Cowork) | 1 (« intention ») | l. 3 : l'analyste déclare que le document « ne dit rien de l'intention de ses auteur·es ». Aucun renvoi. |
| « écart » | 5 | textes du programme (« lignes écartées », « absence écartée », ressources « démo » écartées) et « écart-type » |
| « cadrage » | 2 | « recadrage » d'image |
| « prévu » | 4 | trois textes d'écran (« Congé prévu », « Évaluations prévues : 5 », « … : 9 ») ; l. 706, un mot de l'analyste (« Toast prévu […] non obtenu » : une notification présente dans le code, non obtenue à l'exécution). Gardé : il vient de la lecture du code, pas des intentions. |
| « censé » | 0 | |
| « bogue », « bug » | 1 et 25 | le module de rapport de bug du programme (« Signaler un bug », `rapport-bug.js`) ; l. 355, une alerte du programme citée mot pour mot (`js/cours.js:348`), qui nomme « le mécanisme du bug des productions inaccessibles d'août ». Gardée : c'est une sortie du programme. |
| « correctif » ; « corrig… » | 0 ; 6 | le bouton « Corriger le DA… » et ses boîtes de dialogue ; « double encodage corrigé » (comportement de `js/db.js`) |
| numéros de fiche | 6 | tous dans des chaînes ou des clés du code : messages console `[DB][GARDE #340]` et `[DB #353]`, clé `planification_seances_archive_pre367`, message `[moisson #424]` (`js/main.js:307`). Gardés : ce sont des sorties du programme. |
| « devrait », « attendu » | 3 | messages du programme (validation des dates du calendrier, erreur d'import, confirmation de suppression) |
| annotations ajoutées après coup | 0 | aucune autre main que celle de l'analyste (§1) ; toutes les sections sont les siennes, y compris « État de ce document » et « Ce qui n'a pas pu être observé ». |

**Données réelles d'élèves : aucune.** Les élèves cités sont fictifs, créés pendant l'observation (« Fictif-Alpha » à « Fictif-Delta », « Fictif-Echo » ; DA 1111111 à 4444444, 9394249, 9999001 à 9999011). Les pseudonymes du pack de démonstration n'y figurent pas. Le seul vrai nom de personne est celui de l'auteur de l'application, tel que le programme l'affiche dans les crédits d'une ressource de bibliothèque (l. 631 et 2508) : ce n'est pas un élève. Courriels : l'adresse de contact du programme et une adresse fictive en `.invalid`.

Limite du nettoyage : les sorties du programme citées dans l'observation portent des traces de l'histoire du projet (numéros de fiche, « bug des productions inaccessibles d'août »). Elles restent, puisque ce sont des sorties ; le cadrage le prévoit déjà pour les textes d'écran.

## 3. Paquet de lecture

- Dépôt `programme-a-observer`, branche `main`, **commit `eac8696`** (« lecture : observation et consigne »), posé sur `3cf5f87` (le `main` de GitHub). `3cf5f87` reprend le commit initial et y ajoute `.claude/settings.json`, qui refuse `WebSearch`, `WebFetch`, `mcp__github`, `mcp__claude-code-remote` et `mcp__Claude_Docs`.
- `lecture/observation.md` : la version retenue, sans retrait.
- `lecture/CONSIGNE.md` : le texte de Grégoire, tel quel.
- La branche de l'analyste (`claude/exciting-cerf-7kv2om`, `observation.md` à la racine) reste sur GitHub. Les sessions du temps 4 partent de `main`, qui ne la contient pas ; son contenu est de toute façon identique.
- Remis à Grégoire sous forme d'un paquet git (`programme-a-observer-lecture.bundle`, 3,6 Mo), puisque la copie vit dans le conteneur de la session. La commande de poussée est éprouvée sur une simulation (dépôt distant factice à `3cf5f87`) : après elle, le distant porte `eac8696`.

```sh
cd ~/programme-a-observer && git fetch ~/Downloads/programme-a-observer-lecture.bundle main && git push origin FETCH_HEAD:main && git pull --ff-only
```

## 4. Version de l'application que décrit l'observation

**Labo Codex 1.199.0, build 1011-1808, publiée le 11 octobre 2026 à 18 h 08** (heure de Toronto ; commit `039b523d` du dépôt principal). C'est la version que nomme le titre de l'observation, et celle de la copie : aucun fichier de l'application n'a changé entre `039b523d` et `b709f2a`, base de la copie (mesuré). L'observation a été faite les 13 et 14 octobre 2026, avec une date système fixée au 2026-10-13.

**La finalité déduite au temps 4 sera celle de cette version**, pas celle des versions suivantes.

## 5. Limites

- L'observation cite le code (fichier:ligne) et le dépôt contient le code. Seule la consigne empêche les lecteurs de l'ouvrir ; aucune barrière technique ne le fait.
- Les limites de l'observation elle-même passent au temps 4 : sa section « Ce qui n'a pas pu être observé » dit ce qu'elle n'a pas vu.
- L'isolement des deux lecteurs repose sur la recette de `0-preparation.md` §6 : elle n'est garantie que sur un compte claude.ai séparé.
