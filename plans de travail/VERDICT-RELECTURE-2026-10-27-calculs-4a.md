# Verdict de relecture – Les calculs, lot 4a (étape 4 du plan du 21 oct.)

> Cowork, mardi 27 octobre 2026, 07 h 25 (Toronto, mesuré par `date`). Relu : `537dac28` (23 fichiers) et `3b5159de` ; la demande de relecture ; dans `evaluation-formules.js` l'évaluateur, le plafond, `assainirCasZero` et `refusCasZero` ; le schéma et la validation du partage ; dans `grilles.js` le rendu de l'étape « Note calculée » (chaque texte de l'enseignant·e et de l'application passe par `esc` ; les quatre interpolations nues de plus, comptées par la sentinelle #467, sont des fragments construits par le code) ; `miroir-algo.js`. `main` = `3b5159de`, non poussé.

## Verdict : accepté ; une retouche de mots, reportée au début du lot 4b

Une seule source calcule, dessine et chiffre les trois calculs ; aucune expression n'est interprétée ; l'équivalence est prouvée sur 5 040 cas, au niveau près, et le relevé du lot 3a reste vert. Ce qui s'enregistre garde ses clés.

## Les suppositions de la demande (§ 3)

1. **La note brute ramenée à la pondération, pas relevée à 0 : acceptée.** Pour les trois calculs, elle redonne exactement ce qui s'enregistrait (le rapport visé plafonnait déjà ; les deux pénalités ne dépassent jamais la pondération). Même règle au lot 4b pour un calcul composé.
2. **« Vaut 0 » veut dire « n'est pas positive » : acceptée**, c'est la règle d'avant.
3. **La phrase G3 retirée : acceptée.** L'ébauche validée ne la porte pas, et l'information vit encore dans l'aide contextuelle (`accompagnement-contenu-hover.js` l. ~360). Cette aide dit encore « par une formule » : à la refonte de l'Aide, qui remesurera.
4. **Les deux textes de Claude Code.** La phrase de l'Aide : acceptée. La mention du miroir : **retouche** (ci-dessous).
5. à 7. Acceptées. `compte`, qui vaut aujourd'hui le compte pondéré faute d'appelant : à brancher au lot 4b, où un calcul composé pourra le lire.

## La retouche (à faire en tête du lot 4b)

`miroir-algo.js` l. ~103 : « Sans projection, ces copies ont la longueur fixée dans le calcul : chaque X y coûte un point, quelle que soit cette longueur. » devient « Sans limite fixée, ces copies ont la longueur fixée dans le calcul : à cette longueur, chaque X coûte un point. » (« projection » ne se dit plus à l'écran depuis le lot 3a ; « quelle que soit cette longueur » se lisait comme une contradiction). Si la condition de cette phrase n'est pas « aucune limite fixée », garde « Sans projection » et dis-le.

## La mesure du piège 2 : remontée à Grégoire

Vrai en base, faux à l'écran : une copie **verrouillée** rouverte après un changement de calcul montre la note recalculée (85) alors que la base, et l'étudiant·e, ont 70 ; déverrouillée, elle s'enregistre à 85 au premier geste. Comportement antérieur au lot. Il touche ce que veut dire une note remise : **la décision revient à Grégoire**. La phrase sous les cartes reste absente d'ici là, à raison.
