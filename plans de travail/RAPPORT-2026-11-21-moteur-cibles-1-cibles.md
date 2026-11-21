# Rapport – « Par standards », lot 1 : les cibles du cours et l'échelle

> **Relais (21 nov. 2026, nuit).** Branche `lot/moteur-cibles-1-cibles`, partie de `lot/moteur-cibles-0-garde`
> (`567f251a`), poussée ; **aucune fusion dans `main`** (consigne : rien n'y entre avant que les quatre gestes existent
> et que Grégoire les ait essayés). PR d'aperçu : voir la dernière ligne de ce relais.
> **Réunies sur la branche** : `lot/standards-conception` (`7ac26506`, la fiche et le skill) et
> `lot/renommer-selection-productions` (`3b8204f4`, livrée : l'assistant ne montre plus deux « standards »).
> **Session** : Claude Code dans un conteneur cloud Linux, pas sur le Mac. **WebKit n'y existe pas** : les écrans neufs
> sont vérifiés et capturés sous Chromium ; le passage WebKit reste dû au Mac (porte ci-dessous).
> **Fait** : le lot 1 entier (le choix « Par standards », les cibles du cours, l'échelle et le niveau « sans donnée »,
> la fiche, le groupe-cours, la note qui dit pourquoi elle manque) ; les retraits prévus, dans un commit à part ; la
> page des textes proposés ; le plan révisé (décisions du 20 nov. en tête, lots 1 à 5).
> **Reste** : les textes à faire corriger par Grégoire (`TEXTES-2026-11-20-par-standards-lot-1.md`, 80 textes et
> 4 questions) ; le passage WebKit du Mac ; le lot 2 (inscrire un niveau).
> **PR d'aperçu** : https://github.com/bedardg71-codexnumeris/labo-codex/pull/44 (brouillon, « ne pas fusionner ») ;
> **aperçu** : https://deploy-preview-44--codexnumeris-051225.netlify.app (prêt sur `20c767dc`). `RELAIS.md` (sur
> `main`) n'est pas touché : la consigne interdit toute écriture dans `main` d'ici l'essai des quatre gestes ; ce
> relais-ci tient lieu de relais de la branche.
> **Corrections du 21 nov. 2026** (relecture de Grégoire) : § 6 — le sigle suit le nom (SEL, STD ; « CIB » nulle part),
> les couleurs, A4, A5, E1, F3, les échelles libres éprouvées, le banc des noms réels vert sans contournement, la
> fixture « Bruno » remplacée, #1302 inscrit.
> **Secondes corrections du 21 nov. 2026** (7 h 44) : § 7 — SEL n'est plus dite « PAN » (nom de famille, textes dictés,
> remplacements simples) ; mesure du badge PAN ; les phrases laissées (guide, glossaire, fenêtre d'aide, parcours,
> gabarit). Reste : ces phrases et le badge PAN à trancher par Grégoire ; le passage WebKit du Mac ; le lot 2.

## 1. Ce qui a été livré

- **L'assistant** : « Par standards » dans la voie rapide et dans « Comment calcules-tu la note finale ? » ; l'étape
  « Les cibles du cours » (le cours, puis une carte par cible : étiquette, poids et sa part, « Cible terminale », énoncé,
  critères un par ligne avec « Critère essentiel » ; ajouter, retirer, monter, descendre ; poids égaux d'office ; total
  lu) ; l'étape « L'échelle des niveaux » (une échelle de la bibliothèque, ou l'échelle de départ proposée ; le niveau
  « sans donnée » parmi les niveaux qui valent 0 %) ; le récapitulatif ; la réédition (mêmes ids, même ensemble).
- **La fiche** : la carte « Structure des évaluations » montre le cours, l'échelle, le niveau « sans donnée » et les
  cibles, en lecture seule, avec « Modifier les cibles dans l'assistant ». Le menu du type est verrouillé pour cette
  pratique ; l'option est fermée pour les autres. La carte commune de l'échelle est masquée pour elle (elle réécrirait
  l'échelle sans son niveau « sans donnée »).
- **Le groupe-cours** : le menu de l'assemblage la propose ; « Appliquer au cours actif » la pose (vérifié dans la démo).
- **La note** : `null`, jamais un zéro ; la cause se dit par `expliquerNoteNonConstructible` (une seule phrase, lue par
  le profil, le rapport, l'export et le Suivi).

## 2. Ce qui a été mesuré

- **Vitest, un seul worker, suite complète** (code du lot 1, avant retraits) : 12 022 verts, 2 rouges. L'un était le banc
  statique #343 (il cherchait `['DEN']` dans la fonction que la table `CODE_PAR_TYPE` remplace) : adapté, break-test fait.
  L'autre est `sentinelle-noms-reels-retires-2026-10-24` (§ 3). 24 « erreurs non gérées » : une minuterie du harnais
  (`ajouterGabaritsDefautSiManquants`, tests/unit/_helpers/charger-script.js), attribuée à des fichiers différents d'une
  passe à l'autre ; *inféré* : sans lien avec ce lot (aucun de ses fichiers n'y passe), non mesuré sur la base.
- **La sentinelle du lot** : `tests/unit/sentinelle-par-standards-lot-1-cibles.test.js`, 24 essais, **8 break-tests**
  (journal en fin de fichier), chacun ROUGE puis retiré.
- **Deux break-tests de plus** : l'étiquette désescapée au récapitulatif rougit la sentinelle (cité au compte des
  interpolations de #467) ; `denotation: 'DEN'` retiré de `CODE_PAR_TYPE` rougit #343. **Retraits** : `objectifs.js`
  remis le temps d'un essai rougit les trois bancs d'absence (#467 B.c, G2-b, #296).
- **La garde du lot 0 rejouée** (`sentinelle-moteur-cibles-0-garde`) : 16 sur 16. Les sept cas, nu et habité, mêmes
  chiffres : SOM-1 P 86 ; GREG-0 profil 84,8, P 85 ; GREG-1 et GREG-2 profil 84,8 ; SPE-1 100 (et 50) ; DEN-1 78 ;
  DEN-2 59 ; golden master de la sommative 0,86. Aucune lecture des clés neuves par les moteurs existants ; le cliquet
  des six moteurs ne nomme ni la clé ni la méthode.
- **Les modèles existants de l'assistant** : `sentinelle-wizard-golden-creation-319` (33 essais) vert, fichier inchangé.
- **Les cliquets suivis** : #467 (+14 interpolations nues, des constantes et des fragments du code, justifié) ; complexité
  (une hausse assumée, `chargerPratiqueExistante` 40 → 41 ; `appliquerFormulaireDansCollection` passe sous 30 ; le compte
  au-dessus de 15 reste 434) ; #679 (règles CSS des classes neuves) ; #1137 (nombres par `note-pourcentage.js`, insécables) ;
  anti-cache (`release.mjs --build-only`, aucun numéro de version touché).
- **La suite complète après les retraits** : 12 017 verts, 2 rouges — le cliquet #402 (sa trace d'ablation vivait dans la
  section retirée de `portfolio.js` : remise, vert) et `sentinelle-noms-reels-retires-2026-10-24` (§ 3) ; les mêmes 24
  erreurs non gérées.
- **Le poids fautif seul se marque** (vu sur les premières captures : au refus, toutes les cases de toutes les cibles
  rougissaient) : la liste des cibles ne prend plus la marque d'erreur du champ, le poids refusé porte la sienne et
  `aria-invalid` ; essai ajouté à la sentinelle.
- **L'écran, sous Chromium** (WebKit absent du conteneur) : le parcours réel au clic (choisir « Par standards », trois
  cibles, un refus de poids nul, l'échelle de départ, le récapitulatif, la création, la fiche, la réédition), aucune
  erreur de console de l'application ; dans la démo, la pratique appliquée au cours actif, P non constructible et la
  cause lue. Captures : `plans de travail/captures-2026-11-21-par-standards-lot-1/` (1180 × 820 et 820 × 1180, clair et
  sombre, à l'échelle 2, réduites en palette de 128 couleurs ; neuf écrans : le choix, les cibles, leur total, le refus
  d'un poids nul, l'échelle, le récapitulatif, la fiche ; noms fictifs).
- **Non mesuré** : WebKit et Safari ; le Comparateur et l'Exploration devant une pratique par standards ; l'export des
  résultats et le Suivi (la cause y passe par la même fonction, *lu*, pas joué) ; l'ouverture d'un codex neuf par une
  version ancienne (type inconnu).

## 3. Les trouvailles et leur issue

| Trouvaille | Issue |
|---|---|
| Au profil, la carte « Performance » d'une pratique par standards montre « — » avec la cause en bulle (`title`, mécanisme #713) : **invisible au toucher sur iPad** ; et sa ligne décrit un portfolio (« 4 meilleures, maîtrise de standards ») qui n'existe pas pour cette pratique (`_genererTexteMethodePerformanceMobilisation`, code existant qui suppose qu'une famille non sommative est un portfolio) | **inscrire et continuer** : lot 3 (la section du profil de cette pratique) |
| `sentinelle-noms-reels-retires-2026-10-24` rougit sur la branche : le nom de famille d'une coautrice du rapport PAREA, homonyme d'un nom protégé, est cité dans la fiche de conception (4 fois), le skill (2) et sa consigne (1), réunis de `lot/standards-conception`. Le banc n'admet ce nom qu'en quatre fichiers, une fois chacun | **remonte à Grégoire** (règle 6 : un nom réel ; le banc encode une décision sur ses élèves). Non touché ici |
| `pratique-manager.js` compare les ids des pratiques aux NOMS des constantes de `PRATIQUES_PREDEFINES` (`Object.keys`) : sa migration V2 ne reconnaît jamais une pratique prédéfinie | **commenter et oublier** : sans conséquence observable (migration d'une forme ancienne) |
| Copier une pratique par standards (« Dupliquer », « Partir d'un modèle ») garde le même `ensembleCiblesId` : les deux pratiques partagent leurs cibles | **assumé** (C7 : les cibles sont celles du cours) ; à revoir si Grégoire veut des copies indépendantes |
| L'import d'une pratique seule (sélectif, partage) n'emporte pas son ensemble de cibles : la fiche dit « introuvables », la réédition recrée l'ensemble sous le même id | **inscrire et continuer** : lot du partage (plan, § 3, « non mesuré ») |

## 4. Ce qui remonte à Grégoire

1. **Les textes** : `TEXTES-2026-11-20-par-standards-lot-1.md`, 80 textes et 4 questions (noms des cinq niveaux de
   l'échelle de départ ; code CIB ; couleur sarcelle ; plages de l'échelle de départ).
2. **Le mot que lit l'étudiant·e** (« cible » ou « objectif ») : pas tranché, aucun écran de l'étudiant·e dans ce lot.
3. **Le banc des noms réels** (§ 3) : un nom de coautrice publiée, homonyme d'un nom protégé, dans la fiche réunie.
4. **Les copies d'une pratique par standards partagent ses cibles** (§ 3) : assumé d'après C7 ; à confirmer.
5. **Le cours est facultatif** dans l'étape des cibles (d'office, celui du groupe-cours actif) : aucun refus sans
   cours, puisque la consigne ne l'en fait pas un. Supposition nommée.

## 5. Porte

Aucune porte terrain : le passage des écrans neufs sous WebKit est une mesure de machine (le Mac,
`playwright --project webkit`, un navigateur à la fois), pas une vérification de Grégoire. Ses essais des quatre
gestes, avant toute fusion, viendront avec les lots 2 à 4.

## 6. Corrections du 21 nov. 2026 (relecture de Grégoire)

Consigne : `plans de travail/CONSIGNE-LOT-2026-11-21-moteur-cibles-1-corrections.md`. Même branche, PR n° 44 en
brouillon, rien dans `main`, aucune release.

**Séparer le code du sigle, en une ligne** : le registre garde le `code` interne de chaque famille (STD pour
`standards`, CIB pour `cibles` : le moteur le compare et les pratiques rangées le portent, rien n'est réécrit) et y ajoute
un `sigle` affiché (SEL, STD) ; tout écran qui montre un sigle le lit au registre (`obtenirSiglePratique`, `sigleDuCode`,
`genererBadgePratiqueHTML`).

### 6.1 Où un sigle s'affiche (mesuré : `grep` de `STD`, `CIB` et des lecteurs du code dans `js/` et `index.html`)

| Endroit | Avant | Fait |
|---|---|---|
| Badge du registre (`genererBadgePratiqueHTML` : Exploration, tableau de notation, Comparateur, données du trimestre) | le code | **le sigle** (SEL, STD) |
| Badge de la fiche, du menu et de la bibliothèque (`genererBadgeTypePratique`, lit `pratiques[0]` rangé) | le code rangé | **le sigle** ; bulles : SEL (G1), STD (F3), PAN (G2) |
| Badge global (`genererBadgePratique`, main.js : profil, listes) | le code | **le sigle** |
| Badge du Comparateur (`_badge`) | le code | **le sigle** |
| Export des résultats finaux, colonne « Pratique (code) » | STD | **SEL** (STD pour « Par standards ») ; aucun lecteur ne relit ce fichier (mesuré) |
| Assistant : badge du récapitulatif, ligne de « Partir d'un modèle » (`TYPE_BADGES`) | STD, CIB | **SEL, STD** ; couleurs du récapitulatif : sarcelle, bleu |
| Assistant : A5 | « (SOM, STD, SPE, DEN ou CIB) » | **« (SOM, STD, SEL, SPE ou DEN) »** |
| Avertissement des productions (`productions.js`) | « calcul STD » | **« calcul SEL »** (G8) |
| État vide de Conception › Pratiques | « (SOM, STD, SPE ou DEN) » | **« (SOM, STD, SEL, SPE ou DEN) »** (G7) |
| Carte « Note » de Conception › Pratiques (`index.html`) | « STD (Standards) permet… » | **SEL et STD, chacun avec son nom** (G3, G4) |
| Bulles de « Type de pratique » et de la navigation (`accompagnement-contenu-hover.js`) | STD = standards (ancienne) | **SEL et STD** (G5, G6) |
| **Glossaire** (`accompagnement-contenu-terme.js` : « Pratique de notation », « STD — PAN par standards », « PAN ») | STD = ancienne famille | **laissé : hors du périmètre** (définitions à réécrire, pas un sigle à remplacer) |
| **Fenêtre d'aide** (`accompagnement-contenu-popup.js`, « PAN par standards (STD) — retient les meilleures… ») | idem | **laissé : hors du périmètre** |
| **Guide pédagogique** (`guides-pedagogiques.js`, « PAN-Standards (code STD, aussi appelée Maîtrise) ») | idem | **laissé : hors du périmètre** |
| Gabarit de grille « [STD] Grille par objectifs » (`gabarits-utils.js`) | préfixe STD | **laissé** : retiré à l'affichage par `formaterTitre` ; un nom de grille relève de Grégoire (règle 3) ; copies rangées chez les gens |
| Nouvelles déjà publiées (`changelog-data.js`) | STD | **laissé** (historique publié) |
| Codes internes (moteur, `pratiques[]`, pack démo, modèles de la bibliothèque, légende du PDF par code, tableau de notation, vue simple) | STD, CIB | **inchangés** (interne, jamais affiché tel quel) |

« CIB » ne s'écrit plus qu'aux six places internes mesurées (registre, quatre clés de la fiche, l'assistant), et le banc
`sentinelle-sigles-sel-std-2026-11-21` en tient la liste.

### 6.2 Couleurs et contraste (formule WCAG)

| Couleur | Blanc sur la couleur (badge du récapitulatif) | Texte sur carte claire `#ffffff` | Texte sur carte sombre `#1a3040` |
|---|---|---|---|
| sarcelle `#0e9384` (SEL) | 3,80 | 3,80 | 3,59 |
| bleu `#0277bd` (STD, inchangé) | 4,80 | 4,80 | 2,84 |
| orange SOM, pour mémoire | 2,79 | 2,79 | 4,88 |

La sarcelle passe 3:1 (élément graphique) dans les deux thèmes ; aucune couleur de famille n'atteint 4,5:1 dans les deux
thèmes pour un texte de taille normale (le libellé coloré et la pastille blanche du récapitulatif). Couleur de Grégoire
gardée telle quelle ; variable renommée `--sel-sarcelle`.

### 6.3 Le reste

- **Textes** A4, A5, E1, F3 posés ; textes neufs G1 à G9 proposés (`TEXTES-…`, en tête).
- **Échelles libres** : essais à trois et à six niveaux (la pratique se crée ; l'étape montre tous les niveaux et n'offre
  au « sans donnée » que le niveau à 0 %).
- **Noms réels** : « Cormier et al. (2026) » dans la fiche, le skill et sa consigne ; « Voisard et al. (2025) » pour
  l'article de 2025 ; deux billets cités par leur titre et « billet d'une coautrice de Cormier et al. (2026) ». Le banc
  est vert sans contournement.
- **Fixture** : l'élève fictif « Bruno » devient « Boréal » dans 40 bancs (« Boreal » dans les noms de fichiers d'import,
  sans accent) ; « Bruno Voisard » reste là où il est l'auteur d'une pratique (deux bancs #342), et le banc #690 garde ce
  prénom (il vérifie qu'il ne revient pas dans le code).
- **Erreurs non gérées** : inscrites, #1302 (12 `requestAnimationFrame`, 8 `notif.remove`, 2 `toast.remove`, 2 `db is not
  defined` ; pas seulement « db is not defined »).

### 6.4 Supposé (à corriger en dix secondes)

- La bulle du badge SEL reprend des mots déjà acceptés du renommage (A1, D5) plutôt que d'en inventer.
- La carte « Note » de Conception › Pratiques nomme chaque sigle par son nom (G3, G4) : seulement changer le sigle aurait
  donné « SEL (Standards) ».
- L'export montre le sigle (le renommage avait gardé STD ; la décision du 21 nov. s'applique aux exports).
- Les classes CSS (`badge-type-std`…) suivent le code interne : invisibles, elles ne changent pas.

### 6.5 Ligne de Nouvelles PROPOSÉE (non écrite dans `changelog-data.js`)

> Le badge de la pratique « Par sélection de productions » s'appelle maintenant « SEL » (il disait « STD »), et prend la
> couleur sarcelle. « STD » désigne désormais la nouvelle pratique « Par standards ». Tes pratiques, tes réglages et tes
> notes ne changent pas.

## 7. Secondes corrections du 21 nov. 2026 (SEL n'est plus dite « PAN »)

Consigne : `plans de travail/CONSIGNE-LOT-2026-11-21-moteur-cibles-1-corrections-2.md`. Même branche, PR n° 44 en
brouillon, rien dans `main`, aucune release. *Origine de la règle : choix de Grégoire, 21 nov. 2026, 7 h 44 ; les sources
ne tranchent pas.* Textes posés : `TEXTES-2026-11-21-selection-sans-PAN.md` (il remplace, pour leurs repères seulement,
les fichiers validés du 20 nov., du 28 oct. et du 29 oct., restés intacts).

### 7.1 Corrigé (le nom de famille, les textes dictés, les remplacements simples)

- **Nom de famille** (`FAMILLES_TAXONOMIQUES.standards`) : « Par sélection de productions », sans parenthèse anglaise.
  Il s'affiche dans la bibliothèque (ligne de la rangée), sous le titre de la fiche et dans l'aperçu. Le résumé qui le
  suit disait « Maîtrise de standards/objectifs » : il reprend les mots acceptés D5 (supposé, § 7.5).
- **Dictés** : 8, 10, 17, 19 (A1, A2, F3, F10, P1, P2, donc E1) ; 12 (A3) ; 18 (F4) ; G1, G2, G5.
- **Remplacements simples** : l'aide des indices (`etudiants.js`, trois endroits) ; la note de l'Exploration
  (`comparateur-pratiques.js`) ; le type d'une ressource partagée (`donnees-v2.js`) ; trois diagnostics du profil
  (`profil-etudiant-actions.js`) ; « Méthodologie de calcul » du profil ; la bulle du type « Évaluation terminale »
  (`productions.js`) ; la carte « Note » des échelles ; deux titres de l'Aide › Conception ; la pratique de la démo.

### 7.2 Mesure du badge « PAN » sur une pratique SEL (point 4 ; rien n'a changé dans cette logique)

- **Pour une pratique SEL créée par le code actuel, aucun écran n'affiche un badge « PAN »** (mesuré par `grep` des
  producteurs de badges et des lecteurs du libellé de famille). La fiche affiche SEL ; le badge global (`main.js`) passe
  par le code puis le sigle et ne rend jamais « PAN » ; le Comparateur et l'Exploration passent par
  `genererBadgePratiqueHTML` ; la bibliothèque dit la famille en mots depuis #1156.
- **Le seul chemin vers un badge « PAN »** : `genererBadgeTypePratique` (`js/pratiques-gestion.js`), qui affiche le
  badge du titre de la fiche (`#mat-badge-pratique`, à l'ouverture d'une pratique et au changement de type).
  `typesValides` contient `'PAN'`, le texte rendu est « PAN », la bulle est G2. **Condition** : la pratique rangée porte
  `pratiques[0] === 'PAN'`, ou bien n'a pas de `pratiques` et porte un `type` que le registre ne connaît pas et qui
  commence par « pan » (repli `toUpperCase().substring(0, 3)`). Aucun écrivain actuel ne produit l'une ou l'autre forme
  (`CODE_PAR_TYPE`, la table de l'assistant). Seules des données anciennes le pourraient ; je ne peux pas les mesurer chez les gens.
- **Le libellé `famille: 'PAN'` du registre** (`obtenirLabelFamillePratique`, `obtenirLabelFamille()`) : aucun écran ne
  le lit (seules ses définitions existent). La valeur interne `indices.pratique === 'PAN'` (`indices.js:526`, toute
  pratique non sommative) n'avait qu'un lecteur affiché, la ligne « Pratique de notation active » du profil, qui dit
  maintenant le nom.
- **Deux textes affirment un badge que l'écran ne montre plus pour SEL** : le guide (« ces pratiques portent toutes,
  par commodité, le badge « PAN » ») et le glossaire (« l'application lui donne aussi le badge « PAN » par commodité »).
  Ils sont listés au § 7.3.

### 7.3 Laissé : les phrases qui demandent une réécriture (point 5)

| Où | La phrase en cause |
|---|---|
| Guide pédagogique (`guides-pedagogiques.js:310`) | « Dans Labo Codex, ces pratiques portent toutes, par commodité, le badge « PAN ». La recherche est plus précise : Standards et Spécifications sont des PAN ; la dénotation est une PRÉN. » |
| Guide (`:319-321`) | « Labo Codex implémente actuellement deux PAN » ; titre « PAN-Standards (code STD, aussi appelée Maîtrise) » et sa description |
| Fenêtre d'aide (`accompagnement-contenu-popup.js:252`) | « PAN par standards (STD) — retient les meilleures démonstrations de compétence… » (dit aussi STD pour SEL) |
| Glossaire (`accompagnement-contenu-terme.js:214`) | « Quatre pratiques sont disponibles : sommative (SOM), PAN par standards (STD), PAN par spécifications (SPE) et dénotation (DEN). » |
| Glossaire (`:471-474`) | terme « STD — PAN par standards » ; « Pratique alternative de notation qui compose la note à partir des démonstrations de compétence que retient sa configuration… » |
| Glossaire (`:498-501`) | « PAN — Pratique Alternative de Notation » : « Terme qui désigne les pratiques Standards (STD) et Spécifications (SPE)… » |
| Bulle de la pratique d'un groupe (`accompagnement-contenu-hover.js:119`) | « … moyenne sommative traditionnelle ou pratique alternative (meilleurs résultats retenus dans un portfolio, par exemple). » (« pratique alternative » de SEL, en toutes lettres) |
| Parcours « notation alternative » (`parcours-notation-alternative.js:39, 56, 96`) | « De ta pratique par standards, spécifications ou dénotation… » ; « En standards, la note repose sur les productions… » ; « Te voilà avec une pratique alternative appliquée à ton cours » |
| Gabarit de grille (`gabarits-utils.js:200-203`) | nom « [STD] Grille par objectifs » (STD désigne maintenant « Par standards ») ; description « Gabarit PAN-Standards : Critères alignés sur les objectifs du cours ». Le gabarit est rangé sous le code de SEL ; « par objectifs » irait plutôt à « Par standards ». Son nom s'imprime : à Grégoire |
| Champ « Nom » de la fiche (`index.html:5500`) | exemple « Ex: PAN-Standards Littérature ». Proposé : « Ex : Par sélection de productions – Littérature » (la forme que l'assistant affiche déjà) |
| Implicites, sans nommer SEL (`index.html:5704`, `:11034`) | « Note provisoire » (pratique alternative) ; « en pratique alternative de notation, la note provisoire » |

**Pas affichés, laissés** : `pratiques.js:325` (l'élément `#nomPratiqueDefaut` n'existe pas dans `index.html`) ;
`obtenirDescription()` du moteur (« Pratique PAN-Standards (SBG)… », aucun lecteur ne l'affiche) ; les noms de
`pratiques-predefines.js` (seules les clés sont lues) ; les messages de console ; les commentaires. **Les Nouvelles déjà
publiées** ne changent pas.

### 7.4 Source ou stock

Rien n'est réécrit chez personne. **Reste dans les données** : une pratique déjà nommée « PAN-Standards… » garde son nom ;
une démo déjà activée garde « PAN – Standards (démo) » jusqu'à sa prochaine activation ; le gabarit de grille déjà semé
garde son nom et sa description (la source aussi, § 7.3). **Trouvé en chemin** : depuis le 13 nov., sur `main`, le modèle
de la vue simple crée une pratique SEL **nommée « Par standards »** (le texte V3 d'avant le renommage, qui n'est pas
encore dans `main`). Les personnes qui l'ont choisi ont une pratique SEL qui porte le nom de la nouvelle famille.
Mesure seulement, à Grégoire.

### 7.5 Supposé

- Le résumé de la famille, sur la fiche et dans l'aperçu : les mots acceptés D5 (« Des niveaux (ex. I-D-M-E) ; la note
  retient certaines productions »), à la place de « Maîtrise de standards/objectifs ». La consigne ne dictait que le nom.
- Dans une phrase, le nom passe en minuscules (« pratique par sélection de productions », comme V1, V2, V6 et M1). Dans la
  note de l'Exploration, il est entre guillemets, parce qu'une minuscule s'y lirait comme une action.
- La démo : son nom de pratique contient le nom de famille, et je l'ai remplacé comme un nom de famille.
- Le banc #310 (« jamais « production » ») ne regarde plus le nom de famille : depuis le 21 nov., ce nom contient le mot.

### 7.6 Preuve

Vitest complet, un seul worker : 940 fichiers, 12 052 verts, 3 rouges (des épingles d'anciens textes, suivies ensuite,
fichiers rejoués verts), 24 erreurs non gérées (#1302, inchangées). Garde du lot 0 : 16/16. Sentinelle neuve
`sentinelle-sel-sans-pan-2026-11-21.test.js` : 25 essais, 7 break-tests (X1 à X7, journal en fin de fichier, empreinte
restaurée à chaque fois). Playwright sous Chromium, les huit spécifications qui portent ces textes : 37 verts, 2 sautés
(les captures sous drapeau). Captures : `captures-2026-11-21-par-standards-lot-1-sans-pan/` (bibliothèque avec l'aperçu
SEL ouvert, deux fiches, deux tailles, deux thèmes ; aucune erreur de page). Dans ces captures, la pratique SEL
emprunte l'échelle de départ créée pour la pratique STD, d'où « Échelle de départ – Par standards » dans son aperçu :
c'est le montage des captures, pas l'application. **Non vu** : WebKit et Safari ; la fenêtre du glossaire et le guide
à l'écran ; une donnée réelle portant `pratiques: ['PAN']`.
