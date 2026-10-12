# Demande de relecture – lot 19 : l'outillage qui dit vrai

> Claude Code, 11 octobre 2026, 17 h 17 (mesuré par `date`). Consigne : `CONSIGNE-DU-JOUR.md`, série des lots 14 à 19.
> Sur `main`, **non poussé, pas de release, pas de verdict Playwright**. Vitest complet vert (745 fichiers, 8 680 essais). Une spec Playwright lancée seule (§ 2).

## 1 · Ce qui change pour l'usager

- Cadre (élèves, horaire, groupes-cours) : dix encarts qui appelaient un arrondi inexistant, et s'affichaient donc à coins carrés, prennent ceux de la palette ; huit autres bougent d'un ou deux pixels (#595, famille des arrondis).
- Rien d'autre à l'écran : le reste du lot est de l'outillage.

## 2 · Fiche par fiche

| Fiche | Commit | Remesure sur main | Geste |
|---|---|---|---|
| #980 | `da52e4d2` | `pousser.sh` calcule la plage et lance le verdict sur l'arbre de travail, quelle que soit la référence demandée | une référence (source ou destination) autre que la branche courante est **refusée** (`scripts/ref-poussee.sh`, sourcé) ; options en tête passées |
| #679 | `9255cacb` | 316 couples fichier:classe sans règle CSS (beaucoup de crochets pour le JS) | détecteur (`_helpers/classes-sans-regle.js`) et cliquet figé (`fixtures/cliquets/`) |
| #642 | `153c9079` | 139 masquages de `cle()` dans 52 fichiers | détecteur des cinq formes (défaut et commentaires écartés), témoin sur un fichier fabriqué, cliquet par fichier |
| #784 | `be9aeb0b` | 9 conteneurs réécrits par `innerHTML` qui logent, dans `index.html`, des éléments à id ou à action | détecteur et cliquet ; témoin : remettre le défaut de #783 rougit |
| #616 | `548902e8` | 85 lignes `{0,N}` dans 44 bancs qui lisent la source (31 fichiers le 30 août : le nombre a monté) | cliquet qui ne descend que ; le rebornage un à un est coupé |
| #595 (radius) | `f07ae2e6` | `--radius-standard` (sans repli), `--radius-sm`, `--radius-md` : 18 usages | cartes, conteneurs, formulaires et sections → `--radius-grand` ; lignes et petits encarts → `--radius-moyen` ; `sm` → `--radius-petit` ; `md` → `--radius-moyen` ; trois noms sortent du cliquet #567 |
| #979, #955 | — | **se ferment sur la mesure** : plus de déclencheur `schedule` depuis `fd1338a1` (#1048, 10 oct.) | aucun |
| #685 | — | **se ferme sur la mesure** : `triptyque` 20/20 (`--retries=0 --repeat-each=5`, charge 3,5 à 6,5), après 10/10 le 19 sept. ; la garde de charge est posée depuis | aucun |

Vérifications : #980 3 mutations rouges (dont l'appel retiré de `pousser.sh`) ; #679 2 (la seconde a d'abord visé une classe stylée par `index.html`, refaite sur une classe de la liste) ; #642 3 ; #784 1 ; #616 1 ; #595 1. Spec `triptyque` lancée seule (20 verts) ; ce n'est pas un verdict.

## 3 · Coupé, avec la mesure

- **#595, le reste** : 68 noms (bordures, gris, orangés, accents…), chacun un choix de couleur dans la palette. Je n'ai fait que les arrondis, où la palette nomme déjà le rôle.
- **#616** : reborner les 44 bancs, un par un.
- **Les trois inventaires figés** (#679, #642, #784) sont à trier : une partie est voulue (crochets, gabarits d'attente), une partie est un défaut.

## 4 · Trouvailles (issue 2, inscrire et continuer)

- `btn-primaire` est posé par `accompagnement.js` et `accueil.js`, et n'a aucune règle ; le nom de la palette est `btn-principal`. Il est dans l'inventaire de #679.

## 5 · Ce que j'ai supposé – une ligne chacune

- #980 : refuser plutôt que « juger la référence demandée » : le verdict ne peut jouer que l'arbre posé.
- #595 : le rôle décide l'arrondi (cartes et conteneurs : grand ; lignes : moyen), selon les commentaires de la palette ; non vu au navigateur.
- #642 : la fiche comptait 20 masquages dans `import-export.js`, j'en compte 13 commentaires écartés ; `cartouches.js` n'en porte plus.
- #784 : le nom de variable est lu par fichier, sans portée : une approximation assumée, que le cliquet rend sans risque (il ne fait que descendre).
- Les fiches #979, #955, #685 et #791 (lot 18) sont à fermer au BACKLOG ; je ne l'ai pas fait (BACKLOG tenu par Cowork).

## 6 · Item de Nouvelles proposé

« Dans le Cadre, les encarts des élèves, de l'horaire et des groupes-cours retrouvent leurs coins arrondis. »
