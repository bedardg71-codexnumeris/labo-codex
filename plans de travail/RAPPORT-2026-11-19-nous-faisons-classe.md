# RAPPORT — `lot/nous-faisons-classe` : « Mettre ta classe en place », « Nous faisons » (session de nuit A, 19 au 20 nov. 2026)

> **Dernier relais.** Branche `lot/nous-faisons-classe`, partie de `origin/claude/ecstatic-brown-urn6v8` à `ebc9a9ad`
> (elle porte `poserConfirmation`, `secondeForme` et le commit d'aperçu `4c36db45`), puis `git merge --no-ff
> origin/main` à `ade09e93` (la 1.250.0 en ligne) : commit de fusion `b1b6f3dd`. **LIVRÉ** : les huit bulles et la
> variante de la septième, mot pour mot ; la flèche des gestes et la parenthèse des consignes hors du gras, au moteur ;
> « tu assembles » dans « Je regarde » ; #1297 inscrit. **UNE DÉCISION ATTEND** (§ 8, 1) : à 1180 × 820, la bulle 1,
> plus haute, couvre deux des champs qu'elle demande de remplir ; le banc qui le mesure reste rouge. Ni fusion, ni release, ni bump, ni changelog. **À annuler avant toute fusion** : `4c36db45` (« BRANCHE
> SEULEMENT », hérité de la base : il rouvre « Mettre ta classe en place », « Évaluer » et « Recevoir » ; ce lot n'en
> ajoute aucun). Consigne : `plans de travail/CONSIGNE-2026-11-19-nous-faisons-classe.md` (copie mot pour mot de
> `origin/lot/textes-parcours-nuit`, `afb106679`). Aperçu : voir § 7.

## 0. La base et la fusion

- Base : `origin/claude/ecstatic-brown-urn6v8` = `ebc9a9ad` (le relais demandait `ebc9a9a` ou plus récent ; c'est le même).
- `git merge --no-ff origin/main` (`ade09e93`, 1.250.0 publiée : `RELAIS.md` le dit, `VERSION_MAJEURE = '1.250.0'`).
  Deux conflits, tranchés en gardant les deux côtés :
  - `index.html`, les jetons `?v=` : `styles.css`, `js/travaux-ui.js` et `js/parcours-moteur.js`, changés des deux
    côtés, reçoivent un jeton neuf (`20261119n`) ; les autres gardent le jeton du côté qui porte leur contenu (mesuré
    fichier par fichier : `css/parcours.css`, `js/assistance.js`, `js/parcours-classe.js`, `js/parcours-evaluer.js`,
    `js/parcours-recevoir.js`, `js/parcours-recevoir-modele.js` sont ceux de la branche ; `js/parcours-decouvrir.js`
    est identique des deux côtés, jeton de `main`).
  - `BACKLOG.md` : l'en-tête de `main` (#1295) ; les sections de la branche (#1285, #1286) et de `main` (#1289 à
    #1295), toutes gardées.

## 1. Les deux mesures, avant tout code

Mesurées sous Chromium (Playwright 1.60, un espace vide, horloge figée au mardi 10 nov. 2026), puis gardées comme
essais du banc neuf (§ 4).

**(a) Lancé pendant que la démo est active, « Nous faisons » en sort-il avant la bulle 1 ?** **Oui.** `lancer()`
appelle `desactiverModeDemo()` et attend, puis ne part pas si la démo est encore ouverte. Chaque bulle rendue, même un
instant, a été notée avec l'état de la démo : toutes l'ont été démo fermée (`estEnModeDemo()` faux), y compris la
première. Rien de la démo dans les vraies données :
- espace vide : aucune clé réelle écrite entre l'ouverture de la démo et la bulle 1 ne porte une marque de la démo
  (DA `DEMO…`, `GC_DEMO`, `HOR_DEMO`, l'enseignant de la démo, le cours `601-999-DM`) ;
- avec un trimestre réel (A2026) : quatre clés réelles écrites au retour, `a2026_indicesAssiduite`,
  `a2026_indicesCP`, `a2026_indicesPatternsRaI`, `a2026_seancesCompletes`, toutes des calculs VIDES de
  l'application (`{}`, une date de calcul) ; aucune donnée de la démo. Rien de plus.

**(b) Le groupe-cours créé à la bulle 6 devient-il le groupe actif de l'en-tête ?**
- **Personne qui n'en a aucun dans le trimestre : oui.** Mesuré : `groupeCoursActif` et la liste de l'en-tête
  désignent le groupe-cours créé. Deux mécanismes y mènent, chacun suffisant (le break-test l'a montré, § 5) :
  `sauvegarderGroupeCoursV2` le rend actif quand il est le premier du trimestre (`premierActif`), et la liste de
  l'en-tête, qui ne trouve pas le groupe actif dans le trimestre, se répare sur le groupe marqué actif
  (`peuplerDropdownGroupeCoursActif`, #446).
- **Personne qui en a déjà un autre dans le trimestre : elle ne voit jamais la bulle 6.** Mesuré : l'étape est
  réglée dès qu'un groupe-cours existe au trimestre (`etapesDuCadre`) ; relancé, le parcours part de « Prendre les
  présences » (7 sur 8), sur le groupe actif de l'en-tête. Le geste nu (un second groupe-cours créé au Cadre, même
  trimestre) ne le rend PAS actif : l'en-tête garde le premier. Ce cas n'est pas un chemin du parcours.
- Lu dans le code, non mesuré : un groupe actif d'un AUTRE trimestre (la clé est globale) ne compte pas ; le premier
  groupe-cours du trimestre actif devient actif par les deux mécanismes ci-dessus.

⮕ **Aucun arrêt** : la bulle 7 prend les présences du groupe que la bulle 6 vient de créer.

## 2. Ce qui est livré

**`js/parcours-classe.js`, « Nous faisons » (`ETAPES`, `LIGNES_7`, `LIGNES_7_AVANT`, `DEF`).** Les huit bulles et la
variante, mot pour mot, avec les mécanismes de « Je regarde » et du moteur :
- l'objectif à la bulle 1 et l'objectif atteint à la bulle 8, sur la définition (`objectif`, `objectifAtteint`) ;
- la phrase du lieu : `lieu` (1, 7, 8), `section: sectionDuCadre(...)` et `nommeLaSection` (1 à 6), `lieuSuite` ;
- la confirmation « C'est fait : … » à partir de la bulle 2 (`confirmation(k, texte)`), **seulement si l'étape d'avant
  a été faite pendant ce passage** : le lancement retient ce qui est déjà fait (`faitesAuLancement`) ; une étape sautée
  parce que déjà réglée, ou rejouée en visite, n'en a pas (décision de Cowork) ;
- les explications en `note` (sans marque) ; les gestes en lignes qui se font (`champs`, `fait`) ; la consigne en gras.
- Le reste (contours, zones, flèches, `avant`, `atteint`, les deux formes de la bulle 7) : inchangé.

**`js/parcours-moteur.js` et `css/parcours.css` : la flèche des gestes.** Mesuré avant de coder : depuis le 18 nov., seule
la CONSIGNE portait la flèche (la règle avait été posée sur « Je regarde », où elle est le seul geste) ; une ligne à
champs n'avait AUCUNE marque avant d'être faite, puis le crochet. Les bulles validées montrent une flèche devant chaque
geste. Ajout minimal : une ligne de premier niveau qui se fait reçoit `parcours-bulle-ligne--a-faire` (la flèche, sans
le gras ni la couleur de la consigne) ; faite, le crochet (la règle existante l'emporte). Ses sous-lignes n'ont pas de
flèche (§ 6, supposition 2). Effet ailleurs, mesuré par lecture : deux lignes seulement, hors de ce parcours, ont `fait`
(« La cartouche est créée », modèle d'« Évaluer » ; les consignes faites du modèle de « Recevoir ») ; elles sont
toujours faites quand elles paraissent : le crochet, comme avant.

**« Je regarde », bulle 5** : `lieuSuite` « … tu réunis … » → « … tu assembles ce que tu viens de créer. » Rien d'autre.

**#1297 inscrit** (issue 2, sans y toucher) : la zone de collage de la liste a pour exemple « Depuis Excel ou
Omnivox... » (`index.html`, `#v2-donneesCollees`).

**La parenthèse d'une consigne, hors du gras** (`js/parcours-moteur.js`, `css/parcours.css`). Trouvé en lisant le relais
du lot suivant (parcours 4 : « suivi hors du gras de « (la note se calcule à mesure) », comme la parenthèse de la
consigne de la bulle 6 du parcours 2 ») : les bulles validées écrivent « **Touche « Créer le groupe-cours »** (il
apparaîtra dans l'en-tête de l'application) ». Le moteur met désormais hors du gras la parenthèse qui TERMINE une
consigne (`parcours-bulle-ligne-precision`). Règle générale : elle touche aussi six consignes de « Je regarde »
(« Mettre ta classe en place » ×2, « Évaluer » ×2, « Recevoir » ×2), dont le texte ne change pas (§ 6, supposition 6).

**Jetons `?v=`** : `js/parcours-classe.js` → `20261119u` ; `css/parcours.css`, `js/parcours-moteur.js` → `20261119x`
(deux changements). Et six fichiers que le lot ne touche pas, mais que la fusion de `main` a rendus périmés aux yeux de
`sentinelle-anticache-fichiers-modifies` (modifiés sur la base depuis la release, jetons du 17, build du 19) :
`js/assistance.js`, `js/parcours-evaluer.js`, `js/parcours-recevoir-modele.js`, `js/parcours-recevoir.js`,
`js/travaux-annotation.js`, `js/travaux-preparation.js` → `20261119m`. Mesuré : la sentinelle était rouge sur la base
fusionnée sans ce lot (`b1b6f3dd`, huit fichiers), et le hook de push l'aurait refusée. Aucun numéro de version, aucun
changelog.

## 3. Les mots qui ne tiennent pas tout à fait (signalés, NON changés)

1. **Bulle 4, « Touche « Importer » »** : la page montre d'abord « Prévisualiser » (après un collage), puis
   « Importer N étudiant·es » ; aucune ligne ne nomme « Prévisualiser ». Le contour et sa flèche y vont. Inchangé
   depuis le 14 nov.
2. **Bulle 8, la consigne de la fin** : la consigne écrit « Touche « Parcours suivant », ou « Terminer ». » (un point) ;
   le moteur la dit sans point, comme toutes les lignes de geste. Typographie seulement.
3. **Bulle 8, l'ordre de la fin** : la consigne énumère « Objectif atteint », « Chaque parcours… », puis « Pour revoir
   une étape… » ; le moteur pose « Pour revoir une étape… » d'abord, puis l'objectif atteint et la phrase de la suite
   (son ordre depuis le 16 nov., le même que « Je regarde »). Le relais dit « posé par le moteur » : l'ordre du moteur
   est gardé.
4. **Bulle 1, les trois dates** : la consigne les écrit sur la ligne de leur geste (« : le début du trimestre · la fin
   des cours réguliers · la fin du trimestre ») ; le code garde les trois sous-lignes du 14 nov. (chacune se grise à sa
   date). Mots identiques.

## 4. Les bancs

**Vitest** (depuis `tests/`, suite complète) : 932 fichiers, 11 877 essais ; un seul rouge au premier passage,
`sentinelle-anticache-fichiers-modifies` (antérieur au lot, voir les jetons au § 2) ; vert après les jetons. Le passage
final est celui du hook de push (§ 7).

**Sentinelles touchées.**
- `tests/unit/sentinelle-parcours-classe-2026-11-09.test.js`, réécrite : elle relit chaque bulle de la consigne du
  19 nov. (confirmation, titre et rang, ce qui suit la phrase du lieu, objectif, et chaque ligne DANS SON GENRE :
  explication, geste, consigne, sous-lignes) et la confronte au code chargé hors du navigateur. Les parenthèses qui sont
  des notes pour Claude Code sont déclarées, une à une, et relues dans la consigne. Ses essais d'avant qui tiennent
  encore sont gardés (« Plus tard », la ligne du panneau, l'étape 6 ne choisit rien, le lancement provisoire parti).
  24 essais.
- `tests/unit/sentinelle-parcours-je-regarde-2026-11-16.test.js` : la phrase retouchée de la bulle 5 (« tu
  assembles ») déclarée (`RETOUCHES_PHRASES`), relue dans la consigne du 19 nov.

**Bancs Playwright touchés.** `parcours-2-ma-classe-2026-11-09` (les textes des bulles 1, 7, 8 et de la variante ; la
bulle 1 défile vers sa section : le nom de la section, son halo et sa présence à l'écran remplacent « la page en haut » ;
la confirmation présente puis absente après « Reprendre », à la variante), `parcours-je-regarde-2026-11-16` (« tu
assembles »), `gel-etape-7-2026-11-15` (la ligne gardée de la bulle 6 en visite).

**Banc neuf** : `tests/integration/nous-faisons-classe-2026-11-19.spec.js`, à 1180 × 820 et 820 × 1180 :
- la confirmation PRÉSENTE après une étape faite dans ce passage (bulles 5 à 8), ABSENTE après une étape sautée (bulle 2 :
  le trimestre était là ; bulle 4 : le profil était là), et gardée quand on revoit une étape par le compteur ;
- le genre de chaque ligne tel que l'œil le voit (la marque `::before` calculée) : flèche, flèche en gras, crochet,
  rien ; les sous-lignes sans marque ; un geste fait passe de la flèche au crochet ; les deux gestes sans témoin de la
  bulle 5 gardent leur flèche une fois touchés ;
- la bulle 1 : l'objectif, la phrase du lieu, la poignée, aucune confirmation ; la mesure (b) ; la mesure (a).
- Résultat : 5 sur 5 (Chromium), et après la parenthèse hors du gras.

**Playwright Chromium, fichiers liés** (19 fichiers : ceux du parcours 2, des modèles, du moteur et des bulles ; chacun à
ses tailles, le banc neuf à 1180 × 820 et 820 × 1180) : 148 essais, **130 verts, 12 rouges, 6 sautés** (captures
seulement). Chaque rouge départagé, rejoué seul sur ma branche ET sur la base fusionnée sans le lot (`b1b6f3dd`) :
- **déjà rouges sans le lot (6)** : `bulle-largeur-ipad` L2 (1180 × 820, « zoom » de null) et `bulle-sur-telephone`
  « 390 px : Découvrir » (rouges aussi sur `main`) ; `essai-novice-lot4-etiquetage` (b)(c) (la bulle couvre 28 % de la
  zone de collage, sur la base aussi) ; les trois rouges connus de `main` (ci-dessous) ;
- **intermittents (4)**, verts rejoués seuls sur la branche : `bulle-sur-telephone` « le refus suit la largeur »,
  `gel-etape-7` « 36 rangées », `parcours-5` « capture 25 », `parcours-fleches` « la poignée » ;
- **causés par le lot (2)** :
  - `gel-etape-7` « en visite » : à chaque étape du Cadre, la bulle nomme maintenant sa section, et le moteur donne au
    nom de la section sa flèche (règle c, « Je regarde »). L'essai disait « aucune flèche » ; il dit désormais « aucune
    flèche hors du nom de la section, au plus une vers lui, et ce nom n'est pas un contrôle ». Il attend aussi la fin du
    défilement vers la section avant de lire le placement. Break-test : le moteur autorisé à flécher un contrôle qui écrit
    en visite → ROUGE (étape 7, deux flèches). **Vert.**
  - `parcours-2-ma-classe` « les formulaires du Cadre » (1180 × 820) : à la bulle 1, 4 flèches au lieu de 6. **Rouge,
    laissé rouge** : c'est la mesure du § 8, décision 1. Les mots sont à Grégoire, la règle qui l'empêche de se poser
    ailleurs est celle du 16 nov. ; ni l'un ni l'autre ne se tranche ici.

**Les trois rouges connus sur `main`**, rejoués sur `main` (`ade09e93`, Chromium) : **les trois le sont encore**, et
sur la branche aussi, pour la même raison chacun :
- `parcours-1-et-2` test 2 (« panneau : titre, phrase… ») : `Expected: 430`, `Received: 430.00006103515625`
  (un arrondi de mesure) ;
- `parcours-2-ma-classe` test 1 (« de « Découvrir » à sa propre classe… ») : « la bulle ne couvre pas
  #v2-sessionTrimestre » (elle le couvre) ;
- `parcours-2-ma-classe` test 5 (« une flèche didactique ouverte avant le parcours… ») : délai de 30 s dépassé dans
  `page.evaluate`.

## 5. Les break-tests

Chacun appliqué, le banc rejoué, puis le code rétabli (vérifié par `diff`).

| Rupture | Banc | Résultat |
|---|---|---|
| « Crée-en un seul » → « Crées-en un seul » | sentinelle classe | ROUGE (1) |
| « Ton numéro de groupe » : geste → `note` | sentinelle classe | ROUGE (1) |
| « Note seulement… » : `sansTemoin` → ligne sans rien | sentinelle classe | ROUGE (2) |
| « C'est fait : ton horaire est créé. » → « l'horaire » | sentinelle classe | ROUGE (1) |
| « tu assembles » → « tu réunis » dans « Je regarde » | sentinelle je-regarde | ROUGE (1) |
| la confirmation dite sans regarder le passage | banc neuf, test 1 | ROUGE ×2 (bulle 2 : « le trimestre était déjà là ») |
| la classe `--a-faire` retirée du moteur | banc neuf, test 1 | ROUGE ×2 (trois gestes sans marque) |
| la flèche posée aussi sur les sous-lignes | banc neuf, test 2 | ROUGE ×2 |
| le groupe-cours créé n'est pas rendu actif | banc neuf, test 1 | VERT d'abord ; ROUGE quand les DEUX mécanismes sont coupés (§ 1 b) |
| `lancer()` ne referme plus la démo | banc neuf, mesure (a) | ROUGE |
| la parenthèse de la consigne remise dans le gras | banc neuf, test 1 | ROUGE ×2 |
| en visite, le moteur autorisé à flécher un contrôle qui écrit | `gel-etape-7`, en visite | ROUGE (étape 7) |

La rupture « groupe-cours non actif » restée verte au premier essai a mené à la mesure du second mécanisme : le banc
juge l'état (le groupe actif est celui qu'on vient de créer), pas l'un des deux chemins.

## 6. Ce que j'ai supposé

1. **Les gestes que la page ne peut pas confirmer** (`sansTemoin`) : la flèche, et jamais le crochet. Cowork l'avait
   supposé pour « Choisis le nombre de séances par semaine » (le menu naît à 2) ; je l'ai appliqué aux trois autres
   lignes du même cas : « Pour chaque séance : le jour, le début et la fin » (bulle 5, ne se grisait déjà pas),
   « Choisis une séance déjà donnée… » et « Note seulement les absences et les retards » (bulle 7 ; une date est
   proposée d'office, et rien ne dit qu'une absence manque). Avant ce lot, ces deux dernières étaient des lignes sans
   marque.
2. **Les sous-lignes d'un geste n'ont pas de flèche** (la consigne n'en montre pas : « · » à la bulle 4, la ligne de
   leur geste à la bulle 1) ; elles reçoivent leur crochet une fois faites (bulle 1, comme avant).
3. **L'objectif et la phrase de la poignée ne paraissent qu'à la bulle 1**, comme le moteur le fait pour tout parcours :
   une personne dont le trimestre existe déjà commence à la bulle 2 et ne les voit pas (§ 8, décision 1).
4. **La bulle 2 dit « Tu es dans la section « Cours et services » »** même quand elle est la première du passage (la
   page vient alors de changer) : c'est la phrase validée, et le moteur ne dit « Tu es dans « Cadre », … » que pour une
   étape qui déclare `lieu`. Même question que 3.
5. **Le lancement retient ce qui est fait** au moment où il part, démo refermée : « Plus tard » puis « Reprendre »
   est un nouveau passage ; l'étape faite avant la pause n'est pas confirmée à la reprise (testé au banc, variante 7).
6. **La parenthèse qui termine une consigne sort du gras partout** (§ 2), « Je regarde » compris : la règle se lit dans
   les bulles validées des deux « Nous faisons » ; je ne l'ai pas limitée à eux.
7. **En visite, la flèche vers le nom de la section** est gardée : ce nom n'est pas un contrôle qui écrit (toucher
   l'en-tête d'un bloc du Cadre le replie ou le déplie, sans toucher aux données).

## 7. L'aperçu

PR d'aperçu, titrée « APERÇU, ne pas fusionner » : voir le relais dans `RELAIS.md` (`main`) et la PR elle-même ; l'adresse
de l'aperçu Netlify y est donnée dès que le déploiement de la PR la publie.

## 8. Ce qui attend une décision

1. **La bulle 1 à 1180 × 820 (l'iPad couché)**. Mesuré sous Chromium : la bulle fait 660 px de haut (l'objectif, la phrase
   du lieu, « Cette fois… », « Aie sous la main… », trois gestes, « Le reste… », la poignée). La page défile jusqu'à la
   section « Trimestre » ; il ne reste aucune place qui laisse libres à la fois les cinq champs et « Nom du trimestre »,
   que la règle 8 du 16 nov. interdit de couvrir (pesé comme le bouton à toucher). Le moteur couvre donc « Année » et
   « La fin des cours réguliers », qui n'ont plus de flèche (capture prise ; le banc « les formulaires du Cadre » le
   mesure, 4 flèches sur 6). Sur `main`, la bulle 1 couvrait déjà « Session » à 1180 × 900 (rouge connu). À 820 × 1180,
   tout tient. Trois issues, aucune n'est à moi : (a) laisser la bulle couvrir « Nom du trimestre » plutôt que deux
   champs (revenir sur la règle 8 pour cette étape) ; (b) une bulle plus courte (les mots de Grégoire) ; (c) garder tel
   quel.
2. **Partir à la bulle 2 (ou plus loin) sans objectif ni phrase de la poignée** (supposition 3), et sans « Tu es dans
   « Cadre » » (supposition 4) : à garder, ou faut-il que la première bulle d'un passage, quelle qu'elle soit, dise
   l'objectif et le lieu complet ? C'est une règle du moteur, pour tous les parcours.
3. **Les quatre gestes sans témoin** (supposition 1) : flèche sans crochet, ou une autre forme ?
4. **#1297** : le mot qui remplace « Depuis Excel ou Omnivox... ».

## 9. Trouvailles

- #1297 (issue 2, ci-dessus). D'abord inscrit #1296 ; mesuré avant le push : #1296 est déjà pris, et deux fois, par
  `lot/autoevaluation-consignes` et `lot/glisser-alignement` (deux sens différents, aucune n'est fusionnée). Pris #1297 ;
  à revérifier à la fusion.
