# Demande de relecture – La fusion compare comme le codex écrit (29 octobre 2026, retouche de #1182)

> Écrite par Claude Code le jeudi 29 octobre 2026, en exécution de `CONSIGNE-LOT-2026-10-29-fusion-retouche-valeurs-indefinies.md`, sur `main` parti de `746426c2`. Rien n'est poussé : la mise en ligne (1.225.1) attend le signal de Grégoire.

## 1. Ce qui change

`_jsonStable` (`js/codex.js`) suit maintenant la sémantique de `JSON.stringify` : une propriété `undefined`, une fonction ou un symbole est absente d'un objet et vaut `null` dans une liste ; `toJSON` est respecté (une `Date` devient sa chaîne) ; un nombre, une chaîne ou un booléen en boîte est déballé. Les clés restent triées. Le changement vaut pour les trois usages : les conflits par id (`_comparerListeAId`), la comparaison d'une clé entière, et l'union par contenu du chronomètre (avec ses comptes dans l'aperçu).

Aucune donnée n'est réécrite. Les `undefined` d'ici restent en base (c'est le stock, sans conséquence), et la fusion se contente de les comparer comme le codex les écrirait.

## 2. Les autres comparaisons de la fusion (mesurées)

- Le raccourci de `_analyserFusion` (clé entière, `JSON.stringify(local) === JSON.stringify(externe)`) suit déjà la sémantique du JSON. Il ne peut que conclure « identique » ; quand il échoue, `_jsonStable` tranche.
- `_verserALaCorbeille`, `_copiesPrisesDeLAutre` et `_valeurApresFusion` comparent par `id`, pas par contenu.
- L'aperçu (deuxième appel de `_analyserFusion`, vers `js/codex.js:4227`) passe par la même fonction.

Aucune autre comparaison par contenu n'a été trouvée dans la fusion.

## 3. Les preuves

| Banc | Avec la correction | Ancienne `_jsonStable` remise |
|---|---|---|
| `sentinelle-1182-fusion-valeurs-indefinies` (Vitest, 7 cas) | 7 verts | 6 rouges ; le 7ᵉ (« null n'est pas absent ») est le garde-fou inverse |
| `codex-1182-fusion-copie-par-copie` (WebKit) | vert | rouge : « Différent des deux côtés » affiché |
| Vitest complet, depuis `tests/` | 851 fichiers, 10 317 tests verts | — |

Le banc WebKit écrit désormais `dateModification: undefined` dans IndexedDB, côté « Mac ». Un témoin vérifie après le rechargement que la propriété est bien gardée, ce qui manquait à la version précédente du banc. Pour le break-test, l'arbre a été restauré par sha256, à l'identique.

Un premier passage a rougi le cliquet #642 : le nouveau paramètre `cle` masquait `cle()`. Il s'appelle maintenant `propriete`, et le cliquet n'a pas été relevé.

Deux cas de la sentinelle passaient d'abord par le raccourci JSON et ne jugeaient pas `_jsonStable`. Ils ont été réécrits pour passer par elle, et le break-test le confirme.

## 4. Ce que la session n'a pas pu voir

- Les deux fichiers témoins de Grégoire (17 h 45 et 17 h 46) : ils ne sont pas dans le dépôt. Le compte attendu, 6 conflits, est celui que Cowork a mesuré ; il n'a pas été remesuré ici.
- Chrome sur le Mac : seul WebKit a été lancé. La porte, c'est la vraie fusion de Grégoire.

## 5. À trancher par la relecture

Rien de pédagogique, et aucun mot affiché n'est touché. La mise en ligne est prévue en 1.225.1, sans entrée aux Nouvelles.
