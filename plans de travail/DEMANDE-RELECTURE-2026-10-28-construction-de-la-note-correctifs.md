# Demande de relecture – La note suit les décisions de Grégoire (E1, E2, E3, E4, E7 ; #1152, trou 2 ; #1177)

> Claude Code, mercredi 28 octobre 2026. Consigne : `CONSIGNE-LOT-2026-10-28-construction-de-la-note-correctifs.md`
> (Cowork, 14 h 47) ; décisions : `DECISIONS-2026-10-28-construction-de-la-note.md` ; mesure : `RAPPORT-2026-10-28-construction-de-la-note.md`.
> Point de départ : `main` = `cdea722e` (le commit de docs du § 0, ses sept fichiers seulement).
> **Pas de release, de verdict ni de push** : ils attendent le signal de Grégoire.

## Vue d'ensemble

Les cinq décisions sont en place, et toutes se lisent **au calcul**. Rien n'est écrit dans les données de personne : une copie déjà verrouillée ou déjà marquée suit le nouveau calcul sans être touchée (essais E4-STOCK, E2-STOCK, E3-STOCK). Les **captures déjà prises gardent leurs valeurs** jusqu'à « Recalculer les captures ».

Le banc de la mesure suit les décisions. **13 cas changent**, chacun écrit « avant → après » avec sa décision ; **aucun autre cas ne bouge** (52 verts).

| Preuve | Résultat |
|---|---|
| Essais neufs `sentinelle-construction-de-la-note-correctifs-2026-10-28` (Vitest) | 19, chacun rougit sans son correctif ; arbre restauré, sha256 identique |
| Spec Playwright ciblé (WebKit) | 3 essais, rouges sans E4 et E7 |
| Vitest complet, lancé depuis `tests/` | 844 fichiers, 10 172 essais verts |
| Playwright voisins (7 specs) | 15 essais verts ; relancés après l'ajout du § E7 (4 specs, 10 verts) |

La suite Playwright complète n'a **pas** été lancée : c'est le verdict, il attend ton signal.

⚠ **L'arbre de travail porte un lot qui n'est pas le mien** : « trois portes d'entrée » de l'accueil (`index.html`, `js/accueil.js`, `js/trimestre-v2.js`, `styles.css`, une sentinelle). Une autre session l'a laissé sans commit, et je n'y ai pas touché. Les Vitest ci-dessus ont donc tourné avec ce lot dans l'arbre. Mon commit n'emporte que **mon bloc** d'`index.html` (une ligne, l'Aide de la sommative).

## Décision par décision

### E1 – En sommative, une pondération de 0 vaut 0

| | |
|---|---|
| **Avant** | `production?.ponderation \|\| 1` lisait 0 comme « absent ». Un artefact ou une production à 0 pesait 1 (SOM-2 : 85,64 au lieu de 86). Toutes les productions à 0 donnaient 0. |
| **Après** | `PratiqueSommative._ponderationDe` : 0 vaut 0 ; un champ absent ou une production introuvable garde 1. Si toutes les copies qui comptent sont à 0, la note est **non constructible**, jamais 0 ni `NaN`. Le récit nomme la production à 0 (« pondération 0 · non comptée »), donc le PDF ne la range plus parmi les comptées. |
| **Preuve** | SOM-2, SOM-4 et SOM-C11 : 85,64 → 86 ; E1-a (non constructible), E1-b (absente = 1), E1-c (le récit). |
| **Break-test** | `if (!brute) return 1` rougit E1-a, E1-c, SOM-2, SOM-4 et SOM-C11 ; `return 0` au lieu de `null` rougit E1-a. |

Les autres `ponderation \|\| 1` du code :

- `profil-etudiant-calculs.js:1078` pondère les **critères** de l'IPB (dépistage), pas la note. Je n'y ai pas touché.
- `pratique-configurable.js:287` est un commentaire, que j'ai mis à jour.
- Aucun autre site ne fait la note.

### E2 – « Portfolio de progression » sort

| | |
|---|---|
| **Avant** | La case était offerte par l'assistant, avec son texte d'information. Le Comparateur l'annonçait « Actif », et l'Aide la nommait. Aucun calcul ne la lisait (SOM-C11). |
| **Après** | `'portfolio'` rejoint `REGLES_SOMMATIVES_RETIREES` (assistant) et `REGLES_RETIREES` (Comparateur), comme #903. La case, son texte (`infoPortfolio`) et le libellé de variante « Avec portfolio » sont retirés : ce dernier n'avait plus de chemin. L'Aide dit « une règle spéciale, s'il y a lieu (« Verrou sur une évaluation ») », mot pour mot comme la consigne. Une pratique qui porte la règle la **garde** à la réédition, variante comprise (`conserverReglesRetirees`). |
| **Preuve** | E2-a et E2-STOCK. Les tests de #903 et de `construction-attributs-326` suivent (E2 cité à chaque cas). |
| **Break-test** | Retirer `'portfolio'` de `REGLES_SOMMATIVES_RETIREES` rougit E2-a et E2-STOCK. |

### E3 – Hybride : la réponse de l'assistant est le N des meilleures

| | |
|---|---|
| **Avant** | `categories.selection.nombreARetenir` venait des modalités, sinon 4. La réponse « Nombre d'artefacts retenus » était ignorée (STD-H2). |
| **Après** | En hybride, la réponse alimente `selection.nombreARetenir` à la création (`_nombreRetenuDeLaSelection`). Hors hybride, rien ne change. |
| **Preuve** | E3-a (5 écrit, avec des modalités à 2) ; E3-b (hors hybride, 2 inchangé) ; E3-STOCK. |
| **Break-test** | Chaque moitié rougit son essai. |

**Rouvrir** une hybride existante montre le N que le calcul lit (`_nombreRetenuARelire`). Sans cette relecture, ré-enregistrer par l'assistant aurait remplacé ce N par `portfolio.nombreARetenir` (7 contre 4 dans l'essai) : c'est la seule façon de tenir « une pratique déjà créée garde son nombre ». STD-H2 reste vrai, parce qu'il pose la configuration à la main.

Je n'ai pas touché le texte de l'Aide pour E3 (« L'Aide le dit ») : il appartient au lot 4.

### E4 – L'originale compte jusqu'à ce que sa reprise entre dans la note

| | |
|---|---|
| **Avant** | Dès l'octroi, ni l'originale (marquée `remplaceeParId`) ni la reprise (déverrouillée) ne comptait, et la production sortait de la note (SOM-C7, SPE-C4, STD-C5). |
| **Après** | Une seule règle, au registre. `evaluationEntreDansLaNote(e, [evaluations])` appelle `originaleEstRemplacee`, et l'originale compte tant que **sa** reprise ne compte pas d'elle-même : évaluée, verrouillée, ni « Incomplet » ni de portée 0. Une reprise de reprise se lit maillon par maillon. Restent remplacés comme avant : un **doublon réconcilié** (#360) et une originale dont la reprise est **introuvable**. Une originale **supprimée** (réglage « Supprimer ») n'est plus là, donc rien ne compte, comme aujourd'hui. |
| **Preuve** | SOM-C7 (90 → 86), SPE-C4 (60 → 100) et STD-C5 (81,4 → 84,8), avant réévaluation ; E4-a à E4-f ; E4-STOCK (les champs de l'originale ne bougent pas). |
| **Break-test** | Le prédicat d'avant rougit 9 essais. Playwright rougit aussi : 90 au lieu de 86. |

La règle trouve la reprise dans la liste qu'on lui passe, sinon dans le stockage, par le lecteur des calculs (`obtenirDonneesSelonMode`, qui suit la simulation du Comparateur). Un index par tableau lu évite de relire à chaque copie pendant un lot de calculs.

**Qui lit `remplaceeParId`, et ce que chacun montre pendant la fenêtre.** Inventaire : 99 sites de code.

| Lecteur | Pendant la fenêtre | Changé ? |
|---|---|---|
| Les calculs par le prédicat (P, Comparateur, export, profil, PDF ; les dépistages qui passent par lui) | l'originale compte | **oui** : c'est E4. Le dépistage lit donc l'originale pendant la fenêtre ; avant, il ne lisait rien. |
| Récit sommatif (profil, PDF) | l'originale est « comptée une fois · poids X % », plus « remplacée » | **oui** : mêmes mots qu'avant, aucun neuf |
| Récit standards (profil) | l'artefact est au pool, plus « remplacé par une reprise » | **oui** |
| Indice C (`evaluationCompteCommeRemise`) | la production n'est **pas** remise pendant la fenêtre, comme avant | non (commenté, question 1) |
| Badges « Remplacée » de la Liste (`liste-evaluations.js:1497`) et du profil (`:2717`) | « Remplacée », alors que l'originale compte | non (question 2) |
| PDF, liste des obligatoires (`synthese-retroaction-data.js:1483`) | la reprise déverrouillée, avec la note recopiée de l'originale, comme avant | non |
| Dépistages qui testent `remplaceeParId` en direct (SOM, SPE et STD `detecterDefis`, objectifs, Comparateur `_evalsProfil`) | n'incluent pas l'originale, comme avant | non |
| Gardes, jetons, corbeille, import, migrations | inchangés | non |

### E7 – « Provisoire » tant que « Notes finalisées » n'est pas cochée

| | |
|---|---|
| **Avant** | Toute sommative, spécification ou dénotation sortait « final », même en cours de session. La case n'y changeait rien (STD-6). |
| **Après** | `construireLignesSynthese` dit « final » seulement si `contexte.notesFinales === true` et qu'aucune terminale manque (standards). L'export lit la case comme le calcul (`configuration.notesFinales`, par `_notesFinaliseesDe`). La sommative **codée en dur** (id « sommative ») n'a pas de configuration, donc son export dit toujours « provisoire » (E7-c) ; son PDF titrait déjà « Note provisoire ». |
| **Preuve** | La colonne statut de SOM-1, SOM-7, SPE-1, STD-1, STD-9 et DEN-1 (« final » → « provisoire ») ; E7-a, E7-b, E7-c et E7-d ; Playwright : le bouton réel, « provisoire » puis « final ». |
| **Break-test** | La ligne d'avant rougit 8 essais et Playwright. |

**L'ajout de Cowork (14 h 55) : des standards sans production terminale.** Je l'ai mesuré, puis corrigé.

- **Mesuré.** `calculerDetailsNoteFinale` disait `estProvisoire: noteTerminale === null`. Sans production terminale, la note (le pool à 100 %, 86,67 au banc) restait donc « provisoire » **pour toujours** à l'export, et ce **déjà avant E7**. Le profil ne l'affichait pas : son message exige `terminal.present`.
- **Corrigé.** `_noteAttendSaTerminale` : seule une terminale **prévue** qui ne compte pas encore rend la note provisoire. Le calcul de la note ne change pas.
- **Preuve.** E7-d rougissait avant le correctif (`estProvisoire: true`) et passe après : « final » avec la case, « provisoire » sans.
- **Test qui suit.** D5 de l'audit du 5 sept. (sans terminale : `estProvisoire` passe de `true` à `false` ; une terminale présente et non évaluée reste provisoire).
- **Rien d'autre.** Rien n'a été codé qui suppose un portfolio ou une terminale au-delà de ce que le calcul fait déjà. Le chantier « standards sans portfolio » reste à concevoir.

### Commentés (issue 3)

| Écart | Où |
|---|---|
| E8 | `pratique-registre.js`, au-dessus de `evaluationNonRemise`. C'est le seul lecteur de « Non reçu », plutôt que trois sites de famille. |
| E9 | `wizard-pratique-v2.js`, au champ `minAvantCalculFormatif` |
| E10 | `pratique-configurable.js`, `note_max \|\| 55` |
| E12 | `pratique-pan-standards.js`, les défauts de l'instance |

## Les notes qui changent chez les utilisateurs (pour les Nouvelles)

| Famille | Ce qui change |
|---|---|
| **Sommative** | (1) Toute production à pondération 0 qui a une copie (un artefact, un exercice) sort de la moyenne. La note monte ou descend selon cette copie : 85,64 → 86 au banc ; la fixture des audits de septembre, 87,43 → 87,6. Si **toutes** sont à 0, la note devient « non constructible » au lieu de 0. (2) Une production en reprise, pas encore réévaluée, compte à la note de l'originale gardée (90 → 86 au banc). |
| **Spécifications** | Un travail en reprise reste satisfaisant à sa note d'origine jusqu'à la réévaluation. Le forfait peut donc remonter (C 60 → A 100 au banc). |
| **Standards** | Un artefact en reprise reste au pool (81,4 → 84,8 au banc). **Les hybrides déjà créées ne changent pas** (E3 n'agit qu'à la création). La pratique de Grégoire est concernée par E4 et E7 seulement. |
| **Dénotation** | La note ne change pas. |
| **Export, toutes familles** | Le statut passe de « final » à « provisoire » tant que « Notes finalisées » n'est pas cochée ; la note ne change pas. En standards **sans** production terminale, case cochée, l'export dit enfin « final » (avant : « provisoire » pour toujours). |
| **Captures** (P historique) | Inchangées jusqu'à « Recalculer les captures ». |

## Tests existants qui suivent les décisions (chaque cas cite E1, E2, E4 ou E7)

- `audit-pratique-de-notation-2026-09-05` (16 cas : E1, la fixture « Exercice (pondération 0) » ; E7 ; plus D5, l'ajout de Cowork) ;
- `audit-pratiques-notation-config-2026-09-16` (20 : E1, E2, E7) ;
- `sentinelle-706` (5) ; `sentinelle-recit-calcul-c2b` (3) ; `construction-attributs-326` (6 : E2) ;
- `sentinelle-903` (3 : E2) ; `export-resultats-finaux-333` (2, plus 1 essai E7) ;
- `sentinelle-709`, `sentinelle-723`, `sentinelle-898` (E7) ;
- `sentinelle-audit-aide-15-oct` (le texte du prédicat, E4) ;
- le cliquet de complexité : `creerPratiqueV2` 78 → 77, parce qu'E2 retire une branche ;
- Playwright : `pratiques-909-903`, `audit-pratiques-notation-parcours-2026-09-16` et `pratiques-898` (E2, E7).

## Questions (aucune fiche : le critère d'entrée au BACKLOG n'est pas rempli)

1. **L'indice C pendant la fenêtre** : la production en reprise n'y est pas « remise », alors que sa note compte (inchangé). Faut-il qu'elle le soit ?
2. **Le badge « Remplacée »** de la Liste et du profil reste affiché pendant la fenêtre, alors que l'originale compte. Faut-il un autre mot ? C'est l'enseignant·e qui le lit.
3. Trouvaille de l'inventaire, sans lien avec E4 : le récit standards (`profil-etudiant-actions.js`) et la tuile du registre longitudinal (`registre-longitudinal.js:775`) écrivent « remplacée par une reprise » pour un **doublon réconcilié**, alors que le récit sommatif les distingue depuis #360.
