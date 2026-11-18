# Rapport du lot — « Je regarde » d'« Évaluer une première production », dix bulles (18 nov. 2026)

**Dernier relais (18 nov. 2026, soir)** : branche `lot/je-regarde-evaluer`, partie de `origin/claude/ecstatic-brown-urn6v8`
(`76192ab`), PR n° 30 en brouillon (base `main`, pour l'aperçu Netlify : https://deploy-preview-30--codexnumeris-051225.netlify.app). **Fait** : la consigne
`plans de travail/CONSIGNE-LOT-2026-11-18-je-regarde-evaluer.md`, A à G. **Reste** : la porte terrain
(`plans de travail/PORTES-TERRAIN-2026-11-18-je-regarde-evaluer.md`, Cowork publie l'artefact) ; le verdict WebKit à la
fusion, sur le Mac ; **défaire le commit « BRANCHE SEULEMENT » (`4c36db4`) avant toute fusion** (il vient avec la base).
`claude/ecstatic-brown-urn6v8` n'est pas touchée. Ni fusion, ni release, ni Nouvelles. Chromium seulement.

---

## 1. Ce qui est fait

- **Premier commit** : la consigne, telle quelle ; les deux fichiers de Grégoire dans `plans de travail/materiel-evaluer/`,
  extraits de la consigne d'entre leurs lignes de tirets, sans retouche (la sentinelle les confronte à la consigne).
- **A. Le modèle refait, dix étapes dans l'ordre du 15 nov.** (`js/parcours-evaluer.js`). Les étapes sont maintenant
  propres au modèle : elles ne reprennent plus celles de la Pratique guidée (l'ancien `pourLeModele`, les trois temps,
  `TEXTES_M`, `MOTS_M`, `ETAPES_MODELE` à neuf étapes sont retirés). « Nous faisons » ne change pas (sentinelle).
  Retirés avec l'ancien ordre : le détour par « Holistique » et ses quatre menus, les bulles « Pourquoi étiqueter »,
  « Tu apprends aussi », « Ta grille est créée », le retour pour choisir la cartouche.
- **B. Ce que le modèle produit ne change pas** : mesuré au banc (§2) ; les bancs de « Recevoir » rejoués (§2).
- **C. Le matériel** : la grille renommée « Grille générale à 4 critères » (critères et description inchangés) ; jugée par
  niveaux sans échelle neuve (C.2, §3 ci-dessous) ; l'étiquetage guidé une étiquette à la fois, « Rigueur » seule, puis
  « Voir la suite de l'exemple » (codé) ; « Créer ma grille » retenu jusqu'à la dernière rangée ; les vingt commentaires
  du 18 nov. ; la cartouche au nom de la production ; un bloc libre « Grille d'autoévaluation » ; l'échéance du mardi
  9 septembre 2025.
- **D. Les textes**, mot pour mot, dans un seul objet (`TEXTES`) ; la sentinelle les confronte à la section D dans les deux
  sens.
- **F.** Banc `tests/integration/je-regarde-evaluer-2026-11-18.spec.js` (portrait, paysage, et l'étiquetage fini à la
  main) ; sentinelle `tests/unit/sentinelle-je-regarde-evaluer-2026-11-18.test.js`, qui remplace celle du 13 nov. ; le
  banc B de `deux-temps-modeles-2026-11-13.spec.js` (l'ancien ordre) retiré ; le harnais de « Recevoir » joue les dix
  étapes. Porte terrain en markdown.
- **G.** Ce rapport. #1286 inscrit au backlog (la mise en forme de la grille d'autoévaluation dans le PDF).

## 2. Ce qui est mesuré (Chromium du nuage, 18 nov. 2026)

- **Banc du modèle**, 820 × 1180 et 1180 × 820 : chaque bulle juge sa confirmation, son lieu (lu dans le menu), ses
  lignes, sa consigne, ce qu'elle désigne (pulsation, et flèche quand le moteur en trace une seule) ; la bulle devient la
  suivante au bon geste ; les confirmations de l'étiquetage ; « Créer ma grille » inactif avant la fin ; la lecture
  « grille en niveaux », sans « Ce que vaut chaque niveau » ni choix des points. **Ce que le modèle produit** : grille à
  quatre critères `holistique` (20, 30, 15, 35) avec sa description ; aucune échelle neuve ; production (titre, type,
  grille, échelle « IDME et niv 0 », cartouche, objectif, tâche, détail, bloc libre, échéance transmise au deuxième
  groupe) ; cartouche au nom de la production ; évaluation de Yack Amical (M, D, D, D, verrouillée, « Bon départ ! », la
  cartouche venue de la production) ; pratique « N meilleures évaluations » appliquée au cours. Le bloc d'autoévaluation
  entre dans les blocs du PDF des consignes, après le détail de la tâche. **Confinement** : aucune clé hors de la démo ne
  change ; « Remettre la démo à neuf » rend la démo du pack. Vert, trois essais sur trois.
- **Break-tests** (chacun rouge, puis rétabli, vert) : écriture forcée de la grille sous la clé nue → rouge au
  confinement ; `tenuePourNiveaux` à false → rouge à « grille en niveaux » ; l'attente de « Créer ma grille » vidée →
  rouge à l'essai C ; un mot changé dans la bulle 3 → la sentinelle rouge dans les deux sens ; les blocs libres retirés de
  `blocsInformationDocument` (js/export-pdf.js) → rouge au contrôle du PDF.
- **Bancs rejoués** : « Recevoir » (A, B aux deux orientations, C), les deux temps (A, « Le refaire avec ma classe »),
  la Modélisation de la classe, et les 24 bancs qui touchent l'étiquetage de « Mon matériel ». Résultat : §6.
- **Vitest** : la suite complète ; voir §6.

## 3. Ce qui est supposé (décisions prises seul, dites ici)

- **C.2, borné au modèle.** Mesuré d'abord : une grille sans points ni niveaux (un nom, une description, une pondération
  par critère) est lue « en points » et naît en critères analytiques. Le changer pour tous changeait ce que « Mon
  matériel » fait d'une grille collée par l'enseignant·e (une décision de pédagogie : une pondération seule veut-elle
  dire des points ?). Borné au modèle : un drapeau que seul le modèle pose (`materielDissection.tenirPourNiveaux`), qui
  n'entre pas au brouillon ; la grille naît alors comme une grille composée à la main (critères `holistique`), sans
  échelle. Rien ne change pour une grille collée.
- **Une confirmation « → » est une ligne à part**, sous la consigne grisée, sans ses guillemets extérieurs.
- **Le dernier geste de « Structure »** (la pondération) fait changer la bulle : sa confirmation ouvre la bulle de
  « Rigueur », jusqu'au premier geste sur « Rigueur ».
- **Les confirmations de « Rigueur »** paraissent à mesure, entre « La rangée de « Structure » est faite » et la consigne.
- **La description de la grille** : « Voir la suite de l'exemple » l'étiquette ; finie à la main, la grille naît sans
  elle (Décision 3 de la porte).
- **Les lignes mêlant explication et geste** (« Ici, termine… ou touche… », « Choisis un niveau… (suggestion…) ») sont
  tout entières dans la couleur du geste : une ligne de bulle n'a pas de gras partiel.
- **La fin** : l'ordre du moteur commun (« Pour revoir une étape » avant « Objectif atteint ») ; pas de ligne de consigne,
  comme « Mettre ta classe en place » (Décision 1 de la porte).
- **La grille d'autoévaluation** : sans sa première ligne ni la ligne vide qui la suit.
- **« Le menu « Type » ouvert »** : son focus en tient lieu (un menu n'a pas d'événement d'ouverture).
- **Trois mots PROPOSÉS** : le refus du panneau et la bulle sur un autre groupe (inchangés depuis le 15 nov.) ; sous
  « Créer ma grille », la raison « toutes les rangées de la grille étiquetées ».
- **La bulle 4** dit « fais défiler » ; le moteur amène aussi « Appliquer au cours actif » dans la vue une fois la
  pratique choisie (sa règle commune : le geste suivant vient à l'écran).
- **Les jetons de cache** sont du jour du build (1117), comme ceux de « Recevoir » : pas de `--build-only` (pas de release).

## 4. Ce qui n'est pas vérifié

- **Safari, l'iPad** : rien. Portes 1.1 à 2.2.
- **Le PDF imprimé** : le banc juge les blocs que le PDF reçoit, pas la page.
- **Bulle 3 couché (1180 × 820)** : la bulle, l'assistant et la question de l'échelle ne tiennent pas ensemble ; sous
  Chromium, elle se pose à gauche et mord sur le début des lignes d'échelle (« IDME et niv 0 » reste touchable). Porte 2.2.

## 5. Pour chaque étape : l'écran, ce qui est pointé, le geste, ce qui fait avancer

| | Écran | Pointé | Geste | Avance quand |
|---|---|---|---|---|
| 1 | Conception › Pratiques (en haut) ; puis l'assistant, « Comment veux-tu créer ta pratique ? » | « + Nouvelle pratique » ; puis la carte « Partir d'un modèle », puis « Suivant → » | ouvrir l'assistant ; choisir, Suivant | l'assistant est à « Choisis un modèle » |
| 2 | « Choisis un modèle » ; puis le récapitulatif | la carte « N meilleures évaluations », « Suivant → » ; puis « Créer la pratique » | choisir, Suivant ; Créer | la question de l'échelle paraît |
| 3 | la question de l'échelle | la ligne « IDME et niv 0 », puis « Adopter » | choisir, Adopter | la pratique est créée |
| 4 | Conception › Pratiques, en haut | le menu des pratiques ; puis « Appliquer au cours actif » | choisir la pratique, défiler, appliquer | la pratique du modèle s'applique au cours actif |
| 5 | Conception › Mon matériel | rien (« Remplir » dans la bulle) ; puis l'étiquette à prendre, le morceau à toucher ; « Rigueur » et la suite : leurs rangées ; enfin « Créer ma grille » | Remplir ; étiqueter ; « Voir la suite de l'exemple » ou finir à la main ; Créer | la grille du modèle existe |
| 6 | Conception › Cartouches | « + Nouvelle cartouche » ; puis rien (« Remplir ») ; puis « Créer la cartouche » | ouvrir, Remplir, Créer | une cartouche neuve sous la grille du modèle |
| 7 | Conception › Productions | « + Nouvelle production » ; puis le menu « Type » ; puis rien (« Remplir ») ; puis « Créer la production » | ouvrir, toucher « Type », Remplir, Créer | la production existe |
| 8 | sa fiche, aux blocs de consignes | rien (« Remplir ») ; puis la case « Consignes transmises » | Remplir, cocher | les consignes transmises au deuxième groupe, avec la date |
| 9 | Évaluation › Liste ; puis l'écran d'évaluation | le menu « Actions » de Yack Amical ; le premier critère sans niveau ; « Un mot pour ton étudiant·e » ; « Verrouiller » | Évaluer ; quatre niveaux ; le mot ; verrouiller | l'évaluation de Yack Amical est verrouillée |
| 10 | Suivi › Groupe | la bande « Performance (P) » | un des trois boutons | « Terminer », « Le refaire avec ma classe » ou « Voir le parcours suivant » |

## 6. Trouvailles, avec leur issue

1. **« le chapitre » dans la grille d'autoévaluation** (« du début à la fin du chapitre ») alors que la tâche dit « le
   texte « Deux-Rives » » depuis le 15 nov. — **Inscrire et continuer**, sous forme de décision à Grégoire (porte,
   Décision 2) : ce sont ses mots, posés tels quels ; la sentinelle du 12 nov. qui l'interdisait dans le matériel l'exclut
   de sa mesure, et le dit.
2. **La mise en forme de la grille d'autoévaluation dans le PDF** — **Inscrire et continuer** : #1286 (consigne, C.5).
3. **À 1180 × 820, la bulle 3 couvrait « Adopter »** (le geste du banc ne passait plus) — **Corriger maintenant** (mon
   lot) : la bulle n'évite plus que la ligne de l'échelle et « Adopter » ; reste qu'elle mord sur le début des lignes
   d'échelle (porte 2.2).
4. **#1285 (la Modélisation de la classe sous Chromium en paysage)** : toujours là ; les bancs jouent ce préalable en
   portrait, comme ceux de « Recevoir ». **Déjà inscrit.**

5. **Trois bancs rouges SUR LA BASE du lot** (`76192ab`, rejoués dans un arbre à part sous Chromium, rouges de même) :
   `bulle-largeur-ipad-2026-11-12` (L2 à 1180 × 820, « zoom » de null), `deux-temps-modelisation-2026-11-12` (le panneau :
   la liste des parcours à deux temps compte maintenant « recevoir », que le banc ne connaît pas), `essai-novice-lot4-
   etiquetage-2026-11-14` (la bulle couvre 29 % de la zone de collage, pour moins de 25 %). Hors du lot, non vécus, et ni
   l'un ni l'autre ne bloque ce lot : **dits ici, sans inscription** (la règle du 24 août) ; le verdict WebKit du Mac dira
   s'ils sont propres à Chromium.

## 7. Résultats

- **Banc du lot** (`je-regarde-evaluer-2026-11-18.spec.js`) : 3 sur 3, Chromium.
- **« Recevoir »** (`je-regarde-recevoir-2026-11-17.spec.js`) : 4 sur 4 (A ; B debout et couché ; C).
- **Les deux temps** (`deux-temps-modeles-2026-11-13.spec.js`, sans son ancien B) et la Modélisation de la classe
  (`deux-temps-modelisation-2026-11-12.spec.js`, son attente passée à « 1 sur 10 ») : verts, sauf le rouge de la base
  (§6.5).
- **Les 24 bancs de l'étiquetage** de « Mon matériel » : verts, sauf les deux rouges de la base (§6.5). (Une première
  passe, lancée pendant que je modifiais encore des fichiers, en avait rougi d'autres : rejoués sur l'arbre final, verts.)
- **Vitest** : 11 896 essais, verts au hook du push (après la correction des deux découpes, #858).
