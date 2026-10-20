# Demande de relecture – la version 1.210.0, temps A

> Claude Code, mardi 20 octobre 2026, vers 10 h 40 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-20-version-1.210.md`, temps A seulement. Pour Cowork, avant le temps B. Commit de release `eafa4ec4` sur `main`, **non poussé** (13 commits d'avance sur `origin/main`).

## La release

- `node scripts/release.mjs minor` : **1.209.0 → 1.210.0**, build **1020-1032**. Les quatre points de vérité portent le nouveau build (`version.json`, `version.js`, `js/init-inline.js`, `js/main.js`) ; `version.js?v=10201032`. L'ancien build `1019-1956` n'apparaît plus nulle part dans `index.html`, `version.*` ni `js/`.
- **Jetons anti-cache** : les 23 fichiers de `js/` et `styles.css` modifiés depuis la 1.209.0 (`1dc31102`) portent `?v=20261020a`, posés par le script (vérifié un par un : 23 sur 23). `index.html` n'a pas de jeton propre. Une note : `travaux-outils.js` portait déjà `20261020a` dans `84d76712` (jeton corrigé ensuite par `34382028`) ; aucun de ces commits n'a été poussé, ce jeton n'a donc jamais été servi en ligne.
- **Les Nouvelles** : l'entrée 1.210 en tête, `couleur: 'vert'`, titre et cinq items mot pour mot, `&nbsp;` dans les guillemets et devant les deux-points, apostrophes typographiques, comme la 1.209. Les entrées 1.209 et précédentes ne bougent pas.
- La note du jeton de `travaux-outils.js` dans `index.html` citait l'ancien build (« jeton du jour du build (1019-1956) ») : fausse après la release, retirée.

## La ligne « complexité » (1.209.0 → 1.210.0)

Lignes des fichiers de plus de 1 000 : 85 938 → 86 025 (**+87** ; `grilles.js` +44, `accompagnement-contenu-popup.js` +23, `changelog-data.js` +12, données) ; au-dessus de 15 : 454 → 454 (**0**) ; au-dessus de 30 : 88 → 88 (**0**) ; somme au-dessus de 15 : 11 439 → 11 440 (**+1**).

## Les bancs

Vitest complet : 9 263 / 9 263 avant le commit de release, et de nouveau **après** lui. Audit statique du diff de la release : rien. Aucun Playwright local dans ce temps : le verdict complet est au temps B.

## Ce que `4c1126f2` (F1, F2) a fait

- **F1** – `tests/integration/bareme-2-aide.spec.js` : un cas en mode sombre (`body` sans `.mode-clair`), à 1440 px puis à 820 px, qui capture la section et mesure le contraste WCAG de chaque intitulé et de chaque case du tableau sur le fond opaque de sa rangée (4,5 au moins), sans débord horizontal. **Vu sur les captures** : en-têtes sur la bande foncée, intitulés de rangée en gras clair, cases en texte clair sur le fond sombre des rangées, lisibles aux deux largeurs ; aucune correction nécessaire. Break-test : l'intitulé peint `#1a2c34` → contraste 1,11, rouge ; restauré.
- **F2** – `tests/unit/bareme-2-pieces-d-aide.test.js` : la marque « à compléter » qui paraît quand on efface les points d'une tranche porte la bulle E5 ; celle qui remplace « hors barème » change de bulle avec elle ; une tranche neuve a la même. Break-test : la ligne de `grilles.js` qui pose la bulle retirée → rouge ; restaurée.

## Arrêt

Temps A terminé. Le temps B (verdict complet du Mac, push, constat chez Netlify) attend le signal de Grégoire.
