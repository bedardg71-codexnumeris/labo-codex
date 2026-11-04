# Consigne – Une copie de référence à côté de celle qu'on annote (4 novembre 2026)

> Écrite par Cowork le mercredi 4 novembre 2026 à 16 h 18 (Toronto, mesuré par `date`), sur `main` = `b6a620c1`. **À lancer après le lot 10 ter de la boucle (#1224)**, une seule session à la fois.
> **Demande de Grégoire** (4 nov., de 16 h 09 à 16 h 16), mot pour mot : « Quand je fais l'évaluation d'un jeton, j'ai parfois besoin de comparer avec le travail original […] voir deux copies en même temps, à gauche et à droite. » ; « le split screen pourrait aussi être dans l'autre axe. » ; « L'annotation se ferait uniquement dans un écran, pas dans l'autre. Je veux juste référer à ma première évaluation. Ça permettrait peut-être aussi de comparer deux copies en même temps quand on soupçonne un plagiat. » ; « allons-y au plus simple, d'autant plus que l'espace sur l'écran est réduit. » ; « J'ai besoin de pouvoir zoomer dans les deux écrans. »
> Besoin vécu : la fiche entre au BACKLOG.

## 0. Avant tout

- Commit de docs seul : cette consigne, et la fiche au BACKLOG (prochain ID après celui de l'en-tête ; #1226 au moment d'écrire).

## 1. Ce que le lot livre

Dans Annoter et évaluer (Annoter et Évaluer), un geste ouvre un second panneau : **la copie de référence**.

- **Lecture seule** : la copie avec ses annotations telles qu'enregistrées. Aucun outil d'annotation, aucune écriture dans les copies, les annotations ou les évaluations.
- **Quelle copie** : si la copie ouverte est une reprise, l'original est proposé d'office (même élève × même production, sans `estReprise`). Sinon, ou pour en changer, un choix parmi les copies de la même production (cas du plagiat : la copie d'un autre élève).
- **Deux axes**, une bascule : l'une au-dessus de l'autre, ou côte à côte. **Supposition de Cowork, nommée à Grégoire** : on ouvre l'une au-dessus de l'autre, parce que sa règle du 2 nov. est la largeur visible pour lire l'écriture manuscrite d'une marge à l'autre. Le dernier axe choisi est retenu (préférence d'affichage, clé inscrite dans `docs/DATA-OWNERSHIP.md`).
- **Zoom dans les deux panneaux, indépendants** (supposition de Cowork, nommée) : pincement sur l'iPad, trackpad et molette sur le Mac, défilement à deux doigts, pages précédente et suivante dans la référence.
- Fermer la référence rend Annoter exactement comme avant.

## 2. Mesuré par Cowork (prémisse périmée par défaut : remesure)

- La visionneuse est à état unique : `fichierActuel`, `pdfDocument`, `canvasDocument` sont des variables du module (`grep -n "^    let " js/travaux-visionneuse.js`). Elle n'ouvre qu'une copie.
- Les gestes : « UN SEUL CADRE À LA FOIS, ET LE DERNIER DÉSIGNÉ GAGNE » (`configurerGestesZoom`, `js/travaux-visionneuse.js:872` ; `reprendreCadreVisionneuse`, `js/travaux-ui.js:1350`).
- Un dessinateur d'annotations indépendant de l'outil d'annotation existe et est exporté : `travauxExportPDF.dessinerAnnotationsSurCtx(ctx, w, h, donneesPage, scale)` (`js/travaux-export-pdf.js:274`) ; les données par `travauxStockage.obtenirAnnotationFichier(fichierId)` (`js/travaux-stockage.js:943`).
- Une reprise porte `estReprise` (`js/travaux-stockage.js:371`) ; le lien à l'original se lit autour de `js/travaux-ui.js:4812-4822`.
- La vue côte à côte existante (`js/travaux-ui.js:5951`, `.travaux-split-view` dans `styles.css:21416`) met une copie et la grille, pas deux copies.
- Cowork n'a pas trouvé où se fige l'annotation d'une copie verrouillée (décision de Grégoire du 2 nov.) : si elle existe, la référence montre la version figée.

## 3. Pièges

- ⚠ **La référence n'appelle ni `configurerGestesZoom` ni `setConteneur`** : elle volerait les gestes de la copie annotée, et c'est #1218 qui revient. Elle a son propre zoom. Après ouverture puis fermeture de la référence, deux doigts font toujours défiler la page sur la copie annotée (#1218, #1219).
- Une copie sans fichier (`ouvertSansFichier`, #1028) : la référence le dit, sans planter.
- Un second document PDF.js : le détruire à la fermeture (cf. l'accumulation d'écouteurs et de workers corrigée dans `previsualiserPDF`).
- Le choix de la copie montre les noms comme le carrousel (`anonymiserNom`, `anonymiserNomFichier`), `echapperHtml` partout.
- `js/config.js` et `js/navigation.js` ne bougent pas. Mac et iPad planifiés séparément. Noms fictifs dans les bancs.

## 4. Ce qui n'entre PAS

Annoter dans la référence. La grille, les niveaux ou la rétroaction de la première évaluation (« au plus simple »). Un zoom synchronisé entre les deux panneaux.

## 5. Les mots d'écran

Le bouton, le choix de la copie et la bascule d'axe : propose-les au rapport ; Grégoire les valide avant la mise en ligne.

## 6. La preuve

- Une spec WebKit par le geste : une reprise ouverte, la référence montre l'original et ses annotations ; zoomer dans l'une ne change pas le zoom de l'autre ; la bascule d'axe ; la fermeture rend les gestes d'Annoter. Un essai prouve qu'aucune donnée n'est écrite (stockage identique avant et après).
- Contre-épreuves (skill `verification-adverse`).
- Le pincement réel sur l'iPad, aucune machine ne le prouve : une porte terrain (skill `portes-terrain`), le markdown par toi, l'artefact par Cowork.

## 7. Fin

Commit, Vitest entier (depuis `tests/`), specs touchées. Pas de release ni de verdict : le lot part avec la prochaine mise en ligne. Rapport `RAPPORT-2026-11-04-copie-de-reference.md` à Cowork.
