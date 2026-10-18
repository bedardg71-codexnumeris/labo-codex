# Demande de relecture – version 1.204.0, la dissection (étape 4, temps A)

> Claude Code, dimanche 18 octobre 2026, vers 10 h 40 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-18-dissection-4-version.md` (10 h 22), temps A. Pour Cowork (`PROTOCOLE.md`, règle 2).
> **Commit de release local, non poussé : `fe641099`**, au-dessus de `4c16a4f0`. Il porte aussi la consigne du jour, l'ancienne archivée, la consigne du lot 4 et le plan (étape 3 cochée). Un commit de documents suit : cette demande, la porte terrain et l'en-tête « périmée » de l'ancienne porte. **Pas de push** (temps B).

## État mesuré

- `scripts/release.mjs minor` (après `--dry-run`) : **1.203.0 → 1.204.0, build `1017-1629` → `1018-1024`**, 19 jetons anti-cache. Les quatre points sont synchrones : `version.json` et `version.js` (`{"build":"1018-1024","beta":"1.204.0"}`), `init-inline.js` (`VERSION_MAJEURE` 1.204.0, `BUILD_ID` 1018-1024), `main.js` (`_SCRIPT_BUILD_main` 1018-1024) ; `version.js?v=10181024`. L'ancien build `1017-1629` : **zéro** occurrence hors `.md`.
- **Vitest complet après le commit de release** : **774 fichiers, 9 188 essais, verts**, 45 s.
- L'entrée des Nouvelles 1.204 n'est pas réécrite : `changelog-data.js` n'a bougé que par son jeton.

## Le rituel de fin de session, sur `71cdde64..fe641099` (toute la version)

- **Périmètre** : 7 fichiers `js/` (`changelog-data`, `grilles`, `materiel-assistant`, `materiel-dissection-lecture`, `materiel-dissection`, `materiel`, plus les trois fichiers de version), `index.html`, `styles.css`, 19 fichiers de `tests/`, et des documents. Aucune zone protégée touchée (les jetons `?v=` de `config.js` et `navigation.js` dans `index.html` ont bougé par le script, pas les fichiers eux-mêmes). Ni CSP, ni `import-export`, `travaux-import`, `cc-license`, `securite-*`.
- **Audit statique** des lignes ajoutées : aucun `innerHTML`, `outerHTML` ni `insertAdjacentHTML`, aucun handler inline, aucun `eval` ni `new Function`, aucun `console.log`, aucun import neuf. La dissection construit son DOM par nœuds et `textContent`. Les six `test.skip` sont ceux du lot 1 (l'assistant débranché, « retrait après lundi »). Aucun `.only`.
- **Break-test échantillon, côté sécurité** : `textContent` → `innerHTML` dans `bloc` (`materiel-dissection.js`) → **S.b rouge** (`materiel-dissection-1-lecture.test.js`, un `<img onerror>` collé) ; restauré, 15 sur 15, `js/` propre. Les break-tests des lots 2a, 2b et des corrections sont ceux de leurs commits, relus : je ne les ai pas refaits.
- **§4.1 bis** : les trois specs neuves de la version (`materiel-dissection-1`, `-2a`, `-2b`) n'ont **aucun** `waitForTimeout`. Il en reste un dans `materiel-lot1-onglet.spec.js` (l. 21), daté du 16 oct. et déjà présent en 1.203.0. C'est la réserve d'hier : je n'y touche pas.
- **Complexité** (`node tests/unit/_helpers/complexite.js`, même module sur les deux arbres, 1.203.0 `71cdde64` → 1.204.0) :

| Mesure | 1.203.0 | 1.204.0 | Écart |
|---|---|---|---|
| Fichiers de plus de 1 000 lignes | 35 | 35 | 0 |
| Lignes de ces fichiers | | | +36 (`grilles.js` +22, `changelog-data.js` +14) |
| Fonctions au-dessus de 15 | 454 | 454 | 0 |
| Fonctions au-dessus de 30 | 88 | 88 | 0 |
| Somme des complexités au-dessus de 15 | 11 438 | 11 439 | +1 |

Le maximum reste à 130. Les deux nouveaux fichiers de la dissection (601 et 784 lignes) restent sous 1 000.

## La porte terrain de cet après-midi

`plans de travail/PORTE-TERRAIN-2026-10-18-la-dissection.md`, le markdown seulement : à toi l'artefact jumeau.

- **§0** : le numéro **1.204.0** en bas de page, sinon arrêt ; puis les Nouvelles 1.204.
- **§2** : treize rangées, sur sa grille Cornell (Pages, Mac), la grille en points de sa collègue (Mac), puis l'iPad. Elles éprouvent le collage, trouver où regarder, l'étiquetage au clic, au glisser et au doigt, la lecture qui se refait, la création en niveaux et en points, Grilles de critères en points et dans l'ordre, et le nom déjà pris.
- **§3** : aucune décision.
- L'ancienne porte porte en tête « PÉRIMÉE, remplacée par … ». Son relevé de 5 h 10 est gardé.

## Ce que j'ai supposé

1. **La rangée 2.2** (« regarde l'écran dix secondes : tu sais où regarder ») mesure son ressenti : c'est le symptôme de 5 h 10 que la dissection doit lever. C'est un champ libre, et aucune réponse n'y est un échec.
2. **La première règle de tête et les rangées gardées.** Le §4 de la porte nomme ce que les bancs mesurent déjà. Je l'ai gardé parce que la consigne le nomme, et parce que la porte le rejoue sur ses vraies grilles. C'est le cas du nom déjà pris (2.10), des points plutôt que les % (2.9) et de l'ordre des réponses. Retire-les de l'artefact si tu juges la règle plus forte.
3. **Les Nouvelles en 0.3**, au préalable : elles prouvent la version autant que le numéro.

## Note sur le temps B

Grégoire m'a dit, pendant ce temps A, que Chrome, Safari et Cowork étaient fermés. Je prends donc le verdict Playwright tout de suite, sur le dernier commit (celui de ces documents), pour gagner le temps de la porte. **Je ne pousse pas** avant ton accord ou celui de Grégoire. Si ta relecture demande une correction, ce verdict est périmé et se reprend.

## À regarder en priorité

1. Les quatre points et le jeton de `version.js`.
2. Les rangées 2.2, 2.9 et 2.10.
3. L'ordre inhabituel : le verdict pris avant ta relecture.
