# Audit innerHTML — Findings session 11 mai 2026

> Suite de la session du 6 mai 2026 (`AUDIT-INNERHTML-FINDINGS-2026-05-06.md`).
> Re-exécution du script `scripts/audit-innerhtml.sh` puis examen des cas restants
> et des modules non audités précédemment.

## Synthèse exécutive

| Élément | Constat |
|---|---|
| Total `.innerHTML` dans le projet | 677 (vs 699 le 6 mai — -22, surface réduite) |
| Sécurisés (`echapperHtml` voisin) | 55 |
| Statiques (sans interpolation) | 502 |
| **Suspects** (interpolation sans `echapperHtml`) | **120** (vs 125 le 6 mai — -5) |
| Cas examinés cette session | 24 |
| **Vrais correctifs appliqués** | **3** (`liste-evaluations.js`, `travaux-ui.js`) |
| Pattern systémique identifié | `value="${item.id}"` brut dans attributs (20+ occurrences) |
| **Recommandation** | Cf. §Recommandation |

## Cas examinés cette session

### 1. pratiques.js (4 cas non examinés en mai) — tous faux positifs

| Ligne | Statut | Raison |
|---|---|---|
| L1522 | Faux positif | `${types[modalites.typePAN]}` — lookup dans constante figée (3 valeurs hardcodées). |
| L3039 | Faux positif | `${index + 1}` — entier calculé. |
| L3088 | Faux positif | `${index + 1}` — entier calculé. |
| L3140 | Faux positif | `${i}` — entier de boucle. |

### 2. bibliotheque-ui.js (1 cas non examiné en mai) — faux positif

| Ligne | Statut | Raison |
|---|---|---|
| L181 | Faux positif | `bannerHTML` construit avec `echapperHtml` sur tout champ utilisateur (`texte`, `label`, `item.id`). |

### 3. reserve-reglages.js (5 cas, module non audité) — tous faux positifs

| Lignes | Statut | Raison |
|---|---|---|
| L80, L100, L125, L179, L226 | Faux positifs | Tous les champs venant des données (manifeste local) passent par `_echapper` voisin. Reste du contenu littéral. |

### 4. codex-data-ui.js (5 cas, module non audité) — tous faux positifs

| Lignes | Statut | Raison |
|---|---|---|
| L116, L201, L246, L347 | Faux positifs | Contenu statique. |
| L362 | Faux positif | `${_archivesDuDossier.length}` — nombre. |

### 5. liste-evaluations.js (4 cas, partiellement audité) — 2 vrais correctifs

| Ligne | Statut | Action |
|---|---|---|
| L264 | **Vrai correctif** | `${error.message}` interpolé sans `echapperHtml` dans innerHTML d'affichage d'erreur. Si une `Error` applicative incorpore une chaîne utilisateur (ex. nom de fichier importé), elle est rendue brute → vecteur D-01 théorique. **Fix** : `echapperHtml(error.message \|\| '')`. |
| L1442 | Faux positif | Toutes les options (étudiants, productions, évals) sont construites avec `echapperHtml` sur `value` ET le texte visible. |
| L1549 | Faux positif | `${productionActuelle ? 'Réassocier' : 'Associer'}` — littéral. |
| L1534 (interne à L1549) | **Vrai correctif** | `'<option value="' + p.id + '" '` — `p.id` brut dans attribut. **Fix** : `echapperHtml(p.id)`. |
| L1578 | Faux positif | Contenu littéral. |

### 6. travaux-ui.js (14 cas, échantillon — 6 examinés) — 1 vrai correctif + 7 thumbnails

| Lignes | Statut | Raison |
|---|---|---|
| L669 | Faux positif | `_htmlBadgesGrille` = sortie de `genererGrilleFichiers` qui utilise `echapperHtml` aux endroits sensibles. |
| L1160 | Faux positif | Variables = nombres formatés + sortie de `genererGrilleFichiers`. |
| L1346, L1359, L1504, L1515, L1529, L1566, L2088 | Faux positifs | Tous `<img src="${X}" alt="">` où X est une URL blob ou data — pas de `"` possible dedans. |
| L3408 | Faux positif | Pourcentages, tailles formatées (nombres). |
| L2595 (interne à `genererGrilleFichiers`) | **Vrai correctif** | `value="${p.id}"` brut dans attribut option. **Fix** : `echapperHtml(p.id)`. |

## Pattern systémique : `value="${item.id}"` non échappé

L'examen de `travaux-ui.js` révèle **un pattern défensif manquant à grande échelle** :

- Lignes 1183, 1190, 1206, 1213, 1233, 1240, 1690, 1703, 1784, 1794, 2479, 2635, 2669, 2676, 2742, 2743, 2746, etc.
- Tous interpolent `${p.id}`, `${f.id}`, `${e.da}` etc. **directement dans des attributs HTML** sans `echapperHtml`.
- Les TEXTES visibles ont `echapperHtml`, mais pas les ATTRIBUTS.

**Risque réel** : LOW. Les IDs sont générés en interne (`PROD_<timestamp>`, `EVAL_<timestamp>`, `FT_<hash>`) ou viennent d'un DA étudiant (format restreint). `SCHEMAS_IMPORT` sanitise les imports.

**Risque théorique** : un payload qui injecterait un ID malformé dans un canal qui contourne `SCHEMAS_IMPORT` (db.setSync direct, migration ratée, etc.) verrait sa chaîne réfléchie dans 20+ endroits.

**Décision pour cette session** : 3 vrais correctifs ponctuels appliqués (les 3 plus visibles dans le code lu). Le pattern systémique reste — il justifierait un chantier dédié de **substitution mécanique** (~3-5 h) ou attendre la migration globale vers la construction DOM.

## Correctifs appliqués (3)

1. **`js/liste-evaluations.js:264`** — `error.message` échappé dans le message d'erreur de chargement.
2. **`js/liste-evaluations.js:1536`** — `p.id` échappé dans `value="..."` de l'option de réassociation.
3. **`js/travaux-ui.js:2595`** — `p.id` échappé dans `value="..."` du dropdown de filtre par production.

## Recommandation pour la suite

### Court terme (ce mois-ci)

- Continuer à fixer ponctuellement les cas qui passent sous les yeux en review/dev.
- Le hook pré-commit (Défense J) bloque déjà les régressions futures.

### Moyen terme (chantier dédié, ~3-5 h)

- **Substitution mécanique** `value="${X.id}"` → `value="${echapperHtml(X.id)}"` sur les ~20 occurrences identifiées dans `travaux-ui.js`, `liste-evaluations.js`, et autres.
- Compléter par une règle ESLint custom (si on adopte ESLint) pour détecter ce pattern.

### Long terme (Défense E complète)

- Migrer les blocs `innerHTML = template-literal` vers de la construction DOM (`document.createElement`, `textContent`, `setAttribute`) sur les modules à risque.
- Effort estimé : 1-2 semaines (cf. `MODELE-MENACES.md` §8.2).
- Priorité moyenne : la sandbox iframe (Défense A, livrée 8 mai) neutralise déjà la mécanique I-01 sous-jacente.

## Référence

- Modèle de menaces : `docs/securite/MODELE-MENACES.md` §I-01, §8.2 défense E.
- Audit programmatique baseline (6 mai) : `AUDIT-INNERHTML-2026-05-06.md`.
- Findings session du 6 mai : `AUDIT-INNERHTML-FINDINGS-2026-05-06.md` (5 vrais XSS dans `cc-license.js:genererBadgeCC` corrigés).
- Script ré-exécutable : `scripts/audit-innerhtml.sh`.
