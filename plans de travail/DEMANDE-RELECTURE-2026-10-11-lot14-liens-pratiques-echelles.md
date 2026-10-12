# Demande de relecture – lot 14 : les liens entre pratiques et échelles qui tiennent

> Claude Code, 11 octobre 2026, 16 h 20 (mesuré par `date`). Consigne : `CONSIGNE-DU-JOUR.md`, série des lots 14 à 19 (Cowork, 15 h 22).
> Sur `main`, **non poussé, pas de release, pas de verdict Playwright**. Vitest complet vert à la fin du lot (727 fichiers, 8 616 essais).

## 1 · Ce qui change pour l'usager

- Rouvrir une archive en « copie en double », importer une sélection d'un fichier, ou importer un partage : quand l'échelle reçue change d'identifiant, la pratique qui la désigne la suit, quelle que soit la forme sous laquelle elle range son lien (#663, #627).
- « Dupliquer » une échelle, une grille, une cartouche, une pratique ou une production (barre latérale, bibliothèque, « Dupliquer et éditer ») : la copie ne répond plus à l'identifiant de sa source ; deux jumelles ne se confondent plus (#586).
- Évaluation : l'échelle de la pratique et celle de la bibliothèque sont lues par la même résolution que le reste de l'application ; une échelle de pratique sans niveau n'est plus offerte au menu (#580).
- Après un import de cartouches, d'échelles, de pratiques ou de productions, la bibliothèque ouverte conduit l'œil à la carte importée, comme pour les grilles ; si un filtre la masque, la notification le dit (#793).

## 2 · Fiche par fiche

| Fiche | Commit | Remesure sur main | Geste |
|---|---|---|---|
| #663, #627 | `eec2354d`, `428aba6c` | réserve : seul `config.echelleId` remappé ; import sélectif (lot 3) : seule la racine `echelleId` ; partage : rien | `rebrancherEchellePratique` (`import-export.js`) traite `configuration`, `config` et la racine, sans toucher l'objet lu ; appelé par la réserve et l'import sélectif ; le partage rebranche `configuration.echelleId` si l'échelle est dans le package ; la détection « échelle manquante » de la réserve lit les trois formes |
| #586 | `28d6f5b5` | quatre chemins d'échelle sur cinq emportaient `idOriginal` ; même chose dans les quatre autres familles | huit sites `delete <copie>.idOriginal`, à côté de `auteurOriginal` (option B de Grégoire, 28 août) ; les chemins à liste blanche ne le recopiaient déjà pas |
| #580 | `6f48c2ae` | trois reconstructions par liste blanche (pas deux) dans `evaluation-chargement.js` | les trois passent par `obtenirEchelleResolue` |
| #793 | `13d223f7` | les quatre familles ne pointaient rien | `BibliothequeUI.conduireAuxImportes` ; les grilles passent dessus (même comportement), les quatre autres l'appellent |
| #579 | — | **non traitée**, voir § 4 | — |

Vérifications : #663, 10 mutations, 10 rouges (les trois formes, la copie du sous-objet, la clé héritée, chaque chemin). #586, 3 mutations rouges. #580, 3 mutations rouges (la troisième, `chargerProduction`, ne rougit que par le compte statique des appels : son effet n'a pas de témoin au banc). #793, 7 mutations rouges. Bancs mis à jour : #939 (le résolveur fourni au harnais), #467 (le geste commun ajouté au faux `BibliothequeUI`), lot 3 de l'import sélectif (deux essais sur la forme `configuration`).

## 3 · Mots d'écran

Aucun neuf. #793 reprend les deux phrases des grilles (« Aucune n'apparaît dans la liste : … »), au féminin, qui vaut pour les cinq familles.

## 4 · Ce qui revient à Grégoire

**#579 – la remesure change la fiche.** Elle disait « aucun écrivain de `config.echelle` ». Faux : « Dupliquer » et « Dériver une variante » d'une pratique (`pratiques.js` ≈ 875, `config: clone(configResolue)`) écrivent une copie **figée** de l'échelle référencée. Le menu de l'évaluation offre alors « <nom> (Pratique active) » et le présélectionne ; les évaluations portent `pratique-<id>`, et leurs repères de maîtrise viennent de cette copie, qu'aucun écran ne permet d'éditer. Remède possible : résoudre `pratique-<id>` par la référence (`configuration.echelleId`) avant la copie embarquée. Les repères deviendraient modifiables dans l'éditeur d'échelle, mais **les notes déjà calculées sous `pratique-<id>` suivraient toute retouche ultérieure de l'échelle**, et `construireConfigComplete` (qui lit l'embarquée d'abord) serait à aligner. C'est une décision sur ce qu'une note veut dire. Fiche laissée telle quelle.

## 5 · Ce que j'ai supposé – une ligne chacune

- #627 : seul le lien pratique ↔ échelle est traité ; l'unification des quatre remaps (titre de la fiche) reste ouverte, elle est laborieuse.
- #663 : dans le partage, le schéma n'a ni `config` ni `echelleId` à la racine ; seul `configuration` est rebranché.
- #663, #586 : source seulement ; les pratiques déjà mal liées et les jumelles déjà écrites ne sont pas réécrites.
- #586 : les neuf autres écarts de #476 ne sont pas touchés (non qualifiés).
- #580 : une échelle sans niveau n'est plus offerte, et au chargement d'une production elle cède aux niveaux de la cartouche (avant : liste vide). Une échelle désignée par son `idOriginal` est reconnue.
- #793 : le rendu réel des quatre familles n'est pas vu au navigateur ; seul celui des grilles a une spec Playwright.
- Trouvaille, issue 3 (commenter et oublier, ici notée) : `afficherCriteresDepuisGrille` garde un repli IDME écrit en dur quand aucune échelle ne se résout ; code étranger, sans symptôme vécu.

## 6 · Item de Nouvelles proposé

« Après un import dans une bibliothèque, la carte importée est mise en évidence pour les cinq familles, et une copie faite par « Dupliquer » ne se confond plus avec son original. »
