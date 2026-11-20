# RAPPORT — `lot/nous-faisons-recevoir` : « Recevoir les productions, rendre tes rétroactions », « Nous faisons » (session de nuit A, 19 au 20 nov. 2026)

> **Dernier relais.** Branche `lot/nous-faisons-recevoir`, partie de la tête de `origin/lot/nous-faisons-classe`
> (`76aa59b1` ; sa session avait poussé son rapport, `plans de travail/RAPPORT-2026-11-19-nous-faisons-classe.md`), puis
> `git merge --no-ff origin/main` : déjà à jour (`ade09e93`, la 1.250.0). **LIVRÉ** : les neuf bulles des deux voies, mot
> pour mot, avec les deux formes des bulles 4 et 6 sans fichier ; « tu y poses tes marques » dans « Je regarde » ;
> #1299 inscrit. **UNE DÉCISION ATTEND** (§ 8, 1) : la bulle 2, plus haute, ne tient plus sous les trois colonnes et
> couvre « Importer » ; deux essais du banc d'origine le mesurent et restent rouges. Ni fusion, ni release, ni bump, ni changelog. **À annuler avant toute fusion** : `4c36db45` (hérité,
> « BRANCHE SEULEMENT »). Les deux « Nous faisons » voyagent ensemble : ce lot porte aussi celui du parcours 2.
> Consigne : `plans de travail/CONSIGNE-2026-11-19-nous-faisons-recevoir.md`. Aperçu : voir § 7.

## 0. La base

- Tête de `origin/lot/nous-faisons-classe` : `76aa59b1`, rapport poussé (point 0 du relais).
- `git merge --no-ff origin/main` : « Already up to date » (`origin/main` = `ade09e93`, la 1.250.0 publiée, déjà fusionnée
  dans le lot du parcours 2). Aucun conflit.
- Consigne écrite d'abord : `dad61b0c`.

## 1. La mesure, avant tout code

**Avec quels boutons le moteur ferme ce parcours quand le parcours 5 est fermé.** Le moteur offre « Parcours suivant » à
côté du seul « Terminer » quand un parcours OUVERT suit celui-ci dans le panneau (`Assistance.suivantDe`, qui ne rend
qu'un parcours ouvert). Dans l'aperçu, les parcours ouverts sont « Découvrir », « Mettre ta classe en place »,
« Évaluer » et « Recevoir » (`4c36db45`) : rien ne suit « Recevoir ». **La bulle 9 n'offre donc que « Terminer », et sa
consigne dit « Touche « Terminer » »** (`consigneDeLaFin` suit les boutons). Rien n'est inventé. Mesuré au navigateur
(banc neuf, fin de la voie des fichiers : les parcours de l'aperçu posés, la bulle rejouée) ; quand tous les parcours
sont ouverts (les bancs), elle offre « Parcours suivant » et « Terminer », de même poids, et la consigne des deux suites.
Dans la branche du lot suivant (« Mettre tes données à l'abri », s'il y est ouvert), « Parcours suivant » paraîtra.

Le relais disait la démo déjà mesurée par Cowork (`lancer()` la quitte) : non refait.

## 2. Ce qui est livré

**`js/parcours-recevoir.js`** : `texte` et `geste` remplacés par des lignes (`lignes`), dans les mécanismes du moteur et du
lot du parcours 2, sans en inventer d'autres :
- la confirmation « C'est fait : … » (`confirmation(texte)`), seulement si l'étape d'avant a été faite pendant ce passage :
  le passage retient l'étape d'où il part (`passage.depuis`, posé par `choisirVoie`) ; une étape au-delà suit une étape
  faite ici (le moteur avance une à une). La première bulle sans fichier confirme « Rien à importer » s'il a été touché
  dans ce passage (`passage.rienAImporter`). Après « Reprendre », rien n'est confirmé à la bulle où l'on reprend ;
- la phrase du lieu (`lieu`, `lieuSuite`, `amener`) aux bulles 1, 3, 4, 6 sans fichier et 8 ;
- l'objectif à la bulle 1 de la voie avec des fichiers, l'objectif atteint aux deux voies (`definition(v)`) ;
- les explications en `note`, les gestes fléchés, la consigne en gras ; un geste dont rien ne dit qu'il est fait garde
  sa flèche (`sansTemoin`) ; les gestes qui se grisent : la production choisie (`#pipeline-select-production`), une marque
  puis un tampon posés sur la production ouverte (bulle 5, lus dans l'annotation vivante), chaque critère (la consigne de
  la bulle 6, par `champsDesCriteres`), la production de l'export (`#travaux-archivage-lea-production`) ;
- les deux formes (`secondeForme`, `lignesVivantes`) : bulle 4, la fenêtre « Rétroactions — Observations » ouverte ;
  bulle 6 sans fichier, l'évaluation ouverte ;
- bulle 7 : deux flèches, au plus (la première ligne `montre` la palette ou la section, `nommeLeContour: false`, le
  verrou en contour) ; la palette « Rétroaction », repliée, se déplie à l'entrée (`deplierLaRetroaction`).
Titres, `zones`, `contour`, `atteint`, le bouton « Rien à importer » : inchangés. Les anciens textes (`TEXTE_7_*`,
`texte7`) sont retirés.

**`js/parcours-recevoir-modele.js`** : le modèle reprend les étapes du parcours (`Object.create`). Le lieu, sa suite, la
seconde forme et `amener` sont désormais posés par le modèle seul : hérités, ceux du parcours auraient changé les bulles
de « Je regarde ». Et sa bulle 6 : « : c'est là que tu lis la copie et que tu y poses tes marques. » (point 3).

**Jetons `?v=`** : `js/parcours-recevoir.js`, `js/parcours-recevoir-modele.js` → `20261119v` (une lettre que le lot du
parcours 2 n'emploie pas : il a pris `u`, `x` et `m`).

**#1299 inscrit** (issue 2) : § 9.

## 3. Ce qui ne tient pas tout à fait (signalé, mots NON changés)

1. **Bulle 7 sans fichier, « flèches : le titre « Rétroaction » de `#travaux-eval-retroaction` »** : ce titre
   (`<h4>Rétroaction</h4>`) est masqué par la page (`.zone-retroaction-header.u-hide`) ; il ne peut pas recevoir de
   flèche. La ligne montre la section elle-même. À l'entrée de l'étape, la section est sous le bas de l'écran (le verrou
   est en haut) : sa flèche paraît quand on y descend.
2. **Bulle 6 sans fichier, seconde forme** : le moteur ne pose pas la phrase du lieu dans une seconde forme. **C'est la
   ligne** : « Tu es dans l'onglet « Annoter » : sans fichier, il n'y a rien à annoter, tu évalues directement. »
   (une explication) ; le halo du menu, lui, est posé (`lieu`).
3. **Bulle 6, la consigne à l'entrée** : mesuré à 1180 × 820, les menus des critères gardent un instant (moins de 300 ms)
   les niveaux de la copie précédente : la consigne paraît faite (le crochet), puis reprend sa flèche. Lu ainsi parce que
   le relais dit « ses champs : `champsDesCriteres` ». Voir aussi #1299.
4. **La phrase de la poignée paraît aussi à « Évaluer · 1 sur 4 »** (sans fichier) : le moteur la pose à la première
   bulle de toute définition, et la voie sans fichier en est une, lancée sous la bulle 1. Ce n'est pas neuf. L'objectif,
   lui, n'y est pas redit (choix : il est dit sous la bulle 1, d'où part « Rien à importer »).
5. **Bulle 9, l'ordre de la fin** : comme au parcours 2, le moteur pose « Pour revoir une étape… » d'abord.

## 4. Les bancs

**Vitest** (depuis `tests/`, suite complète) : 932 fichiers, 11 880 essais. Au premier passage, 10 rouges, tous dans
`sentinelle-gestes-proposes-2026-11-11` : la liste des gestes « proposés » le 11 nov. portait encore les dix anciennes
lignes du parcours (`tests/unit/_helpers/gestes-proposes-2026-11-11.js`) ; retirées (les bulles sont désormais validées),
avec une note, comme pour le parcours 2. Vert ensuite ; le passage final est celui du hook de push (§ 7).

**Sentinelles touchées.**
- `tests/unit/sentinelle-parcours-recevoir-2026-11-09.test.js`, réécrite : elle lit le RELAIS de la consigne (chaque ligne
  avec son genre, [C], [L], [E], [G]) et confronte chaque bulle du code chargé hors du navigateur, dans les deux voies et
  les deux formes des bulles 4 et 6 sans fichier (la seconde forme lue en déclarant visibles la fenêtre des tampons ou
  l'écran d'évaluation) ; « (ne se grise pas) » vérifié ; l'objectif et l'objectif atteint relus dans la consigne ; la
  condition d'entrée et la garde de l'étape 6 gardées telles quelles. 24 essais.
- `tests/unit/sentinelle-modele-recevoir-2026-11-17.test.js` : la retouche de la bulle 6 de « Je regarde » déclarée et
  relue dans la consigne du 19 nov.

**Bancs Playwright touchés.** `parcours-4-recevoir-et-rendre` (la bulle en lignes : « Sous « Inspecteur », choisis la
production », « La section « Rétroaction » », sans « Spécifique »).

**Banc neuf** : `tests/integration/nous-faisons-recevoir-2026-11-19.spec.js`, les deux voies, à 1180 × 820 et 820 × 1180,
depuis un espace où le troisième parcours est fait (puis la page rechargée : § 9) : chaque bulle dans son genre (la
marque calculée), la confirmation présente puis absente après « Plus tard » et « Reprendre » (bulles 4 et 7 avec
fichiers, 3 sans fichier), les deux formes, les gestes qui se grisent (la production, une marque au stylo, un tampon,
le dernier critère, la production de l'export), la parenthèse de la consigne hors du gras, les deux flèches de la bulle 7,
la palette « Rétroaction » dépliée à la reprise, la fin et la mesure 1. **4 sur 4** (Chromium).

**Playwright Chromium, fichiers liés** (9 fichiers : le parcours 4, son modèle, les modèles, le moteur, le registre, les
deux « Nous faisons ») : 39 essais, **36 verts, 3 rouges** :
- `parcours-4-recevoir-et-rendre`, « la voie des fichiers… (1180 px) » et « étape 2 à 820 px » : **causés par le lot,
  laissés rouges** (§ 8, décision 1). Mesuré (capture) : la bulle 2 fait 433 px de haut à 820 × 1180 ; le moteur amène
  d'abord le menu de production (le premier geste), et il ne reste pas la place de poser la bulle sous « Importer » : elle
  couvre le bas d'« Aperçu » et « Importer ». À 1180 × 900, elle couvre « Importer ».
- `je-regarde-recevoir` « B · 820 × 1180 » (le relevé de la bulle) : intermittent ; vert rejoué seul sur le lot, et sur
  la tête du lot du parcours 2.

**Les trois rouges connus sur `main`** : rejoués au lot du parcours 2 (son rapport, § 4) ; ce lot ne touche aucun de
leurs fichiers.

## 5. Les break-tests

| Rupture | Banc | Résultat |
|---|---|---|
| la confirmation dite sans regarder le passage | banc neuf, voie des fichiers | ROUGE (« repris : la production avait été ouverte… ») |
| « Annote la production » ne se grise plus | banc neuf, voie des fichiers | ROUGE |
| `avant` de la bulle 7 ne déplie plus la palette | banc neuf, voie des fichiers | ROUGE (« reprise : la palette dépliée ») |
| « Rien à importer » non retenu par le passage | banc neuf, voie sans fichier | ROUGE |
| « te mène directement » → « te conduit directement » | sentinelle | ROUGE (1) |
| « Garde les phrases… » : geste → explication | sentinelle | ROUGE (1) |
| « l'évaluation est verrouillée » → « ton évaluation… » | sentinelle | ROUGE (1) |
| la seconde forme de la bulle 4 retirée | sentinelle | ROUGE (1) |

Le break-test de la palette, d'abord fait en la repliant à la bulle 6, est resté vert : l'application la reconstruit avant
la bulle 7. Le banc a été changé pour juger le cas où l'étape agit (repliée pendant la bulle 7, puis reprise).

## 6. Ce que j'ai supposé

1. **La confirmation suit le passage par son rang** (une étape au-delà de celle du départ suit une étape faite ici), et non
   par l'état des données : les étapes de ce parcours avancent sur des événements (un dépôt, un import, un toucher) qu'aucun
   état ne garde. Effet : « Plus tard » puis « Reprendre » ne confirme rien à la bulle où l'on reprend ; la suivante, si.
2. **Les gestes sans témoin** : « Télécharge… », « S'ils arrivent dans un fichier ZIP… », « Vérifie que chaque production
   porte le bon nom… », « Garde les phrases… », « Vérifie que ce sont les bonnes… » (×2), « Relis la rétroaction… » :
   la flèche, jamais le crochet (« ne se grise pas », dit le relais).
3. **Bulle 5** : « Annote la production » se grise dès qu'un trait, un texte ou une forme (un code de langue compris)
   est posé sur la production ouverte ; « Pose tes tampons… », dès qu'un tampon l'est. Lu dans l'annotation vivante
   (`travauxAnnotation.getAnnotationCourante`), sans rien écrire.
4. **La palette « Rétroaction » repliée** est dépliée à l'entrée de la bulle 7 (le relais : « si elle peut être fermée à
   l'entrée de l'étape, `avant` l'ouvre »). Mesuré : elle ne se ferme pas, elle se replie (« − »), sans que rien le
   retienne ; repliée à la bulle 6, l'application la reconstruit avant la bulle 7 ; repliée PENDANT la bulle 7, puis
   « Plus tard » et « Reprendre », elle l'est encore à l'entrée : c'est ce cas que `deplierLaRetroaction` règle (banc et
   break-test).

## 7. L'aperçu

PR d'aperçu n° 38 (brouillon), « APERÇU, ne pas fusionner — « Recevoir les productions », Nous faisons : les bulles du
19 nov., deux voies » : https://github.com/bedardg71-codexnumeris/labo-codex/pull/38. Aperçu Netlify :
https://deploy-preview-38--codexnumeris-051225.netlify.app (l'adresse que Netlify donne aux PR de ce dépôt). Commit de tête
du lot : `8e261d3c`, puis ce rapport.

## 8. Ce qui attend une décision

1. **La bulle 2 (« Vérifie avant d'importer ») ne tient plus sous les trois colonnes** (décision de Grégoire du 9 nov. :
   la bulle sous les colonnes et « Importer », sans les couvrir). Avec ses lignes validées, elle fait 433 px de haut à
   820 × 1180 : elle couvre le bas d'« Aperçu » et « Importer » (à 1180 × 900, « Importer »). Issues, aucune n'est à
   moi : (a) la bulle laisse « Importer » couvert tant que la production n'est pas choisie (le contour y passe ensuite) ;
   (b) une bulle plus courte (les mots de Grégoire) ; (c) une autre place pour cette étape.
2. **#1299** : l'étape 6 qui avance seule (garde plus longue, ou niveaux choisis après l'entrée).
3. **La bulle 9 de l'aperçu n'offre que « Terminer »** tant que « Monter ton cours » est fermé (§ 1).
4. Les décisions du parcours 2 (son rapport, § 8) voyagent avec ce lot.

## 9. Trouvailles

- **#1299** (issue 2) : « Recevoir », étape 6, l'étape peut avancer sans qu'aucun niveau soit choisi (mesuré au banc,
  une fois sur trois, sans rechargement entre le troisième et le quatrième parcours). Le banc neuf recharge la page entre
  les deux parcours, comme le banc d'origine du quatrième parcours le fait à son étape 4, et le dit.
