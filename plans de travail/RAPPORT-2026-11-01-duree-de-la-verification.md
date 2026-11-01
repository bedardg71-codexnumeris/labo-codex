# Rapport – La durée de la vérification, et la condition de la bascule vers GitHub (1er novembre 2026)

> Écrit par Claude Code sur la branche `lot/verification-plus-rapide`, non fusionnée (consigne : pas avant la mise en ligne du soir).
> Consigne : `plans de travail/CONSIGNE-LOT-2026-11-01-verification-plus-rapide.md`.

## En tête : ce qui touche le lot suivant

Rien ne rend le lot suivant impossible. Mais **le compte des pushs conformes ne peut pas monter tel que les choses tournent**, et cela ne dépend pas de ce lot. **Compte depuis le 25 oct. : 0 sur 3.**

| Pushs de code depuis le 25 oct. | Nombre | Ce qui s'est passé |
|---|---|---|
| Fauchés par le relais | 4 | Le commit de relais part 2 min plus tard et annule le run. Il déclenche un run parce que `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md` n'est pas dans les chemins ignorés. |
| Amputés par le plafond | 5 | 1 à 4 morceaux sur 16 coupés à 30 min, donc « non jugé ». Pour les 3 du 29-30 oct., après la correction d'apt, la coupe tombe dans l'étape de la suite elle-même. |
| Complets | 3 | Ceux du 27 et du 28 oct. : ils ont servi à classer la baseline, ils ne peuvent pas la valider. |

**Le run complet de ce matin n'aurait pas compté non plus.** Je l'ai lancé à la demande sur `0fd0427f`, le même code que le verdict vert du Mac sur `6ab4f080` (aucun écart dans `js/`, `index.html`, `styles.css`, `scripts/`, `tests/`). Résultat : **11 rouges hors des deux listes**.

- 4 sont les cas iPad du témoin d'enregistrement, connus sur le Mac mais absents de la liste Linux.
- 7 sont vertes sur le Mac : deux `lot-i-bis`, `materiel-dissection-2a` et `-11`, `planif-menu-vue`, `standards-sans-portfolio-lot-4`, `annotation-formes-fermees-polygone`.

Le plus long morceau a pris 28 min 47 pour un plafond de 30.

Issue de ces trois constats : **inscrits**, rattachés à la bascule dans `BACKLOG.md`. Rien de corrigé ici.

## La durée : trois parts

Passe de référence : le Mac, 31 oct., **97,6 min** pour 1 220 essais (jeton de verdict, 21 h 41 à 23 h 18 UTC, soit 17 h 41 à 19 h 18 à Toronto).

| Part | Minutes | Part du total | Statut |
|---|---|---|---|
| Démarrage de l'application | 8 à 10 | ~10 % | **estimée** : le nombre vient de GitHub, le coût unitaire du Mac |
| Pauses fixes | ~58 | ~60 % | **mesurée sur GitHub** (60,9 min) ; **estimée** pour le Mac |
| Le reste | ~30 | ~30 % | **estimée**, par différence |

**Ces parts ne sont pas encore mesurées sur le Mac entier.** Aucune passe du Mac n'avait gardé ses rapports. La première passe complète qui suit la fusion les gardera, et `node scripts/mesurer-verification.mjs` donnera les trois chiffres.

### M1, l'ouverture (mesurée, Mac, WebKit, 20 ouvertures)

Les 393 ouvertures écrites dans les specs font toutes `page.goto(index.html)` sans option : **le seul signal commun est l'événement `load`**. Le signal explicite le plus fréquent vient ensuite : `window.dbReady === true`, première attente de 88 d'entre elles.

| Cible | `load` : médiane (extrêmes) | `dbReady` : médiane (extrêmes) |
|---|---|---|
| `index.html`, 1re série | 301 ms (297 à 362) | 329 ms (322 à 395) |
| `publication/` construite | 305 ms (302 à 368) | 334 ms (328 à 398) |
| `index.html`, 2e série | 307 ms (302 à 317) | 334 ms (329 à 347) |

La version publiée ne diffère pas : l'écart entre elle et la racine est de l'ordre de celui entre deux séries de la racine. Une session voisine travaillait sur le Mac pendant la mesure. Mesurée hors de la charge d'une passe, dans une application vide. Dans une vraie spec sur le Mac, l'ouverture coûte ~0,39 s.

**Limite** : la mesure s'arrête au signal. Ce qu'une spec fait ensuite pour préparer ses données (démo, pack) compte dans « le reste ».

### M2, les parts (run GitHub 41303021951, 1 214 essais)

- **Ouvertures par passe** : 1 268, plus 261 rechargements, soit **1 529** sans les reprises (avec : 1 617). D'où 1 529 × 0,33 à 0,39 s = 8 à 10 min sur le Mac.
- **Durée cumulée sur GitHub** : 265 min sur 16 machines, en 30 min de bout en bout.
- Sur GitHub, les ouvertures et rechargements pèsent 45 min. Le chiffre ne se transpose pas au Mac : une machine de GitHub est plus lente.

Les 20 fichiers les plus longs **sur GitHub** (l'ordre peut différer sur le Mac) :

| Fichier | Min | Fichier | Min |
|---|---|---|---|
| `codex-1012-avertissement` | 9,68 | `planif-menu-vue` | 4,37 |
| `critere-algorithmique-calculs-4c` | 8,32 | `bibliotheque-deux-colonnes-1156` | 4,32 |
| `codex-1012-fichier-d-origine` | 7,93 | `e3-renvoyer-trimestre` | 3,58 |
| `1007-propose-codex-avant-suppression` | 7,76 | `codex-1011-ouvert-sans-espace` | 3,41 |
| `critere-algorithmique-calculs-4b` | 7,29 | `bibliotheques-menu-cadre-1148` | 3,36 |
| `bibliotheque-liste-1159` | 6,48 | `lot-e3-creer-ou-modifier` | 3,31 |
| `codex-1012-ancien-zip-par-la-case` | 6,09 | `exporter-des-travaux-une-carte-895` | 3,23 |
| `1007-codex-a-part-avant-suppression` | 5,22 | `materiel-dissection-2a` | 3,23 |
| `evaluation-961-retroaction-ne-suit-plus-les-niveaux` | 5,06 | `bibliotheque-deux-colonnes-1155` | 3,13 |
| `1028-archiver-copies` | 4,61 | `bibliotheque-deux-colonnes-1158` | 2,78 |

Ces 20 fichiers font 103 des 265 min.

### M3, les pauses fixes (instrumentée, chaque `waitForTimeout` chronométré par Playwright)

- **Sur GitHub** : **3 047 pauses, 63,4 min** ; sans les reprises, 2 928 pauses, **60,9 min**.
- **L'estimation à la lecture était cinq fois trop basse** : 772 appels écrits pour 769 s (12,8 min), contre 63,4 min réelles. Les aides tournent plusieurs fois.
- **Passage au Mac** : une pause dure ce qui est écrit, plus un surcoût médian de 57 ms sur le Mac (67 pauses lues) et de 119 ms sur GitHub (1 843 lues). D'où ~3 min de moins, soit ~58 min. Deux specs complètes jouées sur le Mac vont dans ce sens : 66 % et 71 % de leur durée en pauses.
- **Dans ces pauses, 897 (22,8 min) suivent immédiatement une ouverture ou un rechargement.** Elles attendent par un délai une application qui répond en un tiers de seconde.
- **Non comptés** : les `setTimeout` écrits dans un `page.evaluate` (45 lignes du genre dans les specs) ; Playwright ne les voit pas comme des pauses. Ils sont dans « le reste ».

### Une mesure de plus, sur « le reste »

L'enregistrement de la trace (`trace: 'retain-on-failure'`) a un coût. Sur `bibliotheque-liste-1159`, seule, deux fois dans chaque ordre : **92,6 et 92,1 s avec, 78,7 et 78,8 s sans**, soit 15 % de moins. **Une spec, pas la suite** : l'étendre aux 97 minutes serait une extrapolation. L'enregistrement sert à lire un échec : c'est un arbitrage, pas un gain gratuit.

## La condition de la bascule : remplie

**L'identité d'un essai porte le chemin de ses blocs** : `fichier › bloc › titre`, un seul parcours du rapport au lieu de trois. Sur les 1 248 essais de la suite : les 11 paires confondues n'existent plus, aucune identité en double.

### Le compte des entrées : un écart, assumé

| Baseline | Avant | Après |
|---|---|---|
| Mac | 4 connues | 4, fichier intact (aucune n'est dans un bloc) |
| Linux | 22 connues + 28 intermittentes = 50 | 22 + 29 = **51** |

La consigne demandait qu'aucune entrée n'apparaisse. **Une apparaît, et je l'ai décidé** : l'ancienne clé « les trois fenêtres tiennent dans la largeur » (`bibliotheque-liste-1159`) couvrait deux essais qui ne se comportent pas pareil. La clé « les groupes-cours : Mettre de côté » couvrait aussi deux essais, mais l'un seul reste listé.

| Essai | Rouge sur 3 runs | Devient |
|---|---|---|
| Trois fenêtres, 1440 px | 3 | connue |
| Trois fenêtres, 820 px | 2 | intermittente (**l'entrée neuve**) |
| Mettre de côté, 1440 px | 2 | intermittente |
| Mettre de côté, 820 px | 0 | hors liste (vert aux trois) |

C'est la règle de classement de la baseline, appliquée telle quelle. Sans cette entrée, l'essai à 820 px rougirait « nouveau » au premier soir où il échoue, et le verdict changerait. Contrôle : la règle rejouée sur les 51 entrées, 0 écart. 14 autres entrées Linux changent seulement de clé, parce qu'elles sont dans un bloc.

### Le juge rejoué : même verdict partout

| Rapport | Code avant | Code après | Ce qui change dans le compte |
|---|---|---|---|
| GitHub, 27 oct. | 0 | 0 | 23 connues + 15 interm. → 22 + 16 |
| GitHub, 28 oct. (00 h 44 UTC) | 0 | 0 | 22 + 11, inchangé |
| GitHub, 28 oct. (22 h 59 UTC) | 0 | 0 | 23 + 22 → 22 + 23 |
| GitHub, 1er nov. (le dernier complet) | 1 | 1 | 11 nouvelles, les mêmes ; 22 + 17 → 21 + 18 |
| Mac, `temoin-enregistrement-lot-b` seule | 0 | 0 | 4 connues rouges, inchangé |
| Mac, `bibliotheque-liste-1159` seule | 0 | 0 | aucune rouge |

Chaque écart de compte vient de l'essai scindé : l'ancien juge comptait deux échecs pour une seule entrée connue. **Le rapport du Mac est partiel** (deux specs seules) : aucune passe entière n'est gardée, et une passe lourde était exclue aujourd'hui. Le rejeu sur une passe entière viendra avec la première qui suit la fusion.

### La contre-épreuve

Un vrai rapport de Playwright : deux essais de même titre dans deux blocs d'un fichier, celui de 1440 px vert, celui de 820 px rouge ; la baseline connaît celui de 1440 px.

- **Avant** : le juge dit « aucune rougeur nouvelle », code 0. Il les confond.
- **Après** : « 1 nouvellement rouge », `à 820 px › le geste`, code 1 ; et celui de 1440 px « redevenu vert ».

Les essais neufs ont été cassés un à un, chaque fichier restauré (somme de contrôle vérifiée) : chacun rougit. Détail dans l'en-tête de `tests/unit/sentinelle-ci-verdict-morceaux.test.js` et de `tests/unit/sentinelle-verdict-en-morceaux.test.js`. `EXCLUS_WEBKIT_LINUX` et son cliquet tiennent, inchangés : ils jugent par fichier et titre, pas par identité. Vitest : 10 625 sur 10 625.

**Pour le lot suivant** : une identité n'est plus un filtre direct. Pour en tirer un `--grep` il faudra convertir les ` › ` (Playwright sépare fichier, bloc et titre par des espaces).

## Ce qui reste à faire

1. **Après la mise en ligne du soir** : rebaser la branche sur `main`, fusionner. Elle part avec la vérification complète suivante.
2. **À la première passe complète qui suit** : `node scripts/mesurer-verification.mjs` (lit la passe gardée dans `~/Library/Caches/labo-codex/derniere-verification/`) et remplacer ici les parts estimées par celles du Mac. Rejouer le juge sur cette passe entière.

## Ce qui a été ajouté

- `scripts/verdict-en-morceaux.mjs` garde les rapports de la dernière passe, hors dépôt, et remplace la précédente. Ne rien pouvoir garder n'empêche jamais un verdict.
- `scripts/mesurer-ouverture.mjs` (M1), `scripts/mesurer-verification.mjs` (M2, M3).
- Aucun correctif de l'application ni des specs.

## Supposition nommée

J'ai lancé une passe à la demande sur GitHub (run 41303021951) sans la demander : les rapports complets de GitHub expirent en 2 jours et la consigne en exigeait un récent. Elle est gratuite sur un dépôt public, ne charge pas le Mac et n'annule aucun push. Elle ne compte pas pour le critère, qui porte sur des pushs. Les rapports des 27 et 28 oct. viennent du dossier temporaire d'une session antérieure, qui les avait gardés.
