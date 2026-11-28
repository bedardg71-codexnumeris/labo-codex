# Rapport : la release 1.260.0 de l'assemblage du 27 novembre 2026

**Branche** : `lot/assemblage-2026-11-27`, partie de `main` (`dceb679f`, 1.259.0). `main` mesuré à `dceb679f` à l'ouverture : il n'a pas bougé.
**Fait** : le pack de la démo renommé, la release 1.260.0 (build `1127-1907`) au commit `d355426ab`, Vitest complet, le verdict WebKit complet, jeton **vert** sur ce commit.
**Reste** : le feu vert de Grégoire, puis la fusion vers `main`, le push, l'entrée de `RELAIS.md`, la mesure de `main` et de `version.json` en ligne ; la base Linux après un job « Playwright — verdict » vert sur GitHub.
**Pas fait, comme demandé** : ni fusion, ni push sur `main`, ni `RELAIS.md` sur `main`.

## 1. Les comptes

| Mesure | Résultat |
|---|---|
| Commit de la release | `d355426ab` (1.260.0, build `1127-1907`) |
| Vitest complet, depuis `tests/`, sur `d355426ab` | 985 fichiers, 12 683 essais verts, 53 s |
| Playwright WebKit, sur `d355426ab` | 1 952 essais joués : 1 915 verts, 19 verts au second essai, 18 rouges, 65 sautés |
| Les 18 rouges | 18 connus de `scripts/playwright-baseline.json`, **0 neuf** |
| Essais non joués | 0 |
| Jeton du Mac (`scripts/.verdict-playwright.json`) | **vert (code 0) sur `d355426ab`**, rendu le 27 nov. à 21 h 51 |

Par rapport à la passe de l'après-midi (`618acdeb`) : les trois rouges neufs ont disparu (21 rouges, puis 18), comme attendu des trois recalages.

## 2. Le pack de la démo

- `js/pack-demo-10.js` : la pratique `demo-std-litt` s'appelle « Hybride (démo) ».
- `tests/integration/bibliotheque-deux-colonnes-1156.spec.js` : sept occurrences remises à « Hybride (démo) ». Banc rejoué en entier : 18 verts sur 18 (un saut voulu, les captures). La fenêtre recalée à 500 de haut tient avec le nom plus court.
- `sentinelle-sel-sans-pan-2026-11-21` (C) : l'exception de la démo est retirée, le nom du pack est jugé comme les autres.
- `sentinelle-familles-cum-hyb-2026-11-27` : en C, le commentaire d'attente devient une assertion sur le nom du pack ; en D, le filtre qui écartait le pack est retiré.
- **Break-test** : l'ancien nom remis dans le pack, les deux sentinelles relancées : 3 rouges (C de la première, C et D de la seconde). Pack remis à l'identique (sha256 vérifié).

## 3. Source ou stock : ce que garde une démo déjà ouverte

**Le renommage tarit la source. Le stock reste à l'ancien nom. Rien n'a été réécrit.**

Mesuré avec les modules réels (`js/demo-namespace.js`, `js/pack-demo-10.js`), dans un banc Vitest temporaire, retiré après la mesure :

| Cas | Nom de la pratique `demo-std-litt` en base |
|---|---|
| Démo installée avant la release | « Par sélection de productions (démo) » |
| La même, application rechargée avec le pack neuf | « Par sélection de productions (démo) », **aucune clé écrite** |
| Après « Remettre la démo à neuf » | « Hybride (démo) » |
| Démo jamais installée, pack neuf | « Hybride (démo) » |

- La cause : la version du pack reste 21.3. `initialiserDemoNamespace` ne réécrit `demo_*` que si cette version change ; sinon il n'ajoute que le troisième groupe s'il manque.
- Ce que la personne verra : dans sa démo déjà ouverte, la rangée de la pratique garde son ancien nom ; la famille affichée à côté dit « Hybride » (elle vient du type, pas du nom). C'est cohérent avec la ligne 1 des Nouvelles : « Une pratique que tu as déjà créée garde son nom. »
- Aucun code ne cherche cette pratique par son nom (seul le pack l'écrivait ; les lecteurs passent par l'id).
- **Issue : assumé et écrit ici, pas réparé.** Monter la version du pack réécrirait `demo_*` chez tout le monde et effacerait ce que les gens ont fait dans leur démo : c'est une écriture dans des données enregistrées, elle remonte à Grégoire.

## 4. La release

- `node scripts/release.mjs minor` : 1.259.0 devient 1.260.0. Les quatre points de vérité portent `1.260.0` et `1127-1907` (`version.json`, `version.js`, `js/init-inline.js`, `js/main.js`) ; `index.html` charge `version.js?v=11271907`.
- Jetons anti-cache : 68 fichiers posés par le script, rien à la main. Ils sont à `20261127b` (voir l'écart au § 6).
- **Les Nouvelles 1.260** : le titre et les cinq lignes de Grégoire, mot pour mot, en tête de `js/changelog-data.js`. Aucune règle du skill ne s'y oppose (une entrée par mineure, pas de date, cinq lignes).
- Zones protégées : `js/config.js`, `js/navigation.js` et `noms_stables.json` ne sont pas dans le diff. Aucun `console.log`, aucun `innerHTML` neuf (le diff de `js/` hors version se limite au pack et aux Nouvelles).

## 5. Le tri des passages lents

Aucun rouge neuf à trier. Trois passages ont été coupés à 8 min par le chien de garde (8b, 11a, 12b) et rejoués en deux quarts chacun ; 13a a été joué d'emblée en quarts, comme l'après-midi.

- 11a : lent, pas figé. Ses deux rouges sont ceux de `nous-faisons-recevoir-2026-11-19` (« voie des fichiers », les deux gabarits), connus de la base (famille A, le WebKit du banc ne range pas une copie). Rejoué seul : rouge de la même façon (l'étape reste à « 2 sur 9 »).
- 8b et 12b : figés au premier jeu (charge basse au moment de la coupe), verts ou à leurs rouges connus en quarts (198 s et 254 s au total). Cause du gel non cherchée.

## 6. Écarts de procédure

1. **La release a pris deux passages du script.** Le premier commit a été refusé par le hook pre-commit (#826) : `js/interventions.js?v=20261127a` avait déjà été posé ce matin par `3f4e8399` (#1254, un lot de l'assemblage, jamais sur `main`). Plutôt que de corriger un jeton à la main, j'ai relancé `node scripts/release.mjs --build-only` : le build passe de `1127-1905` à `1127-1907` et les 68 jetons de `a` à `b`. Le build `1127-1905` n'a jamais été committé (zéro occurrence dans le dépôt).
2. **Vitest a été joué deux fois** : avant le premier commit, puis sur `d355426ab` (le compte du § 1 est celui-là ; même résultat).
3. **Le verdict a été joué avec l'outil qui reprend** (`~/Library/Caches/labo-codex-verdict/`), pas `scripts/verdict-en-morceaux.mjs` d'un bloc : 20 morceaux par demies, sur secteur, sous `caffeinate`, garde de charge et de mémoire avant chaque passage. Mêmes fonctions de jugement, même base, même jeton.
4. **Les quarts ont été joués par un script de session** (`quart.mjs`, hors dépôt) : la même commande que l'outil, plus le rapporteur « line » pour voir un gel. Les huit rapports sont dans la fusion ; `nonJouees` : 0.
5. **Deux appels ont dépassé les 10 min de l'outil et ont fini en arrière-plan** (8b à 19 h 55, 12b à 20 h 30). Rien d'autre n'a tourné pendant ce temps ; je les ai attendus. Ensuite, un seul passage par appel.
6. Mémoire libre entre 76 % et 82 % d'un bout à l'autre ; aucune garde n'a refusé. La passe : de 19 h 08 à 21 h 51.
7. **Ce rapport est committé après le verdict.** Le jeton est reporté sur son commit par `verdict-en-morceaux.mjs --reporter` (diff limité à `plans de travail/`).

## 7. Ce que j'ai supposé

- **La typographie des Nouvelles.** J'ai appliqué celle du fichier, comme pour 1.257 à 1.259 : espaces insécables (`&nbsp;`) dans les guillemets et devant « : », « ; » et « % », apostrophes courbes. Aucun mot ajouté, retiré ni déplacé. Les lignes sont posées sans gras d'ouverture : le texte dicté n'en marque pas.
- **La couleur de l'entrée** : `vert` (nouveautés), comme 1.257 à 1.259.
- **Un seul commit pour le pack et la release**, pour que la sentinelle #825 les voie partir ensemble.
- **Le stock de la démo se mesure sur les modules, pas dans un navigateur** : le chemin est une fonction sans écran. Le banc `copie-demo-bibliotheque-31-oct` (vert au second essai) passe par le rechargement d'une démo ouverte sous WebKit.
- **Les 19 essais verts au second essai ne demandent rien** : aucun n'est dans une spec touchée par ce mandat. Deux touchent la démo (`copie-demo-bibliotheque-31-oct`, `demo-par-standards-2026-11-22`) : verts au second essai, je n'ai pas cherché pourquoi le premier essai a manqué, ni s'ils étaient déjà instables l'après-midi (non vérifié). La liste est dans le jeton (`instables`).

## 8. Ce qui attend le feu vert

1. Fusion de `lot/assemblage-2026-11-27` dans `main` (avance rapide attendue : `main` n'a pas bougé), push selon le § 4.5 de `fin-de-session`.
2. L'entrée de `RELAIS.md`, avec la ligne « complexité ».
3. La mesure de `main` et de `version.json` en ligne (permalien Netlify).
4. La base Linux (`scripts/playwright-baseline-linux.json`, les deux entrées de `planif-menu-vue`) : à retirer dans un commit qui suit, après un job « Playwright — verdict » vert sur GitHub pour ce push. Noté à `RELAIS.md`, pas attendu.
