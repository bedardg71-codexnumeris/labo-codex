# Audit CSS — Tier 5.2 (styles.css)

**Date** : 2 avril 2026
**Fichier** : `styles.css` (22 675 lignes)
**Portee** : Variables inutilisees, selecteurs morts, specificite, media queries

---

## Chiffres cles

| Metrique | Valeur |
|---|---|
| Lignes totales | 22 675 |
| Sections majeures | ~90 |
| Variables CSS declarees (uniques) | 210 |
| Variables jamais utilisees | **28** |
| Selecteurs morts (confiance haute) | **32** (~213 lignes) |
| `!important` | 112 (57 legitimes, 37 suspects, 18 problematiques) |
| Media queries | 34 (10 breakpoints distincts) |
| Profondeur max selecteurs | 4 niveaux (bon) |

---

## 1. Variables CSS inutilisees (28)

Aucune reference `var(--nom)` dans styles.css, index.html ni js/*.js.

### Bloc navigation (13 variables) — ENTIEREMENT MORT

| Ligne | Variable |
|---|---|
| 97 | `--nav-bg` |
| 98 | `--nav-normal` |
| 99 | `--nav-hover` |
| 100 | `--nav-actif` |
| 101 | `--nav-bordure-actif` |
| 104 | `--nav-actif-normal` |
| 105 | `--nav-actif-simulation` |
| 106 | `--nav-actif-anonymisation` |
| 109 | `--sous-nav-bg` |
| 110 | `--sous-nav-normal` |
| 111 | `--sous-nav-hover` |
| 112 | `--sous-nav-actif` |
| 115 | `--sous-nav-bg-normal` |

La navigation utilise des couleurs directes. Ce bloc represente pres de la moitie des variables inutilisees.

### Tokens Tetris (6 variables) — JAMAIS ADOPTES

| Ligne | Variable |
|---|---|
| 51 | `--badge-padding` |
| 52 | `--badge-font-size` |
| 53 | `--badge-border-radius` |
| 58 | `--padding-compact-pill` |
| 61 | `--padding-moyen-pill` |
| 62 | `--font-moyen-pill` |
| 63 | `--padding-large` |

Les composants utilisent directement `--padding-compact`, `--font-compact` etc. Les variantes "pill" et les tokens composites n'ont jamais ete references.

### Autres variables inutilisees (9)

| Ligne | Variable | Contexte |
|---|---|---|
| 26 | `--bleu-simulation` | Vestige pre-modes |
| 31 | `--bleu-anonymisation` | Vestige pre-modes |
| 34 | `--gradient-entete` | Gradients appliques en dur |
| 35 | `--gradient-fond-page` | Idem |
| 42 | `--shadow-inset` | Jamais utilisee |
| 154 | `--gris-tres-fonce` | Jamais referencee |
| 275 | `--ocean-moyen` | Variable semantique non adoptee |
| 280 | `--accent-secondaire` | Idem |

### Variables indirectes (6) — a conserver

Les variables `--sarcelle-*` (L75-81) ne sont jamais utilisees directement en CSS, mais servent de couche d'indirection pour le mode assiste (reaffectees vers `--bleu-*` via le bloc MODE ASSISTE). **A conserver.**

---

## 2. Selecteurs morts (32 — confiance haute)

### Section Layout sidebar (lignes 7184-7582) — 12 selecteurs morts, ~80 lignes

Anciens alias de retrocompatibilite remplaces par des variantes generiques (`sidebar-*`) mais jamais nettoyes :

| Ligne | Selecteur mort | Remplace par |
|---|---|---|
| 7280 | `.nom-cartouche` | `.sidebar-item-titre` |
| 7365 | `.actions-cartouche` + enfants | `.sidebar-item-actions` (mort aussi) |
| 7366 | `.sidebar-item-actions` + enfants | Aucun remplacant actif |
| 7408 | `.btn-ajouter-cartouche` | `.sidebar-btn-ajouter` |
| 7430 | `.zone-centrale-cartouche` | `.zone-principale` |
| 7452 | `.accordeon-import` + enfants | `.section-accordeon` |
| 7492 | `summary.summary-materiel` | Supprime |
| 7506 | `.panneau-import` | `.accordeon-contenu` |
| 7521 | `.checkboxes-import-partiel` | Supprime |
| 7522 | `.liste-checkboxes` | Supprime |
| 7534 | `.filtre-grille-cartouche` | `.sidebar-filtre` |

### Section Profil etudiant (lignes 4708-4942) — 6 selecteurs morts, ~30 lignes

| Ligne | Selecteur |
|---|---|
| 4714 | `.metriques-header` |
| 4721 | `.metrique-compacte` |
| 4736 | `.metrique-compacte-valeur` |
| 4743 | `.metrique-compacte-label` |
| 4866 | `.toggle-details` |
| 4885 | `.details-techniques` / `.details-techniques.visible` |

### Section Objectifs d'apprentissage (lignes 10904-11072) — 5 selecteurs morts, ~30 lignes

| Ligne | Selecteur |
|---|---|
| 10909 | `.actions-header` |
| 10917 | `.actions-group` |
| 10923 | `.input-file-hidden` |
| 10933 | `.ensemble-header` + h3 |
| 11029 | `.actions-footer` |

### Section Trimestre harmonisation (lignes 12275-12655) — 6 selecteurs morts, ~45 lignes

| Ligne | Selecteur |
|---|---|
| 12344 | `.liste-evenements` |
| 12351 | `.section-footer` |
| 12379 | `.label-tres-compact` |
| 12392 | `.apercu-groupe-cours` + enfants |
| 12412 | `.resume-horaire` + `.resume-horaire-ligne` |

### Sections mineures — 3 selecteurs morts

| Ligne | Selecteur | Section |
|---|---|---|
| 9679 | `.profil-info-item` | Interventions RaI |
| 22308 | `.travaux-retro-item` | Modelisation |
| 22336 | `.travaux-retro-nom` | Modelisation |

### Confiance moyenne (1)

| Ligne | Selecteur | Note |
|---|---|---|
| 7320 | `.sidebar-item-description` | Reference uniquement dans design-system.html |

---

## 3. Specificite — `!important` (112 occurrences)

### Repartition

| Categorie | Nb | % |
|---|---|---|
| Legitime (utilitaires, print, overrides inline documentes) | 57 | 51% |
| Suspect (remplacable par meilleure specificite) | 37 | 33% |
| Problematique (guerre de specificite, hacks) | 18 | 16% |

### Foyer critique #1 : `.travaux-palette-eval` (26 occurrences)

Lignes 15103-15346. Override massivement les tailles et marges pour rendre les composants compacts dans la palette flottante. Le JS genere probablement des styles inline que le CSS tente de surcharger.

**Recommandation** : Refactorer le JS pour ajouter une classe (ex: `.palette-compact`) au lieu de styles inline, puis appliquer les overrides via cette classe sans `!important`.

### Foyer critique #2 : `#reglages-trimestre` (6 occurrences)

Lignes 12666-12696. Utilise des selecteurs `[style*="..."]` pour cibler des elements avec styles inline.

**Recommandation** : Remplacer les styles inline dans le HTML/JS par des classes CSS, puis supprimer les overrides.

### Autres suspects

| Zone | Nb | Lignes |
|---|---|---|
| Pipeline fichiers | 2 | 16628-16629 |
| Organisateur seances | 3 | 19567-19569 |

### Problematiques a traiter

| Zone | Nb | Lignes | Probleme |
|---|---|---|---|
| Highlight guidage | 3 | 1634-1636 | Force animation/position/z-index |
| Validation Primo | 4 | 2985-2991 | Couleurs en dur hors variables CSS |
| Planification drag & drop | 7 | 18374-18451 | Guerre contre styles inline du drag |
| Wizard erreur | 1 | 11741 | Override border-color |
| Reglages sous-section | 1 | 1568 | Doublon avec L1562 |

### Anti-pattern : selecteurs `[style*="..."]` (5 occurrences)

| Ligne | Selecteur |
|---|---|
| 9798 | `#reglages-interpretation > div[style*="..."]` |
| 15327 | `.travaux-palette-eval .boite-note-finale div[style*="font-size: 0.8rem"]` |
| 15323 | `.travaux-palette-eval .boite-note-finale div[style*="font-size: 2rem"]` |
| 15332 | `.travaux-palette-eval div[style*="grid-template-columns"]` |
| 12666 | `#reglages-trimestre [style*="border-left"]` |

Couplage fragile avec le JS. A convertir en classes.

---

## 4. Media queries (34 occurrences, 10 breakpoints)

### Breakpoints documentes (CLAUDE.md)

| Breakpoint | Role | Occurrences |
|---|---|---|
| `1024px` | Desktop → Tablette | 5 |
| `768px` | Tablette → Mobile | 12 |

### Breakpoints NON documentes

| Breakpoint | Occurrences | Verdict |
|---|---|---|
| `1200px` | 3 | **Coherent** — desktop large. Documenter. |
| `850px` | 3 | **Coherent** — intermediaire tablette avec sidebar |
| `900px` | 2 | **Incoherent** — trop proche de 850px, aligner |
| `1000px` | 1 | **Isole** — devrait etre 1024px (L13653) |
| `650px` | 1 | **Isole** — cas specifique apercu PDF |
| `600px` | 4 | **Coherent** — mobile etroit. Documenter. |
| `480px` | 1 | **Orphelin** — mobile tres etroit, jamais teste |

### Doublons

- **2 blocs `@media print`** (L4353 et L20822) : fusionner en un seul bloc

### Recommandation

Standardiser sur **6 breakpoints** : `480px`, `600px`, `768px`, `850px`, `1024px`, `1200px`.
Aligner `900px` → `850px`, `1000px` → `1024px`, `650px` → `600px`.

---

## 5. Specificite des selecteurs

**Aucun selecteur a 5+ niveaux de profondeur.** Maximum = 4 niveaux. C'est un bon resultat.

### Simplifications faciles

`body.mode-clair` → `.mode-clair` partout (la classe est toujours sur `<body>`). Concerne ~30 selecteurs dans la section MODE CLAIR (lignes 19961+).

---

## Plan d'action recommande

### Phase A — Nettoyage sans risque (pas d'impact visuel)

1. **Supprimer les 28 variables CSS inutilisees** (~30 lignes dans `:root`)
2. **Supprimer les 32 selecteurs morts** (~213 lignes)
3. **Supprimer le `!important` doublon** L1568 (`#section-reglages .sous-section.active`)
4. **Fusionner les 2 `@media print`** en un seul bloc

**Estimation** : ~250 lignes supprimees, zero risque visuel.

### Phase B — Simplifications (verification visuelle requise)

5. **Simplifier `body.mode-clair`** → `.mode-clair` (~30 selecteurs)
6. **Aligner les breakpoints** `900px`→`850px`, `1000px`→`1024px`, `650px`→`600px`
7. **Corriger les couleurs en dur** dans `.primo-champ-vide`/`.primo-champ-rempli` (L2985-2991) — utiliser les variables d'alerte

**Estimation** : ~50 modifications, verification sombre + clair requise.

### Phase C — Refactoring (plus lourd, post-AQPC recommande)

8. **Refactorer `.travaux-palette-eval`** — eliminer les 26 `!important` en convertissant les styles inline JS en classes CSS
9. **Refactorer `#reglages-trimestre`** — eliminer les selecteurs `[style*="..."]`
10. **Refactorer le drag & drop planification** — eliminer les 7 `!important`

---

## Sections auditees vs non auditees (selecteurs morts)

L'audit des selecteurs morts a couvert ~2 000 lignes sur 22 675 (9 sections ciblees). Les 20 675 lignes restantes n'ont pas ete auditees pour les selecteurs morts. Les sections non auditees les plus susceptibles de contenir du code mort :

- Lignes 13638-14316 : BOITE A OUTILS + QUESTIONS FLASH (~680 lignes)
- Lignes 14411-15175 : MODULE TRAVAUX (~760 lignes)
- Lignes 15936-17318 : PIPELINE VERTICAL (~1380 lignes)
- Lignes 17991-19279 : PLANIFICATION CARTE MENTALE (~1290 lignes)
- Lignes 19279-19933 : ORGANISATEUR (~650 lignes)

Un audit exhaustif des 22 675 lignes necessiterait un effort supplementaire significatif.
