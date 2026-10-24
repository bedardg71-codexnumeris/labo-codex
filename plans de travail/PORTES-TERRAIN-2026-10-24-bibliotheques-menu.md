# Portes terrain – les bibliothèques de la Conception en menu déroulant (#1147)

> Claude Code, 24 octobre 2026. Lot : `DEMANDE-RELECTURE-2026-10-24-bibliotheques-menu-conception.md`.
> **Non poussé** à cette date : rien de ce lot n'est encore sur `https://app.codexnumeris.org`.

## Aucune porte due

Règle 2 du skill `portes-terrain` : une vérification préalable n'est due que si un raté est irréversible. Ce lot ne change que l'affichage : aucune donnée n'est écrite, migrée ni renommée. Un raté se voit à l'usage et se corrige quand Grégoire le signale. Tout ce qu'une machine pouvait éprouver l'a été dans WebKit (`tests/integration/bibliotheques-menu-1147.spec.js`, 13 essais).

## § 4 · Ce que je n'ai pas pu vérifier

- **Le sélecteur natif de l'iPad réel.** Sur iPad, toucher le menu ouvre la roue ou la liste de Safari. WebKit de bureau ne la montre pas : le choix y est simulé (`selectOption`). Si une liste longue (11 productions dans la démo) s'y lit mal, c'est à signaler à l'usage.
- **Safari réel sur le Mac** : mesuré dans le WebKit de Playwright, pas dans Safari.
- **La palette du critère algorithmique en iPad paysage** : elle est maintenant sur le côté et colle sous la barre (mesuré à 1 180 px dans WebKit). Le geste au doigt sur un vrai iPad en paysage n'est pas éprouvé.
- **Les deux modes à l'écran** : les captures montrent un seul mode ; le spécimen de `design-system.html` montre les deux.
