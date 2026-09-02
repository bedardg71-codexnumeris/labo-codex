# Consigne du jour — la note qui se réécrit depuis l'écran

> **Écrite le 2 septembre 2026 à 13 h 10 (heure de Drummondville), par Cowork, avec Grégoire.**
> Elle REMPLACE la consigne du geste 4 et son addendum, tous deux exécutés et publiés.
>
> ⚠ **Si tu lis ceci plus de quelques heures après 13 h 10, ou si `HEAD` a bougé, remesure
> d'abord et dis ce qui a changé** (règle 1 de `PROTOCOLE.md`).
>
> **État au moment de l'écrire** : `1.110.0`, `HEAD` = `672e3c5f`, **tout est publié**.
> Suite COMPLÈTE verte sur ce commit : 436 fichiers / 4710 tests **et** 239 essais
> Playwright, 0 échec, 0 instable.
>
> **Source** : `plans de travail/PLAN-2026-09-02-evaluation-avant-la-chronique.md`, temps 2,
> première moitié. Ce fichier exécute ; le plan explique.

---

## Le mandat — le quatrième site, et la garde qui ne le voyait pas

**#572 a déclaré : « LA VALEUR CALCULÉE EST LA SOURCE, l'écran n'en est que l'affichage. »**
Elle a compté **trois** sites et en a corrigé trois. **Il y en avait quatre.**

⚠ **Ce lot est un « corriger maintenant »** (issue 1 de `CLAUDE.md`) : il touche le parcours
que Grégoire s'apprête à décrire dans sa chronique sur l'évaluation.

**Mesure, faite par Cowork le 2 septembre à 11 h 40, rejouée à 12 h 45, à REJOUER encore :**

```bash
grep -rn "parseFloat(.*noteProduction1" js/ --include=*.js
grep -rn "noteCalculeeCourante" js/ --include=*.js
```

▣ **Trois sites écrivent la valeur calculée** — `evaluation-sauvegarde.js:209`,
`evaluation-chargement.js:1452`, `evaluation-chargement.js:1476`.
▣ **Le quatrième relit l'écran** — `js/evaluation.js:1784`, dans `_lireChampsDOMMod` :

```js
noteFinale: parseFloat(document.getElementById('noteProduction1').textContent) || 0,
```

▣ **Il est appelé UNE SEULE FOIS**, à `js/evaluation.js:1959` — **le chemin qui enregistre la
MODIFICATION d'une évaluation existante** (il pose `verrouillee: true`, puis écrit par
`sauvegarderDonneesSelonMode('evaluationsSauvegardees', …)`).
▣ **La source, elle, est posée par le calcul** : `evaluation-calcul.js:914`
`window.noteCalculeeCourante = pourcentage;` — et `:806` la met à `null` quand rien n'est
calculable.
▣ **L'affichage est un rendu** : `evaluation-calcul.js:917`,
`document.getElementById('noteProduction1').textContent = pourcentage.toFixed(1) + ' %';`

---

## ⛔ L'ORDRE EST IMPOSÉ : REPRODUIRE, PUIS CORRIGER

**Les deux effets ci-dessous sont LUS, pas exécutés. Ne corrige rien avant d'avoir vu du
rouge.** C'est la règle du break-test, et ici elle porte tout le lot : sans reproduction, on
ne saura pas lequel des deux effets est réel.

**Effet 1 — l'arrondi.** `toFixed(1)` arrondit au dixième. Rouvrir une évaluation et la
réenregistrer stockerait donc une note arrondie, pas la valeur calculée. Écart max 0,05 point.
⮕ **Le test rouge** : une note calculée dont la décimale se perd à l'arrondi (par exemple
`79,46`), passée par le chemin de modification, doit ressortir `79,46` et non `79,5`.

**Effet 2 — le zéro.** Si `#noteProduction1` n'affiche pas un nombre à cet instant — `--`,
vide, ou un rendu différé (le motif **#321** est nommé dans le commentaire de #572) —
`parseFloat` rend `NaN`, et le `|| 0` écrit **0**.
⮕ **Le test rouge** : mettre l'affichage dans cet état, passer par le chemin de modification,
et constater qu'un **0** atterrit dans `evaluationsSauvegardees` alors que
`noteCalculeeCourante` porte une vraie note.
⚠ **C'est CE cas-là qui départage** « arrondi bénin » et « zéro qui remplace une note ». S'il
n'est pas atteignable, dis-le : ce serait une bonne nouvelle, et elle doit être écrite.

---

## La correction

`_lireChampsDOMMod` lit `window.noteCalculeeCourante`, **comme ses trois sœurs**, avec le
même patron exactement :

```js
noteFinale: (typeof window.noteCalculeeCourante === 'number') ? window.noteCalculeeCourante : 0,
```

⚠ **Ne dévie pas du patron des trois autres**, même si tu le trouves perfectible — voir la
note sur le `: 0` plus bas. Quatre chemins qui se ressemblent se relisent ; quatre chemins qui
divergent produisent le défaut d'aujourd'hui.

⚠ **`niveauFinal` reste lu depuis le DOM** (`evaluation.js:1785`), et c'est hors de ce lot :
le niveau n'a pas de source calculée équivalente à `noteCalculeeCourante`. **Ne l'improvise
pas.** Si tu juges que c'est un défaut, **inscris-le** (issue 2).

---

## ⛔ LA SENTINELLE : RÉORIENTE-LA, N'ÉLARGIS PAS SA LISTE À LA MAIN

`tests/unit/sentinelle-572-mineurs-liste-annoter-design.test.js`, cas
*« le calcul pose noteCalculeeCourante (nombre ou null), et plus personne ne relit le DOM »*,
**ligne 77** :

```js
for (const [nom, src] of [['evaluation-sauvegarde', sauvegarde], ['evaluation-chargement', chargement]]) {
```

**`evaluation.js` n'y est pas.** Le titre dit « plus personne » ; le cas en vérifie deux sur
trois. Il est vert depuis le 29 août pendant que le défaut vit.

⮕ **Ce qu'elle doit garder désormais** : *aucun fichier de `js/` ne relit la note depuis
`#noteProduction1`.* ⚠⚠ **La liste des fichiers se DÉDUIT du dépôt — elle ne s'écrit pas à la
main.** Ajouter `evaluation.js` à la liste corrigerait le cas d'aujourd'hui et laisserait
exactement le même piège pour le prochain fichier. **C'est la leçon du 2 septembre, et c'est
la vraie valeur de ce lot** : une garde dont le périmètre est figé à la main mesure l'état du
jour où on l'a tapée, pas l'invariant.

**Break-test, deux mutations, deux rouges attendus :**
1. Réintroduire le `parseFloat(...noteProduction1)` dans `evaluation.js` → **doit rougir**.
   (Aujourd'hui, ça ne change rien : c'est la contre-épreuve du défaut.)
2. L'introduire dans un fichier de `js/` qui n'a jamais été dans aucune liste → **doit rougir
   aussi**. C'est ce cas-là qui prouve que le périmètre est déduit et non énuméré.

⚠ **Vérifie les deux autres cas du même fichier** avant de le toucher : il porte aussi les
mineurs Liste et Design (la purge des annotations, le tutoiement, les badges de jetons).
**Ne les casse pas.**

---

## ⏳ CE QUI N'EST PAS DANS CE LOT, ET QU'IL FAUT ÉCRIRE

**Les quatre chemins écrivent `0` quand la note n'est pas calculable.** Après ta correction,
c'est encore vrai : `evaluation-calcul.js:806` pose `noteCalculeeCourante = null`, et le
patron `? … : 0` retombe sur zéro.
⮕ **C'est #674, l'énoncé 5, et sa forme est DÉJÀ tranchée par Grégoire** : persister
`ponderationTotal` à côté de `noteFinale` — **pas** un état « brouillon / conclue »,
explicitement écarté.
⛔ **Ne l'ouvre pas ici.** *Inscris et continue* (issue 2). Mais **dis-le dans ton état
mesuré** : ce lot ferme une porte sur deux.

⚠ **TARIR N'EST PAS RÉPARER** : les évaluations déjà enregistrées gardent la note qu'elles
portent. **N'écris rien dans les données de personne**, et dis-le.

---

## Fini quand

```bash
grep -rn "parseFloat(.*noteProduction1" js/ --include=*.js
```

⮕ rend **zéro**. ▣ **Témoin obligatoire** : le même motif sur `noteCalculeeCourante` doit
rendre **quatre** sites, pas trois — c'est lui qui prouve que la commande mesure encore
quelque chose.

⮕ **Et le vrai fini quand** : rouvrir une copie déjà corrigée et la réenregistrer **ne change
pas sa note**, ni d'un centième.

## L'ordre

- `cd tests && npm run test:unit` pour travailler ; **`npm test` (suite complète) avant de
  dire que c'est prêt** — ce lot touche le calcul d'une note, pas un libellé.
- Bump du bloc de jetons d'`index.html` (`js/` est touché).
- Règle 6 : **tu commites, puis tu t'arrêtes.** Pas de release, pas de push.
- ⮕ **CE QUE GRÉGOIRE DOIT ALLER VOIR — et cette fois il y a quelque chose :**
  **ouvrir une copie qu'il a déjà corrigée, ne rien changer, réenregistrer, et vérifier que
  la note affichée est identique au centième près.** Dis-le-lui dans ces mots-là.
- Ce fichier se commite avec ton lot.


---

# ✅ EXÉCUTÉE — 2 septembre 2026, 13 h 02 → 13 h 30 · committée, NON poussée

**Remesure** : HEAD `672e3c5f`, tout publié, `version.json` 1.110.0 — conforme. Les deux
greps rendaient exactement ce qui était annoncé : un `parseFloat(...noteProduction1)`
(`evaluation.js:1784`), cinq `noteCalculeeCourante` (trois lectures, deux écritures).

## Reproduit AVANT de corriger — les deux effets sont réels

Test comportemental sur le chemin réel (`sauvegarderEvaluationModifiee`, chargé dans le
bac à sable avec une évaluation existante en base, l'écran dans un état donné, et la
capture de ce que `sauvegarderDonneesSelonMode` reçoit) :

| Effet | Écran | `noteCalculeeCourante` | Stocké AVANT | Stocké APRÈS |
|---|---|---|---|---|
| 1 · arrondi | `79.5 %` | 79,46 | **79,5** | 79,46 |
| 2 · zéro | `--` | 79,46 | **0** | 79,46 |

⮕ **L'effet 2 est atteignable** : un « -- » à l'écran au moment d'enregistrer une
modification écrivait `0` par-dessus une vraie note. Ce n'était pas la bonne nouvelle
espérée ; c'est écrit. Un troisième cas, témoin, vérifie que le chemin aboutit vraiment
(`verrouillee: true`, `niveauFinal` conservé) — sinon les deux autres seraient verts par
absence d'écriture.
⚠ Le premier rouge était un rouge de MONTAGE (`evaluationEnCours` lu comme global nu
par `_collecterCriteresMod`, à passer au bac à sable), pas celui du défaut. Distingué,
corrigé dans le test, puis le vrai rouge est venu.

## Corrigé

`js/evaluation.js:1784` → le patron exact des trois sœurs, sans dévier. `niveauFinal`
reste lu depuis le DOM, comme demandé — **inscrit, non improvisé** : le niveau n'a pas de
source calculée équivalente, ce serait un chantier à part.

## La sentinelle — réorientée, périmètre DÉDUIT

`sentinelle-572-mineurs-liste-annoter-design.test.js` : la liste tapée (`sauvegarde`,
`chargement`) est remplacée par **le balayage de tous les `.js` de `js/`** (récursif,
commentaires retirés, >100 fichiers exigés comme témoin). Deux cas : aucun fichier ne
relit `#noteProduction1` ; et le témoin — le patron `noteCalculeeCourante === 'number'`
compte **exactement quatre** sites sur tout `js/`. Les cas Liste, annotations et Design
du même fichier n'ont pas bougé (11/11).
**Break-tests, les deux demandés** : réintroduire dans `evaluation.js` → **2 rouges** ;
l'introduire dans `js/entites/horaires.js` (jamais dans aucune liste) → **rouge**. Restauré.

## Fini quand

`grep -rn "parseFloat(.*noteProduction1" js/` → **zéro** · témoin
`grep -rn "noteCalculeeCourante === 'number'" js/` → **4**. Vitest **437 f. / 4715 t.**
(+1 fichier, +5 tests). Suite complète `npm test` lancée avant de dire « prêt » — verdict
dans le message de commit. Jeton `js/evaluation.js?v=20260902a` bumpé.

## Ce qui n'est PAS dans ce lot — écrit, pas ouvert

- **Le `: 0` des quatre chemins** quand `noteCalculeeCourante` est `null` : #674,
  énoncé 5, forme tranchée (`ponderationTotal` persisté). Ce lot ferme une porte sur deux.
- **Tarir n'est pas réparer** : les évaluations déjà enregistrées avec `79,5` ou `0`
  gardent ce qu'elles portent. **Rien n'a été écrit dans les données de personne.**
- `niveauFinal` lu depuis le DOM (issue 2).

## Ce que Grégoire doit aller voir

**Ouvrir une copie qu'il a déjà corrigée, ne rien changer, réenregistrer, et vérifier
que la note affichée est identique au centième près.**
