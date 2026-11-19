# Consigne de nuit, 19 au 20 nov. 2026 (session B), lot 1 : le glisser d'Alignement (#1295)

Remise par Grégoire, relayée de Cowork, au début de la session de nuit B. Le mandat porte trois lots à la suite ; ce fichier n'en garde que le premier, tel qu'il a été reçu.

État de départ. `origin/main` = `ade09e939`, version 1.250.0, en ligne (mesuré par Cowork à 16 h 35).

LOT 1, LE GLISSER D'ALIGNEMENT (#1295). Branche `lot/glisser-alignement` depuis `origin/main`. Le symptôme : dans Conception › Alignement, glisser une activité dans une leçon peut rater sa cible, le lâcher tombant un peu plus bas que la souris ou le doigt. Ce qui a été mesuré le 19 nov. par la session de la 1.250.0 : le banc `parcours-5` « Monter ton cours » (1180 px, l. 334) est rouge 5 fois sur 5 sur `8449f25cc` (1.249.0) comme sur les commits du jour, vert 6 fois sur 6 sur `1661ade8c` (1.244.0) ; l'activité s'arrête 34 px sous la leçon ; avec des mouvements espacés de 40 ms, l'étape 5 passe et l'étape 6, même glisser, rougit ensuite. La cause avancée, à VÉRIFIER avant de corriger, pas à tenir pour acquise : `throttleRAF` (`js/planification-carte.js`) garde le premier mouvement de chaque image et jette les suivants, et le relâchement ne relit pas sa propre position. Ce qui est demandé :

1. reproduire, puis confirmer ou infirmer la cause, et le dire ;
2. la correction au relâchement, pour que le lâcher prenne la position réelle du pointeur ;
3. la même revue pour les autres usages de `throttleRAF`, le « Planificateur » compris, à la souris comme au doigt ;
4. la date de la régression, par bissection entre `1661ade8c` et `8449f25cc` ;
5. source ou stock (CLAUDE.md, « tarir n'est pas réparer ») : une activité déjà mal déposée chez quelqu'un reste-t-elle mal rangée, et si oui, mesure et propose sans rien réparer d'office ;
6. un banc neuf avec break-test, et `parcours-5` sorti des échecs connus s'il redevient vert de façon stable (rejoue-le au moins six fois) ;
7. une ligne de Nouvelles PROPOSÉE au rapport, en mots d'utilisateur, sans rien écrire au changelog.

Vitest complet lancé DEPUIS `tests/` ; Playwright Chromium sur les fichiers liés, 1180 × 820 et 820 × 1180 ; WebKit par GitHub au push. Rapport `plans de travail/RAPPORT-2026-11-19-glisser-alignement.md`, commit, push, PR d'aperçu titrée « APERÇU, ne pas fusionner ».

Règles de la nuit qui touchent ce lot. Si le lot ne trouve pas de correction sûre, les lots 2 et 3 se font quand même. Par lot, dans l'ordre : la consigne écrite dans le dépôt d'abord, les mesures préalables et leur résultat au rapport, le code, les bancs avec break-test, les tests, la porte terrain en markdown, le rapport, le commit, le push, la PR d'aperçu. Aucune fusion vers `main`, aucune release, aucun bump de version, aucune écriture au changelog. Une trouvaille hors lot s'inscrit et la session continue (issue 2 de CLAUDE.md).
