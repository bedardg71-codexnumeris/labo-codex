# Portes terrain – le profil individuel : la rangée de sélection au lieu de la barre latérale (#1151)

> Claude Code, 24 octobre 2026. Lot : `DEMANDE-RELECTURE-2026-10-24-profil-individuel-rangee.md`.
> **Non poussé** à cette date : rien de ce lot n'est encore sur `https://app.codexnumeris.org` (en ligne : la 1.217.0).

## Aucune porte due

Règle 2 du skill `portes-terrain` : une vérification préalable n'est due que si un raté est irréversible. Ce lot ne change que l'affichage : aucune donnée n'est écrite, migrée ni renommée. Un raté se voit à l'usage et se corrige quand Grégoire le signale. Tout ce qu'une machine pouvait éprouver l'a été dans WebKit (`tests/integration/profil-rangee-1151.spec.js`, 9 essais ; 28 specs du périmètre du profil, 95 essais).

## § 4 · Ce que je n'ai pas pu vérifier

- **Le menu natif de l'iPad réel** : toucher le menu de l'élève ouvre la liste de Safari ; WebKit de bureau ne la montre pas (le choix y est simulé).
- **‹ et › au doigt** : 44 × 44 px mesurés dans WebKit à 820 et 1180 px, pas touchés sur l'iPad.
- **Safari réel sur le Mac** : mesuré dans le WebKit de Playwright, pas dans Safari.
- **Les données réelles** : la démo a un seul groupe et des programmes courts. Avec un long nom de programme et les deux mesures (services adaptés, mesure d'aide), les étiquettes passent à la ligne sous la rangée de l'élève ; non vu sur un vrai trimestre.
- **« Jugement »** : éprouvé en forçant la condition d'aujourd'hui (une pratique par dénotation active), pas avec une vraie pratique par dénotation dans la démo.
