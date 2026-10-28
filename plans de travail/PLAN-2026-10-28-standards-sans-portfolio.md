# Plan – Des standards sans portfolio ni terminale (mesure, puis lots)

> Claude Code, mercredi 28 octobre 2026, 15 h 11 (Toronto). Consigne :
> `plans de travail/CONSIGNE-LOT-2026-10-28-standards-sans-portfolio-plan.md`. Point de départ décidé par Grégoire
> (28 oct., 14 h 56) : `DECISIONS-2026-10-28-construction-de-la-note.md`, § « Chantier de Grégoire ».
> **Lecture seule** : aucun fichier de `js/`, d'`index.html` ni de `styles.css` n'a changé ; rien n'est committé.
> **Le banc jetable** a tourné hors de la suite (dossier `tests/banc-jetable-std-sans-portfolio/`, config à part,
> puis retiré du dépôt ; copie : `/private/tmp/claude-501/-Users-kuekatsheu-Documents-GitHub-labo-codex/394975f4-3420-466c-a47b-4cfbc805aaed/scratchpad/banc-jetable-std-sans-portfolio/mesure.test.js`).
> Il monte les modules RÉELS (le bac du banc du 28 oct.) **sur l'arbre en cours de modification par la session des
> correctifs E1 à E7** : les chiffres d'export et de « provisoire » lisent donc E7 à mi-chemin (§ 1, note).
> Données fictives (Alice, Bruno).

## Vue d'ensemble

**Le calcul sait déjà faire presque tout.** La terminale est déjà facultative (sans elle, le pool vaut 100 %) ; la
désignation par `production.categorie` marche déjà pour n'importe quel type de production (CHIM-3 : 80,63 sur des
laboratoires et des examens). **Un seul verrou** : la définition du pool, `obtenirArtefactsIdsPoolStd`
(`pratique-registre.js:796`). Elle prend les « Artefact », sinon les productions **sans pondération** ; or le
formulaire Productions exige une pondération de plus de 0 % pour tout type sauf « Artefact »
(`productions.js:1857`). Une enseignante de chimie qui saisit ses laboratoires et ses examens obtient donc
**« non constructible » partout, sans message** (CHIM-1).

**Autour du calcul, cinq autres lecteurs** ont leur propre définition du pool (dépistage, panneau « Engagement »,
liste des étudiants, PDF « Artefacts à venir », export recherche), et une vingtaine de textes disent « artefact »,
« portfolio » ou « terminale » comme si c'était la nature d'une pratique Standards.

**L'invariant qui protège la pratique de Grégoire** : *dès qu'une production de type « Artefact » existe, le pool reste
exactement celui d'aujourd'hui.* Tout le chantier vit dans la branche « aucun artefact ». Mesuré : GREG-0, GREG-1 et
GREG-2 rendent 84,8 (le STD-1 du banc du 28 oct.), y compris avec une production pondérée de plus et une catégorie
égarée hors hybride.

## 1. La mesure sur banc

Cinq laboratoires et examens (L1 à L3 à 15 %, X1 à 25 %, X2 à 30 %). Alice : 70, 80, 90, 60, 85. Pratique
Standards dans la forme que l'assistant écrit (`approcheEvaluation: 'par-artefacts'`, `portfolio`).

| Cas | Ce qui est posé | Profil | P / Comparateur / export | Pool du registre | Dépistage |
|---|---|---|---|---|---|
| GREG-0 | Pratique de Grégoire : 6 artefacts, conteneur 60, terminale 40, N = 3 | 84,8 | 85 / 85 / 85 | A1 à A6 | A1 à A6 |
| GREG-1 | Idem, « Utiliser un portfolio ? » = non | 84,8 | 85 | A1 à A6 | idem |
| GREG-2 | Idem + un Exercice pondéré 10 % (50) marqué « obligatoire » + A1 marqué « sélection », hors hybride | 84,8 | 85 | A1 à A6 | idem |
| CHIM-1 | Labos et examens **pondérés** (ce que le formulaire impose), « N meilleurs » ou « Tous » | `null`, **`erreur: null`** | non constructible | vide | vide |
| CHIM-2 | Les mêmes **sans pondération** (import, donnée d'avant), « Tous » | 77 | 77 | L1 à X2 | **vide** |
| CHIM-2 bis | Idem, « Notes finalisées » cochée | 77, **provisoire** | 77, « provisoire » | idem | vide |
| CHIM-3 | Hybride, labos « sélection » (N = 2), examens « obligatoire », pondérés | `null` | non constructible | vide | vide |
| CHIM-3 bis | Idem, non pondérés : (80 + 90) / 2 × 65 + (60 + 85) / 2 × 35 | 80,63 | 81 | L1 à X2 | vide |
| CHIM-4 | X2 typé « Évaluation terminale » (30 %), le reste pondéré | `null` | non constructible | vide | vide |
| CHIM-4 bis | X2 terminale 30 %, le reste non pondéré : 75 × 70 % + 85 × 30 % | 78 | 78 | L1 à X1 | vide |
| CHIM-5 | CHIM-2 + un test diagnostique à 10 | 77 | 77 | L1 à X2 (D0 filtré) | vide |

Ce que la mesure établit :

- **Le verrou est la pondération, pas le type.** Les mêmes productions entrent dès qu'on retire leur pondération
  (CHIM-1 → CHIM-2) ; le type « Artefact » n'est qu'un raccourci de la première branche.
- **Une terminale seule ne fait pas de note** (CHIM-4) : `_calculerNoteFinaleAggregee` rend `null` dès que le pool est
  vide (`profil-etudiant-actions.js:361`), même terminale évaluée. Le geste que la zone « À vérifier » propose aux
  chimistes (« typer » une évaluation terminale) ne débloque donc rien.
- **Sans terminale, la note reste « provisoire » pour toujours**, « Notes finalisées » cochée ou non (CHIM-2 bis) :
  `estProvisoire: noteTerminale === null` (`profil-etudiant-actions.js:680`), vrai aussi quand aucune terminale
  n'existe. ⚠ **Ce site est dans le mandat de la session E7** (sa consigne, § 1.5 : « une pratique sans production
  terminale ne reste pas provisoire pour cette raison, ni à l'export ni au profil ») ; au moment de la mesure, l'export
  lit déjà la case (E7 en cours) mais `estProvisoire` n'avait pas encore changé. Décrit, ni corrigé ni bancé ici.
- **Le dépistage ne voit rien sans « Artefact »**, même quand la note se calcule (CHIM-2) : il a sa propre définition,
  sans le repli (`obtenirIdsProductionsEvaluables`, `profil-etudiant-helpers.js:473`).
- **Le récit dit « portfolio × 100 % + terminale × 0 % »** quand il n'y a ni portfolio ni terminale (tous les CHIM).

## 2. Tout ce qui suppose un portfolio ou une terminale

« Mesuré » renvoie au banc du § 1 ; « lu » au code (`HEAD` = `cdea722e` plus l'arbre de la session E7).

### Le calcul

| Site | Ce qu'il suppose | Sans artefacts ni terminale |
|---|---|---|
| `obtenirArtefactsIdsPoolStd` (`pratique-registre.js:796`) | Pool = type « Artefact », sinon productions **non pondérées** | Vide dès que les productions sont pondérées (mesuré, CHIM-1). **Aucun test n'épingle le repli** (grep sur `tests/`). |
| `identifierProductionTerminale` (`:787`) | Terminale = type strict, facultative (#394) | Rien à changer (mesuré : pool 100 %). |
| `calculerDetailsNoteFinale` (`profil-etudiant-actions.js:390`) | `estProvisoire = noteTerminale === null` ; terminale seule → `null` ; récit « portfolio × … + terminale × … » | Provisoire perpétuel (session E7) ; terminale seule non constructible ; récit faux (mesuré). |
| `_obtenirConfigPortfolioCalcul` (`:171`) | Une pratique sans bloc `configuration.portfolio` n'est pas calculable | Le bloc reste nécessaire (méthode, N) ; son nom seul est en cause, pas son rôle (lu). |
| `_selectionnerArtefactsHybride` (`:222`) | Lit `categorie` **dans le pool** | Marche pour tout type déjà au pool (mesuré, CHIM-3 bis) ; un examen pondéré coché « obligatoire » est ignoré en silence (CHIM-3). |
| Instance `pratique-pan-standards.js` | Passe par les mêmes fonctions du registre (`:166`, `:638`) | Suit le registre sans retouche (lu). `calculerPerformanceRecente` (`:281`) **n'a aucun appelant** (grep). `nombreTotal` (`:588`) n'est lu par aucun calcul. |
| `calculerNoteDuCours`, captures (P historique) | Passent par la famille | Suivent ; une capture déjà écrite garde son P jusqu'à « Recalculer les captures » (stock, lu). |
| Complétion C (`calculerDetailsCompletion`, `:340`) | Toutes les productions assignées, hors conteneur | Déjà indépendante du type (lu). |

### Les écrans de l'enseignant·e

| Site | Ce qu'il suppose | Sans artefacts ni terminale |
|---|---|---|
| Assistant, « Approche » (`wizard-pratique-v2.js:597-610`) | Une seule carte, « Par artefacts (portfolio) », et « PAN-Standards s'appuie sur le portfolio » | Annonce une nature que le calcul n'exige pas. |
| Assistant, « Configuration du portfolio » (`:618-675`) | « Utiliser un portfolio ? », « Nombre d'artefacts à soumettre », « N meilleurs artefacts »…, « Minimum d'artefacts avant calcul formatif » | **« Utiliser un portfolio ? » n'a aucun effet** : l'assistant écrit `portfolio.utiliser`, tout le monde lit `portfolio.actif` (grep ; mesuré, GREG-1). « Nombre d'artefacts à soumettre » (`nombreTotal`) : aucun calcul ne le lit (grep). |
| Pratique, Mode expert (`index.html:5838-5861`, `pratiques-gestion.js:1280-1300`) | « N meilleurs artefacts », « Artefacts pour la note finale », « Total d'artefacts prévus » | Mêmes mots. |
| Pratique, cases des catégories (`pratiques-gestion.js:2742-2790`) | Proposées **seulement en hybride** ; listent toutes les productions sauf conteneur, formatifs et terminale | La seule désignation existante ; hors hybride, aucun moyen de dire ce qui compte. ⚠ `categorie` est écrit **sur la production** (`cle('productions')`), pas sur la pratique : il voyage avec les productions (import, `import-export.js:1327`) et vaut pour toute pratique simulée au Comparateur. |
| Productions, types (`productions.js:118-120`, aide `:2605-2606`) | « Artefact : … Les artefacts n'ont pas de pondération propre » ; « Évaluation terminale : … s'ajoute au portfolio » | Mots à revoir quand le portfolio est absent. |
| Productions, pondération requise (`:1857`) | Tout type sauf « Artefact » : plus de 0 % | **C'est ce qui ferme le repli.** Juste en sommative ; en standards, elle dit l'inverse du calcul. |
| Productions, zone « À vérifier » (`validerProductionsStd`, `:349-408`) | « n'entre pas dans le calcul STD : seuls le pool d'artefacts et l'évaluation terminale comptent » ; « sans le type « Évaluation terminale », elle n'entre pas » ; « Choisis laquelle est l'évaluation terminale » | Pousse la chimiste vers une terminale, qui ne débloque rien (CHIM-4). |
| Liste des étudiants, colonne « ≥ Min. » (`etudiants.js:912`) | Compte les « Artefact » évalués | 0 pour tous (lu). |

### Ce que l'élève et l'enseignant·e lisent

| Site | Ce qu'il suppose | Sans artefacts ni terminale |
|---|---|---|
| Profil, terme (`obtenirTermeProduction`, `profil-etudiant-helpers.js:46`) | En standards : « artefact », personnalisable par `modalitesEvaluation.termeProduction` | **Personne n'écrit `termeProduction`** (grep) : c'est toujours « artefact ». |
| Profil, « Engagement » (`genererSectionMobilisationEngagement`, `profil-etudiant-sections-affichage.js:367` ; `_construireListeArtefactsMobilisation`, `:120`) | **Sa propre sélection** sur les seuls « Artefact » ; « Productions indépendantes » si `portfolio.actif === false` | Liste vide, sélection vide (lu). |
| Profil, « Développement des habiletés » (`genererSectionPerformance`, `:3983`) | Sans conteneur ou sans « Artefact », la partie note est omise | Le panneau perd sa ligne de P (lu). |
| Profil, carte Complétion (`genererSectionCompletion`, `:3355`) | Liste les « Artefact » | Liste vide (lu ; l'indice C, lui, est juste). |
| PDF, « Note provisoire » (`construireNoteProvisoire`, `synthese-retroaction-data.js:1366`) | Lit `calculerDetailsNoteFinale` (suit le calcul) | Suit, mais provisoire perpétuel tant que E7 n'a pas fermé ce site. |
| PDF, « Artefacts à venir » (`:1459-1461`) | **Troisième définition du pool** : « Artefact », sinon toute production hors conteneur, **terminale comprise** | Annoncerait la terminale « à venir » comme un artefact (lu). Les élèves lisent ce titre. |
| Export Léa (`export-resultats-finaux.js`) | Lit `estProvisoire` | Session E7 en cours (lu). |
| Export recherche (`trimestres.js:2197`) et profils RLO (`:2489`) | Liste les « Artefact » | Liste vide (lu). |
| Comparateur, « Niveau atteint » (`comparateur-pratiques.js:198`, `:940`) | Terminale, sinon dernière copie datée | Repli déjà sain (lu). |
| Profils fictifs (`profils-types-generateur.js:27`, `:171`) | Corpus d'« Artefact » + une terminale | Le Comparateur ne montre jamais une forme « chimie » (lu). |
| Aide (`index.html:10236`, `:10728`, `:10832`, `:10996`, `:11013`, `:11410` ; glossaire, 8 mentions) | « artefacts », « portfolio », « terminale » | Lot 4 de l'Aide ; d'ici là, l'Aide dit ce que fait l'application (décision du 28 oct.). |

### Les sentinelles

`sentinelle-reunification-std-394` (règles 1 et 2) et le banc du 28 oct. (`STD-1` à `STD-C7`) épinglent la branche
« artefacts », que l'invariant ne touche pas. `sentinelle-339-*` épingle la terminale hors des obligatoires : inchangé.
**Rien n'épingle la branche « aucun artefact »** : le lot 1 en crée la sentinelle.

## 3. Les lots

Ordre : **après** la session E7 (son correctif « une pratique sans terminale ne reste pas provisoire » est un
préalable). Chaque lot : Vitest depuis `tests/`, un break-test, la note de Grégoire épinglée (GREG-0 à GREG-2) et
« avant → après » pour chaque cas qui change. **Aucune donnée réécrite** : tout se lit au calcul.

### Lot 1 – Le pool sans artefacts (calcul seul)

- **Ce que l'utilisateur voit** : une pratique Standards sans « Artefact » calcule une note à partir de ses
  productions évaluées, quel que soit leur type et leur pondération ; sans terminale, le pool vaut 100 % ; une
  terminale pondérée prend sa part, le reste au pool (règle du complément, inchangée).
- **Le geste** : dans `obtenirArtefactsIdsPoolStd`, la seconde branche seulement : toutes les productions hors
  conteneur et terminale (les diagnostiques sont déjà retirées en amont, CHIM-5), **sans condition de pondération** ;
  si au moins une porte une `categorie` (« sélection » ou « obligatoire »), le pool est fait de celles-là. La
  première branche (« Artefact ») ne change pas.
- **La sentinelle** : le banc du § 1 devient `sentinelle-standards-sans-portfolio` : CHIM-1 non constructible → 77,
  CHIM-3 → 80,63, CHIM-4 non constructible → 78 ; GREG-0 à GREG-2 restent 84,8.
- **Les notes qui changent** (Nouvelles) : seulement les pratiques Standards **sans aucun « Artefact »** : de
  « non constructible » à une note quand leurs productions sont pondérées ; et, quand certaines étaient pondérées et
  d'autres non, la note intègre désormais les pondérées. Stock : aucune écriture ; les captures déjà prises gardent
  leur P (on le dit).
- **Dans le même lot** (c'est le lot qui n'est pas fini sans eux) : le récit ne dit plus « terminale × 0 % » sans
  terminale ; un pool vide dit sa cause au lieu de `erreur: null`.

### Lot 2 – Les lecteurs secondaires lisent le même pool

- **Ce que l'utilisateur voit** : le dépistage, le panneau « Engagement », la colonne « ≥ Min. », la carte
  Complétion, l'export recherche et la liste « à venir » du PDF parlent des mêmes productions que la note.
- **Le geste** : `obtenirIdsProductionsEvaluables` (branche standards), `_construireListeArtefactsMobilisation`,
  `etudiants.js:912`, `genererSectionCompletion`, `trimestres.js:2197` et `:2489`, et `synthese-retroaction-data.js:1459`
  passent par `obtenirArtefactsIdsPoolStd`. Pour la pratique de Grégoire, aucun ne change (le pool y est déjà
  « Artefact ») ; sentinelle de parité par lecteur.
- **Retiré** : `calculerPerformanceRecente` (aucun appelant) ; la sélection propre du panneau « Engagement » si elle
  peut lire les retenues de `calculerDetailsNoteFinale` (comme le panneau des habiletés depuis #714) — à mesurer en
  début de lot.

### Lot 3 – Les Productions ne poussent plus vers une terminale

- **Ce que l'utilisateur voit** : en standards, la pondération d'une production n'est plus exigée ; la zone
  « À vérifier » dit ce que le calcul fera (« Ces productions forment la note »), au lieu de demander une terminale ;
  l'aide des types « Artefact » et « Évaluation terminale » ne suppose plus un portfolio.
- **Le geste** : `raisonChampsObligatoiresProduction` (lire la famille active), `validerProductionsStd` (règles 3a et 5
  dans la branche « aucun artefact »), textes de `productions.js:2605-2606`. Sentinelles #394 (règles 3 et 5) mises à jour.

### Lot 4 – La désignation à l'écran, hors hybride

- **Ce que l'utilisateur voit** : dans la pratique, sous la « Construction de la note », la liste des productions qui
  comptent, cochées par défaut quand aucune n'est désignée ; décocher une production l'écarte.
- **Le geste** : les cases des catégories existantes (`chargerProductionsPourCategories`), affichées aussi hors
  hybride, en une seule liste qui écrit `categorie: 'selection'`. Supposé : décocher tout revient au défaut (« toutes »),
  plutôt qu'à un pool vide.

### Lot 5 – L'assistant et les mots

- **Ce que l'utilisateur voit** : l'assistant ne dit plus que les standards « s'appuient sur le portfolio » ; la
  question « Utiliser un portfolio ? », sans effet, sort (famille de #903 : la clé reste, tue) ; les questions disent
  « productions » quand il n'y a pas d'artefacts.
- **Le geste** : `wizard-pratique-v2.js:597-675`, la relecture (`:3128-3152`), le Mode expert (`index.html:5838-5861`)
  et `obtenirTermeProduction` (le terme suit la présence d'« Artefact » au lieu d'une clé que personne n'écrit).
- **Avec l'Aide** : les textes vont au lot 4 de l'Aide, ou à un lot de l'Aide qui le suit.

**Hors lots, inscrit** : un profil fictif « sans portfolio » pour le Comparateur (`profils-types-generateur.js`) ;
utile seulement si Grégoire veut montrer la forme « chimie » à des collègues.

## 4. Les mots neufs (à Grégoire avant le code)

Propositions de Claude Code, à corriger. ★ = lu par les élèves.

| Où | Aujourd'hui | Proposé |
|---|---|---|
| Assistant, carte d'approche | « Par artefacts (portfolio) » ; « La note finale est calculée à partir des N meilleurs artefacts. » | « Par productions retenues » ; « La note se calcule sur les productions que tu désignes (par défaut : toutes celles qui sont évaluées, sauf les diagnostiques). » |
| Assistant, info | « PAN-Standards s'appuie sur le portfolio : c'est la progression à travers les artefacts qui construit la note. » | « La note suit la progression à travers les productions retenues : des artefacts d'un portfolio, des laboratoires, des examens… » |
| Assistant, titre d'étape | « Configuration du portfolio » / « Paramètre la gestion des artefacts » | « Les productions qui font la note » / « Combien en retenir, et lesquelles » |
| Assistant | « Utiliser un portfolio ? » | (retirée) |
| Assistant | « Nombre d'artefacts à soumettre » | « Nombre de productions prévues » (sans effet sur la note : à dire, ou à retirer comme « Utiliser un portfolio ? ») |
| Assistant et Mode expert | « N meilleurs artefacts », « Tous les artefacts », « N derniers artefacts », « Artefacts pour la note finale » | « N meilleures productions », « Toutes les productions », « N dernières productions », « Productions retenues pour la note » |
| Assistant | « Minimum d'artefacts avant calcul formatif » | (E9, déjà au trou 2 de l'Aide) « Minimum de productions évaluées avant d'afficher la note » |
| Pratique, liste hors hybride | — | « Productions qui comptent dans la note » ; aide : « Toutes, par défaut. Décoche celles qui ne doivent pas compter. » |
| Productions, zone « À vérifier » | « … seuls le pool d'artefacts et l'évaluation terminale comptent » ; « Choisis laquelle est l'évaluation terminale… » | « Sans artefact, toutes ces productions forment la note (N retenues selon ta pratique). Une évaluation terminale est facultative. » |
| Productions, aide « Évaluation terminale » | « … qui s'ajoute au portfolio dans le calcul… (par exemple 60 %) » | « … qui s'ajoute aux productions retenues dans le calcul. Facultative. » |
| Profil et PDF, récit ★ | « portfolio × 100 % + terminale × 0 % » | sans terminale : « moyenne des productions retenues » |
| Profil, terme ★ | « artefact » toujours, en standards | « production » quand la pratique n'a pas d'« Artefact » |
| PDF ★ | « Artefacts à venir » | sans artefacts : « Productions à venir » |

## 5. Les questions de didactique qui restent (non tranchées)

1. **Ce que « Portfolio » veut dire quand il n'est plus obligatoire.** Un conteneur qui ne fait que porter une
   pondération : reste-t-il un mot de l'application, ou devient-il une façon parmi d'autres de nommer le pool ?
2. **Des artefacts ET d'autres productions.** L'invariant garde le pool « Artefact » dès qu'un artefact existe : une
   enseignante de littérature qui voudrait faire entrer un examen au pool ne le peut pas. Faut-il un jour lever
   l'invariant (avec une décision sur le stock), ou est-ce le rôle de la terminale ?
3. **Une terminale seule** (aucune autre production évaluée) : la note doit-elle être celle de la terminale, ou rester
   non constructible comme aujourd'hui (CHIM-4) ?
4. **« N meilleures » sur des examens.** En chimie, un examen peut devoir compter quoi qu'il arrive : l'hybride
   (obligatoires) suffit-il, ou « N meilleures » doit-il être déconseillé quand le pool mêle examens et laboratoires ?
5. **E5 : la note Standards lit-elle un jour les niveaux** au lieu de la moyenne des notes en % (STD-7) ? Le chantier
   ne le change pas ; un pool de laboratoires notés en points le rend plus visible.
6. **Une obligatoire non remise vaut 0 en notes finalisées** (STD-H3) : la règle tient-elle pour un laboratoire comme
   pour un artefact ?

## 6. Les trouvailles et leur issue

| Trouvaille | Issue |
|---|---|
| « Utiliser un portfolio ? » écrit `utiliser`, lu nulle part (GREG-1) | Inscrire et continuer : lot 5 la retire. |
| « Nombre d'artefacts à soumettre » (`nombreTotal`) : aucun calcul ne le lit | Inscrire : lot 5, avec la question des mots. |
| `termeProduction` : personne ne l'écrit | Inscrire : lot 5. |
| `calculerPerformanceRecente` : aucun appelant | Inscrire : lot 2 la retire. |
| Pool vide → `erreur: null`, aucune cause dite (CHIM-1) | Inscrire : lot 1. |
| Trois définitions du pool (registre, dépistage, PDF « à venir ») et deux sélections (note, panneau « Engagement ») | Inscrire : lot 2. |
| Le repli du pool n'est épinglé par aucun test | Inscrire : lot 1 (sa sentinelle). |
| Provisoire perpétuel sans terminale (CHIM-2 bis) | Dans le mandat de la session E7 : à vérifier à sa relecture, pas ici. |

## 7. Ce qui n'a pas été mesuré

- Ce que le profil affiche quand `noteFinale` et `erreur` valent tous deux `null` (CHIM-1) : le banc lit le calcul,
  pas le rendu.
- Le rendu des panneaux, du PDF, de la colonne « ≥ Min. » et de l'export recherche : lus, pas rendus.
- Les données réelles des autres utilisateurs (pratiques sans artefacts, catégories égarées) : dans leur navigateur.
  Le lot 1 change seulement les pratiques sans aucun « Artefact » ; combien il y en a, personne ne le sait.
- `estProvisoire` et l'export après la fin de la session E7 : le banc a tourné sur son arbre en cours.
- Safari et l'iPad : rien de visuel dans cette mesure ; les lots 3 à 5 en auront.
