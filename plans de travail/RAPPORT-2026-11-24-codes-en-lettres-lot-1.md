# Rapport : des codes d'annotation en lettres, lisibles partout (lot 1)

> **Rien n'a été jugé sous Safari ni sur l'iPad, ni au lot 1 ni à sa suite.** Le nuage n'a pas WebKit : tout ce qui suit a tourné sous Chromium (Linux, police DejaVu Sans). Le passage WebKit est à lancer sur le Mac, depuis `tests/` :
>
> ```bash
> cd tests && npx playwright test integration/codes-en-lettres-lisibles.spec.js integration/essai-codes-en-lettres-depart.spec.js integration/codes-par-grille-gabarit.spec.js integration/codes-par-grille-palette.spec.js integration/codes-touche-est-le-numero.spec.js integration/critere-algorithmique-palette.spec.js integration/critere-algorithmique-coller-codes.spec.js integration/erreurs-palette-codes-fermee.spec.js --trace off
> ```
>
> (Sans `-c`, la configuration par défaut est WebKit.)

**Dernier relais.** Branche `lot/codes-en-lettres-1-lisibles`, partie de `main` à `5a2bc31be`. Lot 1 (mandat de Cowork du 24 nov. 2026, 15 h 45) : commits `c1c6d414d` et `3dc0cf3cf` ; mesure de l'étape 0, codes lisibles, refus à la saisie (accent, casse), vraie raison à l'écran de la grille. **Suite (consigne de 17 h 55) : commit suivant, section « Suite : la pastille » plus bas** ; la pastille (copie, curseur, PDF, synthèse) remplace le texte qui rapetissait dans le cercle, quatre caractères au plus à la saisie, la palette alignée à trois et quatre caractères, un fichier de départ d'essai. Ni fusion dans `main`, ni bump, ni ligne de Nouvelles, ni entrée de `RELAIS.md` (elle s'écrira à la fusion, exception décidée par Cowork). Aperçu : demande en brouillon « APERÇU, ne pas fusionner » (adresse plus bas). **Retour d'essai (iPad, 24 nov., 19 h 10) : section « Retour d'essai » plus bas** ; le fichier d'essai porte une évaluation commencée et le PDF se produit par les gestes ; la copie exportée sans code (défaut 1) existe sur `main`, pour toute annotation d'une copie en image : **corrigé à part, sur `correctif/copie-exportee-annotee` (décision du 25 nov.)**. Reste : le passage WebKit sur le Mac, les gestes à essayer (réécrits au retour), le retrait des pièces d'essai avant la fusion, les deux lots suivants (diagnostic erreurs-mots, suivi).

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
2. **Je tape un code accentué** (« É-A ») dans le champ Code : il est refusé, le champ se marque et le témoin dit « Non enregistré : un code s’écrit en lettres sans accent, chiffres, tiret ou souligné. » (↻ suite : « 20 caractères au plus » retiré) Rien n'est écrit dans la grille.
3. **Je tape « k-a » alors que « K-A » existe dans le critère** : refusé, et le témoin nomme l'autre code. Changer la casse d'un code sur sa propre ligne reste permis.
4. **J'ouvre une grille déjà enregistrée qui porte un code accentué** : la note sous les sous-critères ne dit plus « pondération 0 » ; elle nomme le code et dit pourquoi il ne se pose pas. Rien n'est réécrit dans la grille.
5. **J'ouvre une copie et je regarde la palette Codes** : chaque code de trois caractères tient sur une ligne, dans une gélule de même largeur, et les noms s'alignent en colonne. Un code d'un ou deux caractères garde son rond.
6. ↻ *Remplacé par la suite (la pastille).* **Je pose « K-A » sur la copie** : le code entier se lit dans le cercle, ses bords ne sont plus rognés. Même chose **sous le curseur** et **dans le PDF**. Un code d'un chiffre, ou « 10 », ne change pas d'un pixel.

## Ce que j'ai tranché, et ce que j'ai supposé

- ↻ *Renversé par Grégoire (17 h 45) : la pastille, et quatre caractères au plus à la saisie ; voir la suite.* **Au-delà de trois caractères : ajuster, pas refuser.** Le texte diminue dans le cercle jusqu'à tenir, sans plancher. Mes raisons : la règle des codes admet vingt caractères depuis le 3 septembre, la palette compacte les porte depuis le 1er novembre, et une grille enregistrée peut déjà en avoir (la saisie ne les touche pas). Refuser à quatre poserait un nombre propre à un usage (Règle 15 : le contenant, pas le contenu). Supposé : un code de dix caractères dans un cercle de 7 px se lit mal, mais il se lit entier, ce qui vaut mieux qu'un code tronqué qu'on lit autrement.
- **Un code accentué : la vraie raison, pas posable.** Le rendre posable toucherait les trois copies de la règle (codes, tables de cas, dissection) et l'identifiant `errfr_<code>`, qui voyage dans les annotations exportées. Il ouvrirait aussi deux risques : deux codes identiques à l'œil (un « A » latin et un « А » cyrillique) et un « É » composé différemment sur le Mac et sur l'iPad (NFC/NFD). Supposé : des codes sans accent suffisent au besoin décrit. Si une utilisatrice en a besoin, c'est un lot à part.
- **La casse : le refus vaut à la saisie seulement.** Une grille enregistrée qui porte « K-A » et « k-a » garde deux codes, comme hier : les relire autrement changerait le compte et la somme pondérée de copies déjà annotées (tarir n'est pas réparer). Le même refus vaut pour un doublon exact, qui ne se posait déjà pas. Il vaut pour tout critère algorithmique, activé ou non (le champ Code n'existe que là).
- **Le stock fourni, mesuré** : le pack de démonstration porte onze codes (`0` à `10`), aucun doublon de casse, aucun code non posable, aucun de plus de trois caractères. Les trois départs fournis (`departs/*.zip`) n'ont aucun critère algorithmique (leurs critères sont holistiques ou à cocher, sans sous-critère). L'assistant et la création de matériel fabriquent leurs codes à partir de la saisie : pas de gabarit codé en dur. Rien n'est donc à réparer dans le stock fourni.
- **La marge du cercle : 0,93 du rayon.** À 0,9, « 10 » (le repli) rapetissait d'une fraction de pixel aux petits rayons de la copie : son coin d'encre arrive à 0,923 du rayon (mesuré sous Chromium, DejaVu Sans grasse ; Helvetica est plus étroite).
- ↻ *Étendu par la suite à quatre caractères (4,25 em).* **La gélule de trois caractères fait 3,25 em (36,4 px)**, pour aligner les noms. Mesuré : de 29,5 px (« T-B ») à 34,4 px (« W-A ») sans elle. Supposé : sur le Mac, la police système reste sous 36 px pour trois capitales ; si elle dépasse, la gélule s'allonge et un nom se décale de quelques pixels, sans rien recouvrir.

## Fichiers touchés

| Fichier | Ce qui change |
|---|---|
| `js/annotation-formes.js` | `tailleCodeDansCercle` (pure) et `ecrireCodeDansCercle` : la règle du code dans son cercle, une seule fois pour la copie, le PDF et le curseur (↻ suite : retirées, remplacées par `geometriePastille`, `geometrieCode`, `dessinerCode`) |
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

Netlify reconstruit l'aperçu à chaque poussée de la branche. Il l'a annoncé prêt (« Deploy Preview ready! ») pour `c1c6d414d` (le lot 1), puis pour `b018478a3` (la suite). Je ne l'ai pas ouvert : le réseau du nuage refuse l'hôte `netlify.app`. Le numéro en bas de page reste celui de `main` (1.258.1, build 1123-1652), puisque le lot ne bumpe pas : c'est le jeton `?v=20261123m` des fichiers du lot qui distingue l'aperçu. Le fichier d'essai : `/departs.html` de la même adresse.

## Suite : la pastille (consigne de Cowork du 24 nov., 17 h 55)

> **Toujours rien sous Safari ni sur l'iPad.** Commande WebKit mise à jour en tête du rapport.

Décisions de Grégoire (17 h 45 à 17 h 49), appliquées : la pastille sur la copie ; quatre caractères au plus ; rien de propre à un métier ; aucun raccourci clavier pour un code en lettres (rien codé : la touche reste celle des codes 1 à 10).

### Ce qui est fait, en gestes d'utilisateur

1. **Je pose « K-A », « QRST » ou « W-12 » sur la copie** : le code se dessine dans une pastille de la hauteur du cercle, aux bouts arrondis, centrée sur le point touché, **le texte à la taille d'un chiffre**. Même règle **sous le curseur** (l'image s'élargit, le point actif reste au centre) et **dans le PDF**.
2. **Un code d'un ou deux caractères** (« 7 », « 10 ») garde le cercle d'hier, au pixel près.
3. **Je tape « ABCDE »** dans le champ Code : refusé ; le témoin dit « Non enregistré : un code a quatre caractères au plus : plus long, il couvre trop de place sur la copie. »
4. **Je colle, dans « Apporter mon matériel », une liste où un code a cinq caractères** : ce qui manque le nomme (« des codes de 4 caractères au plus (« ABCDE ») »).
5. **Une grille déjà enregistrée porte « ABCDEF »** : il reste posable et compté comme hier ; sur la copie, sa pastille s'arrête à la largeur de quatre caractères larges et son texte rapetisse pour y tenir. Retaper la même valeur sur sa ligne n'est pas refusé.
6. **Je touche le bout d'une pastille** : elle se sélectionne ; je la glisse, la duplique, l'efface ; un rectangle de sélection qui ne couvre que son bout la prend ; ses poignées sont aux coins de la pastille, et la tirer la fait grandir autour de son centre.
7. **La palette Codes** : les noms des codes de trois et de quatre caractères commencent à la même abscisse (capture ci-dessous).
8. **La page de synthèse du PDF** : « QRST » tient dans sa pastille, sur une ligne, avant son nom.
9. **Un fichier de départ** : je l'ouvre dans l'aperçu et je pose des codes tout de suite (« Les gestes à essayer »).

### Ce que j'ai tranché, et ce que j'ai supposé

- **Cercle ou pastille selon la longueur du code, pas sa largeur** : un ou deux caractères, le cercle ; trois et plus, la pastille, même pour un code étroit. Une règle qu'on prévoit à l'œil, et l'identité au pixel des codes d'un ou deux caractères (comparée à `main`, ci-dessous).
- **La taille du texte** : celle d'un chiffre dans un cercle de même rayon (1,2 × le rayon ; 18 px au curseur). Le texte n'est réduit qu'au-delà du plafond.
- **Le plafond** : la largeur de « MMMM » (quatre capitales larges) à la taille d'un chiffre, mesurée au dessin. Supposé : « la largeur de quatre caractères » veut dire quatre caractères larges, pas quatre « I ». Un code de quatre « W » (plus larges que « M ») se réduirait d'un cheveu ; aucun des dix-sept ne l'est.
- **Rien n'est enregistré** : la largeur se calcule au dessin, à partir du code. La sélection la relit de la même fonction (`geometrieCode`).
- **Le redimensionnement d'un code en pastille se fait autour de son centre** (le rapport des distances du pointeur au centre), alors que les autres symboles s'ancrent au coin opposé. Sans cela, ancrer au coin du cadre élargi déplaçait la donnée au premier geste. Les codes d'un ou deux caractères gardent l'ancrage d'hier.
- **La saisie** : un code déjà présent sur sa ligne n'est pas une saisie neuve (sinon, retoucher une grille ancienne refuserait son propre code). L'ordre des refus : caractères, longueur, doublon.
- **La page de synthèse** : dès qu'un des deux codes listés a trois caractères ou plus, la colonne des pastilles passe de 22 à 30 px pour les deux lignes (les noms restent alignés) ; sinon, rien ne change (comparé au pixel à `main`). Au-delà de quatre, la police mono y rapetisse en proportion (9 × 4 / longueur).
- **La palette étendue** : 4,25 em (47,6 px) pour les codes de trois et quatre caractères **quand la liste porte un code de quatre ou plus** (`:has()`, déjà employé 46 fois dans `styles.css`) ; une liste de codes à trois caractères garde ses 36,4 px.
- **La borne de quatre** vit dans `codesAnnotation.MAX_SAISIE` ; la dissection, qui se charge sans ce module en Node, en garde une copie (`MAX_CARACTERES_CODE`) que Vitest tient égale.

### Les portes d'entrée d'un code neuf (mesurées)

| Porte | Ce qu'elle fait | Quatre au plus ? |
|---|---|---|
| Le champ « Code » de la grille (`grilles.js:6296`, `modifierSousCritere` → `refusCodeSousCritere`, `:5455`) | saisie libre | **oui** : refus T3 |
| La liste collée, « Apporter mon matériel » (`materiel-dissection-lecture.js:1188`, `codesCompris` → `materiel-creation.js:172`) | les codes du document | **oui** : raison C1, rien n'est créé |
| « + Ajouter un sous-critère » (`grilles.js:5439`, `codeSousCritereNeuf`) | le plus grand code numérique, plus un | numérique ; ne passerait cinq chiffres qu'après un code 9 999 (non traité) |
| La liste de départ, codes 1 à 10 (`grilles.js:6234`, `initialiserSousCriteresParDefaut`) | dix codes fixes | sans objet |
| L'assistant de matériel (`materiel-assistant.js:320`) | le rang, 0, 1, 2… | numérique |
| La migration des anciennes catégories (`grilles.js:6694`) | le stock d'hier | **ce qui voyage : rien refusé** |
| L'import d'une grille, le partage (`partage-schemas.js`, chaîne de 20), le codex, l'import-export | ce qui voyage | **rien refusé** |

### La surface : la pastille comparée au cercle (mesurée, Chromium)

Largeur de la couleur ÷ diamètre du cercle, sur la copie (rayon 14,8 px), dans le PDF (rayon 48 px) et au curseur (image ÷ 30 px) :

| Codes | Copie | PDF | Curseur |
|---|---|---|---|
| Trois caractères (K-A, W-B, M-C, QRS) | 1,28 à 1,59 | 1,26 à 1,53 | 1,40 à 1,67 |
| Quatre caractères (K-AB, W-12, QRST) | 1,66 à 1,96 | 1,66 à 1,93 | 1,73 à 2,03 |
| Le stock, six caractères (ABCDEF, plafonné) | 2,16 | 2,18 | |

En surface (1 + 4 × (largeur − 1) / π, la pastille étant un cercle allongé d'un rectangle) : de 1,36 à 1,75 fois le cercle à trois caractères, de 1,84 à 2,22 à quatre, 2,49 au plafond. « QRS » et « QRST » sont les plus larges : le « Q » et le « R ».

### Fichiers touchés (suite)

| Fichier | Ce qui change |
|---|---|
| `js/annotation-formes.js` | `geometriePastille` (pure), `geometrieCode`, `tracerPastille`, `dessinerCode` : la règle, une fois ; `tailleCodeDansCercle` et `ecrireCodeDansCercle` retirées |
| `js/travaux-annotation.js` | la copie appelle `dessinerCode` ; `numeroDuCode`, `demiLargeurPastille`, `cadreALaPastille` (le cadre suit la pastille), `redimensionnerPastille` |
| `js/travaux-export-pdf.js` | le PDF appelle `dessinerCode` |
| `js/synthese-retroaction-rendu.js` | la pastille de la page de synthèse (`renderErreurs`) |
| `js/codes-annotation.js` | `MAX_SAISIE`, le refus « long », la ligne inchangée qui n'est pas une saisie neuve |
| `js/grilles.js` | le texte T3, T1 et N1 sans « 20 caractères au plus » |
| `js/materiel-dissection-lecture.js` | `MAX_CARACTERES_CODE`, la raison C1 |
| `departs.html`, `departs/ESSAI-codes-en-lettres-lot-1.zip` | **essai** : la section et le fichier |
| `tests/departs-de-parcours/essai-codes-en-lettres.js`, `essai-codes-en-lettres.spec.js` | **essai** : la fabrique du fichier |
| `tests/integration/essai-codes-en-lettres-depart.spec.js` | **essai** : le banc qui ouvre le fichier |
| `tests/integration/codes-en-lettres-lisibles.spec.js` | 11 essais (7 neufs ou réancrés) |
| `tests/unit/codes-en-lettres-lot1.test.js` | 21 essais (A, B réancrés ; D, E étendus) |
| `tests/unit/sentinelle-contenir-complexite.test.js`, `tests/fixtures/cliquets/complexite-fonctions-30.json` | une hausse assumée, écrite : `appliquerRedimensionnement` 35 → 36 (un `if` d'une ligne qui délègue) |

**Fichiers communs avec `lot/tampons-observation-1-regler` (`e1c8ac569`), lignes touchées, cumulées depuis `main` :**

- `js/travaux-outils.js` : **lignes 2056 à 2067 de `main`** (le curseur, `genererCurseurErrFr`). La branche des tampons touche 981-1112, puis 2931 et au-delà.
- `styles.css` : **lignes 18807 à 18832** (la gélule et l'alignement) et **28757-28758** (la compacte). La branche des tampons ajoute autour de 27624.
- `index.html` : **neuf jetons `?v=`** à `20261123m` (lignes 20, 11782, 11791, 11798, 11916, 11917, 11919, 11922, 11923). Conflit certain à la fusion sur `styles.css` (20) et `travaux-outils.js` (11917).

### La preuve (suite)

#### Rouge avant, vert après (Playwright, Chromium)

« Avant » est l'état de 17 h 38 (`3dc0cf3cf`), sur lequel j'ai lancé le banc réécrit avant toute retouche.

| Essai | À 17 h 38 | Après |
|---|---|---|
| 1 · la copie | rouge : « K-A » dans le cercle, encre de 9 px contre 12 pour « 7 » | vert : pastilles, encre de 12 à 15 px, « 7 » inchangé |
| 2 · le PDF | rouge : « K-A » à 32 px d'encre contre 40 | vert |
| 3 · le curseur | rouge : image de 32 px, encre de 10 px | vert : image de 42 à 61 px, encre de 12 à 15 px |
| 3 bis · toucher, déplacer, dupliquer, effacer, rectangle, poignée | rouge : le bout de la pastille ne se touche pas | vert |
| 4 · palette, noms alignés (trois et quatre) | rouge : les codes de quatre poussent leur nom de 1,4 à 4,4 px | vert : une seule abscisse |
| 4 ter · page de synthèse | rouge : « QRST » sort de son rond de 18 px | vert : une ligne, dans la pastille, avant le nom |
| 5 bis · « ABCDE » à la saisie ; « ABCDEF » ancien | rouge : « ABCDE » écrit | vert |
| 4 bis, 5, 6 (gardes) | vertes | vertes |

#### Break-tests de la suite

Dix ruptures, chacune seule, puis restaurée (empreintes des fichiers vérifiées) :

| Rupture | Rougit |
|---|---|
| A1 · toujours le cercle | essais 1, 2, 3 ; Vitest B (3) |
| A2 · le texte rapetisse dans la pastille | essais 1, 2 |
| A3 · pas de plafond | essai 1 ; Vitest A et B |
| A4 · le cadre ne suit pas la pastille | essai 3 bis (rejoué sur le code final) |
| A5 · le redimensionnement ancré au coin du cadre | essai 3 bis (rejoué sur le code final) |
| B · la synthèse garde le rond de 18 px | essai 4 ter |
| C1 · la saisie accepte cinq caractères | essai 5 bis ; Vitest D |
| C2 · la liste collée accepte cinq caractères | Vitest E |
| C3 · un code ancien laissé tel quel est refusé | essai 5 bis ; Vitest D |
| D · les noms ne s'alignent plus à quatre caractères | essai 4 |
| Le fichier de départ privé de sa copie | le banc d'ouverture du fichier |

#### Non-régression au pixel, comparée à `main`

Les codes d'un et deux caractères : le même script qu'au lot 1 (grille 1 à 9 et repli 1 à 10 ; copie, PDF, curseurs, palettes étendue et compacte ; deux tailles d'écran, deux thèmes) : **8 configurations sur 8 identiques**. La page de synthèse avec « 10 » et « 7 » : **identique** (même empreinte). La palette compacte avec les dix-sept codes en lettres : **identique** dans les quatre configurations (taille, thème) ; seule l'étendue change, comme voulu.

#### Vitest et bancs voisins

- **Vitest complet** (depuis `tests/`), sur l'état final : **959 fichiers, 12 355 essais, tous verts**. Un cliquet a rougi en chemin : `sentinelle-contenir-complexite` refusait `calculerBBox` à 31 et `appliquerRedimensionnement` monté de 35 à 40. J'ai extrait (`cadreALaPastille`, `redimensionnerPastille`) : `calculerBBox` revient sous 31, et la hausse restante (35 → 36, un `if` d'une ligne) est écrite dans `HAUSSES_ASSUMEES`, comme le cliquet le demande.
- **Les bancs voisins, `main` contre branche** (Chromium) : les 59 du lot 1, plus 19 de la dissection, du matériel et des départs, et mes deux bancs.

| | verts | rouges | sautés |
|---|---|---|---|
| `main` (78 fichiers) | 348 | 7 | 12 |
| branche (les 78, plus le banc neuf et celui du fichier d'essai) | 355 | 11 | 12 |

Les 7 rouges de `main` sont rouges sur la branche aussi. Les 4 de plus, rejoués seuls de part et d'autre :

- `critere-algorithmique-dit-vrai.spec.js:143` : la course déjà mesurée au lot 1 (2 sur 5 de chaque côté).
- `bareme-grille-neuve-1120.spec.js:168` et `:181` : instables des deux côtés. Rejoués seuls, ils passent sur la branche, et l'un rougit sur `main` (`:178`).
- `critere-algorithmique-calculs-4c.spec.js:159` : **instable sur `main` (1 échec sur 15), plus souvent sur la branche (6 sur 19)**, et déjà à 17 h 38 (2 sur 6). Avec le `grilles.js` de `main` sur la branche, il échoue encore (2 sur 8) : la cause n'est pas dans `grilles.js`, **et je ne l'ai pas isolée**. Ce que l'erreur montre : l'essai tape « x » dans le décompte (la vue éditable), écrit ensuite directement le champ caché (un geste qu'aucun utilisateur ne fait), et la vue, en perdant le focus, réécrit son texte affiché (l'ancien) par-dessus. C'est une course entre deux écritures. Je la crois propre à l'essai, sans la prouver. Inscrite aux trouvailles (10).

⮕ Aucune régression établie sous Chromium. Une instabilité plus fréquente, de cause non isolée, reste à suivre ; c'est le passage WebKit sur le Mac qui jugera.

### Captures

Dossier `plans de travail/captures-2026-11-24-codes-en-lettres-suite/`. « Avant » : l'état de 17 h 38 (`3dc0cf3cf`) ; « après » : la suite. Les dix-sept codes posés à la taille d'un vrai geste :

- `copie-<taille>-<thème>-<avant|apres>.png` (huit) ;
- `palette-<taille>-<thème>-<avant|apres>.png` (huit ; la palette agrandie pour montrer ses dix-huit codes, le code ancien « ABCDEF » n'y est pas : la grille des captures porte les dix-sept) ;
- `pdf-page1-<avant|apres>.png` : le haut de la page 1 du vrai PDF, relu par pdf.js ;
- `curseur-<avant|apres>.png` : six curseurs, agrandis quatre fois.

⚠ **Une erreur de ma part, au lot 1** : mes captures « après » de 17 h 38 avaient été prises **avant** ma dernière retouche CSS (la largeur commune des gélules). Le rapport disait les noms alignés, d'après le banc ; la capture montrait l'état d'avant. Les captures de la suite sont prises sur le code commité.

### Le fichier de départ d'essai

- **Ce qu'il porte** : une classe montée par les gestes de « Mettre ta classe en place » (Automne 2026, 601-101-MQ, quatre personnes manifestement fictives, « Fictif-01 Personne-01 » à « Fictif-04 Personne-04 ») ; la grille « Grille fictive : codes en lettres » (un critère algorithmique, les dix-sept codes) ; la production « Production fictive : codes en lettres » ; la copie fictive `tests/fixtures/perspective-coins/loutre-pleine-image.jpg` (un texte inventé, déjà au dépôt), importée par le vrai chemin d'import, associée à « Fictif-01 ». Le codex s'appelle « ESSAI, codes en lettres (fictif) » ; 235 Ko.
- **Où** : `departs/ESSAI-codes-en-lettres-lot-1.zip`, servi par l'aperçu à `/departs.html` (une section « Essai : les codes en lettres » en tête).
- **Ce qui le prouve** : `tests/integration/essai-codes-en-lettres-depart.spec.js` l'ouvre dans un espace vide par les gestes de l'iPad, ouvre la copie par la liste des évaluations, trouve les dix-sept codes et pose « QRST ». Un codex privé de sa copie le fait rougir.
- **À retirer avant la fusion : oui.** Les pièces : `departs/ESSAI-codes-en-lettres-lot-1.zip`, la section `data-essai="codes-en-lettres"` de `departs.html`, `tests/departs-de-parcours/essai-codes-en-lettres.js`, `tests/departs-de-parcours/essai-codes-en-lettres.spec.js`, `tests/integration/essai-codes-en-lettres-depart.spec.js`. ⚠ `departs.html` et `departs/` sont eux-mêmes marqués « essai seulement » dans `scripts/construire-publication.mjs` depuis le 20 nov. : c'est à la session principale de dire s'ils restent publiés.

### Ce qui n'est pas vérifié (suite)

- Safari et l'iPad (redit) : la mesure de l'encre et le dessin des bouts arrondis sous WebKit ; `:has()` dans la palette ; le curseur élargi (Safari accepte des images de curseur jusqu'à 128 px, je ne l'ai pas vu) ; l'ouverture du fichier d'essai sur l'iPad.
- La page de synthèse rastérisée par html2canvas dans le vrai PDF : je l'ai mesurée rendue au navigateur, pas dans le PDF.
- Le redimensionnement au doigt : éprouvé à la souris (événements de pointeur), pas au toucher.
- La police du Mac : la gélule de 4,25 em suppose quatre capitales ordinaires sous 47,6 px.

### Rejoué ou seulement lu (suite)

- **Rejoué** (Chromium) : tout ce qui précède ; le fichier de départ, fabriqué puis rouvert dans un espace vide ; les portes d'entrée « champ Code » et « liste collée ».
- **Seulement lu** : les portes « + Ajouter un sous-critère », « liste de départ », « assistant », « migration », « import et partage » (leurs codes sont numériques, fixes ou voyagent : lus dans le code, pas rejoués).

### Trouvailles hors du lot (suite, issue « inscrire et continuer »)

8. **« + Ajouter un sous-critère » ne connaît pas la borne de quatre** : après un code « 9999 », il proposerait « 10000 ». Sans conséquence observable aujourd'hui.
9. **La raison voisine de la liste collée dit encore « 20 caractères au plus »** pour un code illisible (`materiel-dissection-lecture.js`, ancrée par un banc d'un autre lot) : proposée au fichier des textes.
10. **`critere-algorithmique-calculs-4c.spec.js:159` perd une course plus souvent sur la branche** (6 sur 19, contre 1 sur 15 sur `main`), cause non isolée (détail dans « La preuve (suite) »). À bisecter, fichier par fichier, sur une machine au calme ; ou à rendre l'essai sûr (écrire par la vue, comme un utilisateur).

## Retour d'essai (Grégoire, iPad, 24 nov., 19 h 10 à 19 h 30)

> **Toujours rien sous Safari ni sur l'iPad.** Tout ce qui suit a tourné sous Chromium, dans le nuage. La commande WebKit en tête du rapport vaut encore ; elle comprend `essai-codes-en-lettres-depart.spec.js`, qui joue maintenant le PDF de bout en bout.

Vu et jugé bon par Grégoire : la palette, les pastilles, le déplacement par le bout. Je ne l'ai pas remesuré.

### Défaut 1 : la copie exportée n'a aucun code

**Où il existe (rejoué, Chromium).** Sur `main` (`5a2bc31be`) comme sur la branche, avec un code d'un chiffre comme avec des codes en lettres, et même pour un trait de stylo : la version « _annote » d'une copie **en image** ne porte **aucune** annotation. La version annotée d'une copie **en PDF** les porte toutes, sur `main` comme sur la branche. Ce n'est donc ni la branche ni les codes en lettres.

**Cause (lue, puis confirmée par le correctif).** `aplatirAnnotationsImage` (`js/travaux-archivage.js:633` et `:647`) appelle le dessin sans l'attendre, puis transforme aussitôt le canevas en JPEG. Or `travauxExportPDF.dessinerAnnotationsSurCtx` (`js/travaux-export-pdf.js:274`) est asynchrone et attend le chargement des autocollants **avant** son premier trait : quand le JPEG se fait, rien n'est encore dessiné. Le chemin d'une copie importée en PDF (`rendrePDFAvecAnnotations`, que tu m'as demandé de vérifier) attend, lui, son dessin (`js/travaux-export-pdf.js:1220`) : il est sain.

**Ancienneté.** Le défaut est déjà là dans le plus vieux commit que ce clone connaît (il est tronqué, au 22 nov.) : je ne peux pas le dater plus loin d'ici. Inférence : il remonte au jour où le dessin de l'export est devenu asynchrone, pour les autocollants.

**Pas corrigé : plus large et plus ancien que le lot.** Le correctif touche toutes les annotations d'une copie en image, pas les seuls codes en lettres. Tu as écrit « s'il est plus large et ancien, dis-le avant d'élargir » : je le dis, et il attend ton accord. ↻ **Décision de Grégoire (25 nov., 5 h 40) : une correction à part, qui part seule.** Elle vit sur la branche `correctif/copie-exportee-annotee` (rapport `plans de travail/RAPPORT-2026-11-25-copie-exportee-annotee.md`) ; le dossier de proposition est retiré d'ici, son contenu y est passé. Le lot recevra le correctif à sa fusion. Ce que contenait la proposition :

- `correctif.diff` : trois lignes de `js/travaux-archivage.js` (`img.onload` devient `async`, l'appel du dessin est attendu, la fonction relais rend sa promesse). L'appliquer demande aussi de changer le jeton `?v=` de ce fichier dans `index.html`, fichier partagé avec la branche des tampons (une ligne de plus en conflit possible).
- `copie-exportee-annotee-2026-11-25.spec.js` : le banc, hors de la suite parce qu'il est rouge sans le correctif. Deux copies fictives (une image, un PDF), chacune avec « 7 », « K-A », « QRST » et un trait ; l'export par la fonction de « Exporter des travaux » ; il compte les pixels rouges de chaque version annotée.

| Mesure (Chromium, banc de la proposition) | Image annotée | PDF annoté |
|---|---|---|
| `main` et la branche, sans correctif | 0 pixel rouge : **rouge** | 31 428 |
| La branche, correctif appliqué | 14 325 : **vert** | 31 428 |
| Break-test : correctif appliqué, seul l'`await` retiré | 0 : **rouge** | 31 428 |

Correctif appliqué le temps de ces mesures, puis retiré : le dépôt n'en garde que la proposition.

**Les images jointes** (`plans de travail/captures-2026-11-25-codes-en-lettres-retour/`), exportées par les gestes de l'écran à partir du fichier d'essai, trois codes posés (« Évaluation › Exporter », « Exporter des travaux », « Télécharger ») :

- `copie-exportee-annotee-avant.jpg` : la version « _annote » telle que l'export la rend aujourd'hui, sans un code (0 pixel du rouge de « K-A ») ;
- `copie-exportee-annotee-apres.jpg` : la même, correctif appliqué le temps de l'export (504 pixels du rouge de « K-A », les trois pastilles visibles).

### Défaut 2 : le PDF n'était pas jouable avec le fichier d'essai

**Cause (rejouée).** Le fichier ne portait aucune évaluation ; « Exporter pour Léa » n'exporte qu'une évaluation verrouillée. Sans elle, le compteur dit « Aucune évaluation trouvée » et l'export échoue.

**Ce que j'ai ajouté au fichier.** Une évaluation commencée, non verrouillée, de la copie de Fictif-01 : 300 mots. La fabrique la fait par les gestes (« Annoter ▾ », « Évaluer », le champ Mots), pas par une écriture en base. Le fichier régénéré pèse 236 Ko ; sa phrase dans `departs.html` dit « son évaluation commencée » (E2 du fichier des textes).

**Les gestes, tels que je les ai joués à l'écran (Chromium, 1180 × 820), bouton par bouton :**

1. `departs.html` : « Télécharger le fichier » sous « Essai : les codes en lettres », puis « Ouvrir l'application ».
2. « Codex », « Ouvrir un codex », le fichier `ESSAI-codes-en-lettres-lot-1.zip`, « Recharger ».
3. « Évaluations », la liste ; sur la ligne de Fictif-01 Personne-01, le menu des actions, « Annoter ».
4. Dans la palette Codes, « K-A », puis un toucher sur la copie ; de même « QRST » et « W-12 ».
5. « Annoter ▾ », puis « Évaluer » : Mots montre 300, Erreurs montre 3. Dans Paramètres, « Verrouiller ».
6. Le sous-onglet « Exporter » ; dans le bloc « Export Léa », Production « Production fictive : codes en lettres » : le compteur dit « 1 PDF pour 1 étudiant·e ».
7. « Exporter pour Léa » : un PDF se télécharge (`Fictif-_2390001_Production-fictive-codes-en-lettres_Evalue.pdf`), deux pages.

**La preuve.**

- Le banc `tests/integration/essai-codes-en-lettres-depart.spec.js` rouvre le fichier **commis** dans un espace vide (témoin : aucun trimestre, aucun codex actif) et joue ces sept gestes. Vert : deux pages, 3 566 pixels du rouge de « K-A » sur la copie, 2 529 sur la synthèse.
- Break-test : le fichier d'avant le retour, sans évaluation, fait rougir l'essai du PDF (« Aucune évaluation trouvée ») ; un codex privé de sa copie fait rougir les deux essais.
- Les images : `pdf-lea-page1-haut.png` (le haut de la copie, les trois pastilles) et `pdf-lea-page2-synthese.png` (la synthèse : « K-A » et « QRST » chacun dans sa pastille, sur une ligne, devant « Code fictif 1 » et « Code fictif 16 »).
- À savoir en regardant la synthèse : elle dit « évalué 10 novembre ». C'est la date inscrite dans le fichier d'essai (`dateEvaluation` à 2026-11-10 dans le ZIP, mesuré), pas le jour de l'essai. Je n'ai pas cherché pourquoi la fabrique la fige.

### Ce que j'ai tranché

- **Défaut 1 laissé tel quel**, proposition prête : c'est ta consigne (« dis-le avant d'élargir »).
- **Les trouvailles ci-dessous restent dans ce rapport**, pas au BACKLOG : trois d'entre elles ont un symptôme que Grégoire a vécu et y ont droit, mais `BACKLOG.md` vit sur `main` ; je les y inscris à la fusion, avec l'entrée de `RELAIS.md`.

### Trouvailles hors du lot (retour d'essai, issue « inscrire et continuer »)

11. **Le nom du ZIP prend la date en temps universel** (vécu par Grégoire : `travaux_a2026_2026-11-25.zip` le 24 au soir, heure de Montréal). Lu : `new Date().toISOString().split('T')[0]` à `js/travaux-archivage.js:788` (« Exporter des travaux ») et `:953` (« Exporter pour Léa ») ; le dépôt a déjà `dateLocaleYMD` (`js/date-utils.js:22`). Pas rejoué : le nuage tourne en temps universel, une reproduction ici ne prouverait rien.
12. **« Exporter pour Léa » sans évaluation verrouillée dit deux choses contraires** (vécu par Grégoire). Rejoué (Chromium, fichier d'avant le retour) : le bouton reste actif alors que le compteur dit « Aucune évaluation trouvée » ; après l'alerte « L'export Léa a échoué : Aucune évaluation trouvée pour ces critères. », la ligne « Préparation des PDF : ça peut prendre un moment. » et la barre à 3 % restent affichées. Lu, pas rejoué : quand une personne est choisie, `ouvrirOngletDuPdf()` (`js/travaux-archivage.js:950`) ouvre un onglet vide avant toute vérification ; c'est probablement l'onglet que Grégoire a vu.
13. **La version annotée d'une copie PNG est un JPEG nommé `.png`** (lu : `js/travaux-archivage.js:652`, `'image/jpeg'`, et le nom garde l'extension d'origine). Sans conséquence observée.
14. **`_grilleExport` n'est posé que par `genererDocPDF`** (`js/travaux-export-pdf.js:35`, lu). Dans « Exporter des travaux » et `rendrePDFAvecAnnotations`, il vaut `null` ou la grille d'un export précédent ; un code d'un chiffre sous une grille à codes activée pourrait alors s'y dessiner à sa position de repli. Les codes en lettres n'en dépendent pas. Pas rejoué.

### Rejoué ou seulement lu (retour)

- **Rejoué** (Chromium) : le défaut 1 sur `main` et sur la branche, le correctif et son break-test ; le chemin PDF de « Exporter des travaux » ; la régénération du fichier d'essai, sa réouverture dans un espace vide et le PDF produit par les gestes ; les messages contraires de l'export Léa (trouvaille 12, sauf l'onglet).
- **Seulement lu** : la date en temps universel (11), l'onglet vide (12), le JPEG nommé `.png` (13), `_grilleExport` (14), l'ancienneté du défaut 1.
- **Lancé avant le commit du retour** : les douze essais de `codes-en-lettres-lisibles.spec.js` et `essai-codes-en-lettres-depart.spec.js`, verts ; Vitest complet depuis `tests/` : 959 fichiers, 12 355 tests, verts.

## Les gestes à essayer

Réécrits au retour d'essai : seulement ce que Grégoire n'a pas encore vu. Rien de ces gestes ne s'écrit dans tes données ; l'aperçu est une adresse à part, qui ne voit pas celles d'`app.codexnumeris.org` (pas de porte due). Ils servent à juger de tes yeux ce qu'aucune machine du nuage ne juge : Safari et l'iPad.

**Ouvrir le fichier d'essai dans l'aperçu (comme hier)**

1. Ouvre **https://deploy-preview-59--codexnumeris-051225.netlify.app/departs.html** et touche « Télécharger le fichier » sous « Essai : les codes en lettres ». ⚠ Reprends-le : celui d'hier n'avait pas d'évaluation.
2. Touche « Ouvrir l'application » ; « Codex », « Ouvrir un codex », choisis `ESSAI-codes-en-lettres-lot-1.zip`, « Recharger ».
3. « Évaluations », la liste ; sur la ligne de Fictif-01 Personne-01, le menu des actions, « Annoter ».

**Puis, d'abord sur le Mac, ensuite sur l'iPad**

1. **Le curseur (Mac seulement).** Dans la palette Codes, choisis « QRST » et survole la copie sans cliquer.
   ⮕ Attendu : le curseur montre la pastille « QRST » entière, la pointe au centre de la pastille.
2. **Le PDF et sa page de synthèse.** Pose « K-A », « QRST » et « W-12 » sur la copie. « Annoter ▾ », « Évaluer » (Mots montre 300, Erreurs montre 3), puis dans Paramètres « Verrouiller ». Le sous-onglet « Exporter » ; dans « Export Léa », Production « Production fictive : codes en lettres » (le compteur dit « 1 PDF pour 1 étudiant·e »), puis « Exporter pour Léa ». Ouvre le PDF (Aperçu sur le Mac, Fichiers sur l'iPad).
   ⮕ Attendu : page 1, la copie avec ses trois pastilles comme à l'écran ; page 2, « K-A » et « QRST » chacun dans sa pastille, sur une ligne. La synthèse dit « évalué 10 novembre » : c'est la date du fichier d'essai.
3. **Le refus de « ABCDE ».** « Conception › Grilles », ouvre « Grille fictive : codes en lettres » et tape « ABCDE » dans un champ Code.
   ⮕ Attendu : le témoin dit « Non enregistré : un code a quatre caractères au plus : plus long, il couvre trop de place sur la copie. » ; rien ne s'enregistre.
4. **La copie exportée : seulement une fois le correctif à part fusionné dans ce lot** (d'ici là, ses gestes sont au rapport du correctif). Le sous-onglet « Exporter », « Exporter des travaux », « Télécharger » ; dans le ZIP, ouvre `copie-fictive_annote.jpg` (dans le dossier de Fictif-01, puis celui de la production).
   ⮕ Attendu après le correctif : les trois pastilles sur la copie. Aujourd'hui, la copie sans un code : c'est le défaut 1, déjà vu.
