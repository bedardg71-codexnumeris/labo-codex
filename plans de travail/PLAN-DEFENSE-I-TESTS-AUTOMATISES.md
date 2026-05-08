# PLAN — Défense I · suite de tests sécurité automatisés

> **Contexte sécurité** : Phase 1 du modèle de menaces.
> **Référence** : `docs/securite/MODELE-MENACES.md §8.2 Phase 1 défense I` + `§8.4 Suite 5` + `§7 C-01 C-02` (régression silencieuse).
> **Statut** : à valider et démarrer.
> **Effort estimé** : 1 semaine pour la v1 (setup + 12-15 tests prioritaires) + maintenance continue à chaque chantier sécurité.

---

## 1. Pourquoi Défense I

Les défenses Phase 0 et Phase 1 livrées (B/H/J/D/P/K/A/E) protègent contre les vecteurs **runtime**. Le scénario **C-01 — régression silencieuse de sécurité dans un commit** échappe par construction à toutes ces défenses puisqu'il opère dans le code source : un changement bien intentionné peut désactiver `echapperHtml`, retirer un sous-schéma de `SCHEMAS_IMPORT`, ou affaiblir le sandbox sans qu'aucune protection runtime ne s'en rende compte.

Trois mécanismes structurels complémentaires contiennent C-01 :
1. **Code review** (humain ou IA) — déjà en place via CLAUDE.md et `/ultrareview` à la demande.
2. **Hook pré-commit J** — déjà livré, attrape les patterns connus (`innerHTML` interpolé sans `echapperHtml`, écritures sur clés sensibles).
3. **Tests automatisés** — défense I, **manquant** aujourd'hui.

La sandbox iframe (Défense A) est solide MAIS :
- Repose sur un hash CSP figé (`'sha256-…'`) qu'une modification de `MESSENGER_SCRIPT` invaliderait silencieusement.
- Les 6 modules d'aperçu d'import dépendent de la classe `modal-import-{nom}` correctement appliquée — un copier-coller maladroit pourrait casser l'isolation sans erreur visible.
- L'origine opaque du sandbox est garantie par la spec, mais un futur changement pourrait ajouter `allow-same-origin` par mégarde.

Les tests automatisés sont la dernière ligne de défense. Sans eux, chaque release est un saut dans le vide.

---

## 2. Scénarios prioritaires v1 (12-15 tests)

Hiérarchie par valeur de couverture × probabilité de régression (estimée).

### A. Tests d'isolation Défense A (4 tests, priorité ABSOLUE)
Réf. : `docs/securite/audits/TESTS-DEFENSE-A-2026-05-08.md` §3.

1. **Origine opaque** : créer une iframe sandbox avec un payload qui tente `parent.localStorage.getItem(...)` → vérifier `SecurityError` ou impossibilité d'écrire le canari.
2. **CSP `script-src 'self' 'sha256-…'`** : injecter un `<script>alert(1)</script>` dans le `htmlContenu` passé à `ApercuSandbox.afficher` → vérifier qu'aucun message n'est posté avec `source: 'apercu-test'` ET vérifier qu'une violation CSP est journalisée par le navigateur (Playwright expose `page.on('weberror')` ou `page.on('console')`).
3. **Hash CSP synchronisé** : recalculer le SHA-256 du `MESSENGER_SCRIPT` lu depuis `js/securite-apercu-sandbox.js` ; vérifier qu'il match le hash dans la CSP de `index.html:6`. Test purement statique, ultra rapide. **Critique** : si `MESSENGER_SCRIPT` change sans bump CSP, le messenger est silencieusement bloqué et la hauteur de l'iframe reste à `hauteurMin` → régression UX invisible côté code mais visible terrain.
4. **Filtrage postMessage** : poster directement un message au `window` parent avec `source: 'apercu-sandbox'` mais une `valeur` non numérique (`{valeur: '<script>alert(1)</script>'}`) → vérifier qu'aucune injection DOM n'est introduite, l'iframe garde sa hauteur précédente.

### B. Tests sanitisation B-α / B-β (3 tests)
Réf. : `js/import-export.js:assainirObjet`, `SCHEMAS_IMPORT`.

5. **assainirObjet sur grille profonde** : appeler `assainirObjet(grille_avec_xss, SCHEMAS_IMPORT.grille)` où `grille_avec_xss.criteres[0].nom = "<img src=x onerror=alert(1)>"` → vérifier que le résultat préserve la structure mais échappe les `<>`.
6. **Sous-schéma `pratique.configuration`** : vérifier que `SCHEMAS_IMPORT.pratique` accepte `configuration` comme objet brut (régression couverte le 6 mai dans B-β).
7. **Tampons** : appeler la fonction de sanitisation tampons avec un payload dans `tampons[].symbole` → vérifier l'échappement.

### C. Tests validation imports (3 tests)
Réf. : `js/import-export.js:validerZipSecurite`, `js/travaux-import.js:validerMagicBytes`.

8. **ZIP slip** (`I-03`) : fabriquer un ZIP avec un chemin `../../../etc/passwd` → `validerZipSecurite` doit retourner `{valide: false}`.
9. **ZIP bomb** (`D-04`) : fabriquer un ZIP qui déclare 4 Go décompressés → rejet.
10. **Magic bytes polyglotte** (`I-02`) : fabriquer un blob qui commence par `%PDF` mais contient `<html><script>` plus loin → `validerMagicBytes` accepte (PDF valide), mais le scénario architectural est qu'on n'exécute jamais le PDF en contexte HTML.

### D. Tests whitelist export K (2 tests)
Réf. : `js/import-export.js`, K whitelist.

11. **Codex export** : appeler la fonction d'export avec un trimestre, vérifier que le ZIP ne contient QUE les clés whitelistées (pas de fichiers annexes type `inventaire.dat`).
12. **Reserve export** : équivalent pour la réserve.

### E. Tests régression Défense A intégration (2 tests)
Réf. : SP2 de Défense A.

13. **Modale d'import grilles** : naviguer vers la bibliothèque, ouvrir un import factice via `ApercuSandbox.afficher` direct, vérifier que le `<iframe sandbox>` est bien créé avec les attributs corrects (`sandbox="allow-scripts allow-popups"` sans `allow-same-origin`).
14. **Cleanup MutationObserver** : ouvrir 5 sandboxes, retirer leurs wrappers manuellement, vérifier que `instances[]` redescend à 0 (probe interne via une API exposée pour les tests, ou via `window.ApercuSandbox.fermer()`).

### F. Anti-régression hook J (1 test)
15. **Lint sécurité statique** : lancer `scripts/audit-innerhtml.sh` et vérifier qu'aucun nouveau cas suspect n'est apparu (snapshot diff).

---

## 3. Décisions à valider avant SP1

1. **Choix du framework** :
   - **Option A — Playwright + Vitest** : Playwright pour browser-real (catégories A, E), Vitest pour fonctions pures (catégories B, C, D, F). 2 frameworks à maintenir.
   - **Option B — Playwright seul** : tout dans Playwright, y compris les fonctions pures (chargées via `page.evaluate(...)` dans une page de test). 1 framework, plus lourd pour les tests unitaires.
   - **Option C — custom test runner offline** : un fichier `tests/runner.html` qui charge `index.html` dans un iframe + un `<script>` qui exécute les tests et rend un rapport. Pas de Node, fonctionne 100 % offline. Le plus dans l'esprit du projet vanilla, le moins standard.
   - **Recommandation** : Option A. Vitest est trivial à setup, courre vite (millisecondes), idéal pour les fonctions de sanitisation/validation. Playwright cible WebKit (Safari) en CI sans Mac, c'est le seul moyen fiable de valider la sandbox + CSP en condition réelle.

2. **CI ou local-only** :
   - GitHub Actions sur push/PR avec `playwright/test` headless WebKit.
   - Alternative : `npm test` local seulement, pas de CI tant que Grégoire est seul.
   - **Recommandation** : commencer local-only (SP5 setup CI optionnel, faisable plus tard).

3. **Bloquant ou avertissement** :
   - Bloquant : le hook pré-push refuse si les tests échouent.
   - Avertissement : tests vert obligatoire pour merger une PR sécurité, mais pas bloquant pour les autres PRs.
   - **Recommandation** : bloquant pour les chemins sécurité (modifications dans `js/securite-*`, `js/import-export.js`, `js/cc-license.js`, `index.html` CSP), avertissement ailleurs. Configurable via une étiquette PR.

4. **Périmètre v1** :
   - 15 tests proposés ci-dessus.
   - Réduire à 8 (uniquement A + B + un de C, un de D) pour livrer plus vite, ou prendre les 15 d'un coup.
   - **Recommandation** : 12-15 d'un coup. Le coût d'un test est faible une fois le framework en place, et la valeur de couverture est très non-linéaire.

---

## 4. Architecture cible

### 4.1 Structure répertoires

```
tests/
├── README.md                    ← documentation usage + commandes
├── package.json                 ← dépendances test (vitest, @playwright/test)
├── vitest.config.js
├── playwright.config.js
├── unit/                        ← tests Vitest (fonctions pures)
│   ├── sanitisation.test.js     ← B catégorie
│   ├── validation-zip.test.js   ← C catégorie (validerZipSecurite)
│   ├── validation-magic.test.js ← C catégorie (validerMagicBytes)
│   ├── whitelist-export.test.js ← D catégorie
│   └── csp-hash.test.js         ← A.3 (test statique critique)
├── integration/                 ← tests Playwright (browser-real)
│   ├── sandbox-isolation.spec.js ← A.1, A.2, A.4
│   ├── import-flow.spec.js       ← E
│   └── lint-securite.spec.js     ← F (wrapper sur audit-innerhtml.sh)
└── fixtures/                    ← payloads de test
    ├── grille-avec-xss.json
    ├── zip-bomb.zip
    ├── zip-slip.zip
    └── pdf-polyglotte.pdf
```

### 4.2 package.json (proposition)

```json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:int": "playwright test",
    "test": "npm run test:unit && npm run test:int",
    "test:watch": "vitest",
    "test:debug": "playwright test --debug"
  },
  "devDependencies": {
    "vitest": "^2.0.0",
    "@playwright/test": "^1.45.0",
    "jsdom": "^24.0.0"
  }
}
```

### 4.3 Charger le code de l'app dans Vitest

Les fonctions pures (`assainirObjet`, `validerZipSecurite`, `echapperHtml`, etc.) sont déclarées dans des fichiers `.js` chargés via `<script>` dans `index.html` — pas de `export`/`import`. Deux approches :

- **A** : ajouter une ligne `module.exports = { fonction1, fonction2 }` à la fin de chaque fichier, conditionnelle à `typeof module !== 'undefined'`. Non intrusif, pattern courant pour les libs vanilla testables.
- **B** : utiliser `vm.runInThisContext` pour évaluer le fichier dans Vitest et capturer les fonctions globales. Plus hacky.

Recommandation : **A**, ajouter ~3 lignes par fichier testé (5-6 fichiers concernés).

### 4.4 Tests Playwright en file://

Playwright peut naviguer vers `file:///path/to/index.html`. En CI, le `playwright.config.js` doit définir le `baseURL` correctement. Pour les payloads, utiliser `page.evaluate` pour appeler `ApercuSandbox.afficher` directement avec un payload contrôlé.

### 4.5 Test critique du hash CSP (A.3)

```js
import { readFileSync } from 'fs';
import { createHash } from 'crypto';

test('hash CSP synchronisé avec MESSENGER_SCRIPT', () => {
    const composantSrc = readFileSync('js/securite-apercu-sandbox.js', 'utf8');
    const m = composantSrc.match(/var MESSENGER_SCRIPT = '([^']+)';/);
    const messenger = m[1];
    const hashAttendu = 'sha256-' + createHash('sha256').update(messenger).digest('base64');

    const indexSrc = readFileSync('index.html', 'utf8');
    expect(indexSrc).toContain(hashAttendu);
});
```

Test ultra rapide (< 50 ms), critique pour prévenir une désynchronisation silencieuse.

---

## 5. Sous-phases

### SP1 — Setup framework (~½ j)
- `npm init` + `tests/package.json` avec Vitest + Playwright
- `playwright install --with-deps webkit` (WebKit headless)
- `tests/README.md` avec commandes
- Premier test trivial dans chaque catégorie pour valider le setup
- Commit : `feat(tests): setup framework Vitest + Playwright`

### SP2 — Tests A (sandbox isolation) + A.3 (hash CSP) (~1 j)
- 4 tests catégorie A (origine opaque, CSP script-src, hash sync, postMessage filter)
- Le test A.3 (hash CSP) est le quick win — purement statique, zero coût d'entretien.
- Commit : `feat(tests): tests d'isolation Défense A`

### SP3 — Tests B (sanitisation) + C (validation imports) (~1.5 j)
- Ajouter les `module.exports` conditionnels aux fichiers concernés (`config.js`, `import-export.js`, `travaux-import.js`).
- 3 tests B + 3 tests C
- Fixtures : grille XSS, ZIP slip, ZIP bomb, polyglotte PDF
- Commit : `feat(tests): tests sanitisation et validation imports`

### SP4 — Tests D (whitelist export) + E (intégration A) + F (lint) (~1 j)
- 2 tests D, 2 tests E, 1 test F
- Test F = wrapper Playwright qui exécute `scripts/audit-innerhtml.sh` et compare au snapshot baseline (`docs/securite/audits/AUDIT-INNERHTML-2026-05-06.md` cas baseline).
- Commit : `feat(tests): tests whitelist export, intégration sandbox, lint statique`

### SP5 — Documentation + intégration hook (~½ j)
- `docs/securite/TESTS-AUTOMATISES.md` : usage, ajout d'un nouveau test, troubleshooting
- (Optionnel) Ajouter un hook pré-push qui exécute `npm run test:unit` (rapide). Bloquant si fail.
- Mise à jour `MODELE-MENACES.md` v1.5 : §6 C-01 → Bon, §8.2 défense I livrée.
- Mise à jour `SESSION.md` + `CLAUDE.md` (référencer la suite de tests).
- Commit : `docs(securite): suite de tests automatisés livrée`

### SP6 — PR + review + merge (~½ j)
- PR + `/ultrareview` (sécurité, ça vaut le coup).
- Pas de fixtures volumineuses dans le repo (regénérer à la volée si > 1 Mo).
- Merge `--merge --delete-branch`.

**Total** : 4-5 j calendaires.

---

## 6. Critères de réussite

- ✅ `npm run test` passe avec 12-15 tests verts (réf. §2).
- ✅ Test A.3 (hash CSP synchronisé) prévient activement la régression Défense A.
- ✅ Hook pré-push optionnel installable via `scripts/install-hooks.sh`.
- ✅ Documentation utilisable par un futur contributeur ou IA.
- ✅ `MODELE-MENACES.md` §6 C-01 statut → **Bon**.
- ✅ Aucune dépendance ajoutée à l'app de production (`tests/package.json` séparé de la racine).

---

## 7. Risques identifiés et mitigations

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Playwright lourd à installer (~300 Mo de browsers) | Élevée | Mineur | Documenter dans README, dépendance dev seulement, pas requise en runtime |
| Tests fragiles à cause de chemins absolus `file://` | Moyenne | Moyen | Utiliser `__dirname` + `path.join` dans `playwright.config.js` ; CI : checkout dans un répertoire stable |
| Faux positifs sur les variations de CSP entre WebKit / Chromium | Faible | Mineur | Tester WebKit en CI (cible production), Chromium en local pour le debugging si besoin |
| Régression sur le test A.3 si MESSENGER_SCRIPT évolue | Élevée par construction | Faible | C'est précisément le but — le test échoue, le développeur recalcule le hash, met à jour la CSP, le test repasse |
| Maintenance continue oubliée | Moyenne | Élevé | SP5 documente le pattern « ajouter un test = ajouter un fichier `.test.js` ». Convention dans CLAUDE.md à mettre à jour |

---

## 8. Annexes

### 8.1 Liste des fonctions pures à exposer pour Vitest (estimation)

- `js/config.js:echapperHtml` (déjà global, ajouter `module.exports`)
- `js/cc-license.js:echapperHtmlCC`
- `js/import-export.js:validerZipSecurite`
- `js/import-export.js:assainirObjet` + `SCHEMAS_IMPORT`
- `js/travaux-import.js:validerMagicBytes`
- `js/securite-export-validation.js` (whitelist K)

Toutes existent déjà ; ajouter `module.exports` non intrusif (3 lignes par fichier).

### 8.2 Convention « ajouter un test sécurité »

À documenter dans `docs/securite/TESTS-AUTOMATISES.md` (livré en SP5) :

> Tout chantier sécurité Phase 1+ ajoute au minimum **1 test dans `tests/`** qui couvre la défense livrée. Si la défense modifie une fonction pure → test Vitest. Si elle modifie un comportement browser (DOM, sandbox, CSP) → test Playwright. Le test prévient la régression — il est la trace executable du chantier.

### 8.3 Pas de scope v2 dans cette PR

Hors scope v1 :
- Fuzzing (peut venir plus tard, demande infrastructure).
- Tests cross-browser exhaustifs (juste WebKit en v1, Chromium/Firefox au besoin).
- Couverture de code (gimmick, on cible la valeur sécurité pas la couverture brute).
- Tests visuels/régression UI (différent objectif).

---

## 9. Ressources

- `docs/securite/MODELE-MENACES.md` v1.4 — §6 tableau, §7 C-01, §8.2 défense I, §8.4 suite 5.
- `docs/securite/audits/TESTS-DEFENSE-A-2026-05-08.md` — point de comparaison pour les tests Défense A.
- `prototype-apercu-sandbox.html` — réutilisable comme base pour les tests d'isolation Playwright.
- `scripts/audit-innerhtml.sh` — ré-utilisé dans le test F (lint statique).
- `js/securite-apercu-sandbox.js:MESSENGER_SCRIPT` — référence pour le test A.3 (hash CSP).

---

**Statut** : ⏳ À démarrer.
**Dernière mise à jour** : 8 mai 2026.
