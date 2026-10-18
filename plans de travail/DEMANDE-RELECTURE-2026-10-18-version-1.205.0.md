# Demande de relecture – la version 1.205.0 (« Couper un morceau »)

> Claude Code, dimanche 18 octobre 2026, vers 14 h (Toronto). Consigne : `CONSIGNE-LOT-2026-10-18-dissection-6-version-1.205.md`, temps A (13 h 50). Pour Cowork (`PROTOCOLE.md`, règle 2).
> **Temps A fait.** `main` local : la release `90add3b7`, puis le commit de cette demande ; cinq commits devant `origin/main` (`74ab9cc3`, 1.204.0). **Rien n'est poussé, aucun verdict Playwright n'est pris** : c'est le temps B.

## Les commits

| Commit | Contenu |
|---|---|
| `b15fd5ea` | Lot 5 : « Couper », les raisons qui nomment (déjà relu) |
| `63e7b4de` | C1 du lot 5, plus #1106 et #1107 au BACKLOG (déjà relu) |
| `bece5c88` | Les quatorze textes marqués « validé G. 18 oct. 13 h 48 » ; l'entrée 1.205 des Nouvelles ; consigne du lot 6, consigne du jour et son archive, porte retouchée par Cowork (§5), telle quelle |
| `90add3b7` | `release : 1.205.0` par `scripts/release.mjs minor` |

## Ce qui est mesuré

- **Version** : les quatre points de vérité portent 1.205.0, build `1018-1352` (`version.json`, `version.js`, `js/init-inline.js`, `js/main.js`). Le jeton de `version.js` vaut `10181352`. `git grep` de l'ancien build `1018-1024` dans `*.js`, `*.json` et `*.html` : **zéro**. Le nouveau build se retrouve dans les quatre fichiers (témoin).
- **Vitest complet après le commit de release** (lancé depuis `tests/`) : **775 fichiers et 9 214 essais, tous verts**.
- **Specs `materiel-*` dans WebKit**, mesurées sur `63e7b4de` (avant les deux commits de textes et de release, qui ne changent ni code ni test) : **12 vertes**. Les 17 ignorées sont celles de l'assistant débranché, comme avant.
- **Audit de fin de session (§2) sur tout ce qui part depuis `74ab9cc3`** : aucun `innerHTML`, handler inline, `eval`, `console.log` ou import ajouté. Aucune zone protégée ni aucun module de sécurité touché. Dans les specs neuves ou modifiées : ni `page.click` à l'aveugle, ni `waitForTimeout`, ni `only`, ni `skip`.
- **L'entrée 1.205** : titre et quatre items mot pour mot. Les espaces insécables sont écrites `&nbsp;` comme dans l'entrée 1.204 (dans les guillemets « » et devant le deux-points). La couleur est `vert`, et l'entrée 1.204 n'a pas bougé.
- **Complexité** (par rapport à la 1.204.0, mesurée sur les deux commits avec `tests/unit/_helpers/complexite.js`) :
  - 0 ligne de plus dans les fichiers de plus de 1 000 lignes : il y en a 35, et aucun n'est touché. Les deux fichiers de la dissection passent de 784 à 896 lignes et de 601 à 788 lignes.
  - Fonctions au-dessus de 15 : aucun changement (454).
  - Fonctions au-dessus de 30 : aucun changement (88).
  - Somme des complexités au-dessus de 15 : aucun changement (11 439).

## À savoir

- Un seul texte n'est **pas** marqué « validé » : « aucun critère dans sa rangée », la raison de C1. C'est le texte proposé dans ton verdict de 13 h 36, et il n'était pas parmi les quatorze. Son commentaire le dit « provisoire ».
- `release.mjs` a aussi changé le jeton anti-cache de `grilles.js`, `materiel-assistant.js` et `materiel.js`, que ce lot ne modifie pas. C'est le comportement du script, et je n'y ai pas touché.

## Le temps B

Le verdict complet sur le dernier commit (celui de cette demande, qui suit `90add3b7`), Cowork, Chrome et Safari fermés, le Mac sur secteur. S'il est vert, le push ; s'il est rouge, pas de push.
