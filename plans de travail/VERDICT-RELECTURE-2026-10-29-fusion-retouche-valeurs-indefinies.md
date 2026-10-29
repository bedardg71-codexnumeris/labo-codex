# Verdict de relecture – La fusion compare comme le codex écrit (retouche de #1182)

> Cowork, jeudi 29 octobre 2026, 18 h 44 (Toronto, mesuré par `date`), sur `main` = `4b87128d` (non poussé). Lu : la demande de relecture ; le diff de `64033140` dans `js/codex.js` (`_jsonStable`). Vitest et Playwright non rejoués.

## Verdict

**Accepté.**

- `_jsonStable` suit maintenant `JSON.stringify` sur chaque cas qui compte ici : `toJSON` (une `Date` devient sa chaîne), primitives emballées, propriété `undefined` / fonction / symbole absente d'un objet et `null` dans une liste, clés triées. Une `Blob` ou une `Map` gardée en base donne `{}` des deux côtés, comme le JSON.
- Le break-test rougit la sentinelle (6 sur 7, le 7ᵉ garde qu'une vraie différence reste un conflit) et le banc WebKit, qui écrit enfin ses données d'ici par IndexedDB.
- Aucune donnée réécrite : les `undefined` en base restent, sans effet.

**Ce qui reste une inférence** : que les 121 faux conflits de Grégoire viennent de ces deux cas. Mesuré : les deux fichiers écrits une minute avant sa fusion ne diffèrent que sur 3 copies et 3 réglages ; la correction compare désormais l'espace d'ici comme ces fichiers. Non observé dans son navigateur. **Le témoin sera sa fusion sur le Mac en 1.225.1 : 6 conflits attendus.** S'il en voit davantage, il annule (4) et Cowork mesure dans son navigateur.
