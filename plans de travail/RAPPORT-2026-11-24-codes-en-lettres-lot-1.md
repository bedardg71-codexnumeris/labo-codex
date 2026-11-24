# Rapport : des codes d'annotation en lettres, lisibles partout (lot 1)

> **Rien n'a été jugé sous Safari ni sur l'iPad.** Le nuage n'a pas WebKit : tout ce qui suit a tourné sous Chromium (Linux, police DejaVu Sans). Le passage WebKit est à lancer sur le Mac, depuis `tests/` :
>
> ```bash
> cd tests && npx playwright test integration/codes-en-lettres-lisibles.spec.js integration/codes-par-grille-gabarit.spec.js integration/codes-par-grille-palette.spec.js integration/codes-touche-est-le-numero.spec.js integration/critere-algorithmique-palette.spec.js integration/erreurs-palette-codes-fermee.spec.js --trace off
> ```
>
> (Sans `-c`, la configuration par défaut est WebKit.)

**Dernier relais.** Branche `lot/codes-en-lettres-1-lisibles`, partie de `main` à `5a2bc31be` ; le lot est le commit `c1c6d414d`, ce rapport complété au commit suivant. Mandat de Cowork du 24 nov. 2026, 15 h 45. Lot 1 fait : mesure de l'étape 0, codes lisibles (cercle, curseur, PDF, palette), refus à la saisie (accent, casse), vraie raison à l'écran de la grille. Ni fusion dans `main`, ni bump, ni ligne de Nouvelles, ni entrée de `RELAIS.md` (elle s'écrira à la fusion, exception décidée par Cowork). Aperçu : demande en brouillon « APERÇU, ne pas fusionner » (adresse plus bas). Reste : le passage WebKit sur le Mac, les gestes à essayer, les deux lots suivants (diagnostic erreurs-mots, suivi).

---

## Étape 0 : la mesure

**La mesure ne contredit pas le mandat.** Je l'ai donc poursuivi sans attendre. Les points a, b et c préparent les deux lots suivants et n'ont rien changé au code.

Méthode : a, b et c viennent d'un balayage en lecture seule (sous-agent), dont j'ai repris trois affirmations au code par une lecture directe (`evaluation-enonces.js:126`, `travaux-outils.js:2865`, `synthese-retroaction-data.js:84`) ; elles tiennent. Le point d est le mien. [L] = lu dans le code, [I] = inféré.

### a) Le nombre de mots d'une copie

- [L] Il vit **sur l'évaluation**, pas sur la copie ni sur la production : `donneesAlgorithmiques[<critereId>].mots` (`evaluation-calcul.js:1050-1052` en mode simple, `:845` en mode catégories), copié dans l'évaluation enregistrée (`evaluation-sauvegarde.js:272`, clé `evaluationsSauvegardees`).
- [L] **Seul l'enseignant·e le saisit**, au panneau Évaluer (devenu la palette Évaluation d'Annoter) : `<input id="eval_mots_${critere.id}">` (`evaluation-chargement.js:1221-1226`, `:1253-1258`, `:1419-1424`). Il y a un champ par critère algorithmique. Il s'enregistre à la frappe (`evaluation-handlers.js:22-31`).
- [L] **Aucun compte automatique** depuis la copie : Annoter ne remplit que le champ des erreurs (`travaux-outils.js:2865-2886`). Le compteur `compteur-mots-retro` (`evaluation-retroaction.js:596-602`) compte les mots de la rétroaction de l'enseignant·e, pas ceux de la copie.
- [L] Lecteurs : le calcul (`evaluation-calcul.js:976-979`, `:363-365`), la projection (`evaluation-projection.js:664`), les formules (`evaluation-formules.js:819`), la ligne « N erreurs sur M mots » du PDF (`synthese-retroaction-data.js:679-683`), le bilan (`evaluation-retroaction.js:1126`, avec un défaut de 500 si vide, `:1132`), le dépistage (`entites/signalement-depistage.js:93`).

### b) Comment une grille range ses codes

- [L] **Tous les codes vivent sous UN SEUL critère algorithmique, le premier de la grille.** `critereAlgorithmique(grille)` rend `criteresAlgorithmiques(grille)[0]` (`evaluation-enonces.js:126-128`) ; le commentaire `:114-122` le dit : « Rien n'interdit deux critères algorithmiques […] c'est le modèle de données qu'il faudra corriger ».
- [L] Un second critère algorithmique est permis (aucune garde à l'ajout ni au changement de type, `grilles.js:6297-6326`, `:7539-7542`). L'écran le dit (`grilles.js:4021-4031` : « Les codes posés dans Annoter ne vont pas à ce critère : ils vont tous au premier critère algorithmique »). L'évaluation calcule bien ce second critère, mais le compte venu d'Annoter ne remplit que le premier champ (`travaux-outils.js:2865`).
- [L] **Il n'existe aucune notion de famille** : un sous-critère porte `{id, code, nom, ponderation, retroaction, couleur}` et rien d'autre (`grilles.js:6226-6232`). Un code posé s'écrit `errfr_<code>` et ne porte pas son critère.
- [I] Une famille par critère demanderait donc soit plusieurs critères algorithmiques recevant chacun ses codes (changement du modèle, d'après le commentaire cité), soit un champ de famille sur le sous-critère.

### c) Une production qui ne compte pour rien : où une note ou un niveau paraît encore

- [L] L'application représente « ne compte pas » de quatre façons : `production.diagnostique === true` (`entites/production-diagnostique.js:71`), une pondération de 0 (`pratiques/pratique-sommative.js:758-770`), `productionsExclues` dans la pratique (« ne compte pas », `pratiques/pratique-registre.js:921-924`), et l'ancien type `…-formatif`, qui n'a plus d'écrivain.
- [L] Après la pose des codes, **Annoter** ne montre que le total des codes (`travaux-outils.js:2831-2839`), sans note ; ce total part aussitôt au champ des erreurs, ce qui relance le calcul.
- [L] Une note ou un niveau paraît encore, **sans garde pour ces productions**, dans :
  - la palette Évaluation et le panneau Évaluer : « X/P (Y %) | Niveau » par critère (`evaluation-chargement.js:1230`, `:1262`), puis « Note chiffrée » et « Niveau » (`index.html:8553-8564`, remplis à `evaluation-calcul.js:1985-1986`) ;
  - la palette Rétroaction : « Note finale : X | Niveau : Y » (`evaluation-retroaction.js:287-292`), sans option « sans note » ;
  - la liste des évaluations (`liste-evaluations.js:1644-1654`, `:1687-1689`) ; la diagnostique y reçoit seulement sa marque et sort de la moyenne ;
  - le PDF de synthèse : la ligne de calcul et « Niveau général » (`synthese-retroaction-rendu.js:391`, `:537-538`), gardes seulement pour la copie non recevable et la copie en points (`synthese-retroaction-data.js:84-98`) ;
  - l'aperçu avant export (`travaux-export-pdf.js:1003-1024`) ;
  - le tableau de notation : une production exclue reste en colonne, marquée « ne compte pas » (`tableau-notation.js:448-450`) ;
  - le profil de l'élève : niveau et pourcentage (`profil-etudiant-sections-affichage.js:2778-2780`), la diagnostique seulement marquée.
- [I] Aucune surface ne **masque** la note d'une production à poids 0 ou exclue ; la diagnostique est marquée ou retirée des agrégats, jamais masquée sur la copie.

### d) Tous les endroits où un code est dessiné ou écrit (lignes de `main`, `5a2bc31be`)

| Où | Ce qui est dessiné | Taille prévue | Fichier |
|---|---|---|---|
| Palette Codes, version étendue | rond de couleur, code en blanc, nom à côté | 20 × 20 px, police 0,7 rem (11,2 px) grasse | `travaux-outils.js:1588`, `styles.css:18795` |
| Palette Codes, version compacte | tuile de couleur | 34 px de haut, 1/5 de 188 px ; police 15 px (1-2 car.), 11 px au-delà ; 3 car. = une case, 4-6 = deux, 7-20 = la rangée | `styles.css:28726-28760`, `travaux-outils.js:1676` |
| Compacte, sous la grille | « K-A. nom » du code actif | 12 px, trois lignes | `travaux-outils.js:1684` |
| Lecteur d'écran | « Code K-A, Code fictif 1, 2 posés » | texte | `travaux-outils.js:1667` |
| La copie | disque plein, code blanc centré | disque = la forme posée, 24/1000 de la largeur de page (`travaux-outils.js:658`, `travaux-annotation.js:1758`) : rayon mesuré de 6,8 px (copie à 567 px) à 10 px (829 px) ; police grasse 1,2 × rayon | `travaux-annotation.js:3092-3117` |
| Le curseur | disque, code blanc | image de 32 px, rayon 15, police 18 px | `travaux-outils.js:2044-2068` |
| Le PDF, pages de copie | même dessin que la copie, au double | police 1,2 × rayon | `travaux-export-pdf.js:601-619` |
| Le PDF, page de synthèse | les deux codes les plus fréquents, en pastille | 18 px, police mono 9 px grasse | `synthese-retroaction-rendu.js:649` |
| Palette Rétroaction (texte) | « Code K-A – nom (×n) : » | texte | `evaluation-retroaction.js:243` |
| Fenêtre de l'engrenage | pastille numérotée | 28 px ; montre la **position** (1 à 10) du repli, jamais un code de grille | `travaux-outils.js:4040`, `styles.css:28919` |
| Écran de la grille | champ « Code » ; table de cas « selon le code » | champ de saisie ; texte en gras | `grilles.js:4956`, `grilles.js:4401` |
| Exports et partage | l'identifiant `errfr_<code>` dans l'annotation (JSON), le code dans la grille partagée (chaîne de 20 au plus, `partage-schemas.js:421`) | rien n'est dessiné | |

La règle de ce qu'un code peut être (`/^[A-Za-z0-9_-]{1,20}$/`) est recopiée en trois endroits : `codes-annotation.js:218`, `tables-cas-algo.js:64`, `materiel-dissection-lecture.js:1171`.

---

## Ce qui est fait, en gestes d'utilisateur

1. **Je monte une grille aux codes de deux ou trois caractères** (« K-A », « QRS ») : la saisie les accepte comme avant.
2. **Je tape un code accentué** (« É-A ») dans le champ Code : il est refusé, le champ se marque et le témoin dit « Non enregistré : un code s’écrit en lettres sans accent, chiffres, tiret ou souligné, 20 caractères au plus. » Rien n'est écrit dans la grille.
3. **Je tape « k-a » alors que « K-A » existe dans le critère** : refusé, et le témoin nomme l'autre code. Changer la casse d'un code sur sa propre ligne reste permis.
4. **J'ouvre une grille déjà enregistrée qui porte un code accentué** : la note sous les sous-critères ne dit plus « pondération 0 » ; elle nomme le code et dit pourquoi il ne se pose pas. Rien n'est réécrit dans la grille.
5. **J'ouvre une copie et je regarde la palette Codes** : chaque code de trois caractères tient sur une ligne, dans une gélule de même largeur, et les noms s'alignent en colonne. Un code d'un ou deux caractères garde son rond.
6. **Je pose « K-A » sur la copie** : le code entier se lit dans le cercle, ses bords ne sont plus rognés. Même chose **sous le curseur** et **dans le PDF**. Un code d'un chiffre, ou « 10 », ne change pas d'un pixel.

## Ce que j'ai tranché, et ce que j'ai supposé

- **Au-delà de trois caractères : ajuster, pas refuser.** Le texte diminue dans le cercle jusqu'à tenir, sans plancher. Mes raisons : la règle des codes admet vingt caractères depuis le 3 septembre, la palette compacte les porte depuis le 1er novembre, et une grille enregistrée peut déjà en avoir (la saisie ne les touche pas). Refuser à quatre poserait un nombre propre à un usage (Règle 15 : le contenant, pas le contenu). Supposé : un code de dix caractères dans un cercle de 7 px se lit mal, mais il se lit entier, ce qui vaut mieux qu'un code tronqué qu'on lit autrement.
- **Un code accentué : la vraie raison, pas posable.** Le rendre posable toucherait les trois copies de la règle (codes, tables de cas, dissection) et l'identifiant `errfr_<code>`, qui voyage dans les annotations exportées. Il ouvrirait aussi deux risques : deux codes identiques à l'œil (un « A » latin et un « А » cyrillique) et un « É » composé différemment sur le Mac et sur l'iPad (NFC/NFD). Supposé : des codes sans accent suffisent au besoin décrit. Si une utilisatrice en a besoin, c'est un lot à part.
- **La casse : le refus vaut à la saisie seulement.** Une grille enregistrée qui porte « K-A » et « k-a » garde deux codes, comme hier : les relire autrement changerait le compte et la somme pondérée de copies déjà annotées (tarir n'est pas réparer). Le même refus vaut pour un doublon exact, qui ne se posait déjà pas. Il vaut pour tout critère algorithmique, activé ou non (le champ Code n'existe que là).
- **Le stock fourni, mesuré** : le pack de démonstration porte onze codes (`0` à `10`), aucun doublon de casse, aucun code non posable, aucun de plus de trois caractères. Les trois départs fournis (`departs/*.zip`) n'ont aucun critère algorithmique (leurs critères sont holistiques ou à cocher, sans sous-critère). L'assistant et la création de matériel fabriquent leurs codes à partir de la saisie : pas de gabarit codé en dur. Rien n'est donc à réparer dans le stock fourni.
- **La marge du cercle : 0,93 du rayon.** À 0,9, « 10 » (le repli) rapetissait d'une fraction de pixel aux petits rayons de la copie : son coin d'encre arrive à 0,923 du rayon (mesuré sous Chromium, DejaVu Sans grasse ; Helvetica est plus étroite).
- **La gélule de trois caractères fait 3,25 em (36,4 px)**, pour aligner les noms. Mesuré : de 29,5 px (« T-B ») à 34,4 px (« W-A ») sans elle. Supposé : sur le Mac, la police système reste sous 36 px pour trois capitales ; si elle dépasse, la gélule s'allonge et un nom se décale de quelques pixels, sans rien recouvrir.

## Fichiers touchés

| Fichier | Ce qui change |
|---|---|
| `js/annotation-formes.js` | `tailleCodeDansCercle` (pure) et `ecrireCodeDansCercle` : la règle du code dans son cercle, une seule fois pour la copie, le PDF et le curseur |
| `js/travaux-annotation.js` | la copie appelle `ecrireCodeDansCercle` (3 lignes) |
| `js/travaux-export-pdf.js` | le PDF appelle `ecrireCodeDansCercle` (3 lignes) |
| `js/codes-annotation.js` | `raisonsSansCode` (la raison de chaque écart, règle inchangée), `refusCodeSaisi` ; `_depuisSousCriteres` lit `raisonsSansCode` |
| `js/grilles.js` | refus du champ Code (`refusCodeSousCritere`), deux textes de refus, `phrasesCodesEcartes` dans la note |
| `tests/integration/codes-en-lettres-lisibles.spec.js` | 7 essais (neuf) |
| `tests/unit/codes-en-lettres-lot1.test.js` | 14 essais (neuf) |
| `plans de travail/` | ce rapport, `TEXTES-2026-11-24-codes-en-lettres-lot-1.md`, 20 captures |

**Fichiers communs avec `lot/tampons-observation-1-regler` (`e1c8ac569`), lignes touchées :**

- `js/travaux-outils.js` : **lignes 2061 à 2066 de `main`** seulement (2061 à 2063 sur la branche) : le dessin du code dans `genererCurseurErrFr`, six lignes devenues trois. La branche des tampons touche 981-1112, puis 2931 et au-delà : rien ne se croise.
- `styles.css` : **lignes 18807 à 18825** (la gélule, ajoutée après `.travaux-errfr-numero`) et **28750-28751** (deux propriétés dans la règle compacte). La branche des tampons ajoute autour de 27624.
- `index.html` : **sept jetons `?v=`** (lignes 20, 11782, 11791, 11916, 11917, 11919, 11923), imposés par le crochet anti-cache au commit, valeur `20261123l` (le jour du build en cours, `1123` : le garde `sentinelle-anticache-fichiers-modifies` l’exige sans bump). ⚠ **Deux de ces lignes, `styles.css` (20) et `travaux-outils.js` (11917), sont aussi changées par la branche des tampons (`20261123t`, même jour) : conflit certain à la fusion**, à régler comme d'habitude par la session principale (un jeton neuf pour les deux).
- Non touchés : `js/tampons-bibliotheque.js`, `js/import-export.js`, `js/codex.js`.

## La preuve

### Rouge sur `main`, vert après (Playwright, Chromium)

Le banc `codes-en-lettres-lisibles.spec.js` a tourné sur `main` (`5a2bc31be`) **avant** la correction : six essais rouges sur six, chacun pour sa raison.

| Essai | Sur `main` | Après |
|---|---|---|
| 1 · la copie : pixels du code hors du disque | K-A 11, QRS 212, W-B 103, M-C 71 ; témoin « 7 » : 0 | 0 partout ; « 7 » : 0, mêmes 119 pixels qu'avant |
| 2 · le PDF : pixels hors du disque | K-A 122, QRS 1 884, W-B 990, M-C 656 ; « 7 » : 0 | 0 partout ; « 7 » : mêmes 1 184 pixels |
| 3 · le curseur : pixels hors du disque | K-A 2, QRS 10, W-B 7 | 0 |
| 4 · palette étendue | 11 codes sur 14 sur deux lignes, 12 hors de leur rond (« QRS » déborde sur une ligne) ; aucun ne recouvre le nom à trois caractères (0 sur 14) : ce défaut de l'essai du matin vient des codes plus longs | 14 sur une ligne, dans leur gélule, avant le nom |
| 5 · saisie « k-a » quand « K-A » existe | écrit | refusé, rien d'écrit ; le témoin « W-B » s'écrit, « k-a » sur sa propre ligne aussi |
| 6 · code accentué | la note dit « pondération 0 » ; « É-A » écrit | la note nomme « É-B » ; « É-A » refusé |
| 4 bis · compacte | (garde neuve, vert sur `main` aussi) | chaque pastille dans sa tuile |

### Break-tests (chaque correction cassée exprès, sur la branche, puis restaurée)

| Cassé | Rougit |
|---|---|
| la taille ne s'ajuste plus | essais 1, 2, 3 ; Vitest A (2), B (2) |
| la gélule retirée | essai 4 |
| la grille ne refuse plus rien | essais 5, 6 |
| un code illisible redevient « poids » | essai 6 ; Vitest C |
| la casse compte de nouveau | essai 5 ; Vitest D |
| la remise à zéro de la compacte retirée | essai 4 bis (tuile de 33,2 px, pastille de 35,75 px) |

### Non-régression au pixel, comparée à `main`

Un script rend, sur `main` puis sur la branche, une grille aux codes 1 à 9 **et** le repli 1 à 10, à deux tailles de code (celle d'un vrai geste et une grande), à 1180 × 820 et 820 × 1180, en clair et en sombre. Il compare les empreintes des pixels du calque de la copie, du canevas du PDF, des dix curseurs et des captures des deux versions de la palette. **Résultat : 8 configurations sur 8 identiques, sur les sept champs.** Avec les quatorze codes en lettres, la palette compacte est identique à `main` dans les quatre configurations ; seule l'étendue change, comme voulu.

### Vitest (lancé depuis `tests/`)

- `tests/unit/codes-en-lettres-lot1.test.js` : 14 essais verts.
- Suite complète : **959 fichiers, 12 348 essais, tous verts.** Deux bancs existants ont rougi en chemin, et j'ai corrigé mon code, pas le banc :
  - `sentinelle-lot4-C-gabarit-algo-range` ancrait la ligne qui lit un sous-critère par son code ; mon remaniement l'avait déplacée. Elle est rendue telle quelle, avec un commentaire qui nomme l'ancre ;
  - le cliquet #642 a refusé une variable locale nommée `cle` (elle masquait le helper `cle()`). Elle est renommée.
  - au premier essai de poussée, `sentinelle-anticache-fichiers-modifies` (qui ne juge qu'après le commit) a refusé mon jeton `?v=20261124l` : un jeton doit porter le jour du build en cours (`1123`), et le mandat exclut le bump. Jeton corrigé en `20261123l` avant toute poussée.

### Bancs Playwright voisins, `main` contre branche (Chromium)

Chromium fait rougir une partie des bancs par construction (leurs motifs d'erreurs attendues sont rédigés pour WebKit) : un vert ou un rouge n'y vaut qu'en comparaison. J'ai donc lancé les 59 bancs voisins (tous ceux dont le nom touche la palette, les codes, l'annotation, la grille, le critère algorithmique ou le PDF) sur `main`, puis sur la branche avec le banc neuf.

| | verts | rouges | sautés |
|---|---|---|---|
| `main` (59 fichiers) | 292 | 6 | 12 |
| branche (les 59 + le banc neuf, 7 essais) | 297 | 8 | 12 |

Les 6 rouges de `main` sont les mêmes sur la branche. Les deux rouges de plus, rejoués seuls de part et d'autre :

- `critere-algorithmique-dit-vrai.spec.js:143` (#1131) : 2 sur 5 sur `main`, 2 sur 5 sur la branche. L'essai lit la base, fait ses gestes, puis la relit, et une « Grille de départ » semée entre-temps le fait rougir : une course dans l'essai.
- `critere-algorithmique-calculs-4a.spec.js:71` : 4 sur 9 sur `main`, 4 sur 12 sur la branche, la même assertion qui tombe des deux côtés (« le défilement ne saute pas », 19 à 24 px). La grille de cet essai n'a aucun sous-critère écarté : la note que j'ai changée y garde mot pour mot son texte d'avant.

⮕ Aucune régression trouvée sous Chromium ; c'est le passage WebKit sur le Mac qui jugera (commande en tête).

### Captures

Dossier `plans de travail/captures-2026-11-24-codes-en-lettres/` (avant = `main`, après = branche) :

- `palette-<taille>-<thème>-<avant|apres>.png` : la palette étendue, à 1180 × 820 et 820 × 1180, en clair et en sombre (16) ;
- `copie-<taille>-<thème>-<avant|apres>.png` : les quatorze codes posés à la taille d'un vrai geste (huit). Le calque d'annotation est le même dans les deux thèmes : seule la page autour change ;
- `pdf-page1-<avant|apres>.png` : le haut de la page 1 du **vrai PDF** (`genererDocPDF`), relu par pdf.js. Le PDF ne dépend ni de la taille de l'écran ni du thème : une capture par état ;
- `curseur-<avant|apres>.png` : le curseur de trois codes, agrandi quatre fois. Même remarque.

## Rejoué ou seulement lu

- **Rejoué** (Chromium) : tous les défauts de l'essai du matin sauf le premier point (voir ci-dessous) ; les corrections ; la non-régression ; la page de synthèse du PDF (trois caractères y tiennent sur une ligne, sans pixel hors du disque ; « W-B » touche le bord d'un pixel) ; le stock fourni.
- **Seulement lu** : les points a, b et c de l'étape 0 ; le premier point de l'essai du matin (« marche tel quel pour deux et trois caractères : compte, somme pondérée, rétroaction, export puis réimport »). Je n'ai rejoué ni le compte, ni la somme, ni l'export. Mon lot ne touche pas ces chemins : la liste des codes rendue par `codes-annotation.js` reste la même, ce que gardent les 21 essais de `sentinelle-codes-par-grille-lot1` et les 14 de mon fichier Vitest.

## Ce qui n'est pas vérifié

- **Safari et l'iPad** : rien (voir l'en-tête). En particulier, la police système du Mac (Helvetica, SF) et la mesure de l'encre (`actualBoundingBox*`) sous Safari. La règle se mesure à l'exécution et devrait s'y adapter, mais personne ne l'a vu.
- Le PDF **imprimé** ou lu dans Aperçu : seulement relu par pdf.js dans Chromium.
- Les codes de **quatre caractères et plus** n'ont pas été rendus au navigateur : la consigne de confidentialité réserve les bancs aux quatorze codes, tous de trois caractères au plus. Leur comportement est prouvé par Vitest, sur des largeurs abstraites (essai A3).
- Le curseur sur l'iPad : un doigt ou le Pencil n'en montrent pas ; il ne compte que sur le Mac, ou sur l'iPad avec un trackpad.

## Trouvailles hors du lot (issue « inscrire et continuer », sans entrée au BACKLOG)

1. **L'import par dissection d'une liste de codes refuse les doublons exacts, pas ceux de casse** (`materiel-dissection-lecture.js:1198-1199`, `vus[code]`). « K-A » et « k-a » collés ensemble y entrent comme deux codes, ce que la saisie refuse désormais. Je n'ai pas mesuré l'import d'une grille partagée sur ce point.
2. **La page de synthèse du PDF, au-delà de trois caractères** : pastille de 18 px, police mono de 9 px, soit 5,4 px par caractère ; quatre caractères (21,6 px) déborderaient. Calculé, non rendu (confidentialité).
3. **CSS et branche mortes de la colonne ancrée** : plus aucun élément ne porte `.annot-col-droite` ni `#annot-errfr-contenu` (aucune occurrence dans `index.html` ni `js/`), mais `styles.css:28801-28810` les stylise et `rafraichirPalettesApresPersonnalisation` les cherche (`travaux-outils.js:4225-4228`), lignes de `main`.
4. **La rétroaction écrite trie les codes inconnus de la grille par `parseInt`** (`evaluation-retroaction.js:238`), qui rend `NaN` pour un code en lettres : l'ordre de ces codes-là n'est pas défini. Sans effet sur un code que la grille connaît (trié par sa place dans la liste).
5. **La règle de ce qu'un code peut être est recopiée trois fois** (point d) : un futur changement (des accents, par exemple) devra toucher les trois.
6. **Deux bancs instables sous Chromium, sur `main` comme sur la branche** : `critere-algorithmique-dit-vrai.spec.js:143` (une « Grille de départ » semée pendant l'essai) et `critere-algorithmique-calculs-4a.spec.js:71` (un saut de défilement de 19 à 24 px). Chiffres dans « La preuve ». Non mesuré sous WebKit.
7. Hors du lot par mandat : **aucune touche du clavier ne pose un code en lettres** (`toucheDuCode` ne donne de touche qu'aux codes 1 à 10). Non traité.

## Aperçu

**https://deploy-preview-59--codexnumeris-051225.netlify.app**, demande en brouillon [bedardg71-codexnumeris/labo-codex#59](https://github.com/bedardg71-codexnumeris/labo-codex/pull/59) (« APERÇU, ne pas fusionner »).

Netlify l'annonce prêt (« Deploy Preview ready! ») pour le commit `c1c6d414d`, celui du lot. Je ne l'ai pas ouvert : le réseau du nuage refuse l'hôte `netlify.app`. Le numéro en bas de page reste celui de `main` (1.258.1, build 1123-1652), puisque le lot ne bumpe pas : c'est le jeton `?v=20261123l` des fichiers du lot qui distingue l'aperçu.

## Les gestes à essayer

Ce lot ne touche que l'apparence et deux refus de saisie : un raté se voit à l'écran et se corrige, rien ne s'écrit dans tes données (règle 2 des portes terrain : pas de porte due). Ces gestes servent à voir, de tes yeux, ce qu'aucune machine du nuage ne peut juger : Safari et l'iPad. Sur l'adresse de l'aperçu, d'abord le Mac, puis l'iPad.

L'aperçu est une adresse à part : il ne voit pas tes données de `app.codexnumeris.org`, et rien de ce que tu y fais ne les touche.

1. Ouvre https://deploy-preview-59--codexnumeris-051225.netlify.app, crée une grille avec un critère algorithmique et donne à ses sous-critères les codes fictifs K-A, K-B, K-C, M-A, M-B, M-C, T-A, T-B, T-C, V-A, V-B, QRS, W-A, W-B (noms « Code fictif 1 » à « Code fictif 14 »).
   ⮕ Attendu : la note sous les sous-critères dit « ces 14 sous-critères ».
2. Dans un quinzième sous-critère, tape « k-a ».
   ⮕ Attendu : le champ se marque et le témoin dit que « K-A » est déjà dans ce critère.
3. Tape « É-A » à la place.
   ⮕ Attendu : refusé aussi, le témoin dit qu'un code s'écrit sans accent.
4. Ouvre une copie d'une production évaluée avec cette grille, en Annoter, et regarde la palette Codes.
   ⮕ Attendu : chaque code sur une ligne, dans une gélule, les noms alignés. Avant : « K- » et « A » l'un sous l'autre.
5. Pose K-A, QRS et W-B sur la copie, puis zoome.
   ⮕ Attendu : les trois codes se lisent en entier dans leur cercle. Avant : les bords rognés, « W-B » lu « W-E ».
6. Sur le Mac seulement : choisis W-B et survole la copie.
   ⮕ Attendu : le curseur montre « W-B » entier.
7. Exporte le PDF de cette copie et ouvre-le dans Aperçu.
   ⮕ Attendu : les trois codes se lisent en entier dans leur cercle.
8. Ouvre une copie évaluée avec une de tes grilles habituelles (codes 1 à 10).
   ⮕ Attendu : rien n'a changé, ni la palette ni les codes posés.
