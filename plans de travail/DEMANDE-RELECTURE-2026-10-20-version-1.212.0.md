# Demande de relecture – la version 1.212.0 (temps A)

> Claude Code, mardi 20 octobre 2026, vers 19 h 15 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-20-version-1.212.md`, temps A. Pour Cowork (`PROTOCOLE.md`, règle 2).
> Commit de release `c4b4b41f` sur `main`, **non poussé**. Le temps B (verdict complet, push) attend le signal de Grégoire.

## Ce que porte le commit

| Quoi | Comment le vérifier |
|---|---|
| Les Nouvelles 1.212 | `js/changelog-data.js`, en tête : `version: '1.212'`, `couleur: 'vert'`, le titre et les trois items mot pour mot. Insécables en `&nbsp;` et apostrophes typographiques, comme la 1.211. L'entrée 1.211 est intacte. |
| La version | `node scripts/release.mjs minor` (précédé de `--dry-run`) : **1.212.0**, build `1020-1905`, dans les quatre points (`version.json`, `version.js`, `js/init-inline.js` ×2, `js/main.js`). L'ancien build `1020-1451` y est absent ; le témoin, `RELAIS.md`, le porte encore. |
| Les jetons anticache | Les fichiers servis modifiés depuis la 1.211.0 (`git diff --name-only b054a33d`) sont `js/bareme.js` (`20261020d`), `js/export-pdf.js` (`e`), `js/changelog-data.js` (`f`) et `styles.css` (`e`), plus `index.html`. Tous sont relevés par le script ; `version.js?v=10201905`. `js/init-inline.js` et `js/main.js`, modifiés par la release elle-même, sont relevés aussi. Le script a enfin relevé cinq jetons de fichiers non modifiés (`accueil.js`, `grilles.js`, `travaux-annotation.js`, `travaux-outils.js`, `travaux-ui.js`) : c'est sa règle, sans effet. |
| L'inscription du verdict | **#1129** au BACKLOG (le gras des éléments observables dans le PDF), son numéro reporté dans le verdict de 18 h 56. |
| Le relais | `RELAIS.md` et `OU-EN-EST-ON.md` : un bloc de tête chacun. |

## Ligne « complexité » (1.211.0 `b054a33d` → 1.212.0)

| Mesure | Avant | Après | Δ |
|---|---|---|---|
| Fichiers de plus de 1 000 lignes | 35 | 35 | 0 |
| Leurs lignes | 86 127 | 86 273 | +146 (`js/export-pdf.js` +136, `js/changelog-data.js` +10) |
| Fonctions au-dessus de 15 | 454 | 454 | 0 |
| Fonctions au-dessus de 30 | 88 | 86 | −2 (`genererApercuCombine`, `genererPDFCombine`) |
| Somme des complexités au-dessus de 15 | 11 437 | 11 427 | −10 |

## Preuves

- **Vitest complet, après le commit de release** : 9 301 sur 9 301, 790 fichiers, 44 s. Avant la release, sur le même code : 9 301.
- **Audit statique** du diff de release : aucun motif. Le diff ne touche que des données (Nouvelles) et les points de version.

## Ce fichier

Il n'est pas committé. Le commit de release est le dernier, pour que le verdict du temps B porte sur lui.
