# Portes terrain – le Cadre : la rangée de sélection en tête des six accordéons (#1148)

> Claude Code, 24 octobre 2026. Lot : `DEMANDE-RELECTURE-2026-10-24-bibliotheques-menu-cadre.md`.
> **Non poussé** à cette date : rien de ce lot n'est encore sur `https://app.codexnumeris.org` (en ligne : la 1.217.0).

## Aucune porte due

Règle 2 du skill `portes-terrain` : une vérification préalable n'est due que si un raté est irréversible. Ce lot ne change que l'affichage : aucune donnée n'est écrite, migrée ni renommée. Un raté se voit à l'usage et se corrige quand Grégoire le signale. Tout ce qu'une machine pouvait éprouver l'a été dans WebKit (`tests/integration/bibliotheques-menu-cadre-1148.spec.js`, 15 essais ; 24 specs du périmètre, 114 essais).

## § 4 · Ce que je n'ai pas pu vérifier

- **Les menus natifs de l'iPad réel** : toucher un des six menus ouvre la liste de Safari ; WebKit de bureau ne la montre pas (le choix y est simulé).
- **Safari réel sur le Mac** : mesuré dans le WebKit de Playwright, pas dans Safari.
- **L'horaire en iPad portrait** : chaque séance tient maintenant sur deux lignes à 820 px (elle dépassait sur une seule). Mesuré dans WebKit, pas vu au doigt.
- **Le mode sombre à l'écran** : les captures montrent le mode clair ; le spécimen de `design-system.html` (section 23) montre les deux.
- **Les données réelles** : la démo a un seul groupe, un seul groupe-cours. Avec beaucoup de groupes ou de programmes, la bande du résumé des élèves passe à la ligne ; non vu sur un vrai trimestre.
