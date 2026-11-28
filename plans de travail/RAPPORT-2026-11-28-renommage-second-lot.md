# Rapport · second lot du renommage des pratiques (28 nov. 2026)

**Relais.** Branche `lot/renommage-second-lot-2026-11-28`, partie de `main` à `574bb60b` (1.260.0, build 1127-1907).
**Fait** : les 35 textes ; la garde du modèle fourni (ancienne paire tenue pour intacte) ; l'affichage de la copie rangée
au nom courant, à la lecture seulement ; les mesures a, b et c ; les bancs mis à jour. Vitest complet vert (985 fichiers,
12 702 tests, lancé depuis `tests/`).
**Reste** : le feu vert de Grégoire, puis la fusion vers `main`, le bump et le changelog (rien de cela n'est fait ici,
par mandat). Le verdict WebKit du Mac est pris, **vert** sur `6cff76e6` (§ 10) ; niveau proposé : `patch`.
**Aucun calcul de note ne change.** Aucune donnée n'est écrite chez personne.
**Jetons `?v=`** : les 15 fichiers `js/` modifiés reçoivent dans `index.html` le jeton neuf que propose le garde anti-cache
(`scripts/verifier-anticache-stage.mjs`, qui refuse le commit sans lui). Ni `version.json` ni le numéro ne bougent :
ce n'est pas un bump, et `release.mjs` reposera ses propres jetons à la fusion.

Aucun des 35 textes n'atteint l'élève : tous se lisent dans des écrans de l'enseignant·e (vérifié par lecteur, § 1). Les
titres de PDF cités par les textes 8 et 25 (« Note actuelle du cours », « Note provisoire ») ne changent pas.

## 1. Les textes changés

Lignes remesurées sur la branche, après changement.

| N° | Fichier : ligne | Note |
|---|---|---|
| 1 | `js/pratiques/pratiques-predefines.js:159`, `js/pratiques/pratique-sommative.js:45`, `js/pratiques.js:325` | id `sommative-traditionnelle` inchangé. ⚠ `pratiques.js:325` écrit dans `#nomPratiqueDefaut`, absent d'`index.html` : ce texte ne s'affiche nulle part (trouvaille T3) |
| 2 | `js/pratiques/pratiques-predefines.js:162` | |
| 3 | `js/pratiques/pratique-sommative.js:53` | |
| 4 | `index.html:5459` | |
| 5, 6 | `js/pratiques-bibliotheque.js:109`, `:110` | voir § 2 |
| 7 | `index.html:5906` | **panneau vivant** : `afficherConfigurationTypeMat` (`pratiques-gestion.js:1590`) l'affiche à l'ouverture de toute pratique cumulative dans Conception › Pratiques. Le gras de `<strong>` est gardé |
| 8 | `index.html:5726` | |
| 9 | `js/wizard-pratique-v2.js:55` | |
| 10, 11 | `js/accompagnement-contenu-popup.js:1629`, `:1636` | |
| 12, 13 | `js/accompagnement-contenu-hover.js:119`, `:316` | |
| 14 | `js/accompagnement-contenu-popup.js:245`, `:249` | |
| 15, 16, 17 | `js/accompagnement-contenu-popup.js:251`, `:252` (ligne neuve), `:253` | 16 et 17 : insécable avant « ; » et apostrophe typographique, dans la forme des items voisins |
| 18 | `js/accompagnement-contenu-popup.js:1163` | |
| 19 | `js/accueil.js:197` | |
| 20 | `js/parcours-evaluer.js:1444` | |
| 21 | `js/guides-pedagogiques.js:140` | seul endroit touché de ce fichier ; guides « som » et « pan » intacts |
| 22 | `js/accompagnement-contenu-terme.js:466` | |
| 23 | `js/accompagnement-contenu-terme.js:470` (entrée neuve) | clé `hyb-hybride`, catégorie « Pratiques de notation », voir « Conception › Pratiques ». L'en-tête du fichier dit désormais **74 termes** (un banc le compte) |
| 24, 25 | `js/accompagnement-contenu-terme.js:484`, `:618` | |
| 26 | `js/profil-etudiant-sections-affichage.js:3989` (ligne), `:3872` (`_nomPratiqueActivePanneau`) ; `js/pratiques/pratique-registre.js:169` (`obtenirNomTypePratique`) | voir ci-dessous |
| 27, 28, 29 | `js/profil-etudiant-sections-affichage.js:3620`, `:3625`, `:3626` | |
| 30 | `js/profil-etudiant-helpers.js:655` | lu au survol du niveau de la note globale, profil seulement |
| 31, 32, 33 | `index.html:10825`, `:10833`, `:10835` | |
| 34 | `js/evaluation-sauvegarde.js:582-583` | l'avis du formulaire d'évaluation (enseignant·e) |
| 35 | `index.html:11551` | |

**Texte 26, ce que j'ai décidé.** Le registre n'avait pas de nom par pratique (seulement `famille` : « Cumulative »,
« Hybride », « PAN »). J'ai ajouté un champ `nom` à sa table existante `REPRESENTATIONS_PRATIQUES` (pas de seconde table)
avec les cinq noms du mandat, et un lecteur strict `obtenirNomTypePratique`. Le retour d'`obtenirRepresentationPratique`
ne bouge pas (un banc le fige). La carte lit `obtenirTypePratiqueActive()`, puis ce nom.
**Supposé** : sans pratique résolue (aucune assignée, ou un type inconnu du registre), la ligne dit « — », la marque d'une
valeur inconnue ailleurs dans l'application. Le mandat ne nommait pas ce cas ; c'est le seul mot que j'ai choisi.

**Hors élève, à savoir.** `obtenirNom()` de la Cumulative codée (texte 1) entre aussi dans la colonne « nom de la
pratique » du CSV des résultats finaux (`js/export-resultats-finaux.js:159`), un fichier d'archives personnelles de
l'enseignant·e. Il ne vaut que pour la pratique codée, pas pour une pratique configurée (qui porte son propre nom).

## 2. La garde du modèle fourni et l'affichage de la copie rangée

- **La liste des formes antérieures** : `FORMES_ANTERIEURES_DES_MODELES` (`js/pratiques-bibliotheque.js:224`), un seul
  endroit, avec la date et le motif. Une seule entrée : `SOM-litterature`, la paire « Modèle sommatif » / « Pour débuter
  avec une pratique sommative ».
- **La garde** (`estModeleFourniIntact`, `:329`) compare tous les champs sauf la tenue, comme avant, puis juge nom et
  description **ensemble** : la paire courante du modèle, ou une paire de sa liste. Pas de tolérance générale sur le nom.
- **L'affichage** (`formeAffichableDuModeleFourni`, `:363`) : une copie reconnue intacte se lit avec le nom et la
  description courants du modèle. Un nouvel objet ; rien n'est écrit. Branché dans **deux lecteurs exactement**,
  `obtenirToutesLesPratiquesBibliotheque` (`:244`) et sa version synchrone (`:277`). La décision de Cowork tient : ma
  mesure ne la contredit pas.
- **Passe « connexions »** (les autres lecteurs de `bibliothequePratiques`) :
  - « Utiliser dans ce trimestre » passe par `obtenirConfigurationPratiqueParId`, qui sert le modèle courant : une
    installation depuis la copie à l'ancienne paire s'appelle « Modèle cumulatif » ;
  - la suppression (`supprimerPratiqueDeBibliothequePartagee`) lit la copie brute et la juge par la garde : refusée,
    comme le 22 nov. ;
  - la relation entre les deux colonnes (`BibliothequeUI.lieeAExemplaire`) passe par l'`id`, pas le nom : intouchée ;
  - **l'export de la bibliothèque** (`exporterBibliothequePratiques`) lit la base brute : un fichier exporté porte
    l'ancienne paire. Importé ailleurs, la garde la reconnaît et la lecture l'affiche au nom courant.
- **Effet de bord, dans mon propre code** : les deux lecteurs ajoutaient les modèles par `unshift` dans le tableau rendu
  par `db`, peut-être celui du cache mémoire. Le `map` rend un tableau neuf ; cette écriture possible dans le cache part
  avec lui. Non mesuré au-delà.

**La sentinelle réécrite** : `tests/unit/sentinelle-familles-cum-hyb-2026-11-27.test.js`, bloc C. Elle figeait « Modèle
sommatif garde son nom » ; elle dit maintenant la règle neuve (le modèle s'appelle « Modèle cumulatif », l'ancienne paire
est intacte, l'ancien nom seul ou un nom à soi ne le sont pas). Le motif du 27 nov. y reste écrit.

**Le banc** (`tests/unit/sentinelle-modele-fourni-intact.test.js`, 15 essais) : copie à l'ancienne forme (intacte) ;
copie à la nouvelle forme (intacte) ; copie renommée à la main, avec l'une ou l'autre description (non intacte) ;
homonyme sans parenté, aux deux formes (non intact). En plus : la paire mélangée (non intacte), l'ancienne paire posée
sur un autre modèle (non intacte), une copie à l'ancienne forme dont une pondération diffère (non intacte), et les deux
lecteurs : nom courant pour la copie intacte, homonyme intouché, données lues inchangées, zéro écriture.

## 3. La preuve des break-tests

Chaque mutation posée, le banc relancé seul, la mutation retirée ; empreinte sha256 du fichier identique avant et après
(`js/pratiques-bibliotheque.js` : `3898919948ea9c02…`). Journal écrit dans le banc lui-même.

| Mutation | Banc | Résultat |
|---|---|---|
| M1 la tolérance retirée (`porteUnePaireDuModele` ne lit plus la liste) | Vitest, garde | **3 rouges** sur 15 : l'ancienne forme, les deux lecteurs |
| M2 l'affichage retiré des deux lecteurs | Vitest, garde | **2 rouges** : les deux lecteurs |
| M3 une tolérance générale sur le nom | Vitest, garde | **5 rouges** : nom modifié, renommée à la main, paire mélangée, paire sur un autre modèle, lecture d'une copie renommée |
| M4 l'affichage jugé au nom seul, sans la garde | Vitest, garde | **2 rouges** : l'homonyme renommé à la lecture |
| M1 | Playwright Chromium, `modele-fourni-non-supprimable.spec.js` | **1 rouge** : le cas neuf (copie à l'ancienne paire) |
| M2 | idem | **1 rouge** : le cas neuf |
| T1 l'ancien ternaire du profil rétabli | Vitest, `sentinelle-714` (texte 26) | **4 rouges** : par standards, spécifications, dénotation, aucune pratique |
| T2 le registre rend le nom du défaut pour un type inconnu | idem | **1 rouge** : le type inconnu (le premier jet du banc restait vert ici ; le cas manquait, je l'ai ajouté) |

## 4. Mesure a · non remis et non recevable dans la vraie pratique « Par standards »

Mesuré au code, pas au navigateur. Faits :

- La note « Par standards » (`NoteCibles`, `js/pratiques/note-cibles.js` ; branchée par `pratique-configurable.js:209`)
  ne lit que l'ensemble de cibles, l'échelle et les **inscriptions** (`InscriptionsCibles`). Elle ne lit jamais
  `evaluationsSauvegardees`. Aucune ligne de `note-cibles.js`, `inscriptions-cibles.js`, `tableau-cibles.js`,
  `profil-cibles.js` ou `observation-cibles.js` ne lit le statut de remise ni le statut d'intégrité d'une copie
  (grep : zéro hors commentaires).
- Une inscription ne s'écrit que du Tableau des cibles (deux appels « Inscrire un niveau » et un « Inscrire pour une
  production », `tableau-cibles.js:821`, `:899`, `:1113`) ou d'une observation (`observation-cibles.js:465`). Aucun module d'évaluation n'en écrit ni n'en annule.

Ce qui en découle pour la note :

- **Copie non remise** : elle ne change rien à la note par elle-même. Si l'enseignant·e n'inscrit rien pour cette
  production, chaque cible garde son meilleur niveau déjà démontré. Une cible qui n'a encore aucun niveau est « sans
  donnée » : pendant la session, pas de note chiffrée (la liste des cibles en attente) ; à l'arrêt des notes, cette
  cible compte pour 0 %.
- **Copie non recevable** : même chose, le statut n'est pas lu. Un niveau déjà inscrit depuis cette production reste et
  continue de compter, jusqu'à ce que l'enseignant·e l'annule dans le Tableau des cibles (« Annuler une inscription »).
  Rien ne fait sortir automatiquement la copie de la note, contrairement à la famille Hybride.
- **Complétion (C)**, inférence non jouée : « Par standards » est une pratique configurable, et `calculerDetailsCompletion`
  (`pratique-configurable.js:677`) sert toutes les familles configurables. Une non-remise n'y compte pas comme remise ;
  l'avis du texte 34 dit qu'une copie non recevable compte comme non remise. Je ne l'ai pas éprouvé sur une pratique
  « Par standards ».

Aucune phrase d'écran n'est rédigée : Grégoire relira le texte.

## 5. Mesure b · les chaînes d'écran qui restent

Balayage de tous les fichiers chargés par `index.html` (hors `changelog-data.js`, `pack-demo-10.js`, zones protégées),
commentaires et identifiants écartés à la main. Rien corrigé ici.

| Où | Texte actuel | Verdict |
|---|---|---|
| `js/pratiques-gestion.js:130` (ligne de la fiche, de la bibliothèque, de l'aperçu) | « Cumulative (Traditional Grading) - Cumul pondéré des évaluations » | **trouvaille T1** : « traditionnelle » en anglais, hors des mots décidés |
| `js/guides-pedagogiques.js:242-325` | « Comprendre sa pratique sommative », « La pratique sommative classique », « Sommative (code SOM) », « c'est la pratique traditionnelle », « Modalités d'évaluation (PAN et sommative) »… | guides « som » et « pan » : hors lot (décision 3) |
| `js/productions.js:3271`, `:3279` | « Évaluations sommatives », « + Ajouter une évaluation sommative » | au sens du moment (le pendant de « formatives » dans la même liste) : ne change pas |
| `js/pratiques-bibliotheque.js:80` | « Évaluation sommative » (type de travail du modèle de spécifications) | au sens du moment : ne change pas |
| `js/parcours-evaluer.js:757-758`, `:1421-1422` | « la notation cumulative, qu'on appelle aussi sommative » ; « Ici, « sommative » ne parle pas du moment… » | mots décidés le 27 nov. : rien à faire |

Aucune autre chaîne trouvée, y compris sur plusieurs lignes dans `index.html` : tout le reste est en commentaires.

## 6. Mesure c · les bancs mis à jour

**Vitest** (joués, verts dans la suite complète) : `audit-pratique-de-notation-2026-09-05`, `sentinelle-687-materiel-sans-discipline`,
`sentinelle-714-panneau-habiletes-lit-la-note` (plus le bloc neuf du texte 26), `sentinelle-accueil-porte-ortho-et-champ2-846`,
`sentinelle-audit-aide-15-oct-ce-que-fait-l-application`, `sentinelle-comparateur-synthese-recap` (une retouche du 28 nov.
ajoutée à sa liste, la référence d'origine intacte), `sentinelle-copie-non-recevable-affichage-28-oct`,
`sentinelle-familles-cum-hyb-2026-11-27`, `sentinelle-je-regarde-evaluer-2026-11-18` (la retouche du texte 20 appliquée à
la consigne du 18 nov., avec une assertion qu'elle trouve sa ligne), `sentinelle-lot-29-cinq-textes-901-899`,
`sentinelle-modele-fourni-intact`, `sentinelle-modele-par-standards` (l'empreinte M1 se prend sur les modèles où la seule
paire renommée est remise à l'ancienne : elle reste `206ffd2a…`, donc rien d'autre n'a bougé), `sentinelle-note-provisoire-reservee`,
`sentinelle-recit-calcul-c2b-2026-06-07`, `sentinelle-sel-sans-pan-2026-11-21` (le texte G5 du 27 nov., retouché d'un mot
dans le banc ; l'endroit corrigé du profil devient le `nom` de `standards` au registre).
Les fichiers de textes validés des 21 et 27 nov. (`plans de travail/TEXTES-…`) ne sont pas réécrits.

**Playwright** (tournent sous WebKit au Mac, **non joués sous WebKit**) :
- `tests/integration/modele-fourni-non-supprimable.spec.js` : nom courant, et un **cas neuf**, la copie rangée à
  l'ancienne paire (affichée « Modèle cumulatif », sans ⋮ ni « Supprimer », aucune ligne « Modèle sommatif », la base
  garde l'ancienne paire) ;
- `tests/integration/bibliotheque-deux-colonnes-1156.spec.js` et `tests/integration/modele-par-standards.spec.js` : nom courant.
- `tests/integration/pratiques-762-appliquer-au-cours-actif.spec.js` et `tests/unit/sentinelle-762-…` : **non modifiés**.
  Leur « Modèle sommatif » figure une pratique déjà adoptée par Grégoire, c'est-à-dire le stock, qui garde son nom.

Joués ici sous **Chromium** (Playwright 1.60, configuration temporaire retirée ensuite) : ces quatre specs, 30 verts,
2 sautés (les deux bancs de captures, sautés par conception sans leur variable). Chromium n'est pas Safari : le verdict
WebKit reste à prendre au Mac avant la fusion. Le reste de la suite Playwright n'a pas été joué.

## 7. Source ou stock

- **Source** (change pour tout le monde) : les textes ; le nom et la description du modèle fourni ; le nom de la
  pratique cumulative codée et de la prédéfinie `sommative-traditionnelle`.
- **Stock, qui reste chez les gens** :
  - toute pratique déjà créée garde son nom. Chez Grégoire, la pratique adoptée du modèle le 2 sept. (commentaire de
    `pratique-registre.js:373` ; colonne « Dans ce trimestre ») reste « Modèle sommatif ». Dans la fenêtre à deux
    colonnes, elle paraîtra à gauche sous ce nom, à côté de « Modèle cumulatif » à droite. Qu'elle s'y dise liée
    (« Aussi dans ta bibliothèque ») dépend de ce que porte sa copie (`id` ou `idOriginal`) : non mesuré, ses données
    ne sont pas ici ;
  - la copie rangée du modèle (`SOM-litterature`, son iPad) garde ses données, l'ancienne paire comprise ; elle s'affiche
    au nom courant, à la lecture seulement ;
  - un fichier de bibliothèque exporté avant ou après ce lot porte l'ancienne paire tant que la copie n'est pas réécrite.
- **Rien n'est réparé d'office.** Renommer la pratique adoptée ou réécrire la copie rangée, c'est écrire dans ses
  données : à sa décision.

## 8. Trouvailles hors lot

Aucune n'entre au BACKLOG : aucune n'a de symptôme vécu (règle du 24 août). Inscrites ici.

- **T1 · inscrire et continuer.** La ligne de la fiche et de la bibliothèque dit « Cumulative (Traditional Grading) »
  (`js/pratiques-gestion.js:130`, table `FAMILLES_TAXONOMIQUES`). Le mot anglais n'est pas un des mots décidés : à
  Grégoire de dire s'il part.
- **T2 · inscrire et continuer.** Trois tables de noms se contredisent désormais pour trois pratiques sur cinq : le
  registre (« PAN par standards », « PAN par spécifications », « Dénotation »), la fiche (`FAMILLES_TAXONOMIQUES` :
  « Par standards », « PAN-Spécifications », « PAN-Dénotation ») et l'assistant (`TYPE_BADGES` : « PAN – Spécifications »).
  Le champ ajouté au registre suit le mandat ; la réunion des trois est un chantier.
- **T3 · inscrire et continuer.** `js/pratiques.js:308-327` écrit dans `#btnDefautSommative` et `#nomPratiqueDefaut`, absents
  d'`index.html` : code mort (le texte 1 y est posé, sans effet visible ; l'autre branche dit encore « PAN-Standards »).
  À retirer dans un lot de nettoyage.

## 9. Écrans à regarder sous Safari

**Ce ne sont pas des portes dues** (skill `portes-terrain`, règle 2) : rien ici n'est irréversible, et le seul écran qui
touche une donnée (la copie de l'iPad) est éprouvé sous Chromium, mutation comprise. À regarder en usage normal, **après
la fusion et la mise en ligne** : tant que le lot n'est pas sur `main`, `https://app.codexnumeris.org` montre la version
d'avant. Si Cowork veut l'artefact jumeau, c'est à lui de le publier.

0. Ouvrir `https://app.codexnumeris.org`, recharger, lire le numéro en bas de page : ⮕ Attendu : le numéro de la version
   qui porte ce lot (fixé au bump, pas encore connu).
1. **iPad** · Conception › Pratiques › Bibliothèque : ⮕ Attendu : une ligne « Modèle cumulatif », la mention « fourni avec
   l'application », aucun ⋮ « Supprimer ». Avant : « Modèle sommatif ». Si « Supprimer » reparaît sur cette ligne, ne pas
   cliquer, le dire.
2. Même fenêtre, colonne « Dans ce trimestre » : ⮕ Attendu : ta pratique adoptée garde son nom « Modèle sommatif » (le
   stock, voulu ; la renommer reste ta décision).
3. Profil d'un élève d'un groupe en « Par standards » › Développement des habiletés › afficher le détail des calculs :
   ⮕ Attendu : « Pratique de notation active : PAN par standards ». Avant : « Hybride ».
4. Conception › Pratiques, ouvrir une pratique cumulative : ⮕ Attendu : dans « Structure des évaluations », « Évaluations
   habituelles : ».
5. La fenêtre d'aide « Pratiques de notation » : ⮕ Attendu : « Cinq pratiques sont disponibles », et une ligne « Hybride
   (HYB) » sous « Cumulative (CUM) ».
6. Le glossaire : ⮕ Attendu : une entrée « HYB — Hybride » entre « CUM — Cumulative » et « STD — PAN par standards ».

**Ce que je n'ai pas pu vérifier** : Safari et l'iPad (WebKit absent du nuage) ; la copie réelle de l'iPad. Si elle
diffère du modèle par autre chose que l'ancienne paire, elle était déjà « modifiée » avant ce lot et la garde ne la
reconnaîtra pas plus qu'avant : la rangée 1 le montrerait. La mesure a n'est pas jouée au navigateur (§ 4). Les deux
lots Playwright restants ne sont pas joués.

## 10. Verdict WebKit du Mac

**Vert.** Pris le 28 nov. 2026, de 6 h 10 à 8 h 40, sur `6cff76e6`, dans un arbre à part (`../labo-codex-renommage-1128`).
`origin/main` était toujours `574bb60b` au départ et à la fin : rien à réunir. Aucune fusion, aucun bump, aucun changelog,
aucun push sur `main`.

| Mesure | Résultat |
|---|---|
| Vitest complet (depuis `tests/`) | 985 fichiers, 12 702 essais verts, 53 s |
| Playwright WebKit, un worker | 1 953 essais joués : 1 912 verts, 23 verts au second essai, 18 rouges, 65 sautés |
| Les 18 rouges | **18 connus** de `scripts/playwright-baseline.json`, **aucun neuf** (`nouveaux` : 0, `nonJouees` : 0) |
| Jeton du Mac (`scripts/.verdict-playwright.json`) | **vert (code 0) sur `6cff76e6`** |

Par rapport au verdict de la 1.260.0 (`RAPPORT-2026-11-27-verdict-assemblage.md`, 1 952 essais sur `618acdeb`) : un essai
de plus, le cas neuf de `modele-fourni-non-supprimable` ; les mêmes 18 rouges connus ; les trois rouges neufs d'hier,
recalés depuis, sont verts.

**Les quatre specs du lot, sous WebKit** : 30 verts, 2 sautés, aucun vert au second essai. Même compte que sous Chromium (§ 6).

| Spec | Verts | Sautés |
|---|---|---|
| `bibliotheque-deux-colonnes-1156` | 18 | 1 (banc de captures, sans sa variable) |
| `modele-fourni-non-supprimable` (cas neuf compris) | 7 | 0 |
| `modele-par-standards` | 4 | 1 (banc de captures, sans sa variable) |
| `pratiques-762-appliquer-au-cours-actif` | 1 | 0 |

**Comment la passe a été prise.**

- **Outil** : celui qui reprend (`~/Library/Caches/labo-codex-verdict/`, `LABO_RACINE` sur l'arbre à part), 20 morceaux
  par demies, un passage par appel, en avant-plan, et non `npm test` d'un bloc que demandait le mandat : la passe
  Playwright dure 2 h 24 et un appel d'outil est coupé à 10 min. Mêmes essais, même configuration (`workers: 1`), mêmes
  fonctions de jugement, même base, même jeton. Vitest, lui, a été joué par `npm run test:unit`.
- **Sur secteur**, sous `caffeinate`. Le Mac était sur batterie à l'ouverture (68 %) : Vitest a été joué sur batterie,
  Grégoire a branché le Mac avant Playwright (vérifié par `pmset`).
- **Le demi-morceau 13a a été coupé par le chien de garde** à 8 min, comme le 27 nov., sans rapport. Rejoué en deux
  quarts (6 specs, puis 5), même commande ; les deux rapports sont dans la fusion (41 rapports pour 40 demies).
- **Mémoire libre** : de 79 % à 72 %, un creux à 65 % après la coupe de 13a (seuil d'arrêt : 60 %). Aucune garde refusée.
  Aucune autre session ni autre passage de tests vu sur le Mac.
- `tests/node_modules` de cet arbre est un lien vers celui de l'arbre principal, comme dans les autres arbres.

**Les six écrans du § 9 ne sont pas regardés** : je ne peux pas piloter Safari sans le demander à Grégoire. Ils restent
à regarder après la mise en ligne.

**Niveau de version proposé : `patch`.** Le lot ne livre aucune capacité neuve : il finit de poser les mots des familles
livrées en 1.260.0 (35 textes d'écran, une garde, un affichage), aucun calcul ne change, aucune donnée n'est écrite.
Il se consolide dans l'entrée 1.260 des Nouvelles. Si Grégoire veut une entrée de Nouvelles à part, c'est `minor`.
