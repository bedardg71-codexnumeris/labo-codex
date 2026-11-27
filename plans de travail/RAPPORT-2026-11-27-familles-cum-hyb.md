# Rapport : trois familles de pratiques à l'écran, PAN, CUM, HYB (27 novembre 2026)

Branche `lot/familles-cum-hyb-2026-11-27`, partie de `lot/file-sans-gregoire-2026-11-27` à `951de3f8`. **Aucune fusion vers `main`, aucun bump, rien au changelog.** Affichage seulement : aucun calcul, aucun identifiant, aucune donnée ne change (`SOM`, `STD`, les ids `sommative`, `standards`, les classes CSS et les couleurs restent). Les textes 1 à 28 du mandat sont posés mot pour mot ; les mots neufs vivent aussi dans `plans de travail/TEXTES-2026-11-27-familles-cum-hyb.md`, le point unique à corriger si tu en changes un avant la fusion.

**Reste** : ta décision sur « Modèle sommatif » (section 2) ; « Hybride (démo) », à poser dans le push de la release (section 2) ; le regard sous Safari (section 6) ; le verdict Playwright WebKit du Mac (ici, Chromium seulement) ; la fusion.

**Source, pas stock** : une pratique déjà créée chez quelqu'un garde le nom qu'elle porte (« Sommative traditionnelle », « Par sélection de productions »). Seuls les badges, les menus et les libellés de famille, calculés à l'affichage, changent chez tout le monde. C'est assumé, et dit dans la ligne de Nouvelles (« Une pratique que tu as déjà créée garde son nom. »).

## 1. Ce qui est fait

**Le registre** (`js/pratiques/pratique-registre.js`, `REPRESENTATIONS_PRATIQUES`) : `sommative` → sigle `CUM`, famille « Cumulative » ; `standards` → sigle `HYB`, famille « Hybride » ; `specifications`, `denotation`, `cibles` → famille « PAN » (sigles SPE, DEN, STD inchangés). Le code interne ne bouge pas.

**Qui lit `famille` (mesuré, comme demandé)** : un seul écran. `_nomPratique` du Comparateur (`js/comparateur-pratiques.js:266`) s'en sert en dernier repli, pour une pratique sans nom ni instance : il dira « Cumulative » ou « Hybride » au lieu de « Sommative » ou « PAN ». `obtenirLabelFamille()` des quatre classes de pratique n'a aucun appelant. Les autres `famille` du code (`ctx.famille` du tableau, `recit.famille`, `designation.famille`) sont des codes internes, sans lien avec ce champ.

**Les textes** : 1 à 13, 15 à 28 posés tels quels. Le 14 l'est pour deux noms sur quatre (section 2). Quatre précisions :
- **Textes 3 et 5** : les cartes des lignes 230 et 231 sont sur l'écran « Choisis directement ta famille » (la voie rapide), pas sur « Décrire ma pratique ». Le mandat dit « Décrire ma pratique », ses numéros de ligne désignent la voie rapide : j'ai suivi les numéros. « Décrire ma pratique » ne nomme aucune famille.
- **Texte 26** : « la ligne suivante » existe sous deux formes, « Je regarde » (ligne 1323) et « Nous faisons » (ligne 682, plus courte, sans « (en fin d'apprentissage…) »). Les deux portent maintenant ton texte entier.
- **Les insécables d'origine sont gardés** (« ex.&nbsp;: I-D-M-E » dans la description de l'hybride, les `&nbsp;` d'`index.html`).
- **Texte 23** : il n'existe aucune entrée « SEL » au glossaire. Je n'en ai pas créé d'entrée « HYB ».

**Décidé seul (technique), et posé** :
- **Le libellé du mode deux blocs (texte 12) est porté partout où ce mode se nomme**, pas seulement dans `index.html:5781` : l'assistant (le menu, `js/wizard-pratique-v2.js:717`, son aide, `:721`, et le récapitulatif, `:2367`), le glossaire (`js/accompagnement-contenu-terme.js:80` et `:609`) et l'Aide (`index.html:10317`, et deux mentions de `:10355`, « en « Deux blocs » » et « En deux blocs, une obligatoire »). Sans ces lignes, l'écran citait un choix « Hybride » qui n'existe plus au menu. L'aide de l'assistant dit maintenant : « Deux blocs : combine les N meilleures productions… ».
- **Trois noms de pratique hors de la liste, même règle que le texte 18** : le nom d'instance de la pratique codée sommative (« Cumulative traditionnelle », `js/pratiques/pratique-sommative.js:45`, lu par l'export et le récit), le nom d'instance hybride (« Hybride », `js/pratiques/pratique-pan-standards.js:86`, mandat 18) et la note de l'Exploration des pratiques (« surtout « Hybride » », `js/comparateur-pratiques.js:69`).
- **Une bulle hors de la liste, même règle que le texte 19** : l'étape « Approche » de l'assistant, « En pratique hybride, la note se construit sur le portfolio ; … » (`js/accompagnement-contenu-hover.js:481`).
- **`js/pratiques.js:325`** dit « Cumulative traditionnelle » ; l'élément qu'il remplit (`#nomPratiqueDefaut`) n'existe pas dans `index.html` : code sans effet observable, laissé tel quel (issue 3).

**Ce qui suit tout seul, sans ligne écrite** : tout badge produit par `sigleDuCode` ou `genererBadgePratiqueHTML` (fiche, bibliothèque, Comparateur, badge global de `main.js`, « Partir d'un modèle » via `TYPE_BADGES`), la colonne « Pratique (code) » de l'export des résultats (CUM, HYB), l'étape « Méthode » de la chaîne de la pratique (elle lit le texte du menu « Type »), et le nom de famille de la bibliothèque (« Cumulative · fourni avec l'application »).

## 2. Arrêté sur un nom : « Modèle sommatif » (texte 14)

**« Modèle sommatif » n'est pas renommé, ni sa description (« Pour débuter avec une pratique sommative »). Ta décision.**

Mesure : `estModeleFourniIntact` (`js/pratiques-bibliotheque.js:309`) compare, champ par champ, la copie rangée chez quelqu'un sous l'id `SOM-litterature` au modèle fourni, `nom` et `description` compris. Renommer le modèle rend « pas intacte » toute copie déjà rangée, dont celle de ton iPad (le bug du 22 nov.) : « Supprimer » reviendrait sur une ligne qui réapparaît à la lecture. Le renommage casse donc une reconnaissance : arrêt, comme le mandat le prévoyait. Une nouvelle sentinelle fige ce maintien et sa raison.

Deux voies, que je ne tranche pas :
1. garder « Modèle sommatif » (le nom d'un modèle, pas d'une famille) ;
2. le renommer **et** apprendre à `estModeleFourniIntact` à tenir l'ancien nom pour intact (un lot à part, qui touche une garde de suppression).

Posés : « Cumulative traditionnelle » et « Cumulative avec remplacement » (`js/pratiques/pratiques-predefines.js`, lus seulement par une migration qui ne regarde que les clés : aucun écran ne les montre).

**« Hybride (démo) » : prêt, mais RETIRÉ du lot, à poser dans le push de la release.** Le renommage ne casse aucune reconnaissance (la démo se reconnaît partout par l'id `demo-std-litt`, jamais par son nom), mais `js/pack-demo-10.js` se sert sous le jeton du **build** : la sentinelle #825 refuse au pre-push tout commit qui le touche sans release dans le même push (une URL immuable servirait deux contenus). Le mandat interdit le bump : je n'ai pas contourné le hook. La ligne à changer, au moment de la release : `js/pack-demo-10.js:7422`, `"nom": "Par sélection de productions (démo)"` devient `"nom": "Hybride (démo)"` ; puis remettre « Hybride (démo) » dans `tests/integration/bibliotheque-deux-colonnes-1156.spec.js` (six noms et la confirmation de suppression), retirer l'exception de la démo dans `sentinelle-sel-sans-pan-2026-11-21` (C) et dans `sentinelle-familles-cum-hyb-2026-11-27` (D). D'ici là, la démo montre une pratique nommée « Par sélection de productions (démo) », de famille « Hybride » (badge HYB).

## 3. Mesures demandées (section D)

**⛔ Un texte que l'élève reçoit nomme-t-il la pratique ? Non (mesuré).** `pratique: 'Par sélection de productions'` (`js/profil-etudiant-actions.js:509`, `:708`, maintenant « Hybride ») ne sort pas du profil : il s'affiche à l'enseignant·e sous la note, seulement quand la pratique n'a pas de nom (`js/profil-etudiant-sections-affichage.js:2914`, `:3065`, `:3121`). Le PDF de rétroaction lit `details.portfolio` (`js/synthese-retroaction-data.js:1438`), jamais `details.pratique`, et ne nomme aucune pratique ni famille. Aucun mot lu par les élèves n'a changé.

**⚠ Une clé qui ressemble à un libellé, laissée intacte** : `'hybride (catégories)'` (`js/profil-etudiant-actions.js:621`) est lu par le PDF pour reconnaître le mode deux blocs (`js/synthese-retroaction-data.js:1450`, `indexOf('hybride')`). Il ne change pas.

**`indices.pratique === 'PAN'`** (`js/profil-etudiant-sections-affichage.js:3980`, `js/indices.js:526`) : valeur interne, inchangée ; seul le libellé affiché change (« Hybride » ou « Cumulative »).

**Trouvaille (code d'avant, inscrite ici, pas au BACKLOG faute de symptôme vécu)** : cette ligne `:3980` affiche « Hybride » pour **toute** pratique non cumulative (spécifications, dénotation, par standards), puisque `indices.pratique` vaut « PAN » pour elles toutes. Elle affichait de même « Par sélection de productions » avant ce lot. Visible dans le profil, carte « Méthodologie de calcul » (repliée par défaut).

**Les autres écrans** : Comparateur et Exploration des pratiques (badges et menus par le sigle, la note de la ligne 69, le repli de `_nomPratique`) ; export des résultats (sigle) ; tableau de bord (aucun nom ni sigle de famille, mesuré) ; guides (prose, section 5).

## 4. Les essais

**Neuf** : `tests/unit/sentinelle-familles-cum-hyb-2026-11-27.test.js` (11 essais) : le registre (code, sigle, famille des cinq pratiques, badge, couleur), l'assistant, la fiche, la bibliothèque, la vue simple, les pratiques fournies, le maintien de « Modèle sommatif », et aucun fichier chargé par `index.html` qui écrive encore « Par sélection de productions » hors commentaires (les Nouvelles passées mises à part). **Break-test** : lancé avant tout changement de `js/`, 9 rouges sur 10 (seul « les codes internes restent » était vert, comme voulu). Après : six mutations (le sigle HYB, la famille « Hybride », le mode « Deux blocs », « Modèle sommatif », un titre de l'Aide, une bulle du parcours), chacune rouge là où elle doit l'être, chaque fichier restauré à l'identique (sha256) ; journal en fin de fichier.

**Aide neuve aux bancs** : `tests/unit/_helpers/familles-cum-hyb-2026-11-27.js` porte les retouches du parcours (textes 26 à 28), appliquées par les deux sentinelles du parcours à leurs consignes d'origine (18, 20 et 22 nov.), restées intactes ; chaque retouche doit trouver sa ligne. Le fichier `TEXTES-2026-11-27-familles-cum-hyb.md` remplace de même, pour ses repères seulement, ceux des 20, 21 et 22 nov., intacts.

**Essais existants mis aux nouveaux mots** (Vitest) : `representation-pratiques`, `sentinelle-fold-pan-objectifs-sessionC`, `sentinelle-sigles-sel-std-2026-11-21`, `sentinelle-sel-sans-pan-2026-11-21`, `sentinelle-renommage-selection-productions`, `sentinelle-standards-sans-portfolio`, `sentinelle-comparateur-synthese-recap` (la référence d'avant reste ; les seuls mots du jour lui sont appliqués, et rien d'autre ne doit différer), `sentinelle-aide-2026-10-28-lot-4`, `sentinelle-je-regarde-evaluer-2026-11-18`, `sentinelle-parcours-evaluer-2026-11-09`, `sentinelle-modele-par-standards`, `sentinelle-par-standards-vue-simple`, `sentinelle-canonisation-production-2026-05-31`, `sentinelle-diagnostic-note-non-calculable-2026-05-31`, `sentinelle-recit-calcul-c2b-2026-06-07`, `sentinelle-reunification-std-394`, `sentinelle-textes-relus-15-oct`, `sentinelle-note-indicateurs-acp-310`, `sentinelle-note-provisoire-reservee`, `tableau-notation-1`.

**Playwright, mis à jour (joués sous Chromium seulement, voir le verdict en fin de rapport)** : `bibliotheque-deux-colonnes-1156`, `chaines-etapes-1149-lot-3b`, `je-regarde-evaluer-2026-11-18`, `modele-fourni-non-supprimable`, `modele-par-standards`, `standards-sans-portfolio-lot-1`, `standards-sans-portfolio-lot-3`, `vue-simple`, `vue-simple-modeles-actuels-epingles` et sa référence `harness/vue-simple-modeles-actuels.reference.json` (six fragments reportés à la main, chacun un mot du lot ; la référence est WebKit, son verdict est celui du Mac).

**Vitest** : voir la ligne de verdict en fin de rapport.

## 5. Ce qui reste en prose pour le second lot (hors périmètre, non touché)

Le mot « sommative » au sens de la pratique, ou « hybride » au sens du mode, dans une phrase :
- `js/accompagnement-contenu-hover.js:119` : « moyenne sommative traditionnelle ou pratique alternative ».
- `js/accompagnement-contenu-popup.js:245`, `:249` : « Quatre pratiques sont disponibles », « Les quatre pratiques », qui n'en listent que quatre, sans l'hybride ; l'entrée « PAN par standards (STD) » y décrit encore l'ancienne pratique (défaut d'avant ce lot).
- `js/accompagnement-contenu-popup.js:1162` : « Sommative traditionnelle : la VALEUR PONCTUELLE… » ; `:1628`, `:1635` : « sommative ou portfolio », « sommative classique ».
- `js/accompagnement-contenu-terme.js:470` et suivantes : la définition de « STD — PAN par standards » décrit l'ancienne pratique (défaut d'avant ce lot) ; `:609` : « (pratique sommative) ».
- `js/accueil.js:193` : « sommative ou alternative » (fichier de la branche `lot/accueil-2026-11-27` : non touché exprès).
- `js/evaluation-sauvegarde.js:582` : « 0 en sommative ».
- `js/profil-etudiant-helpers.js:655` : « La pratique sommative établit la note globale… ».
- `js/profil-etudiant-sections-affichage.js:3629` : « (calcul de type sommative) ».
- `js/guides-pedagogiques.js:140`, `:242`, `:248`, `:250`, `:251`, `:258`, `:289`, `:295`, `:319`, `:324` (« Sommative (code SOM) »), `:325` : le guide (ses boutons sont retirés depuis le 21 nov.).
- `index.html:5726` : « (pratique sommative) » ; `:10827` : « en sommative » et « en standards hybride » ; `:10835` : « en sommative » ; `:10837` : « en mode hybride » ; `:11553` : « En sommative ».

Le calcul à deux blocs (troisième lot) n'est pas touché.

## 6. Les écrans à regarder sous Safari (Mac, puis iPad)

1. **Conception › Pratiques de notation** : le menu « Type » (« Cumulative », « Hybride ») ; la carte « Note » (CUM, HYB) ; l'encadré de la configuration (« Hybride : … ») ; le menu « Mode de sélection » (« Deux blocs (N meilleures + Obligatoires) ») ; les badges CUM (orange) et HYB (sarcelle) et leurs bulles ; l'étape « Méthode » de la chaîne.
2. **L'assistant** : la voie rapide (« Je sais déjà ce que je veux » : « (CUM, HYB ou PAN : STD, SPE, DEN) », puis les cartes « Cumulative (CUM) », « Hybride (HYB) ») ; « Partir d'un modèle » (« N meilleures évaluations HYB · Général », « Modèle sommatif CUM · Général ») ; le récapitulatif (badge, nom, description, « Configuration – Hybride », « Construction de la note : Deux blocs… »).
3. **La bibliothèque des pratiques** : « Cumulative · fourni avec l'application », « Hybride » ; l'aperçu.
4. **La vue simple** : la carte « Ta pratique » de l'accueil ; le modèle « Hybride » ; une pratique créée là s'appelle « Hybride ».
5. **Le profil d'un·e élève** : la note non calculée d'une pratique hybride mal réglée (« Pratique hybride, mais… ») ; « Méthodologie de calcul ».
6. **L'Aide** (Conception) : « Cumulative », « Hybride », et le paragraphe « Hybride. … en « Deux blocs » … ».
7. **Le parcours « Évaluer une première production »**, bulles 1 et 2, dans ses deux temps.
8. **Labo › Comparateur** : les menus des colonnes (« CUM · … », « HYB · … »), l'en-tête du CSV.
9. **La démo** : sa pratique garde « Par sélection de productions (démo) » (renommage à la release) ; sa famille dit « Hybride », son badge HYB.

## 7. La ligne de Nouvelles (pour la release, PAS au changelog)

> Les pratiques se rangent maintenant en trois familles : cumulative (CUM), hybride (HYB) et alternatives (PAN : STD, SPE, DEN). « Sommative » s'appelle « Cumulative » et « Par sélection de productions » s'appelle « Hybride ». Seuls les noms changent : tes pratiques, tes réglages et tes notes restent les mêmes. Une pratique que tu as déjà créée garde son nom.

Elle reste juste même si tu gardes « Modèle sommatif » (c'est le nom d'un modèle, pas d'une famille).

## 8. Fichiers partagés avec les trois autres branches du jour

Mesuré contre `951de3f8` :
- **`index.html`** : avec les trois (`lot/accueil-2026-11-27`, `lot/suivi-2026-11-27`, `claude/hopeful-edison-9kv6o0`). Mes changements : des textes de la fiche, de l'Aide et des jetons `?v=20261126h` (lettre libre sur les quatre branches) ; un conflit est attendu sur les lignes `<script>` que deux branches ont touchées, à résoudre en gardant le jeton le plus récent.
- **`js/accompagnement-contenu-popup.js`** et **`js/profil-etudiant-sections-affichage.js`** : avec `lot/suivi-2026-11-27`, à des lignes différentes (popup : mes 251 et 259, ses 739 et 749 ; profil : ma 3980, ses 3568-3575).
- **`BACKLOG.md`** : non touché par ce lot.
- Aucun autre fichier en commun.

## Verdict Vitest

Depuis `tests/` : **965 fichiers, 12 491 essais, 0 rouge** (`npx vitest run`), puis, après la dernière retouche (le glossaire, ligne 609), les 18 fichiers qui lisent le glossaire : 291 verts. 
**Playwright sous Chromium (un indice, pas le verdict Safari)**, les bancs touchés par le lot, un fichier à la fois : `chaines-etapes-1149-lot-3b`, `modele-par-standards`, `standards-sans-portfolio-lot-3` (15 verts, 2 captures sautées) ; `je-regarde-evaluer-2026-11-18`, `modele-fourni-non-supprimable`, `bibliotheque-deux-colonnes-1156`, `standards-sans-portfolio-lot-1` (29 verts, 1 rouge ; après le retrait de « Hybride (démo) », les six essais « pratiques » de `bibliotheque-deux-colonnes-1156` rejoués : 6 verts) ; `vue-simple` (61 verts). **Le rouge** (`bibliotheque-deux-colonnes-1156`, « productions : « Tout garder dans ma bibliothèque » … », ligne 218) rougit à l'identique sur la base `951de3f8` sous Chromium : il ne vient pas de ce lot, et il porte sur les productions. Non joués : `vue-simple-modeles-actuels-epingles` (sa référence est WebKit, il rougit aussi sur la base sous Chromium). **Le verdict WebKit reste à prendre sur le Mac.**
