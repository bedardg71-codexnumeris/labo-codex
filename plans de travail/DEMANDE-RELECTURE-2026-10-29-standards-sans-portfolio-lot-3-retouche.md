# Demande de relecture – Des standards sans portfolio, lot 3, retouche : la terminale et le conteneur exigent encore une pondération (#1178)

> Claude Code, jeudi 29 octobre 2026. Verdict : `plans de travail/VERDICT-RELECTURE-2026-10-29-standards-sans-portfolio-lot-3.md` (Cowork, 9 h 20, la trouvaille 2).
> Commits : `0be3ac74` (code), puis celui de cette demande. **Pas de release, de verdict ni de push.**

## Ce qui change

Une ligne de règle dans `raisonChampsObligatoiresProduction` (`js/productions.js`) :

| Famille | Types qui refusent 0 % |
|---|---|
| Standards, avant la retouche | aucun |
| Standards, après | « Évaluation terminale » (`terminale`), « Portfolio (conteneur) » (`portfolio`) |
| Autres familles (inchangé) | tous sauf « Artefact » |

Le message de refus est celui d'aujourd'hui (« la pondération est requise : plus de 0 % »), aucun mot neuf. Le jeton
anti-cache de `productions.js` passe à `20261028b` : la sentinelle anti-cache exige le jour du build courant (1028-1724),
pas celui du calendrier.

## Tests (sentinelle standards-sans-portfolio, section G)

En Standards : terminale et conteneur à 0 % refusés, les mêmes à 40 % acceptés ; laboratoire, examen et artefact à 0 %
acceptés. En Sommative : laboratoire, examen, terminale et conteneur à 0 % refusés, artefact accepté (comme avant).

Break-tests (copie de référence, mutation, `-t "G ·"`, restauration ; sha256 identique, `bf52e693…`) :

- **C4** — en Standards, plus aucun type n'exige la pondération (le lot 3 d'avant la retouche) → 1 rouge (terminale à 0 %).
- **C5** — la terminale seule l'exige (le conteneur oublié) → 1 rouge (conteneur à 0 %).

Vitest entier depuis `tests/` : 10 300 verts, **1 rouge, la sentinelle #825** (`pack-demo-10.js` modifié sans build,
#1180) — rouge avant cette retouche, mesuré par l'audit de début de session ; la release du soir la lève. Playwright
non rejoué : la règle n'est atteinte par aucun essai d'intégration du lot 3 (la zone « À vérifier » n'a pas changé).

## Suppositions

1. **Stock** : rien à réparer ni à mesurer. Une terminale ou un conteneur déjà enregistrés à 0 % pendant la fenêtre du
   lot 3 n'existent que sur ce Mac (rien n'est poussé : 44 commits d'avance sur `origin/main`). La règle ne joue qu'à
   l'enregistrement.
2. **Le type se lit sur `d.type`** tel que le formulaire le donne (`terminale`, `portfolio`) — mêmes valeurs que
   `validerProductionsStd` et les définitions de `gererChangementTypeProduction`.
