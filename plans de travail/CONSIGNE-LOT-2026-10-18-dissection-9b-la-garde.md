# Consigne – la dissection, lot 9b : la garde de la note, pour les critères marqués « à compléter »

> Écrite par Cowork le dimanche 18 octobre 2026 à 18 h 33 (Toronto, mesuré par `date`). Suite du lot 9 (`cb73e818`), relu : `VERDICT-RELECTURE-2026-10-18-dissection-9-creer-quand-meme.md`. **Décision de Grégoire, 18 h 32** : la garde ne vise que les critères marqués au moment où l'absence est écrite, à partir de maintenant ; les grilles existantes ne changent pas. Règles 2 et 7 de `PROTOCOLE.md`. Le temps B de la 1.206.0 attend toujours : un seul verdict ce soir.

## Ce que l'enseignant fait à la fin de ce lot

Il crée par la dissection une grille dont un critère n'a pas de points, ou il vide le champ « Points » d'un critère dans Grilles de critères. S'il évalue une copie avec cette grille avant de saisir les points, la note affiche « -- ». Il saisit les points : la note se calcule. Ses évaluations déjà faites avec ses grilles d'avant ne bougent pas.

## Ce qu'il faut

1. **La marque**, sur le critère (nom et forme à toi ; un booléen suffit) : posée **(a)** par la création de la dissection, pour chaque critère sans pondération ; **(b)** par Grilles de critères quand le champ « Points » est vidé (`modifierCritereTempHandler` et `modifierCritereGrilleHandler`), qui écrivent alors `null` et non plus NaN. **Retirée** quand une pondération valide est saisie (mêmes chemins). Aucun autre chemin ne la pose ; aucun code ne la pose sur une grille existante.
2. **La garde** : `calculerPortee` range un critère **marqué** parmi les critères hors note (motif à part) ; l'évaluation est incomplète, la note affiche « -- », exactement comme la garde existante (écran, export, PDF), ni plus ni moins. **Un critère non marqué garde le comportement d'aujourd'hui**, absent ou non ; un critère à 0, aussi.
3. **Le stock, écrit** : un commentaire à `calculerPortee` et une ligne dans la demande disent qu'un critère ancien sans pondération (non marqué) est calculé comme avant, par décision de Grégoire (18 oct., 18 h 32).
4. **La marque voyage** avec le critère (duplication, partage vers les grilles actives, export et import, codex) ; là où un chemin ramène `null` à 0, la marque reste, et la garde s'applique encore : mesure-le et dis-le.
5. **La confirmation** de la dissection redit, au conditionnel s'il le faut, que la note d'une copie affichera « -- » tant que les points manquent (texte provisoire).
6. **Les bancs.** Vitest : `calculerPortee` (marqué → hors note et incomplète ; non marqué et absent → comme avant ; 0 → comme avant) ; les deux gestionnaires (vidé → `null` + marque ; nombre saisi → marque retirée) ; la création de la dissection (marque posée) ; l'aller-retour export-import ou codex (la marque survit). WebKit : la spec du lot 9 prolongée jusqu'à la note « -- » si l'écran d'évaluation s'y prête ; sinon, dis pourquoi et garde le calcul en Vitest. Break-tests : la garde qui ignore la marque ; le gestionnaire qui ne pose pas la marque.

## Les textes

Neufs et provisoires (la confirmation, le motif s'il s'affiche) : ajoute-les à la liste de la demande du lot 9.

## Ce qu'il ne faut pas

- Poser la marque sur une grille existante, ou changer ce qu'affiche une note déjà remise.
- Corriger la « Grille de base » de l'assistant (inscrite au BACKLOG, verdict du lot 9).
- Un numéro de version.

## Livrer

Un commit sur `main` (avec le verdict du lot 9, cette consigne, la consigne du jour et son archive, l'inscription au BACKLOG) ; Vitest complet vert ; `materiel-*` et les specs touchées (Grilles de critères, évaluation) vertes dans WebKit ; la demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-18-dissection-9b-la-garde.md`. **Puis arrête-toi.**
