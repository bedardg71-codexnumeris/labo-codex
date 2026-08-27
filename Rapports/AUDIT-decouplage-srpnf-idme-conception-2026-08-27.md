# AUDIT — Découplage SRPNF / IDME / SOLO et onglet Conception (travail des 25-27 août 2026)

**Date** : 27 août 2026, après-midi · **Base auditée** : `main` à `fbeffdad` (1.104.1, build `0827-1418`)
**Commanditaire** : Grégoire Bédard · **Auditeur** : session Claude Code (Fable 5), fraîche, qui n'a écrit aucune ligne du périmètre
**Cadrage d'origine** : `Rapports/CADRAGE-AUDIT-FABLE5-2026-08-27.md` (26 août seulement) — **périmètre élargi** par Grégoire au 27 août et à l'onglet Conception (décision du 27 août, 15 h)
**Question posée** : le travail des deux-trois derniers jours est-il de qualité, logique, et **rien du contexte de Grégoire n'y est-il codé en dur** — l'application doit servir d'autres enseignant·es, d'autres disciplines, d'autres échelles.

> **Méthode.** Skill `verification-adverse`, mode B. Huit chantiers de vérification en parallèle, chacun dans un
> worktree jetable (le dépôt principal, source `file://` de l'application ouverte, n'a reçu aucune écriture
> hors ce rapport). **Plus de 70 break-tests** exécutés sur 31 sentinelles ; chaque constat porteur d'un
> chantier a été **re-dérivé une seconde fois par l'auditeur principal** (grep, lecture, re-run) avant d'entrer
> ici. Une affirmation sans artefact reproductible n'a pas sa place dans ce document ; ce qui n'a pas pu être
> vérifié est en §8. **Aucune décision pédagogique n'est jugée** : quand un choix de Grégoire est en cause,
> il est nommé comme tel.

---

## 0. Vue d'ensemble — ce qu'il faut retenir

**Le travail livré fait ce qu'il annonce sur les chemins qu'il touche, et il est bien verrouillé.** Sur 31
sentinelles break-testées, 25 mordent sur chacune de leurs assertions porteuses ; 6 ont au moins une
assertion qui ne prouve pas ce qu'elle annonce (§4). Les correctifs du lot 3 de #542
(le dépistage lit l'échelle de l'utilisateur), de #552 (l'intensité ne dépend plus de la langue), de #540/#538
(les périodes se dérivent, ne s'inventent plus) et de #550/#551 sont **confirmés par mutation**. Le volet
données (#542, réparation exécutée) n'a modifié **aucune note ni aucune évaluation** : une échelle a été
ajoutée, identifiable et retirable.

**Mais la question de Grégoire — « rien en dur ? » — reçoit un NON mesuré, et pas là où on le cherchait.**
Trois faits dominent :

| | Fait | Preuve |
|---|---|---|
| **1** | **Le lot 4 du plan SOLO n'a jamais été livré et aucun item ne le porte seul.** Les sites B1-B2-B3-B4-B7-B10-B11 du plan sont **intacts à HEAD**. Le plus grave est vivant sur un chemin réel : l'analyse d'un sous-groupe d'intervention lit les **cinq noms de critères de Grégoire** (`interventions.js:251`) et convertit les niveaux par un **repli IDME en dur derrière une clé que rien n'écrit** (`portfolio.js:548-570`, `echellesPerformance`). Résultat : `32 / 69,5 / 79,5 / 92,5` au lieu de ses `40 / 65 / 75 / 100` — **faux chez lui aussi** — et 0 % pour tout code non IDME, donc « défis communs » partout ou nulle part selon la grille. | §2.1, §3 n° 1-2 |
| **2** | **Deux affirmations de clôture sont fausses.** « Plus aucun ternaire `>= 85` dans le fichier » (pas 3c-2) : il en reste deux, dont `determinerLettreIDME` (`profil-etudiant-sections-affichage.js:4236`), **rendu à l'écran** dans « Développement des habiletés » avec une lettre IDME quelle que soit l'échelle. « `_identifierPatternActuel` vivant » (table du pas 5) : mort. | §2.2 |
| **3** | **Trois sentinelles ne prouvent pas ce qu'elles annoncent**, et une quatrième **verrouille le repli qu'elle croit retiré** (`|| 2` de durée d'intervention, écrit en base à `interventions.js:1345`). | §4 |
| **4** | **Conception : deux trous sous les correctifs du 25-26 août.** Après « Enregistrer », la cartouche ouverte est **remplacée par une cartouche neuve** et l'autosave #517 n'écrit plus rien (reproduit en harnais) — candidat sérieux au « des fois ça enregistre, des fois non ». Et depuis le retrait du repli milieu de plage (#527), **l'échelle générique semée au boot et les deux gabarits d'échelle ne portent pas de `valeurCalcul`** : une évaluation sur l'un d'eux est non calculable sur tous ses critères. Un niveau neuf naît avec `valeurCalcul: 50` écrit en base. | §7.2 |

À cela s'ajoutent **dix-neuf sites arbitraires vivants non inscrits au backlog** (§3), dont deux que
personne n'avait relevés : une rétroaction « EUF / CAF » injectée dans tout critère de type algorithmique,
quelle que soit la discipline, et une **échelle IDME fabriquée qui part dans le PDF de synthèse remis à
l'élève** quand l'échelle réelle manque.

Et une couture que le lot 3 a ouverte sans la garder : l'aller-retour `valeurCalcul` → moyenne → plage
`min/max` suppose que la valeur ponctuelle d'un niveau tombe dans sa propre plage. **Rien ne le vérifie**, ni
à la saisie ni au calcul (§5.2).

---

## 1. Périmètre et baseline

| | |
|---|---|
| Commits | **67** (`3e8faabe..fbeffdad`, 26 août 18 h 17 → 27 août 15 h 03) + les commits Conception du 25-26 août (`95667195..3e8faabe`) |
| Fichiers code/tests/scripts | **73**, +11 136 / −837 lignes (`git diff --stat 3e8faabe..HEAD -- js tests scripts index.html`) |
| Vitest à HEAD | **3716/3716, 350 fichiers** — lu à l'écran à 15 h 06, avant tout break-test (`cd tests && npx vitest run`) |
| Playwright | Verdict **vert enregistré pour `fbeffdad`** dans `scripts/.verdict-playwright.json` (`code: 0`, `echecsConnus: 0`, 19 h 10 UTC). ⚠ Le jeton ne porte **pas** de compte : le « 193/193 » du RELAIS est une lecture d'écran, non re-dérivable. Suite non relancée par l'audit. |
| Arbre pendant l'audit | ⚠ **Une autre session écrit dans l'arbre** : `BACKLOG.md`, `RELAIS.md`, `ETAT-PROJET.md` modifiés à 15 h 15 (chantier Cloudflare #427), en plus des 5 fichiers doc déjà modifiés à l'ouverture. L'audit a lu `HEAD`, pas l'arbre, pour tout ce qui compte. |
| Items successeurs | Ouverts à `fbeffdad` : #536, #539, #543, #544, #545, #546, #547, #551, #553, #554, #555. Clos : #529, #535, #537, #538, #549, #550. |
| ⚠ Le dépôt a avancé pendant l'audit | `main` est à **`bb7e7eb2`** à la clôture (15 h 21) : deux commits de documentation d'une autre session (audit de l'onglet Évaluations, items **#556 à #572** pris). Non audités ici ; aucun code applicatif. ⮕ **Prochain ID libre : #573**, à revérifier au `BACKLOG.md` avant d'inscrire les items du §9. |

---

## 2. Ce qui est confirmé, ce qui est infirmé

### 2.1 Confirmé — avec la preuve

| Affirmation | Preuve (re-dérivée) |
|---|---|
| #541 corrige bien l'unité (`pourcentage / 100`, `helpers.js:209`) | 7/7 rouges au retrait, sur des valeurs (`expected 'E' to be 'I'`), pas des exceptions |
| … **mais sur une fonction que rien n'atteint** : les 2 appelants de `obtenirNiveauIDMEDepuisPourcentage` (`diagnostics.js:152`, `sections-affichage.js:3229`) sont eux-mêmes sans appelant | grep récursif `js/ index.html`, aucun appel dynamique ; confirmé par C1 et C3 indépendamment |
| #542 A4 : trois causes, trois mutations, chacune rougit `defisCommuns` | 7/11 rouges par cause (`interventions.js:247`, `:252`, `:329`) |
| #542 A2/A3 : `obtenirEchelleResolue` résout `pratique-*` ; une échelle introuvable rend `null`, jamais une valeur fausse, et l'écran le DIT (« Dépistage incomplet », `sections-affichage.js:962-967`) | `calculs.js:116-147, 230-238, 372-420, 480-482` ; 4/13 rouges par mutation |
| #542 lot 2 : `niveauSOLO` sur les niveaux d'échelle, **dans les deux éditeurs** (`echelles.js:3036`, `:3329`), facultatif (`refusChampNiveau` ne le refuse pas), seed étiqueté | 1/15 et 2/15 rouges ; `refusChampNiveau` lu (`:3450-3475`) |
| Lot 3 pas 1-2 : première plage contenante gagne, hors plage → `null` sans repli, borne vide ≠ 0, sans étiquette → nom du niveau + absence dite | 26 mutations sur 7 sentinelles, 22 rouges sur la bonne assertion (§4 pour les 4 verts) |
| Lot 3 pas 3b : sommative → `note-chiffree` ; deux échelles résolues → `echelles-divergentes` **nommé et affiché** (`:1008-1019`, `:1268-1272`) | code lu ; 4 mutations rouges |
| Lot 3 pas 3c-3 : `interpreterScoreIDME`, `interpreterPerformance`, `genererDiagnosticCriteres/SRPNF/Generique` **morts** ; les deux premières supprimées sans appel orphelin | grep exit 1 ; `genererDiagnosticCriteres` = définition + export seuls |
| Lot 3 pas 4 : export de recherche livre `contexte.echelles[]` (code/nom/min/max/valeur_calcul/niveau_solo) et `echelle_id` par évaluation ; `['I','D','M','E']` et `seuil_reussite` absents | `trimestres.js:1868-1884, 1943` ; 6 mutations rouges dont `echelle_id` isolé |
| #552 : `determinerCibleIntervention` (`calculs.js:1685-1741`) — intensité = `diagnostiquerSuiviApprentissage`, cause nommée depuis la grille + `libelleNiveauSOLO` ; **aucun** seuil, nom de critère ni « CAF / Remédiation / Pratique guidée » dans le code ; table IPB × direction **identique** à celle du skill `depistage-rai` | lecture ; grep ; 2 mesures du §10.1 reproduites à `e47f6a5e` (4 écritures de `badgeClasse`, 0 lecture) |
| #550 : sans grille de référence, cause nommée (`grille-introuvable`) ; le verdict rassurant est un ratchet | 2 mutations rouges |
| #551 : carte « Cible d'intervention » retirée sans résidu (CSS/HTML/data-action) ; `identifierPattern` reste au contrat `IPratique` (`registre:193`) | grep ; 2 mutations rouges |
| #540/#538 : `formatHoraire` jamais écrite (0 `setSync`), gardes `: 2 → : 0` (indices.js ×3, etudiants.js, sections-affichage), migration n'écrit plus, lot D lit le devis via `_parserPonderation` et se tait sans donnée ; **4 h → 4 périodes, pas 5** prouvé vivant | 13 mutations, 10 rouges (§4 pour les 3 verts) |
| Couture #540 ↔ #542/#552 (cadrage A.4) : diff complet de `interventions.js`, `sections-affichage.js`, `saisie-presences.js` lu — **aucune hypothèse croisée altérée** ; seul pont = `heures: dureeIntervention` (des périodes sous un champ nommé `heures`, `facultatif: true`), lu comme périodes par ses consommateurs | diff `3e8faabe..HEAD` |
| Petites modifications hors lot (cadrage A.5) : toutes rattachées à un commit qui les nomme et couvertes | `indices.js`/`etudiants.js` = #540 lot C (`sentinelle-540-lotC:276-277`) ; popup = lot B ; `main.js`/`init-inline.js` = bumps |
| Aide : A1 (popup) et A2 (glossaire SRPNF avec pondérations) **corrigés** par #529 lot 4 — forme « exemple fourni, inspiré d'ELLAC » | `index.html:14047, 10270-10290` ; popup `:612-620` |
| Hook #547 installé (`core.hooksPath = scripts/hooks`), refuse le commit au `?v=` périmé ; sentinelle mord (5 rouges) | lu ; break-test |

### 2.2 Infirmé — avec la preuve

| Affirmation | Ce que la mesure dit |
|---|---|
| **« Plus aucun ternaire `pct >= 85` dans le fichier »** (CONSIGNE-542, pas 3c-2) | **Faux.** `sections-affichage.js:4236-4240` `determinerLettreIDME` (E/M/D/I sur 85/75/65), **rendu** ligne 4284 `${lettreIDME} ${indices.P}%` par `genererSectionPerformance` (3 appelants vivants). Et `:714-717` (badges d'artefacts, 4 couleurs, repli sans échelle) dans `genererSectionMobilisationEngagement`, vivante. |
| **« `_identifierPatternActuel` (pan-standards) vivant — doublon »** (clôture du lot 3, table du pas 5) | **Faux.** Unique appelant `identifierPattern` (`:665`) ← `genererCibleIntervention` (`:731`) ← rien hors `pratique-test.js:214` et `config-francois-chimie.js:197` (deux fonctions console jamais appelées). CONSIGNE-552 §7.1 avait raison. Les chemins vivants `idme.*` sont **3**, pas 4. |
| **« `NOM_CRITERE_LANGUE` retiré »** (RELAIS, #537) | Vrai pour `profil-etudiant-calculs.js` ; **encore présent** dans `pratique-pan-standards.js:1131`, avec `francaisMoyen` (×6) et « Remédiation intensive en X » (`:1204-1227`) — **mort**, mais du contexte de Grégoire toujours écrit, et qui redevient vivant le jour où #307 câble `identifierPattern`. |
| **« Aucune valeur inventée sur le chemin d'écriture »** (#540 lot C/F) | **Faux.** `interventions.js:122` `duree: data.duree \|\| 2` (création) et **`:1345` `\|\| 2` à la SAUVEGARDE** ; `transfererPresencesVersModule` relit cette valeur écrite → 2 périodes présentes sans saisie. Le refus posé `:1469` est inatteignable par ce chemin. |
| **« 41 lectures retirées »** (`2a6f9a06`, lot E1) | Une annonce, pas une mesure : `git grep -c dureePeriode` = 96 → 83 entre E1 et E3 ; **6** retirées par E3 ; 20 `obtenirDureePeriode()` restent à HEAD. |
| **« 3574/3574, 335 fichiers »** (`2951f095`) | Mesuré au SHA : **3557/3558, 334 fichiers** (1 rouge anti-cache). Le chiffre annoncé est celui que seul `2a6f9a06` atteint, 15 min plus tard, autre session. |
| **« 3695/3695, 346 fichiers, lu à l'écran APRÈS ce changement »** (`c914255a`) | Mesuré : **3678/3678, 345**. 3695 = 3678 + 17 tests de `sentinelle-547` non encore commités par la session parallèle. **Lire à l'écran ne suffit pas quand l'écran montre l'arbre d'une autre session.** |
| Quatre commits « tout vert » (`422f9e0b`, `69ce1483`, `2951f095`, `c1d92a0f`) | Chacun rougit **isolément** sur `sentinelle-anticache-fichiers-modifies:174` : ils sont partis avec un `?v=` périmé. C'est la mesure exacte de #547. |
| **« L'oracle se tait sous 90 % »** (cadrage §C.2) | Vrai de la r1 seulement ; **retiré en r2** (`07f89d1a`). Plus aucun seuil de 90 % nulle part. Le verdict « IDENTIFIÉE » (`oracle:745-752`) n'a jamais pu être atteint (84 % < 99,3 %) ; l'identification repose sur `parAutreSeulement.length === 0`. |
| **« Le +1530 est EXACTEMENT ce que le dry-run avait prédit »** (`71a3ffea`) | Dans le script, « avant/après » réimprime **les mêmes variables** calculées avant l'écriture (`reparation:383-385`, `:450-451`) : tautologie interne. La mesure indépendante est `diag542()` relancée après — code distinct, même auteur, même logique de résolution. Elle prouve que l'objet est relisible par id, pas que le calcul de l'application le lit. |
| « #538 : 19 cas » | 20 dans le fichier. Cosmétique. |
| « Lot B : plus de 15 en dur » | `accompagnement-contenu-terme.js:23` définit encore le trimestre comme « Période de 15 semaines » (glossaire, hors du périmètre de la sentinelle). |

---

## 3. « Rien en dur ? » — les sites ARBITRAIRES VIVANTS non inscrits au backlog

C'est la liste qui répond à la question de Grégoire. Critère : *conséquence logique d'une donnée saisie* =
acceptable ; *valeur ou nom métier écrit dans le code, même configurable* = défaut. Seuls les sites
**atteints par un écran ou un calcul réel** sont ici ; les morts sont en §3 bis.

| # | Site | Ce qui est écrit | Chemin vivant | Effet pour un·e autre utilisateur·rice |
|---|---|---|---|---|
| 1 | `interventions.js:251` et `:285-289` | `['Structure','Rigueur','Plausibilité','Nuance','Français']` ; dictionnaire des 5 noms (`obtenirPerformancesSRPNF`) | `analyserSousGroupe` ← `creerIntervention:168` et aperçu du sous-groupe `:1119` | **`defisCommuns` toujours vide** pour toute autre grille — le lot 1 (#542) a réparé le seuil, pas les noms (B3/B4 du plan) |
| 2 | `portfolio.js:548-570` | `{I:32, D:69.5, M:79.5, E:92.5}` derrière `db.getSync('echellesPerformance')`, **clé jamais écrite** (0 écriture dans `js/`) | seul appelant `interventions.js:337` (chaîne du n° 1) | **Faux chez Grégoire** (≠ 40/65/75/100) ; `\|\| 0` → **0 %** pour tout code non IDME → chaque critère devient « défi commun ». La sentinelle A4 **stubbe** cette fonction (`sentinelle-542-a4:48`) et ne peut pas le voir (B1/B2 du plan) |
| 3 | `profil-etudiant-sections-affichage.js:4236-4240` | `determinerLettreIDME` : `P>=85?'E':P>=75?'M':P>=65?'D':'I'` | rendu `:4284`, « Développement des habiletés » (3 appelants) | Lettre IDME affichée avec une échelle W/X/Y/Z ; contredit le pas 3c-1 qui situe la même P dans l'échelle de la pratique |
| 4 | `profil-etudiant-sections-affichage.js:714-717` | `note >= 85 / 75 / 65` + 4 couleurs | badges d'artefacts, onglet Engagement (repli quand `echellesTemplates` vide) | I/D/M/E pour qui n'a pas encore d'échelle |
| 5 | `profil-etudiant-diagnostics.js:403-406` via `_genererBarresSRPNF` | 5ᵉ table IDME (I 0-64 … E 85-100, couleurs) ; échelle choisie par `e.active \|\| echelles[0]` | `genererSectionPerformance:4153` — **vivant** (la consigne le donnait pour « probablement mort ») | Légende/dégradé IDME sans échelle ; **jamais l'échelle des évaluations** |
| 6 | `interventions.js:1019-1020` ; `:1246-1252` ; `:1216-1217` | bilan avant/après en lettres E/M/D/I ; « Amener X au seuil D (65 %) », « seuil M » ; replis `\|\| 0.75` / `\|\| 0.64` | bilan d'intervention ; bouton « Suggérer » | Objectif et bilan nomment des niveaux que l'utilisateur n'a pas (#551/#555 couvrent les seuils, pas les libellés) |
| 7 | `profil-etudiant-calculs.js:1544-1583` `determinerAlerteContextuelle` ; `helpers.js:759+` `interpreterMobilisation` | `A >= 0.85 && C >= 0.85` / 0.75 / 0.65 ; `A < 0.7`, `< 0.8` | `genererSectionAccompagnement:823` ; 4 appelants | Verdict « contexte favorable / fragile » sur bornes écrites, alors que `interpretation.{excellent,bon,acceptable}` (0,85/0,80/0,70) existe pour ça — et **ne coïncide même pas** |
| 8 | `liste-evaluations.js:368` | `['I','D','M','E'].forEach` | `genererOptionsFiltres:325` | Filtre de notes inutilisable hors IDME (B7) |
| 9 | `synthese-retroaction-data.js:19` et `:24-30` | `ORDRE_NIV {E:4,M:3,D:2,I:1,'0':0}` ; **`SCALE_FALLBACK`** complète (labels, SOLO, bornes, couleurs) | `travaux-export-pdf.js:687` — synthèse PDF remise à l'élève | `ORDRE_NIV[…] \|\| 0` → progression nulle hors IDME ; échelle introuvable → **PDF élève avec l'échelle de Grégoire** (B10 ; `SCALE_FALLBACK` absent du plan) |
| 10 | `evaluation-retroaction.js:488-489` | `_NOMS_NIV_BILAN`, `_ORDRE_NIV_BILAN` (E/M/D/I) | `genererRetroactionBilan` ← `:366` | Bilan de rétroaction muet ou faux hors IDME |
| 11 | `evaluation.js:284-290` | `{'M':4,'Maîtrise':4,'I':3,'Intermédiaire':3,'D':2,'B':1,'O':0}` — **une échelle ancienne**, où I = 3 contredit IDME | `convertirNoteEnValeur` ← `obtenirTendance:988-989` (jetons) | Tendance calculée sur des codes qui ne correspondent à aucune échelle courante |
| 12 | `evaluation-calcul.js:173-197, 300, 379, 454-459` | « En prévision de l'**EUF** », « **erreurs de français** », « Centre d'aide en français (**CAF**) », seuils 100/75/60/30 mots par erreur | tout critère de type `algorithmique` (`grilles.js:1095`, type **générique**) | Un critère algorithmique en chimie écrit à l'élève « erreurs de français » et l'envoie au CAF. **Jamais relevé** |
| 13 | `interventions.js:122`, `:1345` ; `:124` | `duree: … \|\| 2` (création ET sauvegarde) ; `niveauRai: … \|\| 2` | enregistrement de l'intervention → présences | 2 périodes présentes inventées ; niveau RàI 2 par défaut — et la sentinelle lot C **exige** le premier (`sentinelle-540-lotC:327-328`) |
| 14 | `trimestre-v2-horaires.js:174-180` | `(théorie + labo)` du devis lu comme un nombre de **périodes** | recoupement horaire ↔ devis (#540 lot D) | Vrai au cégep de Drummondville ; faux pour un devis en heures ou des périodes de 75 min — **convention non écrite dans les données** |
| 15 | `sections-affichage:1128-1129, 1604` · `saisie-presences:1567-1569` · `tableau-bord:181-184, 285, 395-396` · `liste-evaluations:2201` · `evaluation.js:494` | `>= 85 / 75 / 65` couleurs, badges, filtres A-C-P | affichage | Cosmétique — mais divergent de `interpretation.*`, et dit « critique » à un élève sur une borne écrite |
| 16 | `index.html:10218` ; `:12930-13601` ; `accompagnement-contenu-terme.js:270-284`, `-popup.js:745` | aide : « Seuil de défi (75 % par défaut) », « Fenêtre (4 par défaut) » — le code dit **0,70 et 3** ; « Pratique guidée », « Remédiation ciblée », « Référer au CAF », tableaux 70/80/90 % ; « SOLO fonde les niveaux IDME » | aide vivante | L'aide décrit des cibles **supprimées par #552** et présente IDME comme structure de l'app |
| 17 | `echelles.js:1221, 2798, 3096, 3563` | niveau neuf : `code: 'N'`, `min: 0`, `max: 100`, **`valeurCalcul: 50`** écrits en base | `ajouterNiveauEchelle`, les deux éditeurs | Un niveau ajouté et jamais retouché porte un 50 fabriqué — l'arbitrage que #526/#527 interdisent, un cran plus tôt (§7.2 n° 2) |
| 18 | `cartouches.js:374-379` | plages IDME de Grégoire (0-64/65-74/75-84/85-100) en repli ; échelle choisie par `find(e => !e.estDemo) \|\| echelles[0]` | `initialiserNouveauCartouche` ← `:321` (après chaque enregistrement) | Cartouche neuve aux colonnes de la **première** échelle, sans `echelleId` (§7.2 n° 4) |
| 19 | `cartouches.js:2369-2374` | « niveaux situés sous le **seuil de maîtrise** » | texte figé du modèle de cartouche (#549) | Nomme un concept que l'échelle ne porte pas (#555) ; pas un seed modifiable |

**Déjà inscrits, vivants** (pour mémoire, pas re-listés) : seuils `idme.*` du dépistage de risque (#551),
rabotage `startsWith('francais')` ×8 (#553 — prouvé par test jetable : « Français écrit » **disparaît du
diagnostic** mais **compte dans l'IPB**, deux vérités sur la même donnée), `statutDecrochage` jamais passé
(#554), replis 0,70/0,75 divergents (#555), `idmeMoyen` à 0 (#536), clés du volet confidentiel (#539),
jugement suspendu (#546).

**Proprement configurable — la preuve que la bonne forme existe** : barres « Forces et défis » par
`criteresDeLaGrillePourAffichage()` ; cases « critères ciblés » par `grilleRef.criteres` +
`libelleNiveauSOLO(c.niveauSOLO)` ; niveau algorithmique situé dans `min/max` de l'échelle de l'évaluation
(`evaluation-calcul:256`) ; export de recherche par `c.niveauSOLO` ; carte « Observation de la structure »
par l'échelle commune des évaluations et l'étiquette SOLO ; matrice de cartouche indexée par `niveau.code`
de l'échelle (`cartouches.js:600, 1147`).

### 3 bis. Arbitraires MORTS (dette, pas défaut actif)

`pratique-pan-standards.js:1131-1227, 1403-1409` (`NOM_CRITERE_LANGUE`, `francaisMoyen`, « Remédiation
intensive », `defiSpecifique: 0.75`) · `pratique-sommative.js:501-649` (seuils 0,60→0,85, « CAF ») ·
`profil-etudiant-diagnostics.js:57-230` (`genererDiagnosticSRPNF`) · `profil-etudiant-helpers.js:143-165,
200-205` (couleurs `nom.includes('idme')`, `obtenirNiveauIDMEDepuisPourcentage` — **le correctif #541 vit
ici**) · `sections-affichage.js:3138-3229` (`genererTableauObjectifs`, `\|\| 0.75`) · `pratiques-predefines.js:361-470`
(« PAN-Standards (IDME + SRPNF) », `criteres_fixes`) · `config-francois-chimie.js` · `styles.css:124-128,
612-616` (`--idme-*`, 0 consommateur — contredit la règle du DS) · `echelles.js:1520` (milieu de plage dans
`genererNiveauxPersonnalises`, bloc « ANCIEN SYSTÈME » caché, #520) · divisions heures→périodes de
`saisie-presences.js:1402-1430`, `trimestre-v2-horaires.js:380-419`, éditeur legacy `horaire.js` (ids absents
d'`index.html`).

⮕ **Motif transversal, mesuré sur les deux jours** : la liste des seuils et noms *trouvés* au grep est
plus longue que celle de ceux qui *agissent*, et les deux ne demandent pas le même geste — mais l'inverse
est vrai aussi : **cinq fonctions données pour mortes ou « probablement mortes » étaient vivantes**
(`_genererBarresSRPNF`, `determinerLettreIDME`, le ternaire 714, `SCALE_FALLBACK`, la rétroaction EUF).

---

## 4. Les sentinelles qui ne mordent pas — ou pas là où elles le disent

31 sentinelles break-testées, 70+ mutations. **Vingt-cinq mordent** sur chacune de leurs assertions
porteuses. Les exceptions :

| Sentinelle | Mutation restée VERTE | Ce que ça veut dire |
|---|---|---|
| `sentinelle-549-modele-cartouche-consignes` (tests 3 et 4) | en-tête `## Le travail demandé` renommé | `toContain('Le travail demandé')` est satisfait par la ligne d'ancrage qui cite l'en-tête. Le contenu du bloc, lui, est protégé (bloc supprimé → 4 rouges). |
| `sentinelle-552-cible-independante-du-critere-de-langue` (tests 2 et 4) | `niveau: 3` constant ; `niveau: performance < 0.64 ? 3 : 1` (seuil en dur) | La sentinelle prouve que l'intensité **ne dépend plus de la langue** ; elle ne prouve **pas** qu'elle **vient de l'IPB × direction** : tous les montages ont IPB ≥ 3 ET performance basse. Il manque un cas où IPB et performance divergent (IPB 1 ↗ → niveau 1 avec performance faible). |
| `sentinelle-542-pas4-solo-critere-configure` (test 4, « défaut `multistructurel` identique aux sites ») | `'relationnel'` mis à **un seul** des sites (`trimestres:1851`, `:2102`, `calculs:801`, `:977`) — 4 mutations, 4 verts | Chaque regex est satisfaite par l'*autre* site du même fichier. La divergence d'un seul site — le défaut annoncé verrouillé — passe. |
| `sentinelle-540-lotC-duree-derivee-horaire` (test F) | `parseFloat(intervention.duree) \|\| 2` dans le transfert | Le test cherche le littéral `intervention.duree \|\| 2`. Et le test « les DÉFAUTS DE FORMULAIRE restent » (`:320-328`) **exige** `data.duree \|\| 2` — qui est aussi écrit en base à `:1345`. |
| `sentinelle-540-lotE2-aucune-division` (test C) | migration via `heuresVersPeriodes(seance.duree)` (helper vivant, `horaire.js:364`) | Le test ne cherche que `Math.round(…/…)`. La division existe encore, exportée, et repasse par la porte. |
| `sentinelle-540-lotE3-plus-de-reglage` (test C) | `heures: periodesPresentes * dureePeriode / 60` sans parenthèses | Le test cherche `(a * b) / 60` ou `heures: heures`. Formulation, pas comportement. |
| `sentinelle-540-ponderation-requise`, `-lotE1` | — | Mordent, mais **par formulation** (`toContain('!d.ponderation')`, regex `nombrePeriodes\s*>\s*0`) : un refus réécrit autrement passerait. |
| `sentinelle-542-a4-defis-communs` | — | Mord sur `interventions.js`, mais **stubbe** `convertirNiveauEnPourcentage` (`:48`) : le repli B1 vivant (§3 n° 2) lui est invisible. |
| `sentinelle-542-3c3-depistage-sans-seuils` (test 2) | — | Cherche `obtenirSeuil('idme.` littéral ; la lecture **indirecte** via `obtenirNiveauIDMEDepuisPourcentage` (`:3229`, morte aujourd'hui) passerait. |

Aucune sentinelle n'a rougi par exception à la place d'une assertion (le `ReferenceError` de
`sentinelle-542-repli-pratique-actuelle` est **attendu** par l'assertion `leve == null`). Aucune n'a pour
attendu la valeur de repli retirée. Les sentinelles « ratchet » (absences) ont toutes été faites rougir en
réintroduisant le symbole **dans du code** ; celles qui retirent les commentaires avant de chercher restent
vertes sur une réintroduction en commentaire — c'est le comportement voulu, vérifié.

---

## 5. Passe « connexions » — les défauts entre les chantiers

Ce que personne ne voit en n'auditant qu'un chantier.

### 5.1 Le lot 1 calcule sur le repli que le lot 4 devait retirer
A4 (« `seuils.acceptable` undefined ») est corrigé et verrouillé — mais `analyserSousGroupe` convertit
toujours les niveaux par `convertirNiveauEnPourcentage` (`portfolio.js`), dont la clé n'existe pas. Le
« défis communs » réparé le 26 août **rend des chiffres faux** chez Grégoire (32/69,5/79,5/92,5) et des 0 %
partout ailleurs. Le lot 4 était « ~90 min » au plan ; il n'a pas d'item.

### 5.2 L'aller-retour `valeurCalcul` ↔ plages n'est gardé nulle part
Depuis le pas 3c, une moyenne de `valeurCalcul` est **resituée** dans `min`/`max`. Rien — ni
`refusChampNiveau` (`echelles.js:3450-3475`), ni `situerPourcentageDansEchelle` — ne vérifie que la valeur
ponctuelle d'un niveau tombe dans sa propre plage. Chez Grégoire c'est cohérent (40 ∈ 0-64, 65 ∈ 65-74…).
Une échelle « E : plage 85-100, valeur 80 » situerait **tous les « E partout » en M**, sans message. Invariant
non verrouillé, pas une valeur en dur.

### 5.3 La pratique configurable n'est jamais interrogée par le profil
`obtenirPratiqueActuelle()` (`helpers.js`) passe à `obtenirPratiqueParId` le **TYPE** rendu par
`obtenirTypePratiqueActive` (`registre:~690`, qui rend `configuration.type` même pour une configurable) →
la classe du registre, jamais l'instance configurable. `PratiqueConfigurable.obtenirEchelleNoteGlobale`
(pas 3b, +36 lignes) n'est donc **pas atteinte** depuis `sections-affichage.js:994`, son seul consommateur.
Convergence probable par `echelleId = 'pratique-*'` des évaluations — non vérifiée au runtime.
Et **SPE** (`pratique-pan-specifications.js`) et `pratique-test.js` **n'implémentent pas la méthode** →
`raison: 'pratique-sans-methode', message: ''` : un utilisateur SPE voit le % avec une infobulle **vide**.

### 5.4 Quatre normalisations de clé, deux vérités
`cleCritere` (helpers:618, sans rabotage), `_normaliserNomCritereIPB` (calculs:694, avec), deux inline
(calculs:526/675, avec), `diagnostiquerForcesChallenges` (sans). Test jetable (C4) sur une grille
« Structure / Français écrit » : `calculerIPB` compte `francais`, `diagnostiquerForcesChallenges` ne retient
que `structure`. #553 le porte ; la preuve est ici.

### 5.5 La couleur utilisateur n'est filtrée qu'à un seul endroit
`couleurSure` (`sections-affichage.js:1320-1328`) est correct (`red`, `expression(…)`, `#fff; background:url()`
→ neutralisés) **mais sans test**. Le même invariant est **non protégé** dans `diagnostics.js` (légende
`color: ${n.couleur}`, vivant) et `sections-affichage.js:711, 725-734` (`couleurBadge = niveau?.couleur` brut
dans `style`). `echapperHtml` n'y neutralise pas l'injection CSS.

### 5.6 Corrections posées sur du code mort, résidus dans du code mort
#541 (`obtenirNiveauIDMEDepuisPourcentage`) et le repli `\|\| 0.75` de `genererTableauObjectifs` sont morts ;
#537 est retiré de `calculs.js` mais pas de `pan-standards.js`. Pas de défaut actif — mais du travail sans
effet d'un côté, et du contexte de Grégoire qui attend #307 pour revivre de l'autre.

### 5.7 L'arbre partagé fausse les chiffres et laisse partir les `?v=`
Deux comptes de tests faux (§2.2), quatre commits partis avec un `?v=` périmé, une session qui écrit
`BACKLOG.md`/`RELAIS.md` **pendant** cet audit. Le rituel « lire le total à l'écran » a un angle mort
structurel : **l'écran montre l'arbre, pas le commit.** Le seul chiffre re-dérivable est celui d'un
`git stash`/worktree au SHA.

---

## 6. Volet C — les données réelles (réparation #542)

Classé par **réversibilité**, comme demandé.

**Irréversible — aucun constaté.** `reparation-542-echelle-orpheline.js:423-427` : `liste.push(neuve);
db.setSync(cleEchelles, liste)` — **une échelle ajoutée** sous `<préfixe>_echellesTemplates`, aucune écriture
d'`evaluationsSauvegardees`, aucune note touchée (grep C.1 sur les 5 scripts : seule écriture du lot). Les 4
sondes sont en lecture seule.

**Réversible avec effort**
- L'échelle ajoutée porte `restauree542` et « (restaurée #542) » dans son nom (`:351-358`) : retirable en un
  objet. Mais **le script ne sauvegarde rien** — `sauvegardeFaite: true` (`:188, 416`) est un drapeau
  d'honneur. Le filet est le Codex fait à la main.
- **La réparation n'applique pas le verdict de l'oracle : elle re-classe seule** (`:294-330`), sur toutes
  les structures « échelle » des clés non-démo, garde `taux < 0.5` (`:322`). Le croisement de l'oracle
  (« aucune seconde échelle ») n'est **pas** refait. Et l'oracle ne teste que les échelles **encore
  présentes** : « une seule échelle a circulé » est une inférence par élimination, pas une mesure. Si elle
  est fausse, ≤ 55 évaluations sont relues avec `M = 75` / `0 = 0` — plausible, silencieux, **mesurable
  après coup** (`oracle542()` sur les 55, `:351-385`).
- **`db.setSync` sans `flush()`** (`:426`) : écriture fire-and-forget vers IndexedDB ; la relecture de
  contrôle (`:436`) lit `memoryCache` d'abord et confirme même si IDB n'a pas commité. L'import complet,
  lui, flushe (`import-export.js:2590`).
- **Une commande pour Grégoire** lève le doute : dans `h2026_echellesTemplates`, l'échelle `1767389426695`
  doit porter `restauree542.date ≥ 2026-08-27T01:56Z` et **aucun `parDefaut`** — sinon c'est la version
  d'avant `e3d5af34` qui a tourné.
- **Aucun test durable** ne couvre les 5 scripts (`grep -rl 542 tests/` → 0).

**Bénin** : doublon d'échelle aux mêmes valeurs (#450) ; 44 `ECHELLE_DEMO` → « Dépistage incomplet · N des
M… », exclues des moyennes et de l'IPB (chaîne re-dérivée, `calculs.js:387`).

**#545 — le mécanisme qui ré-orpheline, candidats par vraisemblance.** Fait établi d'abord : la fenêtre est
**5 → 10 août**, pas 5 → 27 (la sonde #156/#159 du 10 août voit déjà l'échelle absente).

| Rang | Candidat | Preuve |
|---|---|---|
| 1 | **Ouverture d'un Codex ou import complet antérieur à la réparation** : chaque clé du ZIP est écrite **en bloc**, `h2026_echellesTemplates` compris | `codex.js:620-636`, `import-export.js:2556-2571`, `reserve.js:116`. ⚠ **Le même risque pèse sur la réparation du 26** : le script demande une sauvegarde AVANT et ne demande pas d'enregistrer le Codex APRÈS (`:456-464`) |
| 2 | Suppression par la Bibliothèque **sans garde référentielle** — « Pas de dépendances directes pour les échelles » | `echelles.js:2425-2446` (`supprimerEchelleDefinitivement`), doublon `donnees-v2.js:1618-1645` ; alors que `supprimerEchelleDepuisSidebar` (`:3792-3878`) vérifie et migre. **Deux chemins, un seul gardé** |
| 3 | `reparer159b` (10 août) : **innocent** — il ajoute, l'absence était constatée avant lui | `reparation-159-copier-echelle.js:76-95` |
| 4 | Archivage (`creerSnapshotRessources`, `trimestres.js:728-753`) : filtre par ids **utilisés** (les `echelleId` des évaluations inclus) — conserverait l'orpheline | `:653-720` |

---

## 7. Onglet Conception (grilles, échelles, cartouches, productions)

### 7.1 Ce qui tient
- **Les refus promis par les astérisques sont réels, sur le chemin vivant** — le motif #506 (sentinelle qui
  passait à vide sur `#critereNom`) ne se reproduit pas : `modifierCritereGrille` (`grilles.js:3396`) est
  câblée par `data-on-change` (`:3165`) ; `refusChampNiveau` (`echelles.js:3450-3477`) est appelée par les
  **deux** éditeurs (`:3072`, `:3482`). 13 mutations, 12 rouges sur l'assertion porteuse (#516, #524, #525,
  #526, #527, #517 ×2, #518, #542 lot 2 ×2, ratchet `.text-danger`).
- #525/#527 dans le calcul : `evaluation-calcul.js:569-604` exclut un niveau sans valeur du numérateur **et**
  de la pondération ; `consolidation.js:207-210` le saute. Lu, pas break-testé (aucun test de comportement
  dédié).
- `.text-danger` : zéro occurrence hors `-bs`/`-red-bold` ; `.champ-requis` défini une fois. Légende présente
  sur Production, Grille, Échelle, Cours ; absente de Cartouche par décision testée.
- #546 réelle à HEAD et inscrite (`BACKLOG.md:949`).
- Matrice de cartouche indexée par `${critere.id}_${niveau.code}` **de l'échelle de l'utilisateur**
  (`cartouches.js:535-548, 600`) ; type de production dérivé de `TYPES_PRODUCTION` (`productions.js:106-120`) ;
  identifiants SOLO identiques grilles ↔ échelles (français, underscore).

| Écran | Champ | Astérisque | Refus réel |
|---|---|---|---|
| Production | Nom, Type, Pondération | oui | `validerChampsObligatoiresProduction` (`productions.js:1812`) — pondération 0 tolérée pour `artefact-portfolio` |
| Grille | Nom de la grille ; Nom du critère | oui | `grilles.js:618` ; `:3396` au blur, écran gardé (#516) |
| Échelle | Nom ; Code, Nom, Min, Max, Valeur ponctuelle | oui, ×2 éditeurs | `echelles.js:766, 3911` ; `refusChampNiveau` (#524-#526) |
| Cartouche | Nom ; Grille, Échelle | oui | `:804` ; structurel (`:3317-3327`), **non testé** |
| Échelle | **niveau NEUF** | — | **aucun** — voir 7.2 n° 2 |

### 7.2 Ce qui ne tient pas

1. **Après « Enregistrer », la cartouche ouverte est remplacée par une cartouche neuve non enregistrée, et
   l'autosave #517 devient muet.** `sauvegarderCartouche` → `chargerCartouchesRetroaction()` (`cartouches.js:890`)
   → `initialiserNouveauCartouche(grilleId)` (`:321`) : `cartoucheActuel` = `CART_xxx` neuf, nom et contexte
   vidés (`:414-417`), matrice re-rendue vide. Reproduit en harnais Node (worktree, fichier jetable supprimé) :
   la cellule tapée ensuite **n'atteint pas la base** (`persisterCartouchePartielle` ne trouve pas
   l'enregistrement). Même chemin après suppression (`:1646`). Antérieur à #517, mais #517 promet désormais
   un enregistrement qui n'a pas lieu. **Candidat sérieux au symptôme « des fois ça enregistre, des fois
   non » qui a déclenché l'audit du 25 août.** Non vérifié en navigateur (DOM stubbé).
2. **Un niveau neuf naît avec `valeurCalcul: 50`, `min: 0`, `max: 100`, `code: 'N'` écrits en base**
   (`echelles.js:1221, 2798, 3096, 3563`). `refusChampNiveau` ne garde que l'ÉDITION : un niveau ajouté et
   jamais retouché porte un 50 fabriqué — l'arbitrage pédagogique que #526/#527 interdisent, un cran plus tôt.
3. **« Les échelles semées par le code portent toutes une valeur ponctuelle » (#527, `echelles.js:3428`) est
   faux.** `ECHELLE_GENERIQUE` (`:474-484`) écrit `valeur: 45/67/82/95`, pas `valeurCalcul` ;
   `GABARIT_ECHELLE_IDME` (`gabarits-utils.js:294-297`) n'a **aucune** valeur ; `GABARIT_ECHELLE_STD_MASTERY`
   écrit `valeurNumerique`. Aucune normalisation à la copie (`forkerItem` copie tel quel). ⮕ Depuis #527,
   une évaluation sur l'échelle générique (semée au boot, `assurerEchelleGenerique:512`) ou sur une copie de
   ces gabarits est **non calculable sur tous ses critères** — le repli retiré masquait ce trou. Et le
   commentaire `:3400-3403` dit encore « le repli reste VOLONTAIRE », vingt lignes au-dessus du code qui le
   retire.
4. **`initialiserNouveauCartouche` porte les plages IDME de Grégoire** (`cartouches.js:374-379`, 0-64/65-74/
   75-84/85-100) en repli, et choisit l'échelle par `echelles.find(e => !e.estDemo) || echelles[0]` — la
   cartouche neuve du n° 1 porte donc les colonnes de la **première** échelle, pas de celle choisie, sans
   `echelleId`. Vivant via `:321`.
5. **Sentinelle #549, tests 3 et 4 : tautologiques sur l'en-tête.** `toContain('Le travail demandé')` est
   satisfait par la ligne d'ancrage « décrite plus bas sous « Le travail demandé » » : renommer l'en-tête
   laisse le test vert. Le contenu du bloc reste protégé (suppression du bloc → 4 rouges).
6. **Texte du modèle de cartouche** (`cartouches.js:2369-2374`) : « niveaux situés sous le **seuil de
   maîtrise** » — concept absent de l'échelle (#555) ; texte figé dans le code, pas un seed modifiable. Ni
   SRPNF ni IDME.
7. Course inter-cartouches (`sauvegarderCommentaire` lit `cartoucheActuel` après un `await`, `:666-670`) :
   fenêtre théorique, **non reproduite** (FIFO des lectures) — faible. `#518` : le câblage
   `if (!validerBlocsNommes()) return;` (`productions.js:1993`) n'est verrouillé par aucun test.
   `getCouleurNiveau` (`export-pdf.js:439-447`) discrimine I/D/M/E avec quatre couleurs identiques — mort
   de fait.

**D3 (régime des cartouches)** : clés `cartouches_${grilleId}` sans `cle()` (`cartouches.js:64, 71, 294…`) —
globales, non namespacées, orphelines si la grille disparaît. Décidé le 21 août, toujours **sans ID propre**
(mentionné dans #517 et #471 seulement).

---

## 8. Ce qui n'a PAS été vérifié, et pourquoi

| Zone | Pourquoi | Comment la clore |
|---|---|---|
| **Playwright** (suite entière et les specs neuves du périmètre) | Non relancée : suite navigateur, hors worktree jetable, règle « GitHub Desktop fermé ». Le verdict enregistré vaut pour `fbeffdad` (0 échec) mais sans compte | `cd tests && npx playwright test` au repos, Desktop fermé |
| **Rendu réel au navigateur** de tous les sites de §3 (lettre IDME, badges, PDF de synthèse, infobulle SPE vide) | Aucune capture prise | 5 captures sur une grille W/X/Y/Z fabriquée |
| **Données réelles** : ratios 279/280, 283/338, 95/338, 1277→2807, 383→44 ; que le calcul lit bien l'échelle restaurée après rechargement | Absentes du dépôt ; IDB fire-and-forget | La commande du §6 ; `diag542()` après un rechargement à froid |
| **L'événement du 5-10 août** (#545) | Seul Grégoire le sait | Codex ouvert ? suppression manuelle ? |
| `js/pratiques/*` : les 12 mentions SRPNF non dépouillées une à une ; `export-pdf.js` (`echelle.config.seuilReussite`, écriture non vérifiée) ; `pack-demo-20.js` | Hors budget de balayage | grep ciblé |
| Convergence réelle du §5.3 (échelle embarquée d'une configurable via `echelleId = 'pratique-*'`) | Lecture seule | test unitaire sur une configurable + évaluation |
| B1 par exécution | `convertirNiveauEnPourcentage` n'est pas exposée sur `window` (invisible au sandbox de test) | dérivation par source + grep seulement |

---

## 9. Ce qui attend Grégoire — proposé, pas décidé

Rien ici n'a été corrigé (audit en lecture seule). Par ordre d'effet sur un·e autre utilisateur·rice, puis
sur ses propres données :

1. **Ouvrir l'item du lot 4 du plan SOLO**, avec la liste §3 n° 1-2-3-4-5-8-9-10-11 (le « reste du codé en
   dur » : noms SRPNF de l'analyse de sous-groupe, repli IDME de `portfolio.js`, lettres IDME rendues,
   filtres, `ORDRE_NIV`/`SCALE_FALLBACK`, bilan de rétroaction, échelle ancienne de la tendance). C'est le
   seul chantier de la liste qui produit des **chiffres faux chez lui aujourd'hui** (n° 2).
2. **Conception, deux correctifs bornés** (§7.2) : ne plus remplacer la cartouche après « Enregistrer »
   (ou la ré-ouvrir par son id) ; donner un `valeurCalcul` aux seeds/gabarits d'échelle (`ECHELLE_GENERIQUE`,
   `GABARIT_ECHELLE_IDME`, `_STD_MASTERY`) et faire passer le niveau neuf par le même refus que l'édition.
   ⚠ Avant : une sonde console pour savoir si des évaluations réelles reposent sur l'échelle générique ou
   sur une copie de gabarit (non calculables depuis #527, sans message ciblé).
3. **Renforcer quatre sentinelles** (§4) : un cas IPB ≠ performance dans #552 ; une assertion par site pour
   le défaut `multistructurel` ; retirer de la sentinelle lot C l'exigence du `\|\| 2` et couvrir l'écriture
   `:1345` ; ancrer #549 sur l'en-tête réel. Petit, et ça verrouille ce que le 27 août croit acquis.
4. **Volet C** : la commande de vérification du §6 (une minute) ; enregistrer un Codex maintenant que la
   réparation est en place ; puis une **garde référentielle** sur `supprimerEchelleDefinitivement` (candidat
   n° 2 de #545) — une échelle désignée par une évaluation ne se supprime pas.
5. **Seuils d'alerte A-C vers `interpretation.*`** (§3 n° 7, 15) — nouvel item ; et le **`\|\| 2` / `niveauRai
   \|\| 2`** des interventions (n° 13).
6. **Rétroaction EUF/CAF** hors du type algorithmique générique (n° 12) — nouvel item ; c'est du
   vocabulaire québécois-français injecté chez tout le monde.
7. **Invariant `valeurCalcul ∈ [min, max]`** (§5.2) : refus ou avertissement à la saisie, une ligne dans
   `refusChampNiveau` — à trancher avec lui, c'est une règle sur ses échelles.
8. **Aide périmée** (n° 16), régime des cartouches (D3, sans ID) et contexte mort de `pan-standards.js`
   (§3 bis) — quand #307 ou une passe doc y passe.

Ce qui relève de **sa** décision et que cet audit ne tranche pas : le devenir du niveau « 0 » et #546 ; le
défaut `multistructurel` pour un critère non étiqueté (conséquence du menu présélectionné, mais un critère
non étiqueté devient « fondation surveillée par l'IPB » sans que rien ne le dise) ; la convention « une
heure de devis = une période » (§3 n° 14) ; la marque de maîtrise (#555).

---

*Artefacts bruts : les huit rapports de chantier (C1 à C8) sont dans la transcription de la session du
27 août ; chaque ligne de ce document cite le fichier:ligne ou la commande qui la fonde. Aucun commit, aucun
bump, aucune écriture hors ce fichier.*
