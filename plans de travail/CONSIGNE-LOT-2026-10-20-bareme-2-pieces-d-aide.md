# Consigne – Le barème, lot 2 : les pièces d'aide (#1120)

> Écrite par Cowork le mardi 20 octobre 2026 à 9 h 25 (Toronto, mesuré par `date`), sur `main` à `84d76712` (non poussé). Textes : `plans de travail/TEXTES-2026-10-20-bareme.md`, **35 textes validés par Grégoire à 9 h 23, tous tels que proposés. À recopier tels quels**, apostrophes typographiques comprises, sans retouche. Plan : `PLAN-2026-10-19-bareme.md`, « L'aide, les bulles et l'accompagnement ». **Aucune porte terrain** : une machine répond à tout ce qui suit.

## Avant ce lot

Si la correction **C1** du verdict du lot 1 (`VERDICT-RELECTURE-2026-10-20-bareme-1-editeur.md` : une tranche neuve s'enregistre aussitôt, sans points) n'est pas encore commitée, fais-la d'abord, dans son propre commit avec ce verdict. La bulle E4 (« Elle s'enregistre aussitôt… ») la suppose.

## Le changement d'ordre (décision de Cowork)

Les textes étant validés, les pièces d'aide passent **avant** la dissection qui écrit des tranches : elles ne dépendent pas d'elle. Seul **G2** (« Aller plus loin » d'une grille en points) attend le lot de la dissection : ne le pose pas ici.

## Ce que l'enseignant voit à la fin de ce lot

- Au lexique, deux termes neufs, « Barème » et « Tranche » ; « Échelle de performance » et « Type de critère » disent ce que fait l'application.
- Sous chaque critère analytique de Grilles de critères, une icône « i » à côté du titre « Barème » ouvre l'aide « Le barème d'un critère », avec l'exemple de la démonstration Journal de lecture.
- Au survol des champs d'une tranche, de « + Ajouter une tranche » et des deux marques, une bulle.
- L'aide « Type de critère d'évaluation » et la bulle du champ « Type de critère » disent la même chose que le lexique.
- Dans l'onglet Aide, sous « Configuration », une section « Le barème d'un critère analytique », avec un tableau qui met l'échelle et le barème côte à côte, trouvable par la recherche.

## Ce qu'il faut, texte par texte (les numéros sont ceux du fichier des textes)

1. **Lexique** (`accompagnement-contenu-terme.js`) : A1 `bareme` et A2 `tranche`, catégorie « Structure », `voir: 'Conception > Grilles'`, sur le modèle de `points` ; A3 et A4 remplacent les définitions actuelles de `echelle-de-performance` et `type-de-critere`. Le lexique n'a pas de champ de renvois : n'en crée pas.
2. **Aide « i » du barème** (`accompagnement-contenu-popup.js`, entrée neuve, clé à ton choix) : B1 titre ; B2 et B3 deux sections `texte` ; B4 une section `exemple` (sa première ligne en `titre`, les trois autres en `contenu`, une ligne chacune) ; B5 une section `conseil` ; B6 en `voirAussi`. L'icône s'ouvre à côté du titre « Barème », par le patron existant (`<span class="primo-aide" data-target="…">`, comme `grille-type-critere-detail` dans `grilles.js`).
3. **Les trois types** : C1 remplace les trois lignes de `grille-type-critere-detail` (le nom du type en `<strong>`, suivi du deux-points) ; C2 remplace la bulle `cn-grille-type-critere` (`accompagnement-contenu-hover.js`, l. 261).
4. **Les mots de l'éditeur** (D1 à D10) sont déjà dans le code depuis `e0357f74` : vérifie qu'ils sont identiques, mot pour mot, et remplace leur mention « provisoire » par « validé G. 20 oct. 9 h 23 ».
5. **Les bulles** (E1 à E6) : entrées neuves du catalogue des bulles, posées par `data-tooltip` sur les champs Nom, Points et Texte, sur « + Ajouter une tranche » et sur les deux marques.
6. **L'onglet Aide** (`index.html`, sous « Configuration ») : une carte en accordéon, sur le modèle de « Apporter une grille que tu as déjà » (l. 10966) : F1 titre ; F2 ; F3 en **tableau** HTML à deux colonnes, « Échelle de performance » et « Barème », une rangée par intitulé, avec les composants de `design-system.html`, et qui reste lisible à la largeur de l'iPad debout (défilement horizontal dans son propre conteneur s'il le faut) ; F4 ; F5. La recherche de l'onglet Aide la trouve par « barème » et par « tranche ».
7. **La primo-aide (G1)** : mesure d'abord si un mécanisme existant sait montrer une phrase **une seule fois** à la première rencontre (la flèche didactique, `accompagnement.js`, l. 595, est la candidate). S'il existe, G1 s'y pose, suivie d'un lien vers l'aide « i » du barème. S'il n'existe pas, ne crée pas de mécanisme neuf : G1 attend, et tu le dis dans la demande.

## Les bancs

Comme au lot de l'aide d'« Apporter mon matériel » : chaque `data-tooltip` et chaque `data-target` neufs ont leur entrée au catalogue ; « barème » et « tranche » existent au lexique ; un banc compare les textes posés à ceux du fichier des textes, **mot pour mot** (A1 à A4, B1 à B6, C1, C2, D1 à D10, E1 à E6, F1 à F5, et G1 s'il est posé). Break-test : un texte retouché d'un caractère → rouge. Vitest complet vert ; WebKit : l'aide « i » du barème s'ouvre depuis un critère analytique, et la section de l'onglet Aide est trouvée par la recherche. Le verdict complet tourne ce soir.

## Ce qu'il ne faut pas

- Retoucher un texte validé, même d'une virgule. Un texte qui ne tient pas à l'écran se signale dans la demande, il ne se raccourcit pas.
- Poser G2 (lot de la dissection).
- Une étape neuve de la visite guidée (décision du plan).
- Le verdict complet, un numéro de version, le push.

## Livrer

Un commit sur `main`, non poussé, avec : cette consigne ; `plans de travail/TEXTES-2026-10-20-bareme.md` ; le BACKLOG (#1120 : « lot 2, les pièces d'aide, livré » et sa phrase « vérifié comment ») ; les bancs ; la demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-20-bareme-2-pieces-d-aide.md`. Ajoute les fichiers par leur chemin, jamais `git add -A`. Lance `/fin-de-session` avant le commit, sans le verdict complet. **Puis arrête-toi.**
