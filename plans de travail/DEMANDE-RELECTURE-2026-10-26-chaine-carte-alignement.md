# Demande de relecture – La chaîne d'étapes de la Carte d'alignement (#1172, 26 oct. 2026)

> Claude Code, lundi 26 oct. 2026, soir, sur `main` (parti de `daf259ff`). Consigne : `CONSIGNE-LOT-2026-10-26-chaine-carte-alignement.md`. Commits : `85d35ed9` (docs : la consigne, la ligne d'`USAGE-FORMATS`, l'item #1172), puis le lot (code, banc, spec, captures, cette demande). **Ni release, ni verdict, ni push** (consigne § 8).
> Les quatre fichiers de Cowork non commités au départ (`CONSIGNE-DEMARRAGE-COWORK.md`, le plan du 21 oct., l'ébauche et les textes des calculs) sont restés en place, intouchés : ils ne recoupent aucun fichier du lot, et les commits ne nomment que les fichiers du lot (§ 0 de la consigne lu ainsi ; dites-le si vous vouliez un arrêt).

## Vue d'ensemble

Entre la barre d'outils de la carte et le canevas, sept étapes : Compétence, Idées maîtresses, Leçons, Objectifs, Connaissances, Activités, Évaluations (arrivée). Chacune se coche dès que l'élément existe dans la carte active (clones exclus) et dit combien il y en a ; sinon « à poser » (« à écrire » pour les Objectifs). Aucun ton « attention » ni « critique ». Un clic ouvre le guide de la carte à la page de l'étape, ou l'y mène s'il est ouvert ; il n'écrit rien. La case « Afficher les chaînes d'étapes » la masque comme les autres.

## Ce qui est mesuré

| Preuve | Résultat |
|---|---|
| Vitest entier, depuis `tests/` | **9 777 verts / 824 fichiers** (avant : 9 768 / 823 ; + 9 du banc neuf) |
| Banc neuf `unit/chaine-carte-1172.test.js` | 9 cas (A à I) : carte vide ; chaque type seul ; le pluriel ; un clone (et une leçon clonée, et deux clones d'une source absente) ; un objectif vide ou blanc ; les cinq étapes de l'enseignement explicite comptées comme activités, la séquence hors chaîne ; une carte sans compétence mais complète ailleurs ; les sept ids posés sur `GUIDE_PAGES` aux pages 2 à 8. **4 break-tests**, tous rouges, restaurés (`cmp`) : identité des clones retirée (D), objectifs vides comptés (E), id d'une page faussé (H), activités réduites au type `activite` (B, F, G) |
| Spec neuve `integration/chaine-carte-1172.spec.js` (WebKit) | 6 essais + les captures : carte vide (sept clics, stockage comparé), carte garnie (comptes, guide qui ne couvre pas la chaîne), ajout par la palette puis Annuler / Rétablir, la case décochée, 1 440 · 820 · 1 180 px, le plein écran. **6 break-tests**, tous rouges, restaurés : `sauvegarder` sans la chaîne (Annuler/Rétablir) ; un clic qui écrit ; la case qui ne masque plus ; une chaîne qui déborde à 820 px ; le guide qui ne descend plus ; le plein écran (rouge avant sa règle CSS, point 5) |
| Les specs WebKit qui lisent la carte, le guide ou les chaînes (17 fichiers + les deux des chaînes #1149) | **121 verts, 3 rouges, 4 sautées** (10,9 min) ; les 3 rouges, tous dans `planif-tout-voir-loupe`, **causés par le lot** (verts sur `HEAD` sans lui, dans un worktree témoin) : recalés (point 6), puis 4/4 avec et sans le lot. Après la règle du plein écran : les 9 fichiers qui touchent le plein écran ou le guide, **76 verts, 1 sautée, 1 rouge** (`page.goto` hors délai, charge machine : une autre session tournait), **rejoué seul : vert**. La suite complète n'a pas tourné (verdict au signal) |
| Captures | 8 : `plans de travail/captures-2026-10-26-chaine-carte-alignement/` — carte vide et garnie (noms fictifs), 1 440 et 820 px, clair et sombre |
| Le stock (piège 6) | **aucune donnée écrite, rien à migrer** : la chaîne lit `etat.noeuds` ; le clic ouvre le guide. Mesuré par la spec (stockage entier, clé par clé, identique avant et après les sept clics, la fermeture, le bouton « Guide ») |

## Ce que la chaîne prend au canevas (piège 2)

**96 px de hauteur**, à toutes les largeurs (mesuré dans WebKit, carte garnie) ; elle tient sur une rangée sans défiler, même à 820 px, et ne fait pas déborder la page. La zone du canevas passe ainsi de 835 à 739 px à 1 440 × 900 (−11,5 %), de 1 081 à 985 px sur l'iPad en portrait (820 × 1 180, −9 %), de 721 à 625 px en paysage (1 180 × 820, −13 %). Rien n'est abrégé : « 2 idées maîtresses » tient à 820 px. Le dessin est celui du composant commun (`ChaineEtapes`), seulement sans marge ni coins ; le resserrer (nœuds plus petits, une ligne au lieu de deux) ferait une chaîne différente des autres : **à décider par Grégoire s'il trouve le canevas trop court**, pas fait ici.

## Les points à relire en priorité

1. **`etapesChaineCarte(noeuds)`** (`js/planification-carte.js`, après `fermerGuide`). Un clone est compté par l'identité `cloneSourceId || id` : la source et ses clones comptent une fois, et des clones dont la source n'est plus dans la carte comptent une fois pour elle (cas D). Les objectifs : ceux des leçons (`objectifsDeLecon`), au texte non vide après `trim`, comptés sur la première instance d'une leçon clonée.
2. **Le guide à une page.** `GUIDE_PAGES` porte un `id` sur ses pages 2 à 8 (le même que l'étape) ; `rangPageGuide(id)` le retrouve, jamais par indice. `ouvrirGuide(idPage)` : fermé, il s'ouvre à la page ; ouvert, il y est mené sans être reconstruit (et se déplie s'il était replié) ; le bouton « Guide » de la barre l'appelle sans argument et rouvre la page 1, comme avant. Les empreintes des pages 3, 5, 7 et 9 (`sentinelle-guide-carte-966`) tiennent : elles portent sur le titre et le contenu.
3. **Le guide couvrait la chaîne** (piège 3, mesuré : 32 640 px² de recouvrement à 1 440 px). `degagerChaineDuGuide` : à l'ouverture (et quand la chaîne le mène à une page), s'il chevauche la chaîne, il descend 8 px sous elle ; déplacé ailleurs par sa barre, il reste où il est.
4. **La mise à jour** : à la fin de `sauvegarder()` (le point de passage des écritures : ajout, retrait, objectif tapé, annuler et rétablir passent par `restaurerSnapshot` → `sauvegarder`) et de `chargerCarte` (les deux sorties, dont la carte sans contenu, le premier contact).

5. **Le guide caché en plein écran** (corrigé dans le lot, issue 1). Le guide flotte hors de `#conception-carte` (z-index 500) ; le plein écran est à 8000 : le guide s'ouvrait dessous, invisible. **Préexistant** (mesuré sans le lot : le bouton « Guide » de la barre fait pareil), mais il cassait le parcours livré : en plein écran, un clic de la chaîne ne montrait rien. Une règle : `body.planif-plein-ecran-actif #planif-guide-panel { z-index: 8100 !important }`, sous la barre d'alignement (8500), la loupe (9000) et les modales (9999) ; `!important` parce qu'un clic sur le guide lui pose un z-index en ligne (81 et plus). Répare le bouton « Guide » au passage.
6. **`planif-tout-voir-loupe` recalé** (tests seulement). Le banc ouvre la carte sans faire défiler la page, dans une fenêtre de 720 px où le canevas commençait à 594 px ; la chaîne le pousse à 690, et les blocs visés tombaient sous le bord. Le banc amène désormais la carte en haut de l'écran (`scrollIntoView`) avant le geste ; les quatre invariants sont inchangés. Même famille que le recalage du 26 oct. au matin (#1148, barre plus haute de 28 px).

## Trouvaille, hors lot (issue 3 : commentée, pas inscrite)

**Un bloc ajouté par la palette demande deux « Annuler » pour disparaître.** Le bloc neuf ouvre son titre en édition, et le focus du titre empile un instantané d'annulation : le premier Annuler rend l'état de ce focus (le bloc y est), le second le retire. Mesuré le 26 oct. dans WebKit, antérieur au lot ; la chaîne suit chaque pas fidèlement. Pas au BACKLOG : aucun symptôme vécu par Grégoire (règle du 24 août). Commenté dans la spec, à l'endroit où l'essai le rencontre.

Vu en capture, sans rien en faire : sur une carte sans séquence, le Planificateur dit « Aucune séquence — glisse un nœud « Séquence » sur la carte pour planifier ici. », alors que le guide (page 4) et Grégoire (21 h 16) disent les séquences facultatives. Texte d'avant le lot ; à Cowork de juger s'il mérite une question.

## Ce qui tournait à côté

Une autre session a ouvert le worktree `.claude/worktrees/tri-git` à 21 h 30, pendant ce lot (branche `tri-git` : CI, `scripts/verdict-en-morceaux.mjs`, baseline Linux) ; **aucun fichier en commun** avec ce lot. Ses suites ont pu charger la machine (le `page.goto` hors délai ci-dessus).

## Portes terrain

**Aucune due** (skill `portes-terrain`, règle 2) : le lot n'écrit rien, c'est de l'affichage et du comportement ; un raté se voit et se dit à l'usage. Ce qui reste non vérifié, dit ici plutôt qu'en porte :
- Safari réel sur le Mac et l'iPad (seul WebKit de Playwright a tourné) ; le toucher sur la chaîne à l'iPad (cibles mesurées à 72 × 75 px au moins) ;
- sa vraie carte, dans Chrome : les comptes sur une carte réelle (clones liés nombreux, cartes importées d'un autre trimestre) ;

## Ce qui n'est pas fait (consigne § 7)

Aucun jugement d'alignement dans la chaîne ; les séquences ; le pont vers les productions ; le guide non réécrit (un `id` ajouté à sept pages, aucun texte touché) ; rien n'est écrit dans une carte.
