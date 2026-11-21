# Plan – Le moteur par objectifs (mesure, puis lots)

> Claude Code, vendredi 20 novembre 2026. Consigne :
> `plans de travail/CONSIGNE-2026-11-20-moteur-par-objectifs-mesure.md`. Base : `main` = `e31a8556`.
> **Lecture seule** : aucun fichier de `js/`, d'`index.html` ni de `styles.css` n'a changé. Aucune autre session sur
> la machine, donc pas d'arbre à part.
> **Le banc jetable** a tourné hors du dépôt (une fonction pure, Node seul, aucun module réel monté) et n'est pas
> committé. Données fictives (Zoé Fictive, Yan Inventé, Léa Imaginaire).
> **Trois degrés de certitude dans ce document** : *mesuré* (une commande l'a rendu, fichier et ligne donnés),
> *lu* (le code a été lu, rien n'a été joué), *inféré* (déduit, à confirmer par un essai au lot concerné).

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
| Un poids par cible | oui : `poids` sur l'objectif de l'ensemble (le champ existe déjà, § 1.1) ; le moteur passe d'une moyenne à une moyenne pondérée |
| Un sous-ensemble de cibles (double seuil) | oui : un marqueur sur l'objectif (`type` existe : fondamental, intégrateur, transversal) et une condition dans `configuration` ; les inscriptions ne changent pas |
| Une note brève par inscription | oui : un champ `note` sur l'inscription. Texte libre de l'enseignant·e : `echapperHtml` à tout affichage |
| Une autre règle de retenue | oui : `configuration.retenue` (`meilleur` aujourd'hui). Tout l'historique est gardé, donc « le plus récent » ou une tendance centrale se calculent sur le stock déjà écrit. « Le jugement » demande une inscription d'un genre à part (un niveau posé par l'enseignant·e, qui prime) : la forme l'admet par un champ, non conçu ici |
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

### Lot 1 – « Je dis quelles cibles compte mon cours »

- **Ce que l'utilisateur voit** : dans l'assistant, un choix de pratique de plus ; une étape où il nomme ses cibles
  (une ligne par cible, monter, descendre, retirer) et choisit son échelle. La fiche de la pratique montre les
  cibles. Le groupe-cours peut recevoir cette pratique.
- **Dans le code** : le type neuf au registre (représentation, `METHODE_PAR_FAMILLE`) ; l'ensemble de cibles rangé
  par trimestre, avec `coursId` et des identités permanentes ; `EditeurCibles` réemployé ; l'étape de l'assistant
  et son retour en édition ; la liste de contrôle des 11 fichiers (§ 2). **Retraits du même lot** : l'écran
  orphelin de `objectifs.js`, `calculerPerformanceParObjectif` (`portfolio.js:658`), le gabarit
  `pan-objectifs-ponderes` s'il n'a pas de lecteur (à mesurer), la sentinelle #467 de la liste orpheline.
- **Sentinelle** : une cible renommée ou déplacée garde son identité ; une pratique par cibles sans cible ou sans
  échelle est refusée ; les modèles de l'assistant existants s'écrivent octet pour octet comme avant
  (`sentinelle-wizard-golden-creation-319`).
- **Notes qui changent** : aucune. La pratique neuve rend « non calculable » avec sa cause (aucun niveau inscrit).
- ⚠ Stock : des ensembles peuvent exister sous l'ancienne clé nue chez qui a utilisé l'écran avant qu'il perde son
  hôte. On ne les convertit pas d'office ; on mesure s'il y en a chez Grégoire, puis on propose.

### Lot 2 – « J'inscris un niveau pour un·e étudiant·e sur une cible »

- **Ce que l'utilisateur voit** : au tableau de notation, pour cette pratique, les cibles en colonnes. Toucher une
  case inscrit un niveau, daté ; on peut dire d'où il vient (une production, ou rien). Un geste « inscrire pour
  une production » ouvre les cibles qu'elle renseigne, et l'on ne remplit que celles que l'étudiant·e a reprises
  (cas A). Une inscription erronée s'annule ; elle reste visible, barrée.
- **Dans le code** : le module propriétaire de `inscriptionsCibles` (seul écrivain, lecture par `cle()`), inscrit à
  tous les registres du § 3 ; la saisie au tableau ; l'annonce d'écriture (`annoncerEcritureUsager`).
- **Sentinelle** : deux inscriptions sur la même cible donnent deux entrées ; aucune écriture ne réduit la liste ;
  la correction d'un DA les déplace ; le texte d'origine est échappé ; un codex enregistré puis rouvert rend la
  liste à l'identique.
- **Notes qui changent** : aucune (le moteur n'existe pas encore). Sentinelle du lot 0 rejouée.

### Lot 3 – « Je vois le niveau retenu par cible »

- **Ce que l'utilisateur voit** : au tableau, chaque case montre le niveau retenu, et combien d'inscriptions il y a
  derrière. Au profil, une section : une ligne par cible, le niveau retenu, sa date, sa source, puis l'historique.
  Une cible sans niveau se lit comme telle, pas comme un zéro.
- **Dans le code** : la fonction pure du banc, portée dans un module (`retenirParCible`), qui prend des
  inscriptions, des cibles et une échelle ; l'ordre par `ordonnerNiveauxParPlage` ; la section du profil.
- **Sentinelle** : les cas A et B du banc, au niveau près ; un niveau plus bas inscrit après un plus haut ne change
  pas le retenu ; un code absent de l'échelle n'est pas lu ; ordre illisible → rien de retenu, et le motif.
- **Notes qui changent** : aucune.

### Lot 4 – « La note du cours vient des niveaux retenus »

- **Ce que l'utilisateur voit** : la note au profil avec son récit (chaque cible, son niveau, sa valeur, la
  moyenne) ; la même note à l'export des résultats finaux, au Comparateur, au tableau. Quand elle ne peut pas se
  calculer, la cause en mots.
- **Dans le code** : le court-circuit de `calculerPerformance` et `decrireCalcul` dans `pratique-configurable.js` ;
  le diagnostic (`_diagnostiquerNoteNonCalculable`) ; chaque lecteur du § 5 éprouvé un à un, dont le `null`
  devenu 0 de `indicesCP`.
- **Sentinelle** : cas A = 75 (65 sans les reprises), cas B = 78, au profil, à l'export et au Comparateur, la même ;
  une valeur ponctuelle manquante → « non calculable », jamais un chiffre ; sentinelles du lot 0 rejouées.
- **Essai dû à ce lot, inscrit au lot 0 : le sens inverse** (§ 6, point 3). Dans un espace où la pratique par cibles
  est active, ajouter, modifier ou retirer des évaluations du même DA ne change ni sa note ni son récit, et le
  moteur par cibles ne lit pas `evaluationsSauvegardees` (même témoin de lectures que la sentinelle du lot 0). Avec
  son break-test : faire lire les évaluations au moteur neuf rougit l'essai.
- **Notes qui changent** : celles de la pratique neuve, qui n'en avait pas. Aucune autre. Porte terrain : l'export
  de Grégoire avant et après (§ 6, point 4).

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
| L'écran des ensembles d'objectifs n'a pas d'hôte dans `index.html` | **retiré au lot 1** : c'est le lot qui remplace ce système (zéro-dette), pas du code étranger |
| `calculerPerformanceParObjectif` (`portfolio.js:658`) sans appelant | **retirée au lot 1**, même motif |
| Le gabarit `pan-objectifs-ponderes` est resté au catalogue alors que le changelog 1.63 annonce le départ des gabarits du mode | **inscrire et continuer** : à mesurer au lot 1 (est-il offert quelque part ?), retiré s'il ne l'est pas |
| `jugementsDenotation` est nue de fait (déjà consigné, `DATA-OWNERSHIP.md:58`) | **déjà inscrit** ; sert d'avertissement pour la clé neuve |
| `indicesCP` range 0 pour une note non calculable (`portfolio.js:582`) | **inscrire et continuer** ; mesuré lecteur par lecteur au lot 4 |
| Trois sens du mot « objectif » (leçon, texte d'une production, ensemble) | **aux mots** (§ 9) |

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
