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
> fixture « Bruno » remplacée, #1302 inscrit. Reste : les textes G1 à G9 à relire ; le passage WebKit du Mac ; le lot 2.

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
