# Demande de relecture – étape 2b du critère algorithmique : la palette

> Claude Code, jeudi 22 octobre 2026, 21 h 50 (Toronto, mesuré par `date`), sur `main` : un commit non poussé après `6cac9b1d`. Consigne : `CONSIGNE-DU-JOUR.md` (Cowork, 20 h 51), incluse dans ce commit (elle n'était pas suivie). Ni verdict complet ni version : au signal de Grégoire.

## Ce qui est fait

- **Un module pur, `js/palette-algo.js`**, dit ce que la palette montre : les blocs d'un critère (`blocs`), leurs noms en mots, leurs deux groupes, ce qu'une zone offre (`reperesDeZone`) et le nom d'une zone (`nomDeZone`). Ce sont les repères des deux registres, réunis : `{erreurs}` et `{mots}` ne font qu'un bloc chacun. Sans projection, la palette n'a aucun bloc de palier. Le jeton ne change pas.
- **Le gabarit (`js/grilles.js`)** rend une palette par critère algorithmique (`rendrePaletteAlgo`), à gauche de tout le gabarit (`.gabarit-algo-atelier`). Les rangées « Poser : » sont parties, partout : `rendreBoutonsReperes`, `reperesPalier`, `_zoneCibleDuPalier`, `data-zone-active` et les classes `.reperes-enonce*`. Chaque zone porte son nom (`data-nom-zone`). Le décompte s'appelle « Décompte des <ce qu'on compte> ». Un critère sans noms garde « Décompte des erreurs ».
- **La cible** : au `focusin` d'une zone, `ciblerPaletteAlgo` nomme la zone et active ce qu'elle offre. Les autres blocs passent en `aria-disabled` et disent « Ce texte ne le remplit pas. ». La pose (`insererRepereEnonce`) vise la zone au focus, sinon la dernière visitée depuis le rendu, sinon rien. `pointerdown` est annulé sur toute la palette, et rien n'est re-rendu à la pose.
- **Les chips** (`composeur-badges.js`) montrent le nom du bloc. La croix reste. `monterVuesBadges` passe la palette nommée de chaque zone (`nommer`).
- **Les textes** : `TEXTES-2026-10-22-palette-critere-algorithmique.md`, avec leurs sites. Les deux notes qui expliquaient le geste et les couleurs sont raccourcies.

## Mes suppositions (à corriger en dix secondes)

1. La palette est **à gauche**, comme celle de la dissection. Elle s'étend à côté de tout le gabarit : noms, sous-critères, cartes.
2. **Le seuil est de 754 px de gabarit** (220 de palette, 14 d'écart, 520 de formulaire). Mesuré : le gabarit fait 922 px à 1 440 de large (palette à côté), 675 px à 1 180 (iPad couché) et 649 px à 820 (iPad portrait). **Sur l'iPad, dans les deux sens, la palette passe donc au-dessus**, et elle ne colle pas : pour poser un bloc dans un palier, on remonte jusqu'à elle. Le curseur survit à ce défilement (mesuré à 820 px). Si ce n'est pas l'usage voulu, il faut une autre règle, et elle revient à Cowork.
3. Les blocs `{nomErreurs}` et `{nomMots}` se nomment par **le mot lui-même, entre guillemets** (« « unités manquantes » »). C'est aussi ce que la chip montre dans la phrase. La question est posée dans le fichier des textes.
4. **Sans zone visitée**, les blocs sont tous inactifs, sans la mention « hors zone » : la ligne d'invitation la remplace.
5. L'aide de `{points}` est coupée en une aide et une précision. Les aides du registre des énoncés (`REPERES`) ne servent plus à l'écran pour les quatre blocs nommés. Je les ai laissées : la palette les remplace, et le banc de l'étape 1 les lit encore.

## À regarder en premier : la palette « collante » a demandé de toucher deux règles hors du gabarit

**Mesuré dans WebKit et Chrome** : aucun `position: sticky` de l'application ne colle. Ni la barre de navigation, ni les `.sidebar-navigation`, pourtant prévues collantes. La cause : `body { overflow-x: hidden }` (style en tête d'`index.html`) et `.conteneur { overflow: hidden }` font de ces deux éléments des conteneurs de défilement qui ne défilent pas. C'est `html` qui défile.

**Ce que j'ai fait** (`styles.css`, au début du bloc de la palette) : `overflow: clip` au lieu de `hidden`, qui rogne pareil sans créer ce conteneur. Ce changement ne joue que si une palette est à l'écran (`:has`) **et** à partir de 1 200 px. À 820 px, ouvrir `body` réveillait les sous-navigations mobiles (≤ 1 024 px), collantes par leur règle, qui recouvraient le contenu : capture vue, puis corrigée par la borne.

**Effet de bord, nommé** : sur l'écran d'une grille algorithmique, au Mac, **la barre de navigation et la liste des grilles collent**, comme leurs règles le prévoient. Sur les autres écrans, rien ne change.

**Trouvaille hors du lot** (issue 3, commentée dans le code à cet endroit) : le collant est cassé dans toute l'application. Le réparer partout est une décision visuelle globale. Je ne l'inscris pas au BACKLOG, puisque Grégoire ne l'a pas vécu comme un symptôme. Cowork en décide.

Une limite se voit aussi : quand la zone visée est le dernier palier, la fin du gabarit pousse la palette (796 px de haut) vers le haut, et sa ligne de cible glisse sous la barre de navigation.

## Le toucher, sous WebKit émulé

Sous le WebKit de Playwright, avec `hasTouch`, un `pointerdown` annulé fait tomber le clic d'un toucher émulé. Un bouton témoin sans annulation, lui, reçoit le clic. C'est le mécanisme du 3 sept., que la consigne demande de garder, et que Grégoire emploie au doigt sur son iPad depuis. L'essai iPad éprouve donc la pose **par le clic**, à la largeur et à la mise en page de l'iPad. Les 44 px sont mesurés. **Le toucher réel reste le geste à vérifier à l'écran.** Je n'ai pas changé de mécanisme.

## Les tests

- **Banc neuf** `tests/unit/critere-algorithmique-palette.test.js`, 17 essais :
  - **P** : la sentinelle. Une palette par critère, plus aucune rangée. Chaque zone ciblée n'active que `reperesDeCle` ou `listerReperes`, et dit les autres.
  - **N** : les noms, les groupes, l'élision, les chips.
  - **G** : le garde-fou. Rédaction contre chimie sans projection, aucun « erreur » ni « mot » dans la seconde. G.c dit la limite des cinq libellés de palier.
  - **X** : un nom piégé reste du texte dans la palette, les étiquettes et les chips.
  - **S** : un critère d'avant rend les phrases d'hier, mesurées sur `6cac9b1d`. Le rendu n'écrit rien. Un bloc porte son jeton.
- **Repris au nouveau dessin** : `sentinelle-texte-troue-etape-1-reperes` (E), `-etape-2-gabarit` (B, D, E), `-etape-2-une-seule-carte`, `sentinelle-carte-bilan` (B.a), `sentinelle-composeur-badges` (B.a, F.b), `sentinelle-composeur-branchement` (B, C ; B.e et C.c sont neufs) et `sentinelle-lot4-C-gabarit-algo-range` (G.c).
- **Cliquets** :
  - #467 : `grilles.js` passe de 73 à 72 (la rangée des paliers).
  - #679 : `palier-projection` avait perdu son lecteur JS. Il garde une règle, l'écart que donnait la rangée.
  - #858 : les tranches passent par `tranche()`.
  - Complexité : `monter` remonte à 15 grâce à `_paletteMontee`.
- **Spec WebKit neuve** `critere-algorithmique-palette.spec.js` :
  - Mac : palette à gauche et collante. Bloc posé à la souris dans le verdict du palier 6, à plus d'un écran du haut du gabarit, puis dans « Défi prioritaire » après une frappe. Le focus et le curseur restent après le bloc.
  - iPad portrait : palette au-dessus (649 px de gabarit), blocs de 44 px au moins, aucun débord, pose loin de la zone.
  - Le même spec passe dans Chrome.
- **Specs reprises** : `texte-troue-reperes-enonces` (la cible ; sans zone visitée, rien ne se pose), `texte-troue-paliers-projection` et `texte-troue-badges-dans-la-phrase`.
- **Résultats, 22 oct. au soir** :
  - Vitest depuis `tests/` : 810 fichiers, 9 535 tests, tous verts.
  - WebKit : `critere-algorithmique-*`, `texte-troue-*`, `lot4-gabarit-algo-cartes`, `collections-projection` et `codes-par-grille-gabarit`, 26 passés, 1 sauté (les captures, lancées à part).
- **Break-tests** joués : module muté, banc lancé, module remis. L'empreinte sha256 est identique avant et après.

| Mutation | Ce qui rougit |
|---|---|
| `ciblerPaletteAlgo` active tous les blocs | P.c, branchement C.a |
| `{erreurs}` nommé en dur « Nombre d'erreurs » | N.b, N.d, N.e, G.a, G.b, G.c |
| « Compte de » au lieu de « Compte des » | N.b, G.b |
| nom du bloc non échappé | X.a |
| la chip montre le nom de code | N.d |
| la pose ne contrôle plus l'offre de la zone | **rien d'abord** (`insererRepere` refuse déjà un jeton hors palette), sauf pour une zone qui n'offre rien : B.e, ajouté, rougit |
| la pose oublie la dernière zone visitée | branchement B.a, B.c, B.d, C.c ; étape 2 D.a, D.d, D.f |
| les blocs des paliers offerts sans projection | P.d, G.a, étape 2 B.e |

## Captures

Elles sont dans `captures-2026-10-22-palette-critere-algorithmique/`. Ce sont des captures de la fenêtre : une capture d'élément plus haute que l'écran se recoud et perd la palette collante.

- Deux cas : une rédaction avec projection (curseur dans le verdict du palier 2) et une chimie sans projection (curseur dans son décompte).
- Deux largeurs : 1 440 et 820 px.
- Deux moteurs : WebKit, et Chrome (le Chrome installé, nommé `chromium` par Playwright).
- Pour chacun, `-1-palette` montre la palette en tête et `-2-zone` la zone visée. Seize en tout.

## Ce que ça ne touche pas

- Les jetons enregistrés, les textes écrits, ce que lit l'élève : banc S.
- Le stock : rien n'est écrit au rendu.

## L'item des Nouvelles (proposé, pas écrit)

> **Une palette pour composer les phrases d'un critère algorithmique.** À côté du critère, chaque bloc porte un nom et une description, avec tes propres mots (« Compte des unités manquantes »). Place le curseur dans un texte et touche un bloc : il s'y pose. Les blocs qu'un texte ne peut pas remplir le disent.
