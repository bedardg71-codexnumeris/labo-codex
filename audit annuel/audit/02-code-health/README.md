# Axe 2 — Santé du code

**Priorité 2.** **Temps total estimé : 4 h.** **Principalement Claude Code en autonomie.**

---

## Question d'audit

Le code de Labo Codex est-il maintenable, lisible, et exempt de duplication excessive ou de complexité non justifiée ?

---

## Cadre

ISO/IEC 25010:2023 (maintenabilité : modularité, réutilisabilité, analysabilité, modifiabilité, testabilité).
McCabe (1976) — cyclomatic complexity.
Campbell (2018, SonarSource) — cognitive complexity.

---

## Sous-audits

### 2.1 — Taille et composition (20 min)

**Commandes** :

```bash
# Comptage global avec scc (plus précis que cloc, prend en compte la complexité)
scc --by-file --sort complexity js/ > audit/reports/02-1-scc.txt
scc --no-cocomo js/ > audit/reports/02-1-scc-summary.txt

# Comptage de référence avec cloc
npx cloc --by-file --json js/ > audit/reports/02-1-cloc.json
npx cloc js/ > audit/reports/02-1-cloc-summary.txt
```

**Seuils** :
- Total réel ≈ 35 modules JS revendiqués : vert si concordance ±10 %, jaune si écart 10-30 %, rouge si > 30 %.
- Fichiers > 500 lignes : jaune.
- Fichiers > 1000 lignes : rouge.

**Livrable** : `audit/reports/02-1-loc.md` avec :
- Total LOC, nombre de fichiers, ratio commentaires/code.
- Top 10 plus gros fichiers.
- Top 10 fichiers les plus complexes (scc score).
- Statut V/J/R justifié.

---

### 2.2 — Complexité cyclomatique et cognitive (1 h 30)

**Préalable** : copier `.eslintrc.audit.json` à la racine du repo (déjà fourni dans le dossier `audit/`).

**Commandes** :

```bash
# Exécution avec config dédiée à l'audit
npx eslint --no-eslintrc -c audit/.eslintrc.audit.json --ext .js js/ -f json > audit/reports/02-2-eslint-complexity.json

# Version lisible pour humains
npx eslint --no-eslintrc -c audit/.eslintrc.audit.json --ext .js js/ -f stylish > audit/reports/02-2-eslint-complexity.txt 2>&1 || true
```

(`|| true` parce que ESLint sort en code non-zéro dès qu'il y a une violation, ce qui interromprait le script.)

**Seuils** :

| Métrique | Vert | Jaune | Rouge | Source |
|---|---|---|---|---|
| Cyclomatic / fonction | ≤ 10 | 11-15 | > 15 | CodeScene |
| Cognitive / fonction | ≤ 15 | 16-25 | > 25 | SonarSource S3776 |
| Nesting depth | ≤ 3 | 4-5 | > 5 | CodeScene |
| Lignes / fonction | ≤ 60 | 61-100 | > 100 | McConnell |
| Lignes / fichier | ≤ 500 | 501-1000 | > 1000 | Convention |

**Statut global** :
- Vert : < 10 % des fonctions dépassent au moins un seuil jaune.
- Jaune : 10-20 % des fonctions dépassent au moins un seuil jaune.
- Rouge : > 20 % des fonctions dépassent au moins un seuil, OU ≥ 1 fonction en zone rouge.

**Critère d'arrêt** : si > 20 %, **arrêter et discuter avec Grégoire** avant de continuer. Un audit AQPC sur un code en zone rouge serait contre-productif.

**Livrable** : `audit/reports/02-2-complexity.md` avec :
- Top 10 fonctions hors-seuils.
- Tableau de répartition (combien de fonctions dans chaque tranche).
- Recommandations de refactoring si applicable.

---

### 2.3 — Duplication (30 min)

**Commandes** :

```bash
npx jscpd \
  --min-tokens 50 \
  --min-lines 5 \
  --threshold 3 \
  --reporters "console,html,markdown" \
  --output audit/reports/02-3-jscpd \
  --ignore "**/*.min.js,**/vendor/**,**/node_modules/**" \
  js/
```

**Seuils** :
- Vert : duplication globale ≤ 1 %.
- Jaune : 1-3 %.
- Rouge : > 3 %.

(Réf. : jscpd documentation officielle ; SonarQube seuil par défaut 100 tokens.)

**Livrable** : rapport HTML jscpd dans `audit/reports/02-3-jscpd/` + résumé `audit/reports/02-3-duplication.md` listant :
- Pourcentage global de duplication.
- Top 10 clones avec localisation exacte.
- Statut V/J/R justifié.
- Recommandations de consolidation si applicable.

---

### 2.4 — Code mort, fichiers orphelins, dépendances circulaires (20 min)

**Commandes** :

```bash
# Point d'entrée à adapter (probablement index.html ou main.js)
ENTRY="js/main.js"  # À AJUSTER selon Labo Codex

# Modules jamais importés
npx madge --orphans "$ENTRY" > audit/reports/02-4-orphans.txt

# Dépendances circulaires
npx madge --circular "$ENTRY" > audit/reports/02-4-circular.txt

# Graphe visuel (nécessite Graphviz : brew install graphviz sur macOS)
npx madge --image audit/reports/02-4-deps.svg "$ENTRY" 2>/dev/null || echo "Graphviz non installé, graphe ignoré"

# Liste JSON complète des dépendances
npx madge --json "$ENTRY" > audit/reports/02-4-madge.json
```

**Note importante** : si Labo Codex n'utilise pas de modules ES (`import/export`) mais charge les scripts via `<script>` dans HTML, madge ne fonctionnera pas. Dans ce cas, Claude Code doit **documenter cette limite** et tenter une analyse manuelle des `<script src=...>` dans `index.html`.

**Seuils** :
- Vert : 0 orphelin, 0 cycle.
- Jaune : 1-3 orphelins, OU 1 cycle.
- Rouge : ≥ 4 orphelins, OU ≥ 2 cycles.

**Livrable** : `audit/reports/02-4-dead-code.md`.

---

### 2.5 — Linting global (qualité et sécurité de base) (40 min)

**Commandes** :

```bash
# ESLint en mode recommended + security
npx eslint --no-eslintrc \
  --env browser,es2022 \
  --parser-options ecmaVersion:2022,sourceType:module \
  --rule '{"no-unused-vars":"warn","no-undef":"error","no-console":"off","no-debugger":"warn","no-alert":"warn","no-eval":"error","no-implied-eval":"error"}' \
  --plugin security \
  --rule '{"security/detect-eval-with-expression":"error","security/detect-non-literal-regexp":"warn","security/detect-object-injection":"warn","security/detect-unsafe-regex":"warn"}' \
  --ext .js js/ \
  -f stylish \
  > audit/reports/02-5-eslint-quality.txt 2>&1 || true
```

**Seuils** :
- Vert : 0 erreur, ≤ 10 warnings.
- Jaune : 0 erreur, 11-30 warnings.
- Rouge : ≥ 1 erreur, ou règle `security/*` déclenchée, ou > 30 warnings.

**Livrable** : `audit/reports/02-5-lint.md`.

---

## Synthèse de l'axe 2

À la fin des 5 sous-audits, produire `audit/reports/02-summary.md` :

- Tableau statuts V/J/R par sous-audit.
- Statut global de l'axe (le pire des 5).
- Recommandations consolidées.
- Liste des fichiers/fonctions à refactorer en priorité.
