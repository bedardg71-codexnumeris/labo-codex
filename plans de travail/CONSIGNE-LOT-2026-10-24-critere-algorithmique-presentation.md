# Consigne – La présentation du critère algorithmique, d'après la maquette du 24 octobre (lot 4, #1150)

> Écrite par Cowork le samedi 24 octobre 2026 à 21 h 50 (Toronto, mesuré par `date`), sur `main` = `25b31158`. Plans : `PLAN-2026-10-24-bibliotheques-chaines-critere-algo.md` (lot 4) et `PLAN-2026-10-21-critere-algorithmique-toute-discipline.md` (« Présentation de l'écran », avant l'étape 3). Décision de Grégoire, 24 oct. à 12 h 04 : appliquer au critère algorithmique la présentation de la maquette ; ordre confirmé à 21 h 43 (ce lot, puis les bibliothèques en deux colonnes, puis la table de cas).
> **La maquette est dans le dépôt** : `plans de travail/MAQUETTE-2026-10-24-critere-algorithmique.html` (copie de l'artefact validé). **Ouvre-la dans un navigateur et lis son code avant tout** : elle est la référence de ce que l'enseignant·e doit voir ; elle n'est pas du code à reprendre tel quel (ses calculs sont des copies ; ceux de l'app font foi).

## 0. Avant tout

- D'autres sessions peuvent travailler : ne commence qu'une fois le lot en cours commité, sur un `main` à jour, sans suite qui tourne. Fichiers du § 4 modifiés par une autre session, non commités : arrête et dis-le. Pas de `git stash`.
- **Si la retouche du verdict de #1153 n'est pas faite** (`VERDICT-RELECTURE-2026-10-24-cartouche-nouvelle-renomme.md`, § 2 : les mots de l'alerte qui refuse une copie), fais-la d'abord, dans un commit à part.
- Rituel de début de session.
- Un commit de docs seul, fichiers nommés : ce fichier, la maquette, `VERDICT-RELECTURE-2026-10-24-cartouche-nouvelle-renomme.md`, la ligne des deux plans.

## 1. Le principe : la présentation change, rien de ce qui est calculé ni enregistré

Ce lot **déplace, regroupe et renomme**. Il ne change ni un calcul de note, ni une phrase que l'élève lit, ni une donnée enregistrée, ni un texte par défaut. Tout ce que l'écran montre sort des modules d'aujourd'hui (`formulesAlgo`, `enoncesAlgo`, `projectionAlgo`, `miroirAlgo`, `paletteAlgo`). **Stock : rien à migrer.**

## 2. Ce que l'enseignant·e voit, en gestes (la maquette fait foi)

Dans une grille ouverte, un critère de type « Algorithmique » montre, sous ses champs d'en-tête (nom, type, pondération, SOLO, description), un **atelier en trois colonnes** :

1. **À gauche, la palette** (celle de l'étape 2b, `rendrePaletteAlgo`), avec **son en-tête qui dit à quoi elle sert**, mots de la maquette : « Blocs du critère algorithmique », « Ils servent à écrire les phrases que ce critère rédige seul, copie par copie. Chaque bloc prend la valeur de la copie corrigée. », les deux gestes numérotés (« Clique dans une zone violette. » ; « Touche un bloc : il se pose au curseur. »), l'état sans cible (« Aucune zone choisie. » ; « Clique dans une zone violette : les blocs qu'elle accepte paraîtront ici. ») et la légende (« Ce que tu écris dans la grille » / « Ce qui se remplit à la correction »). Survoler ou parcourir un bloc **allume les zones qui l'acceptent** et marque d'un crayon, dans la chaîne, les étapes où il peut se poser.
2. **Au centre, la chaîne puis les étapes.** En tête, la chaîne du critère, par le composant `ChaineEtapes` (lots 3a-3b) : **Ce que tu comptes → Codes → Note → Paliers → Ce que l'élève lit** (point d'arrivée). En dessous, une section repliable par étape, **une seule ouverte à la fois** ; une section fermée montre son résumé d'une ligne. Toucher une étape de la chaîne ouvre sa section (et y descend) ; l'étape ouverte est marquée. **À l'ouverture du critère, « Ce que l'élève lit » est ouverte** (comme la maquette).
3. **À droite, « Ce que l'élève lira »** (il remplace le miroir de l'étape 1, `rendreMiroirAlgo`), collé en haut pendant le défilement : une **copie fictive réglable** (nombre compté avec − et +, longueur, curseur à glisser), ses résultats (la note, le palier), puis les phrases rangées par destination comme dans la maquette (« Sous le critère, dans son PDF » ; « Dans son bilan » : si ce critère est effondré, si tous ses critères sont acquis ; « Pour toi seul·e » : si la copie ne porte aucun code). **« Montrer d'où vient chaque phrase »** : toucher une phrase ouvre l'étape qui l'écrit et désigne sa zone ; la survoler l'allume.

**Les zones où se posent les blocs sont violettes** (bordure pointillée, la teinte de la maquette, ses jetons dans les deux modes) ; **les blocs ont une bordure égale sur les quatre côtés** (retouche de Grégoire, 24 oct., 11 h 22 ; pas de liseré gauche dans l'app).

## 3. Décidé par Cowork (si la mesure le contredit, dis-le plutôt que de le suivre)

1. **Ce qui va où** (mesuré dans `rendreCartesGabaritAlgo`, `js/grilles.js` l. ~5172) :

| Étape de la maquette | Ce qu'elle contient aujourd'hui | Réglée quand (règle de la maquette) | Sous l'étape |
|---|---|---|---|
| **Ce que tu comptes** | `rendreNomsCritereAlgo` (les deux noms, singulier et pluriel) | les quatre formes écrites | « erreurs / mots » (les pluriels) |
| **Codes** | `rendreSousCriteresAlgo` | codes non activés (palette générale d'Annoter), ou au moins un sous-critère | « 5 codes » ; « palette générale » |
| **Note** | la carte « Formule » (`rendreBlocFormuleAlgo`), **sans le miroir** | pondération > 0 et paramètre de la formule > 0 | le nom court de la formule |
| **Paliers** | la carte « Ce que l'élève lit » d'aujourd'hui (`rendreBlocProjectionAlgo` : la projection et les verdicts de chaque palier) | aucune projection, ou longueur et tolérance > 0 | « aucun » ; « 4 paliers » |
| **Ce que l'élève lit** (arrivée) | la carte « Bilan » d'aujourd'hui (`rendreBlocEnoncesAlgo` : décompte, défi prioritaire, quand tout est maîtrisé, et le modèle des phrases) | au moins un des trois textes non vide | « 3 textes » |

   Les titres des sections changent donc : « Formule » devient « Note », « Ce que l'élève lit » (projection) devient « Paliers », « Bilan » devient « Ce que l'élève lit ». Ce sont les mots de la maquette validée : ne les change pas.
2. **La copie fictive** se calcule par `miroirAlgo.essayer(critere, copie)` (un seul calcul, celui de l'évaluation). Elle part de l'étendue du miroir (`miroirAlgo.etendue`) et de sa copie « Quelques ». **Les copies de référence du miroir restent** (« Aucune », « Quelques », « Beaucoup » ou ce que `miroirAlgo.copies` rend) : trois boutons au-dessus du réglage, qui posent la copie fictive. Le miroir vérifiait la formule aux extrêmes ; ce geste reste.
3. **La chaîne étend le composant** `ChaineEtapes` sans le dupliquer : deux états d'étape de plus, « ouverte » et « peut recevoir le bloc » (le crayon), dessinés comme dans la maquette (`.bc-ouvert`, `.bc-montre`). Les chaînes des lots 3a-3b n'en ont pas l'usage et ne changent pas. La case « Afficher les chaînes d'étapes » masque aussi celle-ci ; les en-têtes des sections restent alors le moyen d'ouvrir une étape.
4. **Une seule section ouverte** remplace la règle du 3 septembre (« ouvert ce qui porte la note, fermé ce qui porte les mots ») et la mémoire des plis (`plisGabaritAlgo`) : la maquette validée l'emporte. Retire ce que ça rend sans objet (zéro dette).
5. **L'iPad** : la palette garde son placement de l'étape 2b sous son seuil (réduite aux noms, au-dessus du texte où est le curseur), déjà éprouvé ; « Ce que l'élève lira » prend la colonne de droite à 300 px de 760 à 1 179 px, et devient un tiroir collé en bas sous 760 px, comme la maquette. Cibles de 44 px.
6. **Deux critères algorithmiques dans une grille** : chacun son atelier, sa chaîne, sa copie fictive (identifiants préfixés par l'index du critère, comme les zones d'aujourd'hui).
7. **En création** (grille pas encore enregistrée, cible `temp`) : la même présentation, qui lit le formulaire.

## 4. Où (mesuré par Cowork en lecture, à revérifier)

- `js/grilles.js` : `rendreCartesGabaritAlgo` (l. ~5172), `carteGabaritAlgo` et les plis (l. ~4428-4470), `rendreMiroirAlgo` / `suivreMiroirAlgo` (l. ~3663-3700), `rendrePaletteAlgo` (l. ~3790), `ciblerPaletteAlgo` / `placerPaletteAlgo` / `replacerPalettesAlgo` (l. ~6559-6640), les quatre blocs rendus.
- `js/chaine-etapes.js` (les deux états) ; `js/miroir-algo.js`, `js/palette-algo.js` (en lecture, sauf besoin mesuré) ; `styles.css` (l'atelier, les zones violettes, l'aperçu) ; `design-system.html` (l'atelier, s'il s'y décrit).

## 5. Pièges connus

1. **Les sessions en parallèle** : § 0.
2. Le rendu du gabarit redessine tout à chaque modification enregistrée : la section ouverte, la copie fictive réglée et le focus ne doivent pas sauter (mesure ce que `suivreMiroirAlgo` et `capturerPlisGabaritAlgo` protégeaient aujourd'hui, et garde-le).
3. La palette cible une zone au `focusin` (2b) : elle doit continuer de marcher quand la zone est dans une section qu'on vient d'ouvrir.
4. Les phrases cliquables de l'aperçu : `textContent` pour ce que l'enseignant·e a écrit (règle 1) ; aucun gestionnaire en ligne (règle 2).
5. Le PDF de l'élève et l'évaluation ne changent pas : un essai compare, sur un critère de démonstration, la note et les phrases avant et après le lot.
6. Les bancs des étapes 0 à 2b et 5 (`grep` de `miroir-algo`, `palette-algo`, `gabarit-algo`) : recalés sur la nouvelle présentation, pas affaiblis ; dis lesquels.

## 6. Preuve exigée

- **Vitest** pour ce qui est extrait en fonctions pures (les états des cinq étapes, au minimum : chaque étape réglée et non réglée). Break-test.
- **Playwright (WebKit)** : l'atelier à 1 440 px (trois colonnes) ; la chaîne et ses cinq états ; une seule section ouverte, toucher une étape l'ouvre ; un bloc survolé allume ses zones et le crayon de ses étapes ; poser un bloc au curseur marche encore dans une section ouverte depuis la chaîne ; − / + et les trois copies de référence changent les phrases et la note ; toucher une phrase ouvre son étape ; la note et les phrases d'une évaluation inchangées (piège 5) ; 1 180 et 820 px (palette 2b, aperçu à droite) ; 700 px (tiroir).
- **Captures** : 1 440, 1 180, 820 px, clair et sombre, avec la section « Ce que l'élève lit » ouverte et la section « Paliers » ouverte.
- Portes terrain : skill `portes-terrain` (l'iPad et Safari réels sont à prévoir).

## 7. Ce qui n'entre pas

La table de cas (étape 3) et les calculs composés (étape 4) ; tout texte par défaut ; le modèle de projection ; le PDF ; les critères holistiques et analytiques ; les bibliothèques en deux colonnes (le lot suivant).

## 8. Clôture

- #1150 cochée dans le commit du code ; la ligne « Présentation de l'écran » du plan du 21 oct. à « fait ».
- Demande de relecture : `DEMANDE-RELECTURE-2026-10-24-critere-algorithmique-presentation.md`.
- Pas de release, de verdict ni de push sans le signal de Grégoire.
