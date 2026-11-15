# Rapport — le gel de l'étape 7 et « Refaire » (lot `lot/gel-etape-7`, 15 nov. 2026)

**Dernier relais (15 nov. 2026, Claude Code).** Branche `lot/gel-etape-7`, partie de `main` `41f68d315` (1.247.0).
Mandats : deux relais de Cowork du 15 nov. (diagnostic le matin ; correctif des points 1, 2 et 4 pour la fenêtre
du lundi 16 nov. vers midi).
- **Fait** : le placement de la bulle est borné dans le moteur ; une seule flèche vers la colonne Présence ; en
  visite, ni contour ni flèche sur un contrôle qui écrit, et la phrase de la visite à la place de la consigne ;
  #1278 inscrit (point 3). Vitest et WebKit ciblé sur les parcours : verts (détail plus bas).
- **Reste** : la relecture de Cowork ; puis le verdict du Mac, la fusion, un patch et sa ligne de Nouvelles
  (proposée plus bas, à valider par Grégoire) ; un regard de Grégoire sur l'iPad après la mise en ligne.
- **Ni fusionné, ni publié.** `lot/verdict-nuage` n'est pas touché. Aucune donnée d'utilisateur n'est touchée :
  le correctif tarit la source, et il n'y a pas de stock (rien de faux n'a été écrit chez personne).

## Ce que le lot change

| Point | Avant | Après | Où |
|---|---|---|---|
| 1. Le placement | (6 Z + 3)² places essayées contre Z rectangles | Ce que la bulle évite est réduit d'abord ; les bords essayés sont dédoublonnés | `js/parcours-moteur.js` : `reduireEvites`, `placesEssayees` |
| 4. Les flèches | Une par élément déclaré : une par rangée de la saisie | Les cibles qui se touchent n'en font qu'une : une vers la colonne | `dessinerFleches` |
| 2. La visite | Contour sur « Déverrouiller la saisie », consigne « Touche « Verrouiller… » » | Ni contour ni flèche sur un contrôle qui écrit ; la phrase de la visite | `gesteRetenu`, `contourDe`, `lignesEnVisite` ; `js/parcours-classe.js` (le second contour, sur la date) |

**La réduction, en trois temps.** Les doublons et les rectangles qui forment un même bloc sont fondus (deux cellules
qui partagent tout un bord, à 2 px : rien de plus n'est couvert) ; s'il en reste plus de 24, les rectangles de même
poids sont fondus de proche en proche (à 4 px, 8, 16…) ; le contour, pesé à part, n'est jamais fondu dans une zone.
À 36 rangées, 184 rectangles deviennent 3.

## Mesures, avant et après (WebKit, 1180 × 820, classe fictive)

Premier passage du parcours, hors « Refaire », à l'arrivée de l'étape 7. C'était l'inférence du matin : **elle est
confirmée**, le gel ne tenait pas à « Refaire ».

| Rangées | Rectangles déclarés | Un placement, avant | La page répond, avant | Un placement, après | La page répond, après |
|---|---|---|---|---|---|
| 24 | 124 | 9 338 et 9 511 ms | 7 097 et 7 476 ms | 39 ms | 43 ms |
| 36 | 184 | 29 529 et 34 431 ms | 22 543 et 27 568 ms | 43 ms | 58 ms |

Les durées sont prises du côté du banc, aller-retour compris : « avant », le placement mesuré attend derrière un
passage de la sonde, d'où des valeurs proches du double du coût pur (4,9 s à 24 rangées, mesuré le matin).
L'extrapolation du matin (16 s à 36) valait pour le coût pur.

**Le plafond.** 250 ms au banc WebKit, pour un placement et pour une réponse de la page, à 24 et à 36 rangées
(`tests/integration/gel-etape-7-2026-11-15.spec.js`) : deux passages de la sonde, cinq fois la mesure d'après, cent
fois sous celle d'avant. 100 ms en fonction pure (`tests/unit/sentinelle-placement-borne-2026-11-15.test.js`), à 36
rangées comme devant 400 rectangles épars.

## « Un contrôle qui écrit » : ce que j'ai retenu

**La règle.** En visite, le moteur tient pour un contrôle qui écrit tout élément qu'un toucher actionne : un
`button`, un `input`, un `select`, un `textarea`, un élément éditable, un `data-action`, un `data-on-change`, un
`role="button"` — que l'élément désigné le soit, qu'il soit dedans, ou qu'il en contienne un. Exception : le menu de
navigation (`.navigation-principale`, `.sous-navigation`), qui ne fait que changer de page.

**Pourquoi si large.** Le moteur ne peut pas savoir ce qu'un bouton écrit. Dans le doute, il ne le désigne pas : en
visite l'étape est déjà faite, et « Continuer » est dans la bulle. Le coût d'un excès est un contour de moins sur
une étape revue ; le coût d'un manque est celui du 15 nov.

**Quand elle s'applique.** Une étape est « en visite » quand son état est déjà atteint et qu'on la revoit : par
« Refaire » (« Mettre ta classe en place » seulement) ou par le compteur « n sur N », dans tous les parcours.
- Le contour n'est pas posé, sa flèche non plus ; les flèches vers des contrôles (la date, les cases de présence)
  non plus. Ce que la bulle évite ne change pas.
- La consigne (la ligne orange, ou la ligne du geste des bulles à paragraphe) devient « Tu revois ce parcours :
  rien n'est à refaire. Lis, puis touche « Continuer ». » ; les autres lignes restent, grisées comme avant.
- Une étape en visite dont le bouton n'est plus à l'écran (le formulaire « + Nouveau… » fermé des étapes 1 à 6)
  reçoit la même phrase : sa consigne inviterait à toucher un bouton que rien ne montre.
- La dernière bulle n'est pas une visite : « Touche « Terminer » » reste.

**Ce que la règle ne fait pas.** Elle n'avale aucun toucher : la page reste la vraie page, et un bouton touché de
soi-même fait son geste. Elle retire l'invitation.

## Les autres parcours

Le défaut était dans le moteur, et c'est là qu'il est corrigé : aucune autre étape n'est modifiée. Par la lecture,
les étapes qui déclarent une zone par élément d'une liste : les cartes du profil (« Découvrir », « Lire ta
classe »), les rangées du tableau d'évaluations (« Notation alternative »), les critères d'une grille (« Évaluer »,
« Recevoir et rendre »), les critères des commentaires, les objectifs servis (« Monter ton cours »). Toutes passent
par le même placement, maintenant borné. Je ne les ai pas mesurées une à une avec une grande classe : leurs bancs
sont verts, c'est tout ce que j'affirme.

Les flèches : la fonte ne touche que les cibles à moins de 2 px l'une de l'autre. Les étapes à formulaire (une
flèche par champ) et « Ta grille » (la zone de collage et ses deux boutons) gardent leurs flèches : leurs bancs le
disent.

## Vérification

- **Vitest**, suite complète : 927 fichiers, 11 814 essais, tous verts (58 s).
- **WebKit ciblé sur les parcours**, trois passages : 43, 48 et 47 essais, tous verts, aucun au second essai ;
  plus les 3 essais neufs. Mémoire libre entre 68 % et 73 %.
- **Break-tests** (constatés) :

| Ce qu'on casse | Ce qui rougit |
|---|---|
| L'état du matin (avant le correctif) | Les trois essais de `gel-etape-7` |
| `reduireEvites` retiré de `placerLoin` | « quatre cents zones éparses » (208 ms pour 100) |
| La fonte de proche en proche | « cent zones » et « quatre cents » |
| La comparaison des poids | « le contour garde son poids » |
| Le dédoublonnage des bords | « aucune place essayée deux fois » |
| La fonte des cibles des flèches | « 36 rangées » : 3 flèches vers la colonne au lieu de 1 |
| Le contrôle qui écrit n'est plus reconnu | « en visite », à la consigne de l'étape 1 |
| La consigne n'est plus remplacée | « en visite », étape 1 |
| Le second contour revient | « en visite », étape 7 |
| Les flèches vers un contrôle reviennent | « en visite », étape 7 (2 flèches) |

Un break-test m'a d'abord trompé : la réduction retirée seule, l'essai à 36 rangées restait vert, parce que le
dédoublonnage suffit devant des cellules alignées. Chaque défense a maintenant son essai.

## Suppositions nommées

- « Contrôle qui écrit » est défini par ce que l'élément EST, pas par ce qu'il fait : large à dessein (plus haut).
- La phrase de la visite remplace aussi la consigne d'une étape dont le bouton n'est plus à l'écran.
- En visite sur téléphone, la bulle s'ouvre dépliée (le geste, « Continuer », est dans la bulle) : c'était la règle
  des étapes sans contour, étendue.
- Les cibles des flèches ne sont fondues que si elles se touchent (2 px), pas à 20 px comme les zones de sujet :
  pour ne rien changer aux flèches des formulaires.
- #1278 plutôt que #1283 : un numéro laissé libre, parce qu'un autre lot travaillait en parallèle.

## Un incident de la session, sans suite

À 8 h 15, une autre session (`lot/editeur-pages-definition`) a créé sa branche dans le même arbre de travail ; j'y
ai créé la mienne à 8 h 22. Ses changements non commités sont restés une dizaine de minutes dans l'arbre, pendant
ma mesure « avant ». Ils touchent l'import des travaux et le PDF, ni le moteur des parcours ni la saisie des
présences : les mesures tiennent. Elle est partie dans son propre arbre ; mon diff ne porte que mes fichiers
(vérifié).

## Nouvelles : la ligne proposée (à valider par Grégoire)

Patch. Titre proposé : « Un parcours qui ne gèle plus ».
> Le parcours « Mettre ta classe en place » ne gèle plus à l'étape des présences quand la classe est grande. Et
> quand tu revois un parcours déjà fait, plus rien ne t'invite à toucher un bouton qui changerait tes données.

## Dispositions

| Constat du diagnostic | Disposition |
|---|---|
| 1. Placement en Z³ | Corrigé dans ce lot |
| 2. Contour sur « Déverrouiller » en visite | Corrigé dans ce lot ; texte de Grégoire |
| 2 bis. Écritures de vue pendant la visite | Commenté dans le code (`js/parcours-classe.js`, `lancer`) |
| 3. Témoin muet sur la clé | Inscrit : **#1278** |
| 4. Une flèche par rangée | Corrigé dans ce lot |
| 4 bis. Tableau coupé, page vide au retour | Non reproduit ; à regarder sur l'iPad après la mise en ligne |

Statut de ce rapport : lecture de code et mesures d'une machine, pas l'avis d'un pair.

---

# Annexe — le diagnostic du matin (15 nov., avant le correctif)

Sur `main` `41f68d315`, sans rien modifier. Reproduction sous WebKit (1180 × 820), classe de banc agrandie à 3, 12
et 24 personnes fictives, « Refaire », compteur, étape 7 choisie dans la liste.

## Vue d'ensemble

| # | Question | Statut | Quand corriger |
|---|---|---|---|
| 1 | Le gel | **Cause établie et reproduite** : le placement de la bulle à l'étape 7 coûte le cube du nombre d'élèves | Première fenêtre (lundi midi) |
| 2 | Le geste réel pendant « Refaire » | **Établi et reproduit** : « Refaire » ne protège que l'état du parcours, pas la page | Même fenêtre, avec le 1 |
| 3 | L'écriture refusée | Chemin établi ; **clé et erreur inconnues** | Attendre ; une vérification par Grégoire |
| 4 | Halo, flèches, tableau coupé | Flèches : établi. Halo et tableau : inférés comme suites du gel | Tombe avec le 1 |

## 1. Le gel

**Fait mesuré.** À l'étape 7, un seul placement de la bulle (`placerLoin`) prend :

| Élèves | Rectangles évités | Un placement | Latence de la page |
|---|---|---|---|
| 3 | 19 | 57 ms | 23 ms |
| 12 | 64 | 1 101 ms | 978 ms |
| 24 | 124 | 4 875 ms | 4 736 ms (max 7 108) |

La sonde rappelle ce placement toutes les 120 ms (`SONDE_MS`) et à chaque événement de défilement
(`parcours-moteur.js:2180`). À 24 élèves, la page ne répond plus qu'une fois toutes les cinq secondes.
Aux étapes 1 et 5, la latence reste à 22–34 ms : le gel est propre à l'étape 7.

**Cause.** Trois choses se multiplient :
- l'étape 7 déclare une zone par cellule : la colonne Présence et les trois premières colonnes de chaque
  rangée (`parcours-classe.js:514-518`), et `designe` y ajoute une seconde fois les cibles des flèches
  (`parcours-moteur.js:247`) : 5 N + 4 rectangles ;
- `placesEssayees` (`:1559`) pose 6 abscisses et 6 ordonnées par rectangle, sans dédoublonner, et essaie
  toutes les paires : (6 Z + 3)² places ;
- chaque place est pesée contre tous les rectangles (`aireCouverte`, `ecartA`).
Soit de l'ordre de Z³ : 124 rectangles donnent 560 000 places × 124 × 2.

**Extrapolation (non mesurée).** À 36 élèves (184 rectangles), environ 16 s par placement.

**Inférences.** (a) La liste des étapes n'est pas la cause : la latence est la même, liste ouverte ou
fermée ; le gel vient de l'arrivée à l'étape 7. (b) Le premier passage du parcours, hors « Refaire »,
déclare les mêmes zones : toute personne qui atteint l'étape 7 avec une vraie classe devrait geler de la
même façon. Non mesuré hors visite. (c) Les zones par cellule datent du 11 nov. (`ee8bf0bf6`) ; je n'ai pas
mesuré la 1.246.0.

**L'hypothèse de Cowork.** « Boucle de repositionnement » : non, chaque passage se termine, il est
seulement trop long. « Mémoire à bout » : non mesuré ici ; le compte de nœuds reste stable (9 000 à 10 000).

**Proposition.** Dans le moteur : dédoublonner les zones, les abscisses et les ordonnées avant de former
les places (les cellules d'une colonne partagent leurs bords : quelques abscisses au lieu de 6 N), et fondre
les rectangles qui se touchent. Dans l'étape 7 : rien à changer si le moteur est borné. Break-test : le
placement à 36 rangées fictives sous un plafond de temps, rouge avant, vert après. Le défilement gagnerait
aussi à ne sonder qu'une fois par image, mais ce n'est pas nécessaire au correctif.

## 2. Ce que « Refaire » protège

**Protège (lu et mesuré).** L'état du parcours reste « fait » (`surEtape` n'écrit pas en visite,
`parcours-classe.js:580`) ; aucune étape n'avance seule (`parcours-moteur.js:2056`) ; les lignes se
montrent faites.

**Ne protège pas (mesuré).** La page sous la bulle est la vraie page, et rien n'intercepte un toucher.
- À l'étape 7, la saisie propose la séance la plus récente, déjà verrouillée. Le contour se pose sur
  `#btnVerrouillerSaisiePresences`, qui dit alors « Déverrouiller la saisie », pendant que la bulle dit
  « Touche « Verrouiller la saisie » ».
- Un toucher sur ce bouton déverrouille pour vrai : `datesVerrouillees` passe de `["2026-11-10"]` à `[]`,
  la clé `…_datesVerrouillees_gc_…` est écrite. Un second toucher reverrouille.
- L'arrivée à l'étape 7 écrit aussi `presences_date`, `presences_groupe`, `presences_tri` (le choix de vue
  de la saisie), et l'ouverture d'un bloc fermé du Cadre écrit `etatsAccordeonsV2`
  (`pratiques.js:1061`). La phrase « rien ne s'écrit » ne vaut que pour l'état du parcours ; le banc
  existant ne le voit pas parce que ses blocs sont déjà ouverts.

**Sur l'incident.** Que le toucher soit « parti pendant le gel » reste inféré, mais il n'a pas besoin du
gel : le bouton désigné fait ce geste au premier toucher.

**Proposition.** En visite, une étape dont le geste écrit dans les données ne pose ni contour ni flèche
sur son bouton, et sa consigne n'invite pas à le toucher. Le texte de remplacement est lu par les
enseignant·es : il revient à Grégoire. Je ne propose pas de bouclier qui avale les touchers : il
cacherait le problème sans le dire.

## 3. L'écriture refusée

**Établi par la lecture.** « Non enregistré : le navigateur a refusé l'écriture. », sans nom de geste, ne
sort que d'un endroit : l'abonné de `db.surEchecEcriture` (`modes.js:1695-1698`). C'est donc l'écriture
IndexedDB d'arrière-plan d'un `db.setSync` qui a échoué, pour une raison qui n'est ni le quota (autre
message) ni la connexion perdue après réouverture (autre message). Ce n'est pas une clé trop grosse.

**Inconnu.** La clé et le nom de l'erreur : le témoin reçoit la clé mais ne l'affiche pas, et rien ne la
garde. Non reproduit sous WebKit.

**Candidates, par la lecture.** `etatsAccordeonsV2` si le bloc « Horaire » était fermé à l'arrivée de
l'étape 5 (la seule écriture que je trouve sur ce chemin) ; sinon une écriture antérieure encore en vol :
les trois clés de vue de la saisie, ou `datesVerrouillees` (le déverrouillage). Cause probable, inférée :
une transaction avortée par Safari pendant ou juste après le gel.

**Ce qui a pu être perdu.** La dernière valeur d'UNE clé, dans IndexedDB seulement ; le démarrage relit
IndexedDB, donc cette valeur a pu revenir à l'ancienne au rechargement. Si c'est l'accordéon ou la vue :
sans conséquence. Si c'est le verrou : le reverrouillage de Grégoire l'a réécrit ensuite.
**À vérifier par Grégoire, sur l'iPad** (aucune machine ne peut répondre) : la séance qu'il a
reverrouillée est-elle encore verrouillée ?

**Proposition.** Faire garder au témoin la clé et le nom de l'erreur (dans le message ou dans un journal
relisible) : sans cela, le prochain refus sera aussi opaque. À inscrire, pas urgent.

## 4. Halo, flèches, tableau

**Les flèches se multiplient : établi.** Depuis le lot 2 du 14 nov. (`d4151a3cd`), une étape qui porte des
lignes trace une flèche par élément, sans fusion ni plafond (`une: true`, `parcours-moteur.js:247`).
L'étape 7 déclare chaque cellule de la colonne Présence : une flèche par rangée à l'écran. Mesuré :
6 flèches à l'ouverture, 10 après 240 px de défilement. Le commentaire de l'étape (« une seule flèche »,
`parcours-classe.js:202`) décrit l'état d'avant.

**Le halo ne suit pas : inféré comme suite du gel.** Quand la page répond, le halo est replacé au
défilement (écart mesuré : 0 px à 3, 12 et 24 élèves, une fois le passage fini). Le halo et les flèches
sont en position fixe et replacés par script : fil bloqué, Safari fait défiler la page sans eux.

**Le tableau coupé, la page vide au retour : non reproduits.** Inférence : fil bloqué, Safari ne peint pas
les rangées qui entrent à l'écran ; puis il a déchargé l'onglet. Non mesurable sous WebKit de bureau.

**Proposition.** Rendre à l'étape 7 une flèche pour la colonne (déclarer la colonne, pas ses cellules, ou
fondre ses cibles). Le reste tombe avec le correctif du 1 ; à revoir sur l'iPad après.
