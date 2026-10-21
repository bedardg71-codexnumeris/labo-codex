# Consigne – Le critère algorithmique, étape 1 : le miroir (la note et ce que l'élève lirait, pour quelques copies fictives)

> Écrite par Cowork le mercredi 21 octobre 2026 à 11 h 18 (Toronto, mesuré par `date`), sur `main` à `90809966`. Plan : `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md`, étape 1 (lis « Le principe » et « Le garde-fou commun »). Verdict du lot précédent : `VERDICT-RELECTURE-2026-10-21-critere-algorithmique-mots-2.md` (non suivi).
> ⏱ **Limite de Grégoire : le lot commité et relu à 12 h 30**, la version part vers 13 h. Si, à **12 h 15**, il n'est pas prêt à commiter, ne commite rien sur `main` : range le travail sur une branche `wip/miroir-2026-10-21`, remets `main` propre, remplis `RELAIS.md` (règle de relais de `CLAUDE.md`) et dis où tu en es. `main` doit rester publiable à 12 h 30.

## Ce que l'enseignant doit pouvoir faire

Pendant qu'il règle son critère algorithmique dans la grille, voir **ce que sa règle donne** sur quelques copies fictives : la note, et ce que l'élève lirait. C'est ce qu'un tableur ne fait pas, et ce qui lui permet de vérifier que sa formule dit ce qu'il pense (mesure du 21 oct., « Le cadre »).

## Ce qui existe (bâtis dessus, ne le double pas)

- Sous chaque palier de projection, « L'élève lira : … (copie fictive, N erreurs pour M mots) » (`grilles.js`, autour de l. 4040-4070) ; les copies viennent de `projectionAlgo.copiesExemple(critere)`, tirées des réglages de la grille ; sans projection, une copie « 3 erreurs, 300 mots ».
- Le calcul de la note : `formulesAlgo.calculer(critere, {ponderation, erreurs, mots})` (`evaluation-formules.js` l. 259), le même qu'à l'évaluation. La phrase : `enoncesAlgo.enonce` ; la projection : `projectionAlgo.calculer` ; la parenthèse : `enoncesAlgo.mentionPonderee` ; le poids des codes : `codesAnnotation`.
- « Formule appliquée : … » (`grilles.js` l. 3628).

## Ce qu'il faut

1. **Un bloc « Essai sur des copies fictives »** dans le gabarit du critère algorithmique, près de la formule. Pour chaque copie fictive, sur une ligne : ce qu'elle porte (« 0 erreur, 500 mots »), la note obtenue (« 30/30 (100 %) », virgule décimale) et ce que l'élève lirait (le décompte et, s'il y en a une, la projection). Mesure d'abord où il se place le mieux ; dis-le.
2. **Les copies** : aucune erreur ; quelques-unes ; beaucoup ; plus, si un sous-critère ne pèse pas 1, une copie dont les codes ont des poids différents, pour montrer la parenthèse et l'effet sur la note. **Tous les nombres viennent des réglages de la grille** (longueur de référence, facteur, erreurs tolérées, pondération du critère), jamais d'une constante de rédaction ; « beaucoup » est utile s'il montre où la note touche le plancher. Choisis la règle, écris-la en commentaire, et dis-la.
3. **Un seul calcul** : le miroir appelle les mêmes fonctions que l'évaluation. Aucune formule recopiée.
4. **Il suit les réglages** : changer le modèle, un paramètre, une pondération de sous-critère ou une phrase met le miroir à jour, au même geste que le reste du gabarit (`_redessinerCible`), en création comme en modification.
5. **Les mots du miroir** (« erreur », « mots », « copie fictive ») passent par **une seule fonction de libellés**, que l'étape 2 remplacera par les noms de l'enseignant. Aujourd'hui, les mots de l'écran actuel ; aucun mot de discipline.
6. **Lecture seule** : rien n'est écrit dans la grille ni ailleurs.
7. **En passant** (verdict de 11 h 18) : sous un critère sans sous-critère, « Aucun sous-critère défini. Utilise les sous-critères par défaut ou crée les tiens. » devient « Aucun sous-critère pour l'instant : ajoute les tiens, ou pars de la liste du français écrit. »

## Mac et iPad

Le bloc tient à 1 440 px et à 820 px (iPad en portrait) sans défilement de côté ; les lignes passent sur deux rangs plutôt que de déborder. Rien au survol seul.

## Les bancs

- **Deux disciplines fictives** (garde-fou du plan) : « Français écrit » et « Unités et chiffres significatifs » (chimie, longueur de référence en calculs). Pour la seconde, le miroir ne dit pas « français ».
- **Vitest** : la note du miroir est celle de `formulesAlgo.calculer` pour la même copie (espion ou comparaison), pour les trois modèles ; les copies changent quand la longueur de référence ou le facteur change ; la copie pondérée montre « (N une fois pondérées) » et sa note suit la somme ; aucune écriture.
- **WebKit** : une grille neuve, critère algorithmique → le bloc paraît ; changer le facteur → la note d'une copie change ; à 820 px, pas de défilement de côté.
- **Break-test** : une note fixée en dur dans le miroir → rouge ; une constante de longueur à la place du réglage → rouge. Code restauré, `cmp`.
- Vitest complet vert ; specs WebKit de Grilles et du critère algorithmique vertes. Le verdict complet tourne vers 13 h, au signal de Grégoire.

## Ce qu'il ne faut pas

- Changer un calcul ou une note ; écrire dans une grille.
- Nommer les données (étape 2), la palette (étape 2), la table de cas (étape 3).
- Le verdict complet, un numéro de version, le push.

## Livrer

Un commit sur `main`, non poussé, avec : cette consigne, le verdict du lot de mots 2 (non suivi), le plan `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md` (modifié par Cowork : son tableau « Où en est le plan »), le correctif, les bancs, deux captures (le bloc à 1 440 px ; à 820 px, critère de chimie) et la demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-21-critere-algorithmique-miroir.md`. Par leur chemin. `/fin-de-session` avant le commit, sans le verdict complet. **Puis arrête-toi.**
