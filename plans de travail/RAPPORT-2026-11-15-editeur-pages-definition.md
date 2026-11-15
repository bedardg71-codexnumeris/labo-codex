# Rapport — l'éditeur de pages garde la définition (15 nov. 2026)

**Branche** : `lot/editeur-pages-definition`, partie de `main` à `41f68d315` (1.247.0). **Non fusionnée, sans release, sans verdict complet** (limites du mandat de Cowork, 8 h 14).
**Arbre de travail** : `/Users/kuekatsheu/Documents/GitHub/labo-codex-editeur-pages` (voir « Incident » plus bas).
**Fait** : les quatre points du mandat, leurs essais, la mesure.
**Reste** : le verdict complet (Playwright entier), la relecture croisée, la fusion, la ligne de Nouvelles à approuver, les mots d'écran à approuver.
**Stock** : les copies déjà réduites par l'ancien éditeur restent réduites. Rien n'est réparé d'office : leurs pixels sont perdus, Grégoire réimporte les originaux (mandat).

## 1. La cause, mesurée

`decomposerPDF` redessinait chaque page à 1 000 px de large (JPEG 0,85) à l'ouverture de l'éditeur ; `pivoterPageEditeur` tournait cette image réduite ; `rendrePagePDF` (« + Ajouter des pages » depuis un PDF) rendait à 800 px. L'essai neuf, sur l'ancien code : une page de 2 728 x 1 748 ressort à 1 000 x 640 après une simple inversion de l'ordre.

## 2. Le moyen retenu pour le point 1, et pourquoi

Une copie importée est un PDF écrit par l'application (jsPDF) : une image JPEG pleine page par page, dont jsPDF colle les octets tels quels. Le module `js/pdf-image-perdue.js` (#1233) savait déjà lire ce PDF. Je lui ai ajouté `lireImagesDesPages` : la position des octets JPEG de chaque page.

- **Page d'un PDF de l'application** : ses octets sont repris par `blob.slice` (ni décodage, ni réencodage, ni copie en mémoire). Une page non modifiée ressort avec ses octets exacts ; l'essai le vérifie octet pour octet.
- **Toute autre page** (PDF d'un autre producteur, PNG laissé par l'ancien pivot, JPEG à balise EXIF) : rendue par pdf.js à la définition de son image numérisée, ou à 250 ppp si elle est du texte. Réencodée une fois (JPEG 0,92) ; aux passages suivants elle est une page de l'application, donc sans perte.
- **Pivot** : seule la vignette tourne à l'écran. Le quart de tour est noté sur la page et fait à l'enregistrement, sur l'image à pleine définition (JPEG 0,92). Quatre quarts de tour : la page repart intacte.
- **Mémoire** : l'éditeur n'affiche que des vignettes de 1 000 px au plus (une par page, plus l'aperçu) ; la pleine définition n'est décodée qu'une page à la fois, à l'enregistrement.

Pourquoi ce moyen : c'est le seul qui tient « une page non modifiée n'est pas réencodée » sans ajouter de bibliothèque (l'application n'a que jsPDF et pdf.js, aucune ne copie une page d'un PDF à l'autre), et il réutilise un lecteur déjà éprouvé.

Vaut pour les trois appelants de `decomposerPDF` (ouverture, fusion depuis l'éditeur, fusion de fichiers) et pour « + Ajouter des pages » ; `rendrePagePDF` est retirée.

## 3. Les mesures

Script : `tests/mesures/editeur-pages-definition.mjs` (WebKit de Playwright sur le Mac, secteur). Copie fictive : quatre pages de 4 000 x 3 000 px, PDF de 25,5 Mo.

| Geste | Avant (`41f68d315`) | Après |
|---|---|---|
| Ouvrir l'éditeur | 1 909 ms, pic +212 Mo | 440 ms, pic +155 Mo |
| Enregistrer (deux pages inversées) | 68 ms, pic +1 Mo | 874 ms, pic +189 Mo |
| Images gardées à l'écran | 2,5 Mo | 2,1 Mo |
| PDF enregistré | 1,5 Mo, pages de 1 000 x 750 | 25,5 Mo, pages de 4 000 x 3 000 |

L'enregistrement coûte plus cher qu'avant : il écrit maintenant 25,5 Mo au lieu de 1,5.

⚠ Limites de la mesure. C'est WebKit du Mac, pas Safari de l'iPad : un ordre de grandeur et un rapport avant/après, pas le chiffre de l'iPad. La mémoire est la mémoire résidente du processus, relevée toutes les 100 ms ; d'un passage à l'autre elle varie de quelques centaines de Mo selon le ramasse-miettes (le pic de l'enregistrement a été relevé à +189, +138 et +484 Mo sur trois passages). Les durées, elles, sont stables (±3 %).

Lecture de la définition d'un PDF (points 2 et 3), même copie :

| Chemin | Durée |
|---|---|
| PDF de l'application (lu dans le fichier) | 179 ms |
| Autre PDF, écran d'import (dictionnaires d'images, sans décodage) | 352 ms |
| Autre PDF, par pdf.js (décode chaque image) | 1 913 ms |

Ma première version lisait tout par pdf.js : 1,9 s et un pic relevé à +673 Mo pour cette copie. Exclu à l'import, où des dizaines de fichiers arrivent ensemble. L'écran d'import ne décode plus aucune image (l'essai le verrouille) ; les Propriétés ne passent par pdf.js que pour un PDF d'un autre producteur, un fichier à la fois, à la demande.

## 4. Les mots d'écran écrits (à approuver)

**Propriétés du fichier**, nouveau bloc sous l'aperçu :

- titre : « Définition des pages »
- « Page 1 : 2728 x 1748 px »
- page de texte ou de dessin : « Page 2 : Lettre (page de texte) »
- pendant la lecture : « Lecture des pages… »
- « Non lue : le fichier n'est pas sur cet appareil. » ; « Non lue : le fichier ne se lit pas. »
- le poids reste sous le nom (« 2 pages · 1,4 Mo ») ; s'il manque aux métadonnées : « Poids du fichier : 1,4 Mo »

**Écran d'import**, pour un PDF, colonne « Originaux » ; la colonne « Aperçu » dit la même chose suivie de « (aucun traitement) » :

- « PDF, 2 pages · 2728 x 1748 px »
- pages de définitions différentes : « PDF, 2 pages · la plus petite : 1700 x 2200 px »
- texte : « PDF, 1 page · Lettre » ; formats différents : « PDF, 3 pages · le plus petit format : Lettre »
- mélange : « PDF, 3 pages · 2 numérisées, 2728 x 1748 px · 1 en texte, Lettre »
- tant que la lecture n'est pas faite : « PDF », comme avant

Formats nommés : Lettre, Légal, 11 x 17 po, A4, A3, A5, suivis de « (paysage) » s'il y a lieu ; sinon les côtés en pouces (« 8,5 x 14 po »). Le séparateur « x » est celui que l'écran emploie déjà pour les images.

## 5. Point 4 — le gabarit de « Rés. max. »

`dimensionsResMax(w, h, dpi)` est la source unique de `calculerDimensionsCibles` (ce que l'écran annonce) et de `uniformiser200DPI` (ce qui est fait). Le gabarit est couché pour une image couchée. À 200 ppp, 2 728 x 1 748 devenait 2 200 x 1 410 ; elle reste entière. (À 250 ppp, le réglage par défaut, elle n'était déjà pas réduite.)

## 6. Les preuves

`tests/integration/editeur-pages-definition-2026-11-15.spec.js`, huit essais, images et noms fictifs :

1. inverser l'ordre : pixels et octets de chaque page gardés ;
2. retirer une page : idem pour la page restante ;
3. pivoter : mêmes pixels, côtés inversés, repères au bon coin ; l'autre page garde ses octets ;
4. une page PNG d'avant ce lot garde ses pixels par le repli ;
5. l'éditeur n'affiche aucune image de plus de 1 000 px ;
6. Propriétés : PDF numérisé, PDF de texte, PDF d'un autre producteur, image ;
7. écran d'import : PDF numérisé, PDF de texte, PDF d'un autre producteur, dans les deux colonnes, sans aucune image décodée ;
8. le gabarit dans les deux sens.

Contre-épreuve : les huit sont rouges sur `41f68d315` ; l'assertion « aucune image décodée » rougit (3 lectures) quand on retire le chemin sans décodage.

Passés : Vitest complet (926 fichiers, 11 807 essais, vert) ; passage Playwright ciblé de 26 essais (ce fichier, `1007-propose-codex-2a2`, `1028-archiver-copies`, `ajouter-pages-photo-droite`, `reparer-image-perdue-1233`, `import-anonymisation-1221`, `import-bandeaux-612`), vert. **Non passé : la suite Playwright entière.**

## 7. Ce que j'ai laissé

| Constat | Disposition |
|---|---|
| **Import groupé de PDF** (`pagesImagesDuFichier`, #880) : quand un élève remet plusieurs fichiers dont un PDF, chaque page du PDF est rendue à 1 400 px au plus. Même famille de défaut, autre chemin, hors des fonctions nommées au mandat. Conséquence sur ce lot : pour un PDF qui sera fusionné, la colonne « Aperçu » dit « (aucun traitement) », ce qui est faux. | **À inscrire** — décision de Cowork ; non corrigé ici |
| Une page de plus de 16,7 millions de pixels (limite d'un canevas sur iPad), pivotée ou passée par le repli, est réduite à cette limite. Une page sans pivot d'un PDF de l'application n'est pas concernée. | Limite assumée, commentée dans le code |
| Une page de texte qui passe par l'éditeur devient une image (250 ppp au lieu de 1 000 px de large) ; son texte n'est plus sélectionnable. C'était déjà le cas. | Inchangé |
| L'écran d'import lit un PDF d'un autre producteur sans le décoder : il sait dire la plus petite définition, pas l'ordre des pages. Si le PDF n'a pas une image par page aux proportions d'une page, il repasse par pdf.js (exact, plus lent). | Assumé, commenté dans le code |
| Copies déjà réduites | Non réparées (mandat) |
| Annotations | Non touchées. Leurs coordonnées sont normalisées (0 à 1) : la taille de la page ne les déplace pas. |
| Portes terrain | Aucune écrite. L'iPad reste à éprouver par Grégoire : ouvrir l'éditeur sur une vraie copie, inverser, enregistrer, zoomer dans Annoter. |

## 8. Incident de session

Cette session a démarré dans l'arbre principal (`/Users/kuekatsheu/Documents/GitHub/labo-codex`), où une autre session (`lot/gel-etape-7`) travaillait en même temps et a changé de branche pendant que j'écrivais. Mes changements non commités y ont séjourné d'environ 8 h 15 à 8 h 28 ; pendant ma contre-épreuve je les ai retirés puis remis une fois (`git stash` limité à `js/` et `styles.css`). Un passage d'essais de l'autre session lancé dans cet intervalle a pu tourner sur mon code. J'ai ensuite déplacé mon travail dans un arbre à part et retiré mes seuls changements de l'arbre principal (patch inversé, vérifié identique). Je n'ai touché à aucun fichier de l'autre session.

## 9. Ligne de Nouvelles proposée

> **Tes copies restent nettes.** Réordonner, retirer ou pivoter une page dans l'éditeur de pages ne réduit plus sa définition. Les Propriétés d'un fichier et l'écran d'import indiquent maintenant les dimensions en pixels de chaque page, PDF compris.
