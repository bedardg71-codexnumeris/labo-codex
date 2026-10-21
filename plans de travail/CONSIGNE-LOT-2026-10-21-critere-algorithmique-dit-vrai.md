# Consigne – Le critère algorithmique fait ce que son écran dit : le poids des erreurs, les libellés, les collections (#1131 et suites)

> Écrite par Cowork le mercredi 21 octobre 2026 à 8 h 40 (Toronto, mesuré par `date`), sur `main` à `2dca7240` (non poussé, relu et accepté). Mesure : `MESURE-2026-10-21-critere-algorithmique.md` (lis-la d'abord ; les numéros ci-dessous sont les siens). Décisions de Grégoire : 8 h 38 et 8 h 39. Ce lot précède la page « critères algorithmiques » du guide, qui attend qu'il soit fait.

## Les décisions de Grégoire

- **8 h 38, constat 4** : « le poids des erreurs devrait être ajustable. C'est souvent le cas de la ponctuation, même si ce n'est pas ma pratique. » ⮕ Le poids d'un sous-critère s'applique aux codes posés sur la copie : la formule reçoit la **somme pondérée** des codes. Un sous-critère de poids 0 reste hors des codes, comme aujourd'hui.
- **8 h 39, ce que l'élève lit** : quand la somme pondérée diffère du nombre d'erreurs, l'élève lit les deux, mot pour mot : « 5 erreurs (3,5 une fois pondérées) ». Virgule décimale ; « pondérée » au singulier sous 2 (« 1,5 une fois pondérée »), comme la règle C1. Quand tous les poids valent 1 (ses deux grilles réelles), **rien ne change** dans ce que l'élève lit.

## Ce qu'il faut

1. **Le poids des codes posés** (constat 4) : `mettreAJourCompteursErreurs` (`travaux-outils.js`, l. 2455-2510) verse aujourd'hui le total brut. Le calcul doit recevoir la somme pondérée par les poids des sous-critères du critère ; le nombre d'erreurs (brut) reste connu pour ce que l'élève lit. Où porter les deux valeurs (champ, évaluation enregistrée) : à toi, en suivant le modèle du mode Catégories (`_calculerScoreAlgoCategories`, `evaluation-calcul.js` l. 548) plutôt qu'en en créant un second. Une saisie manuelle de « Nombre d'erreurs », sans code posé, reste un nombre brut.
2. **Ce que l'élève lit** : la phrase du décompte (carte « Ce que l'élève lit ») et la ligne du PDF (« N erreurs sur M mots → X/P », `synthese-retroaction-rendu.js` l. 369-381) disent « 5 erreurs (3,5 une fois pondérées) » quand les deux nombres diffèrent. La phrase du décompte est un modèle que l'enseignant écrit avec des badges : propose la façon la plus robuste d'y placer la parenthèse, décris-la dans la demande avec deux exemples rendus.
3. **Le stock** : une évaluation déjà enregistrée garde sa note. Mesure si rouvrir une copie déjà évaluée recalcule avec les poids (`_forcerRecalculAlgorithmiqueAvantSauvegarde`) ; si oui, dis-le, avec le compte des évaluations de l'automne que ça toucherait **dans une base où un poids diffère de 1** (chez Grégoire : aucun, ses poids valent tous 1). ⛔ Ne rouvre pas A2025 ni H2026.
4. **Les libellés figés** (constat 7) : « (30%) » sur une grille en points dit les points ; « Niveau IDME » dit le nom de l'échelle de l'évaluation, ou « Niveau » sans échelle (`evaluation-chargement.js`, l. 1101 et 1132). Aucun mot neuf : ceux qui existent déjà ailleurs dans l'application.
5. **« Mes collections »** (constat 11, constat de Grégoire de 8 h 31) : la liste de toutes les collections sous le menu de projection prend le titre « Mes collections », celui du menu, et une place qui ne se lit plus comme une propriété du critère (`grilles.js`, l. 3918-3923).
6. **Les sous-critères d'un critère algorithmique en création** (#1131, constat 9) : avec la cible `temp` posée hier, comme pour les autres types. Le message « Les sous-critères se définissent une fois la grille enregistrée » part.
7. **Inscrire et continuer** : constat 8 (deux critères algorithmiques, seul le premier reçoit le total des codes) ; le mode Catégories sans écran (constat 5), avec ce que la décision 4 en fait (redondant ou non) : mesure, ne retire rien.

## Ce qui ne fait PAS partie de ce lot

Les textes d'aide (constats 1, 2, 3, 12) et le texte par défaut lu par l'élève (constat 6) : Cowork les rédige pour Grégoire pendant ce lot ; un lot de mots suivra. N'y touche pas, sauf ce que le point 2 exige.

## Les bancs

- **Vitest** : la somme pondérée (poids 0,5 et 1, un poids 0 hors code) ; le nombre brut gardé ; la parenthèse présente quand les nombres diffèrent, absente quand tous les poids valent 1 ; singulier sous 2 ; les libellés du point 4 ; le titre « Mes collections ».
- **WebKit** : une grille de démo à deux poids (1 et 0,5), des codes posés dans Annoter → la note suit la somme pondérée, le PDF dit « N erreurs (X une fois pondérées) sur M mots » ; la même avec des poids à 1 → phrase et PDF identiques à aujourd'hui, à l'octet près. Un critère algorithmique en création reçoit ses sous-critères.
- **Break-test** : total brut remis → rouge ; parenthèse toujours affichée → rouge. Code restauré.
- Vitest complet vert ; specs de l'évaluation, d'Annoter, du PDF et de Grilles touchées vertes en WebKit. Le verdict complet tourne ce soir, au signal de Grégoire.

## Ce qu'il ne faut pas

- Changer une note déjà enregistrée, rouvrir A2025 ou H2026.
- Retirer le mode Catégories.
- Le verdict complet, un numéro de version, le push.

## Livrer

Un commit sur `main`, non poussé, avec : cette consigne, la mesure, le verdict `VERDICT-RELECTURE-2026-10-21-grille-neuve-sous-criteres-bareme.md` (non suivi), le correctif, les bancs, les inscriptions, des captures (phrase et PDF, deux exemples), et la demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-21-critere-algorithmique-dit-vrai.md`. Par leur chemin, jamais `git add -A`. Lance `/fin-de-session` avant le commit, sans le verdict complet. **Puis arrête-toi.**
