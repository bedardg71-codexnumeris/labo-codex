# Plan – Le moteur par objectifs (mesure, puis lots)

> Claude Code, vendredi 20 novembre 2026. Consigne :
> `plans de travail/CONSIGNE-2026-11-20-moteur-par-objectifs-mesure.md`. Base : `main` = `e31a8556`.
> **Lecture seule** : aucun fichier de `js/`, d'`index.html` ni de `styles.css` n'a changé. Aucune autre session sur
> la machine, donc pas d'arbre à part.
> **Le banc jetable** a tourné hors du dépôt (une fonction pure, Node seul, aucun module réel monté) et n'est pas
> committé. Données fictives (Zoé Fictive, Yan Inventé, Léa Imaginaire).
> **Trois degrés de certitude dans ce document** : *mesuré* (une commande l'a rendu, fichier et ligne donnés),
> *lu* (le code a été lu, rien n'a été joué), *inféré* (déduit, à confirmer par un essai au lot concerné).

## Décidé pour les lots 3 et 4 (mandat du 21 nov. 2026 : « gestes 3 et 4 ensemble »)

Mandat relayé par Cowork le 21 nov. 2026 ; **il prime sur ce plan là où ils divergent**. Branche
`lot/moteur-cibles-3-4-retenu-note` (partie de `lot/moteur-cibles-2-inscrire`, `8ed02c6f`, et réunie à
`lot/moteur-cibles-1-cibles`, `main` à 1.252.0). Rapport : `RAPPORT-2026-11-21-moteur-cibles-3-4.md`. Textes :
`TEXTES-2026-11-21-par-standards-lots-3-4.md`. **La cible** : lundi 23 nov., une adresse d'essai fixe pour trois
enseignant·es qui pratiquent la notation par standards ; rien ne se fusionne dans `main`, aucune release.

| N° | Décision | Origine |
|---|---|---|
| 1 | Le niveau retenu d'une cible est le meilleur niveau parmi les inscriptions non annulées qui portent un niveau. Il ne redescend jamais : un niveau plus bas inscrit plus tard ne le change pas | Rapport PAREA 2026, p. 103 ; confirmé par le cas A (courriel du 21 nov. 2026 : « dans mon cas, avec mes systèmes actuels, ce serait conforme ») |
| 2 | Seule une annulation peut le faire baisser (une trace invalidée) | Choix de Grégoire (rien ne s'efface) ; cohérent avec le billet du cas A sur son cours noté par triangulation |
| 3 | Une inscription sans niveau n'entre jamais au niveau retenu. Une cible qui n'a que des remarques, ou rien, est « sans donnée » : elle porte le nom du niveau « sans donnée » de l'échelle, jamais un vide ni un zéro chiffré | Mandat ; décision de Grégoire du 21 nov., 9 h 17 (complément du lot 2) |
| 4 | Au tableau, la case montre le niveau retenu et le nombre d'inscriptions ; la légende change ; un dernier niveau plus bas se lit dans l'historique de la case, sans bulle | Mandat |
| 5 | Au profil, une section pour cette pratique : une ligne par cible (niveau retenu, date, origine, rétroaction), puis toutes les inscriptions datées (remarques et annulées comprises, barrées) | Mandat ; plan § 4 |
| 6 | L'ordre des niveaux : `ordonnerNiveauxParPlage`, seule source. Ordre illisible : rien n'est retenu, le motif s'affiche en clair. Un code absent de l'échelle n'est pas lu | Mandat ; plan § 4 |
| 7 | La note est la moyenne pondérée des valeurs ponctuelles des niveaux retenus, au poids de chaque cible | Rapport, p. 103 (F1, F2) |
| 8 | **Le double seuil est un réglage de la pratique, éteint au départ.** Allumé : la note est plafonnée (55 % d'office, modifiable) si la moyenne des cibles terminales est inférieure au seuil (60 % d'office, modifiable). Sans cible terminale, il ne peut pas s'allumer et l'écran dit pourquoi. La variante « un seuil par cible essentielle » n'est pas construite | Choix de Grégoire, 21 nov. 2026, 12 h 20 ; cas A, courriel du 21 nov. : le second seuil existe dans son premier système parce que le plan-cadre le prévoit, son second système n'en a pas |
| 8a | « Inférieure » est strict : 60 % pile n'est pas plafonné | **Supposé par Cowork, à confirmer** (la fiche, § 7 : les sources disent « dépasser », p. 98, et « inférieure à », p. 103) |
| 8b | La moyenne des terminales est pondérée par leurs poids | **Supposé par Claude Code, à confirmer** (identique au cas de référence quand les terminales pèsent autant) |
| 9 | Pendant la session : aucune note chiffrée tant qu'une cible est sans donnée ; à la place, la liste des cibles en attente, lisible sans bulle | **Choix de Grégoire, 20 nov. 2026, sans source** ; la réponse du cas A ne le confirme ni ne l'infirme (F7) |
| 10 | À l'arrêt des notes, une cible sans donnée compte pour 0 % | Rapport, p. 103 (F3) ; confirmé par le cas A (courriel du 21 nov.) |
| 10a | L'arrêt des notes est la case « Notes finalisées » de la fiche de la pratique (`configuration.notesFinales`) | Supposé par Cowork ; **mesuré** : c'est la case que lisent l'export (statut « final ») et le PDF, écrite pour toutes les familles ; elle vaut pour la pratique, donc pour tous les groupes qui l'emploient |
| 11 | Une cible dont le niveau retenu EST le niveau « sans donnée » (inscrit) se traite comme une cible sans inscription : en attente pendant la session, 0 % à l'arrêt | **Tranché par Cowork, supposé** |
| 12 | Le récit de la note au profil : chaque cible, son niveau retenu, sa valeur, son poids ; la moyenne ; le second seuil quand il est allumé, et quand il plafonne. Une valeur ponctuelle manquante : « non calculable » avec son motif, jamais un chiffre | Mandat |
| 13 | Chaque lecteur de la note éprouvé un à un (§ 5) ; une note absente ne s'affiche « 0 » nulle part, ou l'endroit est dit | Mandat ; plan § 5 |
| 14 | La trouvaille du lot 2 (le formulaire des productions exige une pondération en « Par standards ») est réglée : aucune pondération exigée | Mandat ; § 11 |
| 15 | Les coches des critères ne sont lues par aucun calcul ; une reprise n'est jamais plafonnée | Choix de Grégoire, 21 nov. 2026, 8 h 38 ; mandat |
| — | Le niveau retenu, entre deux inscriptions du même meilleur niveau : la première qui l'a démontré (sa date, son origine, sa rétroaction) | **Supposé par Claude Code**, à confirmer (la note n'en dépend pas) |
| — | Hors des gestes : l'entrée 1.252 des Nouvelles dit « Son badge dit maintenant « SEL ». » (« , en sarcelle » retiré) | Accepté par Grégoire, 21 nov. 2026, 12 h 18 |

## Décidé par Grégoire (20 nov. 2026, 18 h 46 et 18 h 47)

Relayé par Cowork (`plans de travail/CONSIGNE-LOT-2026-11-20-moteur-cibles-0-garde.md`). Le plan est accepté : la
collection à part, la famille à elle, les cinq lots dans cet ordre.

- Il termine son trimestre avec sa pratique et son moteur actuels. Ce moteur reste dans l'application ensuite, tel
  qu'il est.
- On construit une vraie pratique de notation par standards : le noyau en quatre gestes, puis les couches
  (pondération par cible, double seuil, notes qualitatives, autres règles de retenue).
- Le prix du noyau est accepté : dans cette pratique, ni complétion, ni dépistage ou rétroaction par critère, ni PDF
  de synthèse.
- Il expérimentera probablement cette pratique lui-même à l'hiver 2027. Conséquence, confirmée par lui : le pont
  « un critère de grille alimente une cible » (§ 10, question 4) devient une couche à livrer avant sa rentrée
  d'hiver, après le noyau.

Restent ouverts : les autres questions de didactique (§ 10) et les mots (§ 9), que Cowork règle avec lui. Le lot 1
attend les mots.

**Arrêtés au lot 0** (noms techniques, 20 nov.) : la clé `inscriptionsCibles` et la méthode `niveaux_par_cible`.
Provisoires jusqu'au lot 1 : la clé de l'ensemble (`ensemblesCibles` dans les essais) et l'identifiant du type
(`cibles` dans les essais), qui suit un mot encore ouvert.

## Décidé par Grégoire depuis le plan (20 nov. 2026, 20 h 32 ; relayé par Cowork à 21 h 25)

Relayé par Cowork (`plans de travail/CONSIGNE-LOT-2026-11-20-moteur-cibles-1-cibles.md`). Grégoire a lu le modèle
tiré de la fiche `CONCEPTION-2026-11-20-pratique-par-standards.md` et l'a approuvé ; Cowork a sondé cinq pages du
rapport contre la fiche (p. 98, 99, 102, 103, 108) : exactes. Sa pratique de l'automne ne change pas.

- **Le modèle.** Une cible a une étiquette, un énoncé, des critères dont certains essentiels, un poids, et elle est
  terminale ou non (C3 à C6). L'échelle a un niveau nommé pour l'absence de données valables, qui vaut 0 % (E2, F3).
  Inscrire un niveau est un jugement (N1). Le niveau retenu est le meilleur démontré (T2). La note est une moyenne
  pondérée (F1). Le double seuil fait partie du cœur (F4 ; écarts É1 à É4 de la fiche).
- **Un niveau déjà communiqué ne redescend jamais**, même pour une cible jugée sur un ensemble de traces (réponse de
  vive voix de l'auteur principal des sources, rapportée par Grégoire). La question 2 du § 10 est réglée : « le
  meilleur » vaut dans tous les cas, et la couche « retenue par jugement » est **retirée** (§ 7).
- **Chaque niveau inscrit peut porter une note brève** : c'est la rétroaction (N5), pas un champ accessoire (lot 2).
- **Une cible sans donnée** : pendant la session, aucune note chiffrée et la liste des cibles en attente (*choix de
  Grégoire, sans source* ; F7) ; à l'arrêt des notes, 0 % (F3 ; R, p. 103). À l'écran, elle porte le nom du niveau
  « sans donnée » de l'échelle, pas un vide. La question 1 du § 10 est réglée ainsi.
- **Le poids de chaque cible se règle par l'enseignant·e** (F2). Se conformer au plan-cadre est son affaire :
  l'application ne le vérifie pas.
- **Les mots** : « cible », et « cible d'apprentissage » à la première mention, sur les écrans de l'enseignant·e. Le mot
  que lit l'étudiant·e n'est pas tranché. La pratique s'appelle « Par standards ». La pratique actuelle devient « Par
  sélection de productions » (lot `lot/renommer-selection-productions`, réuni sur la branche du lot 1) ; elle cessera
  d'être proposée quand celle-ci existera, sans que son calcul soit retiré.
- **Un relevé par cible pour l'étudiant·e** suit le cœur de près (S1 à S3). Puis un pont entre les critères d'une
  grille et les cibles, avant l'hiver 2027 : **non conçu ici**.

**Les lots deviennent** : 1 les cibles et l'échelle ; 2 inscrire un niveau ; 3 le niveau retenu ; 4 la note, avec
pondération et double seuil ; 5 le relevé de l'étudiant·e. Rien ne se fusionne dans `main` avant que les quatre gestes
existent et que Grégoire les ait essayés.

**Arrêtés au lot 1** (noms techniques, 21 nov.) : la clé de l'ensemble `ensemblesCibles` (par trimestre) et l'identifiant
du type `cibles` (code interne CIB ; sigle affiché STD, décision de Grégoire du 21 nov.). Le lot 0 les avait posés à titre provisoire : sa sentinelle les garde déjà.

## Décidé par Grégoire, 21 nov. 2026 (relecture des textes du lot 1)

Consigne : `plans de travail/CONSIGNE-LOT-2026-11-21-moteur-cibles-1-corrections.md`.

- **Le sigle suit le nom** (6 h 56). À l'écran, « STD » désigne « Par standards » ; « Par sélection de productions »
  s'affiche « SEL » ; « CIB » ne s'affiche nulle part. Affichage seulement : le code interne des familles ne change pas
  (`standards` → code STD, `cibles` → code CIB) ; le registre porte un `sigle` à côté du `code`, et tout écran lit le
  sigle (`obtenirSiglePratique`, `sigleDuCode`, `genererBadgePratiqueHTML`).
- **Les couleurs** (6 h 59). « Par standards » garde le bleu du badge STD (`--std-bleu`) ; « Par sélection de
  productions » prend la sarcelle `#0e9384` (`--sel-sarcelle`, ex-`--cib-sarcelle`).
- **Les textes** : tous acceptés, sauf A4, A5, E1 et F3 (`TEXTES-2026-11-20-par-standards-lot-1.md`, en tête).
- **Confirmé** : l'échelle de départ reste un point de départ facultatif ; n'importe quelle échelle convient (essais à
  trois et à six niveaux) ; les plages à mi-chemin ; une cible sans critère.
- **SEL n'est pas dite « PAN »** (remarque à 7 h 42, décision à 7 h 44 ; consigne
  `CONSIGNE-LOT-2026-11-21-moteur-cibles-1-corrections-2.md`). *Origine : choix de Grégoire, 21 nov. 2026 ; les sources
  ne tranchent pas.* « La preuve n'est pas faite que SEL est vraiment une PAN. On dirait une pratique hybride entre PAN
  et SOM. Demeurons prudent dans l'affirmation. » L'application n'affirme ni qu'elle en est une, ni qu'elle n'en est
  pas une, ni qu'elle est hybride. Son nom de famille à l'écran : « Par sélection de productions ». Textes :
  `TEXTES-2026-11-21-selection-sans-PAN.md`. Acceptés tels quels : G3, G4, G6, G7, G8 et la ligne de Nouvelles du
  changement de sigle (gardée hors du changelog jusqu'à la release). Le badge « PAN » et le libellé `famille: 'PAN'` du
  registre restent tels quels : Grégoire tranchera (mesure au rapport, § 7).

## Décidé par Grégoire depuis le lot 1 (21 nov. 2026 ; relayé par Cowork à 8 h 45 pour le lot 2)

Consigne : `plans de travail/CONSIGNE-LOT-2026-11-21-moteur-cibles-2-inscrire.md`. Toutes : *choix de Grégoire, 21 nov. 2026*.

- **Le sigle suit le nom** : « STD » s'affiche pour « Par standards », « SEL » pour « Par sélection de productions » ;
  « CIB » reste interne. Déjà codé au lot 1 (le tableau des cibles reconnaît la famille par son type, `cibles`, et n'écrit
  pas « CIB » : sentinelle des sigles).
- **L'application n'affirme pas que « Par sélection de productions » est une PAN, ni le contraire.**
- **Rien n'est codé en dur dans l'échelle** : l'enseignant·e décide du nombre de niveaux et de leurs noms. Tout écran du
  lot 2 tient avec une échelle à trois niveaux comme à six (sentinelle K, spec Playwright).
- **Une cible sans critère est acceptée** (la fenêtre d'inscription le dit : « Cette cible n'a pas de critère. »).
- **Les critères à l'inscription** (8 h 38) : au moment d'inscrire un niveau, les critères de la cible s'affichent, les
  essentiels marqués ; l'enseignant·e PEUT dire ceux qui sont respectés ; elle choisit elle-même le niveau. Les coches sont
  gardées avec l'inscription. **L'application ne calcule RIEN à partir d'elles** : ni niveau proposé, ni niveau refusé, ni
  alerte de cohérence (fiche, N1, et l'avertissement des sources sur le calcul, fiche § 6). Les coches sont facultatives :
  une inscription sans coche est complète, et « rien de coché » ne veut pas dire « aucun critère respecté ». **Forme
  retenue** : chaque critère de la cible, tel qu'il était écrit, avec `respecte: true | false | null` ; `null`, l'état
  d'office, veut dire « non renseigné » (lot 2, ci-dessous).

## Décidé par Grégoire, 21 nov. 2026, 9 h 17 (complément du lot 2)

Consigne : `plans de travail/CONSIGNE-LOT-2026-11-21-moteur-cibles-2-inscrire-complement.md`. *Choix de Grégoire, 21 nov. 2026,
9 h 17.*

- **Une inscription peut ne porter aucun niveau** : c'est alors une note datée sur une cible pour un·e étudiant·e (à l'écran,
  une « remarque », mot proposé). Origine : « cas A, courriel du 21 nov. 2026 : quand il triangule, il prend des notes qualitatives à différents moments et ne pose un niveau que lorsqu'il juge avoir assez de traces ; c'est sa stratégie pour 7 de ses 10 cibles à l'automne 2026 ».
- Une inscription porte au moins un niveau ou un texte ; vide des deux, elle est refusée, en mots.
- **Une remarque n'est pas le niveau « sans donnée » et n'en tient jamais lieu** : `niveau: null`, qui n'est aucun code de
  l'échelle, pas même celui qui vaut 0 %. Pour les lots 3 et 4 : une cible qui n'a que des remarques reste sans donnée
  pour le niveau retenu et pour la note.
- Au tableau, la case garde le dernier niveau inscrit ; une remarque ne le change pas ; une case qui n'a que des remarques
  le montre sans survol (✎ et leur nombre). L'historique montre les remarques à leur date ; l'annulation vaut pour elles.
  Les critères à cocher restent offerts. Aucune note calculée.

## Vue d'ensemble

1. **Le calcul actuel ne connaît qu'un grain : une évaluation par étudiant·e et par production.** Les quatre
   familles retiennent ou écartent des productions entières. Cowork l'avait bien lu.
2. **Un niveau par cible ne peut pas vivre dans l'évaluation sans déplacer de notes.** 64 fichiers lisent
   `evaluationsSauvegardees` ; la forme « sans grille » du 9 nov. a déjà coûté des gardes dans 11 fichiers.
3. **La forme retenue : une collection à part**, `inscriptionsCibles`, liste où chaque inscription est datée et où
   aucune n'en remplace une autre. Le précédent existe : `jugementsDenotation` (dénotation), lu par un moteur qui
   n'a touché aucun lecteur d'évaluations.
4. **Les ensembles d'objectifs existent dans le code, mais leur écran est orphelin** : aucun élément d'`index.html`
   ne le porte. Personne ne peut en créer un aujourd'hui, et leurs objectifs sont identifiés par position.
5. **Le composant vivant pour dire des cibles est celui de la dénotation** (`EditeurCibles`, identités permanentes
   depuis #717). Le geste 1 le réemploie.
6. **La nouvelle pratique doit porter un code de famille à elle.** Sous le code « STD », douze branchements
   l'enverraient au moteur du portfolio, celui de Grégoire.
7. **« Le meilleur » s'ordonne déjà** : `ordonnerNiveauxParPlage` range les niveaux d'une échelle ; la note passe
   par `valeurNumeriqueDuNiveau`, qui rend `null` plutôt qu'un chiffre inventé.
8. **Quatre lots, un par geste, dans l'ordre de Grégoire.** Aucune note d'une pratique existante ne change ; un
   lot 0 pose la sentinelle qui le prouve avant la première ligne de moteur.
9. **Le banc** : cas A, 65 sans reprises, 75 avec le meilleur par objectif (72,5 si l'on gardait le plus récent) ;
   cas B, 78. Une cible sans niveau donne 75,83, 56,88 ou « non calculable » selon une règle qui reste à décider.
10. **Ce que cette forme coûte** : dans cette pratique, une production n'engendre plus d'évaluation. Complétion,
    dépistage par critère et rétroaction par critère n'y lisent rien. C'est assumé, et à dire à l'écran.

## 1. Ce qui existe (mesure)

### 1.1 Les ensembles d'objectifs

| Constat | Où | Degré |
|---|---|---|
| Forme : `{ id, nom, auteur, etablissement, discipline, description, version, date_creation, objectifs: [{ id, nom, poids, type }] }` ; `type` ∈ fondamental, intégrateur, transversal | `js/objectifs.js:119-160`, `:219-221` | lu |
| Rangement : clé `objectifsTemplates`, écrite **nue** (sans `cle()`), donc commune à tous les trimestres et à la démo ; un seul fichier la nomme | `js/objectifs.js:50`, `:58` ; `grep objectifsTemplates js` | mesuré |
| **Rattachement : rien.** Ni `coursId`, ni `pratiqueId`, ni l'inverse : aucun cours, aucune pratique, aucun groupe-cours ne désigne un ensemble | `grep "ensembleId\|objectifsTemplates" js` hors `objectifs.js` : une seule fonction, sans appelant (§ 1.3) | mesuré |
| **L'écran est orphelin.** `listeEnsemblesObjectifs`, `stat-objectifs-ensembles` et `ensembleActuelId` ne sont dans aucun HTML ; `afficherListeEnsemblesObjectifs` sort dès sa première garde (`js/objectifs.js:74-78`). `initialiserModuleObjectifs` est appelée au démarrage (`js/main.js:1182`) et ne trouve rien | `grep` sur `index.html`, `config.js`, `navigation.js`, `main.js` | mesuré |
| **Les identités sont des positions.** À chaque enregistrement, les objectifs sont renumérotés `obj1`, `obj2`… (`js/objectifs.js:556`). Retirer le premier fait glisser tous les autres : le défaut que #717 a corrigé pour les cibles de la dénotation | lu | lu |
| Une sentinelle garde l'échappement de cette liste (`tests/unit/sentinelle-467-affichage-echappe.test.js:96`) : elle épingle un écran que personne ne voit | mesuré | mesuré |

### 1.2 `objectifsServis` et `production.objectif`

- **`metadata.objectifsServis`** (mesuré, `grep` : trois fichiers) : écrit par `planification-carte.js` seul
  (`:357-358`, `:4217-4227`) ; lu par `planification-carte.js`, `planification-export.js` et `parcours-cours.js:161`.
  Ses identifiants sont ceux des **objectifs de leçon** de la carte d'Alignement (`metadata.objectifs` d'un nœud
  leçon, `planification-carte.js:481-570`), pas ceux d'un ensemble. **C'est une troisième notion d'« objectif »**,
  propre à la carte, sans lien avec les productions du module Productions ni avec les ensembles.
- **`production.objectif`** (mesuré) : un **texte libre** saisi au formulaire Productions (`productions.js:2060`,
  champ `productionObjectif`). Lu pour l'affichage : `productions.js:313`, `:3084`, `export-pdf.js:1955`, `:2148`,
  `evaluation-retroaction.js:134`, `synthese-retroaction-data.js:357`, `cartouches.js:3399`,
  `productions-bibliotheque-ui.js:94`. Deux lecteurs le prennent pour un lien : `portfolio.js:692`
  (`prod.objectif === objectif.id`) et `pratique-pan-standards.js:1140` (`p.objectif === obj.nom`). Aucun écrivain
  n'y pose un identifiant.

### 1.3 Ce qu'il reste du mode retiré

| Vestige | Où | État |
|---|---|---|
| `calculerPerformanceParObjectif(da, ensembleId)`, exposée sur `window` | `js/portfolio.js:658-781` | **aucun appelant** (mesuré) ; compare un texte libre à un identifiant |
| `_calculerNiveauxParObjectif` et `suggererNoteHolistique` | `js/pratiques/pratique-pan-standards.js:43`, `:1121` | vivants : la suggestion de la dénotation (`denotation-saisie-ui.js:79-82`). Apparie par `p.objectifId` (aucun écrivain) ou par le nom |
| Normalisation à la lecture d'une pratique enregistrée « par objectifs » | `pratique-registre.js:264`, `:331` ; `pratiques-gestion.js:1272` ; `wizard-pratique-v2.js:3170` | vivante, sans écriture ; avertissement en console |
| Gabarit de catalogue `pan-objectifs-ponderes` (13 objectifs, `methode: 'pan-par-objectif'`) | `js/pratiques/pratiques-predefines.js:474`, exporté `:814` | **encore au catalogue** (lu). Le changelog de la 1.63 dit que « les quatre gabarits qui l'illustraient partent avec lui » (`changelog-data.js:2610`) : celui-ci est resté. Son jeton s'écrit avec des tirets, donc le cliquet #396 ne le voit pas |
| Gabarit de grille « [STD] Grille par objectifs » | `js/gabarits-utils.js:200-213` | vivant : une grille dont les critères sont nommés « Objectif d'apprentissage 1 à 3 ». C'est la voie « un objectif = un critère », que la décision de Grégoire écarte |
| Cliquet d'absence | `tests/unit/sentinelle-ablation-pan-par-objectif-396.test.js` | interdit le jeton `pan_par_objectif` dans `js/` hors `pratique-registre.js`, commentaires compris. **Le nouveau moteur ne doit pas reprendre ce nom** |

### 1.4 La reprise ciblée

(lu) Elle ne range **aucune valeur par critère à part**. Une reprise est une **nouvelle évaluation entière** qui
porte `repriseDeId` (`evaluation-jetons.js:634`) ; l'originale reçoit `remplaceeParId`. La reprise ciblée ajoute
deux marques sur la copie : `jetonRepriseCibleeApplique` (`evaluation-jetons.js:266`) et `plafondNoteCiblee`, un
code de niveau qui plafonne le pourcentage (`evaluation-calcul.js:1943-1947`). Le critère repris est simplement
resaisi dans la grille de la nouvelle copie. **Rien à réemployer pour un niveau par cible** : la reprise ciblée
remplace, elle ne cumule pas.

### 1.5 Le résultat sans grille (tableau de notation)

(mesuré) Livré : `js/tableau-notation.js`, `js/tableau-notation-donnees.js`. La copie porte `sansGrille: true`,
`grilleId: null`, `criteres: []`, un `productionId` obligatoire (`tableau-notation-donnees.js:150-168`). Familles
admises : `['STD', 'SPE']` (`:30`). **Onze fichiers ont reçu une garde `sansGrille`** pour la tolérer
(`profil-etudiant-calculs.js:1010`, `:1052`, `:1585` ; `liste-evaluations.js` ; `evaluation.js` ;
`evaluation-jetons.js:572` ; `travaux-export-pdf.js:812` ; `travaux-archivage.js:434` ; `vue-simple-donnees.js:520` ;
`pratique-registre.js:1212`, `:1249` ; les deux fichiers du tableau). C'est le prix mesuré d'une forme neuve
d'évaluation.

## 2. Geste 1 – Dire les cibles du cours

**Où une pratique désignerait son ensemble.** (lu) Une pratique enregistrée est `{ id, nom, configuration }` dans
`pratiquesConfigurables` ; `construireConfigComplete` (`pratique-registre.js:268`) lit `configuration.{type,
portfolio, seuils, objectifs}`. La dénotation y range déjà ses cibles : `configuration.objectifs = [{ id, nom }]`,
éditées par `EditeurCibles` (`js/pratiques/editeur-cibles.js`), monté dans l'assistant et dans la gestion des
pratiques. Le groupe-cours désigne la pratique par `gc.pratiqueId` (`trimestre-v2-groupes-cours.js:783`, `:880`).

**Deux rangements possibles, et une tension avec la décision.**

| | (a) Dans la pratique : `configuration.objectifs` | (b) Un ensemble à part, qui porte `coursId` ; la pratique le désigne par `configuration.ensembleCiblesId` |
|---|---|---|
| Ce qui existe | tout : composant, identités permanentes, question avant retrait | la forme de l'objet (§ 1.1), pas l'écran ; identités à refaire |
| « Rattaché au cours » (décision de Grégoire) | indirect : pratique → groupe-cours → cours | direct |
| Deux groupes d'un même cours | partagent la pratique, donc les cibles | partagent l'ensemble |
| Poids, type, sous-objectifs (couches à venir) | à ajouter à la forme `{ id, nom }` | `poids` et `type` y sont déjà |

**Retenu : (b), avec le composant de (a).** La décision dit « un objectif d'un ensemble d'objectifs, rattaché au
cours » ; l'ensemble est donc un objet à lui. L'enseignant·e l'édite dans l'assistant et dans la fiche de la
pratique par `EditeurCibles` (aucune entrée de navigation neuve). L'écran orphelin de `objectifs.js` est **retiré**
dans le même lot (zéro-dette : il n'a pas d'hôte, et ses identités par position sont le défaut de #717).
Supposé : l'ensemble est rangé **par trimestre** (comme les grilles, les échelles et les pratiques depuis #358),
sous une clé inscrite au registre, et non sous la clé nue actuelle. ⚠ **Les cibles de la dénotation restent où
elles sont** : deux maisons pour le même mot, assumé pour ce plan, à réunir plus tard si Grégoire le veut (§ 9).

**Ajouter une pratique au registre.** (mesuré) La dénotation, dernière famille ajoutée, est nommée dans 11 fichiers
(48 occurrences de `'denotation'`) : `pratique-registre.js` (table des représentations l. 19-22 : code, couleur,
famille ; `METHODE_PAR_FAMILLE` l. 241), `pratique-configurable.js` (court-circuit en tête de
`calculerPerformance`, l. 194 ; `decrireCalcul`, l. 456), `wizard-pratique-v2.js` (étape `config-denotation`,
l. 241 ; routage l. 231, 335, 394), `pratiques-gestion.js`, `pratiques-bibliotheque.js`,
`profil-etudiant-actions.js:160` (diagnostic « non calculable »), `construction-attributs.js`,
`pratiques-exploration.js`, `comparateur-pratiques.js`, `parcours-notation-alternative.js`, `correction-da.js`.
C'est la liste de contrôle du chantier.

**Famille neuve, ou variante de Standards ?** (mesuré) 12 branchements sur `obtenirCode() === 'STD'` dans
5 fichiers, plus la garde `estFamilleStandards` de `calculerDetailsNoteFinale` : tous envoient au moteur du
portfolio. Une pratique par cibles sous le code « STD » exigerait une garde à chacun, dans le code qui calcule la
note de Grégoire. **Retenu : un `configuration.type` neuf, avec son code et sa méthode** (`niveaux_par_cible` ;
la règle dans `configuration.retenue: 'meilleur'`). Les branchements existants ne la voient pas, comme ils n'ont
pas vu la dénotation. Le nom affiché, le code de trois lettres et la couleur sont des mots : § 8.
⚠ Paradoxe à garder : selon la recherche citée au skill `pratiques-notation` (§ 2 bis), c'est **cette** pratique
qui est la notation par standards au sens strict (un suivi par standard), plus que la « Standards » actuelle
(une sélection de productions). Le code les sépare pour protéger un calcul, pas pour dire que l'une est plus
« standards » que l'autre.

## 3. Geste 2 – Inscrire un niveau : dans l'évaluation, ou à part ?

| Critère | Dans l'évaluation (`evaluation.niveauxParCible`) | Une collection à part (`inscriptionsCibles`) |
|---|---|---|
| Une production, une cible | une copie, une entrée | une inscription, `productionId` posé |
| Une production, plusieurs cibles au choix de l'étudiant·e (cas A) | une copie, N entrées ; les cibles non reprises absentes | N inscriptions qui partagent `productionId` et `date` |
| Un niveau sans production (cas B) | **impossible sans tricher** : une copie exige un `productionId` (`tableau-notation-donnees.js:156`), et la règle commune (`evaluationEntreDansLaNote`, complétion, remise) raisonne par production. Il faudrait une production fantôme par observation | une inscription, `productionId: null` |
| « Rien n'est écrasé » | à contre-pente : une copie se remplace (`remplaceeParId`), se réévalue en place | natif : une liste où l'on ajoute |
| Lecteurs à faire tolérer | 64 fichiers lisent `evaluationsSauvegardees` ; une copie porte **une** `noteFinale`, que sommative, standards, spécifications et dépistage liraient comme un résultat de production. Précédent mesuré : 11 fichiers gardés pour `sansGrille` | aucun lecteur d'évaluations |
| Risque pour les notes existantes | réel : toute garde oubliée déplace une moyenne | nul par construction, si aucun moteur existant ne nomme la collection (sentinelle, § 6) |
| Ce qu'on perd | rien du côté des écrans d'évaluation | la production n'a pas de copie : statut « non évaluée » à la liste, rien pour la complétion, le dépistage par critère, la rétroaction, le PDF de synthèse |
| Inscriptions aux registres nominatifs | aucune | `CLES_NAMESPACEES` (`trimestres.js:51`), propriété (`db.js:2288`), `correction-da.js` (`FAMILLES`, l. 111), `reserve.js:90`, `vue-simple-donnees.js:194`, `DATA-OWNERSHIP.md` |

**Tranché : la collection à part.** La raison décisive est le cas B : un niveau sans production n'a pas de place
dans une évaluation. La seconde est l'invariant : c'est la seule forme où le chantier ne peut déplacer aucune note
existante sans que ce soit visible dans un `grep`. Le précédent est `jugementsDenotation`, avec une leçon à ne pas
répéter : cette clé est restée **nue de fait**, faute d'inscription au registre (`DATA-OWNERSHIP.md:58`).

**La forme.**

```js
// <trimestre>_inscriptionsCibles : une LISTE. On y ajoute ; on n'y réécrit pas.
{ id, da, ensembleId, cibleId, niveau,        // niveau : le CODE dans l'échelle de la pratique
  echelleId, date, horodatage,
  productionId: 'PROD_…' | null,              // null : observation, conversation
  annulee: false }                            // une erreur de saisie se marque, elle ne s'efface pas
```

**Forme livrée au lot 2 (21 nov. 2026)**, qui remplace l'esquisse ci-dessus : deux sortes d'entrées dans la même liste.
`annulee: false` n'est pas écrit ; une annulation est une ENTRÉE DE PLUS, et l'inscription ne change jamais (voir le lot 2).

```js
{ id, type: 'inscription', da, ensembleId, cibleId,
  niveau: '<code>' | null,          // null : AUCUN niveau posé (une remarque ; complément du 21 nov., 9 h 17), jamais le « sans donnée »
  echelleId: '<id>' | null,         // null quand niveau est null
  date, horodatage, productionId: 'PROD_…' | null,
  noteBreve,                        // '' si rien ; jamais vide quand niveau est null (refusée)
  criteres: [ { id, texte, essentiel, respecte: true | false | null } ] }   // null : non renseigné
{ id, type: 'annulation', inscriptionId, da, ensembleId, cibleId, date, horodatage, raison }
```

Décidé ici (technique) : à niveau égal, l'inscription retenue est **la première à l'avoir atteint** (la date
affichée est celle de l'atteinte) ; une inscription dont le code n'est plus dans l'échelle n'est pas lue et se dit
à l'écran ; une cible retirée de l'ensemble cesse d'être lue sans que ses inscriptions soient effacées (règle de
la dénotation, `editeur-cibles.js`, en-tête).

**Ce qui voyage dans le codex.** (lu) « Enregistrer » prend **toutes** les clés de la base (`codex.js:481-497`) et
l'ouverture d'un codex remplace l'espace : une clé neuve voyage sans rien écrire. Un codex ancien ouvert dans la
version neuve n'a simplement pas la clé (liste vide). Un codex neuf ouvert dans une version ancienne : la clé est
écrite et ignorée, mais ce que devient une pratique d'un type inconnu n'a **pas été mesuré** (inféré : introuvable
au registre, donc « non calculable ») ; à éprouver au lot 1, c'est le seul sens de rétrocompatibilité qui peut
surprendre. Les chemins qui nomment les clés une à une (fusion d'un
codex, correction d'un DA, archives, vue simple, suppression d'un trimestre) demandent une inscription explicite :
c'est la colonne du bas du tableau ci-dessus. Non mesuré : la fusion (`import-export.js`) et le partage d'une
pratique entre collègues, qui devra emporter son ensemble de cibles.

## 4. Geste 3 – Voir le niveau retenu

**Ordonner.** (lu) `ordonnerNiveauxParPlage(niveaux)` (`profil-etudiant-calculs.js:200`) rend
`[{ code, nom, min, max, rang }]`, rang 1 = le plus faible, par borne inférieure puis supérieure (le cas
« Suspendu 0-0 » à côté d'« Insuffisant 0-64 » y est traité). Un niveau sans code ou sans borne « Min » est
**écarté** de l'ordre : le moteur doit alors dire « ordre illisible », pas choisir. C'est la seule source d'ordre
à employer ; `echelles.js:2761` s'en sert déjà pour valider les repères de maîtrise.

**Où le tableau vit, sans entrée de navigation.** Deux hôtes existent :

- **Le tableau de notation** (Évaluation › Liste, seconde vue ; `FAMILLES_DU_TABLEAU`,
  `tableau-notation-donnees.js:30`) : pour cette pratique, les colonnes deviennent les cibles au lieu des
  productions. C'est la vue du groupe et le lieu de la saisie (geste 2).
- **Le profil de l'étudiant·e** : une section conditionnelle à la pratique active, comme « Jugement » pour la
  dénotation (`profil-etudiant-sections-affichage.js:2313`, `:2339`). C'est la vue d'un·e étudiant·e : une ligne par
  cible, le niveau retenu, puis toutes ses inscriptions datées.

Retenu : les deux, la saisie au tableau, l'historique au profil. Ni `config.js` ni `navigation.js` ne changent.

## 5. Geste 4 – La note

**Du niveau à la note.** (lu) `valeurNumeriqueDuNiveau(niveau)` (`echelles.js:2629`) rend la valeur ponctuelle
(`valeurCalcul`), ou `null` ; jamais le milieu de la plage (#527). Le zéro est une valeur. La note est la moyenne
des valeurs ponctuelles des niveaux retenus, à poids égal.

**Par où elle sort.** (lu) Le contrat est celui de la dénotation : `calculerPerformance(da)` (0 à 1, ou `null`),
branché par un court-circuit en tête dans `pratique-configurable.js:194`, et `decrireCalcul(da)` pour le récit.
`simulerIndices` (`portfolio.js`) unifie ensuite les familles.

**Les lecteurs à garder cohérents.**

| Lecteur | Par où il lit | Degré |
|---|---|---|
| Profil (carte de la note, diagnostic « non calculable ») | `simulerIndices`, `calculerDetailsNoteFinale` (STD seul), `profil-etudiant-actions.js:160` | lu |
| Comparateur, Exploration | `simulerIndices` (`comparateur-pratiques.js`) ; `construction-attributs.js` pour les lignes de construction | lu |
| Export des résultats finaux | `simulerIndices` (`export-resultats-finaux.js`) | lu |
| PDF de synthèse | `synthese-retroaction-data.js` (`simulerIndices`, `calculerDetailsNoteFinale`) | lu |
| Tableau de notation | `simulerIndices` (`tableau-notation.js:200`) | lu |
| Indices stockés (`indicesCP`) : tableau de bord, liste des évaluations, graphiques, registre longitudinal | `calculerEtStockerIndicesCP` ; 20 fichiers lisent `indicesCP` | mesuré (compte), lu |
| Liste des étudiant·es | `etudiants.js:317` (`calculerPerformance`) | lu |
| Dépistage (IPB, défis, patterns) | lit les **critères** des évaluations (`profil-etudiant-calculs.js`) : **ne verra rien** dans cette pratique | lu |
| Captures (`snapshots`) | non mesuré | – |

⚠ **Piège connu** (lu, `portfolio.js:582`) : l'indice stocké transforme un `null` en **0**. Une note « non
calculable » par cibles s'afficherait « P = 0 » partout où l'on lit `indicesCP`. La dénotation vit déjà avec ce
défaut ; le lot 4 doit le mesurer sur chaque lecteur du tableau plutôt que le supposer réglé.

## 6. L'invariant

**Les sentinelles qui épinglent les notes actuelles** (mesuré, en-têtes lus) :

| Sentinelle | Ce qu'elle épingle |
|---|---|
| `tests/unit/golden-master-calcul-sessionC.test.js` (5 essais) | sommative : 80 et 90 pondérés 40/60 → 0,86 |
| `tests/unit/sentinelle-construction-de-la-note-2026-10-28.test.js` (53) et `…-correctifs-…` | la table de cas des quatre familles (SOM, STD, SPE, DEN), profil, Comparateur, export |
| `tests/unit/sentinelle-standards-sans-portfolio.test.js` (63) | **la pratique de Grégoire** : GREG-0 à GREG-2 = 84,8, avec ou sans production de plus |
| `tests/unit/denotation-moteur-DEN1.test.js` (16) | dénotation : garde des cibles → 59 ; parité de la suggestion |
| `tests/integration/golden-master-procedural-L2-0.spec.js` | le chemin procédural, au navigateur |
| `tests/unit/sentinelle-ablation-pan-par-objectif-396.test.js` | l'absence du chemin retiré |

**Ce qui manque**, et que le lot 0 pose avant tout moteur :

1. **Une sentinelle de non-ingérence.** Rejouer les cas épinglés (au moins SOM, GREG-0, un SPE, un DEN) dans un
   espace qui contient **aussi** un ensemble de cibles, une pratique par cibles non active et des inscriptions pour
   le même DA : mêmes chiffres, au centième. Aujourd'hui rien ne prouve qu'une collection voisine est sans effet.
2. **Un cliquet de silence**, sur le modèle de l'invariant du barème (`bareme-1-editeur.test.js`) :
   `pratique-sommative.js`, `pratique-pan-standards.js`, `pratique-pan-specifications.js`,
   `profil-etudiant-actions.js`, `profil-etudiant-calculs.js` et `evaluation-calcul.js` ne nomment ni
   `inscriptionsCibles` ni la méthode neuve.
3. **Le sens inverse** : la pratique par cibles ne lit pas `evaluationsSauvegardees`. Sinon une évaluation saisie
   par habitude changerait sa note en silence. **Ne peut pas s'épingler avant que le moteur existe : essai à écrire
   au lot 4** (§ 8).
4. **Rien n'épingle la pratique de Grégoire sur ses données réelles** : GREG-0 est une fixture. Aucune machine ne
   peut y répondre ici. Proposé au lot 4 : un export des résultats finaux de son trimestre avant et après, comparé
   octet pour octet. C'est une porte terrain au sens du skill (la machine ne peut pas répondre).

## 7. La place des couches

| Couche à venir | Entre-t-elle sans changer la forme ? |
|---|---|
| Un poids par cible | **entré au cœur** (décision du 20 nov.) : `poids` sur chaque cible depuis le lot 1 ; la moyenne pondérée au lot 4 |
| Un sous-ensemble de cibles (double seuil) | **entré au cœur** (décision du 20 nov.) : `terminale` sur chaque cible depuis le lot 1 ; la condition au lot 4 |
| Une note brève par inscription | **entrée au cœur** (lot 2) : c'est la rétroaction (N5). Texte libre de l'enseignant·e : `echapperHtml` à tout affichage |
| Une autre règle de retenue | oui : `configuration.retenue` (`meilleur` aujourd'hui). Tout l'historique est gardé, donc « le plus récent » ou une tendance centrale se calculent sur le stock déjà écrit. ~~« Le jugement » demande une inscription d'un genre à part~~ : **retiré** (décision du 20 nov. : le jugement est l'inscription, un niveau communiqué ne redescend pas) |
| Des sous-objectifs (cas C) | oui pour le rangement : `parentId` sur l'objectif, inscriptions sur les feuilles. **Non réglé** : comment un objectif parent tire son niveau de ses enfants. C'est une question de didactique, pas de forme |

## 8. Les lots

Ordre : 0, puis 1 à 4. Chaque lot est livrable seul ; aucun ne change une note d'une pratique existante.

### Lot 0 – La garde (aucun geste, aucun écran)

- **Dans le code** : rien dans `js/`. Les sentinelles 1 et 2 du § 6, écrites contre l'état actuel (vertes dès
  aujourd'hui), plus un essai qui échoue si on mute un moteur existant pour lire la clé neuve.
- **Notes qui changent** : aucune.
- **Livré le 20 nov. 2026** : `tests/unit/sentinelle-moteur-cibles-0-garde.test.js` (16 essais). Sept cas rejoués
  nu et habité (SOM-1, GREG-0 à GREG-2, SPE-1, DEN-1, DEN-2) plus le golden master de la sommative ; le store du
  banc consigne chaque clé lue, donc une lecture de la clé neuve rougit même si aucun chiffre ne bouge. Le cliquet
  couvre les six fichiers du § 6. Cinq break-tests, journal en fin de fichier.
- **Appris en posant les break-tests** (mesuré) : une pratique enregistrée, celle de Grégoire comprise, est une
  `PratiqueConfigurable` ; sa note ne passe par aucune méthode de `pratique-pan-standards.js`. Une lecture posée dans
  `PratiquePANStandards.calculerPerformance` restait verte : la sentinelle appelle donc aussi les trois instances
  codées en dur. `pratique-configurable.js`, qui porte la note des pratiques enregistrées, n'est **pas** au cliquet
  (il recevra le court-circuit du lot 4) : seul le témoin des lectures le garde. Limite assumée : une lecture au nom
  fabriqué, dans une fonction qu'aucun cas rejoué n'atteint, passe les deux gardes.

### Lot 1 – « Je dis quelles cibles compte mon cours » (révisé le 20 nov., 21 h 25 ; livré le 21 nov.)

- **Ce que l'enseignant·e voit** : dans l'assistant, un choix de plus, « Par standards » (voie rapide et question
  « Comment calcules-tu la note finale ? ») ; une étape « Les cibles du cours » (le cours, puis une carte par cible :
  étiquette, poids et sa part du total, case « Cible terminale », énoncé, critères un par ligne, chacun avec sa case
  « Critère essentiel » ; ajouter, retirer, monter, descendre ; poids égaux d'office, total lu sous la liste) ; une
  étape « L'échelle des niveaux » (une échelle de la bibliothèque, ou l'échelle de départ proposée, puis le niveau
  « sans donnée » parmi ses niveaux qui valent 0 %). La fiche de la pratique montre les cibles. Un groupe-cours peut
  recevoir la pratique. Elle ne calcule rien, et la note le dit en mots.
- **Les règles du lot et leur origine** :

  | Règle | Origine |
  |---|---|
  | Une cible est un objectif du cours, à mi-chemin entre l'objectif terminal et le critère ; 6 à 15 par cours (texte d'aide, aucun refus) | C1, C2 |
  | Une cible a une étiquette courte et un énoncé | C3 |
  | Une cible porte ses critères, un par ligne | C4 |
  | Un critère peut être marqué « essentiel » | C5 |
  | Une cible est terminale ou non | C6 |
  | L'ensemble est rattaché au cours (choix facultatif d'un cours ; d'office, celui du groupe-cours actif) | C7, C8 (*choix de Grégoire*) |
  | Chaque cible a un poids, plus grand que zéro, réglé par l'enseignant·e ; égaux d'office ; total lu, jamais vérifié contre un plan-cadre | F2, *choix de Grégoire* |
  | Une échelle pour toutes les cibles de la pratique | E6 |
  | L'échelle désigne son niveau « sans donnée », qui vaut 0 % ; seuls les niveaux à 0 % peuvent l'être | E2, F3, *choix de Grégoire* (« qui vaut 0 % ») |
  | L'échelle de départ : cinq niveaux (0 à 4), valeurs 0, 25, 50, 75, 100 % ; noms du système de chimie, **à valider** | E1, E4 (R, p. 103 ; tableau 5.6, p. 102) |
  | Ce niveau sert aussi au travail très incomplet (description du niveau 0 de l'échelle de départ) | E3 |

- **Dans le code** : le type `cibles` (code interne CIB, sigle affiché STD et couleur `--std-bleu` depuis le 21 nov. ; famille PAN) et la méthode
  `niveaux_par_cible` au registre ; `PratiqueConfigurable.calculerPerformance` rend `null` pour cette méthode, sans lire
  ni évaluations ni `indicesCP`, et `expliquerNoteNonConstructible` dit pourquoi ; le module propriétaire
  `js/pratiques/ensembles-cibles.js` (refus, échelle de départ, écriture, fiche) ; le mode « standards » du composant
  `EditeurCibles` (le mode de la dénotation est inchangé) ; l'assistant (deux étapes, création, réédition, récapitulatif) ;
  la fiche (`pratiques-gestion.js`, lecture seule, menu du type verrouillé pour cette pratique, carte commune de
  l'échelle masquée pour elle) ; la clé inscrite à `CLES_NAMESPACEES`, `db._SSOT_OWNERS`, la Réserve (`CLES_SANS_FILTRE`),
  le codex (`_estBiblioPartagee`), `DATA-OWNERSHIP.md`. Pas à `CorrectionDA.FAMILLES` : un ensemble ne porte aucun DA.
- **Forme rangée** : `<trim>_ensemblesCibles = [{ id, coursId, cibles: [{ id, etiquette, enonce, criteres: [{ id, texte,
  essentiel }], poids, terminale }], dateCreation, dateModification }]` ; la pratique : `configuration: { type: 'cibles',
  ensembleCiblesId, echelleId, niveauSansDonnee }` (un code). Pas de `retenue` : « le meilleur » vaut dans tous les cas,
  un champ sans lecteur n'est pas écrit.
- **Refus, en mots** : aucune cible ; une cible commencée sans étiquette (ajouté : son énoncé se perdait en silence) ; un
  poids nul, négatif ou absent ; aucune échelle ; une échelle sans niveau à 0 % ; aucun niveau « sans donnée » désigné.
- **Retraits du même lot, dans un commit à part** : l'écran orphelin de `objectifs.js`, `calculerPerformanceParObjectif`
  (`portfolio.js`), le gabarit `pan-objectifs-ponderes` s'il n'est offert nulle part. Aucune donnée d'utilisateur
  effacée ni réécrite, pas même l'ancienne clé nue `objectifsTemplates`.
- **Sentinelle** : `tests/unit/sentinelle-par-standards-lot-1-cibles.test.js` (identité, refus, assistant réel, registre,
  registres nominatifs ; sept break-tests) ; `sentinelle-wizard-golden-creation-319` inchangée ; sentinelle du lot 0
  rejouée.
- **Notes qui changent** : aucune.
- ⚠ Stock : rien à convertir. L'ancienne clé nue `objectifsTemplates` reste où elle est ; s'il y a des ensembles chez
  Grégoire, on mesure, puis on propose (geste sur ses données : il décide).

### Lot 2 – « J'inscris un niveau pour un·e étudiant·e sur une cible » (révisé et livré le 21 nov. 2026)

Consigne : `plans de travail/CONSIGNE-LOT-2026-11-21-moteur-cibles-2-inscrire.md`. Branche `lot/moteur-cibles-2-inscrire`
(partie de `lot/moteur-cibles-1-cibles`, `947ea9d5`) ; rien dans `main`. Textes : `TEXTES-2026-11-21-par-standards-lot-2.md`.

- **Ce que l'enseignant·e voit** : au tableau de notation, pour un groupe « Par standards », les cibles en colonnes et les
  étudiant·es en rangées. Une case montre le DERNIER niveau inscrit et combien d'inscriptions elle porte (pas le niveau
  retenu : lot 3). La toucher ouvre l'inscription : la cible et son énoncé ; ses critères, chacun « Respecté », « Non
  respecté » ou laissé non renseigné ; le niveau, parmi tous ceux de l'échelle, le « sans donnée » compris ; la
  rétroaction ; d'où vient le niveau (une production, ou rien) ; la date, d'office aujourd'hui. Dessous, l'historique de la
  case, et « Annuler cette inscription ». Un bouton « Inscrire pour une production » ; et, dans la fiche d'une production,
  la liste facultative des cibles qu'elle renseigne. Dans l'assistant, retirer une cible qui porte des niveaux inscrits pose
  la question avant d'écrire. Aucune note ne se calcule ; aucun écran de l'étudiant·e.
- **Les règles du lot et leur origine** :

  | Règle | Origine |
  |---|---|
  | Le niveau se pose par jugement : l'enseignant·e le choisit ; les critères le guident, ils ne le calculent pas | N1 |
  | Les critères s'affichent, les essentiels marqués ; on PEUT dire ceux qui sont respectés ; facultatif ; aucun niveau proposé, refusé ni signalé à partir d'eux | N1, C4, C5 ; *choix de Grégoire, 21 nov. 2026* |
  | « Non renseigné » n'est pas « non respecté » (`respecte: null` d'office) | *choix de Grégoire, 21 nov. 2026* |
  | Une production peut toucher plusieurs cibles : un niveau par cible touchée, aucune note d'ensemble (geste par production) | N2 |
  | Un niveau peut se poser sans production (observation, entretien) | N3 |
  | L'étudiant·e choisit les cibles qu'il ou elle reprend ; les autres ne reçoivent rien (chaque cible part sur « Rien ce jour-là ») | N4 |
  | Avec le niveau vient une rétroaction (le champ « Rétroaction », facultatif) | N5 ; *choix de Grégoire, 20 nov. 2026* (« chaque niveau inscrit peut porter une note brève ») |
  | Chaque inscription est gardée et datée ; deux inscriptions sur la même cible sont deux entrées | N6 (*choix de Grégoire*) |
  | Une inscription erronée ou une trace devenue invalide s'annule ; elle reste visible, barrée, datée de l'annulation ; une raison facultative | N7 ; la raison : *décidé par Cowork* ; aucune suppression : *limite de Grégoire, 20 sept. 2026* |
  | Le niveau « sans donnée » s'inscrit comme un autre | E2, E3 |
  | Toute échelle convient (trois niveaux comme six) | *choix de Grégoire, 21 nov. 2026* |
  | Une cible sans critère est acceptée | *choix de Grégoire, 21 nov. 2026* |
  | Une production déclare, facultativement, les cibles qu'elle renseigne ; sans liste, toutes sont offertes | *décidé par Cowork* (consigne du lot) |
  | La case montre le dernier niveau inscrit, pas le niveau retenu | *choix technique* (consigne : un affichage qui ne préjuge pas du lot 3) |
  | Une inscription peut ne porter aucun niveau (`niveau: null`, une « remarque ») ; elle porte alors un texte ; jamais le niveau « sans donnée » ; la case garde son dernier niveau, ou montre ✎ si elle n'a que des remarques | *choix de Grégoire, 21 nov. 2026, 9 h 17* ; « cas A, courriel du 21 nov. 2026 : quand il triangule, il prend des notes qualitatives à différents moments et ne pose un niveau que lorsqu'il juge avoir assez de traces ; c'est sa stratégie pour 7 de ses 10 cibles à l'automne 2026 » |

- **Dans le code** : le module propriétaire `js/pratiques/inscriptions-cibles.js` (`InscriptionsCibles` : forme, refus,
  lectures pures, seuls écrivains `inscrire` et `annuler`, par `modifierEtAnnoncer(cle('inscriptionsCibles'))`, qui
  AJOUTENT au bout de ce qui est lu dans la file d'écriture) ; l'écran `js/tableau-cibles.js` et `css/tableau-cibles.css`
  (le tableau, la fenêtre, l'historique, le geste par production) ; `tableau-notation.js` reconnaît la famille `cibles` et
  délègue (le tableau des productions ne change pas ; la vue simple garde son message) ; la fiche d'une production
  (`productions.js`, bloc `productionCiblesBloc`, champ `ciblesRenseignees`, patron #790 : rien n'est réécrit quand le bloc
  n'est pas affiché) ; l'assistant (`_confirmerRetraitCiblesInscrites`) ; la phrase de la note absente (N1').
- **Registres nominatifs** : `CLES_NAMESPACEES` (trimestres), `db._SSOT_OWNERS` (propriété), `CorrectionDA.FAMILLES`
  (catégorie `inscriptions`, la fenêtre compte les inscriptions), la Réserve (`CLES_FILTRER_PAR_DA` : chaque entrée porte
  `da`, annulations comprises), les clés de résultats du retrait d'un groupe (`vue-simple-donnees.js`), le codex (libellé
  de la fusion ; une liste à `id` : la fusion en fait l'union, sans conflit, puisque rien n'est réécrit), `DATA-OWNERSHIP.md`.
  La suppression d'un trimestre l'emporte par son préfixe. L'archivage d'un trimestre la garde sous son préfixe (rien à
  copier : `CLES_TEMPLATES_ARCHIVES` ne sert qu'aux clés autrefois globales). `ciblesRenseignees` d'une production :
  déclarée non transportée à l'export d'une production (`CLES_PRODUCTION_NON_TRANSPORTEES`).
- **Un critère retiré ou réécrit** ne pose pas de question : chaque inscription garde le texte des critères qu'elle a
  jugés, et rien ne se calcule à partir des coches. **Une cible retirée** : la question, puis la cible cesse d'être
  montrée ; ses inscriptions restent (lisibles si elle revient sous le même id).
- **Sentinelle** : `tests/unit/sentinelle-par-standards-lot-2-inscrire.test.js` (32 essais, treize break-tests) ; spec
  `tests/integration/par-standards-lot-2-inscrire.spec.js` (Chromium) ; sentinelle du lot 0 rejouée (16/16).
- **Notes qui changent** : aucune. Aucun moteur existant ne lit la clé (cliquet du lot 0).
- **Complément du 21 nov., 9 h 17** (commit à part) : l'inscription sans niveau ci-dessus ; la tuile « Aucun niveau »
  (cochée d'office dans la fenêtre d'une case), le bouton qui dit ce qu'il inscrit, le refus de l'inscription vide, la
  case ✎, l'historique, le geste par production. Sentinelle : bloc L (9 essais, cinq break-tests) ; spec Chromium (6).
  **Pour les lots 3 et 4** : lire le niveau par `InscriptionsCibles.lireNiveau` / `estSansNiveau` ; une remarque n'entre
  ni au niveau retenu ni à la note.

### Lot 3 – « Je vois le niveau retenu par cible » (livré le 21 nov. 2026, avec le lot 4)

> **Livré** sur `lot/moteur-cibles-3-4-retenu-note` (règles et origines : en tête du plan ; rapport :
> `RAPPORT-2026-11-21-moteur-cibles-3-4.md`). Dans le code : `js/pratiques/note-cibles.js` (`NoteCibles` : `ordreDeLEchelle`,
> `retenirDansLHistorique`, `retenirParCible`, purs ; `lireEleve`, lecture seule) ; la case du tableau
> (`js/tableau-cibles.js`) ; la section « Cibles » du profil (`js/profil-cibles.js`). `InscriptionsCibles.etatDeLaCase`
> (le dernier niveau du lot 2) est retirée. Les cas A et B du banc n'ont pas pu être rejoués : le banc n'avait pas été
> committé (§ 12) ; la sentinelle pose ses propres cas, une section par règle.

- **Ce que l'utilisateur voit** : au tableau, chaque case montre le niveau retenu (le meilleur démontré, T2, qui ne
  redescend jamais, T3 et décision du 20 nov.) et combien d'inscriptions il y a derrière. Au profil, une section : une
  ligne par cible, le niveau retenu, sa date, sa source, sa note brève, puis l'historique. **Une cible sans niveau
  porte le nom du niveau « sans donnée »** de l'échelle, jamais un vide ni un zéro chiffré.
- **Dans le code** : `retenirParCible(inscriptions, cibles, echelle)`, pur ; l'ordre par `ordonnerNiveauxParPlage` ;
  la section du profil.
- **Sentinelle** : les cas A et B du banc, au niveau près ; un niveau plus bas inscrit après un plus haut ne change
  pas le retenu ; un code absent de l'échelle n'est pas lu ; ordre illisible → rien de retenu, et le motif.
- **Notes qui changent** : aucune.

### Lot 4 – « La note du cours vient des niveaux retenus », avec la pondération et le double seuil (livré le 21 nov. 2026)

> **Livré** avec le lot 3. `PratiqueConfigurable` : le court-circuit du lot 1 devient le calcul (`calculerPerformance`,
> `decrireCalcul`, `expliquerNoteNonConstructible`, par `NoteCibles`) ; le double seuil dans la fiche de la pratique
> (`configuration.doubleSeuil = { actif, seuil, plafond }`, gardé par l'assistant à la réédition, #938) ; la colonne de la
> note au tableau ; le récit au profil. Le sens inverse est épinglé (ni évaluations, ni `indicesCP`, ni productions lus).
> Les lecteurs du § 5, éprouvés : voir le rapport, § 3.

- **Ce que l'utilisateur voit** : la note au profil avec son récit (chaque cible, son niveau, sa valeur, son poids, la
  moyenne pondérée, F1, F2 ; le second seuil quand il plafonne, F4) ; la même note à l'export, au Comparateur, au
  tableau. **Pendant la session, une cible sans donnée empêche la note chiffrée** et la liste des cibles en attente se
  lit (F7, *choix de Grégoire*) ; **à l'arrêt des notes, elle compte pour 0 %** (F3).
- **Dans le code** : le court-circuit du lot 1 devient le calcul (`calculerPerformance`, `decrireCalcul`) ; le
  diagnostic ; chaque lecteur du § 5 éprouvé un à un, dont le `null` devenu 0 de `indicesCP`. Le second seuil : à
  régler dans la pratique (seuil et plafond ; défauts du rapport, 60 et 55, **à faire valider** : le cas exact de 60
  n'est pas tranché par les sources, fiche § 7).
- **Sentinelle** : cas A et B recalculés avec poids et seuil ; une valeur ponctuelle manquante → « non calculable »,
  jamais un chiffre ; le sens inverse (le moteur par cibles ne lit pas `evaluationsSauvegardees`) ; sentinelles du lot 0
  rejouées.
- **Notes qui changent** : celles de la pratique neuve. Aucune autre. Porte terrain : l'export de Grégoire avant et
  après (§ 6, point 4).

### Lot 5 – « L'étudiant·e reçoit un relevé par cible »

- Les cibles, leurs critères, la définition des niveaux dès le départ (S1) ; un niveau par cible, jamais une note par
  instrument (S2) ; où il ou elle en est sur chaque cible (S3). Le mot imprimé pour l'étudiant·e (« cible » ou
  « objectif ») attend Grégoire (É6).

## 9. Les mots (proposés, aucun arrêté)

| Ce qu'il faut nommer | Propositions | Remarque |
|---|---|---|
| L'unité | « cible », « objectif », « standard », « cible d'apprentissage » | « cible » est déjà le mot de la dénotation à l'écran ; « objectif » est celui de la carte d'Alignement (objectif de leçon) et du champ « Objectif » d'une production. Un troisième sens du même mot est le risque |
| L'ensemble | « cibles du cours », « ensemble d'objectifs », « liste de cibles » | |
| La pratique | « Par cibles », « Par objectifs », « Standards – meilleur niveau » | « Par objectifs » est le nom du mode retiré à la 1.63 : le changelog a dit aux utilisateurs qu'il était parti |
| Son code et sa couleur | un code de trois lettres (CIB, OBJ) ; une couleur à choisir à `design-system.html` | le badge de famille resterait « PAN » |
| Le geste 2 | « inscrire un niveau », « consigner », « noter une observation » | |
| Le résultat | « niveau retenu », « meilleur niveau », « niveau atteint » | « retenu » survit aux autres règles de retenue ; « meilleur » non |
| La source sans production | « observation », « conversation », « sans production » | |
| La cible vide | « pas encore de niveau », « à venir », « non observée » | |
| L'inscription retirée | « annulée », « retirée » | |

## 10. Les questions de didactique (non tranchées, avec ma recommandation)

> **Mise à jour du 21 nov. 2026** : les questions 1 (cible sans niveau) et 2 (le meilleur, vraiment ?) sont **réglées**
> par les décisions du 20 nov. (en tête du plan) ; la question 3 (une échelle pour toutes les cibles) est appliquée au
> lot 1 (E6) ; la question 5 devient le lot 5 (le relevé). Les questions 4, 6 et 7 restent comme écrites ci-dessous
> (la 7 est réglée au lot 4 par le double seuil).

1. **Une cible sans aucun niveau, que vaut-elle ?** Le banc donne 75,83 (on l'ignore), 56,88 (elle vaut zéro) ou
   « non calculable ». *Recommandation* : « non calculable » tant que « Notes finalisées » n'est pas cochée, avec
   la liste des cibles en attente ; au moment d'arrêter les notes, la question est posée à l'enseignant·e, cible par
   cible. Motif : les deux autres fabriquent un chiffre que personne n'a décidé.
2. **Le cas B, « observations croisées » : le meilleur, vraiment ?** Trois observations D, M, D rendent M. Le
   collègue décrit un jugement issu d'un croisement, pas un maximum. *Recommandation* : livrer « le meilleur »
   comme décidé, et dire à l'écran que c'est la règle ; la retenue « par jugement » est la première couche à ouvrir
   ensuite, parce que le cas B la demande plus que le cas A.
3. **Une échelle pour toutes les cibles, ou une par cible ?** *Recommandation* : une seule, celle de la pratique.
   L'inscription garde tout de même `echelleId`, pour ne pas fermer la porte.
4. **Un niveau inscrit à partir d'une production évaluée avec une grille** : veut-on un jour qu'une évaluation
   *propose* des inscriptions (critère aligné sur une cible) ? *Recommandation, corrigée le 20 nov. 2026* (décision de Grégoire, en tête du plan) :
   **une couche à livrer avant sa rentrée d'hiver 2027, après le noyau.** Il expérimentera probablement cette
   pratique lui-même : le pont a donc un demandeur. Il n'est pas conçu ici ; le noyau (lots 1 à 4) garde les deux
   mondes séparés, et la sentinelle du lot 0 devra être relue quand le pont entrera, puisqu'il fera lire une
   évaluation par le monde des cibles. ~~Pas dans ce plan ; un pont viendra s'il est demandé par quelqu'un qui l'a
   vécu.~~
5. **Ce que l'étudiant·e reçoit.** Cette pratique ne produit ni rétroaction par critère ni PDF de synthèse.
   *Recommandation* : le dire à l'enseignant·e au moment du choix, comme pour le résultat sans grille ; un relevé
   par cible pour l'étudiant·e est un besoin probable, à attendre qu'il soit exprimé.
6. **Les deux maisons du mot « cible »** (dénotation dans la pratique, ici dans un ensemble du cours) : les réunir ?
   *Recommandation* : pas maintenant. La dénotation a des coches écrites chez des gens ; les déplacer est un geste
   sur des données.
7. **Le seuil de réussite.** Une moyenne de valeurs ponctuelles peut donner 60 à quelqu'un qui n'a atteint le seuil
   sur presque aucune cible, selon l'échelle. *Recommandation* : ne rien ajouter au noyau ; c'est exactement ce que
   le double seuil annoncé viendra régler.

## 11. Les trouvailles et leur issue

| Trouvaille | Issue |
|---|---|
| L'écran des ensembles d'objectifs n'a pas d'hôte dans `index.html` | **retiré au lot 1** (fait le 21 nov. : `js/objectifs.js`, son appel au démarrage et son `<script>`) ; la clé nue `objectifsTemplates` reste telle quelle |
| `calculerPerformanceParObjectif` (`portfolio.js:658`) sans appelant | **retirée au lot 1** (fait le 21 nov.), même motif |
| Le gabarit `pan-objectifs-ponderes` est resté au catalogue alors que le changelog 1.63 annonce le départ des gabarits du mode | **retiré au lot 1** (mesuré le 21 nov. : `PRATIQUES_PREDEFINES` n'est lue par aucun écran, seulement par la migration V2 de `pratique-manager.js`, qui en lit les noms de constantes) |
| `jugementsDenotation` est nue de fait (déjà consigné, `DATA-OWNERSHIP.md:58`) | **déjà inscrit** ; sert d'avertissement pour la clé neuve |
| `indicesCP` range 0 pour une note non calculable (`portfolio.js:582`) | **mesuré lecteur par lecteur au lot 4** (rapport du lot, § 3) : la liste et un en-tête du profil corrigés ; l'Aperçu inscrit ci-dessous |
| Trois sens du mot « objectif » (leçon, texte d'une production, ensemble) | **aux mots** (§ 9) |
| En « Par standards », le formulaire des productions exige encore une pondération (`raisonChampsObligatoiresProduction` ne connaît que `standards` ; mesuré au lot 2, 21 nov.) : une production qui ne pèse sur aucune note doit en porter une | **réglée au lot 4** (21 nov.) : aucune pondération exigée, l'astérisque part, une phrase le dit sous le champ |
| `indicesCP` range 0 pour une note non constructible : la liste des étudiant·es l'écrivait « 0 % » (cellule P, moyenne, corrélations, tri) et l'en-tête « Développement des habiletés » du profil aussi | **corrigé pour « Par standards » seulement** (lot 4 ; borné le 21 nov., 13 h 30, à la demande de Cowork : décision de Grégoire du 20 nov., sa pratique de l'automne ne change pas, ni ses calculs ni ce que ses écrans en disent) |
| **Une note non constructible s'affiche « 0 % » dans la liste des étudiant·es pour les autres pratiques** (« Par sélection de productions », sommative, spécifications, dénotation : la cellule P, la moyenne « moy=… », les moyennes filtrées, les corrélations avec P, le tri), et l'en-tête « Développement des habiletés » du profil dit « 0 % » et le code du niveau le plus bas | **inscrire et continuer** : la correction générale, hors de ce lot, **à porter à Grégoire** (elle changerait ce que ses écrans disent) |
| Le Comparateur (Labo) écrit « CIB » dans ses menus (`p.code` au lieu du sigle) et le badge « SEL » sur une pratique par standards dans les maquettes (`genererBadgePratiqueHTML` retombe sur la famille par défaut, ce que son propre commentaire déconseille) | **corrigé le 21 nov., 13 h 30** (correction 2 de Cowork ; décision de Grégoire, 21 nov., 6 h 56) : menus, maquettes et en-tête du CSV lisent le sigle |
| L'aide « Méthodes de calcul des indices » (Suivi › Aperçu, et la liste des étudiant·es) nomme « Sommative » toute pratique qui n'est pas « Par sélection de productions » (`etudiants.js`, `genererExplicationCalculIndices`) : en « Par standards », elle dit « pratique active : Sommative » et décrit P comme une moyenne pondérée des évaluations (vrai aussi en spécifications et en dénotation) | **inscrire et continuer** (relevé le 21 nov., 13 h 30, en mesurant l'Aperçu) |
| L'Exploration (« Construction de la note ») décrit une pratique par standards comme une sélection d'artefacts, « Alignement sur des cibles : non couvert », « Pondération : égale » : `construction-attributs.js` ne connaît pas le type `cibles` | **inscrire et continuer** |
| Les corrélations de l'Aperçu (r(A↔P), r(C↔P)) comptent une note non constructible pour 0 (`tableau-bord-apercu.js`, `_correlations…`), affichées seulement si \|r\| ≥ 0,5 | **inscrire et continuer** (relevé par l'audit des lecteurs du 21 nov.) |
| Le PDF de synthèse n'a aucune note pour cette pratique (il ne connaît que STD et SOM) | **commenter et oublier** : prix accepté du noyau (« ni PDF de synthèse ») ; aucun « 0 » n'y paraît |
| Le geste « inscrire pour une production » n'offre que les productions assignées au groupe-cours, hors diagnostiques et hors portfolio conteneur | **choix technique du lot 2**, dit au rapport ; à revoir si Grégoire veut inscrire depuis une production diagnostique |

## 12. Ce qui n'a pas été mesuré

- Aucun module réel n'a été monté : le banc est une fonction pure isolée. Les chiffres 65, 75, 72,5 et 78 valent
  pour la règle, pas pour le moteur de l'application.
- La fusion d'un codex et le partage d'une pratique entre collègues (leur liste de clés n'a pas été lue).
- L'ouverture, par une version ancienne, d'un codex qui porte une pratique d'un type inconnu.
- Les captures (`snapshots`) et le registre longitudinal devant une pratique sans évaluations.
- Si le gabarit `pan-objectifs-ponderes` est offert à l'écran.
- S'il existe des ensembles sous l'ancienne clé nue dans les données de Grégoire.
- Le comportement du mode démo et de l'archivage d'un trimestre devant la clé neuve.

## 13. Ce que Cowork avait lu, confirmé ou corrigé

| Lecture de Cowork | Verdict |
|---|---|
| Le calcul part d'un résultat par étudiant·e et par production, et retient des productions entières | confirmé |
| Le mode « Par objectifs » retiré à la 1.63, faute de lien production → objectif | confirmé ; il en reste plus que dit (§ 1.3 : une fonction sans appelant, un gabarit au catalogue) |
| « Restent les ensembles d'objectifs » | **à corriger** : le code reste, l'écran n'est plus atteignable, et rien ne s'y rattache |
| `evaluation.metadata.objectifsServis` | **à corriger** : c'est la métadonnée d'un **nœud « évaluation » de la carte d'Alignement**, pas d'une évaluation d'étudiant·e ; ses identifiants sont des objectifs de leçon |
| `production.objectif` (PDF, rétroaction) | confirmé : un texte libre, pas un lien |
| La reprise ciblée sur un critère avec jeton, comme appui possible | **à corriger** : elle ne range rien par critère ; c'est une copie entière qui remplace l'originale, avec un plafond |
| Le gabarit « [STD] Grille par objectifs » | confirmé ; il incarne la voie « objectif = critère », écartée par la décision |
| Le tableau de notation accepte un résultat sans grille | confirmé, livré ; mais toujours avec une production, donc il ne porte pas le cas B |
