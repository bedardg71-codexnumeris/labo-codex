# Rapport : le verdict WebKit de l'assemblage du 27 novembre 2026

**Branche** : `lot/assemblage-2026-11-27`, partie de `main` (`dceb679f`, 1.259.0). Verdict rendu sur `618acdeb` ; trois commits d'essais depuis (`97449aa47`, `27505b512`, `e135b1aab`).
**Fait** : Vitest complet (deux fois), le verdict Playwright WebKit complet, le tri des rouges, trois recalages d'essais.
**Reste** : une passe complète pour un jeton vert (elle revient à la release) ; les regards à l'écran des huit lots ; une chose à regarder par Grégoire avant la release (§ 4).
**Pas fait, comme demandé** : ni bump, ni changelog, ni push sur `main`.

## 1. Les comptes

| Mesure | Résultat |
|---|---|
| Vitest complet, sur `618acdeb` (depuis `tests/`) | 985 fichiers, 12 683 essais verts, 56 s |
| Vitest complet, sur `e135b1aab` (après les trois recalages) | 985 fichiers, 12 683 essais verts |
| Playwright WebKit, sur `618acdeb` | 1 952 essais joués : 1 908 verts, 23 verts au second essai, 21 rouges, 65 sautés |
| Les 21 rouges | 18 connus de `scripts/playwright-baseline.json`, **3 neufs** |
| Jeton du Mac (`scripts/.verdict-playwright.json`) | **rouge (code 1) sur `618acdeb`** |

- Aucun des 18 rouges connus n'est dans une spec que l'assemblage a touchée (21 fichiers de `tests/integration/` changés depuis `main`). Aucun des 23 instables non plus.
- Les bancs écrits ou retouchés sans avoir été joués sont **verts sous WebKit** : `planif-menu-vue` (#1115), `portes-relais-cadre` (#366), `niveau-sans-seuils`, `autoevaluation-consignes`, `evaluation-lot-2026-11-27` et les bancs de l'export d'un PDF, les bancs de l'accueil. La carte « À propos » repliée n'a fait rougir aucun essai.
- La passe : de 16 h 19 à 18 h 47, 137 min de jeu, mémoire libre entre 74 % et 81 % d'un bout à l'autre.

## 2. Les trois rouges neufs, chacun rejoué seul

Les trois sont des **essais en retard sur un changement voulu**. Aucun défaut d'application. Aucun fichier de `js/` n'a été touché.

| Essai | Cause mesurée | Issue |
|---|---|---|
| `bibliotheque-deux-colonnes-1156` › « pratiques : chaque rangée du trimestre… » | « Hybride » et « Cumulative » sont plus courts que « Par sélection de productions » et « Sommative » : les rangées ne passent plus à la ligne. Le contenu de la fenêtre passe de 782 à 740 px (mesuré sur `main` et sur l'assemblage), et « Modèle sommatif » tient à l'écran sans défiler. La fenêtre défile toujours (740 > 502). | Corrigé (`97449aa47`) : l'essai se joue à 500 de haut, plus 560. Banc entier rejoué : 18 verts sur 18. |
| `tableau-bord-906-bilan-premier-rendu` | Le seuil de défi suit maintenant le seuil de maîtrise (0,75 sur la démo, lot suivi, fiche 2). La phrase du bilan de la démo change (voir § 4). Contre-épreuve : seuil remis à 0,70, l'ancienne phrase revient mot pour mot. | Corrigé (`27505b512`) : le banc fixe le seuil à 0,70 par un choix marqué. Rejoué : vert. |
| `vue-simple-modeles-actuels-epingles` › « Hybride » | La référence épinglée a été reprise à la main par le lot des familles (six lignes) ; il en manquait une, à l'accueil : l'état de l'étape « Ta pratique » dit « Hybride ». | Corrigé (`e135b1aab`) : référence reprise par la commande du banc (`EPINGLER=1`) sous WebKit. Le diff tient en un mot. Rejoué : 2 verts sur 2. |

**Ce que j'ai supposé, pour le banc du bilan.** Ses trois scénarios nomment des élèves fictifs par leur rôle (« DEMO004, qui maîtrise », « DEMO015, le seul en difficulté »). À 0,75, ces rôles sont faux. Plutôt que de réécrire les scénarios, j'ai fixé le seuil : le banc juge le premier rendu de la phrase, pas le seuil, et le défaut du seuil est jugé par `seuil-defi-suit-la-maitrise-2026-11-27` (Vitest). Conséquence assumée : aucun banc Playwright ne regarde plus le bilan de la démo à son seuil par défaut.

## 3. Le verdict complet est-il à reprendre ?

**Oui, pour avoir un jeton vert, mais pas à cause de ces corrections.**
- Un jeton rouge ne se reporte pas (`verdict-en-morceaux.mjs --reporter` exige un jeton vert). Le jeton reste donc rouge sur `618acdeb`.
- Les trois commits ne touchent que deux specs et une référence de banc. Les trois bancs ont été rejoués seuls et sont verts. Rien d'autre n'a changé depuis la passe.
- La release bumpera la version et les jetons anti-cache : elle demande de toute façon sa propre passe complète. C'est elle qui rendra le jeton vert.

## 4. À regarder par Grégoire avant la release

**Le bilan des fondamentaux de la démo change, et plus que le rapport du lot ne le disait.**
- Avant (seuil de défi 0,70) : « 9 étudiant·es (90 %) maîtrisent les fondamentaux multistructurels. 1 (10 %) en difficulté sur les fondamentaux (1 persistante). »
- Après (0,75, sans réglage enregistré) : « 6 étudiant·es (60 %) maîtrisent les fondamentaux multistructurels. 1 (10 %) en plateau — consolidation ou stagnation à surveiller. 3 (30 %) en difficulté sur les fondamentaux (1 récente, 2 persistantes). »
- Le rapport du lot suivi (§ 8) annonçait, sur la démo : « 2 passent de "Stable" à "Défi spécifique" », « Niveau RàI : aucun changement ». Il ne citait pas cette phrase. Les deux mesures ne portent pas sur la même carte, et je n'ai pas cherché à les réconcilier.
- C'est le changement demandé (le seuil de défi part du seuil de maîtrise), pas un défaut. Mais c'est la première chose qu'une personne qui ouvre la démo lira du Suivi, et ce que veut dire « maîtrise les fondamentaux » relève de la pédagogie : à Grégoire de dire si ce portrait de la démo lui convient. **Issue : inscrit ici, rien touché.**

## 5. Ce qui reste à voir sur l'iPad et sous Safari

Le verdict répond pour les bancs. Il ne répond pas pour ce qui suit ; le détail est dans le rapport de chaque lot.

| Lot | À voir | Où est le détail |
|---|---|---|
| evaluation | La page d'attente de l'onglet à l'export d'un PDF (Safari l'ouvre-t-il ? le menu Actions de l'iPad, sélecteur natif) ; la case « Balance des blancs » au doigt | `RAPPORT-2026-11-27-evaluation.md`, « Ce que seul un écran peut juger », gestes 4 et 12 à 18 |
| parcours | Les trois gestes au doigt (le saut des étapes déjà faites, le verrou déjà posé, la ligne « Importé » amenée à l'écran, iPad couché) | `RAPPORT-2026-11-27-parcours.md`, « Ce que seul l'iPad peut juger » |
| conception | Un vrai collage de Word et de Pages en plusieurs tableaux, Mac et iPad (le seul point qui demande une personne) | `RAPPORT-2026-11-27-conception.md` |
| familles | Les neuf écrans (menus, badges CUM et HYB, assistant, bibliothèque, vue simple, profil, Aide, Comparateur, démo) | `RAPPORT-2026-11-27-familles-cum-hyb.md`, § 6 |
| suivi | La phrase sous la bande P (échelle de départ ancienne et neuve) ; la pastille « Terminée » ; le champ du seuil de défi ; la page d'autoévaluation d'office pour un compte neuf | `RAPPORT-2026-11-27-suivi.md`, § 14 |
| accueil | Le bandeau « Ton espace de travail est prêt » dans ses trois cas ; la carte « À propos » repliée | `RAPPORT-2026-11-27-accueil.md` |
| seances | « N semaines • M séances » : un coup d'œil | `RAPPORT-2026-11-27-seances-par-groupe-cours.md` |
| file | #1254, un bouton masqué | `RAPPORT-2026-11-27-file-sans-gregoire.md` |

## 6. Pour le second mandat (lu au code, rien d'écrit, rien d'exécuté)

**Le pack de la démo.** La release devra, dans le même push que le bump (la sentinelle #825 le refuse autrement) :
1. `js/pack-demo-10.js:7422` : `"nom": "Par sélection de productions (démo)"` devient `"nom": "Hybride (démo)"` ;
2. remettre « Hybride (démo) » dans `tests/integration/bibliotheque-deux-colonnes-1156.spec.js` (six noms et la confirmation de suppression) ;
3. retirer l'exception de la démo dans `sentinelle-sel-sans-pan-2026-11-21` (C) et dans `sentinelle-familles-cum-hyb-2026-11-27` (D) ;
4. rejouer `bibliotheque-deux-colonnes-1156` en entier : le nom plus court peut raccourcir encore la fenêtre que je viens de recaler à 500 de haut.

Source ou stock : non mesuré. Le renommage touche le pack ; ce que garde une démo déjà ouverte chez quelqu'un est à mesurer à la release.

**Les jetons anti-cache.** `scripts/release.mjs` réunit les fichiers de `js/`, `css/` et `styles.css` changés depuis l'avant-dernier commit qui touche `version.json`, plus `js/init-inline.js` et `js/main.js`. Pour chacun, dans `index.html` :
- un jeton d'un autre jour que le build devient `<jour du build>a` : les `20261126b` à `20261126h` repartent tous à `a` au jour de la release ;
- un jeton du même jour avance d'une lettre (si la release sort un 26, ce qui n'arrivera pas).

`index.html` porte aujourd'hui 70 jetons au 26 novembre. Un fichier référencé deux fois arrête le script ; un fichier absent d'`index.html` est seulement listé. Rien à préparer à la main.

**La base Linux.** `scripts/playwright-baseline-linux.json`, lignes 36 et 37 : les deux entrées de `planif-menu-vue` (#1115). Le banc est vert sous WebKit macOS dans cette passe. Elles ne se retirent qu'après un job `Playwright — verdict` vert sur GitHub pour le push de la release, dans un commit qui suit.

## 7. Comment la passe a été jouée, et ses écarts

- **Outil** : celui qui reprend (`~/Library/Caches/labo-codex-verdict/`, 20 morceaux par demies, un passage par appel, en avant-plan), pas `scripts/verdict-en-morceaux.mjs` d'un bloc. Mêmes fonctions de jugement (importées du script), même base, même jeton. J'ai rendu sa racine réglable (`LABO_RACINE`) : elle était codée sur `../labo-codex-fusion`.
- **La garde de mémoire a refusé une fois**, à 16 h 15 : 55 % de mémoire libre, seuil à 60 %. Dit à Grégoire, qui a quitté l'app Claude : 79 %. Rien n'a été contourné.
- **Le demi-morceau 13a a été coupé par le chien de garde** à 8 min, sans rapport. Rejoué en deux quarts (6 specs, puis 5), avec la même commande ; les deux rapports sont dans la fusion. Aucun essai n'a manqué au jugement (`nonJouees` : 0).
- **Deux appels ont dépassé les 10 min de l'outil et ont fini en arrière-plan** (16 h 34 et 18 h 10). Rien d'autre n'a tourné pendant ce temps, et je les ai attendus. Ensuite : un ou deux passages par appel.
- **Sur secteur**, sous `caffeinate`. Aucune autre session ni autre passage de tests vu sur le Mac.
- `tests/node_modules` de cet arbre est un lien vers celui de l'arbre principal, comme dans les autres arbres.

## 8. Les 23 essais verts au second essai

Ils ne font pas rougir le verdict. Aucun n'est dans une spec touchée par l'assemblage. Trois viennent de `comptes-erreurs-stock-1142`, les autres sont isolés (parcours, palettes, texte troué, en-tête). La liste complète est dans le jeton (`instables`).
