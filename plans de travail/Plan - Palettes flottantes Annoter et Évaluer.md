# Plan — Palettes flottantes aux coins arrondis (Annoter + Évaluer)

**Date** : 31 mars 2026
**Modèle** : Module d'alignement pédagogique (planification-carte.js)
**Objectif** : Transformer les colonnes fixes en palettes flottantes arrondies avec barre d'emojis

---

## Modèle de référence (Planification)

Structure d'une palette flottante :
```
┌──────────────────────────────┐  border-radius: 10px
│ TITRE                    —   │  .planif-palette-barre (cursor: grab)
├──────────────────────────────┤
│                              │
│  Contenu scrollable          │  .planif-palette-contenu (overflow-y: auto)
│                              │
├──────────────────────────────┤
│  🔎  🛎️  📔  📚             │  .planif-palette-bas-btns (flex, center)
└──────────────────────────────┘
```

CSS clés : `position: absolute`, `border-radius: 10px`, `box-shadow`, `background: var(--surface-carte)`

---

## Phase 1 — Palette Annotation (flottante)

### 1.1 Créer la classe CSS partagée `.palette-flottante`

Nouvelle classe réutilisable (pas préfixée planif-) :
- `position: absolute`, `z-index: 80`
- `background: var(--surface-carte)`, `border-radius: 10px`
- `box-shadow: 0 4px 16px rgba(0,0,0,0.10)`
- `.palette-flottante-barre` : cursor grab, draggable
- `.palette-flottante-contenu` : overflow-y auto, padding 6px
- `.palette-flottante-bas-btns` : flex center, gap 6px
- `.palette-flottante-aide-btn` : 24×24px, border-radius 50%

### 1.2 Modifier `genererHTMLPalette()` (travaux-outils.js)

- Utiliser `.palette-flottante` au lieu de `.travaux-palette-flottante`
- Conserver le contenu existant (outils, formes, couleur, épaisseur)
- Ajouter la barre d'emojis en bas :
  - 🛎️ → raccourcis clavier (placeholder, action future)
  - 📚 → bibliothèque de tampons (déplacé depuis palette Tampons)
  - 🚦 → toggle palette Codes
  - 🫥 → toggle palette Tampons
- Chrono reste en bas du contenu (au-dessus des emojis)

### 1.3 Modifier `creerLayoutAnnotation()` (travaux-ui.js)

- La palette Annotation passe de colonne flex à flottante positionnée
- Le canvas occupe tout l'espace disponible
- Conserver les splitters seulement si Codes/Tampons sont dans des colonnes (voir Phase 2)

### 1.4 Rendre les palettes Codes et Tampons flottantes

- `.annot-section-palette` → `.palette-flottante`
- Position absolue (top-right par défaut)
- Toggle via emojis 🚦 et 🫥 dans la palette Annotation
- Garder les boutons ⚙ dans leur barre de titre

---

## Phase 2 — Palette Évaluer (même traitement)

### 2.1 Palette Paramètres → flottante

- Même classe `.palette-flottante`
- Contenu : chrono, boutons, identité, selects, jetons
- Position : top-left par défaut
- Barre d'emojis en bas (à définir)

### 2.2 Palette Évaluation (critères) → flottante

- Contenu : critères + note chiffrée
- Position : right par défaut

### 2.3 Palette Rétroaction → flottante

- Contenu : Générale/Spécifique/Bilan + textarea
- Position : far-right par défaut

### 2.4 Canvas central

- Occupe tout l'espace, les palettes flottent par-dessus
- Suppression des splitters (plus nécessaires avec des palettes flottantes)
- OU : garder le layout ancré mais avec les coins arrondis et le style unifié

---

## Phase 3 — Drag & position persistante

### 3.1 Implémentation du drag

- Réutiliser le pattern de `configurerDragPalette()` existant dans travaux-outils.js
- Sauvegarder la position dans localStorage : `annot-palette-pos`, `codes-palette-pos`, etc.
- Restaurer la position au chargement

### 3.2 Z-index management

- Clic sur une palette → `z-index` le plus haut (focus)
- Même pattern que les palettes de planification

---

## Emojis de la palette Annotation

| Emoji | Action | data-action |
|-------|--------|-------------|
| 🛎️ | Raccourcis clavier (futur) | `travauxOutils.afficherRaccourcis` |
| 📚 | Bibliothèque de tampons | `tamponsBibliotheque.afficherBibliothequeTampons` |
| 🚦 | Toggle palette Codes | `travauxOutils.togglePaletteErreursFrancais` |
| 🫥 | Toggle palette Tampons | `travauxOutils.togglePaletteAutocollants` |

---

## Fichiers impactés

| Fichier | Changements |
|---------|-------------|
| `styles.css` | Nouvelles classes `.palette-flottante*`, suppression colonnes flex |
| `js/travaux-outils.js` | `genererHTMLPalette()` restructuré, palettes Codes/Tampons flottantes |
| `js/travaux-ui.js` | `creerLayoutAnnotation()` simplifié, `afficherPalettesEval()` restructuré |
| `js/travaux-annotation.js` | Ajustements toggle palettes |

---

## Risques et précautions

- **iPad** : les palettes flottantes doivent rester dans la zone visible (bounds checking)
- **Redimensionnement** : les palettes ne doivent pas sortir de l'écran au resize
- **Mode Évaluer ↔ Annoter** : la transition doit repositionner correctement les palettes
- **Safari file://** : pas de problème attendu (tout est DOM + CSS)
- **Tester** : les deux modes (sombre + clair) après les changements

---

## Ordre d'exécution recommandé

1. Créer les classes CSS `.palette-flottante*` (inspirées de planif)
2. Palette Annotation → flottante + emojis
3. Palettes Codes/Tampons → flottantes
4. Tester le mode Annoter complet
5. Palette Paramètres (Évaluer) → flottante
6. Palette Évaluation (critères) → flottante
7. Palette Rétroaction → flottante
8. Tester le mode Évaluer complet
9. Drag & position persistante
10. Test iPad + mode clair
