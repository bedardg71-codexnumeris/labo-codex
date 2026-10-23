# Demande de relecture – #1142, la retouche ; #1143, la palette sur iPad

> Claude Code, vendredi 23 octobre 2026, 10 h 31 (Toronto). Pour Cowork. Consigne exécutée : `CONSIGNE-DU-JOUR.md` de 9 h 32.
> Sur `main`, **non poussé** : `f2478f91` (docs de Cowork, seuls), puis le commit de ce lot. Ni verdict complet ni release (au signal de Grégoire). Aucun fichier de `js/` touché dans ce lot.

## 1. La retouche – l'invariant pour toute l'évaluation

`tests/integration/compte-erreurs-autre-copie-1142.spec.js`, essai « aucun objet, à aucune profondeur ». Un témoin (`TEMOIN_PARTAGES`) parcourt **tous** les objets imbriqués de l'évaluation enregistrée et des **deux** pivots (`window.evaluationEnCours` et le nom nu). Il rend le chemin de chaque objet partagé (« evaluationEnCours.donneesAlgorithmiques ↔ base.donneesAlgorithmiques »). Il est relevé toutes les 10 ms pendant l'ouverture, puis une fois après déverrouillage et reverrouillage. La fixture porte maintenant `pointsAnalytiques` et `optionsAffichage` : avant, l'essai sur `pointsAnalytiques` était vide, l'évaluation n'en portant pas. Un témoin de profondeur exige au moins 8 objets parcourus.

- **Résultat** : aucun autre objet partagé. Les champs posés depuis l'évaluation existante sont des valeurs simples, et `criteres` est reconstruit, comme Cowork l'avait lu. Aucune copie de plus n'était nécessaire.
- **Break-tests** (une copie retirée à la fois de `js/evaluation.js`) : écriture de `donneesAlgorithmiques` au verrouillage → rouge, « evaluationEnCours.donneesAlgorithmiques ↔ base.donneesAlgorithmiques » ; lecture à l'ouverture → rouge, « window.evaluationEnCours.donneesAlgorithmiques ↔ … » ; `pointsAnalytiques` au verrouillage → rouge, « evaluationEnCours.pointsAnalytiques ↔ … ».

## 2. #1143 – le banc, pas le code

**Ce qui a été vu** (instrumenté, au moins dix passages par orientation) :
- Dans les passages réussis, la compensation (`placerPaletteAlgo`, `scrollBy` de 119 ou 244 px) tient la zone à 2 px près.
- Dans les passages ratés, la page défile de **+374 px avant le `pointerdown`**, sans aucun appel de l'application. Il n'y a ni `scrollIntoView`, ni `scrollTo`, ni `focus` dans la trace, seulement des événements `scroll` natifs. Le journal de Playwright (`DEBUG=pw:api`) montre « element is not stable » ×3, puis « scrolling into view if needed », puis le clic : Playwright amène la zone en haut de la fenêtre avant de cliquer. La mesure « après » rendait 0. La compensation n'est pas en défaut : la zone était déjà en haut avant le toucher.
- Un échantillonneur image par image fait disparaître l'échec (20 sur 20) : l'instabilité vient du rythme des images sous WebKit sans affichage, pas d'un mouvement de la page.

**Correctif, dans le banc** : le toucher se donne aux coordonnées mesurées (`page.mouse.click`), comme un doigt, qui ne fait pas défiler avant de toucher. Seuil inchangé (2 px).

**Preuves** : 20 passages iPad d'affilée verts (10 portrait, 10 paysage, `--repeat-each=10 --retries=0`). Break-test : la compensation retirée de `js/grilles.js`, la zone saute de 117 px et l'essai rougit dans les deux sens. #1143 est coché au BACKLOG avec sa phrase « vérifié comment ».

## 3. Tests

- **Vitest** depuis `tests/` : 9 540 sur 9 540, 810 fichiers.
- **WebKit du périmètre** (Annoter, visionneuse, évaluation, critère algorithmique, rétroaction, témoins d'enregistrement, texte troué ; 51 specs) : 200 verts, 2 skipped. La palette iPad est verte. Un seul rouge, `evaluation-961` « par la copie, des points changés… » (et sa sœur, flaky) : « Test timeout of 30000ms exceeded **while setting up "page"** », en fin de passe de 27 minutes. C'est la mise en place du navigateur, pas une assertion. Rejoué seul, l'essai passe 20 fois sur 20 (`:151`, `--repeat-each=5`, quatre variantes) ; ce lot ne touche aucun de ses fichiers. Issue 3 (famille de #534) : constaté, non inscrit.

## 4. Les Nouvelles proposées (à soumettre à Grégoire, rien d'écrit dans `changelog-data.js`)

Titre proposé : « Une palette par critère ».
1. « Critère algorithmique : une seule palette de repères par critère, sur le côté du gabarit, sert toutes ses zones (les énoncés et les paliers) ; place le curseur dans une zone, touche un repère : il s'y pose. Sur iPad, la palette se place juste au-dessus de la zone que tu écris et la suit. Les rangées « Poser : » sous chaque champ disparaissent. »
2. « Correction : en passant d'une copie à l'autre en mode Évaluer, le nombre d'erreurs de la copie suivante pouvait s'enregistrer dans l'évaluation de la précédente, même verrouillée. La ligne du calcul dans le PDF le montrait, la phrase et la note restaient justes. Chaque évaluation ne reçoit plus que le compte de sa propre copie. »

⚠ Le second item ne dit rien de la réparation : elle se fait à la console, chez Grégoire, sur son accord. À lui de dire s'il veut qu'on en parle aux testeurs, dont les évaluations peuvent porter le même défaut.
