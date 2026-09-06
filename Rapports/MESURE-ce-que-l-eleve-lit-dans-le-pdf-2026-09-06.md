# MESURE — ce que l'élève lit dans son PDF (et dans le texte copié vers Léa)

> **6 septembre 2026, matin, Claude Code sur le Mac.** Consigne du jour, Temps 1 : la carte AVANT le cadrage de la
> « synthèse des rétroactions dans le PDF ». **Aucune disposition, aucun correctif** dans ce rapport, sauf la section
> « Constats à part » que la consigne réserve aux textes faux que l'élève lit — Grégoire arbitre.
> Mesuré à `dc1e606d` (1.123.0, build `0905-2025`). Banc : `tests/unit/mesure-ce-que-l-eleve-lit-2026-09-06.test.js`
> (modules réels de `js/` dans un bac à sable, trois copies — une par type de grille —, 9 mesures vertes) ; ce qui est
> mesuré **par lecture** est dit à chaque ligne.
> Temps 0 (rapatrier la clôture) : **déjà fait** par `886d9828` avant cette séance (rituel d'ouverture) ; seule la
> promotion de la consigne restait, faite en `dc1e606d`.

## Constats à part — des textes que l'élève lit et qui sont faux

| # | Ce que l'élève lit | Où | Cause mesurée | Disposition proposée (CLAUDE.md) |
|---|---|---|---|---|
| C1 | **« Note finale : 63.5 %% »** (signe doublé), pour les trois types de grille | texte copié vers Léa, rétroaction générale, dernière ligne | `noteProduction1` porte déjà « 63.5 % » (`evaluation-calcul.js:1404`) et `_rendreNoteFinale` (`evaluation-retroaction.js:232-249`) lui ajoute un second « % ». Présent au moins depuis l'extraction du 18 mai (`9ffff2cf`). | **CORRIGÉ le jour même (#757, 1.123.1)**, arbitrage (a) de Grégoire : l'écran est recopié tel quel. Sentinelle rouge avant, verte après, break-testée. |
| C2 | **« Cet objectif est prioritaire depuis 3 productions »** avec UN seul artefact antérieur ; et **plus jamais** « Progrès : I → D depuis Analyse 1 » ni « Tu as progressé en Nuance. » | texte copié vers Léa, bilan (`=== BILAN ===`), dès que la copie est enregistrée — c'est-à-dire 1,5 s après le premier geste (auto-save) | `_chargerHistoriqueBilan` (`evaluation-retroaction.js:603-614`) lit toutes les évaluations de l'élève **sans exclure celle en cours** : la copie devient sa propre « précédente ». Le PDF, lui, l'exclut (`synthese-retroaction-data.js:1311`, `e.id !== evaluation.id`) et dit le vrai. Mesuré : bilan AVANT enregistrement = progrès nommés, pas de « 3 productions » ; APRÈS = l'inverse. | **CORRIGÉ le jour même (#758, 1.123.1)** : même prédicat que le PDF, appliqué à la copie que le résolveur #576 retrouve en base (la garde du PDF est privée à son module ; mesuré : l'exporter aurait forcé dix bancs à le charger). Sentinelle cinq cas, rouge avant, verte après, break-testée. |

Deux défauts de forme, pas des faussetés, que l'élève lit aussi dans le texte copié : (F1) « spécifique » et « bilan »
sont copiés par `textContent` d'un HTML sans blanc entre balises — les phrases se collent (« …viens me
voir.Selon toi… », « …Insuffisant)Acquis en développement… ») ; (F2) le bloc « --- Observations --- » de la
rétroaction générale ne s'écrit **jamais** avec les tampons du catalogue courant (`DIAG_IDS`,
`evaluation-retroaction.js:184`, ne connaît que neuf identifiants hérités, `legacy: true`). Disposition (décision de
Grégoire) : **inscrits, #759 et #760**, à cadrer avec la synthèse des rétroactions ; pas corrigés.

## Le périmètre, mesuré : cinq fichiers, trois documents

| Document que l'élève reçoit | Fichiers | Comment il part | Mesuré |
|---|---|---|---|
| **A. La copie évaluée** = pages annotées + **une page de synthèse** | `travaux-export-pdf.js` (`genererDocPDF` → `ajouterPageSynthese`) ; `synthese-retroaction-data.js` (`construireFeedback`) + `synthese-retroaction-rendu.js` (`rendreSyntheseHTML`, rasterisé par html2canvas) | bouton « Exporter le PDF » d'une copie ; « Dossier complet » depuis Évaluation ; **Export Léa** (ZIP : `travaux-archivage.js:443`, même `genererDocPDF`) — un seul et même PDF | banc |
| **B. Le texte copié vers Léa** | `evaluation-retroaction.js` : `genererRetroaction` (générale, zone de texte éditable), `genererRetroactionSpecifique`, `genererRetroactionBilan`, `copierToutRetroaction` | boutons « Copier » / « Copier tout » de l'onglet Évaluation, puis collage par l'enseignant | banc |
| **C. Le document de consignes** (lu AVANT le travail, pas une copie évaluée) | `export-pdf.js` (`construireModeleDocument`, `genererPDFCombine`, crans consignes / évaluation / rétroaction) | Conception › Productions / Grilles / Cartouches, « PDF » | lecture (jsPDF, pas de DOM) |

L'écran « Révision avant export » (`afficherRevisionExport`) et le modal « Rétroaction » de l'onglet Travaux ne vont qu'à
l'enseignant·e : hors carte.

## A. La page de synthèse du PDF — sept blocs, le même squelette pour les trois types de grille

| Ordre · bloc | Ce que l'élève lit (copie de banc) | Source | Engendré / écrit | Répété ailleurs ? |
|---|---|---|---|---|
| 1 · en-tête | sigle / session / « artefact 2 de 3 » ; titre de la production — activité ; nom, DA, groupe, « évalué 2 octobre » ; « grille … » ; barre du trimestre (une case par production, lettre du niveau, ● obligatoire, ▼ courant, date) | `infoCours` (global), trimestre actif, production, élève, évaluation, `calculerDetailsNoteFinale` (retenus) | engendré | le titre et l'activité reviennent dans C ; non dans B |
| 2 · ruban | OBJECTIF · TÂCHE · CONTEXTE | production (`objectif`, `tache`, écrits par l'enseignant) ; cartouche (`contexteSpecifique` ou `contexte`) | écrit | **oui** : les trois dans B (générale, si les cases sont cochées) ; objectif, tâche et contexte dans C |
| 3 · rétroaction par critère | légende de l'échelle (masquée si tout est analytique) ; par critère : nom, « 30% · description », la rangée de niveaux **ou** « 56 / 70 » **ou** « 12 erreurs sur 600 mots → 12.00/20 (60.0 %) », puis le commentaire | `evaluation.criteres[]` : `retroaction` **gelée à l'enregistrement** (copie de la cartouche au niveau retenu, ou texte algorithmique), sinon la cartouche vivante | engendré (cartouche) / gelé | **oui**, mais pas le même texte : B lit la cartouche **vivante** au moment de la copie (mesuré : « GELÉ » sur le PDF, « VIVANT » dans B pour le même critère) |
| 4 · niveau général | « D Niveau général · En développement » — ou, portée incomplète, « Cette copie n'a pas de niveau général : Langue (20 %) reste à évaluer. » | `evaluation.niveauFinal`, échelle ; `porteeDepuisEvaluation` | engendré ; phrase arrêtée par Grégoire le 2 sept. | B : « Niveau : D » à la dernière ligne |
| 5 · tampons + erreurs | par famille : nom du tampon, compte, texte ; « Erreurs annotées · 2 catégories les plus fréquentes / 5 erreurs » (titre = nom du critère algorithmique s'il existe) : numéro, nom, texte, compte | annotation de la copie ; `retroactionsObservations` (global, défauts de `travaux-outils.js`) ; codes de la grille (`codesAnnotation`) ou les dix codes de repli | engendré (textes du catalogue) | **oui** : B spécifique (toutes les catégories, 3 erreurs, texte coupé à 120 car.) ; B générale (« --- Langue --- », toutes les erreurs, texte entier) ; **et dans le bloc 6** |
| 6 · bilan | intro (« Mes standards sont très élevés… » + question) ; **Présentement, il faut se concentrer sur** (deux priorités, « acquis en développement ») ; **Points récurrents** (« Ta force », deux tampons à 80 car., « Erreurs annotées : 5 erreurs (principalement : …) », « Progrès : I → D depuis Analyse 1 », « Tu as progressé en … », « En …, tu as fait de beaux progrès… ») ; **Jetons utilisés** ; **Note provisoire** (les N meilleurs, à venir, « Note finale = 56.8 % », mention provisoire) | évaluation + historique (exclut la copie), échelle (zones), annotation, `obtenirConfigJetons`, `calculerDetailsNoteFinale` | engendré ; intro et phrases écrites en dur dans le module | **oui** : B bilan est une **seconde implémentation** des trois premières rangées (mêmes phrases, autre code) ; la note provisoire n'est **que** dans A ; les tampons et erreurs répètent le bloc 5 |
| 7 · pied | « Prof Banc · 601-101-MQ    CC BY-NC-SA 4.0 » | `infoCours` | engendré | C (pied) |

Bloc conditionnel lu par lecture : « Vue recalculée — peut différer de la rétroaction reçue par l'élève au moment de la
remise. » entre 1 et 2, quand une évaluation postérieure existe (`detecterRecalculPosteriori`).

**Ce qui change selon le type de grille** (mesuré) : holistique = rangée de niveaux + légende ; analytique = « 56 / 70 »
partout (bloc 3, priorités, force, B), légende masquée, aucun nom de niveau ; algorithmique = ligne de calcul + texte
algorithmique gelé (la cartouche du critère n'est pas lue), erreurs titrées par le nom du critère (« Langue »), codes de la
grille. Ordre et nombre des blocs : identiques.

**Ce qui n'est nulle part dans A** : le texte libre de la zone « Rétroaction finale » (`evaluation.retroactionFinale`),
que l'enseignant·e peut avoir réécrit — il ne va à l'élève que par B ; et les cases « afficher description / objectif /
tâche / adresse / contexte » (A ignore les options, B les suit).

## B. Le texte copié vers Léa — trois morceaux, un collage

| Morceau | Ce que l'élève lit, dans l'ordre | Source | Répété |
|---|---|---|---|
| générale (zone éditable) | « Production : … » / « Objectif : … » / « Tâche : … » (cases) ; « Bonjour Alice ! » ; contexte de la cartouche ; « Voici quelques observations : » ; par critère « Critère 1 (Structure) — D » (ou « 56 / 70 ») + commentaire de cartouche **vivant** (ou texte algorithmique) ; « --- Observations --- » (**jamais**, F2) ; « --- Langue --- » codes × compte + texte entier ; « --- / Note finale : 63.5 %% \| Niveau : D » (**C1**) | production, cartouche, annotation, `codesAnnotation`, écran | A blocs 2, 3, 5, 4 |
| spécifique | par catégorie : « Liaison (1) — texte » ; « Erreurs annotées (5) » : trois codes, texte coupé à 120 car. — **sans séparateurs** (F1) | annotation, catalogue | A bloc 5 ; B générale |
| bilan | intro, priorités, acquis en développement, « Ta force », points récurrents (**C2**), jetons — **sans séparateurs** (F1) | écran + historique (n'exclut pas la copie) | A bloc 6 |

## C. Le document de consignes (lecture de `export-pdf.js`)

Titre (« Analyse 2 - activité » ou nom de la grille) ; à droite sigle, nom du cours, trimestre ; blocs dans l'ordre du
gabarit : Objectif d'apprentissage, Description de la tâche, Détail de la tâche, champs libres nommés, **Date de remise**
(toujours, « À préciser » sinon), Contexte de la rétroaction (cran rétroaction) ; page suivante : tableau critère
(+ description) · % · une colonne par niveau = commentaire de cartouche ou « — » ; pied : enseignant, licence, page x / y.
Tout est écrit par l'enseignant (production, grille, cartouche) ; rien d'engendré. Répété : objectif et tâche (A 2, B),
contexte (A 2, B), commentaires de cartouche (A 3 au niveau retenu, gelés ; B, vivants).

## Ce qui se répète — compte au banc (copie holistique)

| Texte | A (page PDF) | B (copier tout) |
|---|---|---|
| objectif, tâche, contexte | 1 | 1 |
| texte d'un tampon (« L'idée directrice n'est pas… ») | **2** (bloc 5 + bilan) | 1 |
| nom d'un code d'erreur | **2** (bloc 5 + bilan) | **2** (générale + spécifique) |
| « Ta force » | 1 | 1 |
| « Progrès : » / « Tu as progressé » | 1 / 1 | 0 / 0 (C2) |

## Commandes qui le prouvent

```
cd tests && npx vitest run unit/mesure-ce-que-l-eleve-lit-2026-09-06.test.js     # 9 / 9 ; MESURE-PDF-ELEVE {…} en console
grep -n "toFixed(1) + ' %'" js/evaluation-calcul.js ; grep -nF 'Note finale : ${noteAffichee}%' js/evaluation-retroaction.js
grep -n -A8 "^function _chargerHistoriqueBilan" js/evaluation-retroaction.js ; grep -n "e.id !== evaluation.id" js/synthese-retroaction-data.js
grep -n "DIAG_IDS" js/evaluation-retroaction.js ; grep -n "legacy: true" js/travaux-outils.js
grep -a -n "genererDocPDF" js/travaux-archivage.js                                 # l'export Léa = le même PDF
```

## Ce que je n'ai pas regardé

Les **pages annotées** elles-mêmes (traits, codes dessinés, textes tapés sur la copie — `dessinerAnnotationsSurCtx`) ;
le rendu rasterisé (html2canvas, hauteur, iPad) ; le mode anonymisé ; la note hybride (sélection / obligatoires) et les
notes finales ; la porte #674 au banc (lue seulement) ; le document de consignes au banc (lu seulement) ; l'archivage
par élève / trimestre (`exporterParEtudiant`, pas destiné à l'élève) ; les cartouches de 2025 ; ce que Léa fait du
collage (mise en forme).

## Trouvé en chemin, hors périmètre

`js/travaux-archivage.js` est lu comme **binaire** par git et grep (l. 39 : des caractères de contrôle écrits en clair
dans une expression régulière) : `git diff` le montre en « Bin », `grep` n'y trouve rien — dix minutes perdues ici à
croire l'export Léa absent. Disposition : **inscrit** (#755).
