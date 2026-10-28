# Demande de relecture – La troisième retouche de « Une copie non recevable vaut ce que la règle dit » (#1175, 28 octobre 2026)

> Écrite par Claude Code le mercredi 28 octobre 2026, sur `main`. Verdict : `VERDICT-RELECTURE-2026-10-28-copie-non-recevable-note.md`, section « Relecture de la seconde retouche » (Cowork, 7 h 33). Code : `087bd396`. Pas de release, pas de verdict Playwright complet, pas de push.

## En bref

- **Une reprise naît « Recevable ».** `statutIntegrite` et `notesIntegrite` rejoignent les champs que la reprise ne recopie pas (`js/evaluation-jetons.js:597`). L'originale garde son statut et ses preuves.
- **La colonne « Statut » de la Liste** dit « -- » pour une copie non recevable, au lieu de « 0 » (`js/liste-evaluations.js:1607`).
- **Le stock n'est pas réécrit** : une question pour Grégoire, en fin de document.

## 1. La mesure, avant le correctif

Banc fictif, WebKit (`copie-non-recevable-note-28-oct.spec.js`, second test) : une copie évaluée E et M (87,5), passée à « Non recevable (Plagiat) » avec des preuves, verrouillée, puis un jeton de reprise.

| Où | Avant le correctif | Après |
|---|---|---|
| La reprise, en base | `statutIntegrite: "plagiat"`, `notesIntegrite: "Preuves fictives."` | ni l'un ni l'autre |
| La Liste, ligne de la reprise | pastille « Non recevable (Plagiat) », Statut « 0 », niveau et note « -- » | « Reprise (était Non recevable (Plagiat)) », « À réévaluer », M, 87,5 % |
| Le formulaire de la reprise | menu « plagiat », les preuves de l'originale, le libellé et l'avis, la note masquée | menu « Recevable », preuves vides, ni libellé ni avis, la note visible |
| L'originale | « plagiat », preuves, remplacée | inchangée |

Une seule fonction crée une reprise (`appliquerJetonReprise`, le seul `repriseDeId:` posé à la création) : il n'y a pas de second chemin à tenir.

## 2. Les tests

- **Spec WebKit**, second test (neuf) : la reprise en base, sa ligne dans la Liste, son formulaire, l'originale. Il rougissait avant le correctif (journal ci-dessus) ; il est vert après.
- **Sentinelle #725** (`sentinelle-725-617-724-720-jetons-de-reprise.test.js`, ↻) : l'essai « la reprise naît propre » reçoit les deux champs, et vérifie que l'originale les garde.
- **Sentinelle de l'affichage** (↻) : la ligne de la Liste n'a plus de cellule « 0 » ; statut, niveau et note disent « -- ». Même ajustement dans le premier test de la spec.
- **Break-test** : deux mutations (les deux champs retirés de la liste ; « 0 » remis), chacune rouge en Vitest **et** en WebKit, soit 4 sur 4 ; arbre restauré, contrôlé par sha256.
- Jetons anti-cache : `evaluation-jetons.js`, `liste-evaluations.js`.
- **Vitest** depuis `tests/` : **839 fichiers, 10 044 essais, verts**.
- **Playwright ciblé** (WebKit) : la spec du lot (2), #1007 2a-2 (reprise et codex), #959, lot C, parcours sommatif du 24 sept., #1174 (Liste), golden master L2-0, registre longitudinal #915 : **30 verts**. **La suite complète n'a pas tourné** : pas de verdict sur HEAD.

## 3. Trouvaille

- **Une reprise reprend les niveaux et la note de son originale**, par dessein (« l'enseignant les modifiera lors de la réévaluation », `evaluation-jetons.js:574`). Après un plagiat, la ligne de la reprise montre donc « M » et « 87,5 % » jusqu'à la réévaluation (mesuré ci-dessus). Elle n'est pas verrouillée, donc hors de la note. Ce sont les niveaux de la copie non recevable, qui reparaissent sur une autre copie. Est-ce qu'une reprise après un plagiat devrait partir vide ? C'est une question de didactique : **non inscrite**, à Cowork d'en disposer avec Grégoire.

## Pour Grégoire

**Le stock.** Une reprise que tu aurais accordée après un plagiat ou une IA non autorisée, **avant ce correctif**, porte encore le statut de son originale. Elle vaut donc 0 et se montre « Non recevable » tant que tu ne changes pas son menu « Intégrité académique ». Le correctif ne touche pas ces reprises. Pour savoir s'il y en a, tu peux coller cette ligne dans la console de l'application. Elle ne fait que lire, et seulement le trimestre actif :

```js
(db.getSync(cle('evaluationsSauvegardees'), []) || []).filter(e => e.repriseDeId && (e.statutIntegrite === 'plagiat' || e.statutIntegrite === 'ia')).map(e => e.id)
```

Une liste vide veut dire qu'il n'y a rien à faire. S'il y en a, que préfères-tu ?

- **A.** Tu changes le menu de chacune à la main, lors de sa réévaluation.
- **B.** Un outil à la console, sur le modèle de `ComptesErreurs.verifier()`, qui les nomme puis les remet à « Recevable » si tu lui donnes ton accord.
