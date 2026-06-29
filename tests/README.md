# Tests sécurité — Défense I

Suite de tests automatisés pour prévenir les régressions silencieuses
de sécurité (cf. `docs/securite/MODELE-MENACES.md` §7 C-01 et §8.2
Phase 1 défense I).

Le `package.json` est **séparé de la racine du projet**. L'app de
production reste vanilla JS sans dépendance npm runtime — Node et
les frameworks de test ne sont requis que pour développer/exécuter
cette suite.

## Pré-requis

- Node 20+
- npm

## Installation

```bash
cd tests
npm install
npx playwright install --with-deps webkit
```

`playwright install` télécharge environ 300 Mo de browsers. Cible :
WebKit (Safari) en headless, qui correspond à la cible production.

## node_modules — jamais versionné, un par arbre de travail

`node_modules/` n'est **jamais** suivi par git (ni ici, ni à la racine).
Chaque arbre de travail — clone frais comme worktree git — installe ses
propres dépendances :

```bash
cd tests && npm ci      # reproductible (depuis package-lock.json)
# ou : npm install
```

Le hook `session-start.sh` et `scripts/hooks/pre-push` le font/skippent
automatiquement selon que `tests/node_modules` existe ou non.

Historique : `tests/node_modules` (et `node_modules` à la racine) ont déjà
été suivis **par erreur** sous forme de symlinks pointant vers un worktree
ensuite supprimé — un checkout frais cassait alors `cd tests && npm test`.
Ne jamais recréer de symlink versionné. Si un `node_modules` partagé entre
worktrees est souhaité, le faire avec un symlink **local non suivi** (déjà
couvert par le `.gitignore`, pattern `node_modules` sans slash final).

## Commandes

```bash
npm run test:unit    # Vitest — fonctions pures (sanitisation, validation, hash CSP)
npm run test:int     # Playwright WebKit headless — sandbox + CSP browser-real
npm test             # les deux
npm run test:watch   # Vitest mode watch (TDD)
npm run test:debug   # Playwright mode debug interactif
```

## Architecture

```
tests/
├── unit/           ← tests Vitest (fonctions pures)
├── integration/    ← tests Playwright (browser-real)
│   └── harness/    ← pages HTML autonomes pour les tests d'isolation
├── package.json
├── vitest.config.js
└── playwright.config.js
```

Les payloads de test (grilles XSS, ZIP slip, ZIP bomb, polyglottes) sont
fabriqués à la volée dans les fichiers `*.test.js` / `*.spec.js`
(via `jszip` ou `Blob`), pas stockés en fixtures statiques.

## Convention « ajouter un test sécurité »

Tout chantier sécurité Phase 1+ ajoute au minimum **1 test** qui couvre
la défense livrée :

- Modification d'une fonction pure → test Vitest dans `unit/`
- Modification d'un comportement browser (DOM, sandbox, CSP) → test
  Playwright dans `integration/`

Le test prévient la régression — il est la trace exécutable du chantier.

## Documentation

- Plan complet du chantier : `plans de travail/PLAN-DEFENSE-I-TESTS-AUTOMATISES.md`
- Modèle de menaces : `docs/securite/MODELE-MENACES.md`
- Référence Défense A (point de comparaison) : `docs/securite/audits/TESTS-DEFENSE-A-2026-05-08.md`
