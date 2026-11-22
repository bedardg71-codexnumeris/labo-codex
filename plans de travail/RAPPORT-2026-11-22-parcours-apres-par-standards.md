# RAPPORT — les parcours après « Par standards » : quatre phrases, « 0 – Aucun », deux mesures (session du cloud, 22 nov. 2026)

> **Dernier relais.** Branche `claude/parcours-apres-par-standards-il5v0i`, partie de
> `origin/claude/essai-parcours-20-nov-k85n8g` (`c5ab529a`), puis `git merge --no-ff origin/main` (`78e95229`, la
> 1.254.0) : fusion `2113d270`. **LIVRÉ** : A1 à A4 (mot pour mot) ; le banc juge le récapitulatif (A3 : il dit bien
> « Par sélection de productions », sigle SEL) ; un correctif né de la fusion (la bulle 2 de « Je regarde » couvrait
> « Suivant → » à 1180 × 820, § A.3). **NON FAIT, EXPRÈS : B en entier** : la garde B0 s'est déclenchée (§ B0 : le
> niveau se reconnaît par son code, « 0 » est écarté par code de cinq autres calculs, et l'identité de l'échelle n'est
> pas fiable aux deux endroits nommés). **MESURÉ** : C1 et C2 (§ C). Vitest complet et bancs Playwright : § D. Ni
> fusion dans `main`, ni release, ni bump, ni changelog. **À annuler avant toute fusion** : les commits « BRANCHE
> SEULEMENT » hérités de l'aperçu (parcours ouverts, `js/assistance.js`, `PARCOURS_OUVERTS`).
> Consigne : `plans de travail/CONSIGNE-2026-11-22-parcours-apres-par-standards.md` (premier commit après la fusion,
> `28331f74`, mot pour mot). PR en brouillon n° 53, « APERÇU, ne pas fusionner ».
> **Aperçu Netlify** : https://deploy-preview-53--codexnumeris-051225.netlify.app

## 0. La base et la fusion

- `origin/claude/essai-parcours-20-nov-k85n8g` = `c5ab529a` ; `origin/main` = `78e95229`. Fusion `--no-ff` : `2113d270`.
- **Deux fichiers en conflit, tranchés en gardant les deux côtés** (même règle que le 20 nov.) :
  - `index.html` : cinq blocs, tous des lignes de jetons `?v=` (`styles.css`, `js/productions.js`, `js/cartouches.js`,
    `js/materiel.js`, `js/export-pdf.js`, et le bloc des parcours). Une ligne par fichier (doublée, le fichier serait
    chargé deux fois) : chaque ligne garde le commentaire de la branche, précédé des notes de `main` qu'il n'avait pas,
    et reçoit un jeton neuf `20261122p` (lettre jamais servie pour ces fichiers, lue dans l'historique de git). Les
    lignes identiques des deux côtés sont gardées telles quelles ; `js/parcours-recevoir-modele.js` (branche seule)
    aussi.
  - `js/parcours-evaluer.js` : un commentaire (le modèle de l'assistant) ; gardé celui de `main`, qui contient celui
    de la branche et dit en plus le nom de la vue simple.
  - `BACKLOG.md` : **pas de conflit** (la consigne en attendait un) ; git a fusionné seul #1302 et la case cochée de
    #1164 venues de `main`. Rien de retiré.
- **Après la fusion, un rouge Vitest** : la sentinelle anti-cache juge depuis la release de `main` (build `1122`) ;
  neuf fichiers changés par la branche sans conflit gardaient un jeton du 19 nov. Ils reçoivent `20261122p`
  (`6ee5c75b`). Le crochet de pré-envoi bloquait le premier envoi pour cette raison.

## A. Parcours 3 : les quatre phrases

### A.1 Fait (`js/parcours-evaluer.js`, `cf376b8e`)

- **A1**, dans les deux temps : « Je regarde » (`TEXTES.etape2.lignes[1]`, sans point final, comme les autres lignes de
  ce temps) et « Nous faisons » (`NOUS.bulle2.modele.choix`, avec son point).
- **A2**, **A3** (la ligne du récapitulatif, `TEXTES.etape2.devient.lignes[0]`), **A4** (`TEXTES.etape3.lignes[0]`).
- Les textes sont ceux de la consigne, octet pour octet : les deux sentinelles du parcours 3 les lisent DANS la
  consigne du 22 nov. (`tests/unit/_helpers/parcours-apres-par-standards-2026-11-22.js` y prend ce que chaque repère
  remplace et par quoi, autour de « devient : »). Les consignes du 18 et du 20 nov. restent la source du reste ; chaque
  retouche doit trouver sa ligne, sinon la sentinelle rougit.
- Le parcours 9 n'est pas touché.

### A.2 A3 jugé au banc : le récapitulatif dit ces mots

`tests/integration/je-regarde-evaluer-2026-11-18.spec.js`, étape 2.5 : pour « N meilleures évaluations », le
récapitulatif affiche **« Par sélection de productions »** (`.wizard-v2-recap-badge-label`) et le sigle **« SEL »**
(`.wizard-v2-recap-badge`). Vert aux deux tailles. L'ancien essai (« PAN – Standards ») est retiré du banc. La bulle
dit donc ce que l'écran affiche.

### A.3 Le correctif né de la fusion : la bulle 2 de « Je regarde » couvrait « Suivant → » (`4ed473eb`)

- **Mesuré.** Après la fusion, le banc du modèle rougissait à 1180 × 820 (pas à 820 × 1180) : le toucher de « Suivant → »
  tombait sur la bulle. Vert sur la base (`c5ab529a`), rouge juste après la fusion (`6ee5c75b`), avant toute retouche
  de texte : la cause est la sixième carte, « Modèle par standards ».
- **La cause.** À cette étape, la bulle évitait les six cartes et les trois boutons, tous au poids du contour
  (`POIDS_CONTOUR`). Avec six cartes qui remplissent la hauteur de la fenêtre défilée, le moindre recouvrement
  tombait sur « Suivant → ».
- **Le correctif.** L'étape 2 du modèle évite ce qu'elle fait toucher : la carte de l'exemple, « Suivant → », « Créer
  la pratique » (`aussiEviterAuChoixDuModele`). C'est la règle déjà prise le 18 nov. pour la question de l'échelle. Au
  récapitulatif, rien ne change. « Nous faisons » n'est pas touché (ses bancs étaient verts aux deux tailles).
- **Issue 1** (« corriger maintenant ») : ça cassait le parcours que l'aperçu livre, sur l'iPad couché.
- **Supposé** : la bulle peut maintenant couvrir d'autres cartes que celle de l'exemple ; en « Je regarde », la
  personne n'a que celle-là à toucher.

## B. « 0 – Aucun » : NON FAIT, la garde B0 s'est déclenchée

**Rien de B n'est écrit** : ni B1 à B5, ni les bancs qui citent « PS ». Aucun compte existant n'a bougé.

### B0.1 Comment les deux calculs reconnaissent le niveau : par son CODE

- **Tableau de bord** (`js/tableau-bord-apercu.js`, `genererInterpretationPerformance`) : l. 938, les niveaux de code
  « 0 » sont retirés de l'échelle AVANT de ranger les étudiant·es par leur pourcentage ; l. 977, les codes `'PS'` et
  `'I'` sont réunis (« en difficulté »). L'échelle reçue vient de `reperesPerformance()`, qui la résout **par ses
  plages** (« deux échelles aux mêmes plages disent la même chose, même sous deux identifiants ») : son `id` peut être
  celui d'une copie.
- **Archive d'un trimestre** (`js/trimestres.js`, l. 2630) : `nb_PS` compte le code littéral `'PS'` dans
  `niveauSelectionne`. Une évaluation porte un `echelleId`, mais il peut valoir `pratique-<id>` : l'échelle est alors
  une copie de niveaux rangée dans la pratique (`resoudreEchelleEvaluation`), sans lien vers l'Échelle de départ.
- **Ni l'un ni l'autre ne lit l'échelle par son identité, ni le niveau par sa position.**

### B0.2 Et le code « 0 » est écarté, par son code, de cinq autres calculs

Le rapport du 20 nov. (G1) n'en nommait que deux. Mesuré dans le code aujourd'hui :

| Où | Ce que fait le code « 0 » |
|---|---|
| `js/evaluation-calcul.js`, l. 710 et 1732 ; `js/comptes-erreurs-stock.js`, l. 124 | `niveauDuPourcentage(…, { sansNiveauZero: true })` : un pourcentage ne donne JAMAIS « 0 » (critères algorithmiques et par points) |
| `js/echelles.js`, l. 2371, `couvertureDesPourcentages` | les plages du « 0 » ne comptent pas dans la couverture de 0 à 100 % |
| `js/tableau-bord-apercu.js`, l. 1037, `calculerDistributionPerformance` | le « 0 » sort de la répartition de la bande P |
| `js/contexte-qualification.js`, l. 139, `_niveauxSansZero` | le « 0 » sort des repères de suffisance et de maîtrise |

Le commentaire de `js/echelles.js` (l. 89) le dit : « LE CODE « 0 » RESTE CELUI DU NON RECEVABLE (intégrité
académique) ». « PS » a été créé le 27 oct. précisément pour ne pas l'être.

### B0.3 Ce que les calculs rendraient, mesuré avec les fonctions du dépôt

Les fonctions pures (`niveauQuiRecoit`, `niveauDuPourcentage`, `couvertureDesPourcentages`) extraites telles quelles
de `js/echelles.js` et `js/evaluation-calcul.js`, appliquées à la constante `niveauxDefaut` (script hors dépôt) :

| Échelle de départ (IDME) d'un trimestre neuf | 30 % au tableau de bord | 30 % déduit d'un critère | Couverture |
|---|---|---|---|
| premier code « PS » (aujourd'hui) | PS, compté avec I | PS (valeur 0) | ok |
| premier code « 0 » (B tel quel) | **personne** (sorti du compte) | **I** (valeur 40) | **trou à 0 %** |

Et sous une règle NON bornée (« 0 » traité partout comme « PS »), pour les autres échelles qui portent un « 0 » :

| Échelle | 5 % au tableau de bord, aujourd'hui | sous la règle non bornée |
|---|---|---|
| « IDME et niv 0 » (démo ; « 0 » de 0 à 0, « I » de 0 à 64,99) | I | I (inchangé à ces points) |
| « Échelle de départ – Par standards » (« 0 – Données insuffisantes », 0 à 12,49) | personne | **« 0 », compté « en difficulté »** |
| échelles des enseignant·es avec un « 0 » | hors des comptes | **dans les comptes** (comme ci-dessus, selon leurs plages) |

Et à l'archive : sous la règle non bornée, toute copie « 0 » (le non recevable de la démo, le « sans donnée » des
cibles, ceux des enseignant·es) entrerait dans `nb_PS`.

### B0.4 Verdict : ARRÊT

- **Borner la règle à l'« Échelle de départ (IDME) » demande de reconnaître cette échelle** dans les deux calculs. Ni
  l'un ni l'autre n'en a le moyen fiable : le tableau de bord reçoit une échelle résolue par ses plages, l'archive un
  `echelleId` qui peut être celui d'une pratique. Reconnaître l'échelle par ses plages (0 à 39,99 sous « 0 »)
  attraperait aussi une échelle d'enseignant·e aux mêmes plages : le compte de cette autre échelle changerait.
- **Même borné, « aucun calcul ne change » ne tiendrait pas** : pour l'Échelle de départ elle-même, les cinq calculs du
  § B0.2 changeraient (tableau B0.3). Les garder tels quels demanderait une exception « ce 0-là n'est pas le non
  recevable » dans sept endroits : le code « 0 » aurait deux sens selon l'échelle.
- **Un paradoxe à te laisser, pas à trancher ici** : le texte de B2 donne au niveau le sens du non recevable
  (« L'évaluation n'est pas possible (aucune donnée, plagiat, usage interdit de l'IA) »), sens que le code « 0 » a déjà
  partout dans l'application ; la décision, elle, lui garde le calcul de « PS » (une plage de 0 à 39,99 %, rangée avec
  « I »). Ce que le niveau veut dire relève de la didactique : c'est ta décision.
- **Pistes, aucune écrite** : (a) « 0 » prend le sens du non recevable, comme dans « IDME et niv 0 » de la démo, et
  « I » commence à 0 % : les calculs changent pour un trimestre neuf (le stock garde « PS ») ; (b) le code reste
  « PS » et seuls les mots changent (« PS – Aucun ») : aucun calcul ne bouge, mais l'écran ne dit pas « 0 » ; (c)
  l'exception dans sept calculs : écartée, pour les raisons ci-dessus.

### B0.5 La bulle 4 du « Nous faisons », et les codex de départ

- La bulle 4 dit toujours « à cinq niveaux : Aucun, Incomplet, Développement, Maîtrise, Étendu » ; un trimestre neuf
  affiche « PS – Préstructurel ». L'écart du 20 nov. demeure, puisque B n'est pas fait.
- **Les codex de départ (`departs/`)** : dernière fabrication `ce21d077` (20 nov.), avant le harnais neuf du parcours 3
  (`00d87e38`) et avant la fusion de la 1.252.0 à la 1.254.0. Leur échelle porte « PS – Préstructurel » (ce que la
  source sème encore aujourd'hui) ; leur pratique est « Modèle sommatif ». Ils sont donc à l'ancienne par rapport au
  « Nous faisons » du 20 nov. et à la 1.254.0 ; pas refabriqués, comme demandé.

### B5. Les quatre commentaires de la colonne « PS » (NON retirés ; recopiés pour réemploi)

`js/cartouches.js`, « Cartouche de départ », tels qu'ils sont dans la source :
- **Compréhension** : « La réponse ne traite pas encore du sujet demandé. Relis la consigne et repère ce qu'elle te
  demande. »
- **Application** : « Les connaissances ne sont pas encore appliquées à la tâche demandée. Repars d'un exemple vu en
  classe. »
- **Analyse** : « Aucun élément de l'analyse demandée n'est encore présent. Commence par nommer les éléments à
  examiner. »
- **Synthèse** : « La synthèse demandée n'est pas encore amorcée. Commence par dégager l'idée principale. »

## C. Deux mesures, en lecture seule (rien corrigé)

Mesurées au navigateur (Chromium, 1180 × 820), avec le harnais des bancs : un espace vide, le parcours 2 fait, puis
le « Nous faisons » du parcours 3, voie « Partir d'un modèle », carte « Modèle par standards » ; les bulles suivantes
jouées par les fonctions du banc. Spec de mesure jetable, pas commitée. Aucune erreur de page.

### C1. « Modèle par standards » à la bulle 2

- **La bulle ne couvre pas l'étape des cibles.** Après « Suivant → », l'assistant ouvre « Les cibles du cours » ; la
  bulle reste dans sa première forme : titre « Un modèle », « C'est fait : tu es à l'écran « Choisis un modèle ». »,
  les trois explications du choix (dont A1), et la consigne « Touche le modèle le plus proche de ta façon de noter,
  puis « Suivant → » ». Rien sur les cibles. Son contour reste sur « Suivant → ».
- **Elle déborde sur l'éditeur des cibles** (sa bande droite, de 792 à 855 px) ; après un « Suivant → » refusé (aucune
  cible), elle passe à gauche, où elle mord aussi sur l'éditeur (de 315 à 388 px).
- **Au récapitulatif**, elle prend sa seconde forme : « Le récapitulatif dit la famille… », « Son nom reste
  modifiable… », et **« Si l'assistant te demande une échelle, choisis « Échelle de départ (IDME) » »** : faux sur ce
  chemin, où aucune question n'est posée et l'échelle est l'« Échelle de départ – Par standards » (0 à 4).
- **Elle avance sur la pratique créée** (`pratiqueCreee`) : « C'est fait : ta pratique est créée. », bulle 3.
- **Bulles 3 à 10** :
  - **3** (l'appliquer au cours) : jouée comme au banc.
  - **4** (l'échelle) : **sautée**. La pratique porte déjà une échelle ; la bulle passe de 3 à 5 sans s'afficher, et
    la 5 confirme « C'est fait : ton échelle est choisie. ». La personne ne lit jamais la bulle 4.
  - **5 à 9** (grille composée dans « Grilles », cartouche, production, consignes, évaluer) : jouées comme au banc,
    mêmes textes. La cartouche prend ses colonnes de l'échelle de la pratique (0 à 4, **supposé** d'après le code :
    pas relu à l'écran).
  - **10** : voir C2.

### C2. Dans un groupe « Par standards », la bulle 10 et les autres parcours

- **La bande « Performance (P) » ne montre pas le point annoncé.** Après l'évaluation verrouillée, les trois
  étudiant·es (l'évalué·e compris) ont le même point, rouge, tassé à gauche (0,5 à 2,9 %), classe
  `barre-etudiant-sans-eval`, info-bulle « note non constructible ». Sous la bande : « La note du cours ne se construit
  pas encore : il n'y a rien à répartir. Le dépistage, lui, s'appuie sur les productions déjà évaluées. » La bulle 10
  dit pourtant : « Dans la bande « Performance (P) », l'étudiant·e que tu viens d'évaluer a maintenant son point. Les
  autres apparaîtront à mesure que tu évalueras leur production. » **Elle est fausse dans ce groupe.** (La bande
  « Modèle de la RàI » montre, elle, un·e étudiant·e au niveau 2.)
- **Les six autres parcours se lancent sans refus.** Après la bulle 10 (« Terminer »), aucune condition d'entrée ne
  refuse (`refus()` nul pour tous) ; au toucher de « Nous faisons », chacun ouvre sa bulle 1 : Recevoir (1 sur 9),
  Monter ton cours (1 sur 7), Données à l'abri (1 sur 4), Lire ta classe (1 sur 9), Automatiser tes commentaires
  (1 sur 11), Notation alternative (1 sur 8). **Non mesuré** : ce qu'ils deviennent au-delà de leur première bulle
  avec une pratique par cibles.

## D. Tests

- **Vitest complet** et **Playwright Chromium** (bancs touchés, deux tailles) : § D.1.
- **Break-tests** :
  - A : « par sélection des productions » dans A2 (« Je regarde ») → la sentinelle du 18 nov. ROUGE (2) ; « d'autres
    pratiques alternatives. » remis dans A1 du « Nous faisons » → la sentinelle du parcours 3 ROUGE (1). Rétablis :
    vert.
  - Le correctif de la bulle (§ A.3) : l'ancien évitement remis → le banc du modèle ROUGE à 1180 × 820 (la bulle
    intercepte « Suivant → ») ; rétabli : vert.
  - B : **aucun**, B n'étant pas fait (il n'y a rien à faire rougir).
- **Les rouges de la base** : le seul rencontré (le banc du modèle à 1180 × 820) est **vert sur la base** et rouge
  après la fusion : il vient de la fusion, pas de la base. Corrigé (§ A.3).

### D.1 Les résultats

- **Vitest complet** (depuis `tests/`, arbre final) : **949 fichiers, 12 327 essais, tous verts** ; aucune erreur non
  gérée dans la sortie. Deux rouges rencontrés en chemin, tous deux nés de ce lot et réglés : la sentinelle anti-cache
  après la fusion (§ 0) ; la sentinelle `ci-paths-ignore` sur le helper neuf, qui lisait `plans de travail/` par un
  appel direct (il passe maintenant par `lire`, comme les helpers du 18 et du 20 nov. : voir la trouvaille 5).
- **Playwright Chromium** (`playwright.chromium.config.js`, `--trace off`), les deux tailles quand le banc les a :
  - `nous-faisons-evaluer-2026-11-20` : 5 sur 5 (les deux voies à 1180 × 820 et 820 × 1180, la reprise) ;
  - `je-regarde-evaluer-2026-11-18` : 3 sur 3 après le correctif (B aux deux tailles, C) ; avant lui, B à 1180 × 820
    rouge (§ A.3) ;
  - `je-regarde-recevoir-2026-11-17` : 4 sur 4, rejoué après le correctif (il passe par le modèle d'« Évaluer ») ;
  - `nous-faisons-recevoir-2026-11-19` : 4 sur 4 (les deux voies, les deux tailles), avec les textes de A ;
  - `je-regarde-cours-2026-11-19` : 2 sur 2, rejoué après le correctif (il passe aussi par le modèle).
- **Non relancés** : les autres bancs de la branche ; aucun ne passe par l'étape 2 du modèle ni par les quatre
  phrases (cherché : `faireLeModeleDEvaluer`, `faireLesDeuxModeles`, les quatre phrases dans `tests/`).

## E. Ce qui n'est pas vérifié

Pas de porte terrain pour ce lot : rien d'irréversible, et l'essai de l'aperçu sur l'iPad couvre ce qui suit.

- **Safari (WebKit) et l'iPad réel** : rien. Tout est jugé sous Chromium Linux. Le correctif de la bulle dépend de la
  hauteur des cartes et de la fenêtre : à éprouver sur l'iPad couché.
- C1 et C2 : une seule taille (1180 × 820), une voie (« Je la compose ici » à la bulle 5).
- Les parcours 4 à 9 avec une pratique par cibles, au-delà de leur première bulle.

## F. Trouvailles, et leur issue

1. **La bulle 2 de « Je regarde » couvrait « Suivant → » à 1180 × 820** (née de la fusion) : **issue 1**, corrigée
   (§ A.3).
2. **Le banc du « Nous faisons » juge « le point qui s'allume » par un `data-da` que portent aussi les points « sans
   évaluation »** (`tests/integration/nous-faisons-evaluer-2026-11-20.spec.js`, l. 54 à 57 ;
   `js/tableau-bord-apercu.js`, l. 2265 : tout·e étudiant·e sans note a son point). Il resterait vert si le point de
   l'évalué·e ne s'allumait pas : mesuré dans un groupe « Par standards » (C2), **lu dans le code** pour les autres.
   **Issue 2** : inscrite ici ; pas au BACKLOG (ni vécue par Grégoire, ni bloquante : règle du 24 août).
3. **« 1 étudiants (33 %) nécessitent des interventions préventives ciblées. »** : au singulier, le nombre n'accorde
   ni le nom ni le verbe, et « étudiants » n'est pas inclusif (`js/tableau-bord-apercu.js`, l. 1625 et 1629 ; les
   phrases voisines suivent #1208). Vu sur la capture de C2. **Issue 2** : inscrite ici, même réserve.
4. **Le relevé G1 du 20 nov. ne nommait que deux calculs** pour le code « 0 » ; il y en a sept (§ B0.2). **Issue 3**
   pour ce rapport-là (il est dépassé par celui-ci, rien à corriger ailleurs).
5. **Le cliquet `sentinelle-ci-paths-ignore` ne voit pas une lecture faite par un helper** (`lire('plans de travail/…')`) :
   les helpers du 18 et du 20 nov., et maintenant celui de ce lot, lisent des consignes ignorées par la CI. Un commit
   qui ne toucherait qu'une de ces consignes ne déclencherait aucun run. Risque faible (consignes figées, validées mot
   pour mot), mais c'est un angle mort que j'ai emprunté sciemment. **Issue 2** : inscrite ici.
