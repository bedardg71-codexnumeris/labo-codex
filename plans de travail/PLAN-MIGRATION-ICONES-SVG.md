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
- **18 PNG `outils-*.png`** dans `icons/` héritées d'une version antérieure de la palette d'annotation. Audit du 26 mai 2026 :
  - **3 encore utilisées** : `outils-token0/1/2-100.png` (jetons d'évaluation, cf. Lot E).
  - **15 inutilisées** : la palette d'annotation actuelle utilise déjà les SVG équivalents (`icon-pencil`, `icon-marker-pen`, etc.). Code mort à retirer (cf. Lot F).
- **4 PNG SOLO** dans `autocollants/comprehension-{uni,multi,relationnel,etendu}.png` : tampons de la catégorie « Compréhension » de la palette d'annotation, à remplacer par des SVG conçus sur mesure (cf. Lot H).
- **Couleur d'accent de navigation active** : le chantier introduit une convention chromatique pour signaler l'élément de navigation courant (onglet, bouton de menu actif). Couleur retenue : orange `#e8923a`. Cf. Lots I (libération de l'orange par bascule de la palette d'aide vers le jaune) et J (mise en œuvre de la convention nav). Phase 2 envisagée plus tard : 5 couleurs distinctes par grande section (Conception/Calendrier/Suivi/Évaluation/Labo).
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

### Lot E — Migration des jetons d'évaluation (3 PNG → 3 SVG)

- **Scope** : 3 PNG `outils-token0-100.png`, `outils-token1-100.png`, `outils-token2-100.png` dans `icons/`. Référence unique : `js/evaluation-sauvegarde.js:794` (concaténation dynamique `'icons/outils-token' + tokenIdx + '-100.png'`).
- **Sémantique** : `tokenIdx = Math.min(s.utilises, 2)` → trois états d'épuisement par type de jeton chez un étudiant.
  - `token0` = aucun jeton utilisé (frais)
  - `token1` = 1 jeton utilisé (partiel)
  - `token2` = 2 jetons ou plus utilisés (saturé / quasi-épuisé)
- **Contexte d'affichage** : liste des évaluations d'un étudiant, à côté de chaque type de jeton (classe CSS `.jeton-icone`).
- **Particularité** : c'est un visuel **métier ad hoc**, pas une icône icons8 standard. Icons8 ne propose pas d'équivalent direct — il faut concevoir le visuel cohérent avec le design-system.
- **Décision Grégoire pendante** (cf. §7) :
  - Option (a) **3 SVG distincts** : `icon-jeton-frais.svg`, `icon-jeton-partiel.svg`, `icon-jeton-sature.svg`. Code JS quasi inchangé (`'icons/icon-jeton-' + suffixe + '.svg'`). Plus lourd côté fichiers mais l'illustration peut différer librement (formes, nuances, accents visuels).
  - Option (b) **1 SVG paramétrique + CSS** : un seul `icon-jeton.svg` (ex. trois cercles ou trois segments), trois classes CSS (`.jeton-icone--frais`, `--partiel`, `--sature`) qui activent ou teignent les segments via `fill` / `opacity`. Plus élégant mais demande une cohérence stricte entre la structure interne du SVG et les sélecteurs CSS.
- **Pré-requis** : concevoir le ou les SVG (probablement esquisse de Grégoire, puis vectorisation), les ajouter dans `icons/`.
- **Migration** : modifier `evaluation-sauvegarde.js:794` selon l'option retenue. Aucun autre site à toucher.
- **Validation** : ouvrir un étudiant qui possède des jetons de 3 types différents avec 0, 1 et 2+ utilisations respectives. Vérifier les 3 visuels sur Mac + iPad, modes sombre + clair. La classe `.jeton-icone` doit garder la même taille apparente (sinon ajuster CSS).
- **Effort estimé** : 30-45 min une fois les SVG disponibles (le code change est trivial ; l'effort principal est conceptuel et visuel).

### Lot F — Nettoyage zéro-dette des PNG `outils-*` legacy (15 fichiers)

- **Scope** : les 15 PNG `outils-*.png` de `icons/` qui ne sont plus référencés nulle part. Audit du 26 mai 2026 : aucune référence dans `js/`, `index.html`, `styles.css`, `docs/`, `Skills pour Claude Code/`, `plans de travail/`, ni dans `_archives/`.

  Liste : `outils-dashed-line-100.png`, `outils-delete-100.png`, `outils-edit-pencil-100.png`, `outils-eraser-100.png`, `outils-hand-100.png`, `outils-line-filled-100.png`, `outils-marker-pen-100.png`, `outils-move-100.png`, `outils-oval-100.png`, `outils-rectangular-96.png`, `outils-redo-100.png`, `outils-select-100.png`, `outils-squiggly-line-100.png`, `outils-text-100.png`, `outils-undo-100.png`.

- **Origine** : la palette d'annotation (`js/travaux-outils.js:50-145`, constante `OUTILS`) a déjà migré vers des SVG (`icon-pencil`, `icon-marker-pen`, `icon-eraser`, `icon-text`, `icon-circle`, `icon-line`, `icon-square`, `icon-squiggly-line`, `icon-dashed-line`, `icon-undo`, `icon-redo`, `icon-drag`, `icon-move-right`). Les PNG correspondants sont des résidus d'une version antérieure de la palette, jamais retirés.

- **Cadre** : principe « stabilité zéro-dette » du `CLAUDE.md` racine — quand un nouveau système remplace un ancien, l'ancien est retiré dans la même session. Ici le nettoyage n'a pas été fait au moment de la migration vers SVG, on le rattrape.

- **Procédure en deux temps** (par prudence — Grégoire a exprimé un doute sur la possibilité d'usages cachés) :

  **Étape 1 — Vérification confirmatoire documentée**
  ```bash
  # Re-grep exhaustif, doit retourner 0 dans tous les cas
  for f in outils-dashed-line-100 outils-delete-100 outils-edit-pencil-100 \
           outils-eraser-100 outils-hand-100 outils-line-filled-100 \
           outils-marker-pen-100 outils-move-100 outils-oval-100 \
           outils-rectangular-96 outils-redo-100 outils-select-100 \
           outils-squiggly-line-100 outils-text-100 outils-undo-100; do
    count=$(grep -rln "$f" --exclude-dir=icons --exclude-dir=.git . 2>/dev/null | wc -l)
    echo "$count  $f"
  done
  # Attendu : 15 lignes "0  outils-..."
  ```
  Si une ligne retourne autre chose que 0, **arrêter** et investiguer le site avant de continuer.

  **Étape 2 — Suppression nette en un commit isolé**
  ```bash
  git rm icons/outils-dashed-line-100.png icons/outils-delete-100.png \
         icons/outils-edit-pencil-100.png icons/outils-eraser-100.png \
         icons/outils-hand-100.png icons/outils-line-filled-100.png \
         icons/outils-marker-pen-100.png icons/outils-move-100.png \
         icons/outils-oval-100.png icons/outils-rectangular-96.png \
         icons/outils-redo-100.png icons/outils-select-100.png \
         icons/outils-squiggly-line-100.png icons/outils-text-100.png \
         icons/outils-undo-100.png
  # Commit isolé "chore(icons): retrait 15 PNG outils-* legacy non référencés"
  ```
  Rollback trivial via `git revert` si un usage caché émerge plus tard (sandbox réserve, codex exporté, etc.).

- **Validation** : `cd tests && npm test` (103/103 attendu, aucun test ne devrait dépendre de ces PNG). Test visuel rapide : ouvrir la palette d'annotation et la liste des évaluations — rien ne doit casser.

- **Risque** : nul si l'Étape 1 confirme 0 référence. Le seul scénario résiduel serait un export Codex utilisateur qui aurait conservé une référence chemin vers un de ces PNG — improbable pour des assets statiques, et de toute façon récupérable par re-import dans une beta antérieure.

- **Effort estimé** : 15-20 min (audit confirmatoire + commit + tests).

### Lot G — Audit des 43 emojis résiduels (≤ 10 occurrences chacun)

- À traiter en fin de chantier, cas par cas.
- Plusieurs sont probablement du legacy à **retirer** plutôt qu'à migrer (ex. emojis dans des templates de message qui n'existent plus, ou conventions abandonnées).
- Effort estimé : 1-2 h (audit + migration ou retrait).

### Lot H — Tampons SOLO en SVG dans la palette d'annotation (4 PNG → 4 SVG)

- **Scope** : remplacement des 4 tampons de la catégorie **compréhension** (niveaux SOLO) dans la palette d'annotation. Sites uniques : `js/travaux-outils.js:207-210` (constante `AUTOCOLLANTS`) + 4 fichiers dans `autocollants/`.

  | ID | Niveau SOLO | Fichier actuel | Fichier cible |
  |---|---|---|---|
  | `comp-uni` | Uni-structurel | `autocollants/comprehension-uni.png` | `autocollants/comprehension-uni.svg` |
  | `comp-multi` | Multi-structurel | `autocollants/comprehension-multi.png` | `autocollants/comprehension-multi.svg` |
  | `comp-relationnel` | Relationnel | `autocollants/comprehension-relationnel.png` | `autocollants/comprehension-relationnel.svg` |
  | `comp-etendu` | Abstrait étendu | `autocollants/comprehension-etendu.png` | `autocollants/comprehension-etendu.svg` |

- **Contexte d'usage** : tampons collés par l'enseignant sur le canvas d'annotation des travaux d'élèves. Catégorie « Compréhension » de la palette (cf. `OUTILS` + `AUTOCOLLANTS` dans `js/travaux-outils.js`). Référence pédagogique : SOLO (Structure of Observed Learning Outcomes, Biggs & Collis) — voir `SKILL_Ecosysteme_classe.md` et `SKILL_RaI.md`.

- **Particularités à respecter dans le design des SVG** :
  - **Lisibilité à petite taille** (~40-60 px sur le canvas) : trait épais, contraste fort, pas de détails fins.
  - **Cohérence sémantique entre les 4** : progression visuelle observable entre Uni → Multi → Relationnel → Abstrait étendu (par ex. nombre de points, densité de liens, niveau d'abstraction graphique). C'est une décision de design pédagogique, pas qu'une question esthétique.
  - **Dimensions explicites dans le SVG** (`width` et `height` en attributs) : sinon Safari peut refuser de les rendre via `canvas.drawImage`. Cf. comportement WebKit file:// connu.
  - **Cohérence avec les autres autocollants** : la palette contient déjà 6 tampons « Action » + 12 « Observations » + legacy, tous en PNG. Si la transition vers SVG s'étend ensuite à ces autres catégories, le style des 4 SOLO posera la convention. **Décision à prendre** : démarrer ici un style cohérent ré-applicable, ou rester strictement dans le scope SOLO ?

- **Pré-requis** : Grégoire conçoit les 4 SVG (esquisse + vectorisation), valide visuellement la progression sémantique entre les 4, ajoute les fichiers dans `autocollants/`.

- **Migration code** : modifier 4 lignes dans `js/travaux-outils.js:207-210` (suffixe `.png` → `.svg` dans la propriété `fichier`). Aucun autre site à toucher — le chargement passe par `img.src = DOSSIER_AUTOCOLLANTS + a.fichier` qui accepte SVG sans changement.

- **Compatibilité des annotations existantes** : les annotations antérieures référencent les tampons par **ID** (`comp-uni`, etc.), pas par chemin de fichier. Le re-rendu sur ces canvas utilisera automatiquement le SVG après la migration. Aucune migration de données nécessaire.

- **Sort des 4 PNG après migration** : à supprimer en même temps (principe « zéro-dette » du CLAUDE.md) — pas d'alias « au cas où ». Confirmer en grep que les chemins `comprehension-*.png` ne sont plus référencés (ils ne devraient l'être qu'à l'endroit qu'on vient de modifier).

- **Validation** :
  - Ouvrir un travail d'élève, activer la palette d'annotation, sélectionner chaque tampon SOLO et le coller sur le canvas. Vérifier rendu net à différents zooms sur Mac (Chrome + Safari) + iPad, modes sombre + clair.
  - Ouvrir une annotation antérieure qui contient déjà un tampon SOLO : vérifier que le re-rendu utilise bien le SVG sans artefact.
  - Tests Vitest + Playwright (103/103 attendu — aucun ne devrait dépendre du format d'extension).

- **Risque** : moyen.
  - WebKit file:// peut être capricieux sur `canvas.drawImage` avec SVG sans dimensions explicites — d'où l'exigence dimensions explicites en pré-requis.
  - Si le rendu canvas SVG ne tient pas la qualité attendue sur iPad Air, repli possible : convertir les SVG en PNG haute densité (2x ou 3x) au build et garder les SVG comme source uniquement.

- **Effort estimé** : 30-45 min côté code une fois les SVG disponibles. Le temps réel du chantier est dans la conception graphique des 4 SVG.

### Lot I — Bascule de la palette d'accompagnement orange → jaune (~30 variables CSS)

- **Scope** : redéfinition des ~30 variables `--acc-*` de la palette d'accompagnement (popups d'aide, tour guidé, blocs conseil/exemple/alerte, dots de progression). Définies dans `styles.css:264-302`, avec mention explicite `NE PAS REDÉFINIR DANS .mode-clair` — palette identique aux deux thèmes. **Scope étendu** : la teinte jaune retenue s'applique aussi aux icônes des boutons aide (icon-wordbook.svg) et réglages (icon-tune.svg) de l'entête (`btn-action-header` lignes 1117-1147, `header-icon` ligne 1150). Convention chromatique : tout ce qui est « assistance / configuration » devient jaune.

- **Origine de la décision** : libérer la teinte orange `#e8923a` actuellement utilisée comme fond principal de la palette accompagnement (`--acc-fond`) pour la rendre disponible comme couleur d'accent de navigation active (cf. Lot J). Sans cette bascule, le double sens « orange = aide » + « orange = onglet actif » créerait un conflit cognitif.

- **Cadre** : palette « fond clair (orange chaud) + texte foncé (brun) » qui devient « fond jaune chaud + texte foncé (brun ou anthracite) ». Le principe de contraste reste le même, mais la nuance change.

- **Variables à redéfinir** (groupées par fonction) :
  - Surfaces : `--acc-fond`, `--acc-surface`, `--acc-surface-hover`
  - Bordures : `--acc-bordure`, `--acc-bordure-active`
  - Texte : `--acc-texte`, `--acc-texte-doux`, `--acc-texte-leger`
  - Accent : `--acc-accent`, `--acc-accent-vif`
  - Bouton primaire : `--acc-btn-prim`, `--acc-btn-prim-hover`, `--acc-btn-prim-txt`
  - Bouton secondaire : `--acc-btn-sec-bord`, `--acc-btn-sec-txt`
  - Blocs internes : `--acc-conseil-fond`, `--acc-conseil-bord`, `--acc-exemple-fond`, `--acc-exemple-bord`, `--acc-alerte-fond`, `--acc-alerte-bord`
  - Dots progression : `--acc-dot-inactif`, `--acc-dot-actif`, `--acc-dot-vu`

- **Teinte cible retenue** : **`#e8c43a` (doré chaud)**, validée par Grégoire le 26 mai 2026 après comparaison visuelle dans `REFERENTIEL-COULEURS-JAUNE.html`. Choisie pour sa famille chromatique cohérente avec l'orange nav `#e8923a` (même luminosité, déplacement uniquement sur la teinte) et son contraste WCAG AAA avec le texte brun foncé `#2a1404`.

- **Procédure** :
  1. Choisir la teinte cible et calibrer les nuances (surface, hover, bordure) autour.
  2. Redéfinir les ~30 variables `--acc-*` dans `styles.css:264-302` en gardant la structure existante.
  3. Vérifier le contraste WCAG AA pour chaque combinaison texte/fond (cible : 4.5:1 minimum pour le texte normal, 3:1 pour les grands titres).
  4. Tester les ~12 composants accompagnement : popups d'aide contextuelle, tour guidé, blocs conseil, blocs exemple, blocs alerte, dots de progression. Visuel Mac + iPad.

- **Risque** : moyen.
  - Le texte brun foncé (`--acc-texte: #2a1404`) garde un bon contraste sur jaune chaud, mais perd en confort de lecture sur jaune saturé. Calibration à valider sur les textes longs (popups d'aide narratifs).
  - Les variantes orange utilisées dans certains blocs internes (`--acc-exemple-fond: #eba64e`) doivent être recalibrées en jaune cohérent — pas juste un find/replace.
  - La bordure bleue discrète `--acc-exemple-bord: #3a5a78` reste pertinente comme contraste (bleu sur jaune fonctionne bien).

- **Tests** : `cd tests && npm test` (103/103 attendu — pas de test visuel automatisé sur la palette accompagnement, validation manuelle).

- **Effort estimé** : 1 h 30 – 2 h (calibration + tests visuels + ajustements de contraste).

### Lot J — Couleur d'accent navigation active (phase 1 : couleur unique)

- **Scope phase 1** : marquer visuellement l'élément de navigation actif (onglet, bouton de menu) par une **couleur unique** appliquée à l'icône SVG. Couleur retenue : orange `#e8923a` (la même que celle libérée par le Lot I).

- **Origine de la décision** : l'utilisateur cède aux flèches Précédent/Suivant du navigateur, ce qui désoriente le repérage dans la navigation interne. L'état actif actuel (variation d'opacité 0.15 → 0.30 sur fond translucide blanc, cf. `styles.css:1474`) est trop subtil pour servir de repère spatial après un retour navigateur. Une couleur d'accent forte sur l'icône résout ce problème.

- **Phase 2 envisagée plus tard** : 5 couleurs distinctes par grande section (Conception / Calendrier / Suivi / Évaluation / Labo) pour transformer la couleur en double signal (« actif » ET « tu es dans cette section »). Pas dans le scope du chantier actuel — à concevoir une fois la phase 1 livrée et la palette mûre. Cf. [[project-palette-couleurs-contraintes]] pour les contraintes (SOM/STD/SPE/DEN libérables, IDME = palette utilisateur).

- **Approche technique retenue** : **`mask-image` CSS** (validée le 26 mai 2026 — éprouvée dans `REFERENTIEL-COULEURS-JAUNE.html`). Pattern : `<span class="header-icon ico-{nom}"></span>` avec CSS `mask-image: url('icons/icon-{nom}.svg')` + `background-color: white` au repos, `background-color: var(--nav-actif)` quand `.actif`. Avantages : aucune modification des SVG, couleur exacte, modification HTML circonscrite, prépare la phase 2 (5 couleurs par section) trivialement.

- **Sites code à modifier** :
  - **Nouvelle variable CSS** `--nav-actif: #e8923a` à définir **hors `:root` et hors `.mode-clair`** pour rester identique aux deux thèmes (suivre le modèle `--acc-*`, ligne 261 : `NE PAS REDÉFINIR DANS .mode-clair`).
  - **`index.html`** : remplacer les `<img src="icons/icon-X.svg" class="nav-icon">` par `<span class="nav-icon ico-X"></span>` sur les boutons de nav principale, sous-nav, et entête utilitaire (boutons aide + réglages déjà concernés par Lot I avec couleur jaune au lieu d'orange).
  - **`styles.css:1474`** (`.navigation-principale button.actif`) : retirer la variation d'opacité du fond blanc, garder le fond translucide repos, le signal vient désormais de l'icône.
  - **`styles.css:1539`** (`.sous-navigation button.actif`) : idem.
  - **`styles.css:1480-1486`** (`.navigation-principale button .nav-icon`) et **`styles.css:1495-1504`** (`.nav-icone`) : refonte du CSS pour basculer du pattern `<img>` + `filter` vers `<span>` + `mask-image` + `background-color`. Pattern type :
    ```css
    .nav-icon {
      width: 22px;
      height: 22px;
      display: inline-block;
      background-color: white;
      -webkit-mask-size: contain;  mask-size: contain;
      -webkit-mask-repeat: no-repeat;  mask-repeat: no-repeat;
      -webkit-mask-position: center;  mask-position: center;
    }
    .ico-pencil   { -webkit-mask-image: url('icons/icon-pencil.svg');   mask-image: url('icons/icon-pencil.svg'); }
    .ico-calendar { -webkit-mask-image: url('icons/icon-calendar.svg'); mask-image: url('icons/icon-calendar.svg'); }
    /* ... une classe par icône nav ... */
    .navigation-principale button.actif .nav-icon { background-color: var(--nav-actif); }
    .sous-navigation button.actif .nav-icon { background-color: var(--nav-actif); }
    ```

- **Pré-requis** :
  - **Lot I terminé** : palette accompagnement bascule vers jaune, l'orange `#e8923a` est libéré.
  - **Inventaire des icônes nav** : lister les SVG actuellement utilisés par la nav principale, la sous-nav et l'entête utilitaire (probablement 5-10 SVG distincts). Chaque SVG aura sa classe CSS dédiée (`.ico-X`).
  - Aucun pré-requis sur le contenu des SVG : le `mask-image` ignore les couleurs internes, tout SVG monochrome fonctionne tel quel.

- **Migration** :
  1. Ajouter `--nav-actif: #e8923a` dans `styles.css` (hors `:root` / `.mode-clair`).
  2. Identifier toutes les icônes nav utilisées (grep `<img src="icons/.*\.svg".*nav-icon\|header-icon`).
  3. Créer les classes CSS `.ico-X` correspondantes dans `styles.css` (une par icône, avec `mask-image`).
  4. Modifier `index.html` : remplacer chaque `<img>` nav par `<span class="nav-icon ico-X"></span>`.
  5. Modifier `.navigation-principale button.actif` et `.sous-navigation button.actif` pour appliquer `background-color: var(--nav-actif)` au descendant `.nav-icon`.
  6. Retirer les `filter: brightness(0) invert(1)` devenus inutiles.
  7. Tester l'effet visuel : icône blanche au repos, icône orange quand l'onglet est actif. Conteneur (fond du bouton) reste neutre transparent.

- **Validation** :
  - Visuel Mac (Chrome + Safari) + iPad, modes sombre + clair.
  - Naviguer entre les sections principales : confirmer que l'icône active est immédiatement repérable, qu'elle ne se confond pas avec un hover.
  - Naviguer entre sous-sections d'une section : confirmer que la sous-nav active suit la même convention (icône orange).
  - Tester un retour Précédent navigateur : confirmer que l'orange persiste sur l'élément actif après le retour (devrait, puisque c'est CSS pur basé sur la classe `.actif` posée par `navigation.js`).
  - Vérifier qu'aucun autre élément de l'UI ne se retrouve avec une icône orange parasite (l'orange est désormais réservé au signal d'activation nav).
  - Tests Vitest + Playwright (103/103 attendu — pas de régression sur les autres comportements).

- **Risque** : faible. CSS isolé, pas de logique JS modifiée, classe `.actif` déjà posée par la nav existante.
  - **Risque résiduel** : si certains SVG nav ont des `fill="..."` codés en dur (pas `currentColor`), il faudra les éditer un par un. Audit préalable nécessaire.

- **Effort estimé** : 30-45 min de code une fois Lot I livré et les SVG nav vérifiés en `currentColor`. Temps de validation visuelle ~30 min.

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

**Lot F (nettoyage) → Lot I (palette aide → jaune) → Lot J (nav active orange) → Lot A → Lot B → Lot D (décision) → Lot C → Lot E (jetons) → Lot H (SOLO) → Lot G**

Justification :
- **F en tout premier** : 15-20 min, suppression de 15 PNG legacy non référencés. Aucun risque, aucun mapping. Démarre le cycle par une réduction nette de la dette dans `icons/` avant d'y ajouter des fichiers.
- **I en deuxième** : bascule palette d'aide orange → jaune. Pré-requis du Lot J (libère l'orange comme couleur d'accent nav). Doit précéder J pour éviter le double sens orange.
- **J en troisième** : couleur d'accent nav active (orange unique). Gros impact visuel sur le repérage. Préférable de l'avoir tôt dans le cycle pour que les migrations d'icônes ultérieures (A, B) bénéficient déjà du nouveau pattern `currentColor`.
- **A** : 76 sites visibles, 1 seul mapping, gros impact visuel rapide. Permet de valider la méthodologie sur un cas simple. Le SVG `icon-info.svg` est **déjà présent** dans `icons/` — prérequis levé.
- **B** : illustrations de sections, ~30 sites, mappings multiples mais SVG majoritairement déjà présents.
- **D avant C** : trancher la question des pastilles avant de toucher aux notifications (le mapping de 🟢🟡🔴🟠 pourrait influencer le design des toasts).
- **C** : le plus lourd (refactor probable de l'API `notifications`).
- **E et H** : visuels métier ad hoc (jetons + SOLO). Dépendent de visuels à concevoir par Grégoire. Peuvent se faire en parallèle des autres lots dès que les SVG sont disponibles. **E avant H** par convention alphabétique seulement — l'ordre réel dépend de quelle conception graphique Grégoire termine en premier.
- **G à la fin** : nettoyage final des emojis résiduels.

## 6. Estimation totale

- **Lot F** : 15-20 min (nettoyage zéro-dette PNG legacy)
- **Lot I** : 1 h 30 – 2 h (bascule palette aide orange → jaune)
- **Lot J** : 30-45 min (couleur d'accent nav active, phase 1)
- **Lot A** : 45 min
- **Lot B** : 1 h
- **Lot C** : 2 h (incluant refactor API si retenu)
- **Lot D** : 30 min (décision + migration éventuelle)
- **Lot E** : 30-45 min (jetons, hors temps de conception des SVG)
- **Lot H** : 30-45 min (tampons SOLO, hors temps de conception des 4 SVG)
- **Lot G** : 1-2 h

**Total : 9-10 h** réparties sur 4-6 sessions selon l'énergie disponible. Le temps de conception graphique des SVG des Lots E et H s'ajoute en dehors du codage. La phase 2 du Lot J (5 couleurs par grande section) est hors scope du chantier actuel et sera estimée séparément.

## 7. Décisions Grégoire pendantes (avant de démarrer)

1. **SVG icon-info pour ✴** : style à choisir parmi icons8 (Material Outlined / Sharp / Filled / Color). Recommander le style cohérent avec les SVG déjà présents (probablement Material Outlined). **NOTE 26 mai 2026** : `icon-info.svg` est déjà présent dans `icons/` — vérifier qu'il convient ou le remplacer avant de démarrer le Lot A.
2. **API notifications** : modifier pour accepter un `type` qui détermine l'icône (refactor) ou continuer à injecter des emojis dans le message ?
3. **Pastilles colorées (Lot D)** : conserver les emojis, passer à `●` Unicode, ou SVG ?
4. **Emojis dans le contenu pédagogique des popups d'aide** : migrer aussi ou laisser ?
5. **Forme des SVG jetons (Lot E)** : 3 SVG distincts (`icon-jeton-frais.svg`, `icon-jeton-partiel.svg`, `icon-jeton-sature.svg`) ou 1 SVG paramétrique avec 3 classes CSS qui activent les segments ?
6. **Lot F — suppression des 15 PNG `outils-*` legacy** : feu vert pour la suppression nette après l'audit confirmatoire de l'Étape 1, ou conservation temporaire pour validation manuelle d'abord ?
7. **Style des SVG tampons SOLO (Lot H)** : concevoir un style **ré-applicable** aux autres catégories d'autocollants (Action 6 + Observations 12 + legacy) pour préparer une transition globale vers SVG, ou rester strictement dans le scope SOLO ?
8. **Lot H — repli PNG haute densité si rendu canvas SVG insuffisant sur iPad Air** : feu vert sur ce repli s'il s'avère nécessaire après tests, ou décision à reprendre à ce moment-là ?
9. ~~**Teinte de jaune cible pour la palette d'aide (Lot I)**~~ → **Tranché 26 mai 2026 : `#e8c43a` (doré chaud)** après comparaison visuelle dans `REFERENTIEL-COULEURS-JAUNE.html`.
10. ~~**Approche technique de coloration des icônes SVG nav actives (Lot J)**~~ → **Tranché 26 mai 2026 : `mask-image` CSS** (option (d), validée après démonstration dans `REFERENTIEL-COULEURS-JAUNE.html`). L'option (a) `currentColor` initialement recommandée a été écartée car elle exige du SVG inline (`<svg>` direct dans le HTML), incompatible avec les `<img src>` actuels.
11. **Phase 2 du Lot J — 5 couleurs par grande section (Conception/Calendrier/Suivi/Évaluation/Labo)** : à acter comme item de backlog dédié pour traitement post-cycle actuel ? La phase 1 (orange unique) est suffisante pour livrer une amélioration utile du repérage spatial.

## 8. Liens

- **Cartographie initiale** : session Claude du 26 mai 2026 matin.
- **Capture déclencheuse** : `iPad 26 mai 05:15` (section Préparer et importer).
- **Item BACKLOG** : à créer (#286 ou suivant disponible) référençant ce plan.
- **Design system** : `design-system.html` — à mettre à jour à chaque lot.
- **Crédit Icons8** : `index.html:9868` déjà inscrit.
