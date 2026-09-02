# Consigne du jour — rendre la CI verte, pour qu'elle recommence à juger

> **Écrite le 2 septembre 2026 en fin d'après-midi, par Cowork, avec Grégoire.**
> Elle REMPLACE la consigne du verdict d'ouverture, exécutée (`15d38c2a`).
>
> ⚠ **Remesure `HEAD` et le verdict avant d'exécuter** (règle 1). Grégoire devait pousser
> `15d38c2a` ; si ce n'est pas fait, dis-le et arrête.

---

## Le mandat — une CI rouge en continu ne juge plus rien

**Trouvé par toi-même le 2 septembre**, dès la première ouverture du rituel neuf : **huit
exécutions consécutives en échec sur `main` depuis le 31 août** (dernier vert : `efd357e5`).

⚠⚠ **Et ça annule une affirmation de Cowork, qu'il faut corriger ici.** Cet après-midi, Cowork
a écrit — et fait écrire dans une consigne — que *« la CI juge chaque push de toute façon »*,
pour justifier de ne pas durcir le hook pré-push. **C'était faux depuis le 31 août** : le job
s'arrête à l'étape Vitest, donc **Playwright n'a jamais tourné sur GitHub depuis cette date**.
Le filet compensatoire invoqué n'existait plus.

⮕ **Le hook reste inchangé** — la décision du 26 août tient, et le motif GitHub Desktop aussi.
**Ce lot répare le filet, pas le garde.**

## La cause, mesurée — et elle n'est pas où on la croit

Un seul fichier rouge sur 437 : `tests/unit/sentinelle-635-codex-aller-retour-cartouches.test.js`,
**10 cas sur 11**, tous sur `ReferenceError: navigator is not defined`.

▣ **Le code applicatif n'est PAS en cause.** `js/codex.js:394` lit `navigator.userAgent` — dans
un navigateur, `navigator` existe toujours. ⛔ **Ne « corrige » pas `js/codex.js` en gardant
cet appel** : tu déguiserais un défaut de test en défaut d'application.

▣ **C'est le bac à sable du test qui est incomplet.** `monterSource` (l. **230**) reçoit la
liste des globals fournis : `window`, `document`, `console`, `localStorage`, `sessionStorage`,
`db`, `travauxStockage`, `JSZip`, `FileReader`, `requestAnimationFrame`, `uiDialogues`,
`validerZipSecurite`, `setTimeout`. **`navigator` n'y est pas.**

▣ **Pourquoi c'est vert ici et rouge là-bas — et ce n'est pas Linux, c'est Node.** La machine
de Grégoire expose `navigator` comme global du langage ; le serveur tourne sous **Node 20**
(`.github/workflows/tests.yml:106`), qui ne l'a pas. Le test réussissait en **empruntant un
global à Node**, pas en le recevant de son bac à sable.

---

## Ce que tu fais

**Ajoute `navigator` aux globals du bac à sable**, à sa place dans les deux listes parallèles de
`monterSource` : le nom dans la première, un objet minimal dans la seconde.
⮕ Le seul membre consommé par le trajet est **`userAgent`** — une chaîne suffit. ⚠ **Vérifie-le
plutôt que de me croire** : `grep -n "navigator\." js/codex.js`. Si le trajet en consomme
d'autres, fournis-les, et dis lesquels.

⛔ **Ne touche à rien d'autre dans ce fichier de test.** Les onze cas gardent l'aller-retour des
cartouches ; ce n'est pas leur sujet qui est en cause, c'est leur bac à sable.

### ⚠ LA MÊME FUITE EST-ELLE AILLEURS ? — mesure, et inscris

Ce test réussissait en empruntant un global à Node. **D'autres le font peut-être.** Mesure :

```bash
grep -rln "navigator" tests/unit/*.test.js
```

⮕ **Pour chacun : le global est-il FOURNI par le bac à sable, ou EMPRUNTÉ à Node ?**
⛔ **Ne les corrige pas dans ce lot** — un seul sujet par lot. **Inscris ce que tu trouves**
(issue 2 de `CLAUDE.md`), avec les noms de fichiers. Si le compte est important, c'est un
chantier à part, et il porte un vrai risque : *un bac à sable qui laisse fuir les globals de
Node rend un test vert pour une raison qui n'est pas la sienne.*

---

## ⚠ CE QUI VA ARRIVER QUAND CE SERA VERT — préviens plutôt que d'être surpris

Une fois Vitest réparé, **la CI atteindra Playwright pour la première fois depuis le 31 août**.
▣ **Rien ne garantit qu'il sera vert.** Le verdict Playwright local, lui, a tourné aujourd'hui
sur `672e3c5f` : 239 passés, 0 échec — mais **sur la machine de Grégoire, sous WebKit local**,
pas sur le serveur.

⮕ **Si la CI rougit à l'étape Playwright après ta correction : c'est un SUCCÈS de ce lot**, pas
un échec. Ça voudra dire que le filet s'est remis à juger et qu'il a trouvé quelque chose que
personne ne voyait depuis deux jours. **Rapporte-le, ne le corrige pas** : nouveau sujet,
nouveau lot.

## Fini quand

1. `cd tests && npm run test:unit` : **437 fichiers verts**, dont les onze cas du 635.
2. ▣ **Le témoin qui compte, et il n'est pas local** : après le push, la commande du rituel
   (`§2.1` du skill) rend **`success`** sur le commit poussé.
   ⚠ **C'est le seul verdict qui prouve quelque chose ici** — un vert local est précisément ce
   qui a masqué ce défaut pendant deux jours.
3. Si la CI reste rouge, mais **à une autre étape**, dis-le et arrête : ce lot a fait son
   travail.

## L'ordre

- **Un fichier de test, rien dans `js/`.** ⮕ Pas de bump du bloc de jetons, pas de release.
- Règle 6 : **tu commites, puis tu t'arrêtes.**
- ⚠ **Exception nommée, et elle est le sujet du lot** : ici, le verdict ne peut être pris
  qu'APRÈS le push, puisque c'est la CI qu'on répare. ⮕ Grégoire pousse, **puis** tu lis le
  verdict et tu le rapportes.
- ⮕ **Ce que Grégoire doit aller voir : RIEN à l'écran.** Dis-le-lui.
- Ce fichier se commite avec ton lot.

---

# ✅ EXÉCUTÉE — 2 septembre 2026, 14 h 31 → 14 h 45 · committée, NON poussée

**Remesure** : HEAD `15d38c2a`, poussé, 1.110.0 — conforme.

## La cause, vérifiée plutôt que crue

`grep -n "navigator\." js/codex.js` rend **17 lignes**, mais le trajet aller-retour n'en
consomme qu'un membre : **`userAgent`** (`_identifierAppareil`, l. 394 et 3631). Les autres
(`storage`, `share`, `canShare`, `platform`, `clipboard`) sont derrière des gardes
(`if (navigator.storage && …)`) ou dans des chemins que le trajet ne prend pas — le
commentaire l. 46 du test le disait déjà pour `storage.estimate()`. **Une chaîne suffit.**

## Reproduit AVANT de corriger — sur cette machine, sans attendre GitHub

Node 24 accepte `--no-experimental-global-navigator`, qui le fait se comporter comme Node 20
sur ce point. `NODE_OPTIONS=--no-experimental-global-navigator npx vitest run …635…` →
**10 rouges sur 11, `navigator is not defined`** — le rouge de la CI, à l'identique, en
local. Après l'ajout de `navigator` aux deux listes parallèles de `monterSource`
(`{ userAgent: 'BacASable/635 (Node; test)' }`) : **11/11 sous le flag, 11/11 sans.**
Rien d'autre touché dans le fichier ; `js/codex.js` intact.

## La même fuite ailleurs ? — mesurée sur du réel, pas au grep

Le grep rend 8 fichiers ; **tous FOURNISSENT `navigator`** à leur bac à sable
(`harnais-parite-exports-424`, `sentinelle-556`, `-416`, `-431`, `-424` : `navigator: {}`
ou `{ storage: null }`), ou ne l'exécutent pas (`codex.test.js` : un `it.todo` en
commentaire ; `sentinelle-prevol-stockage` : lecture de source). **Le 635 était le seul
emprunteur.** Puis la preuve qui compte : **toute la suite sous le flag → 437 f. / 4715 t.
verts.** Aucun autre test n'emprunte `navigator` à Node.
⚠ **Limite de cette mesure, inscrite** : le flag ne retire QUE `navigator`. D'autres
globals que Node 24 expose et que Node 20 n'a pas (`WebSocket`, `CustomEvent`,
`localStorage` expérimental…) ne sont pas couverts. Le vrai témoin, c'est le runner sous
Node 20 — et il va parler après le push. **Pas de chantier ouvert** : rien de mesuré ne le
justifie ; si la CI rougit sur un autre global, ce sera son lot.

## Fini quand

1. `npm run test:unit` : **437 / 4715**, dont les onze du 635. ✔
2. **Le témoin qui compte n'est pas local** : après le push de Grégoire, la commande du
   §2.1 doit rendre `success` sur le commit poussé — **c'est la première fois depuis le
   31 août que Playwright tournera sur GitHub.** S'il rougit à CETTE étape-là, c'est un
   succès de ce lot : le filet s'est remis à juger. À rapporter, pas à corriger.

Rien dans `js/`, pas de jeton, pas de release. Rien à voir à l'écran.
