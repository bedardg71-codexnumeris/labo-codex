# Rapport – Le troisième groupe de la démo, en « Par standards » (22 nov. 2026, suite)

> **Relais (22 nov. 2026).** Branche `lot/demo-par-standards`, partie de `main` (1.254.1, `d0dd74205`, qui n'avait pas
> bougé : rien à réunir), poussée ; ni fusion, ni release, ni Nouvelles. La version de l'application reste 1.254.1 ;
> **le tampon de build a changé** (`release.mjs --build-only`), exigé au pre-push par la sentinelle #825 dès que le pack
> change (§ 5). Version du pack inchangée (21.3) : question au § 6.
> Session : Claude Code dans un conteneur cloud Linux. **WebKit n'y existe pas** : tout ce qui est « vu » l'est sous
> Chromium. `RELAIS.md` (sur `main`) n'est pas touché : ce rapport tient lieu de relais de la branche.
>
> **Aperçu** : PR en brouillon [bedardg71-codexnumeris/labo-codex#55](https://github.com/bedardg71-codexnumeris/labo-codex/pull/55)
> (« APERÇU, ne pas fusionner ») ; **adresse d'essai : https://deploy-preview-55--codexnumeris-051225.netlify.app** (§ 0).
>
> **Fait** : la voie B. Un troisième groupe dans le pack (`js/pack-demo-10.js`, bloc `groupeParStandards`), son cours
> et son groupe-cours, dix totems neufs, la pratique « Par standards » (cinq cibles, quatre critères sur la première),
> deux productions de lecture, l'état de départ (Marmotte Pétillante « en attente », les neuf autres notés), l'histoire
> de Marmotte Pétillante en matériel prêt pour le futur parcours (absente de l'état de départ). `peuplerNamespace` le
> verse dans `demo_*`. Les détecteurs de `js/parcours-classe.js` reconnaissent le pack par sa marque `isDemo`.
> **Mesuré** : Vitest complet vert (950 fichiers, 12 331 essais) ; l'essai neuf (21, treize break-tests) ; le banc neuf
> sous Chromium (4 sur 4, quatre break-tests) ; les bancs des modèles comparés à la base, rouge pour rouge (§ 5).
> **Reste** : la question du stock (§ 6, à Grégoire) ; les suppositions (§ 7) ; Safari et l'iPad (§ 8).

---

## 0. L'aperçu

- PR en brouillon : [bedardg71-codexnumeris/labo-codex#55](https://github.com/bedardg71-codexnumeris/labo-codex/pull/55),
  « APERÇU, ne pas fusionner ».
- **Deploy Preview** : https://deploy-preview-55--codexnumeris-051225.netlify.app (Netlify : « Deploy Preview ready! »
  sur `0a54bbb0`). Toute correction poussée sur la branche garde la même adresse.
- Pour voir, en gestes : menu en haut à droite › « Explorer la démo » ; dans l'en-tête, choisir « 601-998-DM ·
  gr. 00003 » ; Évaluation › Tableau de notation. La fiche de la pratique : Conception › Pratiques › « Par standards
  (démo) ». Une démo déjà ouverte avant sur le même navigateur et la même adresse : « Remettre la démo à neuf » (§ 6) ;
  une adresse d'aperçu neuve part de zéro.

---

## 1. Ce qui est en place

**Le cours** : `demo-cours-std`, code `601-998-DM`, titre « Lire et écrire par cibles (Démo) » (dans `listeCours`, à
la suite du cours du premier groupe : l'entrée et la sortie de la démo lisent les cours là, `js/demo-activation.js`).

**Le groupe-cours** : `GC_DEMO_STD`, groupe `00003`, l'en-tête le dit « 601-998-DM · gr. 00003 ». Pas actif à
l'ouverture : la démo ouvre toujours sur le premier groupe. **L'horaire** : `HOR_DEMO_STD`, « Mer-AM / Jeu-PM » (mercredi
8 h à 9 h 40, jeudi 13 h à 14 h 40), qui ne chevauche ni le premier groupe (lundi, mercredi après-midi) ni le deuxième
(mardi, vendredi matin). Aucune présence n'est semée pour ce groupe.

**Les dix personnes** (prénom l'animal, nom la qualité ; DA d'une plage neuve, ni `DEMO…` ni `99000…`) :

| DA | Prénom | Nom |
|---|---|---|
| 9700001 | Marmotte | Pétillante |
| 9700002 | Girafe | Lumineuse |
| 9700003 | Panthère | Cordiale |
| 9700004 | Tortue | Prévenante |
| 9700005 | Chouette | Charmante |
| 9700006 | Kangourou | Taquin |
| 9700007 | Colibri | Radieux |
| 9700008 | Tigre | Patient |
| 9700009 | Zèbre | Gentil |
| 9700010 | Écureuil | Joueur |

**La pratique** `demo-cib-litt`, « Par standards (démo) », de la forme que l'assistant écrit : l'« Échelle de départ –
Par standards » (`ECH_DEMO_STD`, niveau pour niveau celle de `EnsemblesCibles.echelleDeDepart`, l'essai le vérifie),
« 0 » pour « sans donnée », double seuil absent (donc éteint), ni « Notes finalisées » ni cible terminale. Son
identifiant commence par `demo-` : le modèle d'« Évaluer » reconnaît ainsi les pratiques du pack.

**Les cinq cibles** (`ENSC_DEMO_STD`), étiquette seule, énoncé vide : « La lecture stratégique » 25 ; « La lecture
analytique » 30 ; « Le plan » 10 ; « La rédaction » 25 ; « La révision » 10. La première seule a des critères :
Structure, Rigueur, Plausibilité (essentiels), Nuance (non essentiel).

**Les deux productions** (type « Travail écrit », pondération 0, `ciblesRenseignees` : « La lecture stratégique ») :
- « Stratégies de lecture : « Deux-Rives » », échéance le **mercredi 17 septembre 2025** ;
- « Stratégies de lecture : « Marine » », échéance le **mercredi 1er octobre 2025** (deux semaines plus tard).

Le trimestre de la démo va du 21 août au 12 décembre 2025 ; « Marine » est le texte de la carte d'alignement de la démo.

**Le bloc vit à part** des collections du premier groupe (`groupeParStandards`, en fin de pack) : les sentinelles du
premier groupe (les dix totems, les 101 copies, les deux échelles, le décompte de l'Aide) ne le voient pas.
`peuplerNamespace` le verse dans `demo_*`, marqué `isDemo` comme le reste ; « Remettre la démo à neuf » le réécrit.

---

## 2. L'état de départ : les niveaux et les notes

Échelle : 1 vaut 25 %, 2 vaut 50 %, 3 vaut 75 %, 4 vaut 100 %. La note est la moyenne pondérée des niveaux retenus,
arrondie comme l'indice P (`arrondirIndiceSurCent`).

| Personne | Lect. strat. (25) | Lect. analyt. (30) | Plan (10) | Rédaction (25) | Révision (10) | Note | Affichée |
|---|---|---|---|---|---|---|---|
| Marmotte Pétillante | rien | 3 | 3 | 2 | 3 | en attente | « En attente », « La lecture stratégique » |
| Girafe Lumineuse | 3 | 3 | 4 | 3 | 3 | 77,5 | 78 % |
| Panthère Cordiale | 4 | 4 | 3 | 4 | 3 | 95 | 95 % |
| Tortue Prévenante | 2 | 2 | 3 | 2 | 3 | 55 | 55 % |
| Chouette Charmante | 3 | 2 | 3 | 3 | 2 | 65 | 65 % |
| Kangourou Taquin | 2 | 1 | 2 | 2 | 2 | 42,5 | 43 % |
| Colibri Radieux | 3 | 3 | 3 | 2 | 4 | 71,25 | 71 % |
| Tigre Patient | 2 | 3 | 2 | 3 | 3 | 66,25 | 66 % |
| Zèbre Gentil | 4 | 3 | 3 | 3 | 3 | 81,25 | 81 % |
| Écureuil Joueur | 3 | 2 | 1 | 2 | 2 | 53,75 | 54 % |

Six « 4 », deux « 1 », aucun « 0 ». Trois notes sous 60 (43, 54, 55). Dates : « La lecture stratégique » le 17 sept.
(sur « Deux-Rives ») ; « La lecture analytique » le 29 oct., « Le plan » le 12 nov., « La rédaction » le 26 nov., « La
révision » le 10 déc., sans production.

**La note de Marmotte Pétillante, une fois son histoire posée** (3 sur « La lecture stratégique ») :
(25 × 75 + 30 × 75 + 10 × 75 + 25 × 50 + 10 × 75) / 100 = 6 875 / 100 = **68,75 %, affichée 69 %**.

---

## 3. L'histoire de Marmotte Pétillante, et comment l'observation (a) est enregistrée et lue

`PACK_DEMARRAGE.groupeParStandards.histoire.inscriptions` : trois saisies, dans l'ordre, de la forme que prend
`InscriptionsCibles.inscrire` (qui leur donne une identité et un horodatage). **`peuplerNamespace` ne la verse pas** :
elle n'est pas dans l'état de départ.

- **(a)** jeudi 11 sept. 2025 (jour de cours du groupe) : une remarque, `niveau: null`, sans production, texte « Relève
  bien les procédés ; son hypothèse ne s'appuie pas encore sur le texte. », critères Structure `true`, Rigueur `true`,
  Plausibilité `false`, Nuance `null` (laissé vide).
- **(b)** mercredi 17 sept. 2025, sur « Stratégies de lecture : « Deux-Rives » » : le niveau 2 (« Ça y est presque »).
- **(c)** mercredi 1er oct. 2025, sur « Stratégies de lecture : « Marine » » : le niveau 3 (« Acquis »).

**L'origine de (a).** La saisie porte `origine: 'observation'`. **`main` ne connaît pas ce champ** : son écrivain
(`construireInscription`) ne le range pas, et l'inscription s'écrit sans lui. Sur `lot/observation-par-standards`,
l'écrivain le range ; et une inscription écrite sans ce champ et sans production y est LUE « observation »
(`lireOrigine`), sans rien réécrire. Donc : posée aujourd'hui, (a) se lira « observation » quand cette branche sera en
ligne ; posée après, elle portera le champ.

**Le contexte « atelier d'annotation sur « Deux-Rives » »** n'a pas de champ, et je n'en ai pas créé. Il peut vivre :
dans la date (une séance du groupe, six jours avant l'échéance de « Deux-Rives ») ; dans l'absence de production ; et
dans ce que dira la bulle du parcours. Il n'est pas dans la note brève, dont le texte est celui de la consigne.

**Posée** (par l'écrivain réel) : le niveau retenu est « 3 – Acquis », (b) reste à l'historique sous lui, la remarque
n'entre pas au niveau retenu, la note vaut 68,75 % (69). Vérifié par l'essai unitaire (§ 5) et à l'écran (banc B).

---

## 4. La retouche des détecteurs de `js/parcours-classe.js`, et ce qui la juge

Avant : « le groupe créé » était tout groupe-cours qui n'est pas `GC_DEMO`, « l'horaire créé » tout horaire qui n'est
pas `HOR_DEMO`, « les étudiant·es ajouté·es » tout DA sans le préfixe `DEMO`. Le troisième groupe aurait été pris pour
celui que la personne monte. Après : une fonction `duPack(x)` (vrai si `x.isDemo === true`, la marque que
`peuplerNamespace` pose sur tout ce qu'il écrit et qu'aucun geste de la personne ne pose) s'ajoute aux anciens critères,
qui restent. Cinq lectures : `etudiantsAjoutes`, `horaireCree`, `groupeCoursCree`, `surLeGroupeCree`, `deuxiemeGroupe`.
**Aucune bulle, aucun mot, aucun geste ne change.**

Ce qui la juge :
- l'essai unitaire, section F : la démo à neuf n'a pas de deuxième groupe ; un groupe monté APRÈS le troisième dans la
  liste est bien « le deuxième », et pas avant d'avoir ses étudiant·es (break-tests BT1, BT2, BT3) ;
- le banc A (Chromium) : la Modélisation de « Mettre ta classe en place » joue ses huit étapes de bout en bout avec le
  troisième groupe dans la démo, puis l'en-tête offre trois groupes et `deuxiemeGroupe()` rend celui de la personne ;
- les bancs des modèles rejoués à l'identique (§ 5).

---

## 5. Les vérifications

**Vitest complet** (depuis `tests/`). Base `d0dd74205` : 949 fichiers, 12 310 essais, tous verts. Branche : 950 fichiers,
12 331 essais, tous verts (dernier passage, puis le hook pre-push au moment de pousser). Un rouge en chemin, corrigé :
la sentinelle des sigles interdit « CIB » hors de ses places internes, et la pratique du pack portait
`"pratiques": ["CIB"]` ; le champ est retiré (le badge lit `type`, comme pour les pratiques du premier groupe).

**L'essai neuf**, `tests/unit/demo-par-standards-2026-11-22.test.js` : 21 essais en six sections (A le groupe, B la
pratique, C le versement et le stock, D l'état de départ, E l'histoire posée, F les détecteurs), sur les modules réels.
**Treize break-tests**, chacun appliqué puis retiré (fichiers revenus octet pour octet), tous rouges : journal en fin de
fichier (la marque retirée côté groupe-cours ou côté fiches ; le groupe-cours versé sans `isDemo` ; les inscriptions non
versées ; l'histoire versée dans l'état de départ ; une écriture hors de `demo_` ; un poids changé ; un niveau de
Marmotte changé ; « Marine » à 13 jours ; « Nuance » essentielle ; l'échelle qui dérive de celle de l'assistant ; (c) sur
une autre cible ; la version du pack montée).

**Le banc neuf**, `tests/integration/demo-par-standards-2026-11-22.spec.js` (Chromium) : quatre essais, verts.
- A, à 1180 × 900 et 820 × 1180 : la démo s'ouvre sur le premier groupe, l'en-tête offre « 601-101 · gr. 0demo » et
  « 601-998-DM · gr. 00003 », `deuxiemeGroupe()` est nul ; la Modélisation de « Mettre ta classe en place » se joue
  entière (le banc partagé juge ses huit étapes) ; l'en-tête offre alors trois groupes, et « le deuxième » est celui de
  la personne. **Pas à 1180 × 820** : à cette taille, le banc partagé de la Modélisation rougit DÉJÀ sur la base, à
  l'étape 1 (« une flèche va de la bulle à #v2-btnCreerCours », pointes à 527, 446 et 411 px, les mêmes au pixel sur la
  base et sur la branche).
- B, à 1180 × 820 et 820 × 1180 (l'iPad, ses deux orientations) : la fiche de la pratique (cinq cibles, « Poids 25 ·
  25 % »…, les quatre critères, « critère essentiel » sur trois, « Aucun critère. » sur les quatre autres cibles) ; le
  tableau des cibles (les cinq colonnes, dix rangées, la note des neuf telle qu'au § 2, « En attente » et « La lecture
  stratégique » pour Marmotte Pétillante, sa case « Données insuffisantes ») ; sa case ouverte (les critères, « Aucune
  inscription pour l'instant. ») ; l'histoire posée par `InscriptionsCibles.inscrire` (la case à 3, compte 3, la note
  69 %, « Acquis » retenu, « Ça y est presque » à l'historique, la remarque avec ses critères respecté, respecté, non
  respecté, vide) ; la sortie : **aucune clé hors de la démo ne change** ; « Remettre la démo à neuf » : la démo du pack
  revient clé pour clé, les autres clés sont identiques, Marmotte Pétillante est de nouveau « En attente ».
- **Quatre break-tests**, tous rouges : le groupe-cours versé sans `isDemo` (A : la Modélisation se trompe de groupe) ;
  le poids du plan à 15 (B : la fiche) ; l'histoire versée au départ (B : Marmotte n'est plus en attente) ; la sortie
  qui laisse le cours du troisième groupe dans la clé globale `cours` (B : « aucune clé hors de la démo ne change »).

**Les bancs à rejouer, base contre branche** (Chromium, mêmes fichiers, mêmes réglages) :

| Banc | Base `d0dd74205` | Branche |
|---|---|---|
| `deux-temps-modelisation` (« Mettre ta classe en place », six essais) | 6 verts | 6 verts, après la retouche de deux essais (ci-dessous) |
| `deux-temps-modeles` (le modèle d'« Évaluer », cinq essais) | 4 verts ; rouge : B à 1180 × 820 (la flèche de l'étape 1) | idem, deux passages : 4 verts, le même rouge, au même endroit |
| `parcours-je-regarde` | verts au passage ; essai 261 rejoué seul : 1 rouge sur 3 | vert au premier passage, rouge au second ; rejoué seul : 1 rouge sur 3 |
| `parcours-4-recevoir-et-rendre` (« Recevoir » n'a pas de modèle sur `main` : c'est son banc) | verts | verts, deux passages |
| `parcours-2-ma-classe` | 3 rouges (245, 542, 623) | 2 rouges (245, 623) |
| `parcours-3-evaluer` | 2 rouges (46, 50) | verts |
| `menu-demo`, `noms-demo-totems`, `guidage-demo`, `demo-saisie-presences`, `t3-retirer-les-copies`, `par-standards-lot-2`, `par-standards-lots-3-4`, `vue-simple` | verts | verts |
| `copie-demo-bibliotheque` (essai 180, « rien sans le geste ») | vert au passage ; rejoué seul : 2 rouges sur 4 | rouge au passage ; rejoué seul : 1 rouge sur 4 |

Les rouges de la base (`parcours-2` 245, 542, 623 ; `parcours-3` 46, 50 ; `deux-temps-modeles` B à 1180 × 820) sont là
avant ce lot ; ceux qui passent ici sans changement de leur code (542, 46, 50) sont instables. L'essai 180 de
`copie-demo-bibliotheque` et l'essai 261 de `parcours-je-regarde` (la rotation du triangle d'un menu, une transition)
sont instables des deux côtés, aux mêmes taux (§ 9). Le dernier passage (modèles d'« Évaluer », « Je regarde »,
« Recevoir », menu de la démo) est postérieur à la version du pack remise à 21.3 et au retrait de « CIB ».

**Deux bancs du premier groupe retouchés**, parce qu'ils comptaient la démo en absolu :
- `deux-temps-modelisation` (essais 140 et 293) : « 20 étudiant·es, 2 horaires, 2 groupes » après la Modélisation
  deviennent 30, 3, 3 ; « 10 étudiant·es, 1 groupe » au départ deviennent 20 et 2 ; « 12 » après un import de deux
  fiches devient 22 ; et « l'horaire créé » est celui qui n'est pas du pack (`!h.isDemo`), comme dans les détecteurs.
  Ce que l'essai juge ne change pas : la Modélisation ajoute dix fiches, un horaire, un groupe ; la remise à neuf rend
  le départ du pack.
- `sentinelle-noms-demo-totems` (#1180, D) : l'égalité « exactement les dix DA des totems » porte sur le cours du
  premier groupe ; les anciens noms restent cherchés dans tout le namespace.

**Le tampon de build.** Le hook pre-push a refusé le premier push : la sentinelle #825 exige qu'un changement de
`js/pack-demo-10.js` (servi sous `?v=<build>`, immuable un an) vienne avec un build neuf. `node scripts/release.mjs
--build-only` : build `1122-1216` → `1122-1644`, version inchangée, aucune Nouvelle ; ses jetons suivent (dont `modes.js`
et `synthese-retroaction-data.js`, modifiés par la release 1.254.1). Les jetons `20261122f` de `main.js` et
`init-inline.js` avaient déjà servi sur `lot/observation-par-standards` (#826) : `20261122g`. **Conflit attendu à la
réunion** avec toute branche qui touche aussi ces lignes (`version.json`, `version.js`, `main.js`, `init-inline.js`,
jetons d'`index.html`) : la session qui fusionnera refera la release.

---

## 6. Le stock : une question pour Grégoire

**Source seulement.** La version du pack de la démo reste `21.3`. `initialiserDemoNamespace` ne réécrit `demo_*` que si
cette version change. Donc :
- une démo **jamais ouverte** sur l'appareil (ou ouverte ailleurs, comme l'adresse d'aperçu) reçoit le troisième groupe ;
- une démo **déjà installée** ne le reçoit pas tant qu'on n'a pas touché « Remettre la démo à neuf » (qui réécrit tout
  depuis le pack, quelle que soit la version).

**Pourquoi je n'ai pas monté la version.** Une version neuve réécrit, au chargement suivant, les collections de la démo
chez chaque personne qui l'a ouverte : le deuxième groupe qu'elle a monté par la Modélisation, sa grille, sa production
et son évaluation d'« Évaluer » disparaîtraient en silence. Ce serait la première montée depuis que les modèles existent
(le pack est en 21.3 depuis le 13 sept. ; les modèles datent des 12 et 13 nov.). Le premier mandat disait « Source
seulement : aucune migration de données d'utilisateur ».

**À trancher** : monter la version (tout le monde reçoit le troisième groupe et perd ce qu'il a fait dans la démo ;
l'Aide le dit déjà : « une nouvelle version du pack démo remplace tes évaluations »), ou la laisser (le futur parcours
devra dire « Remettre la démo à neuf » quand le troisième groupe manque).

---

## 7. Supposé (à corriger par Grégoire)

- **Les poids** (25, 30, 10, 25, 10 : ceux de l'hiver, le français écrit fondu dans « La rédaction ») et **les niveaux
  de Marmotte Pétillante** (3, 3, 2, 3) : supposés par Cowork, repris tels quels.
- **Les niveaux des neuf autres** (§ 2) : choisis par moi.
- **Les noms des deux productions** : ceux de la consigne. Leur type (« Travail écrit »), leur pondération (0) et leur
  description (« Stratégies de lecture appliquées au texte « … » ») : choisis par moi.
- **Les dates** : choisies par moi (§ 1, § 2, § 3), dans le calendrier du pack.
- **Le cours** (`601-998-DM`, « Lire et écrire par cibles (Démo) »), **le groupe** (`00003`) et **l'horaire**
  (« Mer-AM / Jeu-PM ») : choisis par moi.
- **Les quatre autres cibles sans production** : leurs niveaux de départ ne désignent aucune production. Quand
  `lot/observation-par-standards` sera en ligne, ils se liront « observation ». À rattacher à des productions si
  Grégoire le veut.
- **Les critères des niveaux (b), (c) et des neuf autres** : laissés non renseignés (la consigne ne les dit pas).

---

## 8. Non vérifié

- **Safari et l'iPad** : WebKit n'existe pas dans ce conteneur ; rien n'a été simulé. Le banc neuf se passe sur le Mac
  avec `playwright.config.js`.
- **L'adresse d'aperçu** elle-même : le proxy du conteneur la refuse (« CONNECT tunnel failed, response 403 ») ;
  seul l'état de Netlify sur la PR (« ready ») est lu.
- **Les bancs non rejoués sur la branche** : seuls ceux du tableau du § 5 l'ont été ; la suite Playwright entière, non
  (elle n'est pas un vert possible sous Chromium, en-tête de `playwright.chromium.config.js`).

---

## 9. Trouvailles, et leur issue

1. **La carte d'Aide « Explorer la démonstration »** (`index.html`) ne compte que le premier groupe (« 10 étudiant·es,
   11 productions… 2 échelles ») ; la démo en porte désormais un troisième. Sa sentinelle lit les collections du premier
   groupe : elle reste verte. **Inscrire et continuer** : la carte d'aide est le chantier de l'autre session en cours ;
   à reprendre quand la démo par standards sera fusionnée.
2. **`copie-demo-bibliotheque`, essai 180, instable sur la base** : il lit « les vraies grilles » du trimestre réel
   juste après l'avoir créé, pendant que `initialiserModuleGrilles` (lancé au démarrage, non attendu) sème ou non la
   grille de départ selon qu'il passe avant ou après le changement de trimestre. Mesuré par une sonde (base : semée 2
   fois sur 3 dans les 1,5 s ; branche : 1 fois sur 3) et par l'essai rejoué seul (base 2 rouges sur 4, branche 1 sur 4).
   **Inscrire et continuer** (le banc, pas l'application).
3. **`parcours-je-regarde`, essai 261, instable sur la base** : la rotation du triangle lue pendant sa transition
   (« matrix(0, -1, 1, 0, 0, 0) » au lieu de « none ») ; 1 rouge sur 3 de chaque côté. **Inscrire et continuer**.
4. **Le stock de la démo** (§ 6) : **remonte à Grégoire**.
5. **Le modèle d'« Évaluer » évalue la première ligne de la liste**, triée par nom (Amical Yack, inféré par lecture),
   pas Enjouée Loutre : déjà au rapport du 22 nov. (premier passage). **Commenter et oublier** : aucun parcours ne la
   nomme, et la démo par standards a désormais sa propre personne.
6. **Les détecteurs** : corrigés dans ce lot (accord de Cowork), donc pas une trouvaille ; noté pour mémoire que
   `js/parcours-decouvrir.js` vise `GC_DEMO` explicitement (le premier groupe) : c'est voulu, rien à faire.
