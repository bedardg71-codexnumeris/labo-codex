# Verdict de relecture – Le critère algorithmique, étape 1 : le miroir

> Cowork, jeudi 22 octobre 2026, 7 h 40 (Toronto). Relu : `ca0e87c8` (non poussé), par ses fichiers lus sur le Mac et comparés à `941c2491` (dépôt public) : `js/miroir-algo.js` (neuf), `js/grilles.js`, `js/codes-annotation.js`, `js/travaux-outils.js`, `index.html` ; la demande `DEMANDE-RELECTURE-2026-10-21-critere-algorithmique-miroir.md` ; les deux captures. Le shell du Mac était indisponible : aucun banc rejoué par Cowork, les verts sont ceux que Claude Code rapporte.

## Verdict : accepté, avec trois retouches avant la version

Le lot fait ce que la consigne demande. Vérifié :

- **Un seul calcul.** `miroir-algo.js` n'a aucune formule : la note sort de `formulesAlgo.calculer`, la phrase de `enoncesAlgo.enonce` et `mentionPonderee`, la projection de `projectionAlgo.calculer`. La note affichée est `pctBorne`, comme à l'évaluation.
- **Les nombres des captures, recomptés à la main.** Français, normalisée, facteur 500, projection à 900 mots, pondération 30 : 14 erreurs donnent 30 − 14 × 500 ÷ 900 = 22,22, soit « 22,2/30 (74,1 %) » ; 54 erreurs donnent exactement 0. Chimie, pondération 20 : 3 × 1,5 + 2 × 0,5 = 5,5, et 20 − 5,5 = « 14,5/20 (72,5 %) ». Justes.
- **La somme pondérée réunie.** `sommePonderee` garde le comportement d'avant : `code()` ne rend jamais `null` (repli à poids 1), l'arrondi au dix-millième est conservé. Le repli de `sommePondereeErreurs` sans le module (somme brute) est sans conséquence : le module est toujours chargé avant.
- **Sécurité.** Tout passe par `echapperHtml`, y compris `data-copie` et l'index ; aucun handler ; aucun `console.log` ; aucune zone protégée.
- **Lecture seule.** Rien n'écrit dans le critère ni ailleurs.

## La règle des copies : acceptée

La priorité de la projection sur le facteur est juste, et la raison va plus loin que la demande ne le dit : **toute** longueur tirée du seul facteur (le facteur, sa moitié, son double) rend la note indépendante du facteur, puisque la pénalité ne dépend que du rapport longueur ÷ facteur. Sans projection, aucune copie tirée des réglages ne peut donc montrer l'effet du facteur. Ce n'est pas un défaut de la règle, c'est la formule.

Le risque est ailleurs : sur un critère neuf, l'enseignant change le facteur, aucune note ne bouge, et il conclut que le facteur ne sert à rien. C'est la première retouche.

## Les trois retouches (décidées par Cowork, mots de l'enseignant)

1. **Dire pourquoi le facteur ne bouge rien, quand c'est le cas.** Quand l'étendue vient du facteur (pas de projection), une ligne sous l'introduction, par `libelles()` : « Sans projection, ces copies ont la longueur du facteur : chaque erreur y coûte un point, quel que soit le facteur. » Un banc : elle paraît sans projection, pas avec.
2. **« le miroir » est un nom de travail.** `sansPonderation` : « Donne une pondération à ce critère : l'essai montrera la note de chaque copie. »
3. **Le tiret.** « 0/30 (0 %) — la note touche le plancher » : le tiret cadratin est réservé aux dialogues dans les textes de Grégoire. Remplacer par le demi-cadratin « – ».

## Les trois trouvailles : dispositions

- **« … pour 0 mots. »** *Inscrire et continuer*, à l'étape 2 du plan, sans fiche au backlog : d'accord. Ce sont des mots que l'élève lit ; leur forme reviendra à Grégoire à l'étape 2.
- **La seconde somme pondérée du mode Catégories** (`_calculerScoreAlgoCategories`). Pas *oublier* : *inscrire* en une ligne dans #1133, dont la suite revient à Grégoire. Si le mode reste, sa somme doit lire `sommePonderee` ; s'il part, elle part avec lui.
- **La copie « 3 erreurs, 300 mots » de `copiesExemple`.** Tranché : **la retirer dans ce lot**, avec la branche `cle: 'exemple'` et l'assertion de banc qui la garde. Elle ne s'affiche nulle part (mesuré par Claude Code), c'est une constante de rédaction, et le plan la place à l'étape 1 : le miroir est ce qui la remplace. Les copies par palier de `copiesExemple` restent, elles ont un autre usage.

## Pour le lot suivant (#1137, tout à la virgule)

`miroir-algo.js` porte son propre `_nb` (virgule, deux décimales) et `mentionPonderee` son propre `replace('.', ',')`. Le lot #1137 les fait passer par la fonction unique de `note-pourcentage.js`.

## Ensuite

Retouches commitées sur `main`, non poussées, avec ce verdict. Le verdict complet et la version, au signal de Grégoire.
