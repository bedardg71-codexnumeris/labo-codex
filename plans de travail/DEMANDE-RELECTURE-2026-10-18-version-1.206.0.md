# Demande de relecture – la version 1.206.0 (« Rattacher un morceau »)

> Claude Code, dimanche 18 octobre 2026, vers 17 h 35 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-18-dissection-8-version-1.206.md`, temps A (17 h 23). Pour Cowork (`PROTOCOLE.md`, règle 2).
> **Temps A fait.** Sur `main` local : la release `c7167fc9`, puis le commit de cette demande. Cinq commits sont devant `origin/main` (`1d5ecaf1`, 1.205.0). **Rien n'est poussé, et aucun verdict Playwright n'est pris** : c'est le temps B.

## Les commits

| Commit | Contenu |
|---|---|
| `b20fedb9` | Lot 7 : « Rattacher » (déjà relu) |
| `c2cff80e` | C1 du lot 7 : la marque d'une suite suit l'étiquette de son A (déjà relu) |
| `cfaa3c14` | Les textes de « Rattacher » marqués « validé G. 18 oct. 17 h 18 », avec le refus « boucle » réécrit ; la ligne d'état du texte collé (« rangera les morceaux selon leur ordre ») ; l'entrée 1.206 des Nouvelles ; la spec du lot 7 qui suit le refus réécrit ; la consigne du lot 8, la consigne du jour et son archive, et la porte retouchée par Cowork (§6), telle quelle |
| `c7167fc9` | `release : 1.206.0`, par `scripts/release.mjs minor` |

## Ce qui est mesuré

- **Version** : les quatre points de vérité portent 1.206.0, build `1018-1731`. Ce sont `version.json`, `version.js`, `js/init-inline.js` et `js/main.js`. Le jeton de `version.js` vaut `10181731`. `git grep` de l'ancien build `1018-1352` dans `*.js`, `*.json` et `*.html` : **zéro**.
- **Vitest complet**, lancé après le commit de release depuis `tests/` : **776 fichiers, 9 230 essais, tous verts**.
- **Specs `materiel-*` dans WebKit**, mesurées sur l'arbre de `cfaa3c14` avant son commit : **13 vertes**. Les 17 ignorées sont celles de l'assistant débranché. La release ne change ni code ni test.
- **Break-test du refus réécrit** : j'ai remis l'ancienne phrase dans `materiel-dissection.js`, et la spec du lot 7 a rougi (`toHaveText`). Le fichier a été restauré depuis une copie.
- **Aucun banc ne cite la phrase du texte collé.** Le changement n'a donc été vérifié qu'à la lecture : `grep` trouve « rangera les morceaux selon leur ordre » une fois. « rattachera » ne reste qu'une fois, dans le commentaire qui retrace la décision, jamais dans un texte affiché.
- **L'entrée 1.206** : j'ai comparé ses deux items à la consigne par un script (espaces insécables et apostrophes ramenées à la forme simple) : ils sont identiques mot pour mot. Les espaces insécables sont écrites `&nbsp;` comme dans l'entrée 1.205. La couleur est `vert`, et l'entrée 1.205 n'a pas bougé.
- **Audit de fin de session (§2)**, sur tout ce qui part depuis `1d5ecaf1` :
  - Aucun `innerHTML`, handler inline, `eval`, `console.log` ou import ajouté.
  - Aucune zone protégée, aucun module de sécurité touché.
  - Dans les specs neuves ou modifiées : pas de `waitForTimeout`, pas de `only`, pas de `skip`.
- **Complexité**, de `1d5ecaf1` à HEAD, mesurée avec `tests/unit/_helpers/complexite.js` :
  - Fonctions au-dessus de 15 : 454 avant et après.
  - Fonctions au-dessus de 30 : 88 avant et après.
  - Somme des complexités au-dessus de 15 : 11 439 avant et après.
  - Lignes de code : + 160, dont 9 dans le fichier de données `changelog-data.js`.

## À savoir

- `js/materiel-dissection.js` dépasse maintenant les **1 000 lignes brutes** (1 054). En lignes de code, il n'entre pas dans la liste des gros fichiers, qui compte toujours 35 fichiers.
- Dans `cfaa3c14`, j'ai avancé moi-même les jetons anti-cache de `changelog-data.js` (`d`) et de `materiel-dissection.js` (`g`), comme le demande la garde du pre-commit. `release.mjs` les a ensuite avancés de nouveau (`e`, `h`), en même temps que ceux de `init-inline.js`, `main.js`, `materiel-dissection-lecture.js` et `styles.css`.

## Le temps B

Le verdict complet se prend sur le dernier commit, celui de cette demande, qui suit `c7167fc9`. Avant de le lancer : Cowork, Chrome et Safari fermés, le Mac sur secteur. Vert : on pousse. Rouge : on ne pousse pas.
