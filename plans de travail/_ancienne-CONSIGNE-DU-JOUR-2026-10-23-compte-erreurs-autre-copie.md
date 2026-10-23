# Consigne du jour – URGENT : le compte d'erreurs d'une copie écrit dans l'évaluation d'une autre (vendredi 23 octobre 2026)

> Écrite par Cowork le vendredi 23 octobre 2026 à 8 h 24 (Toronto, mesuré par `date`), sur `main` à `53cb39b8` (étape 2b relue, non poussée ; 1.215.0 en ligne). Elle remplace la consigne des retouches de la palette (21 h 51), exécutée, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-22-critere-algorithmique-palette-retouches.md`. **Retour testeur vécu, des PDF déjà remis aux élèves : il passe avant tout le reste** (`CLAUDE.md`). Feu vert de Grégoire à 8 h 23. Contexte des autres constats du matin : `RETOURS-2026-10-23-matin.md` (son § 1 est **périmé** par cette consigne : le diagnostic y était inversé).
> ⛔ Aucun nom d'élève dans le code, les bancs, les rapports, les fichiers de `plans de travail/`. Désigne une copie par son identifiant d'évaluation ou ses nombres.

## 1. Le symptôme, vécu et mesuré

- **Vécu (Grégoire, 8 h 20, PDF refait d'une copie de l'Artefact 4)** : la ligne du calcul de Français écrit dit « 11 erreurs sur 600 mots → 9,00/20 (45,0 %) » ; la phrase dit « Ta rédaction contient 1 erreur », le niveau est E, l'encadré des catégories dit « / 1 erreur », et la note de la copie est juste. L'élève a fait 1 erreur.
- **Mesuré par Cowork, en lecture seule** dans ses données (Chrome, onglet sur `version.json` du domaine ; rien d'exécuté de l'application, rien d'écrit) : dans **21 copies sur 24** de l'Artefact 4, `donneesAlgorithmiques[<id du critère>].erreurs` (et donc `noteCalculee`, `pourcentage`, `niveau`, `retroaction` du même objet) diffère du compte de la phrase enregistrée du critère (`criteres[].retroaction`). Le niveau du critère, la phrase et `noteFinale` restent cohérents avec le **vrai** compte.
- **Motif mesuré, dans l'ordre du tableau des évaluations** : le compte enregistré d'une copie est le compte (dans la phrase) de la copie **suivante**. Exemple : `EVAL_1792501466724_19_ed0ced2f73ca` (800 mots) portait 26 à 6 h 52 (vrai, conforme à ses annotations) et porte 2 depuis 6 h 57, heure où Grégoire l'a déverrouillée, a coché « Note chiffrée », l'a reverrouillée, puis est passé à la suivante. Quatre copies étaient déjà discordantes à 6 h 52, donc **avant** ce passage : le défaut ne date pas de ce matin.

## 2. L'hypothèse de Cowork (à reproduire, pas à croire)

Dans Annoter › Évaluer, `mettreAJourCompteursErreurs` (`travaux-outils.js` l. 2508), sur `travaux-annotation-modifiee`, pose le total des codes de la copie **affichée** dans le champ partagé `eval_erreurs_<critère>` et déclenche `input` ; le calcul (`evaluation-calcul.js`) l'écrit alors dans `evaluationEnCours.donneesAlgorithmiques`, puis l'enregistrement automatique part. Pendant la bascule d'une copie à l'autre (asynchrone, déjà décrite par #671 et #700), l'évaluation courante peut encore être la **précédente** : elle reçoit le compte de la suivante. La phrase, elle, n'est pas réécrite (même niveau, règle #939), d'où la discordance. ⚠ Cherche aussi pourquoi `noteFinale` n'a pas suivi : si un autre geste la recalcule depuis `donneesAlgorithmiques`, la note elle-même deviendrait fausse.

## 3. Le mandat

1. **Reproduire d'abord**, dans un banc WebKit : deux copies d'une même production, des comptes de codes différents, le geste de Grégoire (ouvrir la première, enregistrer, passer à la seconde) ; montrer que l'évaluation de la première reçoit le compte de la seconde. Sans reproduction, ne rien corriger : rapporter ce qui a été essayé.
2. **Tarir la source** : un compte venu des annotations ne s'écrit que dans l'évaluation **de la copie dont viennent ces annotations** (même élève, même production) ; pendant une bascule, rien ne s'écrit. Garde sur l'écriture, pas seulement sur l'affichage.
3. **Mesurer le stock, sans rien écrire** : une fonction de l'application, appelable à la console de l'onglet de Grégoire (sur le modèle de `Codex.purgerEspacePrecedent()`), qui rend pour le **trimestre actif seulement** la liste des copies dont `donneesAlgorithmiques` contredit les autres sources : compte enregistré ; compte de la phrase ; total des codes posés sur la copie (annotations) ; niveau du critère ; `noteFinale` et ce qu'elle redonne. Pour chaque copie : la valeur proposée, et pourquoi (les sources qui s'accordent). Une copie où les sources ne s'accordent pas est **listée sans proposition** : elle reviendra à Grégoire. ⛔ Ni A2025 ni H2026 (décision du 1er sept. : ces notes ne sont pas rouvertes).
4. **La réparation, écrite mais pas lancée** : la même fonction, avec un paramètre explicite, réécrit `donneesAlgorithmiques` (compte, note calculée, pourcentage, niveau, phrase) **des seules copies proposées**, par le calcul de l'application (`formulesAlgo`), sans toucher à `criteres`, `noteFinale`, ni au verrou ; un codex est exigé avant. **Elle ne tourne que sur l'accord de Grégoire**, après qu'il a vu la liste (écrire dans ses données lui revient).
5. Ce qui se refait ensuite (les PDF) est le geste de Grégoire.

## 4. Les tests

- Le banc de reproduction rougit avant le correctif, verdit après (break-test : la garde retirée le rougit).
- La mesure du stock : un faux trimestre avec des copies saines, des copies décalées et une copie ambiguë ; elle rend exactement les décalées avec leur valeur, l'ambiguë sans proposition, et n'écrit rien (sentinelle).
- La réparation : elle n'écrit que `donneesAlgorithmiques` des copies proposées ; `criteres`, `noteFinale`, verrou et autres clés intacts (sentinelle) ; refus sans le paramètre.
- Vitest depuis `tests/`, puis les specs WebKit d'Annoter, de l'évaluation et du critère algorithmique. **Pas de verdict complet** : il se prend à la release, au signal de Grégoire, avec l'étape 2b.

## 5. Clôture

- Commit sur `main`, non poussé, fichiers nommés un par un ; demande de relecture `DEMANDE-RELECTURE-2026-10-23-compte-erreurs-autre-copie.md`. **Relecture croisée obligatoire** (règle 2 : une écriture dans les données réelles).
- Dis en une phrase d'utilisateur comment Grégoire lance la mesure, et ce qu'il verra.
- Toute trouvaille hors du lot : les trois issues de `CLAUDE.md`.
