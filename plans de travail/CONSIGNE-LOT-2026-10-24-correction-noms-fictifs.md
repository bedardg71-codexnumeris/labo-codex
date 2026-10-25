# Consigne de lot – correction : les deux noms retirés le 24 oct. étaient fictifs (samedi 24 octobre 2026)

> Écrite par Cowork (session dans le nuage) le samedi 24 octobre 2026 à 19 h 22 (Toronto), sur `main` = `dbdfc619`. Ce fichier ne remplace aucune autre consigne.
> **Ce qui s'est passé.** Le lot `CONSIGNE-LOT-2026-10-24-noms-reels-tests.md` (commit `cac1465d`) a retiré deux noms de famille présentés comme ceux d'étudiant·es réel·les. Grégoire, à 19 h 18 : « Je n'ai ni élève [nom 1] ni [nom 2] ». La prémisse venait du commentaire de tête de `tests/unit/sentinelle-603-604-import-pages-et-remplacement.test.js`, que Cowork a cru sans le lui demander. Aucune donnée n'était exposée.

## Le mandat

1. **Garde les remplacements** (« Exemple », « Essai ») dans les tests et dans `RELAIS.md` : fictif pour fictif, sans effet ; ne les défais pas.
2. **Retire** `tests/unit/sentinelle-noms-reels-retires-2026-10-24.test.js` : elle interdit deux noms fictifs et son commentaire affirme une chose fausse (zéro-dette : un test sans objet part).
3. **Le commentaire de tête de `sentinelle-603-604`** : il ne doit plus dire que les noms du banc sont ceux d'élèves de l'import réel. Garde ce qui est mesuré (l'import du 30 août, deux travaux remis en deux pages, les deux défauts) ; dis que les noms du banc sont fictifs.
4. **`RELAIS.md`, l. ~7496** : « d'une élève (nom retiré le 24 oct. 2026, règle 6) » devient « d'un exemple (nom fictif, remplacé le 24 oct. 2026) ».
5. **Ne réécris aucun commit** (`cac1465d` n'est pas le dernier, et `main` porte des commits d'une autre session) : le message de ton commit dit la correction.

## Clôture

- Vitest depuis `tests/` ; aucun fichier `js/`, donc pas de jeton.
- Un commit : « fix(tests) : les deux noms retirés en cac1465d étaient fictifs (Grégoire, 24 oct., 19 h 18) ; la sentinelle sans objet part, le commentaire et le relais disent vrai ».
- Pas de release, ni verdict, ni push. Pas de demande de relecture : Cowork relit le diff directement.
