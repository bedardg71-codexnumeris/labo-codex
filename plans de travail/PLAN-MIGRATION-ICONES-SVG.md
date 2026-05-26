# Plan de migration — Emojis UI → Icônes SVG icons8

**Établi** : 26 mai 2026 matin, session Claude.
**Origine** : décision Grégoire pendante dans SESSION.md (« Migration globale des icônes vers icons8 — chantier séparé à planifier »). Item BACKLOG « icônes SVG » mentionné le 25 mai 2026.
**Capture déclencheuse** : iPad 26 mai 05:15 — section « Préparer et importer » avec ✴ orange à droite du titre + 📝 papier-crayon au-dessus de « Annoter les travaux ». Grégoire ne veut pas voir d'emojis dans l'UI.

---

## 1. Contexte

- **70 SVG icons8 déjà présents** dans `icons/` (cadre, charte, crédit inscrit dans Réglages > À propos).
- **593 occurrences d'emojis** dans l'UI restent à migrer :
  - **200** dans `index.html` (toutes pertinentes — pas de commentaires significatifs en HTML)
  - **393** dans `js/*.js` après exclusion des commentaires et des `console.*`
- Convention design-system actuelle (à mettre à jour avec le chantier) : `📔` guidage, `📚` bibliothèque, `🔒/🔓` verrouillage, `💡` conseil.

## 2. Inventaire trié par fréquence

### 2.1 Emojis principaux (top 10 par fréquence)

| Emoji | Total | Fonction UI | SVG existant dans `icons/` |
|---|---:|---|---|
| ✴ | **76** | Bouton aide contextuelle (`.btn-aide-contextuelle`) | ❌ à ajouter (proposer `icon-info` icons8) |
| ⚠ | 63 | Avertissement dans notifications/alertes | ❌ à ajouter (warning triangle) |
| ✓ | 48 | Coche simple (validation, listes) | ❌ à ajouter (check simple) |
| ✅ | 48 | Succès/confirmation | ❌ à ajouter (check-circle vert) |
| 💡 | 38 | Conseil, astuce | ❌ à ajouter (lightbulb) |
| ❌ | 36 | Erreur/invalidation | ✅ `icon-cancel.svg` ou `icon-unavailable.svg` |
| 🟡🟢🔴🟠 | 50 | Pastilles couleur statuts RaI | ⚠ spécial — voir Lot D |
| 📋 | 10 | Clipboard/liste | ❌ à ajouter (clipboard) |
| 👤 | 11 | Utilisateur | ✅ `icon-profile.svg` |
| 📝 | 7 | Annotation, édition | ✅ `icon-pencil.svg` ou `icon-edit.svg` |

### 2.2 Emojis secondaires (≤ 10 occurrences)

`📂 📄 📊 📅 🎯 ⚫ 🗑 📑 📚 📈 👥 🔁 ➕ ✏ ⚙ 📭 💾 💬 📉 ✉ ⚡ ❓ ☐ ☑ ☒ ✔ 🔍 🌑 📥 🔄 📦 ✨ 🔒 🚦 🔧 🔥 ★ ✕ ✗ ✨ 🤝 🗺 🎯` etc.

**~43 emojis distincts** apparaissent moins de 10 fois chacun. À traiter au cas par cas — certains sont sans doute du legacy à retirer plutôt que migrer.

## 3. Lots de migration proposés

### Lot A — Bouton aide ✴ (76 sites, ~45 min)

- **Scope** : tous les `<button class="btn-aide-contextuelle">✴️</button>` et leurs équivalents inline dans le JS qui injectent `'✴️'`.
- **Mapping** : `✴` → `icon-info.svg` (à ajouter depuis icons8 — choisir un style cohérent : ligne fine, bord arrondi, monochrome).
- **Pré-requis** :
  1. Télécharger `icon-info.svg` depuis icons8 (style « Material Outlined » ou « Material Sharp » selon la cohérence avec les SVG existants).
  2. L'ajouter dans `icons/`.
  3. Vérifier `design-system.html` §boutons aide pour ajuster la classe CSS si nécessaire.
- **Migration** : remplacer le caractère `✴️` par `<img src="icons/icon-info.svg" alt="Aide" class="btn-aide-icone">` (ou équivalent CSS-only avec `background-image`).
- **Risque** : aucun. Purement visuel.
- **Validation** : test visuel sur Mac + iPad. Tous les sites concernés doivent afficher l'icône SVG au lieu du carré orange.

### Lot B — Illustrations de sections (~30 sites, ~1 h)

- **Scope** : emojis « décoratifs » placés en gros au-dessus ou à côté des titres de section : 📝, 📋, 📊, 📅, 📁, 👤, 📄, 📚, 📈, 👥.
- **Mapping** :
  - 📝 → `icon-pencil.svg` ou `icon-edit.svg` (déjà présent)
  - 👤 → `icon-profile.svg` (déjà présent)
  - 📋 → à ajouter (clipboard d'icons8)
  - 📊 / 📈 → `icon-combo-chart.svg` (déjà présent)
  - 📅 → `icon-calendar.svg` (déjà présent)
  - 📂 / 📁 → `icon-filing-cabinet.svg` (déjà présent)
  - 📚 → `icon-book-shelf.svg` ou `icon-book.svg` (déjà présents)
- **Risque** : faible. Cas par cas selon le contexte (illustration centrée vs petite icône inline).
- **Validation** : test visuel section par section. Cohérence de taille (illustration ≈ 64-96 px, inline ≈ 16-24 px).

### Lot C — Statuts dans notifications/alertes (~230 sites, ~2 h)

- **Scope** : ✅ ❌ ⚠ ✓ 💡 utilisés dans les strings de notifications (`notifications.succes('✅ ...')`, `notifications.erreur('❌ ...')`).
- **Mapping** :
  - ✅ → ajouter `icon-check-circle.svg` (vert)
  - ❌ → `icon-cancel.svg` ou `icon-unavailable.svg` (rouge)
  - ⚠ → ajouter `icon-warning.svg` (orange/jaune)
  - ✓ → ajouter `icon-check.svg` (cohérent avec check-circle)
  - 💡 → ajouter `icon-lightbulb.svg`
- **Risque** : moyen. L'API `notifications.X` utilise `textContent` (pas innerHTML) — il faudra peut-être adapter pour permettre l'injection d'une icône SVG sans casser la protection XSS.
- **Décision préalable** :
  - Option (1) : modifier l'API `notifications` pour accepter un paramètre `type: 'succes'|'erreur'|'warning'|'info'` qui détermine l'icône automatiquement (recommandé — pas de string custom contenant un emoji).
  - Option (2) : injecter `<img>` dans le toast via `appendChild` (sûr pour XSS, plus de code).
- **Validation** : tester chaque type de notification (succes, erreur, warning, info) sur Mac + iPad, mode sombre + clair.

### Lot D — Pastilles couleur (🟢🟡🔴🟠 ≈ 50 sites)

- **Spécificité** : ce ne sont pas vraiment des « icônes » mais des **points colorés sémantiques** pour les niveaux de risque RaI ou statuts de progression.
- **Décision à prendre** :
  - Option (a) **Garder telles quelles** : ce sont des bullets sémantiques. Un SVG point coloré n'apporte rien.
  - Option (b) **Remplacer par `<span class="pastille-{couleur}">●</span>`** : `●` (U+25CF, BLACK CIRCLE) est un caractère Unicode universel, pas un emoji. Plus cohérent typographiquement.
  - Option (c) **SVG circle coloré** : `icon-circle.svg` (déjà présent) avec teinte CSS variable.
- **Recommandation** : option (b) si Grégoire considère les emojis pastilles comme un emoji à éliminer, sinon option (a). À trancher avant le Lot D.

### Lot E — Audit des 43 emojis résiduels (≤ 10 occurrences chacun)

- À traiter en fin de chantier, cas par cas.
- Plusieurs sont probablement du legacy à **retirer** plutôt qu'à migrer (ex. emojis dans des templates de message qui n'existent plus, ou conventions abandonnées).
- Effort estimé : 1-2 h (audit + migration ou retrait).

## 4. Méthodologie et garde-fous

### 4.1 Pour chaque lot

1. **Pré-vérification** : `grep -rn "{emoji}" --include="*.js" --include="*.html"` pour lister exhaustivement les sites.
2. **Mapping unique par emoji** : un emoji = un SVG. Pas de mapping conditionnel selon le contexte (sinon cauchemar de maintenance).
3. **Migration en un commit par lot** : pas de mélange de lots dans un commit.
4. **Tests** : Vitest + Playwright avant push.
5. **Validation visuelle** : Mac (Chrome + Safari) + iPad, modes sombre + clair.
6. **Mise à jour du design-system.html** : si la convention typographique change pour un emoji, la documenter dans la section concernée.

### 4.2 Cas spéciaux à anticiper

- **`design-system.html`** : ne PAS retirer les emojis qui servent d'exemples de la convention typographique (sections « Symboles »). Ils sont des références illustratives, pas de l'UI utilisateur. À traiter au lot E avec décision explicite.
- **`accompagnement-contenu-popup.js` et `accompagnement-contenu-hover.js`** : les emojis peuvent faire partie du contenu pédagogique des popups d'aide (pas seulement de l'UI structurelle). Distinguer « ✴ dans le titre du bouton » (à migrer) de « 💡 dans le texte du conseil » (à évaluer — peut rester).
- **Notifications avec strings dynamiques** : si un emoji est concaténé à du texte utilisateur, attention à l'ordre de migration (refactor API d'abord, puis suppression).

## 5. Ordre recommandé

**Lot A → Lot B → Lot D (décision) → Lot C → Lot E**

Justification :
- **A en premier** : 76 sites visibles, 1 seul mapping, gros impact visuel rapide. Permet de valider la méthodologie sur un cas simple.
- **B ensuite** : illustrations de sections, ~30 sites, mappings multiples mais SVG majoritairement déjà présents.
- **D avant C** : trancher la question des pastilles avant de toucher aux notifications (le mapping de 🟢🟡🔴🟠 pourrait influencer le design des toasts).
- **C** : le plus lourd (refactor probable de l'API `notifications`).
- **E à la fin** : nettoyage final.

## 6. Estimation totale

- **Lot A** : 45 min
- **Lot B** : 1 h
- **Lot C** : 2 h (incluant refactor API si retenu)
- **Lot D** : 30 min (décision + migration éventuelle)
- **Lot E** : 1-2 h

**Total : 5-6 h** réparties sur 3-5 sessions selon l'énergie disponible.

## 7. Décisions Grégoire pendantes (avant de démarrer)

1. **SVG icon-info pour ✴** : style à choisir parmi icons8 (Material Outlined / Sharp / Filled / Color). Recommander le style cohérent avec les SVG déjà présents (probablement Material Outlined).
2. **API notifications** : modifier pour accepter un `type` qui détermine l'icône (refactor) ou continuer à injecter des emojis dans le message ?
3. **Pastilles colorées (Lot D)** : conserver les emojis, passer à `●` Unicode, ou SVG ?
4. **Emojis dans le contenu pédagogique des popups d'aide** : migrer aussi ou laisser ?

## 8. Liens

- **Cartographie initiale** : session Claude du 26 mai 2026 matin.
- **Capture déclencheuse** : `iPad 26 mai 05:15` (section Préparer et importer).
- **Item BACKLOG** : à créer (#286 ou suivant disponible) référençant ce plan.
- **Design system** : `design-system.html` — à mettre à jour à chaque lot.
- **Crédit Icons8** : `index.html:9868` déjà inscrit.
