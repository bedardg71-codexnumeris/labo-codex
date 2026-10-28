# Rapport – Comment chaque pratique construit la note (mesure sur banc, trou 2 de l'Aide, #1152)

> Claude Code, mercredi 28 octobre 2026, après la relecture du lot 3. Consigne :
> `plans de travail/CONSIGNE-LOT-2026-10-28-mesure-construction-de-la-note.md`. **Lecture seule** : aucun fichier de
> `js/`, d'`index.html` ni de `styles.css` n'a changé (le break-test a modifié `pratique-sommative.js` le temps d'un
> lancement, puis `git checkout` ; `git status js/` vide après).
> **Le banc** : `tests/unit/sentinelle-construction-de-la-note-2026-10-28.test.js`, 52 cas, verts (`cd tests && npx
> vitest run unit/sentinelle-construction-de-la-note-2026-10-28.test.js`). Il monte les modules RÉELS (le bac de #716 et
> de la sentinelle non recevable du 28 oct., plus `production-diagnostique.js` et `export-resultats-finaux.js`) et lit,
> pour chaque cas, quatre chemins : P stocké (`calculerEtStockerIndicesCP`), Comparateur (`simulerIndices`), note du
> profil en standards (`calculerDetailsNoteFinale`, non arrondie) et la ligne de l'export Léa (`construireLignesSynthese`).
> Chaque chiffre ci-dessous renvoie à son cas (`SOM-2`, `STD-H2`…). Données fictives (Alice, Bruno).
> **Gardé comme sentinelle** (dit dans son en-tête) : les textes du trou 2 décriront ce qu'il mesure. Break-test : `|| 1`
> → `?? 1` dans `pratique-sommative.js:101` rougit exactement SOM-2, SOM-4 et SOM-C11.

## Vue d'ensemble

Une seule règle décide quelles copies entrent, pour les quatre familles (`evaluationEntreDansLaNote`,
`pratique-registre.js:863`) : une copie compte si elle n'est **ni remplacée, ni « Incomplet ; travail en cours », ni
sans note, ni non verrouillée (brouillon), ni de portée 0**. Les productions **diagnostiques** sont retirées en amont
(SOM-6). Ensuite chaque famille fait autre chose, et **aucune ne lit le niveau** d'une copie : seule `noteFinale` compte
(SOM-C9, STD-7). Une copie en points, en niveaux ou algorithmique entre donc par sa note en %, rien d'autre.

Les deux points douteux de Cowork sont **confirmés** (détail au §6) :
1. en sommative, un artefact évalué **entre dans la note avec un poids de 1** (SOM-2) ;
2. « Portfolio de progression » **ne change pas la note** (SOM-C11) : la famille de #903.

Trois autres écarts sortent de la mesure, qui touchent les textes à écrire : le « Nombre d'artefacts retenus » de
l'assistant **n'est pas lu en hybride** (STD-H2) ; une reprise accordée **sort la production de la note jusqu'à sa
réévaluation** (SOM-C7, SPE-C4, STD-C5) ; la note standards est une **moyenne de notes en %**, pas un niveau (STD-7).

## 1. Sommative (codée en dur et configurable)

La configurable délègue à la même classe (`_calculerPerformanceSommative`), puis applique le verrou ; la codée en dur
(id `sommative`) donne le même chiffre (SOM-1b).

| | Mesuré |
|---|---|
| **Ce qui entre** | Toute copie qui compte, **quel que soit le type de production** : travail, examen, **artefact** (SOM-2), **conteneur portfolio** s'il est évalué (SOM-3), production **facultative** (SOM-5). Pas les diagnostiques (SOM-6). |
| **La formule** | Σ (note × pondération) / Σ pondérations, **sur les seules productions qui ont une copie qui compte** (SOM-7). La pondération est `production.ponderation \|\| 1` (`pratique-sommative.js:101`) : **une pondération 0 pèse 1** (SOM-2, SOM-4). |
| **Exemple** | Dissertation 40 % à 80, Examen 60 % à 90 : (80 × 40 + 90 × 60) / 100 = **86** (SOM-1). Avec un artefact à 50 : 8 650 / 101 = 85,64 (SOM-2). |
| **Verrou de l'assistant** | « Examen < 60 → 55 au plus » : Examen 50, moyenne 62, **plafonnée à 55** ; Examen 90, rien (SOM-C10). La production se reconnaît par son **titre** (`pratique-configurable.js:330`). |
| **Portfolio de progression** | Aucun effet (SOM-C11). |
| **Non constructible** | Aucune copie qui compte : P et Comparateur `null`, export « non constructible » (SOM-C13). |

## 2. PAN – Spécifications

| | Mesuré |
|---|---|
| **Ce qui entre** | Les copies qui comptent, rattachées à un type de travail par l'id du type ou par son **nom** (« Dissertation » ↔ `dissertation`). |
| **La formule** | Chaque copie est satisfaisante ou non : `note ≥ seuil` (`_estTravailAcceptable`, `pratique-pan-specifications.js:777`) ; **sans seuil écrit, 100 %** (`:807`, SPE-3). On compte les satisfaisantes par type, puis le **forfait le plus haut dont tous les requis sont atteints** donne une note FIXE (`_determinerPalierBundle`, `:830`). Sinon, le palier d'échec créé par l'enseignant·e (forfait sans travaux). |
| **Exemple** | Forfaits A 100 (2 dissertations, 1 examen, 1 dossier), B 80, C 60, F 50 ; seuil 70. Alice : 80, 87,5, 90, 72 → **A, 100** ; Bruno, examen 50 → aucun forfait, **F, 50** (SPE-1). Le dossier à 69 au lieu de 72 : **100 → 80** (SPE-2) — un palier, pas une moyenne. |
| **Non constructible** | Aucun forfait atteint et pas de palier d'échec : `null`, et l'export écrit « non constructible – Ta pratique ne dit pas quelle note donner quand aucun forfait n'est atteint. » (SPE-4). |

## 3. PAN – Standards

La note autoritative est celle du « chemin riche » (`calculerDetailsNoteFinale`) : `calculerNoteDuCours` (`portfolio.js:330`)
ne retombe jamais sur l'instance pour une standards.

| | Mesuré |
|---|---|
| **Ce qui entre** | Le **pool** : les copies qui comptent des productions `artefact-portfolio` (`obtenirArtefactsIdsPoolStd`, `pratique-registre.js:796`), et la copie de la production `terminale`. Le conteneur « Portfolio » ne porte que la pondération. |
| **La formule** | Moyenne simple des notes des artefacts **retenus** ; puis portfolio × pondération du portfolio + terminale × pondération de la terminale, normalisées (`_calculerNoteFinaleAggregee`, `profil-etudiant-actions.js:361`). Sans conteneur, le pool prend le complément de la terminale (STD-5). |
| **N meilleurs** (N = 3) | 92, 88, 80 → 86,67 ; × 60 % + 82 × 40 % = **84,8** (STD-1). |
| **Tous** | 77,5 × 60 % + 32,8 = **79,3** (STD-2). |
| **N derniers** | Par numéro de production : A6, A5, A4 → 82,33 → **82,2** (STD-3). |
| **Hybride** | N meilleures du pool « sélection » (moyenne) × 65 + obligatoires (moyenne) × 35 : (92, 88 → 90) × 65 + (75, 80 → 77,5) × 35 = 85,63 → **84,18** (STD-H1). Le N vient de `categories.selection.nombreARetenir`, **pas** du « Nombre d'artefacts retenus » de l'assistant (STD-H2). |
| **Notes finalisées** | Hors hybride : aucun effet (STD-6). En hybride : une obligatoire sans copie qui compte est **laissée de côté** avant (moyenne sur les remises), **vaut 0** après (dénominateur = toutes les obligatoires) (STD-H3 ; `profil-etudiant-actions.js:255`). |
| **Provisoire** | Sans terminale qui compte, la note est **le portfolio seul** et se dit « provisoire » (STD-4, STD-C4). |
| **Plafonnement de conformité** | Seulement avec `reglesConformite.actif` : 6 évalués pour un minimum de 7 → portfolio plafonné à 70 → **74,8** (STD-8). Le minimum seul ne fait rien (STD-8, STD-9) ; l'assistant n'écrit pas `reglesConformite`. |
| **Non constructible** | Aucun artefact ni terminale qui compte (STD-C7) ; pondération manquante ou 0/0 : message d'erreur nommé (`profil-etudiant-actions.js`, `calculerDetailsNoteFinale`). |

## 4. PAN – Dénotation

| | Mesuré |
|---|---|
| **Ce qui entre** | **Aucune copie** : la note est le jugement saisi (`_calculerPerformanceDenotation`, `pratique-configurable.js:377`). Même note sans aucune évaluation (DEN-1). |
| **La règle** | Toutes les cibles confirmées : la note saisie (78 → **78**). Une cible non confirmée : **59 au plus** (78 → 59 ; 45 reste 45) (DEN-2 ; `:401`). |
| **Non constructible** | Aucune saisie : `null`, export « non constructible » (DEN-3). |

## 5. Les cas qui changent la note, famille par famille

| Cas | Sommative | Spécifications | Standards |
|---|---|---|---|
| **Non remis, sans copie** | la production sort de la moyenne (86 → 90, SOM-C1) | rien n'est compté pour ce travail | hors pool (84,8 → 81,4, STD-C1) ; en hybride, voir « Notes finalisées » |
| **Non remis, copie « Non reçu » sans critère** (portée 0) | hors note (90, SOM-C2) | hors note | hors note |
| **Non recevable** (#1175, défaut du registre `:918`) | vaut 0 (86 → 54, SOM-C3) | non satisfaisant (100 → 60, SPE-C2) | artefact hors pool (81,4) ; terminale à 0 (52) (STD-C3) |
| **Incomplet ; travail en cours** | hors note (90, SOM-C4) | hors note (60, SPE-C3) | hors note ; terminale incomplète → provisoire (STD-C4) |
| **Brouillon** (non verrouillé) | hors note (90, SOM-C5) | idem | idem |
| **Jeton de délai** | aucun effet (SOM-C6) | aucun (SPE-C5) | aucun (STD-C6) |
| **Jeton de reprise, avant réévaluation** | **la production sort** : ni l'originale (remplacée ou supprimée) ni la reprise (déverrouillée, `evaluation-jetons.js:584`) ne comptent (90, SOM-C7) | le travail ne compte plus (60, SPE-C4) | l'artefact sort du pool (81,4, STD-C5) |
| **Reprise réévaluée** | remplace l'originale (95 → 92, SOM-C8) | idem (100, SPE-C4) | idem (STD-C5) |
| **Originale gardée ou supprimée** | **même note** dans les deux cas (SOM-C7, SOM-C8) | | |
| **Copie en points, en niveaux, algorithmique** | seule `noteFinale` est lue (SOM-C9) | idem | idem (STD-7) |

Dénotation : aucun de ces cas ne change la note (les copies n'y entrent pas).

## 6. Les deux points de Cowork

**Sommative, artefacts : un artefact évalué entre, à un poids de 1.** Mesure SOM-2 : (80 × 40 + 90 × 60 + 50 × 1) /
101 = 85,64 ; à 0, 85,15 → P 85 au lieu de 86. Même règle pour toute production à pondération 0 (SOM-4). Cause :
`production?.ponderation || 1` (`pratique-sommative.js:101`, et `:151` pour le récit). Le conteneur « Portfolio »
n'entre que s'il porte lui-même une copie (SOM-3). La FAQ (`index.html:11391`, « Les artefacts d'un portfolio n'y
entrent pas : seul le portfolio compte ») et le glossaire (`accompagnement-contenu-terme.js:80` et `:196`) disent le
contraire **pour la sommative** ; pour les standards, c'est juste (le conteneur porte le poids, STD-1).

**Sommative configurable, « Portfolio de progression » : aucun effet.** Mesure SOM-C11, avec et sans
`reglesSpeciales: ['portfolio']` (la forme que l'assistant écrit, `wizard-pratique-v2.js:2529`), deux artefacts à 40 et
95 : même note au 10⁻⁹ près. `construireConfigComplete` recopie `reglesSpeciales` (`pratique-registre.js:378`), mais
aucun calcul ne la lit (seul `construction-attributs.js` l'affiche). C'est la famille de #903 : une règle annoncée
(`wizard-pratique-v2.js:559` ; l'Aide, `index.html:10211`) qu'aucun calcul n'applique.

## 7. Ce que l'étudiant·e et l'enseignant·e lisent

| Où | Mesuré (banc) ou lu (code) |
|---|---|
| **P, Comparateur, export Léa** | un **entier**, demi vers le haut (`arrondirIndiceSurCent`, `portfolio.js:309`) : 57,5 → 58 (SOM-C12), 84,8 → 85 (STD-1). |
| **Profil** | la note à **une décimale** au plus (`formaterNotePourcentage`, `note-pourcentage.js:77`) : « 84,8 % » au profil, 85 à l'export (lu). |
| **PDF, sommative** | moyenne à une décimale (`synthese-retroaction-data.js:1360`), titrée « Note finale » ou « Note provisoire » selon « Notes finalisées » (`:1357`) (lu). |
| **PDF, spécifications et dénotation** | aucun bloc de note : `construireNoteSommative` ne sert que la sommative, `construireNoteProvisoire` exige un portfolio (lu, non mesuré au banc). |
| **Export, statut** | « provisoire » **seulement en standards sans terminale qui compte** (STD-4) ; toute sommative, spécification ou dénotation sort « final », même en cours de session (SOM-7, `export-resultats-finaux.js:101`) ; « Notes finalisées » n'y change rien (STD-6). |
| **Non constructible** | export « non constructible », avec la cause en spécifications (SPE-4) ; jamais un 0 (SOM-C13, STD-C7, DEN-3). |

## 8. Les écarts, et leur disposition proposée (rien n'est corrigé dans ce lot)

« Texte du trou 2 » : l'écart se règle dans les textes que Cowork rédige (lot 4), sans fiche ; ce n'est pas une
trouvaille, c'est la matière du lot. Pour le code, les trois issues de CLAUDE.md.

| # | Écart | Mesure | Disposition proposée |
|---|---|---|---|
| E1 | Sommative : un artefact (et toute production à pondération 0) pèse 1 ; la FAQ et le glossaire disent « seul le portfolio compte ». | SOM-2, SOM-4 | **Inscrire** : ce que vaut un artefact en sommative (0 ? 1 ? refusé ?) est une décision pédagogique de Grégoire ; elle bloque le texte du trou 2. En attendant, les textes ne doivent pas promettre « seul le portfolio compte » en sommative. |
| E2 | « Portfolio de progression » offert par l'assistant et nommé par l'Aide, sans effet sur la note. | SOM-C11 | **Inscrire**, famille de #903 : retirer l'option ou lui donner un calcul (décision de Grégoire). Le texte du trou 2 ne doit pas la décrire comme agissante. |
| E3 | Hybride : le « Nombre d'artefacts retenus pour la note finale » de l'assistant (`wizard-pratique-v2.js:2584`) n'est pas lu ; le N vient de `categories.selection.nombreARetenir`, recopié de `modalitesEvaluation`, sinon 4 (`:2594`). | STD-H2 | **Inscrire** : la question de l'assistant ne dit pas ce qu'elle fait en hybride ; l'Aide (`index.html:10216-10217`) la place à côté de « Hybride ». |
| E4 | Une reprise accordée sort la production de la note jusqu'à sa réévaluation ; l'Aide dit seulement que la nouvelle évaluation « remplace l'ancienne dans les calculs » (`index.html:10726`) et le glossaire « le résultat remplace le précédent » (`:241`). | SOM-C7, SPE-C4, STD-C5 | **Texte du trou 2** : nommer la fenêtre « À réévaluer ». Que l'originale doive compter d'ici là est une question pédagogique, posée sans fiche. |
| E5 | Standards : l'Aide dit « la note vise le niveau atteint » (`index.html:10216`) ; le calcul fait la moyenne des notes en %, sans lire le niveau (la méthode s'appelle pourtant `conversion_niveaux`). | STD-7 | **Texte du trou 2**. |
| E6 | Glossaire, SPE : « c'est l'ensemble des cibles atteintes qui détermine la note » (`accompagnement-contenu-terme.js:483`) ; le calcul compte des travaux satisfaisants par type contre des forfaits. | SPE-1, SPE-2 | **Texte du trou 2**. |
| E7 | Export : une sommative, une spécification ou une dénotation sort « final » en cours de session, pendant que le PDF de la sommative titre « Note provisoire » (défaut de « Notes finalisées »). | SOM-7 ; `export-resultats-finaux.js:101`, `synthese-retroaction-data.js:1357` | **Inscrire**, en le signalant : aucun symptôme vécu par Grégoire (sa pratique est en standards), donc le critère d'entrée au BACKLOG n'est pas rempli. À Cowork et Grégoire d'arbitrer. |
| E8 | Une copie « Non reçu » qui porte une note : la sommative la compte, les standards la gardent au pool, les spécifications la refusent. | SOM-C2, STD-C2, SPE-C1 | **Commenter et oublier** : non mesuré si l'écran peut produire cet état (le registre dit `statutRemise` réécrit « evalue » à chaque verrouillage, `pratique-registre.js:969`). |
| E9 | « Minimum d'artefacts avant calcul formatif » (`wizard-pratique-v2.js:679`) ne retient pas le calcul : un seul artefact donne une note. Il ne sert qu'aux messages du profil et au plafonnement de conformité, que l'assistant n'active pas. | STD-8, STD-9 | **Texte du trou 2** (ne pas le présenter comme un seuil de calcul) ; **commenter** dans le code. |
| E10 | Verrou : `note_max \|\| 55` (`pratique-configurable.js:779`) lit un plafond de 0 comme 55. | lu | **Commenter et oublier** (un plafond de 0 n'a pas de sens pratique). |
| E11 | Sommative : une production facultative évaluée entre dans la note (elle n'entre pas dans C). | SOM-5 | **Texte du trou 2** (le dire ; un bonus est plausible). |
| E12 | Standards : l'instance (`pratique-pan-standards.js`) a d'autres défauts que le chemin riche (N = 3 au lieu de 4, `:583` contre `profil-etudiant-actions.js:189` ; pas d'hybride ni de plafonnement). | lu | **Commenter et oublier** : `calculerNoteDuCours` ne l'atteint jamais pour une standards (`portfolio.js:330`). |
| E13 | Trois précisions pour une même note : entier (P, export), une décimale (profil, PDF). | SOM-C12, STD-1 | **Texte du trou 2** (dire laquelle va à Léa). |

## 9. Ce qui n'a pas été mesuré

- Ce que l'écran peut réellement produire (E8) : le banc pose les données, il ne passe pas par le formulaire.
- Le PDF des spécifications et de la dénotation (§7) : lu, pas rendu.
- Le jeton de reprise ciblée et la reprise d'une reprise : hors consigne.
- Safari et l'iPad : sans objet (aucun changement visuel).
