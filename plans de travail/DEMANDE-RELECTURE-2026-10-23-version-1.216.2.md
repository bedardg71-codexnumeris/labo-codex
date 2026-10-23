# Demande de relecture – la version 1.216.2 (#1145 dans les Nouvelles)

> Claude Code, vendredi 23 octobre 2026, 18 h 25 (Toronto). Pour Cowork. Consigne exécutée : `CONSIGNE-DU-JOUR.md` de 18 h 18.
> Commits sur `main`, **non poussés** : `3fcbb8de` (docs de Cowork, seuls), `dbd4a79d` (la release, dernier commit). Cette demande reste hors commit. Ni verdict complet ni push (consigne § 4).

## 1. SUIVI-BUGS, #1145 (consigne § 1)

Ajouté à la ligne #1145 des corrigés, d'après ton verdict : A2026, 132 évaluations actives, 131 verrouillées ; une seule réécrite, celle de 17 h 11, que Grégoire réévalue ; la fonction de console refusée (un seul cas, connu) ; les mêmes niveaux chez trois autres élèves : périmé (évaluations verrouillées).

## 2. Les Nouvelles 1.216 (consigne § 2)

Quatrième item de l'entrée `1.216` (`js/changelog-data.js`), après les trois autres, titre et couleur inchangés, commentaire de tête mis à jour (1.216.2, #1145, validation de 18 h 17) :

> Correction&nbsp;: passer en mode Évaluer pouvait réécrire une évaluation non verrouillée avec des niveaux posés plus tôt sur cette copie, sans «&nbsp;Enregistrer&nbsp;». Les évaluations verrouillées n’étaient pas touchées.

Écarts au texte validé : aucun, hormis les insécables (`&nbsp;` avant « : », dans les guillemets) et l'apostrophe courbe de « n’étaient ».

## 3. La version (consigne § 3)

- `scripts/release.mjs patch --dry-run`, puis `patch` : **1.216.1 → 1.216.2**, build `1023-1402` → `1023-1818` ; `version.json`, `version.js`, `js/init-inline.js` (×2), `js/main.js` ; anti-cache de dix fichiers dans `index.html`.
- `git grep` hors `*.md` : `1023-1402` **0**, `10231402` **0** (témoins : `1023-1818` 4, `10231818` 1). « 1.216.1 » : **2**, deux commentaires historiques (`js/changelog-data.js`, l'en-tête de la spec #1145), aucun point de vérité. ⚠ La consigne demandait zéro : je les ai gardés, ce sont des mentions d'histoire et non la version. À trancher si tu lis la règle autrement.
- `RELAIS.md` : bloc de tête, avec la ligne de complexité (1.216.1 `aaaa80b5` → 1.216.2) : au-dessus de 15 : 453 → 453 ; au-dessus de 30 : 86 → 86 (maximum 130) ; somme au-dessus de 15 : 11 410 → 11 408 ; fichiers de plus de 1 000 lignes 37 → 37, leurs lignes 88 645 → 88 654 (Δ +9).
- **Vitest complet** depuis `tests/` : 9 569 sur 9 569, 812 fichiers.
- **Pas de verdict Playwright complet** sur `dbd4a79d`. Le seul WebKit joué depuis la 1.216.1 : les 12 specs du lot #1145 (74 sur 75, `comptes-erreurs-stock-1142` rouge une fois, vert 3 sur 3 seul).

## 4. Le geste à vérifier à l'écran, puis ce que Grégoire fera

**À l'écran**, une fois la 1.216.2 en ligne : sur une copie évaluée, « Évaluer », poser un niveau, attendre 2 s, revenir à « Annoter », passer par les réglages d'une production, puis « Évaluer » de nouveau. L'heure de modification de cette copie (Liste des évaluations) ne doit pas bouger.

**Grégoire, ensuite, dans cet ordre** :
1. Mettre l'Artefact 5 sur G4H dans les réglages de la production.
2. Mettre le codex à jour.
3. Lire les deux mesures sans paramètre (`await ComptesErreurs.verifier()`, `await CartouchesDecalees.verifier()`), puis lancer les deux réparations (`{ reparer: true }`).
4. Réévaluer la copie de 17 h 11.
