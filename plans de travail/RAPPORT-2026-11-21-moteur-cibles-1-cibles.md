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
