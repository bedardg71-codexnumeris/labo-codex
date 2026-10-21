# Demande de relecture – Le critère algorithmique fait ce que son écran dit (#1134, #1131 ; inscrits #1132, #1133)

> Claude Code, 21 octobre 2026, 9 h 15. Consigne : `CONSIGNE-LOT-2026-10-21-critere-algorithmique-dit-vrai.md` ; mesure : `MESURE-2026-10-21-critere-algorithmique.md`. Un commit sur `main`, non poussé, sans numéro de version ni verdict complet.

## Ce qui a changé

**Le poids des codes posés (constat 4).** Chaque code posé pèse maintenant la pondération de son sous-critère : c'est le nouveau champ `poids` de `codesAnnotation`, à 1 en repli et pour un code inconnu. Annoter calcule la somme pondérée (`sommePondereeErreurs`). Le champ « Nombre d'erreurs » garde le nombre brut, et la somme l'accompagne sur le champ. Elle n'y vaut que tant que le champ porte ce nombre brut : une saisie à la main reste brute. Un seul couple de fonctions gère ce champ, `poserErreursDuChamp` et `erreursPourLaFormule` (`evaluation-calcul.js`) ; les cinq écrivains passent par lui (Annoter, deux vidages, trois chargements). La formule reçoit la somme, comme en mode Catégories, et la formule affichée la montre. L'évaluation enregistre `sommePonderee` seulement quand elle diffère du brut : avec tous les poids à 1, l'évaluation reste celle d'hier à l'octet près. La projection (« 1 erreur à chaque N mots ») garde le nombre brut, selon la règle de #668.

**Ce que l'élève lit.** La parenthèse sort d'une seule source, `enoncesAlgo.mentionPonderee` : virgule décimale, deux décimales au plus, « pondérée » au singulier sous 2. Elle sert le décompte dans les deux modes (la mention du mode Catégories, « (3.5 points) », en sort aussi) et la ligne du PDF.

**Le stock (point 3), mesuré.** Oui, rouvrir une copie évaluée recalculait avec les poids. Annoter reverse ses codes au champ par un `input`, le calcul repart, et `_armerEnregistrementAutomatique` (`evaluation-handlers.js`) l'enregistre. Sans garde, une note enregistrée avant ce lot aurait été réécrite à la réouverture, partout où un poids diffère de 1. J'ai donc ajouté une garde : les chargeurs passent `{ enregistree: true }`, et une évaluation rouverte sans somme pondérée garde son calcul tant que ses codes donnent le même nombre. Un code ajouté ou retiré est un geste, et le poids s'applique alors. Compte touché chez Grégoire : **aucun**, ses poids valent tous 1. Dans une autre base, ce seraient les évaluations de l'automne dont la grille active ses codes avec un poids différent de 1 et qui portent des codes de ce poids. Avec la garde, aucune n'est réécrite à la réouverture.

**Les libellés (constat 7).** « (30%) » devient « (30 points) » sur une grille entièrement en points (`texteDePonderation`, exposé par `grilles.js`). « Niveau IDME » devient « Niveau de l’échelle « X » », ou « Niveau » sans échelle nommée (l'échelle d'une pratique n'a pas de nom). Ce sont les mots de « Les niveaux viennent de l’échelle « X » ». Les deux chemins de rendu sont couverts pour le poids ; « Niveau IDME » n'existait que dans le premier.

**« Mes collections » (constat 11).** La liste n'est plus sous le menu. Elle vient en fin de carte, après « Enregistrer ces paliers sous un nom… », sous le titre « Mes collections » (celui du menu), séparée par un filet.

**#1131.** Le gabarit des sous-critères algorithmiques se rend en création, avec la cible `temp` : les sous-critères par défaut, la case « codes d'annotation », la couleur, l'observation et « Quand la copie ne porte aucun code ». Le message « se définissent une fois la grille enregistrée » est parti.

## Où placer la parenthèse dans la phrase du décompte (point 2)

Je propose le repère existant `{points}`. Il a déjà son espace de tête, et les deux modèles de phrases l'ont juste après « erreur{s} ». La parenthèse vit dans la valeur du repère : l'enseignant la place d'un clic, et elle disparaît d'elle-même quand les nombres sont égaux. Les deux rendus (captures du PDF, la phrase sous la ligne) :

- poids 1 et 0,5, sept codes (3 de syntaxe, 4 de ponctuation) : « Ta rédaction contient 7 erreurs de français (5 une fois pondérées) pour 400 mots. » ; ligne : « 7 erreurs (5 une fois pondérées) sur 400 mots → 13.75/20 (68.8 %) » (`captures-2026-10-21-critere-algorithmique/pdf-poids-1-et-0-5.png`) ;
- poids à 1 : « Ta rédaction contient 7 erreurs de français pour 400 mots. » ; ligne : « 7 erreurs sur 400 mots → 11.25/20 (56.3 %) » (`pdf-poids-a-1.png`), identiques à l'octet près à un 7 tapé à la main.

**Limite, nommée :** une phrase réécrite sans le repère `{points}` ne montre pas la parenthèse, même si la note suit la somme. **Pour le lot de mots :** le repère s'intitule encore « points pondérés », et son aide parle du « compte en points » ; je n'y ai pas touché (consigne).

## Ce que j'ai supposé

1. Un code que la grille ne connaît plus pèse 1, comme hier.
2. La somme est arrondie au dix-millième pour le calcul ; la parenthèse affiche deux décimales au plus.
3. La garde du stock (ci-dessus) : la consigne dit « garde sa note », et le recalcul à la réouverture l'aurait changée.
4. « Niveau de l’échelle « X » » pour le libellé du niveau : ce sont des mots existants, assemblés autrement. À trancher.

## Bancs

- **Vitest** `tests/unit/critere-algorithmique-dit-vrai.test.js`, 13 essais : la somme pondérée (poids 0,5 et 1, le poids 0 hors code, le repli à 1) ; le brut gardé ; une saisie à la main restée brute ; poids à 1 identiques à l'octet près ; la parenthèse et son singulier ; la ligne du PDF ; les libellés ; la garde du stock, dans les deux ordres de chargement.
- **Bancs mis à jour** : « Mes collections » (place et titre, `sentinelle-collections-gabarit`) ; la réserve « en création, pas de sous-critères » levée (`sentinelle-carte-bilan` A.b et B.d, `lot4-C` A.c, `texte-troue-etape-2` A.b, `bareme-grille-neuve-1120` A.c) ; #522 C.b passe de 22 à 21.
- **Break-tests** (code restauré, vérifié par `cmp`) : total brut remis dans le calcul → C.a rouge, et la spec WebKit rouge ; total brut remis dans Annoter → S.a rouge ; parenthèse toujours affichée → C.b, C.c et M.a rouges ; garde du stock retirée → K.a rouge.
- **Vitest complet** : 792 fichiers, 9 327 essais, verts (avant les inscriptions).
- **WebKit** : `critere-algorithmique-dit-vrai.spec.js` (3 essais), puis 65 specs de l'évaluation, d'Annoter, des codes, du PDF et de Grilles. Les 68 sont vertes.

## Inscriptions

#1134 (fait, avec « vérifié comment ») ; #1131 coché ; **#1132** (constat 8, deux critères algorithmiques) ; **#1133** (constats 5 et 13). Pour #1133, mesuré : rien n'active le mode Catégories, seule une évaluation qui porte déjà des codes le rouvre. Depuis #1134, il n'est plus le seul chemin vers la somme pondérée. Il garde la saisie tapée et la catégorie dominante. Sa ligne manque au PDF (`totalErreurs` au lieu de `erreurs`). Rien n'est retiré. SUIVI-BUGS : #1134 aux corrigés.

## Ce que je demande à la relecture

La place de la parenthèse (le repère `{points}`) et sa limite ; la garde du stock ; le libellé du niveau (supposition 4).
