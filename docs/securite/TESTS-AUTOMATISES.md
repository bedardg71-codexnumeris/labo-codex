# Tests sécurité automatisés — Défense I

> **Chantier** : Phase 1 sécurité, Défense I (cf. `MODELE-MENACES.md` §7 C-01 + §8.2 Phase 1 + §8.4 Suite 5).
> **Statut** : v1 livrée 8 mai 2026 — 29 tests verts en ~12 s.
> **Branche** : `feature/securite-defense-i-tests`.

---

## 1. Pourquoi cette suite

Les défenses Phase 0 et Phase 1 (B/H/J/D/P/K/A/E) protègent contre les vecteurs **runtime**. Le scénario **C-01 — régression silencieuse de sécurité dans un commit** échappe par construction à toutes ces défenses puisqu'il opère **dans le code source** : un changement bien intentionné peut désactiver `echapperHtml`, retirer un sous-schéma de `SCHEMAS_IMPORT`, ou affaiblir le sandbox sans qu'aucune protection runtime ne s'en rende compte.

Trois mécanismes structurels complémentaires contiennent C-01 :

1. **Code review** (humain ou IA) — déjà en place via `CLAUDE.md` et `/ultrareview` à la demande.
2. **Hook pré-commit J** — déjà livré (cf. `docs/securite/HOOKS-PRE-COMMIT.md`).
3. **Tests automatisés (cette suite)** — défense I, livrée 8 mai 2026.

C'est la dernière ligne de défense avant qu'une régression atteigne la prod.

---

## 2. Quick start

```bash
cd tests
npm install                                  # première fois seulement
npx playwright install --with-deps webkit    # première fois seulement (~300 Mo)

npm run test:unit    # Vitest — fonctions pures (~9 s, dont 8 s pour F.15)
npm run test:int     # Playwright WebKit — sandbox + CSP browser-real (~4 s)
npm test             # les deux
npm run test:watch   # Vitest mode watch
npm run test:debug   # Playwright mode debug interactif
```

Pré-requis : Node 20+, npm. Le `package.json` est **séparé de la racine** — l'app de production reste vanilla JS sans dépendance npm runtime.

---

## 3. Architecture des tests

```
tests/
├── unit/                              ← Vitest (fonctions pures)
│   ├── _helpers/charger-script.js     ← charge une IIFE projet en sandbox Node
│   ├── csp-hash.test.js               ← A.3
│   ├── sanitisation.test.js           ← B.5, B.6, B.7
│   ├── validation-zip.test.js         ← C.8, C.9
│   ├── validation-magic.test.js       ← C.10
│   ├── whitelist-export.test.js       ← D.11, D.12
│   ├── lint-securite.test.js          ← F.15
│   └── setup.test.js                  ← canari du runner
├── integration/                       ← Playwright (browser-real WebKit)
│   ├── harness/
│   │   ├── sandbox-harness.html       ← sans CSP (A.1, A.4, E.13, E.14)
│   │   └── sandbox-harness-csp.html   ← avec CSP de prod (A.2)
│   ├── sandbox-isolation.spec.js      ← A.1, A.2, A.4
│   ├── sandbox-attributs.spec.js      ← E.13, E.14
│   └── setup.spec.js                  ← canari du runner
└── package.json                       ← devDeps : vitest, @playwright/test, jsdom, jszip
```

### Mapping scénario → test

| # | Scénario | Test | Cible |
|---|---|---|---|
| A.1 | Origine opaque iframe sandbox | `sandbox-isolation.spec.js` | `parent.localStorage`/`document.title`/`document.cookie` → `SecurityError` |
| A.2 | CSP `script-src` rejette scripts inline | `sandbox-isolation.spec.js` | `<script>` + `<img onerror>` injectés → 0 message exfiltré |
| A.3 | Hash CSP synchronisé avec MESSENGER_SCRIPT | `csp-hash.test.js` | sha256 lu sur le composant match `index.html:10` |
| A.4 | Filtrage strict `postMessage` | `sandbox-isolation.spec.js` | 4 messages malformés → hauteur iframe stable |
| B.5 | `assainirObjet` sur grille profonde | `sanitisation.test.js` | balises retirées dans `criteres[].nom`/`description` |
| B.6 | `SCHEMAS_IMPORT.pratique.configuration` | `sanitisation.test.js` | sous-schéma présent + contenu hétérogène préservé |
| B.7 | `assainirObjet` sur tampon | `sanitisation.test.js` | balises retirées dans `nom`/`categorie` |
| C.8 | I-03 ZIP slip | `validation-zip.test.js` | `../` ou `/`-absolu → `validerZipSecurite` rejette |
| C.9 | D-04 ZIP bomb | `validation-zip.test.js` | `uncompressedSize > 2 Go` → rejet |
| C.10 | I-02 magic bytes polyglotte | `validation-magic.test.js` | PDF/PNG/HEIC acceptés, HTML déguisé + MP4 rejetés |
| D.11 | Whitelist export codex | `whitelist-export.test.js` | entrée pirate (`inventaire.dat`) → `validerExportCodex` throw |
| D.12 | Whitelist export réserve | `whitelist-export.test.js` | chemin hors `trimestres/` → `validerExportReserve` throw |
| E.13 | Attributs iframe sandbox corrects | `sandbox-attributs.spec.js` | `allow-scripts allow-popups`, **pas** d'`allow-same-origin` |
| E.14 | Auto-cleanup MutationObserver | `sandbox-attributs.spec.js` | `instances[]` 0 → 5 → 0 après détachement DOM |
| F.15 | Lint statique innerHTML | `lint-securite.test.js` | `audit-innerhtml.sh` ≤ baseline 120 cas suspects |

---

## 4. Convention « ajouter un test sécurité »

Tout chantier sécurité Phase 1+ ajoute au minimum **1 test** qui couvre la défense livrée :

- **Modification d'une fonction pure** → test Vitest dans `tests/unit/`. Si la fonction est dans une IIFE projet, charger via `chargerScript('js/le-module.js')` (helper qui crée un sandbox Node minimal).
- **Modification d'un comportement browser** (DOM, sandbox, CSP, événements) → test Playwright dans `tests/integration/`. Utiliser un harness dans `tests/integration/harness/` ou créer un nouveau si la situation l'exige.

Le test prévient la régression — il est **la trace exécutable du chantier**. Sans test, le chantier n'est pas terminé.

### Si la fonction n'est pas exposée sur `window`

Pattern projet : `window.maFonction = maFonction;` à la fin de l'IIFE, juste avant `})();`. Une ligne, non intrusive, déjà utilisé pour `validerMagicBytes` (cf. `js/travaux-import.js:1554`).

---

## 5. Maintenance

### 5.1 Recalculer le hash CSP (A.3)

Si `MESSENGER_SCRIPT` change dans `js/securite-apercu-sandbox.js` :

```bash
node -e "console.log('sha256-' + require('crypto').createHash('sha256').update('<colle ici la chaîne MESSENGER_SCRIPT entre quotes>').digest('base64'))"
```

Mettre à jour la directive `script-src` dans `index.html:10` ET `tests/integration/harness/sandbox-harness-csp.html:13`. Le test A.3 attrape la divergence côté `index.html` ; pour le harness, faire visuellement.

### 5.2 Bumper la baseline lint (F.15)

Le test F.15 figé une borne supérieure de cas `innerHTML` interpolés sans `echapperHtml` (baseline 120 au 8 mai 2026). Procédure pour la baisser après une migration :

1. Lancer `bash scripts/audit-innerhtml.sh`
2. Relever la nouvelle valeur « Suspect »
3. Mettre à jour `SEUIL_SUSPECTS_MAX` dans `tests/unit/lint-securite.test.js`
4. Documenter dans le commit

⚠ La baseline ne se bumpe **que vers le bas**. Une augmentation est une régression à corriger avant commit.

### 5.3 Re-générer un harness CSP

Le harness `sandbox-harness-csp.html` duplique la CSP d'`index.html`. À chaque évolution de la CSP de prod, mettre à jour le harness manuellement. Le test A.3 vérifie le hash mais pas les autres directives.

---

## 6. Troubleshooting

| Symptôme | Cause probable | Action |
|---|---|---|
| `playwright: command not found` | `npx playwright install …` non exécuté | `cd tests && npx playwright install --with-deps webkit` |
| `Error: WebKit ... not found` | Browser non installé ou version périmée | `npx playwright install webkit --force` |
| Test A.3 rouge | `MESSENGER_SCRIPT` modifié sans recalcul | §5.1 ci-dessus |
| Test F.15 rouge avec `+N suspects` | Régression `innerHTML` introduite | Identifier le cas via `bash scripts/audit-innerhtml.sh --details`, échapper via `echapperHtml` ou convertir en `textContent` |
| Test E.14 timeout | `MutationObserver` cassé ou plus de probe | Vérifier `__nbInstances` toujours présent dans `js/securite-apercu-sandbox.js` |
| Test Vitest qui charge un script projet échoue avec `xxx is not defined` | Top-level effet de bord non stubbé | Étendre `tests/unit/_helpers/charger-script.js` (paramètre `globaux`) |

### Logs Playwright

En cas d'échec d'un test integration, les traces sont dans `tests/test-results/`. Voir aussi `npm run test:debug` pour mode interactif.

---

## 7. Hook pré-push (optionnel)

Un hook pré-push qui exécute `npm run test:unit` est disponible dans `scripts/hooks/pre-push`. Il bloque le push si un test unit échoue (rapide, ~9 s). Activation :

```bash
bash scripts/install-hooks.sh
```

Idempotent. Pour désactiver : `git config --unset core.hooksPath`.

---

## 8. Références

- `plans de travail/PLAN-DEFENSE-I-TESTS-AUTOMATISES.md` — plan complet du chantier
- `docs/securite/MODELE-MENACES.md` — §7 C-01, §8.2 Phase 1 défense I, §8.4
- `docs/securite/audits/TESTS-DEFENSE-A-2026-05-08.md` — tests Défense A (point de comparaison)
- `docs/securite/HOOKS-PRE-COMMIT.md` — hook pré-commit Défense J
- `tests/README.md` — quick start utilisateur

---

**Dernière mise à jour** : 8 mai 2026 (livraison v1).
