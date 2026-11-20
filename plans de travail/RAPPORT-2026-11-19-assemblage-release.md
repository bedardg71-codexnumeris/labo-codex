# Rapport — assembler la release d'avant lundi (19 nov. 2026)

**Dernier relais.** Branche `lot/assemblage-release`, partie de `origin/main` à `ade09e93` (la 1.250.0), puis
`origin/main` à `c857b794` fusionné (deux relais de nuit, `RELAIS.md` seul) : `main` en est l'ancêtre, la fusion se
fera en avance rapide. Consigne : `plans de travail/CONSIGNE-2026-11-19-assemblage-release.md`. Fait : les trois
branches fusionnées en `--no-ff`, dans l'ordre, aux têtes données (aucune n'avait bougé) ; les conflits réglés ; la
retouche des identifiants (1, 2, 3) ; le banc croisé, avec break-test ; Vitest complet ; les bancs Chromium ; un run
WebKit sur GitHub. PR n° 41, « APERÇU, ne pas fusionner » (brouillon) : ni push de `main`, ni release, ni Nouvelles
écrites. Reste, sur le Mac : l'accord de Grégoire sur l'entrée des Nouvelles (§5), puis le verdict complet,
`release.mjs` et le push de `main` (§7).

## En bref

- Les quatre lots sont dans la branche : « Dupliquer » en profondeur (#1298), le glisser d'Alignement (#1295),
  la grille d'autoévaluation dans le PDF des consignes, les noms des deux seuils.
- `PARCOURS_OUVERTS` est identique à celui de `main` (`['decouvrir']`, `js/assistance.js` intouché). Aucun commit
  propre aux branches exclues n'est entré (mesuré commit par commit) ; les deux seuls communs avec
  `lot/nous-faisons-cours` et `lot/je-regarde-cours` sont ceux du glisser, que ces branches avaient fusionnés.
- Un numéro de fiche servait deux fois : #1296. La fiche des neuf rouges d'import sous Chromium devient **#1301**
  (#1300 a été pris pendant l'assemblage par la session de nuit A).
- `dupliquerGrille` n'est atteignable depuis aucun écran (mesuré au navigateur).
- Chromium : aucun rouge neuf (les 44 rouges le sont aussi sur `main`). WebKit Linux : en cours.

## 1. Les fusions

| Ordre | Branche | Tête | Conflits |
|---|---|---|---|
| 1 | `origin/lot/dupliquer-copie-profonde` | `145a9b7c` | aucun |
| 2 | `origin/lot/glisser-alignement` | `29e30e49` | `BACKLOG.md` (« Dernier ID ») |
| 3 | `origin/lot/autoevaluation-consignes` | `9fc57473` | `BACKLOG.md` (deux), `index.html` (trois) |

Commits de fusion : `4c03801d`, `0ed55653`, `59beba07`. Aucune tête n'avait bougé depuis la consigne.

**`BACKLOG.md`.** Toutes les fiches gardées. Mesuré sur toutes les branches d'origin : #1296 pris par
`lot/glisser-alignement` (« capture 25 » de parcours-5) ET par `lot/autoevaluation-consignes` (les neuf rouges
d'import sous Chromium) ; #1297 par `lot/nous-faisons-classe` et `lot/nous-faisons-recevoir` ; #1298 par
`lot/dupliquer-copie-profonde` ; #1299 par `lot/nous-faisons-recevoir`. La fiche du glisser garde #1296 : elle a déjà
essaimé sur `lot/nous-faisons-cours` et `lot/je-regarde-cours`, qui l'ont fusionnée. Celle de l'autoévaluation devient
**#1301**. Je l'avais d'abord numérotée #1300, premier numéro libre au balayage du début ; à 1 h 45 UTC, un second
balayage a trouvé #1300 pris par la session de nuit A sur `lot/nous-faisons-donnees`, poussée entre-temps (son relais
sur `main` le dit). #1301 est libre sur toutes les branches à cette heure ; à revérifier à la fusion. Son intertitre
dit d'où elle vient ; « Dernier ID utilisé : #1301 », avec la trace. Aucun numéro de fiche ne sert deux fois parmi
#1290 à #1301 (le double #716 est antérieur, il est déjà sur `main`). Les deux rapports de l'autoévaluation qui
citaient #1296 portent une parenthèse vers #1301.

Trouvé en route (antérieur, sur `main`) : la ligne qui porte la liste des 17 rouges WebKit Linux de #1293 était
décollée de sa fiche (après #1295) ; la fiche #1296 du glisser, insérée juste avant, la faisait lire comme une partie
de #1296. Remise sous #1293 (`4846ffa5`), une ligne déplacée : j'en avais besoin pour classer les rouges WebKit (§4).

**`index.html`.** Trois blocs, tous des jetons de cache, comme mesuré par Cowork :

| Fichier | Touché par | Jeton retenu | Descriptions |
|---|---|---|---|
| `styles.css` | dupliquer, autoévaluation | `20261119f` (au-dessus de `e` et `d`) | les deux gardées |
| `js/grilles.js` | dupliquer, autoévaluation | `20261119f` (au-dessus de `c` et `d`) | les deux gardées |
| `js/echelles.js` | dupliquer, autoévaluation | `20261119f` (au-dessus de `a` et `d`) | celle de #1298 (l'autre lot n'en avait pas ajouté) |
| `js/pratiques.js` | dupliquer seul | `20261119a` (le sien) | la sienne |
| `js/wizard-pratique-v2.js` | autoévaluation seule | `20261119d` (le sien) | la sienne |

Ensuite, par mes retouches : `js/grilles.js` à `20261119g`, `js/cartouches.js` à `20261119b`,
`js/cartouches-decalees.js` à `20261119a` (le hook anti-cache exige un jeton neuf même pour un commentaire).

**`js/grilles.js`, `js/echelles.js`, `styles.css`** (fusion automatique), relus hunk par hunk : les deux lots touchent
des fonctions disjointes. Dans `grilles.js`, #1298 change les trois gestes de copie (`dupliquerGrille`,
`ajouterGrilleIndividuelle`, `dupliquerGrilleDepuisSidebar`) ; l'autoévaluation, le rendu des descripteurs
(`rendreDescripteursNiveaux`, la case « Pour vérifier », les étiquettes de seuil). Le point de rencontre est la
donnée : `pourVerifier` vit dans `critere.descripteurs`, que la copie profonde de #1298 emporte. C'est ce que le banc
croisé juge (§3). Dans `echelles.js`, la copie profonde de deux gestes d'un côté, les mots des seuils de l'autre. Dans
`styles.css`, deux blocs neufs éloignés (l. 22 897 et 30 065 de la base).

## 2. La retouche des identifiants

**(1) `CartouchesDecalees` ne conclut plus sur une copie** (`js/cartouches-decalees.js`). Dans `_ligneRanger`, si
une grille trouvée (qui porte tous les critères de la cartouche) est parente par la copie de la grille de la
cartouche, la ligne est listée avec `ambigue: true`, `proposition: false` et un `pourquoi` qui nomme la parenté
(« ambiguë : « X » est une copie de « Y » ; leurs critères portent les mêmes identifiants, qui ne disent pas à
laquelle la cartouche appartient »). Rien n'est proposé, ni rangement ni rattachement, et la réparation n'écrit rien.
La parenté se lit par `inspireDe.sourceId`, dans un sens ou dans l'autre, en remontant la chaîne dans les grilles du
trimestre (`_ancetres`, `_parente`).
Tests : quatre essais dans `tests/unit/cartouche-criteres-grille-1144.test.js` (copie, sens inverse, sœurs et
`idOriginal`, témoin sans parenté qui range comme #1145). Break-test : le contrôle neutralisé, trois rouges ; le témoin
reste vert. Fichier restauré, 24 verts.

**(2) `dupliquerGrille` (`js/grilles.js`, l. 1105) : AUCUN ÉCRAN NE L'ATTEINT.** Mesuré au navigateur (Chromium,
1 180 × 820), après les quatre sous-sections de Conception (grilles, échelles, rétroactions, productions) : ses deux
boutons (`data-action="dupliquerGrille"`) ne s'écrivent que dans `#vueGrillesCriteres`, rangé sous un
`<div class="u-hide">` (« Conteneurs cachés pour compatibilité », `display: none !important`) : `checkVisibility()`
faux, boîte de 0 × 0. L'autre conteneur, `#listeGrilles`, n'existe pas dans `index.html` : `afficherGrillesCriteres`
rend la main sans rien écrire. Aucun autre appelant (`grep` sur `js/`, `index.html`). Seule la console y mène
(`window.dupliquerGrille`). Rien d'aligné ; un commentaire dans son en-tête le dit, et demande de ne pas le rebrancher
sans l'aligner sur `dupliquerGrilleDepuisSidebar`.

**(3) Le commentaire de `js/cartouches.js`** (l. 4200 de l'assemblage, dans `importerUneCartoucheTrimestre`, chemin 2)
disait qu'une grille dupliquée reçoit des identifiants neufs. Corrigé : « Dupliquer » (éditeur, barre latérale,
bibliothèque) et `copiePropre` (partage, copie d'un autre trimestre, lu dans `js/partage-section.js`) gardent les
identifiants ; ils peuvent différer quand même, par une copie ancienne de `dupliquerGrille` ou des critères refaits,
et le rattachement par id puis par nom reste utile.

## 3. Le banc croisé

`tests/integration/assemblage-dupliquer-descripteurs-seuils.spec.js`. Une grille dont le premier critère porte des
descripteurs (D et M, sur l'échelle de départ) et un « Pour vérifier » ; les deux seuils de l'échelle posés sur D et M
par `ecrireRepereEchelle`. Deux gestes (le bouton « Dupliquer » de l'éditeur, touché ; « Dupliquer » de la
bibliothèque), en paysage (1 180 × 820) et en portrait (820 × 1 180). Chaque essai :

1. duplique ; la copie garde ses descripteurs, sa question, les identifiants de ses critères ; aucun objet partagé avec
   la source, relu dans IndexedDB (`db.get`) ;
2. ouvre la copie : ses textes dans leurs cases, « Seuil minimal de réussite » sur la case D et « Seuil de maîtrise »
   sur la case M ;
3. change un descripteur ET la question dans la copie, par leurs cases ;
4. la source n'a pas bougé, dans IndexedDB comme dans le JSON du `localStorage` ;
5. recharge : toujours pas ; la copie garde ses textes et ses étiquettes ; la source rouverte montre les siens.

Quatre verts sous Chromium. **Break-test** : l'étalement remis dans `dupliquerGrilleDepuisSidebar`, les deux essais de
l'éditeur rougissent et ceux de la bibliothèque restent verts ; l'étalement remis dans
`BibliothequeUI.dupliquerVersBibliotheque`, les deux de la bibliothèque rougissent ; `etiquettesSeuilsDuNiveau`
coupée, les quatre rougissent. Fichiers restaurés après chaque mutation.

## 4. Les tests

### Vitest

Complet, depuis `tests/`, sur l'assemblage avec la retouche : **935 fichiers, 11 976 essais, tous verts**. Rejoué par
le hook pre-push à chaque push (vert), et par GitHub sur `0c0bb47c` (job Vitest vert). Les sentinelles anti-cache
(`anticache-fichiers-modifies`, `cache-busting-main`, `release-bump-cache-417`) rejouées après le dernier jeton : vertes.

### Chromium, paysage et portrait

Les 120 fichiers des quatre lots, du banc croisé et des modules touchés (noms contenant grille, échelle, cartouche,
production, planif, alignement, pdf, import, export, codex, dupliqu, copies, seuil, autoeval, barème, matériel,
partage, descripteur, et `wizard-577`), par une configuration temporaire non suivie à deux projets : paysage
(1 180 × 820) et portrait (820 × 1 180). Les 41 fichiers qui fixent eux-mêmes leur fenêtre tournent une fois ; les 79
autres, aux deux tailles. Six tranches, trois workers. **716 essais : 671 verts, 44 rouges, 1 sauté.**

**Les 44 rouges rougissent tous aussi sur `main`** (worktree d'`ade09e93`, même configuration, mêmes fichiers) : même
essai, même fenêtre. **Aucun rouge neuf.** À l'inverse, un essai rouge sur `main` est vert sur l'assemblage
(`planif-corbeille-fixe-1070`, paysage) : il est intermittent.

| Fichier | Rouges | Fenêtres | Connu |
|---|---|---|---|
| `codex-1012-ancien-zip-par-la-case` | 12 | les deux | #1301 (six essais × deux fenêtres) |
| `import-cartouche-renommee-654` | 4 | les deux | #1301 |
| `lot-j0-bis-partage-apres-preparation` | 2 | les deux | #1301 ; aussi dans la baseline Linux |
| `codex-1011-ouvert-sans-espace` | 8 | les deux | rouge sur `main` ; (5) aussi dans la baseline Linux |
| `lot-i-bis-la-case-ouvre-un-codex` | 4 | les deux | rouge sur `main` ; (1) et (3) intermittents de la baseline Linux |
| `codex-1012-fichier-d-origine` | 2 | les deux | rouge sur `main` ; (1) dans la baseline Linux |
| `codex-1182-fusion-copie-par-copie` | 2 | les deux | rouge sur `main` |
| `codex-1186-fenetre-de-fusion` | 2 | paysage | rouge sur `main` |
| `codex-1012-avertissement` | 1 | paysage | rouge sur `main` |
| `1028-archiver-copies` | 1 | paysage | rouge sur `main` |
| `bareme-3-evaluer` | 2 | sa fenêtre | rouge sur `main` |
| `grilles-sous-criteres-condense` | 1 | sa fenêtre (iPad) | rouge sur `main` ; intermittent de la baseline du Mac |
| `planif-menu-vue` | 2 | paysage | rouge sur `main` ; dans la baseline Linux |
| `planif-corbeille-fixe-1070` | 1 | portrait | rouge sur `main` (paysage) ; dans la baseline Linux |

Ce qui varie : la configuration Chromium le dit en tête, « ~la moitié des specs rougissent en Chromium », surtout
celles du codex et de l'import, dont les motifs d'erreurs attendues sont écrits pour WebKit. Douze des quatorze
fichiers touchent au codex, à l'import, aux archives ou aux gestes du planificateur. Comme ils rougissent à l'identique
sur `main`, ils ne disent rien des lots.

Les bancs des quatre lots et le banc croisé sont **tous verts** sous Chromium, chacun aux fenêtres qu'il fixe
(1 180 × 820 et 820 × 1 180 pour tous ceux-ci, plus 390 × 844 pour `noms-des-seuils`) :
`dupliquer-copie-profonde-1298` (16 essais), `dupliquer-copie-profonde-1298-cache` (18),
`diagnostic-copies-liees-1298` (6), `planif-glisser-relachement-1295` (10), `autoevaluation-consignes` (4),
`noms-des-seuils` (3), `assemblage-dupliquer-descripteurs-seuils` (4), `descripteurs-niveaux-grille` (2). Les specs
que l'autoévaluation a retouchées aussi : `bareme-1` (3, à 1 440 et 820), `echelle-reperes-maitrise-rendu` (3, à
1 600 et 1 280), `materiel-dissection-2b` (2, à 820), `partage-echelle-reperes-583` et
`wizard-577-reperes-echelle-rendu` (aux deux tailles de la configuration). Le seul essai sauté l'est par son banc
(`bareme-3-evaluer`, les captures, sans dossier de captures).

### WebKit Linux, sur GitHub (run 44649923269, `0c0bb47c`)

Le workflow `tests.yml`, lancé à la demande sur la branche (`workflow_dispatch`), juge en 20 morceaux sous WebKit
Linux, puis un job « verdict » compare à `scripts/playwright-baseline-linux.json`. **Verdict : NON JUGÉ**, deux fois.
Ce n'est pas un rouge d'essai : des morceaux n'ont pas pu poser les dépendances apt de WebKit (« non posées en trois
essais — ce morceau ne jouera rien »), comme sur `main` le 19 nov. au soir (run 44614746624, 12 rapports sur 20,
même cause). Première tentative : 11 morceaux joués sur 20 ; relance des seuls morceaux échoués : 5 de plus. **16
morceaux sur 20 joués** ; les morceaux 9, 11, 12 et 19 ne l'ont jamais été. J'ai lu le bilan de chacun des seize dans
son journal et l'ai comparé à la baseline Linux et à la liste des 17 de #1293.

**Les bancs des lots sous WebKit Linux.** Verts : `dupliquer-copie-profonde-1298` (morceau 8),
`dupliquer-copie-profonde-1298-cache` et `planif-glisser-relachement-1295` (7), `autoevaluation-consignes` (18),
`noms-des-seuils` (4), le banc croisé, `descripteurs-niveaux-grille` et `echelle-reperes-maitrise-rendu` (13),
`bareme-1` (1), `materiel-dissection-2b` (10), `wizard-577-reperes-echelle-rendu` (6), `partage-echelle-reperes-583`
(17). `descripteurs-niveaux-grille` (« iPad en haut ») et les deux essais de parcours-5 sont passés au second essai.
**Rouge : `diagnostic-copies-liees-1298`, les six essais** (morceau 17), jamais joués sous WebKit par son lot : le
toucher du bouton « Vérifier les copies liées » est intercepté par l'en-tête de l'accordéon « Maintenance », resté
fermé. Le banc était le seul de la suite à ouvrir un accordéon par `.tap()` sur l'en-tête (une `div`) ; tous les
autres le font par `.click()`, et le code de l'application note qu'à l'iPad, le toucher d'un élément non cliquable
n'émet pas de `click`. **Corrigé dans le banc** (`85e35267`) : l'en-tête s'ouvre par un clic, une attente nomme
l'accordéon ouvert ; le geste jugé, le toucher du bouton, reste un toucher. Six verts sous Chromium. (Jugé de nouveau par le run 44659003950, en cours.)

**Les autres rouges francs (rouges aux deux essais) :**

| Essai | Morceau | Classement |
|---|---|---|
| `1007-codex-a-part-avant-suppression` X1 | 1 | baseline Linux |
| `1007-propose-codex-avant-suppression` P8 (évaluation) | 4 | baseline Linux |
| `codex-1011-ouvert-sans-espace` (5), deux essais | 10 | baseline Linux |
| `codex-1012-fichier-d-origine` (1) | 13 | baseline Linux |
| `exporter-des-travaux-une-carte-895` « Par étudiant·e » | 7 | baseline Linux |
| `lot-j0-bis-partage-apres-preparation` « réel » | 17 | baseline Linux |
| `nettoyage-sans-perte-892`, deux essais | 20 | baseline Linux |
| `notifications-pile-1224` | 6 | baseline Linux |
| `palette-evaluation-compacte` « la bulle d'aide générale » | 13 | baseline Linux |
| `planif-zone-non-planifie-929` | 16 | baseline Linux |
| `standards-sans-portfolio-lot-4` CHIM-1 | 17 | baseline Linux |
| `parcours-2-ma-classe`, quatre essais | 3 | liste des 17 de #1293 |
| `parcours-je-regarde` « Mettre ta classe en place » | 13 | liste des 17 de #1293 |
| `tableau-de-notation-1`, 820 px, standards | 4 | liste des 17 de #1293 |
| `vue-simple`, novice | 5 | liste des 17 de #1293 |
| `dissection-legende` L6, 820 × 1 180 | 2 | **hors des listes** |
| `temoin-enregistrement-lot-b`, 768 px, clair | 8 | **hors des listes** (même famille que trois entrées de la baseline Linux, à 1 024 et 1 180 px) |
| `tampons-masques-bibliotheque-1216` « catégorie masquée ou inconnue » | 5 | **hors des listes** (la baseline Linux en a un autre essai) |

Les trois hors des listes, examinés : aucun lot ne touche leur code (ni la dissection, ni le témoin d'enregistrement,
ni les tampons ; lu au diff). Sous Chromium, `dissection-legende` L6 et `temoin-enregistrement-lot-b` à 768 px sont
**verts sur l'assemblage comme sur `main`** (aux deux tailles pour le premier, en sombre et en clair pour le second) :
propres à WebKit Linux. Je ne peux pas dire d'ici s'ils sont neufs : dans le run de `main` du 19 nov. au soir, leurs
fichiers tombaient dans les morceaux 19 et 1 (la répartition change quand des fichiers s'ajoutent), deux morceaux que
l'apt a empêchés de jouer. `tampons-masques-bibliotheque-1216` est **intermittent, préexistant** : sous Chromium,
rejoué trois fois, 3 rouges sur 3 sur `main` et 2 sur 3 sur l'assemblage ; et sous WebKit Linux, dans le run de
`main` (morceau 18, joué), le même essai a rougi puis passé au second essai.

**Passés au second essai** (hors des intermittents de la baseline Linux, pour mémoire) : `parcours-1-et-2` « panneau »,
`critere-algorithmique-tables-de-cas-3b`, `presences-lot-d-enregistrement`, `temoin-enregistrement-lot-b` (360 px
sombre et clair, 768 px sombre), `registre-longitudinal-915` R5, `critere-algorithmique-dit-vrai`,
`bibliotheque-deux-colonnes-1156` (productions), `parcours-je-regarde` « Découvrir », `bulle-largeur-ipad` L2,
`bareme-grille-neuve-1120` « Fermer » (fiche #1291, intermittent connu) ; et ceux des lots nommés plus haut. Les
autres passés au second essai sont déjà classés : `comptes-erreurs-stock-1142` (l'un intermittent de la baseline Linux,
l'autre dans la liste de #1293), et trois échecs connus de la baseline Linux (`palette-retroaction-compacte` sombre,
`planif-corbeille-fixe-1070`, `lot-a-anonymisation-enregistre`).

Ce qui varie entre les navigateurs : WebKit Linux n'est pas Safari macOS (le workflow le dit lui-même, six essais y
sont exclus d'office) ; Chromium rougit en masse sur le codex et l'import, où WebKit Linux passe ; WebKit Linux rougit
sur des gestes au doigt et des parcours que Chromium passe. Le verdict qui garde le push reste celui du Mac.

## 5. Les Nouvelles proposées (rien d'écrit dans `js/changelog-data.js`)

Une entrée pour une version mineure (la 1.251, si rien d'autre ne part avant) :

```javascript
{
    version: '1.251',
    couleur: 'vert',
    titre: 'La grille d’autoévaluation dans les consignes',
    items: [
        'Le PDF des consignes peut joindre une grille d’autoévaluation que l’élève coche avant de remettre son travail : pour chaque critère, tes descripteurs aux deux seuils de l’échelle et la question de la nouvelle case «&nbsp;Pour vérifier&nbsp;» de l’éditeur de grilles. Elle paraît quand l’échelle a ses deux seuils.',
        'Les deux seuils de tes échelles s’appellent maintenant «&nbsp;Seuil minimal de réussite&nbsp;» et «&nbsp;Seuil de maîtrise&nbsp;», et l’éditeur de grilles montre ce nom sur la case du niveau qui le porte.',
        'Dans Conception, «&nbsp;Dupliquer&nbsp;» donne maintenant à la copie ses propres critères, niveaux et commentaires : modifier la copie ne modifie plus l’original.',
        'Dans Alignement pédagogique, une activité glissée vite dans une leçon s’y range bien, à la souris comme au doigt ; elle ne reste plus à côté, ni dans une autre leçon.'
    ]
}
```

D'où viennent les lignes : la troisième et la quatrième sont celles des lots, mot pour mot (rapports
`dupliquer-copie-profonde` et `glisser-alignement`, §6). Les deux premières sont de moi. La deuxième part de celle du
lot des seuils (« Les deux repères de tes échelles portent maintenant leur nom… ») : « repères » y est remplacé par
« seuils », le mot que l'écran de l'échelle affiche désormais. La première dit la condition d'apparition parce que
l'échelle de départ que l'application sème n'a pas de seuils (rapport de l'autoévaluation) : sans cette phrase, un
enseignant qui garde l'échelle de départ chercherait la page sans la trouver.

À trancher par Grégoire : le titre (j'ai mis en avant la seule fonctionnalité neuve) ; l'annonce aux testeurs du
diagnostic « Copies liées à leur source » (Réglages › Données › Maintenance), que le lot #1298 laisse ouverte, n'est pas
dans l'entrée.

## 6. Ce que j'ai supposé

1. **La parenté, au-delà de la lettre de la retouche.** La consigne dit « une copie de celle de la cartouche
   (`inspireDe.sourceId`, dans un sens ou dans l'autre) ». J'ai compté aussi deux copies d'une même source, une copie
   de copie (la chaîne remontée dans les grilles du trimestre) et `idOriginal` (la trace d'un ajout depuis la
   bibliothèque, qui garde lui aussi les identifiants). Ce choix ne fait que retirer des propositions ; s'il est de
   trop, le retirer tient en une ligne de `_parente`.
2. **Un commentaire dans `dupliquerGrille`** plutôt que rien : la consigne disait « dis-le ». Disposition « commenter
   et oublier » : vrai, sans conséquence observable aujourd'hui, mais la fonction régénère les identifiants à
   l'inverse de la règle du 19 nov., et un rebranchement la réveillerait.
3. **#1301** pour la fiche des neuf rouges d'import, et non #1296 : celle du glisser est déjà fusionnée ailleurs.
4. **Les jetons de cache** : un jeton neuf (`f`) pour les trois fichiers touchés par deux lots ; pour ceux qu'un seul
   lot touche, le jeton de ce lot, déjà plus récent que celui de `main`.
5. **Les bancs Chromium** : un fichier qui fixe lui-même sa fenêtre tourne une fois (il choisit ses fenêtres) ; les
   autres tournent en paysage (1 180 × 820) ET en portrait (820 × 1 180), par une configuration temporaire non suivie.

## 7. Ce que la session du Mac doit savoir avant le verdict

1. **L'ordre.** L'accord de Grégoire sur l'entrée des Nouvelles (§5) d'abord ; elle s'écrit ensuite dans
   `js/changelog-data.js` (le jeton de ce fichier dans `index.html` suit, le hook anti-cache le demandera). Puis le
   verdict complet du Mac sur la tête de la branche, puis `release.mjs` en mineure (la 1.251.0 si rien d'autre ne
   part), puis le push de `main`. `origin/main` (`c857b794`) est ancêtre de la branche : la fusion se fait en avance
   rapide, sauf si `main` bouge encore d'ici là (revérifier, et revérifier les numéros de fiches, §1).
2. **Ce que le verdict du Mac peut montrer sans que ce soit une régression des lots.**
   · `parcours-5-monter-ton-cours` « les sept étapes… (1180 px) » : le lot du glisser l'a **retiré** des échecs connus
   (`scripts/playwright-baseline.json`, note du 19 nov.), parce que #1295 le répare. Sous WebKit Linux, il a rougi
   une fois puis passé au second essai. Sur le Mac, le lot l'avait vu vert 3 sur 3 (`--retries=0`, rapport du glisser, §5).
   S'il rougit au verdict, le rejouer seul avec `--retries=0` départage le défaut de l'intermittence. Les deux essais
   du clic du banc `planif-glisser-relachement-1295` n'ont jamais tourné sous Safari (rapport du glisser, §5).
   · « capture 25 » du même fichier : **#1296**, intermittent, absent de la baseline du Mac. Au second essai sous
   WebKit Linux.
   · `descripteurs-niveaux-grille`, « iPad en haut » : au second essai sous WebKit Linux (vert au premier essai sous
   Chromium). Le lot de l'autoévaluation touche son écran (les étiquettes de seuil, la case « Pour vérifier ») : un
   rouge franc sur le Mac serait à regarder de près, pas à classer d'office.
3. **Le stock.** #1298 tarit la source, pas le stock : une copie déjà liée à sa source chez Grégoire le reste. Le
   diagnostic en lecture seule est dans Réglages › Données › Maintenance (« Vérifier les copies liées ») ; il ne peut
   tourner qu'une fois la release en ligne, sur l'iPad et sur le Mac. La réparation reste à lui proposer
   (rapport du lot #1298). Pour le glisser, la question du stock reste ouverte (rapport du glisser, §4).
4. **`CartouchesDecalees` propose moins.** Si Grégoire relance `CartouchesDecalees.verifier()` à la console, une
   cartouche dont la grille trouvée est une copie de la sienne sort maintenant « ambiguë », sans proposition.
5. **Les bancs neufs ou retouchés à voir passer au verdict** : `assemblage-dupliquer-descripteurs-seuils` (neuf, ce
   lot), et ceux des quatre lots (§4). Aucun n'a été joué sous Safari ; ceux qui sont tombés dans les morceaux joués
   de GitHub l'ont été sous WebKit Linux (§4).
6. **Fichiers non suivis à ne pas chercher** : la configuration Chromium temporaire
   (`tests/playwright.assemblage-tmp.config.js`) est exclue par `.git/info/exclude` du conteneur ; elle n'existe pas
   ailleurs.
