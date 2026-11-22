# RAPPORT — l'échelle de départ « 0 – Aucun », M1 à M6, parcours 7 et « Nous faisons » du parcours 8 (session du cloud, 22 nov. 2026)

> **Dernier relais.** Branche `claude/relaxed-feynman-0vcwct`, partie de `origin/claude/parcours-apres-par-standards-il5v0i`
> (`a440e7ae`), puis `git merge --no-ff origin/main` (`d0dd7420`, la 1.254.1) : fusion `2389a830`. Consigne :
> `plans de travail/CONSIGNE-2026-11-22-echelle-de-depart-et-parcours-6-7-8.md` (premier commit après la fusion, `51688aac`).
> **LIVRÉ** : 1 (échelle de départ, `1a0474e1`) ; 2 (M1 à M6, ci-dessous) ; 3 (parcours 7, deux temps, `43092286`) ;
> 4.2 (« Nous faisons » du parcours 8, `35b48ddc`). **ARRÊTÉ LÀ, faute de temps** (la consigne : « dis où tu
> t'arrêtes ») : **4.1 (« Je regarde » du parcours 8) NON FAIT** ; **5 (parcours 6) NON FAIT**. Commit « BRANCHE
> SEULEMENT » `43271c71` : parcours 7, 8 et 9 ouverts pour l'aperçu (à annuler avant toute fusion, avec les précédents).
> PR en brouillon : [bedardg71-codexnumeris/labo-codex#54](https://github.com/bedardg71-codexnumeris/labo-codex/pull/54),
> « APERÇU, ne pas fusionner ». **Aperçu Netlify** : https://deploy-preview-54--codexnumeris-051225.netlify.app
> Ni fusion dans `main`, ni release, ni bump, ni changelog.

## 0. La base et la fusion

`origin/main` avait avancé (`78e95229` → `d0dd7420`, deux commits d'anonymisation). Conflits : les jetons `?v=` de
sept lignes d'`index.html` (deux côtés gardés, commentaires réunis, un jeton neuf `20261122q` par fichier) et la ligne
« Dernier ID » de `BACKLOG.md` (deux côtés gardés, celle de `main` en tête). Rien de retiré.

## 1. L'Échelle de départ (IDME) : « 0 – Aucun » en tête

- **Fait, à la source seulement** (`niveauxDefaut`, `js/echelles.js`) : premier niveau `{ code: '0', nom: 'Aucun', min: 0,
  max: 0, valeurCalcul: 0 }`, bâti comme le « 0 » de « IDME et niv 0 » de la démo (ni description ni palier SOLO, comme
  lui) ; « I » commence à 0 %. « PS » n'est plus semé. Les quatre autres : noms, bornes hautes, valeurs, couleurs
  inchangés (épinglé). **Supposé** : la couleur du « 0 » est `--gris-moyen`, celle de l'ancien premier niveau (le « 0 »
  de la démo porte un hex, `#831100`, qui ne suit pas le mode sombre).
- **B1 à B5 posés mot pour mot** : description, carte d'aide (rangée « 0 – Aucun » et, en face, la phrase B2), guide
  SOLO, définition du terme, Cartouche de départ (colonne « 0 », quatre fois « L'évaluation n'est pas possible. » ; les
  quatre commentaires retirés sont au rapport du matin, § B5, et dans `tests/unit/_helpers/echelle-de-depart-27-oct.js`).
  **Décidé seul** (ce ne sont pas des mots d'élève) : dans la carte d'aide, la plage du « 0 » dit « — » (aucun
  pourcentage ne le donne) et celle de « I » dit « 0 à 64,99 % ». La phrase d'avant le tableau (« relie chacun de ses
  niveaux à un palier SOLO ») n'est plus tout à fait vraie pour le « 0 » : non touchée, à relire.
- **1.2, la garde : VERTE.** Aucun calcul modifié : les sept lignes qui écartent le code « 0 » et les deux qui lisent
  « PS » sont épinglées telles quelles (`sentinelle-echelle-de-depart-aucun-1-22-nov.test.js`). La garde des notes
  rejouée (`sentinelle-moteur-cibles-0-garde`, golden masters `sessionC`, exports, anonymisation, document de
  production) : 82 essais verts. Tarir, pas réparer : une échelle et une cartouche de départ semées avant (« PS »)
  ne sont pas réécrites (épinglé en Vitest et en Playwright, le stock rejoué).
- **Un effet hors du semis ? Aucun mesuré.** Mais à savoir : la **vue simple** copie l'échelle de départ du trimestre
  (« Mes niveaux ») ; dans un trimestre neuf, son premier niveau est donc « 0 – Aucun » : le premier toucher d'une case
  du tableau de notation donne « 0 » (avant « PS »), la touche est « 0 ». Et une note de 0 % se lit « 0 » au profil
  (`lireNiveauNoteGlobale`) mais se range en « Incomplet » dans la répartition du Suivi (qui écarte le code « 0 ») ;
  même comportement qu'avec « IDME et niv 0 », calculs inchangés. C'est un effet du semis neuf, pas du stock.
- **1.3, ce que dit « I »** : semé, `description: 'Unistructurel'`, `niveauSOLO: 'unistructurel'`, nom « Incomplet » ;
  dans la démo (« IDME et niv 0 »), nom « Incomplet ou insuffisant », description « Préstructurel, unistructurel », pas
  de `niveauSOLO`. Rien changé : c'est ton mot.
- **1.5** : la bulle 4 du « Nous faisons » du parcours 3 (« Aucun, Incomplet, Développement, Maîtrise, Étendu ») dit
  maintenant les noms semés, dans l'ordre (épinglé). Bancs qui suivent : 9 fichiers Vitest, 6 specs Playwright ; la
  référence épinglée de la vue simple (WebKit) reprise à la main sur deux fragments seulement (diff Chromium base/tête).
- **Les codex de départ (`departs/`)** portent encore « PS » : non refabriqués.

## 2. Mesures M1 à M6 (démo, deuxième groupe, après les modèles 2, 3, 4 ; évaluation D, I, I, I de Tapir Doux par le formulaire ; Chromium, 820 × 1180)

- **Avant l'évaluation** : sur la bande « Performance (P) », Tapir Doux A DÉJÀ un point, gris, tassé à gauche
  (`barre-etudiant-sans-eval`, info-bulle « Doux, Tapir : note non constructible ») ; son P dit « — ».
- **M1** : après l'évaluation (45 %, niveau I), son point est à 19,9 % de la bande, info-bulle « Doux, Tapir : 45 % » ;
  le suivant, Caribou Attentionné, « 49 % », à 28,6 % ; Lémur Rieur « 61 % » à 47,1 %. Il est le plus bas ; l'écart au
  suivant (8,7 % de la largeur) est moindre que celui de Caribou à Lémur. Sous la bande : « Distribution : Incomplet ou
  insuffisant : 3 • En Développement : 4 • Maîtrisé : 1 • Étendu : 1 ».
- **M2** : « Doux, Tapir A 100 % C 100 % P 45 % » ; son P est le plus bas du groupe ; A et C au plus haut (100 %, comme
  sept autres en A et tous en C) ; sa pastille P est colorée (« critique »). Les bandes s'appellent « Assiduité (A) »,
  « Complétion (C) », « Performance (P) ». Filtres : « P < 65 % », « A ou C < 85 % », « Suivi », « RàI 2-3 ».
- **M3** : le P touché ouvre le profil sur « Engagement ACP ». Assiduité : « 100 % • Périodes présentes : 2 / 2 »,
  « 0 absence ou retard », « Assiduité parfaite ! ». Complétion : « 100 % • Productions remises : 1/1 », « 0 production
  non remise ou non recevable », « Toutes les productions sont remises ! ».
- **M4** : carte RàI : **« Niveau 2 - Préventif »** (un trait d'union) ; « Performance globale (P) : — » ; progression :
  Structure D 65 %, Rigueur I 40 %, Plausibilité I 40 %, Nuance I 40 %, **Français écrit : 0 0 %** (critère de la
  grille de dépistage de la démo) ; « Difficulté persistante » ; puis **« Ses derniers résultats sont sous le seuil
  minimal de réussite. La note du cours ne s'affiche pas encore. »** ; **« Défi principal : Nuance »**.
- **M5** : la fiche propose **« Niveau 2 – Préventif, en groupe ciblé »** ; elle coche d'avance **Structure, Rigueur,
  Plausibilité, Nuance** (« — 1/1 en défi »), pas « Français écrit » ; **Tapir Doux est déjà coché**, seul ; la date
  est celle du jour. « Remplir » pose quand même le plan (niveau 3, la rigueur seule).
- **M6** (lu dans le code, `js/interventions.js` et `js/saisie-presences.js` ; **non mesuré à l'écran**) : au passage à
  « Complétée », un dialogue « Marquer cette intervention complétée ? » porte une case **décochée** : « Reporter les
  présences dans la saisie des présences : la présence à cette intervention compensera une absence au cours. » (aide :
  « Le report se fait une seule fois… »). Cochée : pour chaque personne cochée présente, une présence facultative à la
  date de l'intervention, de la durée de l'intervention, note « Intervention RàI : <titre> », ajoutée **seulement s'il
  n'y a aucune présence de cette personne à cette date dans ce cours** ; en rattrapage, les non-participant·es reçoivent
  une absence motivée ; un MIO n'écrit rien. **Inférence** : l'assiduité ne compte que les dates de séances saisies, où
  la personne a déjà sa fiche ; l'ajout y est donc refusé, et ailleurs il ne compte pas : la « compensation » paraît
  sans effet sur l'indice A dans le cas courant. À mesurer.

## 3. Parcours 7, « Lire ta classe et intervenir »

- **« Je regarde »**, huit bulles, mot pour mot. « Remplir » (bulle 1) pose l'évaluation D, I, I, I de Tapir Doux par la
  fonction des sept évaluations de l'exemple (`ParcoursRecevoirModele.evaluationDeLExemple`) : 45 %, niveau I,
  verrouillée, **reliée à sa copie** (l'application relie par la paire DA, production : mesuré). « Remplir » (bulle 6)
  pose le plan du 15 nov. (titre, niveau 3, une période, la rigueur seule, l'objectif, la description en six lignes) ;
  l'intervention créée le porte (mesuré).
- **Les deux lignes à crochets de la bulle 4, telles que posées** (d'après M4, mot pour mot, entre guillemets — les
  guillemets sont de moi, pour marquer les mots de l'écran) : « Elle situe Tapir Doux au « Niveau 2 - Préventif » :
  « Ses derniers résultats sont sous le seuil minimal de réussite. La note du cours ne s'affiche pas encore. ». » et
  « « Défi principal : Nuance ». Le défi, c'est le critère de la grille où ses résultats sont les plus bas. »
- **Refus proposé** (sans le modèle de « Recevoir ») : « Commence par la Modélisation de « Recevoir les productions,
  rendre tes rétroactions » : ce modèle évalue la production de Tapir Doux, qu'on y importe. » ; la pulsation va à la
  Modélisation de « Recevoir ».
- **« Refaire »** (le modèle fait) : retire de la démo l'évaluation de Tapir Doux et ses interventions, rien d'autre,
  puis le modèle repart ; la démo n'est pas remise à neuf (option neuve d'`assistance.js`, `defaireModele`, sans
  question : **supposé**, ce qui part, ce modèle l'avait posé). La démo rouverte est sur son premier groupe : la bulle
  demande le deuxième (règle des modèles).
- **« Nous faisons »**, neuf bulles (huit avec une grille de dépistage désignée, compteur « sur 9 »), mécanique du 9 nov.
  inchangée. Bulle 5 « Puis : » : la phrase du lieu dans Labo › Observation. Bulle 6 après la bulle 5 : « C'est fait :
  ta grille de dépistage est choisie. » et « Tu es revenu·e dans « Suivi », à l'onglet « Profils ». » (moteur : option
  `lieuVerbe`). Bulle 9 : « Voir le parcours 8 », « Terminer », la consigne des deux suites posée par le moteur.
- **Ce qui fait avancer chaque bulle** — « Je regarde » : 1, l'évaluation posée puis « Détails » ; 2, le profil de Tapir
  ouvert (les autres pastilles, et son A et son C, ne répondent pas) ; 3, l'onglet « Accompagnement » ; 4, « Continuer » ;
  5, la fiche neuve ouverte ; 6, l'intervention créée (la fiche refermée ramène à 5) ; 7, « Continuer » (le statut ne
  répond pas) ; 8, les trois suites. « Nous faisons » : comme le 9 nov. (« Détails », un profil ouvert, « Accompagnement »,
  « Continuer », la grille choisie, la fiche neuve, l'intervention créée, « Continuer », « Terminer »).
- **Les zones fléchées** : les bulles en lignes ne fléchaient pas leurs zones ; chaque bulle les déclare (`fleches`), et
  les gestes de la fiche désignent leurs champs. Les bulles à phrase du lieu amènent ce qu'elles montrent (`amener`).

## 4. Parcours 8, « Automatiser tes commentaires »

- **4.2, « Nous faisons » : FAIT**, dix bulles mot pour mot, la variante sans fichier ; « Tes cas » et « Ce que
  l'étudiant·e lit » deviennent les deux formes de la bulle 5 (« Continuer » change la forme). **Supposé** : la variante,
  que la consigne ne titre pas, prend le titre de la bulle 9. Les confirmations ne se disent que si l'étape d'avant, sur
  le chemin, est celle qu'elles nomment (une bulle 6 ou 7 sautée n'en fait pas dire une fausse).
- **Le banc du 9 nov. suit le compte et les titres ; il reste ROUGE** (5 sur 16, 5 sautés) : la première bulle, plus
  longue (objectif, lieu, cinq explications), couvre « + Nouvelle grille » à 1180 × 820 (le clic est intercepté) et la
  flèche vers la rangée du menu n'est pas posée ; la pulsation sur « Actions » de la bulle 8 manquait (`amener` ajouté
  depuis, **non rejoué**). **Non corrigé** : c'est le premier chantier à reprendre.
- **4.1, « Je regarde » : NON FAIT.** Deux mesures faites pour lui :
  - **La grille : ajout direct, pas de copie** (ce qui l'a décidé, mesuré) : après l'ajout de « Français écrit »
    (algorithmique, 20) et les quatre autres à 16, 24, 12, 28, les neuf évaluations de la production gardent leurs
    notes stockées ; la Liste, les indices P, les moyennes par critère et le PDF (`construireFeedback`, qui lit les
    pondérations stockées 20/30/15/35) ne changent pas. Seule trace : **une évaluation existante rouverte montre la
    grille courante** (« Structure (16 %) », « Français écrit » vide, l'avis « La cartouche n'a pas de commentaires pour
    « Français écrit » »), **sa note inchangée** (les nouvelles pondérations sont exactement 80 % des anciennes). Une
    copie mettrait deux « Grille générale à 4 critères » dans le menu, contre la bulle 1. À trancher par toi si cette
    consultation te gêne.
  - **Le nombre de mots** : **pas compté**. Le PDF d'Antilope Vaillante (`js/materiel-copies-deux-rives.js`) est une
    image sans couche texte (`pdftotext` : 0 mot) ; il faut le texte source de « Deux-Rives » ou une OCR.
  - Pour un critère neuf nommé « Français écrit », l'application ne préremplit pas les quatre formes (`nomsManquants`) :
    le « Remplir » de la bulle 2 resterait.

## 5. Parcours 6 : NON FAIT

## 6. Tests

- **Vitest complet**, arbre final : 951 fichiers, **12 296 essais verts** (après le renommage d'un paramètre `cle` qui
  masquait `cle()`, cliquet #642). Rouges rencontrés en chemin et réglés : les 17 nés du point 1 ; le cliquet des
  pauses (mon harnais en avait ajouté une) ; le cliquet `indexOf`.
- **Playwright Chromium** : `echelle-de-depart-aucun-2026-11-22` 2/2 ; `echelle-depart-prestructurel-1152` 2/2 (le
  stock) ; `vue-simple` 52/52 ; `niveau-sans-seuils` 5/5 ; `nous-faisons-recevoir` 4/4 ; `triptyque`, `tableau-de-
  notation-1`, `depistage-542` verts ; `je-regarde-lire-ta-classe-2026-11-22` **3/3** (A, B aux deux tailles, avec le
  confinement et « Refaire ») ; `parcours-7-lire-ta-classe` **8/8** (les mots, 1180 × 820 et 820 × 1180) ;
  `parcours-8-commentaires` **rouge** (§ 4).
- **Rouges déjà là sur la base** (`51688aac`, vérifiés sur son arbre) : `parcours-4-recevoir-et-rendre`, 2 essais (la
  bulle couvre `.pipeline-col-confirmes`) ; `vue-simple-modeles-actuels-epingles`, 2 essais sous Chromium (référence
  WebKit). Un écart du relevé de la bulle au modèle 4 (« Importe-les », 820 × 1180), une fois sur deux, hors du lot.
- **Break-tests** (tous rétablis) : point 1, « I » remis à 40 % → sentinelle rouge ; `['0', 'PS', 'I']` au tableau de
  bord → rouge ; un mot de B3 → rouge. Parcours 7 : un mot de la bulle 3 → sentinelle rouge ; l'évaluation de Tapir
  écrite aussi hors de la démo → banc rouge (« aucune autre clé hors de la démo », la clé nommée).
- **Harnais neufs** : `trois-modeles-de-banc.js` (les modèles 2, 3, 4 en moins d'une minute), `bulle-du-22-nov.js`
  (lire une bulle entière), `consigne-2026-11-22-parcours.js` (les bulles lues dans la consigne). Le relevé des
  ouvertures accepte le geste principal des bulles en lignes (il n'attendait que l'ancienne ligne du geste).

## 7. Les mots qui ne tiennent pas à l'écran (codés tels quels)

- P7 « Je regarde », bulle 1 : « Tapir Doux t'a remis sa production, mais elle n'est pas encore évaluée : il n'a pas de
  point sur cette bande. » — il en a un, gris, tassé à gauche, « note non constructible » (M1).
- P7 « Je regarde », bulle 1, seconde forme : « son point vient d'apparaître, à l'écart des autres » — il se déplace
  plutôt qu'il n'apparaît ; il est le plus bas, à 45 % contre 49 % pour le suivant.
- P7 « Je regarde », bulle 4 : « Le défi, c'est le critère de la grille où ses résultats sont les plus bas. » — Rigueur,
  Plausibilité et Nuance sont à égalité (I, 40 %), « Défi principal : Nuance », et « Français écrit : 0 0 % » est plus
  bas sans être retenu. Le plan, lui, cible la rigueur.
- P7 « Je regarde », bulle 4 : la carte dit « Niveau 2 - Préventif » ; le plan est au niveau 3 (la bulle 6 dit bien que
  le niveau d'une intervention, c'est toi qui le choisis).
- P7 « Nous faisons », bulle 8 : « c'est toi qui décides si la présence à l'intervention compense une absence au cours »
  — d'après le code (M6), la compensation paraît sans effet sur l'indice A dans le cas courant (inférence).

## 8. Ce qui n'est pas vérifié

Safari et l'iPad (porte terrain : `PORTE-2026-11-22-echelle-de-depart-et-parcours-7-8.md`) ; WebKit ; M6 à l'écran ; le
« Je regarde » du parcours 8 et le parcours 6 (non faits) ; le banc du parcours 8 après `amener`.

## 9. Trouvailles, et leur issue

1. **Ouvrir le profil d'un·e étudiant·e de la démo écrit hors de la démo** la clé globale `jetonsEtudiants` (une entrée
   vide pour son DA ; `obtenirStatutJetonsEtudiant` → `initialiserJetonsEtudiant`, `js/evaluation-jetons.js`). Code
   étranger, sans conséquence observable autre que cette entrée. **Inscrire et continuer** (pas au BACKLOG : aucun
   symptôme vécu) ; le banc du parcours 7 la tolère nommément, à sa valeur exacte.
2. **« Le refaire avec ma classe »** (fin du « Je regarde » du parcours 7), lancé dans la démo : le refus du code dit
   « quitte la démonstration pour le commencer » ; les autres parcours referment la démo d'eux-mêmes. Refus du code
   gardé (consigne). **Inscrire et continuer.**
3. **M6, la compensation des présences** (§ 2) : à mesurer avant d'en parler aux enseignant·es. **Inscrire.**
4. **0 % au profil « 0 », dans la répartition « Incomplet »** avec une échelle qui a un « 0 » (§ 1). **Commenter et
   oublier** (épinglé dans `niveau-sans-seuils.spec.js`).
5. **Le relevé des ouvertures ne jugeait rien** dans les bancs qui ouvrent un espace vide (sa clé de `sessionStorage`
   reste vide) : il ne jugeait en fait que le vieux banc du parcours 7. **Inscrire et continuer.**
