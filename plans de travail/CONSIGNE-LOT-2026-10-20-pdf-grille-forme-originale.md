# Consigne – Le PDF de la grille, 2e tentative : la forme de la grille d'origine (#1120)

> Écrite par Cowork le mardi 20 octobre 2026 à 18 h 40 (Toronto, mesuré par `date`), sur `main` à `c04df849` (non poussé ; `9882d2d5`, `67298a8d`, `c04df849` attendent le verdict). Plan : `PLAN-2026-10-19-bareme.md`, §4, révisé à 18 h 39 (deux lignes non commitées, à prendre dans ce commit).

## Pourquoi une 2e tentative

Grégoire a comparé le PDF de sa vraie grille (« Journal de lecture A26 », sur son Bureau) à la grille d'origine que la dissection a lue dans « Apporter mon matériel » : « pas assez conforme ». La grille d'origine : une colonne par niveau, nommé en tête (Insuffisant, Partiel, Satisfaisant, Remarquable) ; dans chaque case, le descripteur, et ses points dessous ; les éléments observables en puces sous chaque critère ; la description à côté du titre ; une ligne « TOTAL : / 30 ». Le PDF actuel met toutes les tranches d'un critère dans une seule case, sans nom, et omet les éléments observables, la description et le total. Cette forme venait d'une recommandation de Cowork (16 h 58) : c'est elle qui est révisée, pas le code de Claude Code.

## La décision de Grégoire (18 h 39) — mots que ses élèves lisent

**Quand tous les critères d'une grille ont un barème, avec les mêmes tranches, nommées pareil et dans le même ordre** (son cas : quatre tranches, mêmes quatre noms, partout), la grille du PDF prend la forme de la grille d'origine :

1. **Une colonne par tranche**, son nom en tête, dans l'ordre écrit (à la place de la colonne unique « Barème »).
2. **Dans chaque case** : le texte de la tranche, et **ses points dessous**, sur une ligne à part, avec leur unité (« 3-4 points », « 1 point » : règle C1 déjà validée). Une tranche à compléter : son texte seul.
3. **Les éléments observables** (`sousCriteres`, par leur `nom`) sous le nom du critère, un par ligne, précédés de « · » comme dans la dissection.
4. **La description de la grille** (`grille.description`), si elle existe, sur une ligne au-dessus du tableau.
5. **Une dernière rangée « Total »**, avec la somme des pondérations dans la colonne « Points ».
6. La colonne « Points » (pondération) reste.

**Toutes les autres grilles gardent la forme actuelle** : tranches qui diffèrent d'un critère à l'autre (nombre, noms ou ordre), tranches sans nom, grille mixte, grille à échelle. Rien ne change pour elles.

## Ce qui reste différent, assumé

- Les sections (« Partie A : compréhension ») restent collées au nom de chaque critère : c'est ainsi que la dissection les a écrites. Ne les découpe pas.
- Les points d'« Insuffisant » viennent des données de la grille ; le PDF les montre tels quels.

## Ce qu'il faut

1. La décision de forme se prend une fois, dans `tableauDesCriteres` (ou à côté), et les deux rendeurs la posent : l'aperçu et le PDF disent la même chose (le banc C qui compare ligne à ligne s'étend à la nouvelle forme).
2. « Mêmes tranches » : même nombre, mêmes noms non vides (comparés après `trim`), même ordre. Les points peuvent différer d'un critère à l'autre (son cas : 5 et 10).
3. Sécurité : `escapeHtml` sur les noms de tranches, les textes, les éléments observables et la description ; le banc `<img onerror>` couvre un nom de tranche et un élément observable.
4. Mise en page (skill `design-interface`) : lisible imprimée en noir et blanc ; les en-têtes des tranches comme ceux des niveaux d'une échelle ; la grille de Grégoire tient sur une page en portrait si possible ; sinon, dis-le.

## Les bancs

- **Vitest** : la forme choisie (mêmes tranches → colonnes ; un nom différent, un ordre différent, un nombre différent, des noms vides → forme actuelle) ; les points sous le texte ; les éléments observables ; la description ; le total ; aperçu et `autoTable` identiques ; le `<img onerror>`.
- **Break-test** : la colonne unique remise pour une grille aux mêmes tranches → rouge ; le total retiré → rouge. Code restauré.
- La spec WebKit `bareme-3-pdf-grille.spec.js` verte ; Vitest complet vert. Remplace les captures du dossier.

## Pour Grégoire, tout de suite

Refais le PDF de sa vraie grille comme à 18 h 34 (même harnais, même export de 16 h 16, mode démo) et **remplace** le fichier de son Bureau. Ni le PDF ni le JSON n'entrent dans le dépôt.

## Livrer

Un commit sur `main`, non poussé, avec : cette consigne, le plan révisé, le verdict `VERDICT-RELECTURE-2026-10-20-pdf-grille-bareme.md` (complété par Cowork à 18 h 34), le correctif, les bancs, les captures, et la demande courte `plans de travail/DEMANDE-RELECTURE-2026-10-20-pdf-grille-forme-originale.md`. Ajoute les fichiers par leur chemin, jamais `git add -A`. Lance `/fin-de-session` avant le commit, sans le verdict complet. **Puis arrête-toi.**
